const express = require('express');
const cors = require('cors');
const fetch = require('node-fetch');

const app = express();
const PORT = process.env.PORT || 8080;

app.use(cors());
app.use(express.json());

app.get('/api/catalog/search', async (req, res) => {
    try {
        const { keyword = "", cursor = "" } = req.query;

        // CONFIGURACIÓN DE ALTO NIVEL:
        // category: 0 (Todo), salesType: 1 (Solo a la venta), sortType: 2 (Más vendidos/Populares)
        // Esto es lo que usan los juegos top para que siempre aparezca ropa "cool"
        let url = `https://catalog.roproxy.com/v1/search/items/details?category=0&limit=30&salesType=1&sortType=2&keyword=${encodeURIComponent(keyword)}&cursor=${cursor}`;

        const response = await fetch(url, {
            headers: { 
                'User-Agent': 'Mozilla/5.0',
                'Accept': 'application/json'
            },
            timeout: 15000 
        });

        const data = await response.json();
        
        if (!data.data || data.data.length === 0) {
            // Si por alguna razón falla, intentamos una búsqueda de emergencia por relevancia
            const backupUrl = `https://catalog.roproxy.com/v1/search/items/details?category=0&limit=30&sortType=1&keyword=trend`;
            const backupRes = await fetch(backupUrl);
            const backupData = await backupRes.json();
            return res.json({
                data: formatItems(backupData.data || []),
                nextCursor: backupData.nextPageCursor || ""
            });
        }

        res.json({
            data: formatItems(data.data),
            nextCursor: data.nextPageCursor || ""
        });

    } catch (err) {
        console.error("Critical Error:", err);
        res.status(500).json({ data: [], error: "Internal Server Error" });
    }
});

function formatItems(items) {
    return items.map(item => ({
        assetId: item.id,
        titulo: item.name || "Sin nombre",
        precio: item.price || 0,
        tipo: item.assetType // Guardamos el tipo por si quieres filtrar después
    }));
}

app.listen(PORT, '0.0.0.0', () => console.log(`🚀 API Pro corriendo en puerto ${PORT}`));
