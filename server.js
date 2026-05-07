const express = require('express');
const fetch = require('node-fetch');
const app = express();
const PORT = process.env.PORT || 8080;

app.get('/api/catalog/search', async (req, res) => {
    try {
        const keyword = req.query.keyword || "valk";
        const cursor = req.query.cursor || "";
        
        // Cambiamos a Category 11 (Accesorios) para evitar bloqueos y ver cosas 3D
        const url = `https://catalog.roproxy.com/v1/search/items/details?category=11&limit=30&keyword=${encodeURIComponent(keyword)}&cursor=${cursor}`;

        const response = await fetch(url, {
            headers: { 'User-Agent': 'Mozilla/5.0' } // Engañamos al proxy para que crea que es un navegador
        });
        
        const data = await response.json();
        
        // Si no hay data.data, mandamos una lista vacía para que no crashee Roblox
        res.json(data.data ? data : { data: [], nextPageCursor: "" });

    } catch (err) {
        res.json({ data: [], nextPageCursor: "" });
    }
});

app.listen(PORT, '0.0.0.0');
