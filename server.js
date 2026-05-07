const express = require('express');
const fetch = require('node-fetch');
const app = express();
const PORT = process.env.PORT || 8080;

app.get('/api/catalog/search', async (req, res) => {
    try {
        const keyword = req.query.keyword || "cool";
        const cursor = req.query.cursor || "";
        
        // category=0 y subcategory=0 para ver de TODO
        const url = `https://catalog.roproxy.com/v1/search/items/details?category=0&subcategory=0&limit=30&keyword=${encodeURIComponent(keyword)}&cursor=${cursor}`;

        const response = await fetch(url);
        const data = await response.json();
        
        // IMPORTANTE: Enviamos el objeto 'data' que contiene la tabla 'data' y el 'nextPageCursor'
        res.status(200).json(data);

    } catch (err) {
        res.status(200).json({ data: [], nextPageCursor: "" });
    }
});

app.listen(PORT, '0.0.0.0');
