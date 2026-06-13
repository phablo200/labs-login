import type { CSSProperties } from 'react'
import { useTranslation } from 'react-i18next'
import LoadingIcon from '../../../../components/ui/Icons/LoadingIcon'
import type { ProcessStatusState } from '../../types'
import type {
  ReviewResultAgentCardProps,
  ReviewResultStatusProps,
} from './ReviewResultStatus.types'

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

  return 'labsReviewer.result.statusDescription.IN_PROGRESS'
}

function ReviewResultAgentCard({
  agentProcess,
  depth,
  onOpenAgentDetail,
}: ReviewResultAgentCardProps) {
  const { t } = useTranslation()
  const finishedAt = formatDateTime(agentProcess.finished_at)
  const canOpenResult = agentProcess.status === 'SUCCEEDED'
  const style = {
    '--agent-depth': depth,
  } as CSSProperties

  return (
    <li className="labs-reviewer-result-agent">
      <button
        className="labs-reviewer-result-agent__button"
        disabled={!canOpenResult}
        onClick={() => onOpenAgentDetail(agentProcess.id)}
        style={style}
        type="button"
      >
        <span className="labs-reviewer-result-agent__main">
          <span className="labs-reviewer-result-agent__name">
            {agentProcess.name}
          </span>
          <span className="labs-reviewer-result-agent__description">
            {t(getStatusDescriptionKey(agentProcess.status))}
          </span>
        </span>
        <span className="labs-reviewer-result-agent__meta">
          <span
            className={`labs-reviewer-status labs-reviewer-status--${agentProcess.status.toLowerCase()}`}
          >
            {t(`labsReviewer.status.${agentProcess.status}`)}
          </span>
          {finishedAt ? <span>{finishedAt}</span> : null}
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
  isLoadingAgentDetail,
  isPollingProcess,
  onOpenAgentDetail,
  processId,
  processStatus,
  processStatusError,
}: ReviewResultStatusProps) {
  const { t } = useTranslation()
  const createdAt = processStatus
    ? formatDateTime(processStatus.created_at)
    : null

  return (
    <section
      className="labs-reviewer-result-status"
      aria-labelledby="review-result-status-title"
    >
      <div className="labs-reviewer-result-status__header">
        <div>
          <h1 id="review-result-status-title">
            {t('labsReviewer.result.title')}
          </h1>
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
        <aside
          className="labs-reviewer-result-status__summary"
          aria-label={t('labsReviewer.result.summaryLabel')}
        >
          <dl className="labs-reviewer-result-summary">
            <div>
              <dt>{t('labsReviewer.process.processId')}</dt>
              <dd>{processStatus?.id ?? processId}</dd>
            </div>
            <div>
              <dt>{t('labsReviewer.process.file')}</dt>
              <dd>{processStatus?.file ?? t('labsReviewer.result.pendingFile')}</dd>
            </div>
            <div>
              <dt>{t('labsReviewer.process.createdAt')}</dt>
              <dd>{createdAt ?? t('labsReviewer.result.pendingDate')}</dd>
            </div>
          </dl>
        </aside>

        <div className="labs-reviewer-result-status__detail">
          <div className="labs-reviewer-result-detail">
            <div className="labs-reviewer-result-detail__header">
              <p className="labs-reviewer-panel__eyebrow">
                {t('labsReviewer.agentDetail.eyebrow')}
              </p>
              <h2>
                {agentDetail?.name ?? t('labsReviewer.result.selectedTitle')}
              </h2>
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
