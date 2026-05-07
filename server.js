const express = require('express');
const cors = require('cors');
const fetch = require('node-fetch');

const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());

app.get('/api/catalog/search', async (req, res) => {
    try {
        const { keyword = "shirt", cursor = "" } = req.query;
        
        // Probamos con una URL que fuerza a traer ropa y accesorios populares
        const url = `https://catalog.roproxy.com/v1/search/items/details?category=1&limit=30&keyword=${encodeURIComponent(keyword)}&cursor=${cursor}`;

        console.log(`Pidiendo a Roblox: ${url}`);

        const response = await fetch(url, {
            headers: { 'User-Agent': 'Mozilla/5.0' }
        });

        const data = await response.json();
        
        // Mapeamos los datos al formato que espera tu LocalScript
        const items = data.data || [];
        const cleaned = items.map(item => ({
            assetId: item.id,
            titulo: item.name || "Objeto",
            precio: item.price || 0
        }));

        // IMPORTANTE: Devolvemos "data" y "nextCursor" (en inglés, como tu LocalScript)
        res.json({
            data: cleaned,
            nextCursor: data.nextPageCursor || ""
        });

    } catch (err) {
        console.error("Error:", err);
        res.status(200).json({ data: [], nextCursor: "" });
    }
});

app.listen(PORT, () => console.log(`Servidor reparado en puerto ${PORT}`));

app.listen(PORT, () => console.log(`Servidor activo a las 5AM`));
