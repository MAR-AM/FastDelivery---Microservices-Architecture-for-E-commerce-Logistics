const express = require("express");
const app = express();
const mongoose = require("mongoose");
const Commande = require("./Commande");
const PORT = process.env.PORT_TWO || 4001;
const axios = require("axios");


mongoose.set("strictQuery", true);
mongoose.connect("mongodb://localhost:27017/Commande_Service", {
    useNewUrlParser: true,
    useUnifiedTopology: true,
})
.then(() => console.log("Connecté à MongoDB"))
.catch((err) => console.error("Erreur de connexion MongoDB :", err));

app.use(express.json());


// Route pour ajouter une commande POST /commande/ajouter :
// o Vérifie que les produits commandés existent et sont en stock.
// o Calcule le prix total.
// o Sauvegarde la commande.

app.post("/commande/ajouter", async (req, res) => {
    const { client_id, produits } = req.body;

    if (!client_id || !produits || produits.length === 0) {
        return res.status(400).json({ error: "client_id et produits requis" });
    }

    try {
        let prix_total = 0;

        // Vérifie les produits 1 par 1
        for (const item of produits) {
            const { produit_id, quantite } = item;

            // Appel au microservice Produit
            const response = await axios.get(`http://localhost:4000/produit/${produit_id}`);
            const produit = response.data;

            if (!produit) {
                return res.status(404).json({ error: `Produit ${produit_id} introuvable` });
            }

            if (produit.stock < quantite) {
                return res.status(400).json({ error: `Stock insuffisant pour le produit ${produit.nom}` });
            }

            // Calcul du prix total
            prix_total += produit.prix * quantite;

            // Mise à jour du stock
            await axios.patch(`http://localhost:4000/produit/${produit_id}/stock`, {
                stock: produit.stock - quantite
            });
        }

        const newCommande = new Commande({
            client_id,
            produits,
            prix_total,
            statut: 'En attente'
        });

        await newCommande.save();
        res.status(201).json(newCommande);

    } catch (error) {
        console.error("Erreur création commande :", error.message);
        res.status(500).json({ error: "Erreur serveur" });
    }
});


// GET /commande/:id : Récupère une commande spécifique.

app.get("/commande/:id", async (req, res) => {
    const { id } = req.params;

    try {
        const commande = await Commande.findById(id);

        if (!commande) {
            return res.status(404).json({ error: "Commande non trouvée" });
        }

        res.status(200).json(commande);
    } catch (error) {
        console.error("Erreur lors de la récupération de la commande:", error.message);
        res.status(500).json({ error: "Erreur serveur" });
    }
});

//  PATCH /commande/:id/statut : Met à jour le statut d’une commande ("Confirmée", "Expédiée").

app.patch("/commande/:id/statut", async (req, res) => { 
    const { id } = req.params;
    const { statut } = req.body;

    if (!statut) {
        return res.status(400).json({ error: "Statut requis" });
    }

    try {
        const commande = await Commande.findByIdAndUpdate(
            id,
            { statut },
            { new: true }
        );

        if (!commande) {
            return res.status(404).json({ error: "Commande non trouvée" });
        }

        res.status(200).json(commande);
    } catch (error) {
        console.error("Erreur lors de la mise à jour du statut de la commande:", error.message);
        res.status(500).json({ error: "Erreur serveur" });
    }
}
);




app.listen(PORT, () => {
    console.log(`Commande service en cours d'exécution sur le port ${PORT}`);
}       
);
