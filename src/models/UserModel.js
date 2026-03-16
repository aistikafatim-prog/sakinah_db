const { DataTypes } = require('sequelize');
const db = require('../config/database');

const User = db.define('user', {
    nama_lengkap: {
        type: DataTypes.STRING,
        allowNull: false
    },
    email: {
        type: DataTypes.STRING,
        allowNull: false,
        unique: true // Email tidak boleh kembar
    },
    password: {
        type: DataTypes.STRING,
        allowNull: false
    },
    role: {
        type: DataTypes.ENUM('admin', 'member'), // Hanya menerima 2 nilai ini secara ketat
        defaultValue: 'member', // Jika tidak diisi di form, otomatis dikunci sebagai 'member'
        allowNull: false
    }
    
}, {
    // freezeTableName: true
});

module.exports = User;
