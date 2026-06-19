import { useCallback, useEffect, useMemo, useState } from 'react'
import type { TFunction } from 'i18next'
import { useTranslation } from 'react-i18next'
import { useNavigate, useSearchParams } from 'react-router-dom'
import { toast } from 'sonner'
import { ApiRequestError } from '../../../lib/api'
import { clearSessionToken, getSessionToken } from '../../../lib/session'
import { clearStoredAuthenticatedUser } from '../../auth/userStorage'
import { AppRoute } from '../../../routes/routes.enum'
import {
  createProcessNote,
  createWritingProcessStatus,
  getAgentProcessStatus,
  getProcessStatus,
  listProcessNotes,
  listProcessStatuses,
  startProcessReview,
  updateProcessNote,
  uploadProcessNoteFile,
} from '../api'
import type {
  AgentProcessStatusDetailResponse,
  ProcessStatusNoteResponse,
  ProcessStatusResponse,
} from '../types'

const NOTE_FILE_MAX_BYTES = 10 * 1024
const POLLING_INTERVAL_MS = 3000
const POLLING_TIMEOUT_MS = 10 * 60 * 1000

type LabsReviewerDashboardState = {
  activeEditNoteId: string | null
  agentDetail: AgentProcessStatusDetailResponse | null
  agentDetailError: string | null
  composerText: string
  editText: string
  fileError: string | null
  notes: ProcessStatusNoteResponse[]
  processStatus: ProcessStatusResponse | null
  processStatusError: string | null
  processes: ProcessStatusResponse[]
  selectedProcessId: string | null
  selectedProcessMissing: boolean
}

function getErrorMessage(error: unknown, t: TFunction): string {
  if (error instanceof ApiRequestError) {
    if (error.kind === 'backend') {
      return error.message
    }

    if (error.kind === 'network') {
      return t('errors.network')
    }

    if (error.kind === 'service' || error.kind === 'configuration') {
      return t('errors.serviceUnavailable')
    }

    if (error.kind === 'auth') {
      return t('errors.auth')
    }
  }

  return t('errors.unexpected')
}

function isAuthFailure(error: unknown): boolean {
  return (
    error instanceof ApiRequestError &&
    (error.status === 401 || error.status === 403)
  )
}

function getRequiredSessionToken(): string | null {
  return getSessionToken()
}

function isReviewRunning(status: ProcessStatusResponse['status']): boolean {
  return status === 'WRITTING' || status === 'IN_PROGRESS'
}

function isSupportedNoteFile(file: File): boolean {
  const fileName = file.name.toLowerCase()

  return fileName.endsWith('.md') || fileName.endsWith('.txt')
}

function mergeProcessNotes(
  fetchedNotes: ProcessStatusNoteResponse[],
  currentNotes: ProcessStatusNoteResponse[],
  targetProcessId: string,
): ProcessStatusNoteResponse[] {
  const mergedNotes = [...fetchedNotes]
  const fetchedNoteIds = new Set(fetchedNotes.map((note) => note.id))

  currentNotes.forEach((note) => {
    if (
      note.process_status_id === targetProcessId &&
      !fetchedNoteIds.has(note.id)
    ) {
      mergedNotes.push(note)
    }
  })

  return mergedNotes
}

export function useLabsReviewerDashboard(processId?: string | null) {
  const { t } = useTranslation()
  const navigate = useNavigate()
  const [searchParams] = useSearchParams()
  const urlProcessId = searchParams.get('process_id')
  const isResultMode = processId !== undefined
  const activeProcessId = isResultMode ? processId ?? null : urlProcessId
  const [state, setState] = useState<LabsReviewerDashboardState>({
    activeEditNoteId: null,
    agentDetail: null,
    agentDetailError: null,
    composerText: '',
    editText: '',
    fileError: null,
    notes: [],
    processStatus: null,
    processStatusError: null,
    processes: [],
    selectedProcessId: activeProcessId,
    selectedProcessMissing: false,
  })
  const [isCreatingProcess, setIsCreatingProcess] = useState(false)
  const [isCreatingNote, setIsCreatingNote] = useState(false)
  const [isEditingNote, setIsEditingNote] = useState(false)
  const [isLoadingAgentDetail, setIsLoadingAgentDetail] = useState(false)
  const [isLoadingNotes, setIsLoadingNotes] = useState(false)
  const [isLoadingProcesses, setIsLoadingProcesses] = useState(false)
  const [isPollingProcess, setIsPollingProcess] = useState(false)
  const [isSubmittingReview, setIsSubmittingReview] = useState(false)
  const [isUploadingFileNote, setIsUploadingFileNote] = useState(false)

  const selectedProcess = useMemo(
    () =>
      state.processes.find(
        (processStatus) => processStatus.id === state.selectedProcessId,
      ) ?? null,
    [state.processes, state.selectedProcessId],
  )
  const canCreateNote = Boolean(
    state.selectedProcessId &&
      state.composerText.trim() &&
      !isCreatingNote &&
      !isUploadingFileNote,
  )
  const canSaveNoteEdit = Boolean(
    state.activeEditNoteId && state.editText.trim() && !isEditingNote,
  )
  const canSubmitReview = Boolean(
    state.selectedProcessId && state.notes.length > 0 && !isSubmittingReview,
  )

  const handleAuthFailure = useCallback(() => {
    clearSessionToken()
    clearStoredAuthenticatedUser()
    navigate(AppRoute.SignIn, { replace: true })
  }, [navigate])

  const loadNotes = useCallback(
    async (targetProcessId: string) => {
      const token = getRequiredSessionToken()

      if (!token) {
        handleAuthFailure()
        return
      }

      setIsLoadingNotes(true)

      try {
        const notes = await listProcessNotes(token, targetProcessId)

        setState((currentState) => {
          if (currentState.selectedProcessId !== targetProcessId) {
            return currentState
          }

          return {
            ...currentState,
            notes: mergeProcessNotes(
              notes,
              currentState.notes,
              targetProcessId,
            ),
            processStatusError: null,
            selectedProcessMissing: false,
          }
        })
      } catch (error) {
        if (isAuthFailure(error)) {
          handleAuthFailure()
          return
        }

        setState((currentState) => ({
          ...currentState,
          notes: [],
          processStatusError: getErrorMessage(error, t),
          selectedProcessMissing:
            error instanceof ApiRequestError && error.status === 404,
        }))
      } finally {
        setIsLoadingNotes(false)
      }
    },
    [handleAuthFailure, t],
  )

  const refreshProcesses = useCallback(async () => {
    const token = getRequiredSessionToken()

    if (!token) {
      handleAuthFailure()
      return
    }

    setIsLoadingProcesses(true)

    try {
      const processes = await listProcessStatuses(token)
      const selectedProcessId = activeProcessId
      const selectedProcessMissing = Boolean(
        selectedProcessId &&
          !processes.some((processStatus) => processStatus.id === selectedProcessId),
      )

      setState((currentState) => ({
        ...currentState,
        activeEditNoteId: null,
        editText: '',
        notes: selectedProcessMissing ? [] : currentState.notes,
        processes,
        selectedProcessId,
        selectedProcessMissing,
      }))

      if (!isResultMode && selectedProcessId && !selectedProcessMissing) {
        await loadNotes(selectedProcessId)
      }
    } catch (error) {
      if (isAuthFailure(error)) {
        handleAuthFailure()
        return
      }

      toast.error(getErrorMessage(error, t))
    } finally {
      setIsLoadingProcesses(false)
    }
  }, [activeProcessId, handleAuthFailure, isResultMode, loadNotes, t])

  const selectProcess = useCallback(
    (nextProcess: ProcessStatusResponse) => {
      setState((currentState) => ({
        ...currentState,
        activeEditNoteId: null,
        editText: '',
        notes: [],
        selectedProcessId: nextProcess.id,
        selectedProcessMissing: false,
      }))
      const route =
        nextProcess.status === 'WRITTING' ? AppRoute.Home : AppRoute.ReviewResult

      navigate(
        `${route}?process_id=${encodeURIComponent(nextProcess.id)}`,
      )
    },
    [navigate],
  )

  const createProcess = useCallback(async () => {
    const token = getRequiredSessionToken()

    if (!token) {
      handleAuthFailure()
      return
    }

    setIsCreatingProcess(true)

    try {
      const processStatus = await createWritingProcessStatus(token)

      setState((currentState) => ({
        ...currentState,
        activeEditNoteId: null,
        editText: '',
        notes: [],
        processes: [
          {
            ...processStatus,
            data: [],
          },
          ...currentState.processes.filter(
            (item) => item.id !== processStatus.id,
          ),
        ],
        selectedProcessId: processStatus.id,
        selectedProcessMissing: false,
      }))
      navigate(
        `${AppRoute.Home}?process_id=${encodeURIComponent(processStatus.id)}`,
      )
    } catch (error) {
      if (isAuthFailure(error)) {
        handleAuthFailure()
        return
      }

      toast.error(getErrorMessage(error, t))
    } finally {
      setIsCreatingProcess(false)
    }
  }, [handleAuthFailure, navigate, t])

  const updateComposerText = useCallback((value: string) => {
    setState((currentState) => ({
      ...currentState,
      composerText: value,
      fileError: null,
    }))
  }, [])

  const createNote = useCallback(async () => {
    const token = getRequiredSessionToken()
    const targetProcessId = state.selectedProcessId
    const note = state.composerText.trim()

    if (!token) {
      handleAuthFailure()
      return
    }

    if (!targetProcessId || !note) {
      setState((currentState) => ({
        ...currentState,
        fileError: t('labsReviewer.validation.requiredNote'),
      }))
      return
    }

    setIsCreatingNote(true)

    try {
      const createdNote = await createProcessNote(token, targetProcessId, note)

      setState((currentState) => ({
        ...currentState,
        composerText: '',
        fileError: null,
        notes: [...currentState.notes, createdNote],
      }))
    } catch (error) {
      if (isAuthFailure(error)) {
        handleAuthFailure()
        return
      }

      toast.error(getErrorMessage(error, t))
    } finally {
      setIsCreatingNote(false)
    }
  }, [
    handleAuthFailure,
    state.composerText,
    state.selectedProcessId,
    t,
  ])

  const startNoteEdit = useCallback((note: ProcessStatusNoteResponse) => {
    setState((currentState) => ({
      ...currentState,
      activeEditNoteId: note.id,
      editText: note.description,
      fileError: null,
    }))
  }, [])

  const updateEditText = useCallback((value: string) => {
    setState((currentState) => ({
      ...currentState,
      editText: value,
      fileError: null,
    }))
  }, [])

  const cancelNoteEdit = useCallback(() => {
    setState((currentState) => ({
      ...currentState,
      activeEditNoteId: null,
      editText: '',
      fileError: null,
    }))
  }, [])

  const saveNoteEdit = useCallback(async () => {
    const token = getRequiredSessionToken()
    const targetProcessId = state.selectedProcessId
    const noteId = state.activeEditNoteId
    const note = state.editText.trim()

    if (!token) {
      handleAuthFailure()
      return
    }

    if (!targetProcessId || !noteId || !note) {
      setState((currentState) => ({
        ...currentState,
        fileError: t('labsReviewer.validation.requiredNote'),
      }))
      return
    }

    setIsEditingNote(true)

    try {
      const updatedNote = await updateProcessNote(
        token,
        targetProcessId,
        noteId,
        note,
      )

      setState((currentState) => ({
        ...currentState,
        activeEditNoteId: null,
        editText: '',
        fileError: null,
        notes: currentState.notes.map((item) =>
          item.id === updatedNote.id ? updatedNote : item,
        ),
      }))
    } catch (error) {
      if (isAuthFailure(error)) {
        handleAuthFailure()
        return
      }

      toast.error(getErrorMessage(error, t))
    } finally {
      setIsEditingNote(false)
    }
  }, [
    handleAuthFailure,
    state.activeEditNoteId,
    state.editText,
    state.selectedProcessId,
    t,
  ])

  const uploadFileNote = useCallback(
    async (file: File | null) => {
      const token = getRequiredSessionToken()
      const targetProcessId = state.selectedProcessId

      if (!file) {
        return
      }

      if (!token) {
        handleAuthFailure()
        return
      }

      if (!targetProcessId) {
        setState((currentState) => ({
          ...currentState,
          fileError: t('labsReviewer.validation.requiredProcess'),
        }))
        return
      }

      if (!isSupportedNoteFile(file)) {
        setState((currentState) => ({
          ...currentState,
          fileError: t('labsReviewer.validation.noteFile'),
        }))
        return
      }

      if (file.size === 0) {
        setState((currentState) => ({
          ...currentState,
          fileError: t('labsReviewer.validation.emptyFile'),
        }))
        return
      }

      if (file.size > NOTE_FILE_MAX_BYTES) {
        setState((currentState) => ({
          ...currentState,
          fileError: t('labsReviewer.validation.maxFileSize'),
        }))
        return
      }

      setIsUploadingFileNote(true)

      try {
        const uploadedNote = await uploadProcessNoteFile(
          token,
          targetProcessId,
          file,
        )

        setState((currentState) => ({
          ...currentState,
          fileError: null,
          notes: [...currentState.notes, uploadedNote],
        }))
      } catch (error) {
        if (isAuthFailure(error)) {
          handleAuthFailure()
          return
        }

        toast.error(getErrorMessage(error, t))
      } finally {
        setIsUploadingFileNote(false)
      }
    },
    [handleAuthFailure, state.selectedProcessId, t],
  )

  const submitReview = useCallback(async () => {
    const token = getRequiredSessionToken()
    const targetProcessId = state.selectedProcessId

    if (!token) {
      handleAuthFailure()
      return
    }

    if (!targetProcessId || state.notes.length === 0) {
      setState((currentState) => ({
        ...currentState,
        fileError: t('labsReviewer.validation.requiredNotesBeforeSubmit'),
      }))
      return
    }

    setIsSubmittingReview(true)

    try {
      const response = await startProcessReview(token, targetProcessId)

      toast.success(response.message)
      navigate(
        `${AppRoute.ReviewResult}?process_id=${encodeURIComponent(
          response.process_id,
        )}`,
      )
    } catch (error) {
      if (isAuthFailure(error)) {
        handleAuthFailure()
        return
      }

      toast.error(getErrorMessage(error, t))
    } finally {
      setIsSubmittingReview(false)
    }
  }, [
    handleAuthFailure,
    navigate,
    state.notes.length,
    state.selectedProcessId,
    t,
  ])

  const loadAgentDetail = useCallback(
    async (agentProcessId: string) => {
      const token = getRequiredSessionToken()

      if (!token) {
        handleAuthFailure()
        return
      }

      setIsLoadingAgentDetail(true)
      setState((currentState) => ({
        ...currentState,
        agentDetail: null,
        agentDetailError: null,
      }))

      try {
        const agentDetail = await getAgentProcessStatus(token, agentProcessId)

        setState((currentState) => ({
          ...currentState,
          agentDetail,
        }))
      } catch (error) {
        if (isAuthFailure(error)) {
          handleAuthFailure()
          return
        }

        setState((currentState) => ({
          ...currentState,
          agentDetailError: getErrorMessage(error, t),
        }))
      } finally {
        setIsLoadingAgentDetail(false)
      }
    },
    [handleAuthFailure, t],
  )

  const clearAgentDetail = useCallback(() => {
    setState((currentState) => ({
      ...currentState,
      agentDetail: null,
      agentDetailError: null,
    }))
  }, [])

  useEffect(() => {
    void refreshProcesses()
  }, [refreshProcesses])

  useEffect(() => {
    setState((currentState) => ({
      ...currentState,
      selectedProcessId: activeProcessId,
    }))
  }, [activeProcessId])

  useEffect(() => {
    if (!isResultMode || !activeProcessId) {
      if (isResultMode) {
        setState((currentState) => ({
          ...currentState,
          processStatus: null,
          processStatusError: null,
        }))
      }
      setIsPollingProcess(false)
      return
    }

    const token = getRequiredSessionToken()

    if (!token) {
      handleAuthFailure()
      return
    }

    let isActive = true
    let pollTimerId: number | undefined

    function stopPolling({ updateState = true } = {}) {
      isActive = false

      if (updateState) {
        setIsPollingProcess(false)
      }

      if (pollTimerId) {
        window.clearTimeout(pollTimerId)
      }

      if (timeoutId) {
        window.clearTimeout(timeoutId)
      }
    }

    function scheduleNextPoll() {
      pollTimerId = window.setTimeout(() => {
        void pollProcessStatus()
      }, POLLING_INTERVAL_MS)
    }

    async function pollProcessStatus(): Promise<void> {
      if (!isActive) {
        return
      }

      setIsPollingProcess(true)

      try {
        const processStatus = await getProcessStatus(token, activeProcessId)

        if (!isActive) {
          return
        }

        setState((currentState) => ({
          ...currentState,
          processStatus,
          processStatusError: null,
        }))

        if (isReviewRunning(processStatus.status)) {
          scheduleNextPoll()
          return
        }

        stopPolling()
      } catch (error) {
        if (!isActive) {
          return
        }

        if (isAuthFailure(error)) {
          stopPolling()
          handleAuthFailure()
          return
        }

        setState((currentState) => ({
          ...currentState,
          processStatusError: getErrorMessage(error, t),
        }))
        setIsPollingProcess(false)
      }
    }

    const timeoutId = window.setTimeout(() => {
      stopPolling()
    }, POLLING_TIMEOUT_MS)

    void pollProcessStatus()

    return () => {
      stopPolling({ updateState: false })
    }
  }, [activeProcessId, handleAuthFailure, isResultMode, t])

  return useMemo(
    () => ({
      canCreateNote,
      canSaveNoteEdit,
      canSubmitReview,
      cancelNoteEdit,
      clearAgentDetail,
      createNote,
      createProcess,
      isCreatingNote,
      isCreatingProcess,
      isEditingNote,
      isLoadingAgentDetail,
      isLoadingNotes,
      isLoadingProcesses,
      isPollingProcess,
      isSubmittingReview,
      isUploadingFileNote,
      loadAgentDetail,
      refreshProcesses,
      saveNoteEdit,
      selectProcess,
      selectedProcess,
      startNoteEdit,
      state,
      submitReview,
      updateComposerText,
      updateEditText,
      uploadFileNote,
    }),
    [
      canCreateNote,
      canSaveNoteEdit,
      canSubmitReview,
      cancelNoteEdit,
      clearAgentDetail,
      createNote,
      createProcess,
      isCreatingNote,
      isCreatingProcess,
      isEditingNote,
      isLoadingAgentDetail,
      isLoadingNotes,
      isLoadingProcesses,
      isPollingProcess,
      isSubmittingReview,
      isUploadingFileNote,
      loadAgentDetail,
      refreshProcesses,
      saveNoteEdit,
      selectProcess,
      selectedProcess,
      startNoteEdit,
      state,
      submitReview,
      updateComposerText,
      updateEditText,
      uploadFileNote,
    ],
  )
}
