const { DataTypes } = require('sequelize');
const db = require('../config/database');

const Story = db.define('stories', {
    judul: DataTypes.STRING,
    tanggal: DataTypes.DATEONLY,
    deskripsi: DataTypes.TEXT,
    foto: DataTypes.STRING
}, {
    freezeTableName: true
});

module.exports = Story;