const { DataTypes } = require('sequelize');
const db = require('../config/database');

const Invitation = db.define('invitations', {
    // 1. PENGHUBUNG (RELASI)
    user_id: {
        type: DataTypes.INTEGER,
        allowNull: false
    },
    template_id: {
        type: DataTypes.INTEGER,
        allowNull: true // Bisa null kalau belum pilih template spesifik
    },

    // 2. DATA UTAMA
    slug: {
        type: DataTypes.STRING,
        unique: true,
        allowNull: false
    },
    title: {
        type: DataTypes.STRING, 
        defaultValue: "Undangan Pernikahan" // Contoh: "Rara & Romeo"
    },
    event_date: {
        type: DataTypes.DATEONLY, // Format YYYY-MM-DD
        allowNull: true
    },
    status: {
        type: DataTypes.ENUM('active', 'draft', 'expired'),
        defaultValue: 'active'
    },

    // 3. FITUR CUSTOM (Yg sudah kamu buat sebelumnya)
    //theme: { type: DataTypes.STRING },    //tidak ada karena sudah ada template_id
    audio: { type: DataTypes.STRING },      // File lagu
    cover_foto: { type: DataTypes.STRING }  // Foto Sampul

}, {
    freezeTableName: true
});

module.exports = Invitation;