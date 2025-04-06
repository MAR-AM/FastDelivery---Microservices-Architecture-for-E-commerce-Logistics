const express = require("express");
const app = express();
const PORT = process.env.PORT_ONE || 4003;
const mongoose = require("mongoose");
const User = require("./Auth"); // Assurez-vous que votre modèle est correctement exporté depuis Auth.js
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");

mongoose.set("strictQuery", true);

// Connexion à la base de données MongoDB
const connectDB = async () => {
    try {
        await mongoose.connect("mongodb://localhost:27017/Auth_Service", {
            useNewUrlParser: true,
            useUnifiedTopology: true,
        });
        console.log("Connected to MongoDB");
    } catch (error) {
        console.error("MongoDB connection error:", error);
        process.exit(1); // Quitter le processus en cas d'erreur de connexion
    }
};

connectDB();

app.use(express.json());

// Clé secrète pour le JWT
const JWT_SECRET = process.env.JWT_SECRET || "secret";
// POST /auth/register : Enregistre un nouvel utilisateur
app.post("/auth/register", async (req, res) => {
    let { nom_complet, email, password } = req.body;

    // Vérifier si le mot de passe est défini et non vide
    if (!password || password.trim() === "") {
        return res.status(400).json({ message: "Password is required" });
    }

    // Vérifier si l'utilisateur existe déjà
    const existingUser = await User.findOne({ email });
    if (existingUser) {
        return res.status(400).json({ message: "User already exists" });
    }

    // Hacher le mot de passe avant de l'enregistrer
    bcrypt.hash(password, 10, async (err, hash) => {
        if (err) {
            return res.status(500).json({ message: "Error hashing password", error: err.message });
        }

        // Créer un nouvel utilisateur avec le mot de passe haché
        const newUser = new User({ nom_complet, email, mot_de_passe: hash });

        try {
            await newUser.save(); // Sauvegarder le nouvel utilisateur dans la base de données
            res.status(201).json({
                message: "User registered successfully",
                user: newUser,
            });
        } catch (error) {
            res.status(400).json({ error: error.message });
        }
    });
});

// POST /auth/login : Authentifie l'utilisateur et retourne un token JWT
app.post("/auth/login", async (req, res) => {
    const { email, password } = req.body;

    // Rechercher l'utilisateur par email
    const user = await User.findOne({ email });

    if (!user) {
        return res.status(401).json({ message: "User not found" });
    }

    // Comparer le mot de passe fourni avec celui stocké dans la base de données
    bcrypt.compare(password, user.mot_de_passe, (err, isMatch) => {
        if (err) {
            return res.status(500).json({ message: "Error comparing passwords", error: err.message });
        }

        if (!isMatch) {
            return res.status(401).json({ message: "Incorrect password" });
        }

        // Créer un payload avec les données de l'utilisateur
        const payload = { email, nom_complet: user.nom_complet };

        // Générer un token JWT
        jwt.sign(payload, JWT_SECRET, { expiresIn: '1h' }, (err, token) => {
            if (err) return res.status(500).json({ error: "Token error" });

            // Retourner le token et les informations de l'utilisateur
            return res.json({ token, user: payload });
        });
    });
});


// GET /auth/profile : Retourne le profil de l'utilisateur authentifié

app.get("/auth/profil", (req, res) => {
    const authHeader = req.headers["authorization"];
    const token = authHeader && authHeader.split(" ")[1];

    if (!token) {
        return res.status(401).json({ message: "Access denied" });
    }

    jwt.verify(token, JWT_SECRET, (err, user) => {
        if (err) {
            return res.status(403).json({ message: "Invalid token" });
        }

        return res.json(user);
    });
});


// Lancer le serveur
app.listen(PORT, () => {
    console.log(`Auth service running on port ${PORT}`);
});
