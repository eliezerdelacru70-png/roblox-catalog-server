const express = require('express');
const cors = require('cors');

const app = express();
const PORT = process.env.PORT || 8080;

app.use(cors());
app.use(express.json());

app.get('/api/catalog/search', async (req, res) => {
    try {
        const keyword = req.query.keyword || "";
        const limit = req.query.limit || 60;
        const cursor = req.query.cursor || "";
        const category = req.query.category || "AllCategories";
        const assetType = req.query.assetType || "";

        let url = `https://catalog.roblox.com/v2/search/items/details?limit=${limit}`;
        
        // Siempre incluir categoría y sortType (la API v2 lo requiere)
        url += `&category=${encodeURIComponent(category)}&sortType=1`;

        if (assetType) {
            url += `&assetType=${encodeURIComponent(assetType)}`;
        }

        if (keyword) {
            url += `&keyword=${encodeURIComponent(keyword)}`;
        }

        if (cursor) {
            url += `&cursor=${encodeURIComponent(cursor)}`;
        }

        console.log("🔎 Petición enviada a Roblox (API v2):", url);

        const response = await fetch(url, {
            headers: {
                "Accept": "application/json",
                "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64)"
            }
        });

        if (!response.ok) {
            console.error(`❌ Error HTTP: ${response.status}`);
            throw new Error(`Roblox API v2 Error ${response.status}`);
        }

        const data = await response.json();
        let items = [];

        for (const item of data.data || []) {
            if (!item.name || item.name.trim() === "") continue;

            // Detectar bundles por itemType
            const isBundle = item.itemType === "Bundle";
            
            items.push({
                id: item.id,
                name: item.name,
                price: item.price ?? 0,
                assetType: isBundle ? 0 : (item.assetType || 0),
                creator: item.creatorName || "Roblox"
            });
        }

        console.log(`✅ Enviados ${items.length} items | Siguiente: ${data.nextPageCursor ? "SÍ" : "NO"}`);

        res.json({
            data: items,
            nextPageCursor: data.nextPageCursor || null
        });

    } catch (error) {
        console.error("❌ Error:", error.message);
        res.json({
            data: [],
            nextPageCursor: null
        });
    }
});

app.listen(PORT, () => {
    console.log(`🚀 Servidor corriendo en el puerto ${PORT}`);
});
