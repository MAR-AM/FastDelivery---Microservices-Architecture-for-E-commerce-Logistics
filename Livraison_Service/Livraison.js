const mongoose = require('mongoose');

const livraisonSchema = new mongoose.Schema({
    commande_id: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Commande',
        required: true
    },
    transporteur: {
        type: String,
        required: true
    },
    statut: {
        type: String,
        enum: ["En attente", "En cours", "Livrée"],
        default: 'En cours'
    },
    adresse_livraison: {
        type: String,
        required: false
    },
    created_at: {
        type: Date,
        default: Date.now
    }
});

module.exports = mongoose.model('Livraison', livraisonSchema);
