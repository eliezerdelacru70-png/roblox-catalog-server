const express = require("express");
const cors = require("cors");

const app = express();
app.use(cors());
app.use(express.json());

// Buscar items
app.get("/api/catalog/search", async (req, res) => {
    try {
        const keyword = req.query.keyword || "";
        const limit = req.query.limit || 10;

        const url = `https://catalog.roblox.com/v1/search/items?keyword=${keyword}&limit=${limit}`;

        const response = await fetch(url);
        const data = await response.json();

        res.json(data);
    } catch (err) {
        res.status(500).json({ error: "Error fetching catalog" });
    }
});

// Detalles de items
app.get("/api/catalog/avatar", async (req, res) => {
    try {
        const ids = req.query.ids.split(",");

        const body = {
            items: ids.map(id => ({
                id: Number(id),
                itemType: "Asset"
            }))
        };

        const response = await fetch("https://catalog.roblox.com/v1/catalog/items/details", {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify(body)
        });

        const data = await response.json();

        res.json(data);
    } catch (err) {
        res.status(500).json({ error: "Error fetching details" });
    }
});

app.get("/", (req, res) => {
    res.send("Servidor funcionando 🚀");
});

app.listen(3000, () => {
    console.log("Server running on port 3000");
});
