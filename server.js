const express = require('express');
const fetch = require('node-fetch');
const app = express();
const PORT = process.env.PORT || 8080;

app.get('/api/catalog/search', async (req, res) => {
    try {
        const keyword = req.query.keyword || "cool";
        const cursor = req.query.cursor || "";
        
        // Category 0 = TODO (3D, Clásico, Accesorios)
        // Usamos subcategory 0 para no filtrar por tipo específico
        const url = `https://catalog.roproxy.com/v1/search/items/details?category=0&subcategory=0&limit=30&keyword=${encodeURIComponent(keyword)}&cursor=${cursor}`;

        const response = await fetch(url);
        const data = await response.json();
        
        // Enviamos el objeto completo (incluyendo el nextPageCursor para el scroll)
        res.status(200).json(data);

    } catch (err) {
        console.error("Error:", err);
        res.status(200).json({ data: [] });
    }
});

app.listen(PORT, '0.0.0.0');
app.listen(PORT, '0.0.0.0');
