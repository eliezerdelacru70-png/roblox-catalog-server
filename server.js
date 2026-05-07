const express = require('express');
const fetch = require('node-fetch');
const app = express();
const PORT = process.env.PORT || 8080;

app.get('/api/catalog/search', async (req, res) => {
    try {
        const keyword = req.query.keyword || "black";
        const cursor = req.query.cursor || "";
        
        // Subimos el limit a 120 para que traiga mucha más ropa de golpe
        const url = `https://catalog.roproxy.com/v1/search/items/details?category=0&limit=120&keyword=${encodeURIComponent(keyword)}&cursor=${cursor}`;

        const response = await fetch(url);
        const data = await response.json();
        
        res.json(data);
    } catch (err) {
        res.json({ data: [], nextPageCursor: "" });
    }
});

app.listen(PORT, '0.0.0.0');
