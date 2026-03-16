// backend/src/models/TemplateModel.js
const { DataTypes } = require('sequelize');
const db = require('../config/database');

const Template = db.define('templates', {
    // ID otomatis (Auto Increment)
    id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true
    },
    // Nama Template (Misal: Paket Bronze, Aesterplane)
    nama_template: {
        type: DataTypes.STRING(50),
        allowNull: false
    },
    // Harga
    // Tips: Untuk Rupiah, tipe INTEGER lebih aman daripada DECIMAL biar gak ribet koma-koma
    harga: {
        type: DataTypes.INTEGER, 
        defaultValue: 0
    },
    // URL Gambar Thumbnail
    thumbnail_url: {
        type: DataTypes.STRING(255),
        allowNull: true
    },
    // Tipe (Free / Premium)
    tipe: {
        type: DataTypes.ENUM('free', 'premium'),
        defaultValue: 'premium'
    }
}, {
    freezeTableName: true
});

module.exports = Template;