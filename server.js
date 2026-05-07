const express = require('express');
const fetch = require('node-fetch');
const app = express();
const PORT = process.env.PORT || 8080;

app.get('/api/catalog/search', async (req, res) => {
    try {
        const keyword = req.query.keyword || "black";
        const cursor = req.query.cursor || "";
        
        // Bajamos a 60 para evitar que el Proxy nos bloquee por exceso de carga
        const url = `https://catalog.roproxy.com/v1/search/items/details?category=0&limit=60&keyword=${encodeURIComponent(keyword)}&cursor=${cursor}`;

        const response = await fetch(url, {
            headers: { 'User-Agent': 'Roblox/Linux' }
        });

        if (!response.ok) throw new Error("Error en Proxy");

        const data = await response.json();
        res.json(data);
    } catch (err) {
        console.error(err.message);
        res.json({ data: [], nextPageCursor: "" });
    }
});

app.listen(PORT, '0.0.0.0');
