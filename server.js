const express = require('express');
const cors = require('cors');
const fetch = require('node-fetch');

const app = express();
// Railway usa el puerto 8080 por defecto, esto lo detecta automáticamente
const PORT = process.env.PORT || 8080;

app.use(cors());
app.use(express.json());

app.get('/api/catalog/search', async (req, res) => {
    try {
        let { keyword, cursor = "" } = req.query;
        
        // Si no hay palabra clave, usamos "cool" para que siempre traiga ropa mezclada
        const busquedaEfectiva = (keyword && keyword.trim() !== "") ? keyword : "cool";

        // URL Maestra: Category 0 trae TODO (Ropa clásica, 3D, Accesorios, Caras)
        const url = `https://catalog.roproxy.com/v1/search/items/details?category=0&limit=30&keyword=${encodeURIComponent(busquedaEfectiva)}&cursor=${cursor}`;

        console.log(`Buscando en Roblox: ${url}`);

        const response = await fetch(url, {
            headers: { 'User-Agent': 'Mozilla/5.0' },
            timeout: 10000
        });

        const data = await response.json();
        const items = data.data || [];

        // Limpiamos los datos para el LocalScript
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
        console.error("Error en el servidor:", err);
        res.status(200).json({ data: [], nextCursor: "" });
    }
});

// 0.0.0.0 es necesario para que Railway acepte conexiones externas
app.listen(PORT, '0.0.0.0', () => {
    console.log(`Servidor de Mezcla Total funcionando en puerto ${PORT}`);
});
