const { Sequelize } = require('sequelize');
require('dotenv').config();

const db = new Sequelize(process.env.DB_NAME || 'sakinah_db', process.env.DB_USER || 'root', process.env.DB_PASS || '', {
    host: process.env.DB_HOST || 'localhost',
    dialect: 'mysql',
    logging: false,
});

module.exports = db;