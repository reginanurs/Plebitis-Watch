import { Navigate, Route, Routes } from 'react-router-dom'
import GuestOnlyRoute from './components/GuestOnlyRoute'
import ProtectedRoute from './components/ProtectedRoute'
import AppLayout from './layouts/AppLayout'
import DashboardPage from './pages/DashboardPage'
import DataPasienPage from './pages/DataPasienPage'
import DataPivcPage from './pages/DataPivcPage'
import DokumentasiFotoPage from './pages/DokumentasiFotoPage'
import DokumentasiFotoPatientPage from './pages/DokumentasiFotoPatientPage'
import EdukasiDetailPage from './pages/EdukasiDetailPage'
import EdukasiPage from './pages/EdukasiPage'
import GrafikPage from './pages/GrafikPage'
import HasilPenilaianPage from './pages/HasilPenilaianPage'
import HasilPenilaianResultPage from './pages/HasilPenilaianResultPage'
import LoginPage from './pages/LoginPage'
import NotifikasiPage from './pages/NotifikasiPage'
import PengaturanPage from './pages/PengaturanPage'
import PatientDetailPage from './pages/PatientDetailPage'
import PenilaianVipScorePage from './pages/PenilaianVipScorePage'
import PenilaianVipScorePatientPage from './pages/PenilaianVipScorePatientPage'
import PivcDetailPage from './pages/PivcDetailPage'
import PivcPatientPage from './pages/PivcPatientPage'
import RekomendasiPage from './pages/RekomendasiPage'
import RekomendasiResultPage from './pages/RekomendasiResultPage'
import ReminderPage from './pages/ReminderPage'
import RiwayatPage from './pages/RiwayatPage'

function App() {
  return (
    <Routes>
      <Route element={<GuestOnlyRoute />}>
        <Route path="/login" element={<LoginPage />} />
      </Route>

      <Route element={<ProtectedRoute />}>
        <Route element={<AppLayout />}>
          <Route path="/" element={<Navigate to="/dashboard" replace />} />
          <Route path="/dashboard" element={<DashboardPage />} />
          <Route path="/pasien" element={<DataPasienPage />} />
          <Route path="/pasien/:id" element={<PatientDetailPage />} />
          <Route path="/pivc" element={<DataPivcPage />} />
          <Route path="/pivc/detail/:id" element={<PivcDetailPage />} />
          <Route path="/pivc/:patientId" element={<PivcPatientPage />} />
          <Route path="/penilaian" element={<PenilaianVipScorePage />} />
          <Route path="/penilaian/:patientId" element={<PenilaianVipScorePatientPage />} />
          <Route path="/dokumentasi-foto" element={<DokumentasiFotoPage />} />
          <Route path="/dokumentasi-foto/:patientId" element={<DokumentasiFotoPatientPage />} />
          <Route path="/hasil-penilaian" element={<HasilPenilaianPage />} />
          <Route path="/hasil-penilaian/:assessmentId" element={<HasilPenilaianResultPage />} />
          <Route path="/rekomendasi" element={<RekomendasiPage />} />
          <Route path="/rekomendasi/:assessmentId" element={<RekomendasiResultPage />} />
          <Route path="/riwayat" element={<RiwayatPage />} />
          <Route path="/grafik" element={<GrafikPage />} />
          <Route path="/reminder" element={<ReminderPage />} />
          <Route path="/notifikasi" element={<NotifikasiPage />} />
          <Route path="/edukasi" element={<EdukasiPage />} />
          <Route path="/edukasi/:id" element={<EdukasiDetailPage />} />
          <Route path="/pengaturan" element={<PengaturanPage />} />
        </Route>
      </Route>
    </Routes>
  )
}

export default App
