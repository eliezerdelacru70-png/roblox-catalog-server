const express = require('express');
const cors = require('cors');
const fetch = require('node-fetch');

const app = express();
const PORT = process.env.PORT || 8080;

app.use(cors());
app.use(express.json());

// Mapeo de números de AssetType a nombres que Roblox espera
const ASSET_TYPE_NAMES = {
    1: "Hat",
    2: "Hair",
    3: "Face",
    4: "Eyebrow",
    5: "Eyelash",
    6: "Shirt",
    7: "Pants",
    8: "TShirt",
    9: "ShirtGraphic",
    10: "Shorts",
    11: "LeftShoe",
    12: "RightShoe",
    13: "Dress",
    14: "Skirt",
    15: "Jacket",
    16: "Sweater",
    17: "TShirt",
    18: "Pants",
    19: "Shirt",
    27: "Head",
    28: "Face",
    29: "Gear",
    30: "Hat",
    31: "Hair",
    32: "Eyebrow",
    33: "Eyelash",
    34: "LeftShoe",
    35: "RightShoe",
    36: "Dress",
    37: "Skirt",
    38: "Jacket",
    39: "Sweater",
    40: "TShirt",
    41: "Gear",
    42: "FaceAccessory",
    43: "NeckAccessory",
    44: "ShoulderAccessory",
    45: "FrontAccessory",
    46: "BackAccessory",
    47: "WaistAccessory",
    48: "ClimbAccessory",
    49: "RunAccessory",
    50: "JumpAccessory",
    51: "EmoteAnimation",
    52: "Head",
    53: "Face",
    54: "AvatarPart",
    55: "AvatarAnimation"
};

function getAssetTypeName(assetTypeId) {
    return ASSET_TYPE_NAMES[assetTypeId] || "Unknown";
}

app.get('/api/catalog/search', async (req, res) => {
    try {
        const keyword = req.query.keyword || '';
        const cursor = req.query.cursor || '';
        const limit = req.query.limit || '30';

        let url = `https://catalog.roproxy.com/v2/search/items/details?` +
                  `category=all&` +
                  `limit=${limit}&` +
                  `sortType=3`;

        if (keyword) {
            url += `&keyword=${encodeURIComponent(keyword)}`;
        }
        if (cursor) {
            url += `&cursor=${cursor}`;
        }

        console.log(`🔗 Fetching: ${url}`);

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

        const items = Array.isArray(data.data) ? data.data.map(item => ({
            Id: item.id,
            Name: item.name || "Sin nombre",
            ItemType: "Asset",
            AssetType: getAssetTypeName(item.assetType),
            Price: item.price || 0,
            ProductId: item.productId || item.id,
            IsPurchasable: true,
            IsOffSale: false,
            CreatorName: item.creator?.name || "Unknown",
            CreatorTargetId: item.creator?.id || 0,
            CreatorType: item.creator?.type || "User",
            CreatorHasVerifiedBadge: false,
            Description: item.description || "",
            Owned: false,
            FavoriteCount: item.favoriteCount || 0,
            PurchaseCount: item.purchaseCount || 0,
            ItemRestrictions: [],
            ItemStatus: [],
            SaleLocation: "Website",
            LowestPrice: null,
            LowestResalePrice: null,
            PriceStatus: item.price ? null : "Free"
        })) : [];

        res.json({
            items: items,
            hasMore: !!data.nextPageCursor,
            nextCursor: data.nextPageCursor || null
        });

        console.log(`✅ Enviados ${items.length} items | NextCursor: ${data.nextPageCursor ? 'Sí' : 'No'}`);

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
    console.log(`✅ Servidor corriendo en puerto ${PORT}`);
});
