import { CheckSquare, Lightbulb } from 'lucide-react'
import recommendationsConfig from '../../data/recommendations.json'
import type { RecommendationConfig } from '../../types/recommendation'
import { getRecommendationForScore } from '../../utils/recommendation'

const config = recommendationsConfig as RecommendationConfig

interface RecommendationPanelProps {
  /** The VIP Score to look up a recommendation for — pass `null` while incomplete/unavailable. */
  score: number | null
  /** Slightly smaller heading for contexts where this sits inside a live preview panel. */
  compact?: boolean
}

/**
 * Single place that renders recommendation content, driven entirely by
 * `recommendations.json` + `getRecommendationForScore`. Used both for
 * the live preview while filling in an assessment and for the saved
 * Result page — never duplicate this matching/rendering logic elsewhere.
 */
function RecommendationPanel({ score, compact = false }: RecommendationPanelProps) {
  const result = getRecommendationForScore(score, config)

  return (
    <div className={`rounded-2xl bg-amber-50 ${compact ? 'p-4' : 'p-5'}`}>
      <div className="mb-3 flex items-center gap-2 text-amber-800">
        <Lightbulb size={compact ? 18 : 20} />
        <h2 className={compact ? 'text-base font-semibold' : 'text-lg font-semibold'}>Rekomendasi Tindak Lanjut</h2>
      </div>

      {result.status === 'ok' ? (
        <div className="flex flex-col gap-3">
          <div>
            <p className="font-medium text-amber-900">{result.rule.title}</p>
            {result.rule.description && <p className="mt-1 text-sm text-amber-800">{result.rule.description}</p>}
          </div>

          <ul className="flex flex-col gap-2">
            {result.rule.actions.map((action) => (
              <li key={action.id} className="flex items-start gap-2">
                <CheckSquare size={16} className="mt-0.5 shrink-0 text-amber-700" />
                <div>
                  <p className="text-sm font-medium text-amber-900">{action.title}</p>
                  {action.description && <p className="text-sm text-amber-700">{action.description}</p>}
                </div>
              </li>
            ))}
          </ul>
        </div>
      ) : (
        <div className="flex flex-col gap-1">
          <p className="font-medium text-amber-900">
            {result.status === 'pending_category' ? 'Rekomendasi belum tersedia.' : 'Rekomendasi tindak lanjut belum dikonfigurasi.'}
          </p>
          <p className="text-sm text-amber-800">{result.reason}</p>
        </div>
      )}

      <p className="mt-3 text-xs text-amber-700">
        Rekomendasi pada prototype ini merupakan pendukung pengambilan keputusan dan harus disesuaikan
        dengan SOP/kebijakan fasilitas serta kondisi klinis pasien.
      </p>
    </div>
  )
}

export default RecommendationPanel
