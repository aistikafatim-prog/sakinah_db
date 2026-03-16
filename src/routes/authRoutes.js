const express = require('express');
const router = express.Router();

// Panggil Pengendali (Controller) yang tadi kita buat
const authController = require('../controllers/authController');

// === PINTU MASUK AUTH ===

// 1. Jalur untuk Daftar (POST)
// Alamat: http://localhost:5000/api/auth/register
router.post('/register', authController.registrasiAkun);

// 2. Jalur untuk Login (POST)
// Alamat: http://localhost:5000/api/auth/login
router.post('/login', authController.masukAkun);
module.exports = router;