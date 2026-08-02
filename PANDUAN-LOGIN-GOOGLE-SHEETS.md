# Panduan Login Aman Google Sheets + Apps Script

## 1. Perubahan keamanan utama

Versi terbaru `apps-script/code.gs` tidak lagi menyimpan username dan password asli di Google Sheet.

Yang disimpan pada sheet `Users` adalah:

| Kolom | Isi |
|---|---|
| User ID | ID acak pengguna |
| Username Hash | Hash username yang sudah dinormalisasi |
| Username Hint | Username tersamarkan, misalnya `a•••n` |
| Password Hash | Hash password berulang |
| Password Salt | Salt unik untuk setiap pengguna |
| Role | Hak akses pengguna |
| Name | Nama pengguna |
| Status | Status akun |
| Last Login | Waktu login terakhir |

Kolom `User ID`, `Username Hash`, `Password Hash`, dan `Password Salt` otomatis:

- Disembunyikan.
- Diproteksi.
- Tidak perlu diedit secara manual.

Pepper rahasia disimpan pada **Script Properties**, bukan pada Google Sheet.

> Hash tidak dapat dikembalikan menjadi password asli. Saat pengguna lupa password, password harus direset, bukan dibaca kembali.

## 2. Menjalankan setup pertama

1. Buka Google Apps Script.
2. Hapus kode lama lalu tempel seluruh isi `apps-script/code.gs` terbaru.
3. Klik **Save**.
4. Pilih fungsi `setupAwal`.
5. Klik **Run**.
6. Berikan izin akses Spreadsheet dan Google Docs.

Setup akan otomatis:

- Membuat database `KaryawanKu Database` jika belum ada.
- Membuat sheet `Users`.
- Membuat header aman.
- Membuat akun pertama dengan role `Pembuat Aplikasi`.
- Membuat dokumen Google Docs privat yang berisi kredensial awal.
- Membuat sheet `Setup Info` tanpa memperlihatkan username/password asli.

Hasil setup pada Execution log akan berisi status pembuatan akun pertama, role, dan URL dokumen kredensial privat. Nilai username dan password dibuat pada saat setup dan tidak ditanamkan sebagai data contoh di proyek.

Selain Execution log, buka tab `Setup Info`. Di sana tersedia tautan menuju **dokumen kredensial privat**. Dokumen tersebut dibuat di Google Drive pemilik script dan tidak dibagikan secara publik.

## 3. Tampilan pada Google Sheet

Sheet tidak akan memperlihatkan username dan password asli.

Kolom yang terlihat hanya berisi username tersamarkan, role, nama pengguna, status akun, dan waktu login terakhir. Tidak ada username atau password asli yang ditampilkan di sheet.

Kolom hash dan salt berada dalam keadaan tersembunyi. Walaupun kolom tersebut dibuka kembali, isinya bukan username/password asli.

## 4. Migrasi dari versi lama

Apabila sheet lama masih memiliki kolom plaintext `Username` dan `Password`, script akan memigrasikan nilainya ke format hash.

script akan otomatis:

1. Membaca data plaintext lama.
2. Membuat hash username.
3. Membuat salt dan hash password.
4. Membuat `Username Hint`.
5. Mengosongkan isi kolom `Username` dan `Password` lama.
6. Membuat dokumen kredensial privat untuk akun pertama yang dimigrasikan.

Header lama boleh tetap berada pada posisi mana pun. Pembacaan header tetap berdasarkan nama dan alias, bukan nomor kolom.

## 5. Melihat akun awal

Pilih fungsi:

```text
tampilkanAkunAwal
```

Fungsi ini menampilkan:

- Username hint.
- Role.
- Nama.
- Tautan dokumen kredensial privat.

Password tidak dibaca dari sheet karena hanya hash yang tersimpan.

## 6. Jika dokumen kredensial hilang

Pilih fungsi:

```text
buatUlangKredensialAdmin
```

Fungsi tersebut akan:

- Membuat identitas login baru untuk akun pertama.
- Membuat password acak baru.
- Menyimpan hash baru.
- Membuat dokumen kredensial privat baru.
- Menampilkan kredensial baru pada Execution log.

Password lama langsung tidak dapat digunakan setelah reset.

## 7. Login frontend

Frontend tetap mengirim request yang sama:

```text
action=login
username=USERNAME_ANDA
password=PASSWORD_ANDA
```

Apps Script akan:

1. Menormalisasi username.
2. Menghitung hash username.
3. Mencari hash yang sama di sheet.
4. Menghitung hash password menggunakan salt pengguna dan pepper script.
5. Membandingkan hash tanpa membaca password asli.

Tidak ada perubahan yang diperlukan pada `login.html` atau `js/login.js`.

## 8. Mengubah password

Menu **Ubah sandi** pada dropdown profil tetap berfungsi.

Saat password berhasil diganti:

- Salt baru dibuat.
- Password hash baru disimpan.
- Password lama tidak lagi berlaku.
- Pengguna dikeluarkan dan diminta login kembali.

## 9. Deploy ulang

Setelah mengganti `code.gs`:

```text
Deploy
→ Manage deployments
→ Edit
→ New version
→ Deploy
```

Pastikan frontend menggunakan URL Web App yang berakhiran `/exec`.

## 10. Catatan keamanan

Implementasi ini jauh lebih aman daripada password plaintext, tetapi Google Sheets + Apps Script tetap bukan sistem autentikasi enterprise.

Untuk aplikasi produksi dengan data sensitif, pertimbangkan:

- Firebase Authentication atau penyedia identitas lain.
- Token sesi yang divalidasi server.
- Pembatasan percobaan login.
- Audit log.
- MFA.
- Algoritma password khusus seperti Argon2, bcrypt, atau scrypt pada backend yang mendukungnya.

Role di `localStorage` hanya digunakan untuk antarmuka. Endpoint sensitif tetap harus memvalidasi hak akses pada sisi server.
