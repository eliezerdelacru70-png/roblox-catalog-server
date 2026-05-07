const express = require('express');
const fetch = require('node-fetch');
const app = express();
const PORT = process.env.PORT || 8080;

app.get('/api/catalog/search', async (req, res) => {
    try {
        const { keyword = "shirt", cursor = "" } = req.query;
        // Buscamos en categoría 0 para mezclar todo (3D y clásico)
        const url = `https://catalog.roproxy.com/v1/search/items/details?category=0&limit=30&keyword=${keyword}&cursor=${cursor}`;

        const response = await fetch(url);
        const data = await response.json();
        res.json(data); 
    } catch (err) {
        res.status(500).json({ data: [] });
    }
});

app.listen(PORT, '0.0.0.0', () => console.log("Servidor Online"));
