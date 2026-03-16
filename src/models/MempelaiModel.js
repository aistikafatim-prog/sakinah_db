const { DataTypes } = require('sequelize');
const db = require('../config/database');

const Mempelai = db.define('mempelai', {
    // Pria
    pria_nama: DataTypes.STRING,
    pria_panggilan: DataTypes.STRING,
    pria_ortu: DataTypes.STRING,
    pria_ig: DataTypes.STRING,
    pria_foto: DataTypes.STRING,
    
    // Wanita
    wanita_nama: DataTypes.STRING,
    wanita_panggilan: DataTypes.STRING,
    wanita_ortu: DataTypes.STRING,
    wanita_ig: DataTypes.STRING,
    wanita_foto: DataTypes.STRING
}, {
    freezeTableName: true
});

module.exports = Mempelai;