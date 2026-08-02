# KaryawanKu — Aplikasi Manajemen Karyawan Multi-Cabang

Aplikasi manajemen karyawan berbasis **HTML, CSS, dan JavaScript murni** dengan tampilan premium hitam–emas. Struktur proyek dipisahkan per halaman agar mudah dirawat dan dikembangkan.

## Fitur utama

- Satu akun owner dapat mengontrol banyak cabang.
- Data karyawan, absensi, cuti, payroll, departemen, dan penilaian dipisahkan berdasarkan cabang aktif.
- Data rekening karyawan mencakup nama bank dan nomor rekening.
- Status Cuti, Probation, Resign, Mutasi, dan Blacklist mewajibkan alasan.
- List View dan Card View untuk data karyawan.
- Role pengguna: Pembuat Aplikasi, Owner, Manajer, Kasir, dan Karyawan.
- Login melalui Google Apps Script dan Google Sheets.
- Tema gelap/terang, ikon SVG, dropdown kustom, serta sidebar responsif.
- Backup dan restore data lokal.
- Seluruh data operasional awal dalam keadaan kosong.

## Kondisi data awal

Versi ini **tidak menyertakan data contoh atau data dummy**. Saat pertama kali dibuka:

- Profil perusahaan kosong.
- Belum ada cabang.
- Belum ada karyawan.
- Belum ada departemen.
- Belum ada absensi, cuti, payroll, atau penilaian.
- Statistik dashboard dimulai dari nol.

Penyimpanan lokal versi lama dibersihkan saat aplikasi dimuat. Penyimpanan baru menggunakan key `karyawanku_data_v2_clean` dan dimulai tanpa data operasional.

Akun pertama untuk login dibuat melalui fungsi setup Google Apps Script. Kredensial awal dihasilkan secara acak dan tidak ditanamkan di frontend.

## Cara menjalankan

1. Ekstrak folder aplikasi.
2. Konfigurasikan dan deploy `apps-script/code.gs`.
3. Tempel URL Web App yang berakhiran `/exec` pada meta `apps-script-url` di `login.html`.
4. Jalankan frontend melalui server lokal, misalnya Live Server atau:

```bash
python -m http.server 5500
```

5. Buka `http://localhost:5500/login.html`.
6. Masuk menggunakan akun yang dibuat oleh fungsi setup Apps Script.
7. Isi profil perusahaan dan buat cabang pertama melalui halaman Pengaturan.

## Struktur proyek

```text
employee-management-app/
├── index.html
├── login.html
├── dashboard.html
├── employees.html
├── attendance.html
├── performance.html
├── leave.html
├── payroll.html
├── departments.html
├── settings.html
├── apps-script/
│   └── code.gs
├── css/
│   └── styles.css
└── js/
    ├── auth.js
    ├── common.js
    └── login.js
```

Beberapa halaman telah menyiapkan referensi file JavaScript halaman masing-masing. Pastikan file implementasi halaman tersedia saat fitur operasional dikembangkan lebih lanjut.

## Catatan produksi

Google Sheets dan Apps Script cocok untuk prototipe atau penggunaan internal terbatas. Untuk data perusahaan yang sensitif, gunakan backend dengan autentikasi server, token sesi tervalidasi, audit log, pembatasan percobaan login, dan database dengan kontrol akses yang sesuai.
