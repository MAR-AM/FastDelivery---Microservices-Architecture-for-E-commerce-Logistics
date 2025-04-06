const mongoose = require('mongoose');

const AuthentificationServiceSchema = new mongoose.Schema({
    nom_complet: String,
    email: {
        type: String,
        unique: true
    },
    mot_de_passe: String,
    created_at: {
        type: Date,
        default: Date.now()
    }
});

module.exports = mongoose.model('User', AuthentificationServiceSchema);