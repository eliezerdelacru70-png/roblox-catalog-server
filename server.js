const express = require('express');
const cors = require('cors');
const fetch = require('node-fetch');

const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());

app.get('/api/catalog/search', async (req, res) => {
    try {
        const keyword = req.query.keyword || '';
        const cursor = req.query.cursor || '';

        // Category 0 y Subcategory 0 traen TODO el catálogo (3D, Ropa, Caras, etc.)
        const url = `https://catalog.roproxy.com/v1/search/items/details?limit=30&keyword=${encodeURIComponent(keyword)}&cursor=${cursor}&category=0&subcategory=0`;

        const response = await fetch(url, {
            headers: { 'User-Agent': 'Mozilla/5.0' },
            timeout: 10000 // 10 segundos para evitar el NetFail de Roblox
        });

        if (!response.ok) return res.json({ data: [], nextCursor: "" });

        const data = await response.json();
        const items = data.data || [];

        // Mapeamos con nombres simples que el LocalScript entenderá
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
        console.error("Error en servidor:", err.message);
        res.status(200).json({ data: [], nextCursor: "" });
    }
});

app.listen(PORT, () => console.log(`Servidor Universal Corriendo en puerto ${PORT}`));
