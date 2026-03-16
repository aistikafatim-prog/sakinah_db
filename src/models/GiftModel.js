const { DataTypes } = require('sequelize');
const db = require('../config/database');

const Gift = db.define('gifts', {
    // Cashless
    bank_nama: DataTypes.STRING,
    no_rekening: DataTypes.STRING,
    atas_nama: DataTypes.STRING,
    
    // Kirim Kado
    alamat_lengkap: DataTypes.TEXT,
    penerima_paket: DataTypes.STRING
}, {
    freezeTableName: true
});

module.exports = Gift;