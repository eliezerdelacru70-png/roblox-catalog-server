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
        const category = req.query.category || "";
        const assetType = req.query.assetType || "";

        // URL base de la API oficial de Roblox Catalog (v1)
        let url = `https://catalog.roblox.com/v1/search/items/details?limit=${limit}`;

        // Si no se especifica búsqueda ni categoría, forzamos Category=3 (Clothing/Ropa)
        // para garantizar que la API de Roblox siempre devuelva resultados.
        if (!keyword && !category && !assetType) {
            url += `&Category=3`;
        } else {
            if (category) url += `&Category=${encodeURIComponent(category)}`;
            if (assetType) url += `&AssetType=${encodeURIComponent(assetType)}`;
        }

        if (keyword) {
            url += `&Keyword=${encodeURIComponent(keyword)}`;
        }

        if (cursor) {
            url += `&cursor=${encodeURIComponent(cursor)}`;
        }

        console.log("🔎 Petición enviada a Roblox:", url);

        const response = await fetch(url, {
            headers: {
                "Accept": "application/json",
                "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64)"
            }
        });

        if (!response.ok) {
            console.error(`❌ Error HTTP devuelto por Roblox: ${response.status}`);
            throw new Error(`Roblox API Error ${response.status}`);
        }

        const data = await response.json();
        let items = [];

        for (const item of data.data || []) {
            // Filtrar elementos vacíos o sin nombre
            if (!item.name || item.name.trim() === "") {
                continue;
            }

            items.push({
                id: item.id,
                name: item.name,
                price: item.price ?? 0,
                assetType: item.assetType || 0,
                creator: item.creatorName || "Roblox"
            });
        }

        console.log(`✅ Enviados ${items.length} items | Tiene siguiente página: ${data.nextPageCursor ? "SÍ" : "NO"}`);

        res.json({
            data: items,
            nextPageCursor: data.nextPageCursor || null
        });

    } catch (error) {
        console.error("❌ Error en el servidor backend:", error.message);
        res.json({
            data: [],
            nextPageCursor: null
        });
    }
});

app.listen(PORT, "0.0.0.0", () => {
    console.log(`🚀 Servidor corriendo en puerto ${PORT}`);
});
