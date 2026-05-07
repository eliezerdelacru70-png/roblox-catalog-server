const express = require('express');
const cors = require('cors');
const fetch = require('node-fetch');

const app = express();
const PORT = process.env.PORT || 3000; // Usar el puerto de Railway

app.use(cors());
app.use(express.json());

app.get('/api/catalog/search', async (req, res) => {
    try {
        const keyword = req.query.keyword || '';
        const cursor = req.query.cursor || '';

        // URL para traer TODO (Accesorios, Ropa 3D, etc)
        const url = `https://catalog.roproxy.com/v1/search/items/details?limit=30&keyword=${encodeURIComponent(keyword)}&cursor=${cursor}&category=0&subcategory=0`;

        console.log(`Fetching catalog URL: ${url}`);

        const response = await fetch(url, {
            headers: {
                'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
                'Accept': 'application/json',
                'Accept-Language': 'en-US,en;q=0.9'
            }
        });

        console.log(`Response status: ${response.status}`);

        // Si el proxy falla, respondemos vacío pero con éxito (200) para no romper Roblox
        if (!response.ok) {
            console.error(`Proxy error: ${response.status} para URL: ${url}`);
            return res.status(200).json({ data: [], nextCursor: "" });
        }

        const data = await response.json();
        
        console.log(`Items recibidos: ${Array.isArray(data.data) ? data.data.length : 0}`);
        console.log(`Siguiente cursor: ${data.nextPageCursor || 'Ninguno'}`);

        // Mapeamos los datos al formato exacto que espera el LocalScript
        const items = Array.isArray(data.data) ? data.data : [];
        const cleaned = items.map(item => ({
            assetId: item.id,
            titulo: item.name || "Sin nombre",
            precio: item.price != null ? item.price : 0
        }));

        res.json({
            data: cleaned,
            nextCursor: data.nextPageCursor || ''
        });

    } catch (err) {
        console.error("Error inesperado en el servidor:", err);
        // Siempre devolvemos una estructura válida aunque haya error
        res.status(200).json({ data: [], nextCursor: "" });
    }
});

app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
