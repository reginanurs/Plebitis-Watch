-- Plebitis Watch — seed data for Phase 21 (patients & pivcs) and
-- Phase 22 (assessments).
--
-- Mirrors src/data/patients.json, src/data/pivc.json and
-- src/data/assessments.json exactly, including ids, so
-- photos/reminders/notifications (still local JSON, referencing these same
-- ids) keep resolving correctly. Run after schema.sql. Safe to re-run —
-- existing rows are left untouched.
--
-- NOTE: src/data/photos.json (5 placeholder demo photos) is deliberately
-- NOT seeded here — those images require a real upload to Supabase Storage,
-- which plain SQL can't do. The "Dokumentasi Foto" timeline for seed
-- patients starts empty until new photos are captured through the app.

insert into public.patients (id, medical_record_number, name, date_of_birth, gender, room, bed, address, notes)
values
  ('seed-1', 'RM00012345', 'Ny. Siti Aisyah', '1994-03-12', 'Perempuan', 'Mawar 2', '05', 'Jl. Melati No. 10, Bandung', ''),
  ('seed-2', 'RM00012346', 'Tn. Budi Santoso', '1988-02-15', 'Laki-laki', 'Melati 1', '02', '', 'Riwayat alergi obat tertentu.'),
  ('seed-3', 'RM00012347', 'Ny. Rina Handayani', '1975-11-10', 'Perempuan', 'Mawar 3', '07', 'Jl. Kenanga No. 22, Bandung', ''),
  ('seed-4', 'RM00012348', 'Tn. Andi Wijaya', '1990-06-21', 'Laki-laki', 'Anggrek 1', '01', '', ''),
  ('seed-5', 'RM00012349', 'Ny. Lilis Suryani', '1981-04-05', 'Perempuan', 'Melati 2', '04', 'Jl. Anggrek No. 5, Bandung', ''),
  ('seed-6', 'RM00012350', 'Tn. Hendra Saputra', '1996-08-30', 'Laki-laki', 'Anggrek 2', '09', '', ''),
  ('seed-7', 'RM00012351', 'Ny. Yuni Pratiwi', '1999-01-18', 'Perempuan', 'Melati 1', '01', '', ''),
  ('seed-8', 'RM00012352', 'Tn. Dedi Kurniawan', '1970-12-02', 'Laki-laki', 'Mawar 1', '03', 'Jl. Dahlia No. 8, Bandung', 'Pasien lansia, perlu perhatian ekstra saat mobilisasi.'),
  ('seed-9', 'RM00012353', 'Ny. Fitriani Rahma', '1985-07-07', 'Perempuan', 'Anggrek 3', '02', '', '')
on conflict (id) do nothing;

insert into public.pivcs (
  id, patient_id, installation_date, installation_time, insertion_site, extremity_side,
  catheter_type, therapy, inserted_by, purpose, additional_notes, status
)
values
  ('pivc-seed-1', 'seed-1', '2026-09-02', '14:30', 'Vena dorsalis manus', 'Kanan', 'Peripheral IV Catheter 22G', 'NaCl 0.9%', 'Perawat', 'Terapi cairan dan antibiotik', 'Insersi mudah, darah balik lancar, fiksasi dengan transparent dressing.', 'active'),
  ('pivc-seed-2', 'seed-4', '2026-08-20', '09:10', 'Vena cephalica', 'Kiri', 'Peripheral IV Catheter 20G', 'Ringer Laktat', 'Perawat', 'Rehidrasi', 'PIVC telah dilepas setelah terapi selesai.', 'removed'),
  ('pivc-seed-3', 'seed-8', '2026-09-04', '08:45', 'Vena mediana cubiti', 'Kanan', 'Peripheral IV Catheter 20G', 'Albumin 20%', 'Perawat', 'Terapi cairan rumatan', 'Pasien lansia, area insersi dipantau lebih ketat. Jenis terapi dicatat sebagai "Lainnya" karena tidak tersedia pada pilihan baku.', 'active'),
  ('pivc-seed-4', 'seed-2', '2026-09-05', '07:30', 'Vena cephalica', 'Kiri', 'Peripheral IV Catheter 20G', 'NaCl 0.9%', 'Perawat', 'Terapi cairan rumatan', '', 'active'),
  ('pivc-seed-5', 'seed-6', '2026-09-04', '16:00', 'Vena basilica', 'Kanan', 'Peripheral IV Catheter 22G', 'Dekstrosa 5%', 'Perawat', 'Terapi cairan dan elektrolit', '', 'active')
on conflict (id) do nothing;

insert into public.assessments (
  id, patient_id, pivc_id, date, time, assessed_by, components, total_score, category, notes
)
values
  ('assessment-seed-1', 'seed-1', 'pivc-seed-1', '2026-09-02', '15:00', 'Perawat',
   '{"pain":"none","erythema":"absent","swelling":"absent","induration":"absent","venousCord":"absent","pyrexia":"absent"}'::jsonb,
   0, 'Tidak ada tanda phlebitis', 'Kondisi awal area insersi baik, tidak ada tanda kemerahan atau nyeri.'),
  ('assessment-seed-2', 'seed-1', 'pivc-seed-1', '2026-09-03', '09:30', 'Perawat',
   '{"pain":"none","erythema":"present","swelling":"absent","induration":"absent","venousCord":"absent","pyrexia":"absent"}'::jsonb,
   1, 'Kemungkinan tanda awal phlebitis', 'Sedikit kemerahan pada area insersi, dipantau lebih sering.'),
  ('assessment-seed-3', 'seed-1', 'pivc-seed-1', '2026-09-04', '10:15', 'Perawat',
   '{"pain":"slight_near_site","erythema":"present","swelling":"absent","induration":"absent","venousCord":"absent","pyrexia":"absent"}'::jsonb,
   2, 'Stadium awal phlebitis', 'Nyeri ringan dan kemerahan tampak pada area insersi, dipantau lebih ketat.'),
  ('assessment-seed-4', 'seed-8', 'pivc-seed-3', '2026-09-04', '09:00', 'Perawat',
   '{"pain":"along_cannula","erythema":"present","swelling":"absent","induration":"present","venousCord":"absent","pyrexia":"absent"}'::jsonb,
   3, 'Stadium sedang phlebitis', 'Nyeri di sepanjang jalur kanula disertai kemerahan dan indurasi (pengerasan jaringan) pada area insersi; pasien lansia dipantau lebih ketat sesuai SOP.'),
  ('assessment-seed-5', 'seed-4', 'pivc-seed-2', '2026-08-21', '10:00', 'Perawat',
   '{"pain":"along_cannula","erythema":"present","swelling":"absent","induration":"present","venousCord":"present","pyrexia":"absent"}'::jsonb,
   4, 'Stadium lanjut phlebitis / awal thrombophlebitis', 'Ditemukan tanda phlebitis lanjut: nyeri di sepanjang kanula, kemerahan, indurasi (pengerasan jaringan), dan vena teraba seperti tali. PIVC dijadwalkan untuk dilepas dan diganti sesuai SOP.'),
  ('assessment-seed-6', 'seed-6', 'pivc-seed-5', '2026-09-05', '18:00', 'Perawat',
   '{"pain":"along_cannula","erythema":"present","swelling":"absent","induration":"present","venousCord":"present","pyrexia":"present"}'::jsonb,
   5, 'Stadium lanjut thrombophlebitis', 'Seluruh tanda stadium lanjut ditemukan bersamaan, termasuk demam. Sesuai rekomendasi, kanula perlu segera dilepas dan pasien dirujuk untuk evaluasi medis lebih lanjut sesuai SOP fasilitas.')
on conflict (id) do nothing;
