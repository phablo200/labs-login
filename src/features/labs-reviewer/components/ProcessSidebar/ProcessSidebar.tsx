import { useTranslation } from 'react-i18next'
import AddIcon from '../../../../components/ui/Icons/AddIcon'
import LoadingIcon from '../../../../components/ui/Icons/LoadingIcon'
import SignOut from '../../../../components/ui/Icons/SignOut'
import type { ProcessStatusResponse } from '../../types'
import type { ProcessSidebarProps } from './ProcessSidebar.types'
import './ProcessSidebar.css'

function getProcessTitle(processStatus: ProcessStatusResponse, fallback: string) {
  return processStatus.file?.trim() || fallback
}

function ProcessSidebar({
  isCreatingProcess,
  isLoadingProcesses,
  onCreateProcess,
  onLogout,
  onSelectProcess,
  processes,
  selectedProcessId,
  signedInEmail,
}: ProcessSidebarProps) {
  const { t } = useTranslation()

  return (
    <aside className="process-sidebar" aria-label={t('labsReviewer.sidebar.label')}>
      <div className="process-sidebar__brand">
        <span className="process-sidebar__brand-name">labs-login</span>
        <button
          aria-busy={isCreatingProcess}
          className="process-sidebar__new-button"
          disabled={isCreatingProcess}
          onClick={onCreateProcess}
          type="button"
        >
          {isCreatingProcess ? (
            <LoadingIcon className="process-sidebar__button-icon" />
          ) : (
            <AddIcon className="process-sidebar__button-icon" />
          )}
          <span>{t('labsReviewer.sidebar.newProcess')}</span>
        </button>
      </div>

      <div className="process-sidebar__section">
        <div className="process-sidebar__section-header">
          <h2>{t('labsReviewer.sidebar.recents')}</h2>
          {isLoadingProcesses ? (
            <LoadingIcon className="process-sidebar__loading-icon" />
          ) : null}
        </div>

        {processes.length > 0 ? (
          <nav
            className="process-sidebar__nav"
            aria-label={t('labsReviewer.sidebar.recents')}
          >
            {processes.map((processStatus) => {
              const isSelected = processStatus.id === selectedProcessId

              return (
                <button
                  aria-current={isSelected ? 'page' : undefined}
                  className={
                    isSelected
                      ? 'process-sidebar__item process-sidebar__item--selected'
                      : 'process-sidebar__item'
                  }
                  key={processStatus.id}
                  onClick={() => onSelectProcess(processStatus)}
                  type="button"
                >
                  <span className="process-sidebar__item-title">
                    {getProcessTitle(
                      processStatus,
                      t('labsReviewer.process.untitled'),
                    )}
                  </span>
                  <span
                    className={`process-sidebar__status process-sidebar__status--${processStatus.status.toLowerCase()}`}
                  >
                    {t(`labsReviewer.status.${processStatus.status}`)}
                  </span>
                </button>
              )
            })}
          </nav>
        ) : (
          <p className="process-sidebar__empty">
            {isLoadingProcesses
              ? t('labsReviewer.sidebar.loading')
              : t('labsReviewer.sidebar.empty')}
          </p>
        )}
      </div>

      <div className="process-sidebar__account">
        {signedInEmail ? (
          <span className="process-sidebar__email">{signedInEmail}</span>
        ) : null}
        <button
          className="process-sidebar__logout"
          onClick={onLogout}
          type="button"
        >
          <SignOut className="process-sidebar__logout-icon" />
          <span>{t('actions.logout')}</span>
        </button>
      </div>
    </aside>
  )
}

export default ProcessSidebar
