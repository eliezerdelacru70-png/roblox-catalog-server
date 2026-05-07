const express = require('express');
const cors = require('cors');
const fetch = require('node-fetch');

const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());

app.get("/api/catalog/search", async (req, res) => {
    try {
        const keyword = req.query.keyword || "";
        const cursor = req.query.cursor || "";
        // Usamos categoría 1 (Ropa/Accesorios) por defecto si no se envía nada
        const category = req.query.category || "1"; 

        const url = `https://catalog.roproxy.com/v1/search/items/details?limit=30&keyword=${encodeURIComponent(keyword)}&cursor=${cursor}&category=${category}`;

        const response = await fetch(url);
        const data = await response.json();

        // Limpiamos los datos para que Roblox los entienda fácil
        const cleaned = (data.data || []).map(item => ({
            id: item.id,
            name: item.name,
            price: item.price || 0,
            itemType: item.itemType
        }));

        res.json({
            data: cleaned,
            nextCursor: data.nextPageCursor || ""
        });

    } catch (err) {
        console.error("Error en servidor:", err);
        res.status(500).json({ data: [], error: "ERROR_SERVER" });
    }
});

app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
