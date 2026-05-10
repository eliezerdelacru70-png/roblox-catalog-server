const express = require('express');
const cors = require('cors');
const fetch = require('node-fetch');

const app = express();
const PORT = process.env.PORT || 8080;

app.use(cors());
app.use(express.json());

// Mapeo centrado en Animaciones y Emotes
const ASSET_TYPE_NAMES = {
    24: "Animation",
    48: "ClimbAnimation",
    49: "RunAnimation",
    50: "JumpAnimation",
    51: "FallAnimation",
    52: "IdleAnimation",
    53: "WalkAnimation",
    54: "PoseAnimation",
    61: "EmoteAnimation" // Este es el principal para emotes del catálogo
};

function getAssetTypeName(assetTypeId) {
    return ASSET_TYPE_NAMES[assetTypeId] || "EmoteAnimation";
}

app.get('/api/catalog/search', async (req, res) => {
    try {
        const keyword = req.query.keyword || '';
        const cursor = req.query.cursor || '';
        const limit = req.query.limit || '100';

        // URL optimizada para buscar específicamente Emotes (Category 12, Subcategory 39)
        // Usamos category=12 para "Animations"
        let url = `https://catalog.roproxy.com/v1/search/items/details?` +
                  `category=12&` + 
                  `subcategory=39&` +
                  `limit=${limit}`;

        if (keyword) {
            url += `&keyword=${encodeURIComponent(keyword)}`;
        }
        if (cursor) {
            url += `&cursor=${cursor}`;
        }

        console.log(`🎬 Buscando Emotes: ${url}`);

        const response = await fetch(url, {
            headers: {
                'User-Agent': 'Roblox/WinInet',
                'Accept': 'application/json'
            }
        });

        if (!response.ok) {
            throw new Error(`roproxy error: ${response.status}`);
        }

        const data = await response.json();
        let items = Array.isArray(data.data) ? data.data : [];

        // Mapeamos los resultados al formato que tu juego ya entiende
        const mappedItems = items.map(item => ({
            Id: item.id,
            Name: item.name || "Emote sin nombre",
            ItemType: "Asset",
            AssetType: getAssetTypeName(item.assetType),
            Price: item.price || 0,
            ProductId: item.productId || item.id,
            CreatorName: item.creatorName || "Roblox",
            Description: item.description || "",
            PriceStatus: item.price ? null : "Gratis"
        }));

        res.json({
            items: mappedItems,
            hasMore: !!data.nextPageCursor,
            nextCursor: data.nextPageCursor || null
        });

        console.log(`✅ Enviados ${mappedItems.length} emotes.`);

    } catch (err) {
        console.error(`❌ Error: ${err.message}`);
        res.status(200).json({
            items: [],
            hasMore: false,
            nextCursor: null
        });
    }
});

app.listen(PORT, '0.0.0.0', () => {
    console.log(`🚀 Servidor de Emotes corriendo en puerto ${PORT}`);
});
