const express = require('express');
const fetch = require('node-fetch');
const cors = require('cors');

const app = express();
const PORT = process.env.PORT || 8080;

app.use(cors()); // ← Esto es clave

app.get('/api/catalog/search', async (req, res) => {
    try {
        const keyword = req.query.keyword || "";
        const cursor = req.query.cursor || "";
        const limit = req.query.limit || "60";

        // Mejor endpoint (v2 + category=all)
        const url = `https://catalog.roproxy.com/v2/search/items/details?` +
            `category=all&` +
            `limit=${limit}&` +
            `keyword=${encodeURIComponent(keyword)}&` +
            `cursor=${cursor}`;

        const response = await fetch(url, {
            headers: { 
                'User-Agent': 'Roblox/WinInet',
                'Accept': 'application/json'
            }
        });

        if (!response.ok) {
            throw new Error(`HTTP ${response.status}`);
        }

        const data = await response.json();
        res.json(data);

    } catch (err) {
        console.error("Error en /api/catalog/search:", err.message);
        res.status(500).json({ 
            data: [], 
            nextPageCursor: "",
            error: err.message 
        });
    }
});

app.listen(PORT, '0.0.0.0', () => {
    console.log(`✅ Servidor corriendo en puerto ${PORT}`);
});
