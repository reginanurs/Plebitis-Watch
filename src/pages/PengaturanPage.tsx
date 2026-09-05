import ComingSoonCard from '../components/ComingSoonCard'
import PageHeader from '../components/PageHeader'

function PengaturanPage() {
  return (
    <div>
      <PageHeader
        title="Pengaturan"
        description="Atur profil, unit kerja, dan preferensi aplikasi."
        showBackButton={false}
      />
      <ComingSoonCard />
    </div>
  )
}

export default PengaturanPage
