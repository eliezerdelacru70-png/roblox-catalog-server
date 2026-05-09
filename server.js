const express = require('express');
const cors = require('cors');
const fetch = require('node-fetch');

const app = express();
const PORT = process.env.PORT || 8080;

app.use(cors());
app.use(express.json());

// Mapeo de números de AssetType a nombres VÁLIDOS de Enum.AvatarAssetType
const ASSET_TYPE_NAMES = {
    1: "Hat",
    2: "HairAccessory",
    3: "Face",
    4: "EyebrowAccessory",
    5: "EyelashAccessory",
    6: "Shirt",
    7: "Pants",
    8: "TShirt",
    9: "ShirtGraphic",
    10: "ShortsAccessory",
    11: "LeftShoeAccessory",
    12: "RightShoeAccessory",
    13: "DressSkirtAccessory",
    14: "DressSkirtAccessory",
    15: "JacketAccessory",
    16: "SweaterAccessory",
    17: "TShirt",
    18: "Pants",
    19: "Shirt",
    27: "Head",
    28: "Face",
    29: "Gear",
    30: "Hat",
    31: "HairAccessory",
    32: "EyebrowAccessory",
    33: "EyelashAccessory",
    34: "LeftShoeAccessory",
    35: "RightShoeAccessory",
    36: "DressSkirtAccessory",
    37: "DressSkirtAccessory",
    38: "JacketAccessory",
    39: "SweaterAccessory",
    40: "TShirt",
    41: "Gear",
    42: "FaceAccessory",
    43: "NeckAccessory",
    44: "ShoulderAccessory",
    45: "FrontAccessory",
    46: "BackAccessory",
    47: "WaistAccessory",
    48: "ClimbAnimation",
    49: "RunAnimation",
    50: "JumpAnimation",
    51: "EmoteAnimation",
    52: "Head",
    53: "Face",
    54: "Torso",
    55: "RightArm",
    56: "LeftArm",
    57: "LeftLeg",
    58: "RightLeg",
    59: "DynamicHead",
    61: "FaceAccessory",
    62: "NeckAccessory",
    63: "ShoulderAccessory",
    64: "FrontAccessory",
    65: "BackAccessory",
    66: "WaistAccessory",
    67: "ClimbAnimation",
    68: "RunAnimation",
    69: "JumpAnimation",
    70: "ShirtAccessory",
    71: "PantsAccessory",
    72: "TShirtAccessory",
    73: "JacketAccessory",
    74: "SweaterAccessory",
    75: "ShortsAccessory",
    76: "LeftShoeAccessory",
    77: "RightShoeAccessory",
    78: "DressSkirtAccessory"
};

// Mapeo de nombres de Enum a nombres de AssetType para filtrado
const ENUM_TO_ASSET_TYPE = {
    "Hat": "Hat",
    "HairAccessory": "HairAccessory",
    "EyebrowAccessory": "EyebrowAccessory",
    "EyelashAccessory": "EyelashAccessory",
    "FaceAccessory": "FaceAccessory",
    "NeckAccessory": "NeckAccessory",
    "ShoulderAccessory": "ShoulderAccessory",
    "FrontAccessory": "FrontAccessory",
    "BackAccessory": "BackAccessory",
    "WaistAccessory": "WaistAccessory",
    "ShirtAccessory": "ShirtAccessory",
    "SweaterAccessory": "SweaterAccessory",
    "TShirtAccessory": "TShirtAccessory",
    "JacketAccessory": "JacketAccessory",
    "PantsAccessory": "PantsAccessory",
    "ShortsAccessory": "ShortsAccessory",
    "DressSkirtAccessory": "DressSkirtAccessory",
    "LeftShoeAccessory": "LeftShoeAccessory",
    "RightShoeAccessory": "RightShoeAccessory",
    "Shirt": "Shirt",
    "Pants": "Pants",
    "TShirt": "TShirt",
    "Gear": "Gear",
    "Face": "Face",
    "Head": "Head"
};

function getAssetTypeName(assetTypeId) {
    return ASSET_TYPE_NAMES[assetTypeId] || "Hat";
}

function matchesAssetType(itemAssetType, requestedTypes) {
    if (!requestedTypes || requestedTypes.length === 0) return true;
    
    const itemTypeName = getAssetTypeName(itemAssetType);
    
    for (const requestedType of requestedTypes) {
        const typeName = ENUM_TO_ASSET_TYPE[requestedType] || requestedType;
        if (itemTypeName === typeName) return true;
    }
    return false;
}

app.get('/api/catalog/search', async (req, res) => {
    try {
        const keyword = req.query.keyword || '';
        const cursor = req.query.cursor || '';
        const limit = req.query.limit || '200';
        const assetTypesParam = req.query.assetTypes || '';

        let requestedAssetTypes = [];
        if (assetTypesParam) {
            requestedAssetTypes = assetTypesParam.split(',').map(t => t.trim());
        }

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

        let items = Array.isArray(data.data) ? data.data : [];
        
        if (requestedAssetTypes.length > 0) {
            items = items.filter(item => matchesAssetType(item.assetType, requestedAssetTypes));
        }

        items = items.map(item => ({
            Id: item.id,
            Name: item.name || "Sin nombre",
            ItemType: "Asset",
            AssetType: getAssetTypeName(item.assetType),
            Price: item.price || 0,
            ProductId: item.productId || item.id,
            IsPurchasable: true,
            IsOffSale: false,
            CreatorName: item.creator?.name || "Desconocido",
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
            PriceStatus: item.price ? null : "Gratis"
        }));

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
});
