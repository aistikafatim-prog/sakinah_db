const Tagihan = require('../models/TagihanModel');
const Invitation = require('../models/invitationModel'); // Kita butuh ini untuk cek paket yang dipilih user

// 1. Buat Tagihan (Dipakai di halaman Pilih Template)
exports.createTagihan = async (req, res) => {
    try {
        // CCTV 1: Cek apakah request sampai sini
        console.log("🔥 [DEBUG] Request Masuk ke createTagihan");
        
        // CCTV 2: Cek data yang dikirim Frontend
        console.log("📦 [DEBUG] Data Body:", req.body);
        
        // CCTV 3: Cek apakah User dikenali (Token Valid)
        console.log("👤 [DEBUG] User dari Token:", req.user);

        const userId = req.user?.userId || req.user?.id;
        const { nama_paket, harga } = req.body;

        if (!userId) {
            console.log("❌ [DEBUG] User ID Kosong/Tidak Ditemukan");
            return res.status(401).json({ message: "User tidak dikenali" });
        }

        console.log("🛠️ [DEBUG] Mencoba Simpan ke Database...");

        const newBill = await Tagihan.create({
            user_id: userId,
            nama_paket: nama_paket,
            jumlah: harga,
            status: 'pending',
            payment_method: 'bank_transfer'
        });

        console.log("✅ [DEBUG] Berhasil Simpan Tagihan ID:", newBill.id);

        res.status(201).json({ status: 'success', data: newBill });

    } catch (error) {
        // INI YANG KITA CARI: Error Aslinya
        console.error("💥 [DEBUG] ERROR MELEDAK DISINI:", error); 
        
        res.status(500).json({ 
            message: 'Gagal memproses tagihan',
            error_detail: error.message // Kirim detail error ke frontend juga
        });
    }
};

// 2. Ambil Riwayat (Dipakai di tabel Dashboard & halaman Tagihan)
exports.getRiwayat = async (req, res) => {
    try {
        const userId = req.user?.userId || req.user?.id;
        
        const bills = await Tagihan.findAll({
            where: { user_id: userId },
            order: [['createdAt', 'DESC']]
        });

        res.status(200).json({ status: 'success', data: bills });
    } catch (error) {
        res.status(500).json({ message: 'Gagal ambil riwayat' });
    }
};

// 3. Update Status jadi PAID (Simulasi Bayar)
exports.bayarTagihan = async (req, res) => {
    try {
        const { tagihan_id } = req.body;
        const userId = req.user?.userId || req.user?.id;

        const tagihan = await Tagihan.findByPk(tagihan_id);

        if (!tagihan) return res.status(404).json({ message: "Tagihan tidak ditemukan" });
        if (tagihan.user_id !== userId) return res.status(403).json({ message: "Akses ditolak" });

        // 1. UPDATE STATUS TAGIHAN
        tagihan.status = 'paid';
        tagihan.payment_date = new Date();
        await tagihan.save();

        // ==========================================
        // 2. OTOMATIS BUAT UNDANGAN (THE MAGIC ✨)
        // ==========================================
        
        // Cek dulu, jangan sampai double create kalau user klik bayar 2x
        const existingInv = await Invitation.findOne({ where: { user_id: userId } });
        
        if (!existingInv) {
            // Buat Slug Random (Contoh: wedding-user123-rx7)
            const randomString = Math.random().toString(36).substring(7);
            const autoSlug = `wedding-${userId}-${randomString}`;

            await Invitation.create({
                user_id: userId,
                slug: autoSlug,
                title: "", // Judul Default
                event_date: new Date(),           // Tanggal hari ini dulu
                template_id: 1,                   // Default template dulu
                status: 'active'
            });
            console.log("✅ Undangan otomatis dibuat untuk user:", userId);
        }

        res.status(200).json({
            status: 'success',
            message: 'Pembayaran lunas! Undangan telah dibuat.',
            data: tagihan
        });

    } catch (error) {
        console.error("Error bayar:", error);
        res.status(500).json({ status: 'error', message: 'Gagal memproses pembayaran', error: error.message });
    }
};