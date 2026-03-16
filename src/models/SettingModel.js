const { DataTypes } = require('sequelize');
const db = require('../config/database');

const Setting = db.define('settings', {
    // 1. PENGHUBUNG (RELASI)
    invitation_id: {
        type: DataTypes.INTEGER,
        allowNull: false
    },
    // meta / open graph(untuk share di sosmed)
    share_judul: {
        type: DataTypes.STRING,
        allowNull: true
    },
    share_deskripsi: {
        type: DataTypes.TEXT
    },
    share_gambar: {
        type: DataTypes.STRING
    },
    // fitur sakelar (SEMUANYA HARUS BOOLEAN)
    publikasi: {
        type: DataTypes.BOOLEAN,
        defaultValue: true
    },
    gunakan_pin: {
        type: DataTypes.BOOLEAN,
        defaultValue: false
    },
    // pin_sandi: {
    //     type: DataTypes.STRING
    // },
    putar_musik: {
        type: DataTypes.BOOLEAN,
        defaultValue: true
    },
    tampil_cerita: {
        type: DataTypes.BOOLEAN,
        defaultValue: true
    },
    tampil_kado: {
        type: DataTypes.BOOLEAN,
        defaultValue: true
    },
    tampil_streaming: {
        type: DataTypes.BOOLEAN,
        defaultValue: false
    },
    tampil_bukutamu: {
        type: DataTypes.BOOLEAN,
        defaultValue: true
    }
}, {
    freezeTableName: true,
    timestamps: true // agar tahu kapan terakhir kali diupdate
});

module.exports = Setting;