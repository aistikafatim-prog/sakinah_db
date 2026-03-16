const { DataTypes } = require('sequelize');
const sequelize = require('../config/database'); // Sesuaikan dengan path file koneksi database-mu

const Tamu = sequelize.define('Tamu', {
    invitation_id: {
        type: DataTypes.INTEGER,
        allowNull: false
    },
    nama: {
        type: DataTypes.STRING,
        allowNull: false
    }
}, {
    tableName: 'tamu', // Memaksa nama tabel menjadi 'tamu'
    timestamps: true   // Otomatis membuat kolom createdAt dan updatedAt
});

module.exports = Tamu;