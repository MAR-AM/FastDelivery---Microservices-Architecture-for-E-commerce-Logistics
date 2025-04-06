const express = require('express');
const mongoose = require('mongoose');
const Livraison = require('./Livraison');
const app = express();
const PORT = 4002;
const axios = require('axios');

mongoose.set("strictQuery", true);
mongoose.connect("mongodb://localhost:27017/Livraison_Service", {
    useNewUrlParser: true,
    useUnifiedTopology: true,
})
    .then(() => console.log("Connecté à MongoDB"))
    .catch((err) => console.error("Erreur de connexion MongoDB :", err));

app.use(express.json());

// POST /livraison/ajouter :
// o Vérifie si la commande existe.
// o Associe un transporteur à la commande.
// o Sauvegarde la livraison en base de données.

app.post('/livraison/ajouter', async (req, res) => {
    const { commande_id, transporteur_id, statut, adresse_livraison } = req.body;

    if (!commande_id || !transporteur_id) {
        return res.status(400).json({ error: 'commande_id et transporteur_id requis' });
    }

    try {
        // Vérifie si la commande existe
        const response = await axios.get(`http://localhost:4001/commande/${commande_id}`);
        const commande = response.data;

        if (!commande) {
            return res.status(404).json({ error: `Commande ${commande_id} introuvable` });
        }

        const newLivraison = new Livraison({
            commande_id,
            transporteur: transporteur_id,
            statut: statut || 'En cours', // si statut n’est pas fourni, on met "En cours"
            adresse_livraison
        });

        await newLivraison.save();
        res.status(201).json(newLivraison);
    } catch (error) {
        console.error("Erreur:", error.message);
        res.status(500).json({ error: 'Erreur lors de la création de la livraison' });
    }
});

//  PUT /livraison/:id : Met à jour le statut de la livraison.

app.put('/livraison/:id', async (req, res) => {
    const { id } = req.params;
    const { statut } = req.body;

    if (!statut) {
        return res.status(400).json({ error: 'Statut requis' });
    }

    try {
        const livraison = await Livraison.findByIdAndUpdate(id, { statut }, { new: true });

        if (!livraison) {
            return res.status(404).json({ error: 'Livraison non trouvée' });
        }

        res.status(200).json(livraison);
    } catch (error) {
        res.status(500).json({ error: 'Erreur lors de la mise à jour de la livraison' });
    }
});

app.listen(PORT, () => {
    console.log(`Le serveur est en cours d'exécution sur le port ${PORT}`);
}
);


