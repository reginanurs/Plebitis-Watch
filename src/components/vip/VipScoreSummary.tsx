import RecommendationPanel from '../recommendations/RecommendationPanel'
import type { VipScoreResult } from '../../utils/vipScore'
import VipScorePendingNotice from './VipScorePendingNotice'

interface VipScoreSummaryProps {
  result: VipScoreResult
}

function VipScoreSummary({ result }: VipScoreSummaryProps) {
  return (
    <div className="flex flex-col gap-4">
      <div className="rounded-2xl border border-gray-100 bg-white p-5 shadow-sm">
        <h2 className="mb-4 text-lg font-semibold text-gray-900">Hasil Penilaian</h2>

        {result.status === 'ok' ? (
          <div className="flex flex-col gap-3">
            <div className="rounded-lg bg-gray-50 p-4 text-center transition-colors">
              <p className="text-xs uppercase tracking-wide text-gray-400">Total VIP Score</p>
              <p key={result.totalScore} className="animate-fade-in text-4xl font-bold text-teal-800">
                {result.totalScore}
              </p>
            </div>
            <div className="rounded-lg border border-gray-100 p-3 text-center transition-colors">
              <p className="text-xs uppercase tracking-wide text-gray-400">Kategori</p>
              <p key={result.category ?? '-'} className="animate-fade-in text-lg font-semibold text-gray-800">
                {result.category ?? '-'}
              </p>
            </div>
          </div>
        ) : (
          <div className="flex flex-col gap-3">
            <div className="rounded-lg bg-gray-50 p-4 text-center">
              <p className="text-xs uppercase tracking-wide text-gray-400">Total VIP Score</p>
              <p className="text-4xl font-bold text-gray-300">—</p>
            </div>
            <VipScorePendingNotice reason={result.reason} />
          </div>
        )}

        <div className="mt-4 rounded-lg bg-blue-50 p-3 text-sm text-blue-700">
          Hasil penilaian tetap memerlukan interpretasi dan pertimbangan klinis oleh tenaga kesehatan
          profesional.
        </div>
      </div>

      <RecommendationPanel score={result.status === 'ok' ? result.totalScore : null} compact />
    </div>
  )
}

export default VipScoreSummary
