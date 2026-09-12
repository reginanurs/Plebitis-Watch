import { Loader2 } from 'lucide-react'

/** Shown in place of page content while data is still being fetched from Supabase. */
function PageLoadingState() {
  return (
    <div className="flex min-h-[40vh] items-center justify-center">
      <Loader2 size={24} className="animate-spin text-teal-700" />
    </div>
  )
}

export default PageLoadingState
