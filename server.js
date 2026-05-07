const express = require('express');
const cors = require('cors');
const fetch = require('node-fetch'); // Asegúrate de tenerlo en dependencies

const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());

app.get("/api/catalog/search", async (req, res) => {
    try {
        const keyword = req.query.keyword || "";
        const cursor = req.query.cursor || "";
        const category = req.query.category || "All"; // Para Ropa, Animaciones, etc.

        // URL Proproxy con soporte para categorías y cursores
        const url = `https://catalog.roproxy.com/v1/search/items/details?limit=30&keyword=${encodeURIComponent(keyword)}&cursor=${cursor}&category=${category}`;

        const response = await fetch(url);
        const data = await response.json();

        const cleaned = (data.data || []).map(item => ({
            id: item.id,
            name: item.name,
            price: item.price || 0,
            itemType: item.itemType
        }));

        res.json({
            data: cleaned,
            nextCursor: data.nextPageCursor || null
        });

    } catch (err) {
        console.error(err);
        res.status(500).json({ error: "ERROR_SERVER" });
    }
});

app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
