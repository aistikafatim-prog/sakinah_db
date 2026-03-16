// // backend/src/controllers/TemplateController.js
// const Template = require('../models/TemplateModel');

// exports.getAllTemplates = async (req, res) => {
//     try {
//         // Ambil semua data dari tabel templates
//         const templates = await Template.findAll();

//         res.status(200).json({
//             status: 'success',
//             data: templates
//         });
//     } catch (error) {
//         console.error("Error ambil template:", error);
//         res.status(500).json({ status: 'error', message: 'Server Error' });
//     }
// };
  
const Template = require('../models/TemplateModel');

// 1. Ambil Semua Template (Untuk Admin & Landing Page)
exports.getTemplates = async (req, res) => {
    try {
        const templates = await Template.findAll({
            // Kita urutkan agar template terbaru muncul di awal
            order: [['createdAt', 'DESC']] 
        });

        res.status(200).json({
            status: 'success',
            data: templates
        });
    } catch (error) {
        console.error("Error Get Templates:", error);
        res.status(500).json({ 
            message: 'Gagal mengambil data template',
            error: error.message 
        });
    }
};

// 2. Ambil Satu Template Berdasarkan ID (Jika nanti butuh halaman detail)
exports.getTemplateById = async (req, res) => {
    try {
        const template = await Template.findByPk(req.params.id);
        if (!template) {
            return res.status(404).json({ message: 'Template tidak ditemukan' });
        }
        res.status(200).json({ status: 'success', data: template });
    } catch (error) {
        res.status(500).json({ message: 'Error Get Template By ID' });
    }
};

// 3. Tambah Template Baru (Hanya untuk Admin)
exports.createTemplate = async (req, res) => {
    try {
        const { nama_template, harga, tipe } = req.body;
        
        // Mengambil nama file gambar yang di-upload via Multer
        const thumbnail_url = req.file ? req.file.filename : null;

        const newTemplate = await Template.create({
            nama_template,
            harga,
            thumbnail_url,
            tipe
        });

        res.status(201).json({
            status: 'success',
            message: 'Template berhasil ditambahkan',
            data: newTemplate
        });
    } catch (error) {
        res.status(500).json({ message: 'Gagal menambah template' });
    }
};

// 4. Hapus Template (Hanya untuk Admin)
exports.deleteTemplate = async (req, res) => {
    try {
        const template = await Template.findByPk(req.params.id);
        if (!template) return res.status(404).json({ message: 'Template tidak ada' });

        await template.destroy();
        res.status(200).json({ message: 'Template berhasil dihapus' });
    } catch (error) {
        res.status(500).json({ message: 'Gagal menghapus template' });
    }
};
// Di dalam TemplateController.js

exports.updateTemplate = async (req, res) => {
    try {
        const { id } = req.params;
        const { nama_template, harga, tipe } = req.body;

        // Cari template lama
        const targetTemplate = await Template.findByPk(id); // Atau Template.findOne({ where: { id } })
        
        if (!targetTemplate) {
            return res.status(404).json({ pesan: "Template tidak ditemukan" });
        }

        // Siapkan data yang mau diupdate
        const dataUpdate = {
            nama_template,
            harga: harga || 0,
            tipe: tipe || 'premium'
        };

        // Jika user mengupload gambar baru, update nama filenya.
        // Jika tidak, biarkan pakai gambar yang lama.
        if (req.file) {
            dataUpdate.thumbnail_url = req.file.filename;
        }

        // Eksekusi update
        await targetTemplate.update(dataUpdate);

        res.status(200).json({
            pesan: "Template berhasil diupdate",
            data: targetTemplate
        });
    } catch (error) {
        console.error("Error update template:", error);
        res.status(500).json({ pesan: "Gagal mengupdate template" });
    }
};