// backend/src/controllers/UndanganSayaController.js
const { Invitation, Mempelai, Acara } = require('../models/Association');

// Fungsi: Mengambil daftar undangan milik user yang sedang login
exports.getDaftarUndanganSaya = async (req, res) => {
    try {
        const userId = req.user.userId; // Dari token

        // Ambil data undangan + Data Mempelai (untuk judul) + Data Acara (untuk tanggal)
        const daftarUndangan = await Invitation.findAll({
            where: { user_id: userId },
            include: [
                { 
                    model: Mempelai, 
                    attributes: ['pria_panggilan', 'wanita_panggilan', 'pria_nama'] // Ambil yg perlu aja biar ringan
                },
                {
                    model: Acara,
                    attributes: ['resepsi_tanggal'] // Ambil tanggal resepsi
                }
            ],
            order: [['createdAt', 'DESC']] // Yang terbaru paling atas
        });

        // Kita format datanya supaya Frontend enak bacanya (Mapping)
        const hasilFormatted = daftarUndangan.map(item => {
            // Logika Judul: Kalau data mempelai belum diisi, pakai "Draft Undangan"
            let judul = "Draft Undangan";
            if (item.mempelai && item.mempelai.pria_panggilan && item.mempelai.wanita_panggilan) {
                judul = `${item.mempelai.pria_panggilan} & ${item.mempelai.wanita_panggilan}`;
            }

            // Logika Tanggal: Kalau acara belum diisi, pakai tanggal pembuatan
            let tanggal = item.createdAt;
            if (item.acara && item.acara.resepsi_tanggal) {
                tanggal = item.acara.resepsi_tanggal;
            }

            return {
                id: item.id,
                slug: item.slug,     // Penting buat link
                title: judul,        // Sudah diformat
                date: tanggal,       // Sudah diformat
                createdAt: item.createdAt, // Bisa dipakai untuk sorting atau info tambahan
                status: 'Public',    // Atau ambil dari item.status kalau ada kolomnya
                cover: item.cover_foto || null // Foto sampul
            };
        });

        res.status(200).json({
            status: 'success',
            data: hasilFormatted
        });

    } catch (error) {
        console.error("Error di UndanganSayaController:", error);
        res.status(500).json({ message: "Gagal memuat daftar undangan." });
    }
};
//BARU
// 1. GET INVITATIONS BY USER (List Kartu)
// exports.getDaftarUndangan = async (req, res) => {
//     try {
//         const userId = req.user.userId;
//         const invitations = await Invitation.findAll({
//             where: { user_id: userId },
//             include: [
//                 { model: Mempelai, as: 'mempelai' }, 
//                 { model: Acara, as: 'acara' }
//             ],
//             order: [['createdAt', 'DESC']]
//         });
//         res.json(invitations); 
//     } catch (error) {
//         res.status(500).json({ message: "Gagal ambil data" });
//     }
// };

// 2. BUAT SLOT UNDANGAN KOSONG (Tombol + Buat Baru)
// exports.createSlotBaru = async (req, res) => {
//     try {
//         const userId = req.user.userId;
        
//         // Buat Slug Unik Acak
//         const randomString = Math.random().toString(36).substring(7);
//         const uniqueSlug = `wedding-${userId}-${randomString}`;

//         // Buat Undangan Default
//         const newInv = await Invitation.create({
//             user_id: userId,
//             slug: uniqueSlug,
//             theme: 'Gold', 
//             audio: 'default.mp3',
//             status: 'Active'
//         });

//         // Buat Data Mempelai Default
//         await Mempelai.create({
//             invitation_id: newInv.id,
//             pria_nama: "Romeo", 
//             pria_panggilan: "Romeo",
//             wanita_nama: "Juliet", 
//             wanita_panggilan: "Juliet"
//         });

//         // Buat Data Acara Default
//         await Acara.create({
//             invitation_id: newInv.id,
//             resepsi_tanggal: new Date()
//         });

//         res.status(201).json({ message: "Slot Undangan Berhasil Dibuat!", data: newInv });

//     } catch (error) {
//         console.error("Gagal buat slot:", error);
//         res.status(500).json({ message: "Gagal memproses pembuatan slot" });
//     }
// };