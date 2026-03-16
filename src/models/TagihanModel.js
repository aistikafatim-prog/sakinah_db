// src/models/TagihanModel.js
const { DataTypes } = require('sequelize');
const db = require('../config/database'); // <-- Panggil DB langsung (Gaya Lama)

const Tagihan = db.define('tagihan', {
    // Definisi Kolom
    user_id: {
        type: DataTypes.INTEGER,
        allowNull: false
    },
    nama_paket: {
        type: DataTypes.STRING,
        allowNull: false
    },
    jumlah: {
        type: DataTypes.INTEGER,
        allowNull: false
    },
    status: {
        type: DataTypes.ENUM('pending', 'paid', 'failed', 'expired'),
        defaultValue: 'pending'
    },
    payment_method: {
        type: DataTypes.STRING,
        allowNull: true
    },
    payment_date: {
        type: DataTypes.DATE,
        allowNull: true
    }
}, {
    freezeTableName: true
});

module.exports = Tagihan;