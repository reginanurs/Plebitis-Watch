import { BellRing, Info, UserRound } from 'lucide-react'
import { Link } from 'react-router-dom'
import PageHeader from '../components/PageHeader'
import { useAuth } from '../hooks/useAuth'

function PengaturanPage() {
  const { currentUser } = useAuth()

  return (
    <div>
      <PageHeader
        title="Pengaturan"
        description="Informasi akun dan konfigurasi yang tersedia pada prototype ini."
        showBackButton={false}
      />

      <div className="flex flex-col gap-4">
        <div className="rounded-2xl border border-gray-100 bg-white p-5 shadow-sm">
          <h2 className="mb-4 text-base font-semibold text-gray-900">Akun</h2>
          <div className="flex items-center gap-3">
            <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-teal-100 text-teal-700">
              <UserRound size={20} />
            </span>
            <div>
              <p className="font-medium text-gray-900">{currentUser?.name ?? 'Pengguna'}</p>
              <p className="text-sm text-gray-500">{currentUser?.role ?? '-'}</p>
            </div>
          </div>
        </div>

        <Link
          to="/reminder"
          className="flex items-center gap-3 rounded-2xl border border-gray-100 bg-white p-5 shadow-sm transition-shadow hover:shadow-md"
        >
          <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-amber-100 text-amber-700">
            <BellRing size={20} />
          </span>
          <div>
            <p className="font-medium text-gray-900">Pengaturan Reminder Monitoring</p>
            <p className="text-sm text-gray-500">Atur interval pemantauan prototype pada halaman Reminder Monitoring.</p>
          </div>
        </Link>

        <div className="flex items-start gap-2 rounded-lg bg-blue-50 p-3 text-sm text-blue-700">
          <Info size={18} className="mt-0.5 shrink-0" />
          <p>
            Pengaturan profil pengguna, unit kerja, dan preferensi aplikasi lain belum tersedia pada
            prototype ini. Konfigurasi yang sudah dapat diubah saat ini hanya interval pengingat
            monitoring di atas.
          </p>
        </div>
      </div>
    </div>
  )
}

export default PengaturanPage
