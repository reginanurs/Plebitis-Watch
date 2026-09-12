import { Loader2 } from 'lucide-react'

/** Shown while the async Supabase session check is in flight, to avoid a login-page flash. */
function RouteLoadingScreen() {
  return (
    <div className="flex min-h-svh items-center justify-center bg-gray-50">
      <Loader2 size={28} className="animate-spin text-teal-700" />
    </div>
  )
}

export default RouteLoadingScreen
