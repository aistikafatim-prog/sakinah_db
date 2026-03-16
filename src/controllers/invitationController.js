const { Invitation, Mempelai, Acara, Story, Gift, Ucapan, Tamu, LayarSapa, Setting } = require('../models/Association');
const db = require('../config/database'); 

// =======================================================
// 1. CREATE INVITATION (BUAT UNDANGAN BARU)
// =======================================================
exports.createInvitation = async (req, res) => {
    // Mulai Transaksi Database
    const t = await db.transaction();

    try {
        console.log("BODY REQ:", req.body);

        // 1. Ambil Data dari Body
        let { 
            slug, theme, audio, paket,
            pria,    // Object { nama, panggilan, ortu, ig } or JSON string
            wanita,  // Object { nama, panggilan, ortu, ig } or JSON string
            acara,   // Object { akadTanggal, dll } or JSON string
            gift,    // Object { bank, norek, dll } or JSON string
        } = req.body;

        // Helper: jika field datang sebagai JSON string (karena multipart/form-data), parse
        const parseIfString = (v) => {
            if (v === undefined || v === null) return v;
            if (typeof v === 'string') {
                try {
                    return JSON.parse(v);
                } catch (e) {
                    return v;
                }
            }
            return v;
        };

        pria = parseIfString(pria);
        wanita = parseIfString(wanita);
        acara = parseIfString(acara);
        gift = parseIfString(gift);
        // --- TAMBAHKAN LOG INI UNTUK DEBUGGING ---
        console.log("==== HASIL PARSING ====");
        console.log("TYPE PRIA:", typeof pria); 
        console.log("DATA PRIA:", pria);
        console.log("DATA WANITA:", wanita);
        console.log("DATA ACARA:", acara);
        console.log("=======================");

        const user_id = req.user.userId; 

        // 2. Helper Ambil Nama File (Single File)
        const getFilename = (fieldName) => {
            return (req.files && req.files[fieldName]) ? req.files[fieldName][0].filename : null;
        };

        // 3. Cek Slug Unik
        const existing = await Invitation.findOne({ where: { slug } });
        if (existing) {
            await t.rollback(); 
            return res.status(400).json({ message: "Link undangan ini sudah dipakai!" });
        }

        // 4. SIMPAN KE DATABASE (Tabel Induk: Invitation)
        const newInvitation = await Invitation.create({
            user_id,
            slug,
            theme: theme || 'dandelion', 
            audio,
            status: 'Active',
            cover_foto: getFilename('cover_foto')
        }, { transaction: t });

        const invitationId = newInvitation.id;

        // 5. SIMPAN DATA MEMPELAI
        await Mempelai.create({
            invitation_id: invitationId,
            pria_nama: pria?.nama,
            pria_panggilan: pria?.panggilan,
            pria_ortu: pria?.ortu,
            pria_ig: pria?.ig,
            pria_foto: getFilename('pria_foto'),

            wanita_nama: wanita?.nama,
            wanita_panggilan: wanita?.panggilan,
            wanita_ortu: wanita?.ortu,
            wanita_ig: wanita?.ig,
            wanita_foto: getFilename('wanita_foto')
        }, { transaction: t });

        // 6. SIMPAN DATA ACARA
        await Acara.create({
            invitation_id: invitationId,
            akad_tanggal: acara?.akadTanggal,
            akad_waktu: acara?.akadWaktu,
            resepsi_tanggal: acara?.resepsiTanggal,
            resepsi_waktu: acara?.resepsiWaktu,
            provinsi: acara?.provinsi,
            kecamatan: acara?.kecamatan,
            desa: acara?.desa,
            resepsi_lokasi: acara?.resepsiLokasi,
            link_streaming: acara?.link_streaming
        }, { transaction: t });

        // 7. SIMPAN DATA GIFT (AMPLOP)
        if (gift) {
            await Gift.create({
                invitation_id: invitationId,
                bank_nama: gift.bank,
                no_rekening: gift.norek,
                atas_nama: gift.an,
                alamat_lengkap: gift.alamat,
                penerima_paket: gift.penerima
            }, { transaction: t });
        }

        // 8. SIMPAN STORIES (LOGIKA BARU: ARRAY STORY_FOTO)
        if (req.body.stories_json) {
            let storiesArray = [];
            try {
                storiesArray = JSON.parse(req.body.stories_json);
            } catch (e) {
                console.error("Error parsing stories JSON", e);
                storiesArray = [];
            }
            
            // Ambil semua file yang masuk lewat pintu 'story_foto'
            // Multer akan memberikannya dalam bentuk Array jika nama fieldnya sama
            let uploadedFiles = [];
            if (req.files && req.files['story_foto']) {
                uploadedFiles = req.files['story_foto'];
            }
            
            // Mapping Data
            const storiesToSave = storiesArray.map((story, index) => {
                // Ambil file sesuai urutan index
                const fileData = uploadedFiles[index]; 
                const filename = fileData ? fileData.filename : null; 

                return {
                    invitation_id: invitationId,
                    judul: story.judul,
                    tanggal: story.tanggal,
                    deskripsi: story.deskripsi,
                    foto: filename 
                };
            });

            // Simpan sekaligus banyak (Bulk Create)
            if (storiesToSave.length > 0) {
                await Story.bulkCreate(storiesToSave, { transaction: t });
            }
        }

        // 9. COMMIT TRANSAKSI
        await t.commit();

        res.status(201).json({ 
            success: true,
            message: "Undangan berhasil dibuat!", 
            data: newInvitation 
        });

    } catch (error) {
        // 10. ROLLBACK JIKA ERROR
        await t.rollback();
        console.error("Error Create Invitation:", error);
        res.status(500).json({ message: "Gagal membuat undangan", error: error.message });
    }
};

// =======================================================
// 2. GET INVITATION BY SLUG
// =======================================================
exports.getInvitationBySlug = async (req, res) => {
    try {
        const { slug } = req.params;

        const invitation = await Invitation.findOne({
            where: { slug },
            include: [
                { model: Mempelai, as: 'mempelai' },
                { model: Acara, as: 'acara' },
                { model: Gift, as: 'gift' },
                { model: Story, as: 'stories' },
                { model: Setting, as: 'setting' },
                
            ]
        });

        if (!invitation) {
            return res.status(404).json({ message: "Undangan tidak ditemukan" });
        }

        res.json(invitation);

    } catch (error) {
        console.error(error);
        res.status(500).json({ message: "Terjadi kesalahan server", error: error.message });
    }
};

// =======================================================
// 3. UPDATE INVITATION
// =======================================================
exports.updateInvitation = async (req, res) => {
    try {
        const { slug } = req.params;
        const userId = req.user.userId;

        const invitation = await Invitation.findOne({
            where: { slug },
            include: [
                { model: Mempelai, as: 'mempelai' }, 
                { model: Acara, as: 'acara' },
                { model: Gift, as: 'gift' },
                { model: Story, as: 'stories' }
            ]
        });

        if (!invitation) return res.status(404).json({ message: "Undangan tidak ditemukan" });
        if (invitation.user_id !== userId) return res.status(403).json({ message: "Akses ditolak" });

        const { 
            theme, audio, 
            pria_nama, pria_panggilan, pria_ortu, pria_ig,
            wanita_nama, wanita_panggilan, wanita_ortu, wanita_ig,
            akad_tanggal, akad_waktu, resepsi_tanggal, resepsi_waktu,
            provinsi, kecamatan, desa, resepsi_lokasi, link_streaming,
            gifts_json, stories_json 
        } = req.body;

        const getFile = (fieldname) => {
            return (req.files && req.files[fieldname]) ? req.files[fieldname][0].filename : undefined;
        };

        // 1. UPDATE DATA INDUK
        await invitation.update({
            theme: theme || invitation.theme,
            audio: audio || invitation.audio,
            cover_foto: getFile('cover_foto') || invitation.cover_foto
        });

        // 2. UPDATE / CREATE MEMPELAI
        if (invitation.mempelai) {
            await invitation.mempelai.update({
                pria_nama, pria_panggilan, pria_ortu, pria_ig,
                wanita_nama, wanita_panggilan, wanita_ortu, wanita_ig,
                pria_foto: getFile('pria_foto') || invitation.mempelai.pria_foto,
                wanita_foto: getFile('wanita_foto') || invitation.mempelai.wanita_foto
            });
        } else {
            await Mempelai.create({
                invitation_id: invitation.id,
                pria_nama, pria_panggilan, pria_ortu, pria_ig,
                wanita_nama, wanita_panggilan, wanita_ortu, wanita_ig,
                pria_foto: getFile('pria_foto'),
                wanita_foto: getFile('wanita_foto')
            });
        }

        // 3. UPDATE / CREATE ACARA
        if (invitation.acara) {
            await invitation.acara.update({
                akad_tanggal, akad_waktu, resepsi_tanggal, resepsi_waktu,
                provinsi, kecamatan, desa, resepsi_lokasi, link_streaming
            });
        } else {
            await Acara.create({
                invitation_id: invitation.id,
                akad_tanggal, akad_waktu, resepsi_tanggal, resepsi_waktu,
                provinsi, kecamatan, desa, resepsi_lokasi, link_streaming
            });
        }

        // 4. UPDATE / CREATE GIFT
        if (gifts_json) {
            try {
                const parsedGift = JSON.parse(gifts_json);
                if (invitation.gift) {
                    await invitation.gift.update({
                        bank_nama: parsedGift.bank,
                        no_rekening: parsedGift.norek,
                        atas_nama: parsedGift.an,
                        alamat_lengkap: parsedGift.alamat,
                        penerima_paket: parsedGift.penerima
                    });
                } else {
                    await Gift.create({
                        invitation_id: invitation.id,
                        bank_nama: parsedGift.bank,
                        no_rekening: parsedGift.norek,
                        atas_nama: parsedGift.an,
                        alamat_lengkap: parsedGift.alamat,
                        penerima_paket: parsedGift.penerima
                    });
                }
            } catch (err) {
                console.error("Gagal parse gifts_json:", err);
            }
        }

        // 5. UPDATE / CREATE STORY
        if (stories_json) {
            try {
                const storiesArray = JSON.parse(stories_json);
                
                // Ambil data cerita lama sebelum dihapus
                const oldStories = await Story.findAll({ 
                    where: { invitation_id: invitation.id },
                    order: [['id', 'ASC']] // Pastikan urutannya konsisten
                });
                
                await Story.destroy({ where: { invitation_id: invitation.id } });
                
                const newStories = storiesArray.map((story, index) => {
                    const fileKey = `story_foto_${index}`;
                    const newFilename = (req.files && req.files[fileKey]) ? req.files[fileKey][0].filename : null;
                    const oldFilename = oldStories[index] ? oldStories[index].foto : null;

                    return {
                        invitation_id: invitation.id,
                        judul: story.judul,
                        tanggal: story.tanggal,
                        deskripsi: story.deskripsi,
                        foto: newFilename || oldFilename 
                    };
                });

                if(newStories.length > 0) await Story.bulkCreate(newStories);
            } catch (err) {
                console.error("Gagal parse stories_json:", err);
            }
        }

        res.status(200).json({ message: "Undangan berhasil diperbarui!", slug: invitation.slug });

    } catch (error) {
        console.error("Error update:", error);
        res.status(500).json({ message: "Gagal update undangan" });
    }
};
// =======================================================
// 4. CREATE COMMENT
// =======================================================
exports.createComment = async (req, res) => {
    try {
        const { slug } = req.params;
        const { nama, ucapan, status_kehadiran, jumlah_tamu } = req.body;

        const inv = await Invitation.findOne({ where: { slug } });
        if (!inv) return res.status(404).json({ message: "Undangan tidak ditemukan" });

        const newUcapan = await Ucapan.create({
            invitation_id: inv.id,
            nama, 
            ucapan, 
            status_kehadiran, 
            jumlah_tamu
        });

        res.status(201).json({ message: "Ucapan berhasil dikirim!", data: newUcapan });

    } catch (error) {
        console.error("Error create comment:", error);
        res.status(500).json({ message: "Gagal kirim ucapan" });
    }
};

// =======================================================
// 5. GET INVITATIONS BY USER
// =======================================================
exports.getInvitationsByUser = async (req, res) => {
    try {
        const userId = req.user.userId;
        const invitations = await Invitation.findAll({
            where: { user_id: userId },
            include: [
                { model: Mempelai, as: 'mempelai' }, 
                { model: Acara, as: 'acara' }
            ],
            order: [['createdAt', 'DESC']]
        });
        res.json(invitations); 
    } catch (error) {
        res.status(500).json({ message: "Gagal ambil data" });
    }
};

// =======================================================
// 6. BUAT SLOT UNDANGAN KOSONG (Simulasi Bab 3: Payment Success)
// =======================================================
exports.createEmptySlot = async (req, res) => {
    try {
        const userId = req.user.userId;
        
        // 1. Buat Slug Unik Acak (Supaya tidak bentrok)
        const randomString = Math.random().toString(36).substring(7);
        const uniqueSlug = `wedding-${userId}-${randomString}`;

        // 2. Buat Undangan dengan Data Default 
        const newInv = await Invitation.create({
            user_id: userId,
            slug: uniqueSlug,
            theme: 'Gold', // Default tema
            audio: 'default.mp3',
            status: 'Active'
        });

        // 3. Buat Data Mempelai Default (PENTING AGAR TIDAK ERROR SAAT DITAMPILKAN)
        await Mempelai.create({
            invitation_id: newInv.id,
                pria_nama: null,
                pria_panggilan: null,
                pria_ortu: null,
                pria_ig: null,
                wanita_nama: null,
                wanita_panggilan: null,
                wanita_ortu: null,
                wanita_ig: null
        });

        // 4. Buat Data Acara Default
        await Acara.create({
            invitation_id: newInv.id,
            resepsi_tanggal: null // Tanggal hari ini
        });

        res.status(201).json({ message: "Slot Undangan Berhasil Dibuat!", data: newInv });

    } catch (error) {
        console.error("Gagal buat slot:", error);
        res.status(500).json({ message: "Gagal memproses pembayaran/pembuatan slot" });
    }
};

// === FUNGSI UPDATE STREAMING ===
// === FUNGSI UPDATE STREAMING (HANYA SIMPAN LINK KE TABEL ACARA) ===
exports.updateStreaming = async (req, res) => {
    try {
        const { slug } = req.params;
        const { link_streaming } = req.body; // Kita abaikan platform & judul dari React
        const userId = req.user.userId; 

        // 1. Cari undangan berdasarkan slug
        const invitation = await Invitation.findOne({ where: { slug } });
        if (!invitation) return res.status(404).json({ message: "Undangan tidak ditemukan." });

        // 2. Keamanan: Pastikan yang mengedit adalah pemilik aslinya
        if (invitation.user_id !== userId) return res.status(403).json({ message: "Akses ditolak." });

        // 3. Simpan ke Tabel Acara
        const acaraData = await Acara.findOne({ where: { invitation_id: invitation.id } });

        if (acaraData) {
            // Jika data acara sudah ada, kita UPDATE hanya link_streaming-nya
            await acaraData.update({
                link_streaming: link_streaming
            });
        } else {
            // Jika data acara belum ada, kita CREATE
            await Acara.create({
                invitation_id: invitation.id,
                link_streaming: link_streaming
            });
        }

        res.status(200).json({ 
            status: "success",
            message: "Link streaming berhasil disimpan di tabel Acara!" 
        });

    } catch (error) {
        console.error("Error saat menyimpan streaming:", error);
        res.status(500).json({ message: "Terjadi kesalahan pada server saat menyimpan data." });
    }
};


// ==========================================
// FUNGSI UNTUK BUKU TAMU (DAFTAR NAMA TAMU)
// ==========================================

// 1. Mengambil Daftar Tamu (GET)
exports.getTamu = async (req, res) => {
    try {
        const { slug } = req.params;
        
        // Cari ID undangan berdasarkan slug
        const invitation = await Invitation.findOne({ where: { slug } });
        if (!invitation) return res.status(404).json({ message: "Undangan tidak ditemukan." });

        // Ambil semua tamu yang punya invitation_id tersebut
        const daftarTamu = await Tamu.findAll({ 
            where: { invitation_id: invitation.id },
            order: [['createdAt', 'DESC']] // Urutkan dari yang terbaru ditambahkan
        });

        res.status(200).json(daftarTamu);
    } catch (error) {
        console.error("Error getTamu:", error);
        res.status(500).json({ message: "Terjadi kesalahan server saat mengambil data tamu." });
    }
};

// 2. Menambah Tamu Baru (POST)
// === MENAMBAH TAMU BARU ===
exports.addTamu = async (req, res) => {
    console.log("\n=== API ADD TAMU TERPANGGIL ==="); // RADAR A
    console.log("Data yang masuk (req.body):", req.body); 
    console.log("Slug undangan (req.params.slug):", req.params.slug);

    try {
        const { slug } = req.params;
        const { nama } = req.body;

        if (!nama) {
            console.log("❌ GAGAL: Nama kosong");
            return res.status(400).json({ message: "Nama tamu wajib diisi." });
        }

        const invitation = await Invitation.findOne({ where: { slug } });
        if (!invitation) {
            console.log("❌ GAGAL: Undangan tidak ditemukan dengan slug:", slug);
            return res.status(404).json({ message: "Undangan tidak ditemukan." });
        }
        
        console.log("✅ Undangan ditemukan, ID-nya adalah:", invitation.id);

        const tamuBaru = await Tamu.create({
            invitation_id: invitation.id,
            nama: nama
        });
        
        console.log("✅ BERHASIL DISIMPAN KE MYSQL:", tamuBaru.toJSON()); // RADAR B
        
        res.status(201).json(tamuBaru);
    } catch (error) {
        console.error("❌ ERROR SAAT CREATE KE MYSQL:", error.message); // RADAR C
        res.status(500).json({ message: "Terjadi kesalahan server saat menambah tamu." });
    }
};

// 3. Menghapus Tamu (DELETE)
// === MENGHAPUS TAMU (DELETE) ===
exports.deleteTamu = async (req, res) => {
    console.log("\n=== API DELETE TAMU TERPANGGIL ===");
    console.log("ID tamu yang mau dihapus (req.params.id):", req.params.id);

    try {
        const { id } = req.params; 

        // Cari tamu di database
        const tamu = await Tamu.findByPk(id);
        
        if (!tamu) {
            console.log("❌ GAGAL: Data tamu tidak ditemukan di database dengan ID:", id);
            return res.status(404).json({ message: "Data tamu tidak ditemukan." });
        }

        // Hancurkan data dari tabel
        await tamu.destroy();
        console.log("✅ BERHASIL: Tamu dihapus dari tabel MySQL!");
        
        res.status(200).json({ message: "Tamu berhasil dihapus." });
    } catch (error) {
        console.error("❌ ERROR MYSQL SAAT MENGHAPUS:", error.message);
        res.status(500).json({ message: "Terjadi kesalahan server saat menghapus tamu." });
    }
};
// ==========================================
// FUNGSI UNTUK RSVP & UCAPAN
// ==========================================

// 1. Mengambil Daftar Ucapan (GET) - Dipakai di Dashboard
exports.getUcapan = async (req, res) => {
    try {
        const { slug } = req.params;
        
        const invitation = await Invitation.findOne({ where: { slug } });
        if (!invitation) return res.status(404).json({ message: "Undangan tidak ditemukan." });

        const daftarUcapan = await Ucapan.findAll({ 
            where: { invitation_id: invitation.id },
            order: [['createdAt', 'DESC']] // Urutkan dari yang terbaru (di atas)
        });

        res.status(200).json(daftarUcapan);
    } catch (error) {
        console.error("Error getUcapan:", error);
        res.status(500).json({ message: "Terjadi kesalahan server." });
    }
};

// 2. Menghapus Ucapan (DELETE) - Dipakai di Dashboard
exports.deleteUcapan = async (req, res) => {
    try {
        const { id } = req.params; 

        const ucapan = await Ucapan.findByPk(id);
        if (!ucapan) return res.status(404).json({ message: "Data ucapan tidak ditemukan." });

        await ucapan.destroy();
        res.status(200).json({ message: "Ucapan berhasil dihapus." });
    } catch (error) {
        console.error("Error deleteUcapan:", error);
        res.status(500).json({ message: "Terjadi kesalahan server." });
    }
};

// 3. Menambah Ucapan Baru (POST)
exports.addUcapan = async (req, res) => {
    try {
        const { slug } = req.params;
        // Tangkap data dengan nama variabel yang sama dengan kolom database
        const { nama_pengirim, pesan, konfirmasi_hadir, jumlah_tamu } = req.body;

        const invitation = await Invitation.findOne({ where: { slug } });
        if (!invitation) return res.status(404).json({ message: "Undangan tidak ditemukan." });

        const ucapanBaru = await Ucapan.create({
            invitation_id: invitation.id,
            nama_pengirim: nama_pengirim, // Sesuai model
            pesan: pesan,                 // Sesuai model
            konfirmasi_hadir: konfirmasi_hadir, // 'Hadir', 'Tidak Hadir', atau 'Masih Ragu'
            jumlah_tamu: jumlah_tamu || 0 // Default 0 jika tidak disertakan
        });

        res.status(201).json(ucapanBaru);
    } catch (error) {
        console.error("Error addUcapan:", error);
        res.status(500).json({ message: "Terjadi kesalahan server saat mengirim ucapan." });
    }
};
// 1. Mengambil Pengaturan Layar Sapa (GET)
exports.getLayarSapa = async (req, res) => {
    try {
        const { slug } = req.params;
        const invitation = await Invitation.findOne({ where: { slug } });
        if (!invitation) return res.status(404).json({ message: "Undangan tidak ditemukan." });

        // Cari pengaturan di tabel layar_sapa
        let sapa = await LayarSapa.findOne({ where: { invitation_id: invitation.id } });

        // Jika user belum pernah mengatur (data belum ada di tabel), kirim nilai default
        if (!sapa) {
            return res.status(200).json({
                judul: "The Wedding",
                subjudul: "Selamat Datang, Tamu Undangan Terhormat",
                gambarLatar: "https://images.unsplash.com/photo-1511795409834-ef04bbd61622?auto=format&fit=crop&w=1200&q=80"
            });
        }

        // Jika sudah ada, kirim data dari database
        res.status(200).json({
            judul: sapa.judul,
            subjudul: sapa.subjudul,
            gambarLatar: sapa.gambar_latar ? `http://localhost:5000/uploads/${sapa.gambar_latar}` : "https://images.unsplash.com/photo-1511795409834-ef04bbd61622?auto=format&fit=crop&w=1200&q=80"
        });
    } catch (error) {
        console.error("Error getLayarSapa:", error);
        res.status(500).json({ message: "Terjadi kesalahan server." });
    }
};

// 2. Menyimpan Pengaturan Layar Sapa (PUT)
exports.updateLayarSapa = async (req, res) => {
    try {
        const { slug } = req.params;
        const { judul, subjudul } = req.body;
        
        const invitation = await Invitation.findOne({ where: { slug } });
        if (!invitation) return res.status(404).json({ message: "Undangan tidak ditemukan." });

        // Cek apakah data sapa sudah ada di tabel
        let sapa = await LayarSapa.findOne({ where: { invitation_id: invitation.id } });

        // Jika belum ada, buat baris baru (Create)
        if (!sapa) {
            sapa = await LayarSapa.create({
                invitation_id: invitation.id,
                judul: judul || "The Wedding",
                subjudul: subjudul || "Selamat Datang"
            });
        } else {
            // Jika sudah ada, cukup update data yang ada (Update)
            if (judul) sapa.judul = judul;
            if (subjudul) sapa.subjudul = subjudul;
        }

        // Proses gambar jika ada yang diupload via Multer
        if (req.file) {
            sapa.gambar_latar = req.file.filename;
        }

        await sapa.save();
        res.status(200).json({ message: "Pengaturan Layar Sapa berhasil disimpan!" });
    } catch (error) {
        console.error("Error updateLayarSapa:", error);
        res.status(500).json({ message: "Gagal menyimpan pengaturan." });
    }
};

exports.getInvitationStats = async (req, res) => {
    try {
        const { slug } = req.params;
        
        // 1. Cari ID undangannya
        const invitation = await Invitation.findOne({ where: { slug } });
        if (!invitation) return res.status(404).json({ message: "Undangan tidak ditemukan" });

        // 2. Hitung Total Tamu (Dari daftar nama di tabel Tamu)
        const totalTamu = await Tamu.count({ 
            where: { invitation_id: invitation.id } 
        });

        // 3. Hitung Tamu yang Hadir (Dari konfirmasi RSVP di tabel Ucapan)
        // Kita hitung berapa banyak orang yang memilih 'Hadir'
        const tamuHadir = await Ucapan.count({ 
            where: { 
                invitation_id: invitation.id,
                konfirmasi_hadir: 'Hadir' // Sesuai dengan ENUM di model Ucapan
            } 
        });

        // 💡 BONUS: Jika kamu ingin menghitung TOTAL KEPALA (jumlah orang) yang hadir 
        // berdasarkan inputan 'jumlah_tamu', kamu bisa pakai rumus SUM ini (hapus tanda // di bawahnya):
        const totalKepalaHadir = await Ucapan.sum('jumlah_tamu', { 
            where: { invitation_id: invitation.id, konfirmasi_hadir: 'Hadir' } 
        }) || 0;

        // 4. Hitung Total Ucapan (Semua pesan yang masuk, apapun konfirmasinya)
        const totalUcapan = await Ucapan.count({ 
            where: { invitation_id: invitation.id } 
        });

        // 5. Kirim hasilnya ke React
        res.status(200).json({
            totalTamu: totalTamu,
            tamuHadir: totalKepalaHadir, // (Ganti jadi totalKepalaHadir jika pakai rumus SUM di atas)
            totalUcapan: totalUcapan
        });

    } catch (error) {
        console.error("Error getInvitationStats:", error);
        res.status(500).json({ message: "Gagal menghitung statistik." });
    }
};
// Fungsi Menyimpan Pengaturan Undangan (PUT)

// =========================================================
// FUNGSI UPDATE PENGATURAN (PUT) - VERSI TANPA PIN
// =========================================================
exports.updateSetting = async (req, res) => {
    try {
        const { slug } = req.params;
        
        const { 
            slug_baru, share_judul, share_deskripsi, 
            publikasi, putar_musik, tampil_cerita,
            tampil_kado, tampil_streaming, tampil_bukutamu 
        } = req.body;
        
        const invitation = await Invitation.findOne({ where: { slug } });
        if (!invitation) return res.status(404).json({ message: "Undangan tidak ditemukan." });

        if (slug_baru && slug_baru !== slug) {
            const cekSlug = await Invitation.findOne({ where: { slug: slug_baru } });
            if (cekSlug) return res.status(400).json({ message: "URL / Slug sudah dipakai orang lain." });
            invitation.slug = slug_baru;
            await invitation.save(); 
        }

        let setting = await Setting.findOne({ where: { invitation_id: invitation.id } });

        if (!setting) {
            setting = await Setting.create({
                invitation_id: invitation.id,
                share_judul: share_judul,
                share_deskripsi: share_deskripsi,
                publikasi: publikasi === 'true' || publikasi === true,
                putar_musik: putar_musik === 'true' || putar_musik === true,
                tampil_cerita: tampil_cerita === 'true' || tampil_cerita === true,
                tampil_kado: tampil_kado === 'true' || tampil_kado === true,
                tampil_streaming: tampil_streaming === 'true' || tampil_streaming === true,
                tampil_bukutamu: tampil_bukutamu === 'true' || tampil_bukutamu === true
            });
        } else {
            if (share_judul !== undefined) setting.share_judul = share_judul;
            if (share_deskripsi !== undefined) setting.share_deskripsi = share_deskripsi;
            if (publikasi !== undefined) setting.publikasi = publikasi === 'true' || publikasi === true;
            if (putar_musik !== undefined) setting.putar_musik = putar_musik === 'true' || putar_musik === true;
            if (tampil_cerita !== undefined) setting.tampil_cerita = tampil_cerita === 'true' || tampil_cerita === true;
            if (tampil_kado !== undefined) setting.tampil_kado = tampil_kado === 'true' || tampil_kado === true;
            if (tampil_streaming !== undefined) setting.tampil_streaming = tampil_streaming === 'true' || tampil_streaming === true;
            if (tampil_bukutamu !== undefined) setting.tampil_bukutamu = tampil_bukutamu === 'true' || tampil_bukutamu === true;
        }

        if (req.file) {
            setting.share_gambar = req.file.filename;
        }

        await setting.save(); 
        res.status(200).json({ message: "Pengaturan berhasil disimpan!", newSlug: invitation.slug });

    } catch (error) {
        console.error("Error updateSetting:", error);
        res.status(500).json({ message: "Gagal menyimpan pengaturan." });
    }
};