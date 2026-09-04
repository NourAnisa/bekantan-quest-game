# 🐒 Bekantan Quest: The River & Canopy Guardian
### Proyek Game 2D Web untuk Mata Kuliah Pengembangan Aplikasi Game (STI7356)
**Program Studi Teknologi Informasi · Fakultas Teknik · Universitas Lambung Mangkurat (FT ULM)**

---

## 📖 1. Ringkasan Eksekutif (Game Overview)

**Bekantan Quest: The River & Canopy Guardian** adalah game platformer petualangan 2D berbasis peramban web (*browser-based*) yang dibangun murni menggunakan teknologi standar web: **HTML5 Canvas**, **CSS3**, dan **Vanilla JavaScript (ES6)**, dilengkapi dengan **Web Audio API Procedural Synthesizer**.

Game ini mengusung tema lokal khas Kalimantan Selatan: pemain mengendalikan seekor **Bekantan** (*Nasalis larvatus*) yang lincah menelusuri ekosistem lahan basah Sungai Barito, waduk Riam Kanan, hingga menara konservasi di puncak Pegunungan Meratus. 

Proyek ini dirancang sebagai **artefak percontohan kuliah (teaching exemplar & student project template)** yang mendemonstrasikan implementasi nyata dari materi perkuliahan Pertemuan 1 hingga 16 mata kuliah **STI7356 Pengembangan Aplikasi Game**.

---

## 🎮 2. Fitur Gameplay & Kontrol Pemain

| Aksi | Keyboard | Kontrol Sentuh (HP / Tablet) |
| :--- | :--- | :--- |
| **Lari Kiri / Kanan** | Tombol Panah `◀` `▶` atau `A` / `D` | Tombol D-Pad `◀` `▶` di layar |
| **Lompat Normal** | `Spasi`, `W`, `Panah Atas`, atau `K` | Tombol Aksi `▲` |
| **Double Jump** | Tekan lompat sekali lagi saat di udara | Tekan tombol `▲` di udara |
| **Variable Jump (Jump Cut)** | Lepas tombol lompat lebih awal untuk lompatan pendek | Lepas sentuhan tombol `▲` lebih awal |
| **Melesat Cepat (Air Dash)** | `Shift Kiri`, `X`, atau `J` | Tombol Aksi `⚡` |
| **Injak Musuh (Stomp Attack)** | Lompat dan daratkan kaki di atas kepala musuh | Arahkan lompatan ke atas musuh |
| **Jeda / Pause** | `P` atau `Escape` | Tombol Pause di UI |
| **Game Dev Inspector** | Tekan `F1` | Tombol `🛠️ Inspector [F1]` di Header |
| **God Mode (Cheat Dosen)** | Tekan tombol `G` | — |
| **Skip Level (Cheat Dosen)** | Tekan tombol `N` | — |

---

## 🔬 3. Pemetaan Pedagogis Sesuai Silabus STI7356

Proyek ini merepresentasikan topik-topik kunci yang diajarkan pada kurikulum STI7356 FT ULM:

1. **Pertemuan 1 & 2 (Konsep Dasar & Core Loop Game):**
   - Implementasi siklus aksi: *Input $\rightarrow$ Physics Update $\rightarrow$ Collision $\rightarrow$ Feedback Visual & Audio $\rightarrow$ Reward / Progression*.
2. **Pertemuan 3 & 11 (Navigasi Gameplay & Level Design 2D):**
   - Sistem *Tilemap Grid Array* dengan variasi rintangan: tanah solid (1), dahan kayu tembus satu arah / *one-way platform* (2), jamur pegas pemantul / *spring mushroom* (3), duri rotan / *spikes* (4), dan rakit apung bergerak / *moving platform*.
3. **Pertemuan 4 & 5 (Perancangan Karakter & Properti Game):**
   - Karakter Bekantan prosedural pixel art dengan hidung panjang ikonik, ekor panjang berayun, mata ekspresif, dan perut buncit khas bekantan.
   - Properti kolektibel: **Buah Rambai** (+100 skor), **Intan Martapura** (+500 skor), dan **Hati Pemulih Darah** (+1 HP).
4. **Pertemuan 7 & 10 (UI/UX Antarmuka Game):**
   - HUD *glassmorphism* modern dengan indikator darah hati (❤️), penghitung buah, intan, timer, dan skor.
   - Layar menu awal, layar jeda (pause), layar level selesai, game over, dan kemenangan akhir (Game Win).
5. **Pertemuan 12 (Sound Effect & Backsound):**
   - Menggunakan **Web Audio API Oscillator & Noise Generator** mandiri tanpa berkas audio `.mp3`/`.wav` eksternal. Anti-404, tidak bergantung koneksi internet, dan kompatibel 100% saat di-deploy.
6. **Pertemuan 13 & 14 (Prototyping & Physics Engine):**
   - Deteksi tabrakan presisi *AABB (Axis-Aligned Bounding Box)* terpisah pada sumbu X dan Y untuk mencegah *glitching/tunneling*.
   - *Coyote Time* (0.12 detik toleransi lompat setelah meninggalkan pijakan) dan *Jump Buffer* untuk kenyamanan jari pemain.
7. **Pertemuan 15 (Polishing & Juiciness):**
   - *Parallax scrolling* 4 lapis (awan, pegunungan Meratus, kanopi mangrove, riak air).
   - Efek partikel debu pijakan (*dust puff*), kilau bintang (*sparkles*), teks skor melayang (*floating popups*), dan getaran kamera (*screen shake*).

---

## 🛠️ 4. Mode Inspektur Game Dev (F1)

Dosen dan mahasiswa dapat mengaktifkan **Mode Inspektur Game Dev** dengan menekan tombol **`F1`** pada keyboard atau mengklik tombol **`🛠️ Inspector [F1]`** di sudut kanan atas.

Fitur Inspector menampilkan:
- Real-time **FPS Counter** dan durasi frame (**delta time**).
- Status **Finite State Machine (FSM)** pemain (`IDLE`, `RUN`, `JUMP`, `FALL`, `DASH`, `HURT`).
- Vektor kecepatan horizontal ($v_x$) dan vertikal ($v_y$).
- Status pijakan (`isGrounded`) dan sisa *Coyote Time*.
- Garis kotak batas tabrakan (**Hitbox AABB**) berwarna:
  - 🟥 **Merah**: Hitbox pemain
  - 🟨 **Kuning**: Hitbox musuh (Kepiting / Drone)
  - 🟩 **Hijau**: Hitbox buah dan intan

---

## 🚀 5. Panduan Deploy ke GitHub Pages (Langkah demi Langkah)

Proyek ini sudah dilengkapi dengan berkas otomatisasi **GitHub Actions** (`.github/workflows/deploy.yml`) dan dapat di-hosting secara gratis di GitHub Pages dalam waktu kurang dari 2 menit.

### Cara 1: Menggunakan GitHub Desktop atau Git CLI (Direkomendasikan)

1. **Buat Repositori Baru di GitHub:**
   - Buka [GitHub](https://github.com) dan buat repositori baru (misal diberi nama: `bekantan-quest` atau `game-sti7356`).
   - Pilih visibilitas **Public**.

2. **Inisialisasi Git & Unggah Kode:**
   Buka terminal/PowerShell di dalam folder `c:\Dokumen\ULM\bekantan-quest-game`:
   ```bash
   git init
   git add .
   git commit -m "Initial commit: Bekantan Quest game STI7356"
   git branch -M main
   git remote add origin https://github.com/<USERNAME-ANDA>/<NAMA-REPO-ANDA>.git
   git push -u origin main
   ```

3. **Aktifkan GitHub Pages di Pengaturan Repositori:**
   - Masuk ke tab **Settings** di repositori GitHub Anda.
   - Pilih menu **Pages** di panel sebelah kiri.
   - Di bagian **Build and deployment -> Source**:
     - Pilih **GitHub Actions** (alur kerja akan langsung aktif otomatis melalui berkas `.github/workflows/deploy.yml`), ATAU
     - Pilih **Deploy from a branch**, lalu pilih branch `main` dan folder `/ (root)`, kemudian klik **Save**.

4. **Buka Game yang Sudah Online:**
   - Setelah 1-2 menit, game Anda akan aktif di URL:
     ```
     https://<USERNAME-ANDA>.github.io/<NAMA-REPO-ANDA>/
     ```
   - Bagikan tautan tersebut kepada dosen, asisten praktikum, dan teman sekelas untuk dimainkan langsung lewat HP maupun laptop!

---

## 💻 6. Menjalankan Game Secara Lokal di Komputer

Game ini tidak memerlukan proses *build* atau instalasi Node.js/NPM yang rumit:

### Opsi A (Langsung Buka Berkas):
Cukup klik ganda (*double-click*) pada berkas `index.html`. Game akan langsung terbuka dan berjalan mulus di browser Google Chrome, Microsoft Edge, Mozilla Firefox, atau Safari.

### Opsi B (Menggunakan Local Server Python):
Jika Anda ingin mensimulasikan lingkungan server sungguhan:
```bash
python -m http.server 8000
```
Lalu buka browser di alamat: `http://localhost:8000`

---

## 📂 7. Struktur Berkas Proyek

```
bekantan-quest-game/
├── index.html                   # Halaman web utama, canvas, UI HUD & modal
├── css/
│   └── style.css                # Styling arcade retro, glassmorphism HUD, kontrol sentuh
├── js/
│   ├── audio.js                 # Web Audio API procedural synthesizer (SFX & BGM)
│   ├── physics.js               # AABB collision engine, Coyote time, vector math
│   ├── particles.js             # Particle emitter (dust, sparkle, text popups, camera shake)
│   ├── entities.js              # Class Player (FSM), Collectible, Enemy, MovingPlatform, Goal
│   ├── levels.js                # Tilemap array 3 level (Mangrove, Riam Kanan, Meratus)
│   ├── renderer.js              # Procedural pixel-art renderer, parallax layers & inspector
│   └── game.js                  # Main game loop (requestAnimationFrame), state & input manager
├── .github/
│   └── workflows/
│       └── deploy.yml           # GitHub Actions workflow untuk deployment otomatis ke Pages
├── LICENSE                      # Lisensi Open-Source (MIT)
└── README.md                    # Dokumentasi lengkap & Game Design Document (GDD)
```

---

## 👨‍🏫 8. Panduan Modifikasi untuk Tugas Mahasiswa

Mahasiswa STI7356 dapat mengembangkan dan mengkustomisasi game ini untuk tugas mandiri maupun kelompok:

1. **Menambah Level Baru:**
   - Buka berkas `js/levels.js`.
   - Tambahkan objek level baru pada array `LEVELS_DATA` dengan mendefinisikan layout peta pada array 2D `map` (0: udara, 1: tanah padat, 2: dahan kayu, 3: jamur, 4: duri).
2. **Mengubah Kecepatan & Karakter:**
   - Buka berkas `js/entities.js` pada class `Player`.
   - Modifikasi variabel `moveSpeed`, `jumpSpeed`, `dashSpeed`, atau `maxHealth`.
3. **Menambahkan Musuh atau Rintangan Unik:**
   - Tambahkan subclass baru di `js/entities.js` yang mewarisi class `Entity`, dan panggil proses rendering-nya di `js/renderer.js`.

---

## 📜 9. Lisensi

Proyek ini dirilis di bawah lisensi open-source **MIT License** — bebas digunakan, dimodifikasi, dan didistribusikan untuk keperluan pendidikan dan akademik.
