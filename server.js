const express = require('express');
const cors = require('cors');
const fetch = require('node-fetch');

const app = express();
const PORT = process.env.PORT || 8080;

app.use(cors());
app.use(express.json());

app.get('/api/catalog/search', async (req, res) => {
    try {
        const { keyword = "", cursor = "" } = req.query;
        
        // category=0 y subcategory=0 busca en TODO el catálogo de Roblox
        // salesType=1 asegura que sean objetos a la venta
        const url = `https://catalog.roproxy.com/v1/search/items/details?category=0&subcategory=0&limit=30&keyword=${encodeURIComponent(keyword)}&cursor=${cursor}&salesType=1`;

        console.log(`Buscando de todo: ${url}`);

        const response = await fetch(url, {
            headers: { 'User-Agent': 'Mozilla/5.0' },
            timeout: 10000
        });

        const data = await response.json();
        const items = data.data || [];

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

app.listen(PORT, '0.0.0.0', () => {
    console.log(`Catálogo TOTAL activo en puerto ${PORT}`);
});
