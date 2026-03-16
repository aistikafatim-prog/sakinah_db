// Buat file baru: backend/src/models/UcapanModel.js
const { DataTypes } = require('sequelize');
const db = require('../config/database');

const Ucapan = db.define('ucapan', {
    nama_pengirim: DataTypes.STRING,
    pesan: DataTypes.TEXT,
    konfirmasi_hadir: { 
        type: DataTypes.ENUM('Hadir', 'Tidak Hadir', 'Masih Ragu'),
        defaultValue: 'Hadir' 
    },
    jumlah_tamu: {
        type: DataTypes.INTEGER,
        defaultValue: 0
    }
}, {
    freezeTableName: true
});

module.exports = Ucapan;