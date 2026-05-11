const express = require('express');
const cors = require('cors');
const fetch = require('node-fetch');

const app = express();
const PORT = process.env.PORT || 8080;

app.use(cors());
app.use(express.json());

const ASSET_TYPE_NAMES = {
    24: "Animation",
    48: "ClimbAnimation",
    49: "RunAnimation",
    50: "JumpAnimation",
    51: "FallAnimation",
    52: "IdleAnimation",
    53: "WalkAnimation",
    54: "PoseAnimation",
    61: "EmoteAnimation"
};

function getAssetTypeName(assetTypeId) {
    return ASSET_TYPE_NAMES[assetTypeId] || "EmoteAnimation";
}

app.get('/api/catalog/search', async (req, res) => {
    try {
        const keyword = req.query.keyword || '';
        const limit = req.query.limit || '50';

        // URL corregida: usar endpoint de búsqueda general con assetType para emotes
        let url = `https://catalog.roproxy.com/v1/search/items/details?` +
                  `category=All&` +
                  `limit=${limit}&` +
                  `creatorTargetId=1&` +
                  `resultsPerPage=${limit}`;

        if (keyword) {
            url += `&keyword=${encodeURIComponent(keyword)}`;
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

        // Filtrar solo animaciones/emotes (assetType 24 o 61)
        items = items.filter(item => 
            item.assetType === 24 || 
            item.assetType === 61 ||
            item.assetType === 48 ||
            item.assetType === 49 ||
            item.assetType === 50 ||
            item.assetType === 51 ||
            item.assetType === 52 ||
            item.assetType === 53 ||
            item.assetType === 54
        );

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
