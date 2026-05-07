const express = require('express');
const cors = require('cors');
const fetch = require('node-fetch');

const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());

app.get('/api/catalog/search', async (req, res) => {
    try {
        let { keyword, cursor } = req.query;
        
        // Si no hay keyword, ponemos una por defecto para que SIEMPRE cargue algo
        const busquedaReal = (keyword && keyword.trim() !== "") ? keyword : "red"; 
        const cursorReal = cursor || "";

        // Category 0 = Todo el catálogo
        const url = `https://catalog.roproxy.com/v1/search/items/details?limit=30&keyword=${encodeURIComponent(busquedaReal)}&cursor=${cursorReal}&category=0`;

        console.log(`Solicitando: ${url}`);

        const response = await fetch(url, {
            headers: { 'User-Agent': 'Mozilla/5.0' },
            timeout: 10000
        });

        const data = await response.json();
        const items = data.data || [];

        const cleaned = items.map(item => ({
            assetId: item.id,
            titulo: item.name || "Objeto",
            precio: item.price || 0
        }));

        res.json({
            data: cleaned,
            nextCursor: data.nextPageCursor || ""
        });

    } catch (err) {
        console.error("Error en Railway:", err.message);
        res.status(200).json({ data: [], nextCursor: "" });
    }
});

app.listen(PORT, () => console.log(`Servidor activo a las 5AM`));
