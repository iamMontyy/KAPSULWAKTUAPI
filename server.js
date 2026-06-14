const express = require('express');
const mongoose = require('mongoose');
require('dotenv').config();
const app = express();
const PORT = process.env.PORT || 3000;

app.use(express.json());

mongoose.connect(process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/time_capsule_db')
    .then(() => console.log('Terhubung ke database Time Capsule!'))
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