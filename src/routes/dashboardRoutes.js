const express = require('express');
const router = express.Router();
const verifyToken = require('../middleware/verifyToken');

// 1. IMPORT CONTROLLER (Pastikan Huruf Besar/Kecil Sesuai Nama File!)
const DashboardController = require('../controllers/dashboardController');

const TagihanController = require('../controllers/tagihanController'); // <--- Huruf T Besar
const UndanganSayaController = require('../controllers/UndanganSayaController'); // <--- Import Controller Undangan Saya
const upload = require('../middleware/upload');

// === UNDANGAN SAYA ===
router.get('/undangan-saya', verifyToken, UndanganSayaController.getDaftarUndanganSaya); // <--- Route untuk Undangan Saya
// === STATISTIK ===
router.get('/dashboard/stats', verifyToken, DashboardController.getStats);

// === TAGIHAN (Sesuaikan dengan Frontend!) ===
// Ganti '/tagihan' jadi '/billing/history' biar sama kayak frontend
router.get('/billing/history', verifyToken, TagihanController.getRiwayat); // <--- Pakai getRiwayat
// Ganti '/tagihan/create' jadi '/billing/create' biar sama kayak frontend
router.post('/billing/create', verifyToken, TagihanController.createTagihan);
router.post('/billing/pay', verifyToken, TagihanController.bayarTagihan); // <--- Tambahkan route bayar


// 2. Daftarkan rutenya di deretan app.use atau router-mu
// Harus pakai verifyToken agar req.user.id di controller bisa terbaca! 
router.get('/stats', verifyToken, DashboardController.getStats);
///templates



module.exports = router;