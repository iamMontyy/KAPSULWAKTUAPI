const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const path = require('path');
require('dotenv').config();
const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());
app.use(express.static(path.join(__dirname, 'public')))

mongoose.connect(process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/time_capsule_db')
    .then(() => console.log('Terhubung ke database!'))
    .catch((err) => console.log('Gagal terhubung:', err));

const capsuleSchema = new mongoose.Schema({
    pesan: { 
        type: String, 
        required: true 
    },
    tanggal_buka: { 
        type: Date, 
        required: true 
    },
    tanggal_dikunci: { 
        type: Date, 
        default: Date.now 
    }
});

const Capsule = mongoose.model('Capsule', capsuleSchema);

app.post('/capsule', async (req, res) => {
    try {
        const { pesan, tanggal_buka } = req.body;
        
        const kapsulBaru = new Capsule({
            pesan: pesan,
            tanggal_buka: tanggal_buka
        });
        
        await kapsulBaru.save(); 
        
        res.status(201).json({ 
            notifikasi: "Kapsul Waktu berhasil dikubur!", 
            id_kapsul: kapsulBaru._id 
        });
    } catch (error) {
        res.status(400).json({ notifikasi: "Gagal mengubur kapsul waktu" });
    }
});

app.get('/capsule/:id', async (req, res) => {
    try {
        const idKapsul = req.params.id;
        const kapsulDitemukan = await Capsule.findById(idKapsul);
        
        if (!kapsulDitemukan) {
            return res.status(404).json({ notifikasi: "Kapsul Waktu tidak dapat ditemukan." });
        }

        const waktuSekarang = new Date();

        if (waktuSekarang < kapsulDitemukan.tanggal_buka) {
            return res.status(403).json({
                notifikasi: "Akses Ditolak! Kapsul waktu ku ini masih terkunci.",
                baru_boleh_dibuka_pada: kapsulDitemukan.tanggal_buka
            });
        }

        res.status(200).json({ 
            notifikasi: "Kapsul waktu berhasil dibuka!", 
            isi_rahasia: kapsulDitemukan.pesan 
        });

    } catch (error) {
        res.status(500).json({ notifikasi: "Gagal membaca data." });
    }
});

app.listen(PORT, () => {
    console.log(`Server berjalan di http://localhost:${PORT}`);
});
