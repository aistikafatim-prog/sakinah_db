const Invitation = require('../models/invitationModel'); 
const Tagihan = require('../models/TagihanModel');
const Ucapan = require('../models/UcapanModel');
// 1. TAMBAHKAN IMPORT MODEL TAMU DI SINI
const Tamu = require('../models/TamuModel'); // Sesuaikan nama file modelmu!

exports.getStats = async (req, res) => {
    try {
        const userId = req.user?.userId || req.user?.id;

        // Hitung Undangan & Tagihan
        const invitationCount = await Invitation.count({ where: { user_id: userId } });
        const pendingBillCount = await Tagihan.count({ where: { user_id: userId, status: 'pending' } });
        
        // 2. LOGIKA HITUNG TOTAL TAMU (ANTI-BADAI)
        // A. Cari dulu semua ID undangan yang dibuat oleh user ini
        const userInvitations = await Invitation.findAll({
            where: { user_id: userId },
            attributes: ['id']
        });
        const invitationIds = userInvitations.map(inv => inv.id);

        // B. Hitung jumlah tamu yang menempel pada ID undangan tersebut
        let tamuCount = 0;
        if (invitationIds.length > 0) {
            tamuCount = await Tamu.count({
                where: { invitation_id: invitationIds }
            });
        }

        res.status(200).json({
            status: 'success',
            data: { 
                undangan: invitationCount, 
                tagihan: pendingBillCount,
                tamu: tamuCount // <--- SEKARANG SUDAH BERISI ANGKA ASLI!
            }
        });
    } catch (error) {
        console.error("Error Dashboard Stats:", error);
        res.status(500).json({ message: 'Error Dashboard Stats' });
    }
};