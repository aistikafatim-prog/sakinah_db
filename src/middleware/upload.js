const multer = require('multer');
const path = require('path');

// 1. Tentukan Lokasi Penyimpanan & Nama File
const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        // Simpan di folder public/uploads
        cb(null, 'public/uploads'); 
    },
    filename: function (req, file, cb) {
        // Buat nama file unik: timestamp + angka acak + ekstensi asli
        // Contoh: 170988999-123.jpg
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
        cb(null, uniqueSuffix + path.extname(file.originalname));
    }
});

// 2. Filter: Hanya boleh upload gambar (jpg, png, jpeg, webp)
const fileFilter = (req, file, cb) => {
    const allowedTypes = /jpeg|jpg|png|webp/;
    const extname = allowedTypes.test(path.extname(file.originalname).toLowerCase());
    const mimetype = allowedTypes.test(file.mimetype);

    if (extname && mimetype) {
        return cb(null, true);
    } else {
        cb(new Error('Hanya diperbolehkan upload file gambar!'));
    }
};

// 3. Inisialisasi Multer
const upload = multer({ 
    storage: storage,
    limits: { fileSize: 5 * 1024 * 1024 }, // Maksimal 5MB per file
    fileFilter: fileFilter
});

module.exports = upload;