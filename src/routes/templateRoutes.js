const express = require('express');
const router = express.Router();
const verifyToken = require('../middleware/verifyToken');
const TemplateController = require('../controllers/TemplateController');
const upload = require('../middleware/upload'); // Middleware untuk upload file (gambar)

// === TEMPLATE ===

// --- PINTU PUBLIK (Tanpa Gembok) ---
// Digunakan oleh Landing Page (Tema.jsx)
// Menjadi: http://localhost:5000/api/templates/public
router.get('/public', TemplateController.getTemplates);

// --- PINTU KHUSUS ADMIN / MEMBER (Pakai Gembok) ---
// Digunakan oleh Dashboard Admin untuk melihat data
// Menjadi: http://localhost:5000/api/templates
router.get('/', verifyToken, TemplateController.getTemplates);

// Digunakan untuk MENAMBAH template baru
// Menjadi: http://localhost:5000/api/templates
router.post('/', verifyToken, upload.single('thumbnail'), TemplateController.createTemplate);

// Digunakan untuk MENGHAPUS template
// Menjadi: http://localhost:5000/api/templates/123
router.delete('/:id', verifyToken, TemplateController.deleteTemplate);
// Di dalam TemplateRoutes.js
// Tambahkan baris ini di bawah rute POST dan GET yang sudah ada:

// Digunakan untuk MENGUPDATE template
// Menjadi: http://localhost:5000/api/templates/123
router.put('/:id', verifyToken, upload.single('thumbnail'), TemplateController.updateTemplate);
module.exports = router;