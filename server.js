const express = require('express');
const fetch = require('node-fetch');
const app = express();
const PORT = process.env.PORT || 8080;

app.get('/api/catalog/search', async (req, res) => {
    try {
        const keyword = req.query.keyword || "cool";
        // Usamos una URL de respaldo que es más estable para ropa
        const url = `https://catalog.roproxy.com/v1/search/items/details?category=1&limit=30&keyword=${keyword}`;

        const response = await fetch(url);
        const data = await response.json();
        
        // Extraemos solo la lista de datos
        const listaFinal = data.data || [];
        
        console.log(`Enviando ${listaFinal.length} items a Roblox`);
        res.status(200).json(listaFinal); // Enviamos el Array puro

    } catch (err) {
        console.error("Error:", err);
        res.status(200).json([]);
    }
});

app.listen(PORT, '0.0.0.0');
