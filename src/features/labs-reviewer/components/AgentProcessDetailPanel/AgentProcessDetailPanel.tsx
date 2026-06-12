import { useTranslation } from 'react-i18next'
import LoadingIcon from '../../../../components/ui/Icons/LoadingIcon'
import type { AgentProcessDetailPanelProps } from './AgentProcessDetailPanel.types'

function AgentProcessDetailPanel({
  agentDetail,
  agentDetailError,
  isLoading,
  onClose,
}: AgentProcessDetailPanelProps) {
  const { t } = useTranslation()

  return (
    <aside
      className="labs-reviewer-panel labs-reviewer-agent-detail"
      aria-labelledby="agent-detail-title"
    >
      <div className="labs-reviewer-panel__header labs-reviewer-panel__header--inline">
        <div>
          <p className="labs-reviewer-panel__eyebrow">
            {t('labsReviewer.agentDetail.eyebrow')}
          </p>
          <h2 id="agent-detail-title">
            {agentDetail?.name ?? t('labsReviewer.agentDetail.title')}
          </h2>
        </div>
        {agentDetail || agentDetailError ? (
          <button
            className="labs-reviewer-button labs-reviewer-button--small"
            onClick={onClose}
            type="button"
          >
            {t('labsReviewer.agentDetail.close')}
          </button>
        ) : null}
      </div>

      {isLoading ? (
        <p className="labs-reviewer-loading">
          <LoadingIcon className="labs-reviewer-loading__icon" />
          {t('labsReviewer.agentDetail.loading')}
        </p>
      ) : null}

      {!isLoading && agentDetailError ? (
        <p className="labs-reviewer-empty labs-reviewer-empty--error">
          {agentDetailError}
        </p>
      ) : null}

      {!isLoading && !agentDetail && !agentDetailError ? (
        <p className="labs-reviewer-empty">
          {t('labsReviewer.agentDetail.empty')}
        </p>
      ) : null}

      {!isLoading && agentDetail ? (
        <div className="labs-reviewer-agent-detail__content">
          <div className="labs-reviewer-agent-detail__metadata">
            <span
              className={`labs-reviewer-status labs-reviewer-status--${agentDetail.status.toLowerCase()}`}
            >
              {t(`labsReviewer.status.${agentDetail.status}`)}
            </span>
          </div>
          {agentDetail.result ? (
            <pre className="labs-reviewer-agent-detail__result">
              {agentDetail.result}
            </pre>
          ) : (
            <p className="labs-reviewer-empty">
              {t('labsReviewer.agentDetail.emptyResult')}
            </p>
          )}
        </div>
      ) : null}
    </aside>
  )
}

export default AgentProcessDetailPanel
