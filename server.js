const express = require('express');
const cors = require('cors');
const fetch = require('node-fetch');

const app = express();
const PORT = process.env.PORT || 8080;

app.use(cors());
app.use(express.json());

app.get('/api/catalog/search', async (req, res) => {
    try {
        const keyword = req.query.keyword || '';
        const limit = req.query.limit || '50';

        // URL simplificada - sin filtros de categoría
       let url = `https://catalog.roproxy.com/v2/search/items/details?` +
          `categoryFilter=CommunityCreations&` +
          `limit=${limit}`;

if (keyword) {
    url += `&keyword=${encodeURIComponent(keyword)}`;
}

        console.log(`🎬 Buscando: ${url}`);

        const response = await fetch(url, {
            headers: {
                'User-Agent': 'Roblox/WinInet',
                'Accept': 'application/json'
            }
        });

        if (!response.ok) {
            throw new Error(`API error: ${response.status}`);
        }

        const data = await response.json();
        let items = Array.isArray(data.data) ? data.data : [];

        // NO filtrar - devolver todos los resultados
        const mappedItems = items.map(item => ({
            Id: item.id,
            Name: item.name || "Sin nombre",
            ItemType: "Asset",
            AssetType: item.assetType || 0,
            Price: item.price || 0,
            ProductId: item.productId || item.id,
            CreatorName: item.creatorName || "Roblox",
            Description: item.description || ""
        }));

        res.json({
            items: mappedItems,
            hasMore: !!data.nextPageCursor,
            nextCursor: data.nextPageCursor || null
        });

        console.log(`✅ Enviados ${mappedItems.length} items.`);

    } catch (err) {
        console.error(`❌ Error: ${err.message}`);
        // Devolver datos de prueba si falla
        res.json({
            items: [
                {Id: "507771019", Name: "Dance Spin", Price: 0},
                {Id: "507776330", Name: "Dance Loop", Price: 0},
                {Id: "507777268", Name: "Dance Wave", Price: 0}
            ],
            hasMore: false,
            nextCursor: null
        });
    }
});

app.listen(PORT, '0.0.0.0', () => {
    console.log(`🚀 Servidor corriendo en puerto ${PORT}`);
});
