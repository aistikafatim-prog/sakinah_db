const express = require('express');
const router = express.Router();
const invitationController = require('../controllers/invitationController');
const undanganSayaController = require('../controllers/UndanganSayaController');
const manageInvitationController = require('../controllers/ManageInvitationController');
// 1. Panggil Middleware
const upload = require('../middleware/upload'); 
const verifyToken = require('../middleware/verifyToken');

// 2. Definisi Field Upload
const uploadFields = upload.fields([
    { name: 'cover_foto', maxCount: 1 },
    { name: 'pria_foto', maxCount: 1 },
    { name: 'wanita_foto', maxCount: 1 },
    { name: 'story_foto', maxCount: 10 }
]);

// === DAFTAR PINTU MASUK (URUTAN ITU PENTING!) ===

// 1. Route Khusus (Statis) - TARUH DI ATAS
router.post('/create-slot', verifyToken, invitationController.createEmptySlot); // <-- INI YANG BARU
// router.get('/user/list', verifyToken, undanganSayaController.getDaftarUndanganSaya); // Gunakan UndanganSayaController untuk format yang benar
router.post('/create', verifyToken, uploadFields, invitationController.createInvitation);

// 2. Route Komentar
router.post('/comments/:slug', invitationController.createComment);

// 3. Route Update (Edit)
router.put('/:slug', verifyToken, upload.fields([
    { name: 'cover_foto', maxCount: 1 },
    { name: 'pria_foto', maxCount: 1 },
    { name: 'wanita_foto', maxCount: 1 },
    { name: 'story_foto_0', maxCount: 1 },
    { name: 'story_foto_1', maxCount: 1 },
    { name: 'story_foto_2', maxCount: 1 },
    { name: 'story_foto_3', maxCount: 1 },
    { name: 'story_foto_4', maxCount: 1 }
]), invitationController.updateInvitation);

// 4. Route Dinamis (Slug) - WAJIB TARUH PALING BAWAH
// Kalau ditaruh di atas, kata 'user' atau 'create' akan dianggap sebagai :slug
router.get('/:slug', invitationController.getInvitationBySlug);
// Tambahkan baris ini di bawah rute undangan lainnya
router.put('/:slug/streaming', verifyToken, invitationController.updateStreaming);
// === ROUTE UNTUK DAFTAR TAMU ===
// Jangan lupa gunakan verifyToken agar hanya yang punya akun yang bisa menambah/menghapus
router.get('/:slug/tamu', verifyToken, invitationController.getTamu);
router.post('/:slug/tamu', verifyToken, invitationController.addTamu);
router.delete('/:slug/tamu/:id', verifyToken, invitationController.deleteTamu);
// === ROUTE UNTUK RSVP & UCAPAN ===

// GET & DELETE menggunakan verifyToken karena hanya pengantin/pemilik akun yang boleh melihat dan menghapus di Dashboard
router.get('/:slug/ucapan', verifyToken, invitationController.getUcapan);
router.delete('/:slug/ucapan/:id', verifyToken, invitationController.deleteUcapan);

// 🚨 PENTING: POST TIDAK menggunakan verifyToken! 
// Karena yang mengirim ucapan adalah TAMU (mereka tidak punya akun/token login)
router.post('/:slug/ucapan', invitationController.addUcapan);

// --- ROUTE UNTUK LAYAR SAPA ---
// Untuk dipanggil oleh halaman Scanner & Pratinjau
router.get('/:slug/layar-sapa', invitationController.getLayarSapa);

// Untuk menyimpan dari Dashboard (Gunakan upload.single('gambarLatar') untuk menangkap foto)
router.put('/:slug/layar-sapa', upload.single('gambarLatar'), invitationController.updateLayarSapa);

router.get('/:slug/stats', invitationController.getInvitationStats);
// Tambahkan di deretan router.put atau router.post milikmu
router.put('/:slug/setting', upload.single('share_gambar'), invitationController.updateSetting);
module.exports = router;
