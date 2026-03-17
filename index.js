const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const path = require('path');
// === PERBAIKAN JALUR IMPORT ===

// 1. Masuk ke folder src -> config -> database
const db = require('./src/config/database'); 

// 2. Masuk ke folder src -> models -> Association
// (Pastikan file InvitationModel.js sudah direname jadi huruf besar ya!)
const { User, Invitation, Mempelai, Acara, Story, Gift, Ucapan} = require('./src/models/Association');

// 3. Panggil Routes (Arahkan ke dalam src juga)
const invitationRoutes = require('./src/routes/invitationsRoutes'); 
// (Catatan: Pastikan nama file di folder routes adalah 'invitationsRoutes.js' atau sesuaikan)
const authRoutes = require('./src/routes/authRoutes');
const dashboardRoutes = require('./src/routes/dashboardRoutes');
const templateRoutes = require('./src/routes/templateRoutes'); // <--- Import route untuk template
dotenv.config();
const app = express();
const port = process.env.PORT || 5000;

app.use(cors());
app.use(express.json());

// Alamatnya nanti: http://localhost:5000/uploads/namafoto.jpg
app.use('/uploads', express.static(path.join(__dirname, 'public/uploads')));

// === Cek Koneksi & Generate Tabel ===
(async () => {
    try {
        await db.authenticate();
        console.log('✅ Database Connected!');
        //await db.sync({alter : true }); 
        console.log('✅ Tabel Berhasil Sinkron!');
    } catch (error) {
        console.error('❌ Gagal Konek Database:', error);
    }
})();

// === Routes ===
app.use('/api/auth', authRoutes);
app.use('/api/invitation', invitationRoutes);
app.use('/api', dashboardRoutes);
app.use('/api/templates', templateRoutes); // <--- Daftarkan route untuk template

// Test Route
app.get('/', (req, res) => {
    res.send('Server Sakinah Project Jalan!');
});

app.listen(port, () => {
    console.log(`Server running on port ${port}`);
});
console.log("DB_HOST:", process.env.DB_HOST);
