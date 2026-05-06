const express = require("express");
const cors = require("cors");
const fetch = require("node-fetch");

const app = express();

app.use(cors());
app.use(express.json());

// TEST
app.get("/", (req, res) => {
    res.send("OK SERVER PRENDIDO 🔥");
});

// CATÁLOGO (USANDO ROPROXY)
app.get("/api/catalog/search", async (req, res) => {
    try {
        const limit = 30;

        const url = `https://catalog.roproxy.com/v1/search/items/details?limit=${limit}&category=All`;

        const response = await fetch(url);
        const text = await response.text();
        const data = JSON.parse(text);

        res.json(data);

    } catch (err) {
        console.error("ERROR:", err);
        res.status(500).json({ error: "FALLO EL SERVER" });
    }
});

const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
    console.log("Servidor corriendo en puerto " + PORT);
});
