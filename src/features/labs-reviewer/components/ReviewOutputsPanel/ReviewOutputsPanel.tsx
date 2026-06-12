import { useTranslation } from 'react-i18next'
import LoadingIcon from '../../../../components/ui/Icons/LoadingIcon'
import { buildReviewOutputUrl } from '../../api'
import type { ReviewOutputItem } from '../../types'
import type { ReviewOutputsPanelProps } from './ReviewOutputsPanel.types'

type OutputListProps = {
  emptyLabel: string
  items: ReviewOutputItem[]
  title: string
}

function OutputList({ emptyLabel, items, title }: OutputListProps) {
  return (
    <div className="labs-reviewer-outputs__section">
      <h3>{title}</h3>
      {items.length > 0 ? (
        <ul className="labs-reviewer-output-list">
          {items.map((item) => (
            <li className="labs-reviewer-output-list__item" key={item.path}>
              <a
                href={buildReviewOutputUrl(item.path)}
                rel="noreferrer"
                target="_blank"
              >
                {item.filename}
              </a>
            </li>
          ))}
        </ul>
      ) : (
        <p className="labs-reviewer-empty">{emptyLabel}</p>
      )}
    </div>
  )
}

function ReviewOutputsPanel({
  isRefreshing,
  markdownOutputs,
  onRefresh,
  pdfOutputs,
}: ReviewOutputsPanelProps) {
  const { t } = useTranslation()

  return (
    <section className="labs-reviewer-panel" aria-labelledby="outputs-title">
      <div className="labs-reviewer-panel__header labs-reviewer-panel__header--inline">
        <div>
          <p className="labs-reviewer-panel__eyebrow">
            {t('labsReviewer.outputs.eyebrow')}
          </p>
          <h2 id="outputs-title">{t('labsReviewer.outputs.title')}</h2>
          <p>{t('labsReviewer.outputs.copy')}</p>
        </div>
        <button
          aria-busy={isRefreshing}
          className="labs-reviewer-button labs-reviewer-button--secondary"
          disabled={isRefreshing}
          onClick={onRefresh}
          type="button"
        >
          {isRefreshing ? (
            <LoadingIcon className="labs-reviewer-button__icon" />
          ) : null}
          <span>{t('labsReviewer.outputs.refresh')}</span>
        </button>
      </div>

      <div className="labs-reviewer-outputs">
        <OutputList
          emptyLabel={t('labsReviewer.outputs.emptyMarkdown')}
          items={markdownOutputs.items}
          title={t('labsReviewer.outputs.markdownTitle', {
            count: markdownOutputs.count,
          })}
        />
        <OutputList
          emptyLabel={t('labsReviewer.outputs.emptyPdf')}
          items={pdfOutputs.items}
          title={t('labsReviewer.outputs.pdfTitle', {
            count: pdfOutputs.count,
          })}
        />
      </div>
    </section>
  )
}

export default ReviewOutputsPanel
