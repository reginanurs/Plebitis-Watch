import { Navigate, useParams } from 'react-router-dom'

/**
 * The standalone recommendation view was merged into the Result page so
 * recommendation is always shown together with the score/category that
 * produced it (one source of truth: `recommendations.json` +
 * `getRecommendationForScore`, rendered by `RecommendationPanel`). This
 * route is kept — rather than deleted — so old links/bookmarks still land
 * somewhere useful instead of 404ing.
 */
function RekomendasiResultPage() {
  const { assessmentId } = useParams<{ assessmentId: string }>()
  return <Navigate to={`/hasil-penilaian/${assessmentId}`} replace />
}

export default RekomendasiResultPage
