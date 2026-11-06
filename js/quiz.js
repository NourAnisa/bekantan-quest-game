/**
 * Bekantan Quest - Educational Quiz Engine (Matematika, IPA, IPS, Sejarah)
 * Mengimplementasikan:
 * 1. Tantangan Buah: Hitung Cepat Perkalian & Pembagian (Timer 10 Detik)
 * 2. Tantangan Musuh: Kuis Pengetahuan Tematik IPA, IPS, dan Sejarah
 * Dikembangkan untuk gamifikasi edukasi interaktif STI7356 FT ULM.
 */

class QuizSystem {
    constructor(game) {
        this.game = game;
        this.modal = document.getElementById('modalQuiz');
        this.timerBar = document.getElementById('quizTimerBar');
        this.timerText = document.getElementById('quizTimerText');
        this.categoryBadge = document.getElementById('quizCategory');
        this.titleText = document.getElementById('quizTitle');
        this.questionText = document.getElementById('quizQuestion');
        this.optionsContainer = document.getElementById('quizOptions');
        this.feedbackBox = document.getElementById('quizFeedback');

        this.isActive = false;
        this.currentQuizType = null; // 'math' | 'trivia'
        this.timer = 10;
        this.maxTimer = 10;
        this.timerInterval = null;
        this.onAnswerCallback = null;
        this.hasAnswered = false;

        this.triviaBank = this.initTriviaBank();
        this.setupKeyboardShortcuts();
    }

    setupKeyboardShortcuts() {
        window.addEventListener('keydown', (e) => {
            if (!this.isActive || this.hasAnswered) return;
            const keyMap = {
                'Digit1': 0, 'Numpad1': 0, 'KeyA': 0,
                'Digit2': 1, 'Numpad2': 1, 'KeyB': 1,
                'Digit3': 2, 'Numpad3': 2, 'KeyC': 2,
                'Digit4': 3, 'Numpad4': 3, 'KeyD': 3
            };
            if (e.code in keyMap) {
                e.preventDefault();
                const btns = this.optionsContainer.querySelectorAll('.quiz-opt-btn');
                const idx = keyMap[e.code];
                if (btns[idx]) {
                    btns[idx].click();
                }
            }
        });
    }

    /**
     * Bank Soal IPA, IPS, dan Sejarah (Berbasis Konteks Kalimantan & Nasional)
     */
    initTriviaBank() {
        return {
            ipa: [
                {
                    q: "Bekantan (Nasalis larvatus) adalah primata endemik Kalimantan yang memiliki ciri fisik paling khas berupa...",
                    options: ["Hidung besar dan panjang", "Ekor sangat pendek", "Bulu belang hitam-putih", "Telinga sangat lebar"],
                    answer: 0,
                    topic: "Biologi & Fauna Endemik"
                },
                {
                    q: "Hutan mangrove di muara Sungai Barito memiliki fungsi ekologis utama untuk...",
                    options: ["Mencegah abrasi pantai & ombak", "Menghasilkan kayu bakar komersial", "Mempercepat pendangkalan laut", "Mengurangi populasi ikan"],
                    answer: 0,
                    topic: "Ekosistem Lahan Basah"
                },
                {
                    q: "Makanan utama Bekantan di habitat alaminya sebagian besar terdiri dari...",
                    options: ["Pucuk daun muda & buah mangrove", "Daging ikan dan udang rawa", "Bangkai hewan dan serangga", "Akar rumput dan lumut"],
                    answer: 0,
                    topic: "Ekologi & Nutrisi Hewan"
                },
                {
                    q: "Gas yang dihasilkan oleh tumbuhan hijau dari proses fotosintesis untuk bernapas makhluk hidup adalah...",
                    options: ["Oksigen (O2)", "Karbon Dioksida (CO2)", "Gas Nitrogen (N2)", "Gas Metana (CH4)"],
                    answer: 0,
                    topic: "Fisiologi Tumbuhan"
                },
                {
                    q: "Zat hijau daun yang berfungsi menangkap energi cahaya matahari pada tumbuhan dinamakan...",
                    options: ["Klorofil", "Hemoglobin", "Melanin", "Karoten"],
                    answer: 0,
                    topic: "Biologi Dasar"
                },
                {
                    q: "Berdasarkan jenis makanannya, hewan pemakan tumbuhan seperti Bekantan digolongkan sebagai...",
                    options: ["Herbivora", "Karnivora", "Insektivora", "Piknivora"],
                    answer: 0,
                    topic: "Klasifikasi Makhluk Hidup"
                },
                {
                    q: "Air di muara sungai yang merupakan percampuran antara air tawar dan air laut dinamakan...",
                    options: ["Air Payau", "Air Murni", "Air Belerang", "Air Tanah Dalam"],
                    answer: 0,
                    topic: "Hidrologi Lahan Basah"
                }
            ],
            ips: [
                {
                    q: "Pasar tradisional terapung di atas perahu (jukung) yang terkenal di Kalimantan Selatan berlokasi di...",
                    options: ["Lok Baintan & Muara Kuin", "Danau Toba", "Selat Sunda", "Sungai Musi Palembang"],
                    answer: 0,
                    topic: "Budaya & Geografi Banjar"
                },
                {
                    q: "Kota di Kalimantan Selatan yang dijuluki 'Kota Intan' karena pusat pengasahan batu permata adalah...",
                    options: ["Martapura", "Tanjung", "Pelaihari", "Kandangan"],
                    answer: 0,
                    topic: "Geografi Ekonomi"
                },
                {
                    q: "Sungai terpanjang dan terbesar di Kalimantan Selatan yang menjadi urat nadi perhubungan adalah...",
                    options: ["Sungai Barito", "Sungai Kapuas", "Sungai Mahakam", "Sungai Musi"],
                    answer: 0,
                    topic: "Bentang Alam Nusantara"
                },
                {
                    q: "Kegiatan memanfaatkan dan menjaga kelestarian sumber daya alam agar tidak punah dinamakan...",
                    options: ["Konservasi Lingkungan", "Eksploitasi Tambang", "Deforestasi Hutan", "Industrialisasi Massal"],
                    answer: 0,
                    topic: "Pengelolaan Lingkungan Hidup"
                },
                {
                    q: "Sikap saling membantu dan bekerja sama tanpa pamrih dalam masyarakat Indonesia dikenal dengan istilah...",
                    options: ["Gotong Royong", "Individualisme", "Konsumerisme", "Liberalisme"],
                    answer: 0,
                    topic: "Sosiologi & Nilai Budaya"
                },
                {
                    q: "Pusat pemerintahan administratif Provinsi Kalimantan Selatan saat ini berkedudukan di kota...",
                    options: ["Banjarbaru", "Kotabaru", "Batulicin", "Marabahan"],
                    answer: 0,
                    topic: "Tata Pemerintahan Daerah"
                }
            ],
            sejarah: [
                {
                    q: "Pahlawan Nasional dari Kalimantan Selatan pemimpin Perang Banjar dengan semboyan 'Haram Manyarah Waja Sampai Kaputing' adalah...",
                    options: ["Pangeran Antasari", "Pangeran Diponegoro", "Tuanku Imam Bonjol", "Sultan Hasanuddin"],
                    answer: 0,
                    topic: "Pahlawan Perang Banjar"
                },
                {
                    q: "Kerajaan Islam bersejarah yang pernah berjaya di wilayah Kalimantan Selatan adalah...",
                    options: ["Kesultanan Banjar", "Kesultanan Demak", "Kerajaan Majapahit", "Kesultanan Samudera Pasai"],
                    answer: 0,
                    topic: "Sejarah Kesultanan Nusantara"
                },
                {
                    q: "Raja pertama Kesultanan Banjar yang memeluk agama Islam dan bergelar Sultan Suriansyah adalah...",
                    options: ["Raden Samudera", "Pangeran Hidayatullah", "Kiai Demang Lehman", "Pangeran Tamjidillah"],
                    answer: 0,
                    topic: "Sejarah Banjar"
                },
                {
                    q: "Perang Banjar melawan penjajahan kolonial Belanda pertama kali meletus pada tahun...",
                    options: ["1859", "1908", "1942", "1750"],
                    answer: 0,
                    topic: "Kronik Perjuangan Kemerdekaan"
                },
                {
                    q: "Teks Proklamasi Kemerdekaan Republik Indonesia dibacakan oleh Ir. Soekarno pada tanggal...",
                    options: ["17 Agustus 1945", "1 Juni 1945", "28 Oktober 1928", "10 November 1945"],
                    answer: 0,
                    topic: "Sejarah Nasional Indonesia"
                },
                {
                    q: "Kongres Pemuda II yang melahirkan ikrar persatuan 'Sumpah Pemuda' diselenggarakan pada tahun...",
                    options: ["1928", "1908", "1945", "1935"],
                    answer: 0,
                    topic: "Sejarah Pergerakan Nasional"
                }
            ]
        };
    }

    /**
     * Generator Soal Matematika Perkalian & Pembagian
     */
    generateMathQuestion() {
        const isMultiplication = Math.random() < 0.5;
        let num1, num2, answer, questionText;

        if (isMultiplication) {
            num1 = Math.floor(Math.random() * 9) + 2; // 2 - 10
            num2 = Math.floor(Math.random() * 9) + 2; // 2 - 10
            answer = num1 * num2;
            questionText = `Berapakah hasil dari: ${num1} × ${num2} ?`;
        } else {
            num2 = Math.floor(Math.random() * 8) + 2; // 2 - 9 (pembagi)
            const quotient = Math.floor(Math.random() * 8) + 2; // 2 - 9 (hasil)
            num1 = num2 * quotient; // angka yang dibagi
            answer = quotient;
            questionText = `Berapakah hasil dari: ${num1} ÷ ${num2} ?`;
        }

        // Buat 3 opsi pengecoh yang masuk akal
        const distractors = new Set();
        while (distractors.size < 3) {
            const delta = (Math.floor(Math.random() * 6) + 1) * (Math.random() < 0.5 ? 1 : -1);
            const fake = answer + delta;
            if (fake > 0 && fake !== answer) {
                distractors.add(fake);
            }
        }

        const options = Array.from(distractors);
        const correctIndex = Math.floor(Math.random() * 4);
        options.splice(correctIndex, 0, answer);

        return {
            title: "TANTANGAN BUAH RAMBAI: HITUNG KILAT!",
            badge: isMultiplication ? "Perkalian Dasar" : "Pembagian Dasar",
            badgeClass: "badge-math",
            icon: isMultiplication ? "✖️" : "➗",
            question: questionText,
            options: options.map(o => String(o)),
            correctIndex: correctIndex
        };
    }

    /**
     * Generator Soal Pengetahuan Umum (IPA, IPS, Sejarah)
     */
    generateTriviaQuestion() {
        const categories = ['ipa', 'ips', 'sejarah'];
        const chosenCat = categories[Math.floor(Math.random() * categories.length)];
        const list = this.triviaBank[chosenCat];
        const item = list[Math.floor(Math.random() * list.length)];

        // Acak urutan opsi jawaban
        const rawOptions = item.options.map((text, idx) => ({ text, isCorrect: idx === item.answer }));
        for (let i = rawOptions.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [rawOptions[i], rawOptions[j]] = [rawOptions[j], rawOptions[i]];
        }
        const correctIndex = rawOptions.findIndex(o => o.isCorrect);

        const categoryMeta = {
            ipa: { label: "Kuis IPA (Sains & Biologi Lahan Basah)", class: "badge-ipa", icon: "🌿" },
            ips: { label: "Kuis IPS (Sosial & Geografi Banjar)", class: "badge-ips", icon: "🌍" },
            sejarah: { label: "Kuis Sejarah (Perjuangan & Budaya Banjar)", class: "badge-sejarah", icon: "📜" }
        };

        const meta = categoryMeta[chosenCat];

        return {
            title: `SERANGAN MUSUH! TANGKIS DENGAN KUIS ${chosenCat.toUpperCase()}`,
            badge: `${meta.icon} ${meta.label}`,
            badgeClass: meta.class,
            icon: meta.icon,
            question: item.q,
            options: rawOptions.map(o => o.text),
            correctIndex: correctIndex,
            category: chosenCat
        };
    }

    /**
     * Memulai Kuis Buah (Matematika)
     */
    startFruitQuiz(callback) {
        if (this.isActive) return;
        this.isActive = true;
        this.currentQuizType = 'math';
        this.onAnswerCallback = callback;
        this.hasAnswered = false;

        const data = this.generateMathQuestion();
        this.renderQuiz(data);
    }

    /**
     * Memulai Kuis Musuh (IPA / IPS / Sejarah)
     */
    startEnemyQuiz(enemy, callback) {
        if (this.isActive) return;
        this.isActive = true;
        this.currentQuizType = 'trivia';
        this.onAnswerCallback = callback;
        this.hasAnswered = false;

        const data = this.generateTriviaQuestion();
        this.renderQuiz(data);
    }

    /**
     * Merender Antarmuka Kuis & Menjalankan Timer 10 Detik
     */
    renderQuiz(data) {
        if (this.game.sound) this.game.sound.playQuizPopup();

        // Atur Konten Header
        this.titleText.textContent = data.title;
        this.categoryBadge.textContent = data.badge;
        this.categoryBadge.className = `quiz-category-badge ${data.badgeClass}`;
        this.questionText.textContent = data.question;
        this.feedbackBox.className = 'quiz-feedback hidden';
        this.feedbackBox.textContent = '';

        // Render 4 Tombol Pilihan Jawaban
        this.optionsContainer.innerHTML = '';
        const letters = ['A', 'B', 'C', 'D'];
        data.options.forEach((optText, idx) => {
            const btn = document.createElement('button');
            btn.className = 'quiz-opt-btn';
            btn.innerHTML = `<span class="opt-key">[${idx + 1}]</span> <span class="opt-label">${optText}</span>`;
            btn.addEventListener('click', () => this.handleAnswer(idx, data.correctIndex));
            this.optionsContainer.appendChild(btn);
        });

        // Tampilkan Modal
        this.modal.classList.remove('hidden');

        // Reset & Jalankan Timer 10 Detik
        this.timer = 10;
        this.maxTimer = 10;
        this.updateTimerUI();

        if (this.timerInterval) clearInterval(this.timerInterval);
        this.timerInterval = setInterval(() => {
            this.timer -= 0.1;
            if (this.timer <= 0) {
                this.timer = 0;
                this.updateTimerUI();
                clearInterval(this.timerInterval);
                this.handleTimeout(data.correctIndex);
            } else {
                this.updateTimerUI();
            }
        }, 100);
    }

    updateTimerUI() {
        const pct = Math.max(0, (this.timer / this.maxTimer) * 100);
        this.timerBar.style.width = `${pct}%`;
        this.timerText.textContent = `${Math.ceil(this.timer)}s`;

        // Warna dinamis sesuai sisa waktu
        if (this.timer <= 3.0) {
            this.timerBar.style.backgroundColor = '#FF5252';
            if (this.game.sound && Math.floor(this.timer * 10) % 5 === 0) {
                this.game.sound.playQuizTick();
            }
        } else if (this.timer <= 6.0) {
            this.timerBar.style.backgroundColor = '#FFD600';
        } else {
            this.timerBar.style.backgroundColor = '#00E676';
        }
    }

    /**
     * Penanganan Jawaban Pemain
     */
    handleAnswer(selectedIndex, correctIndex) {
        if (this.hasAnswered) return;
        this.hasAnswered = true;
        clearInterval(this.timerInterval);

        const isCorrect = (selectedIndex === correctIndex);
        const btns = this.optionsContainer.querySelectorAll('.quiz-opt-btn');

        // Beri visual highlight pada opsi
        btns.forEach((btn, idx) => {
            btn.disabled = true;
            if (idx === correctIndex) {
                btn.classList.add('correct');
            } else if (idx === selectedIndex) {
                btn.classList.add('wrong');
            }
        });

        if (isCorrect) {
            if (this.game.sound) this.game.sound.playQuizCorrect();
            this.showFeedback(true, '🎉 JAWABAN BENAR! Luar biasa!');
            setTimeout(() => {
                this.closeQuiz(true);
            }, 850);
        } else {
            if (this.game.sound) this.game.sound.playQuizWrong();
            this.showFeedback(false, '❌ JAWABAN SALAH! Nyawa berkurang -1 💔');
            setTimeout(() => {
                this.closeQuiz(false);
            }, 1000);
        }
    }

    /**
     * Penanganan Jika Waktu 10 Detik Habis
     */
    handleTimeout(correctIndex) {
        if (this.hasAnswered) return;
        this.hasAnswered = true;

        const btns = this.optionsContainer.querySelectorAll('.quiz-opt-btn');
        btns.forEach((btn, idx) => {
            btn.disabled = true;
            if (idx === correctIndex) {
                btn.classList.add('correct');
            }
        });

        if (this.game.sound) this.game.sound.playQuizWrong();
        this.showFeedback(false, '⏱️ WAKTU 10 DETIK HABIS! Nyawa berkurang -1 💔');

        setTimeout(() => {
            this.closeQuiz(false);
        }, 1100);
    }

    showFeedback(isSuccess, message) {
        this.feedbackBox.className = `quiz-feedback ${isSuccess ? 'success' : 'fail'}`;
        this.feedbackBox.textContent = message;
    }

    closeQuiz(success) {
        clearInterval(this.timerInterval);
        this.modal.classList.add('hidden');
        this.isActive = false;

        if (typeof this.onAnswerCallback === 'function') {
            this.onAnswerCallback(success, this.currentQuizType);
        }
    }
}

window.QuizSystem = QuizSystem;
