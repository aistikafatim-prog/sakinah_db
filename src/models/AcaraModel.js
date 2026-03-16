const { DataTypes } = require('sequelize');
const db = require('../config/database');

const Acara = db.define('acara', {
    // Akad
    akad_tanggal: DataTypes.DATEONLY,
    akad_waktu: DataTypes.TIME,
    
    // Resepsi
    resepsi_tanggal: DataTypes.DATEONLY,
    resepsi_waktu: DataTypes.TIME,
    
    // Lokasi Detail
    provinsi: DataTypes.STRING,
    kecamatan: DataTypes.STRING,
    desa: DataTypes.STRING,
    resepsi_lokasi: DataTypes.TEXT, // Alamat Lengkap
    link_streaming: DataTypes.STRING // Contoh: link youtube/instagram
}, {
    freezeTableName: true
});

module.exports = Acara;