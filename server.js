const express = require('express');
const fetch = require('node-fetch');
const app = express();
const PORT = process.env.PORT || 8080;

app.use((req, res, next) => {
    res.header("Access-Control-Allow-Origin", "*");
    next();
});

// Ruta de prueba para el navegador
app.get('/', (req, res) => {
    res.send("Servidor funcionando. Usa /api/catalog/search");
});

app.get('/api/catalog/search', async (req, res) => {
    try {
        const keyword = req.query.keyword || "shirt";
        const cursor = req.query.cursor || "";
        
        // URL de busqueda global
        const url = `https://catalog.roproxy.com/v1/search/items/details?category=1&limit=30&keyword=${keyword}&cursor=${cursor}`;
        
        const response = await fetch(url);
        const data = await response.json();
        
        // Enviamos la lista 'data' directamente
        if (data && data.data) {
            res.json(data.data); 
        } else {
            res.json([]);
        }
    } catch (err) {
        console.error(err);
        res.json([]);
    }
});

app.listen(PORT, '0.0.0.0', () => console.log(`Puerto: ${PORT}`));
