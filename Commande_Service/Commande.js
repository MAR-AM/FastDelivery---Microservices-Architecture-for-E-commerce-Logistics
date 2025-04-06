const mongoose = require('mongoose');

const commandeSchema = new mongoose.Schema({
    produits: [
        {
            produit_id: {
                type: mongoose.Schema.Types.ObjectId,
                required: true,
                ref: 'Produit'
            },
            quantite: {
                type: Number,
                required: true,
                min: 1
            }
        }
    ],
    client_id: {
        type: String,
        required: true
    },
    prix_total: {
        type: Number,
        required: true,
        default: 0
    },
    statut: {
        type: String,
        enum: ["En attente", "En cours", "Livrée"],
        default: 'En attente'
    },
    created_at: {
        type: Date,
        default: Date.now
    }
});

module.exports = mongoose.model('Commande', commandeSchema);