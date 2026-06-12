import { useTranslation } from 'react-i18next'
import LoadingIcon from '../../../../components/ui/Icons/LoadingIcon'
import type {
  AgentProcessStatusRowProps,
  ProcessStatusTreeProps,
} from './ProcessStatusTree.types'

function formatDateTime(value: string | null): string | null {
  if (!value) {
    return null
  }

  return new Intl.DateTimeFormat(undefined, {
    dateStyle: 'medium',
    timeStyle: 'short',
  }).format(new Date(value))
}

function AgentProcessStatusRow({
  agentProcess,
  depth,
  onOpenAgentDetail,
}: AgentProcessStatusRowProps) {
  const { t } = useTranslation()
  const finishedAt = formatDateTime(agentProcess.finished_at)
  const loopLabel =
    agentProcess.loop_from && agentProcess.loop_to
      ? `${agentProcess.loop_from}/${agentProcess.loop_to}`
      : null

  return (
    <li className="labs-reviewer-agent">
      <div
        className="labs-reviewer-agent__row"
        style={{ '--agent-depth': depth }}
      >
        <div className="labs-reviewer-agent__main">
          <span className="labs-reviewer-agent__name">
            {agentProcess.name}
          </span>
          <span
            className={`labs-reviewer-status labs-reviewer-status--${agentProcess.status.toLowerCase()}`}
          >
            {t(`labsReviewer.status.${agentProcess.status}`)}
          </span>
        </div>
        <div className="labs-reviewer-agent__meta">
          {loopLabel ? (
            <span>{t('labsReviewer.process.loop', { value: loopLabel })}</span>
          ) : null}
          {finishedAt ? <span>{finishedAt}</span> : null}
          <button
            className="labs-reviewer-button labs-reviewer-button--small"
            onClick={() => onOpenAgentDetail(agentProcess.id)}
            type="button"
          >
            {t('labsReviewer.process.details')}
          </button>
        </div>
      </div>
      {agentProcess.children.length > 0 ? (
        <ul className="labs-reviewer-agent__children">
          {agentProcess.children.map((child) => (
            <AgentProcessStatusRow
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

function ProcessStatusTree({
  isPolling,
  onOpenAgentDetail,
  processStatus,
  processStatusError,
}: ProcessStatusTreeProps) {
  const { t } = useTranslation()

  return (
    <section className="labs-reviewer-panel" aria-labelledby="process-title">
      <div className="labs-reviewer-panel__header">
        <p className="labs-reviewer-panel__eyebrow">
          {t('labsReviewer.process.eyebrow')}
        </p>
        <h2 id="process-title">{t('labsReviewer.process.title')}</h2>
        <p>{t('labsReviewer.process.copy')}</p>
      </div>

      {processStatus ? (
        <div className="labs-reviewer-process">
          <div className="labs-reviewer-process__summary">
            <span
              className={`labs-reviewer-status labs-reviewer-status--${processStatus.status.toLowerCase()}`}
            >
              {t(`labsReviewer.status.${processStatus.status}`)}
            </span>
            {isPolling ? (
              <span className="labs-reviewer-process__polling">
                <LoadingIcon className="labs-reviewer-process__icon" />
                {t('labsReviewer.process.polling')}
              </span>
            ) : null}
          </div>
          <dl className="labs-reviewer-process__metadata">
            <div>
              <dt>{t('labsReviewer.process.file')}</dt>
              <dd>{processStatus.file}</dd>
            </div>
            <div>
              <dt>{t('labsReviewer.process.processId')}</dt>
              <dd>{processStatus.id}</dd>
            </div>
            <div>
              <dt>{t('labsReviewer.process.createdAt')}</dt>
              <dd>{formatDateTime(processStatus.created_at)}</dd>
            </div>
          </dl>
          {processStatus.data.length > 0 ? (
            <ul className="labs-reviewer-agent-list">
              {processStatus.data.map((agentProcess) => (
                <AgentProcessStatusRow
                  agentProcess={agentProcess}
                  depth={0}
                  key={agentProcess.id}
                  onOpenAgentDetail={onOpenAgentDetail}
                />
              ))}
            </ul>
          ) : (
            <p className="labs-reviewer-empty">
              {t('labsReviewer.process.waiting')}
            </p>
          )}
        </div>
      ) : (
        <p className="labs-reviewer-empty">
          {processStatusError ?? t('labsReviewer.process.empty')}
        </p>
      )}
    </section>
  )
}

export default ProcessStatusTree
