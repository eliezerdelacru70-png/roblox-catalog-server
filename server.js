const express = require('express');
const fetch = require('node-fetch');
const cors = require('cors');

const app = express();
const PORT = process.env.PORT || 8080;

app.use(cors());

app.get('/api/catalog/search', async (req, res) => {
    try {
        const keyword = (req.query.keyword || "").trim();
        const cursor = req.query.cursor || "";
        const limit = Math.min(parseInt(req.query.limit) || 60, 120);
        const assetTypeIds = req.query.assetTypeIds || "";

        let url = `https://catalog.roproxy.com/v2/search/items/details?category=all&limit=${limit}&sortType=3`;

        if (keyword) {
            url += `&keyword=${encodeURIComponent(keyword)}`;
        }
        if (cursor) {
            url += `&cursor=${cursor}`;
        }
        if (assetTypeIds) {
            url += `&assetTypeIds=${assetTypeIds}`;
        }

        console.log("🔗 Llamando a roproxy:", url);

        const response = await fetch(url, {
            headers: { 
                'User-Agent': 'Roblox/WinInet',
                'Accept': 'application/json'
            }
        });

        if (!response.ok) {
            console.error(`❌ roproxy devolvió ${response.status}`);
            return res.status(502).json({ 
                data: [], 
                nextPageCursor: "",
                error: `roproxy error ${response.status}`
            });
        }
        
        const data = await response.json();
        console.log(`✅ roproxy OK - ${data.data ? data.data.length : 0} items`);
        res.json(data);

    } catch (err) {
        console.error("❌ Error crítico en servidor:", err.message);
        res.status(500).json({ 
            data: [], 
            nextPageCursor: "",
            error: err.message 
        });
    }
});

app.listen(PORT, '0.0.0.0', () => {
    console.log(`✅ Servidor corriendo en puerto ${PORT}`);
});
