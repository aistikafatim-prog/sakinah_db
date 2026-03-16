const { Invitation, Ucapan } = require('../models/Association'); 

// Khusus melayani halaman ManageInvitation.jsx
exports.getStatistik = async (req, res) => {
    try {
        const { slug } = req.params;
        
        // Cek Undangan
        const inv = await Invitation.findOne({ where: { slug } });
        if(!inv) return res.status(404).json({message: "Undangan tidak ditemukan"});

        // 1. Hitung Ucapan
        const totalUcapan = await Ucapan.count({
            where: { invitation_id: inv.id }
        });

        // 2. Hitung Hadir
        const totalHadir = await Ucapan.count({
            where: { 
                invitation_id: inv.id,
                status_kehadiran: "Hadir" 
            }
        });

        // 3. Hitung Tamu (Nanti kalau tabel tamu sudah ada, update di sini)
        const totalTamu = 0; 

        res.json({
            tamu: totalTamu,
            hadir: totalHadir,
            ucapan: totalUcapan
        });

    } catch (error) {
        console.error("Error di KelolaUndangan:", error);
        res.status(500).json({ message: "Gagal ambil statistik" });
    }
};