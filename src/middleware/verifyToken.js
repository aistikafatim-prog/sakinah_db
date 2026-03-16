const jwt = require('jsonwebtoken');

// Fungsi Satpam Pengecek Tiket
const verifyToken = (req, res, next) => {
    // 1. Cek apakah user membawa 'Header Authorization'?
    // Biasanya formatnya: "Bearer eyJhbGciOiJIUz..."
    const headerToken = req.headers['authorization'];
    
    // 2. Kita ambil kode tokennya saja (buang kata 'Bearer ')
    const token = headerToken && headerToken.split(' ')[1];

    // Jika tidak ada token sama sekali
    if (!token) {
        return res.status(401).json({ pesan: "Akses Ditolak! Mana tiket (token) kamu?" });
    }

    try {
        // 3. Verifikasi Token (Apakah tiket ini asli keluaran admin?)
        // Gunakan 'kunci rahasia' yang SAMA PERSIS dengan di authController
        const verified = jwt.verify(token, process.env.JWT_SECRET || 'rahasia_dapur_sakinah_project');
        
        // 4. Jika Valid, tempelkan data user ke dalam Request (req)
        // Jadi nanti di Controller, kita bisa panggil 'req.user'
        req.user = verified;
        
        // 5. Silakan Lewat! (Lanjut ke Controller)
        next(); 

    } catch (error) {
        res.status(400).json({ pesan: "Tiket tidak valid atau sudah kedaluwarsa!" });
    }
};

module.exports = verifyToken;