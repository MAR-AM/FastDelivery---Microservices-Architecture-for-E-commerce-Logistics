const express = require('express');
const app = express();
const mongoose = require('mongoose');
const Produit = require('./Produit');

const PORT = 4000;

app.use(express.json());

// Connexion à MongoDB
mongoose.connect("mongodb://localhost:27017/Produit_Service", {
    useNewUrlParser: true,
    useUnifiedTopology: true,
})
    .then(() => console.log("Connecté à MongoDB"))
    .catch((err) => console.error("Erreur de connexion MongoDB :", err)
);

app.post('/produit/ajouter', (req, res) => {
    const { nom, description, prix, stock } = req.body;

    const newProduit = new Produit({
        nom,
        description,
        prix,
        stock
    });

    newProduit.save()
        .then((produit) => res.status(201).json(produit))
        .catch((err) => res.status(400).json({ error: err.message }));
});

app.get('/produit/:id', (req, res) => {    
    const { id } = req.params;

    Produit.findById(id)
        .then((produit) => {
            if (!produit) {
                return res.status(404).json({ error: 'Produit non trouvé' });
            }
            res.status(200).json(produit);
        })
        .catch((err) => res.status(400).json({ error: err.message }));
});

app.patch('/produit/:id/stock', (req, res) => {
    const { id } = req.params;
    const { stock } = req.body;

    Produit.findByIdAndUpdate(id, { stock }, { new: true })
        .then((produit) => {
            if (!produit) {
                return res.status(404).json({ error: 'Produit non trouvé' });
            }
            res.status(200).json(produit);
        })
        .catch((err) => res.status(400).json({ error: err.message }));
});

app.listen(PORT, () => {
    console.log("Le serveur est en cours d'exécution sur le port 3000");
});