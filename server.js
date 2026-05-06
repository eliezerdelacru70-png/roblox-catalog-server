const express = require("express");
const cors = require("cors");

const app = express();
app.use(cors());
app.use(express.json());

// 🔎 BUSCAR CATÁLOGO COMPLETO
app.get("/api/catalog/search", async (req, res) => {
    try {
        const keyword = req.query.keyword || "";
        const limit = req.query.limit || 100; // máximo recomendado
        const cursor = req.query.cursor || "";

        let url = `https://catalog.roblox.com/v1/search/items?limit=${limit}&category=All`;

        if (keyword) url += `&keyword=${encodeURIComponent(keyword)}`;
        if (cursor) url += `&cursor=${cursor}`;

        const response = await fetch(url);
        const data = await response.json();

        // 🧠 FORMATEAR DATA (para Roblox)
        const items = (data.data || []).map(item => ({
            id: item.id,
            name: item.name,
            price: item.price || 0,
            creator: item.creatorName || "Unknown",
            type: item.itemType || "Asset",
            image: `rbxthumb://type=Asset&id=${item.id}&w=420&h=420`
        }));

        res.json({
            items: items,
            nextCursor: data.nextPageCursor || null
        });

    } catch (err) {
        console.error(err);
        res.status(500).json({ error: "Error fetching catalog" });
    }
});

// 🧢 DETALLES (opcional para equipar luego)
app.get("/api/catalog/avatar", async (req, res) => {
    try {
        const ids = req.query.ids;

        const body = {
            items: ids.split(",").map(id => ({
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

// 🟢 TEST
app.get("/", (req, res) => {
    res.send("Servidor catálogo funcionando 🚀");
});

// 🚀 PORT (IMPORTANTE PARA RAILWAY)
const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
    console.log("Server running on port " + PORT);
});
