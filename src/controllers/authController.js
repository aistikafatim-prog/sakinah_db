const User = require('../models/UserModel');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');

// ==========================================
// 1. FUNGSI REGISTRASI (DAFTAR AKUN BARU)
// ==========================================
exports.registrasiAkun = async (req, res) => {
    try {
        // 1. Ambil data yang dikirim dari Formulir Pendaftaran
        const { nama_lengkap, email, password } = req.body;

        // 2. Cek dulu: Apakah email ini sudah pernah dipakai?
        const penggunaLama = await User.findOne({ where: { email: email } });
        
        // Jika ketemu (artinya email sudah ada pemiliknya)
        if (penggunaLama) {
            return res.status(400).json({ 
                pesan: "Email ini sudah terdaftar! Silakan gunakan email lain." 
            });
        }

        // 3. Amankan Password (Enkripsi/Hashing)
        // Kita buat 'bumbu' (salt) untuk mengacak password
        const bumbuAcak = await bcrypt.genSalt(10); 
        // Password asli diubah jadi kode acak
        const passwordTerenkripsi = await bcrypt.hash(password, bumbuAcak);

        // 4. Simpan Pengguna Baru ke Database
        const penggunaBaru = await User.create({
            nama_lengkap: nama_lengkap,
            email: email,
            password: passwordTerenkripsi // Simpan yang sudah diacak, JANGAN yang asli
        });

        // 5. Berikan respon sukses
        res.status(201).json({
            pesan: "Alhamdulillah, registrasi berhasil! Silakan login.",
            data: {
                id: penggunaBaru.id,
                nama_lengkap: penggunaBaru.nama_lengkap,
                email: penggunaBaru.email
            }
        });

    } catch (error) {
        console.error("Error saat registrasi:", error);
        res.status(500).json({ pesan: "Gagal mendaftar", error: error.message });
    }
};

// ==========================================
// 2. FUNGSI LOGIN (MASUK & AMBIL TIKET)
// ==========================================
exports.masukAkun = async (req, res) => {
    try {
        // 1. Ambil email dan password yang diketik user
        const { email, password } = req.body;

        // 2. Cari data pengguna berdasarkan email
        const penggunaDitemukan = await User.findOne({ where: { email: email } });

        // Jika email tidak ada di database
        if (!penggunaDitemukan) {
            return res.status(404).json({ pesan: "Email tidak ditemukan/belum terdaftar!" });
        }

        // 3. Cek Password (Bandingkan password ketikan user vs password acak di DB)
        const apakahPasswordCocok = await bcrypt.compare(password, penggunaDitemukan.password);

        // Jika password salah
        if (!apakahPasswordCocok) {
            return res.status(400).json({ pesan: "Password salah, coba ingat-ingat lagi!" });
        }

        // 4. Jika Benar semua, Kita Buatkan 'TIKET MASUK' (Token JWT)
        // Tiket ini berisi ID user, supaya nanti backend tahu siapa yang login
        const dataTiket = {
            userId: penggunaDitemukan.id,
            nama: penggunaDitemukan.nama_lengkap,
            email: penggunaDitemukan.email,
            role: penggunaDitemukan.role
        };

        // Kunci rahasia untuk stempel tiket (Nanti sebaiknya ditaruh di .env)
        const kunciRahasia = process.env.JWT_SECRET ||'rahasia_dapur_sakinah_project'; 

        // Cetak token (Tiket berlaku 1 hari)
        const tokenMasuk = jwt.sign(dataTiket, kunciRahasia, { expiresIn: '1d' });

        // 5. Kirim Tiket ke Frontend
        res.json({
            pesan: "Login berhasil! Selamat datang.",
            token: tokenMasuk, // <--- Ini tiket pentingnya
            user: dataTiket
        });

    } catch (error) {
        console.error("Error saat login:", error);
        res.status(500).json({ pesan: "Gagal login", error: error.message });
    }
};