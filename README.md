# Aplikasi Pemrosesan Citra Digital Sederhana

Sebuah aplikasi web sederhana untuk melakukan pemrosesan citra digital dengan berbagai filter dan transformasi geometri.

## Fitur

### Filter Citra

- **RGB to Grayscale**: Mengubah gambar berwarna menjadi grayscale
- **Deteksi Garis**: Deteksi garis dengan operator kanan dan atas
- **Blur**: Memberikan efek blur pada gambar
- **Pemisahan Kanal RGB**: Memisahkan gambar menjadi komponen Red, Green, dan Blue

### Transformasi Geometri

- **Translasi**: Menggeser gambar secara horizontal dan vertikal
- **Skala**: Mengubah ukuran gambar
- **Rotasi**: Memutar gambar dengan sudut tertentu
- **Flip Horizontal**: Membalik gambar secara horizontal
- **Flip Vertikal**: Membalik gambar secara vertikal

### Fitur Tambahan

- **Mode Gelap/Terang**: Toggle antara tema gelap dan terang
- **Mode Warna Acak**: Mengubah skema warna aplikasi secara acak
- **Unduh Gambar**: Mengunduh gambar yang telah diproses

## Cara Penggunaan

1. **Upload Gambar**: Klik tombol "Upload Gambar" dan pilih file gambar dari komputer Anda
2. **Pilih Operasi**: Pilih jenis filter atau transformasi yang ingin diterapkan
3. **Proses Gambar**: Klik tombol "Proses" untuk menerapkan operasi yang dipilih
4. **Unduh Hasil**: Klik tombol "Download" untuk mengunduh gambar hasil pemrosesan

## Tampilan Responsif

Aplikasi ini dirancang dengan tampilan responsif sehingga dapat diakses dengan nyaman pada berbagai perangkat, mulai dari desktop hingga mobile.

## Teknologi yang Digunakan

- **HTML5 Canvas**: Untuk manipulasi dan rendering gambar
- **JavaScript**: Logika pemrosesan citra
- **Tailwind CSS**: Framework CSS untuk styling responsif
- **SweetAlert2**: Untuk dialog dan notifikasi interaktif

## Implementasi Filter

Aplikasi ini mengimplementasikan berbagai algoritma pemrosesan citra seperti:

- Konversi grayscale menggunakan pembobotan (0.299R + 0.587G + 0.114B)
- Deteksi tepi menggunakan operator Sobel
- Konvolusi untuk filter blur dan deteksi tepi
- Transformasi matriks untuk operasi geometri

## Instalasi dan Menjalankan Aplikasi

1. Clone atau download repositori ini
2. Buka file `index.html` di browser web
3. Tidak diperlukan server khusus, aplikasi dapat berjalan secara lokal

## Catatan Penggunaan

- Aplikasi ini berjalan sepenuhnya di sisi klien (browser)
- Ukuran gambar yang terlalu besar mungkin mempengaruhi performa
- Disarankan menggunakan browser modern terbaru untuk kompatibilitas optimal
