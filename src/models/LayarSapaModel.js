const { DataTypes } = require('sequelize');
const db = require('../config/database');

const LayarSapa = db.define('layar_sapa', {
    invitation_id: {
        type: DataTypes.INTEGER,
        allowNull: false
    },
    judul: {
        type: DataTypes.STRING,
        defaultValue: "The Wedding"
    },
    subjudul: {
        type: DataTypes.STRING,
        defaultValue: "Selamat Datang, Tamu Undangan Terhormat"
    },
    gambar_latar: {
        type: DataTypes.STRING,
        defaultValue: null
    }
}, {
    freezeTableName: true
});

module.exports = LayarSapa;