const express = require('express');
const fetch = require('node-fetch');
const app = express();
const PORT = process.env.PORT || 8080;

app.get('/api/catalog/search', async (req, res) => {
    try {
        const keyword = req.query.keyword || "blue";
        const cursor = req.query.cursor || "";
        
        // Usamos una URL de catálogo más directa (v1/search/items)
        // Eliminamos filtros complejos para que el Proxy no sospeche
        const url = `https://catalog.roproxy.com/v1/search/items/details?category=11&limit=30&keyword=${keyword}&cursor=${cursor}`;

        const response = await fetch(url, {
            method: 'GET',
            headers: {
                'Accept': 'application/json',
                'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64)'
            }
        });

        const data = await response.json();
        
        // Si la data viene vacía, enviamos un error claro para saberlo
        if (!data || !data.data || data.data.length === 0) {
            console.log("Roblox devolvió 0 resultados para:", keyword);
            return res.json({ data: [], error: "No hay resultados" });
        }

        res.json(data);
    } catch (err) {
        res.status(500).json({ data: [], error: err.message });
    }
});

app.listen(PORT, '0.0.0.0');
