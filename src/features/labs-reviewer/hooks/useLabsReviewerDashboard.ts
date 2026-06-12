import { useCallback, useEffect, useMemo, useState } from 'react'
import type { TFunction } from 'i18next'
import { useTranslation } from 'react-i18next'
import { useNavigate } from 'react-router-dom'
import { toast } from 'sonner'
import { ApiRequestError } from '../../../lib/api'
import { clearSessionToken, getSessionToken } from '../../../lib/session'
import { clearStoredAuthenticatedUser } from '../../auth/userStorage'
import { AppRoute } from '../../../routes/routes.enum'
import {
  getAgentProcessStatus,
  getProcessStatus,
  listMarkdownOutputs,
  listPdfOutputs,
  uploadReviewMarkdown,
} from '../api'
import type {
  AgentProcessStatusDetailResponse,
  ProcessStatusResponse,
  ReviewOutputsResponse,
} from '../types'

const POLLING_INTERVAL_MS = 3000
const POLLING_TIMEOUT_MS = 10 * 60 * 1000

type LabsReviewerDashboardState = {
  agentDetail: AgentProcessStatusDetailResponse | null
  agentDetailError: string | null
  fileError: string | null
  markdownOutputs: ReviewOutputsResponse
  pdfOutputs: ReviewOutputsResponse
  processStatus: ProcessStatusResponse | null
  processStatusError: string | null
  selectedFile: File | null
  selectedFileName: string | null
}

const emptyOutputs: ReviewOutputsResponse = {
  count: 0,
  items: [],
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

export function useLabsReviewerDashboard(processId?: string | null) {
  const { t } = useTranslation()
  const navigate = useNavigate()
  const [state, setState] = useState<LabsReviewerDashboardState>({
    agentDetail: null,
    agentDetailError: null,
    fileError: null,
    markdownOutputs: emptyOutputs,
    pdfOutputs: emptyOutputs,
    processStatus: null,
    processStatusError: null,
    selectedFile: null,
    selectedFileName: null,
  })
  const [isUploading, setIsUploading] = useState(false)
  const [isRefreshingOutputs, setIsRefreshingOutputs] = useState(false)
  const [isLoadingAgentDetail, setIsLoadingAgentDetail] = useState(false)
  const [isPollingProcess, setIsPollingProcess] = useState(false)

  const canUpload = Boolean(state.selectedFile) && !isUploading

  const handleAuthFailure = useCallback(() => {
    clearSessionToken()
    clearStoredAuthenticatedUser()
    navigate(AppRoute.SignIn, { replace: true })
  }, [navigate])

  const refreshOutputs = useCallback(async () => {
    const token = getRequiredSessionToken()

    if (!token) {
      handleAuthFailure()
      return
    }

    setIsRefreshingOutputs(true)

    try {
      const [markdownOutputs, pdfOutputs] = await Promise.all([
        listMarkdownOutputs(token),
        listPdfOutputs(token),
      ])

      setState((currentState) => ({
        ...currentState,
        markdownOutputs,
        pdfOutputs,
      }))
    } catch (error) {
      if (isAuthFailure(error)) {
        handleAuthFailure()
        return
      }

      toast.error(getErrorMessage(error, t))
    } finally {
      setIsRefreshingOutputs(false)
    }
  }, [handleAuthFailure, t])

  const handleFileChange = useCallback(
    (file: File | null) => {
      if (!file) {
        setState((currentState) => ({
          ...currentState,
          fileError: null,
          selectedFile: null,
          selectedFileName: null,
        }))
        return
      }

      if (!file.name.toLowerCase().endsWith('.md')) {
        setState((currentState) => ({
          ...currentState,
          fileError: t('labsReviewer.validation.markdownFile'),
          selectedFile: null,
          selectedFileName: file.name,
        }))
        return
      }

      setState((currentState) => ({
        ...currentState,
        fileError: null,
        selectedFile: file,
        selectedFileName: file.name,
      }))
    },
    [t],
  )

  const uploadSelectedFile = useCallback(async () => {
    const token = getRequiredSessionToken()

    if (!token) {
      handleAuthFailure()
      return
    }

    if (!state.selectedFile) {
      setState((currentState) => ({
        ...currentState,
        fileError: t('labsReviewer.validation.requiredFile'),
      }))
      return
    }

    setIsUploading(true)

    try {
      const response = await uploadReviewMarkdown(token, state.selectedFile)

      toast.success(response.message)
      setState((currentState) => ({
        ...currentState,
        fileError: null,
        selectedFile: null,
        selectedFileName: null,
      }))
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
      setIsUploading(false)
    }
  }, [
    handleAuthFailure,
    navigate,
    state.selectedFile,
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
    void refreshOutputs()
  }, [refreshOutputs])

  useEffect(() => {
    if (!processId) {
      setState((currentState) => ({
        ...currentState,
        processStatus: null,
        processStatusError: null,
      }))
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
        const processStatus = await getProcessStatus(token, processId)

        if (!isActive) {
          return
        }

        setState((currentState) => ({
          ...currentState,
          processStatus,
          processStatusError: null,
        }))

        if (processStatus.status === 'IN_PROGRESS') {
          scheduleNextPoll()
          return
        }

        stopPolling()
        void refreshOutputs()
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
  }, [handleAuthFailure, processId, refreshOutputs, t])

  return useMemo(
    () => ({
      canUpload,
      clearAgentDetail,
      handleFileChange,
      isLoadingAgentDetail,
      isPollingProcess,
      isRefreshingOutputs,
      isUploading,
      loadAgentDetail,
      refreshOutputs,
      state,
      uploadSelectedFile,
    }),
    [
      canUpload,
      clearAgentDetail,
      handleFileChange,
      isLoadingAgentDetail,
      isPollingProcess,
      isRefreshingOutputs,
      isUploading,
      loadAgentDetail,
      refreshOutputs,
      state,
      uploadSelectedFile,
    ],
  )
}
