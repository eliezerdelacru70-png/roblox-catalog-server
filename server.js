const express = require('express');
const fetch = require('node-fetch');
const cors = require('cors');

const app = express();
const PORT = process.env.PORT || 8080;

app.use(cors());

app.get('/api/catalog/search', async (req, res) => {
    try {
        const keyword = req.query.keyword || "";
        const cursor = req.query.cursor || "";
        const limit = parseInt(req.query.limit) || 60;
        const assetTypeIds = req.query.assetTypeIds || "";

        let url = `https://catalog.roproxy.com/v2/search/items/details?` +
            `category=all&` +
            `limit=${limit}&` +
            `sortType=3`;   // 3 = Más vendidos

        if (keyword) {
            url += `&keyword=${encodeURIComponent(keyword)}`;
        }
        if (cursor) {
            url += `&cursor=${cursor}`;
        }
        if (assetTypeIds) {
            url += `&assetTypeIds=${assetTypeIds}`;
        }

        console.log("🔗 Llamando a:", url);

        const response = await fetch(url, {
            headers: { 
                'User-Agent': 'Roblox/WinInet',
                'Accept': 'application/json'
            }
        });

        if (!response.ok) {
            console.error(`❌ roproxy error: ${response.status}`);
            throw new Error(`roproxy ${response.status}`);
        }
        
        const data = await response.json();
        res.json(data);

    } catch (err) {
        console.error("❌ Error en servidor:", err.message);
        res.status(500).json({ 
            data: [], 
            nextPageCursor: "",
            error: "Error interno del servidor"
        });
    }
});

app.listen(PORT, '0.0.0.0', () => {
    console.log(`✅ Servidor catálogo corriendo en puerto ${PORT}`);
});
