const express = require('express');
const fetch = require('node-fetch');
const cors = require('cors');

const app = express();
const PORT = process.env.PORT || 8080;

app.use(cors());

app.get('/api/catalog/search', async (req, res) => {
    try {
        const keyword = req.query.keyword || "";
        const cursor = req.query.cursor || "";
        const limit = req.query.limit || "60";
        const assetTypeIds = req.query.assetTypeIds || "";

        let url = `https://catalog.roproxy.com/v2/search/items/details?` +
            `category=all&` +
            `limit=${limit}&` +
            `sortType=2&` +           // ← Sort por popularidad (mejor que gratis primero)
            `keyword=${encodeURIComponent(keyword)}&` +
            `cursor=${cursor}`;

        if (assetTypeIds) url += `&assetTypeIds=${assetTypeIds}`;

        const response = await fetch(url, {
            headers: { 'User-Agent': 'Roblox/WinInet' }
        });

        if (!response.ok) throw new Error(`HTTP ${response.status}`);
        
        const data = await response.json();
        res.json(data);

    } catch (err) {
        console.error(err);
        res.status(500).json({ data: [], nextPageCursor: "" });
    }
});

app.listen(PORT, '0.0.0.0', () => {
    console.log(`✅ Servidor en puerto ${PORT}`);
});
