const express = require('express');
const cors = require('cors');
const fetch = require('node-fetch');

const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());

app.get('/api/catalog/search', async (req, res) => {
    try {
        const { keyword = "shirt", cursor = "" } = req.query;
        
        // URL MEJORADA: Busca ropa y accesorios populares si no hay keyword
        const searchKeyword = keyword || "item";
        const url = `https://catalog.roproxy.com/v1/search/items/details?limit=30&keyword=${encodeURIComponent(searchKeyword)}&cursor=${cursor}&category=1`;

        const response = await fetch(url, {
            headers: { 'User-Agent': 'Mozilla/5.0' }
        });

        const data = await response.json();
        const items = data.data || [];

        // Mapeo exacto para el LocalScript
        const cleaned = items.map(item => ({
            assetId: item.id,
            titulo: item.name || "Objeto",
            precio: item.price || 0
        }));

        res.json({
            data: cleaned,
            nextCursor: data.nextPageCursor || ""
        });

    } catch (err) {
        console.error("Error:", err);
        res.status(200).json({ data: [], nextCursor: "" });
    }
});

app.listen(PORT, () => console.log(`Server on port ${PORT}`));
