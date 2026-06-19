import { useTranslation } from 'react-i18next'
import { Link } from 'react-router-dom'
import AgentFailedIcon from '../../../../components/ui/Icons/AgentFailedIcon'
import AgentInProgressIcon from '../../../../components/ui/Icons/AgentInProgressIcon'
import AgentSucceedIcon from '../../../../components/ui/Icons/AgentSucceedIcon'
import ClipboardButton from '../../../../components/ui/ClipboardButton/ClipboardButton'
import EditIcon from '../../../../components/ui/Icons/EditIcon'
import LoadingIcon from '../../../../components/ui/Icons/LoadingIcon'
import type { ProcessStatusState } from '../../types'
import type {
  ReviewResultAgentCardProps,
  ReviewResultStatusProps,
} from './ReviewResultStatus.types'
import './ReviewResultStatus.css'

function formatDateTime(value: string | null): string | null {
  if (!value) {
    return null
  }

  return new Intl.DateTimeFormat(undefined, {
    dateStyle: 'medium',
    timeStyle: 'short',
  }).format(new Date(value))
}

function getStatusDescriptionKey(status: ProcessStatusState): string {
  if (status === 'FAILED') {
    return 'labsReviewer.result.statusDescription.FAILED'
  }

  if (status === 'SUCCEEDED') {
    return 'labsReviewer.result.statusDescription.SUCCEEDED'
  }

  if (status === 'WRITTING') {
    return 'labsReviewer.result.statusDescription.WRITTING'
  }

  return 'labsReviewer.result.statusDescription.IN_PROGRESS'
}

function getStatusTooltip(status: ProcessStatusState): string {
  if (status === 'FAILED') {
    return 'Failed'
  }

  if (status === 'SUCCEEDED') {
    return 'Succeeded'
  }

  if (status === 'WRITTING') {
    return 'Writing'
  }

  return 'In Progress'
}

function renderStatusIcon(status: ProcessStatusState) {
  if (status === 'FAILED') {
    return <AgentFailedIcon />
  }

  if (status === 'SUCCEEDED') {
    return <AgentSucceedIcon />
  }

  return <AgentInProgressIcon />
}

function ReviewResultAgentCard({
  agentProcess,
  depth,
  onOpenAgentDetail,
}: ReviewResultAgentCardProps) {
  const { t } = useTranslation()
  const finishedAt = formatDateTime(agentProcess.finished_at)
  const canOpenResult = agentProcess.status === 'SUCCEEDED'

  return (
    <li className="labs-reviewer-result-agent">
      <button
        className="labs-reviewer-result-agent__button"
        disabled={!canOpenResult}
        onClick={() => onOpenAgentDetail(agentProcess.id)}
        type="button"
      >
        <span
          className={`labs-reviewer-result-agent__status-icon labs-reviewer-result-agent__status-icon--${agentProcess.status.toLowerCase()}`}
          data-tooltip={getStatusTooltip(agentProcess.status)}
          title={getStatusTooltip(agentProcess.status)}
        >
          {renderStatusIcon(agentProcess.status)}
        </span>

        <span className="labs-reviewer-result-agent__content">
          <span className="labs-reviewer-result-agent__main">
            <span className="labs-reviewer-result-agent__name">
              {agentProcess.name}
            </span>
            <span className="labs-reviewer-result-agent__description">
              {t(getStatusDescriptionKey(agentProcess.status))}
            </span>
          </span>

          <span className="labs-reviewer-result-agent__meta">
            {finishedAt ? <span>{finishedAt}</span> : null}
          </span>
        </span>
      </button>

      {agentProcess.children.length > 0 ? (
        <ul className="labs-reviewer-result-agent__children">
          {agentProcess.children.map((child) => (
            <ReviewResultAgentCard
              agentProcess={child}
              depth={depth + 1}
              key={child.id}
              onOpenAgentDetail={onOpenAgentDetail}
            />
          ))}
        </ul>
      ) : null}
    </li>
  )
}

function ReviewResultStatus({
  agentDetail,
  agentDetailError,
  editProcessHref,
  isLoadingAgentDetail,
  isPollingProcess,
  onOpenAgentDetail,
  processStatus,
  processStatusError,
}: ReviewResultStatusProps) {
  const { t } = useTranslation()

  return (
    <section
      className="labs-reviewer-result-status"
      aria-labelledby="review-result-status-title"
    >
      <div className="labs-reviewer-result-status__header">
        <div>
          <div className="labs-reviewer-result-status__title-row">
            <h1 id="review-result-status-title">
              {t('labsReviewer.result.title')}
            </h1>
            <Link
              aria-label={t('labsReviewer.result.editProcess')}
              className="labs-reviewer-result-status__edit"
              title={t('labsReviewer.result.editProcess')}
              to={editProcessHref}
            >
              <EditIcon className="labs-reviewer-result-status__edit-icon" />
            </Link>
          </div>
          <p className="route-copy">{t('labsReviewer.result.copy')}</p>
        </div>
        <span
          className={`labs-reviewer-status labs-reviewer-status--${processStatus?.status.toLowerCase() ?? 'in_progress'}`}
        >
          {processStatus
            ? t(`labsReviewer.status.${processStatus.status}`)
            : t('labsReviewer.result.loadingStatus')}
        </span>
      </div>

      <div className="labs-reviewer-result-status__grid">
        <div className="labs-reviewer-result-status__detail">
          <div className="labs-reviewer-result-detail">
            <div className="labs-reviewer-result-detail__header">
              <div className="labs-reviewer-result-detail__heading">
                <p className="labs-reviewer-panel__eyebrow">
                  {t('labsReviewer.agentDetail.eyebrow')}
                </p>
                <h2>
                  {agentDetail?.name ?? t('labsReviewer.result.selectedTitle')}
                </h2>
              </div>

              {agentDetail?.result ? (
                <ClipboardButton
                  className="labs-reviewer-result-detail__copy"
                  text={agentDetail.result}
                />
              ) : null}
            </div>

            {isLoadingAgentDetail ? (
              <p className="labs-reviewer-loading">
                <LoadingIcon className="labs-reviewer-loading__icon" />
                {t('labsReviewer.agentDetail.loading')}
              </p>
            ) : agentDetailError ? (
              <p className="labs-reviewer-empty labs-reviewer-empty--error">
                {agentDetailError}
              </p>
            ) : agentDetail ? (
              <pre className="labs-reviewer-result-detail__result">
                {agentDetail.result ??
                  t('labsReviewer.agentDetail.emptyResult')}
              </pre>
            ) : (
              <p className="labs-reviewer-empty">
                {t('labsReviewer.result.selectedEmpty')}
              </p>
            )}
          </div>
        </div>

        <div className="labs-reviewer-result-status__agents">
          <div className="labs-reviewer-result-agents__header">
            <p className="labs-reviewer-panel__eyebrow">
              {t('labsReviewer.result.agentsEyebrow')}
            </p>
            <h2>{t('labsReviewer.result.agentsTitle')}</h2>
            {isPollingProcess ? (
              <p className="labs-reviewer-loading">
                <LoadingIcon className="labs-reviewer-loading__icon" />
                {t('labsReviewer.process.polling')}
              </p>
            ) : null}
          </div>
          {processStatus?.data.length ? (
            <ul className="labs-reviewer-result-agent-list">
              {processStatus.data.map((agentProcess) => (
                <ReviewResultAgentCard
                  agentProcess={agentProcess}
                  depth={0}
                  key={agentProcess.id}
                  onOpenAgentDetail={onOpenAgentDetail}
                />
              ))}
            </ul>
          ) : (
            <p
              className={
                processStatusError
                  ? 'labs-reviewer-empty labs-reviewer-empty--error'
                  : 'labs-reviewer-empty'
              }
            >
              {processStatusError ??
                (processStatus
                  ? t(getStatusDescriptionKey(processStatus.status))
                  : t('labsReviewer.result.loadingDescription'))}
            </p>
          )}
        </div>
      </div>
    </section>
  )
}

export default ReviewResultStatus
