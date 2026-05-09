const express = require('express');
const cors = require('cors');
const fetch = require('node-fetch');

const app = express();
const PORT = process.env.PORT || 8080;

app.use(cors());
app.use(express.json());

// Mapeo de números de AssetType a nombres
const ASSET_TYPE_NAMES = {
    1: "Hat", 2: "HairAccessory", 3: "Face", 4: "EyebrowAccessory", 5: "EyelashAccessory",
    6: "Shirt", 7: "Pants", 8: "TShirt", 9: "ShirtGraphic", 10: "ShortsAccessory",
    11: "LeftShoeAccessory", 12: "RightShoeAccessory", 13: "DressSkirtAccessory",
    14: "DressSkirtAccessory", 15: "JacketAccessory", 16: "SweaterAccessory",
    17: "TShirt", 18: "Pants", 19: "Shirt", 27: "Head", 28: "Face", 29: "Gear",
    30: "Hat", 31: "HairAccessory", 32: "EyebrowAccessory", 33: "EyelashAccessory",
    34: "LeftShoeAccessory", 35: "RightShoeAccessory", 36: "DressSkirtAccessory",
    37: "DressSkirtAccessory", 38: "JacketAccessory", 39: "SweaterAccessory",
    40: "TShirt", 41: "Gear", 42: "FaceAccessory", 43: "NeckAccessory",
    44: "ShoulderAccessory", 45: "FrontAccessory", 46: "BackAccessory",
    47: "WaistAccessory", 48: "ClimbAnimation", 49: "RunAnimation",
    50: "JumpAnimation", 51: "EmoteAnimation", 52: "Head", 53: "Face",
    54: "Torso", 55: "RightArm", 56: "LeftArm", 57: "LeftLeg", 58: "RightLeg",
    59: "DynamicHead", 61: "FaceAccessory", 62: "NeckAccessory",
    63: "ShoulderAccessory", 64: "FrontAccessory", 65: "BackAccessory",
    66: "WaistAccessory", 67: "ClimbAnimation", 68: "RunAnimation",
    69: "JumpAnimation", 70: "ShirtAccessory", 71: "PantsAccessory",
    72: "TShirtAccessory", 73: "JacketAccessory", 74: "SweaterAccessory",
    75: "ShortsAccessory", 76: "LeftShoeAccessory", 77: "RightShoeAccessory",
    78: "DressSkirtAccessory"
};

const BUNDLE_TYPE_NAMES = {
    1: "BodyParts", 2: "Shoes", 3: "DynamicHead", 4: "Head"
};

const ENUM_TO_ASSET_TYPE = {
    "Hat": "Hat", "HairAccessory": "HairAccessory", "EyebrowAccessory": "EyebrowAccessory",
    "EyelashAccessory": "EyelashAccessory", "FaceAccessory": "FaceAccessory",
    "NeckAccessory": "NeckAccessory", "ShoulderAccessory": "ShoulderAccessory",
    "FrontAccessory": "FrontAccessory", "BackAccessory": "BackAccessory",
    "WaistAccessory": "WaistAccessory", "ShirtAccessory": "ShirtAccessory",
    "SweaterAccessory": "SweaterAccessory", "TShirtAccessory": "TShirtAccessory",
    "JacketAccessory": "JacketAccessory", "PantsAccessory": "PantsAccessory",
    "ShortsAccessory": "ShortsAccessory", "DressSkirtAccessory": "DressSkirtAccessory",
    "LeftShoeAccessory": "LeftShoeAccessory", "RightShoeAccessory": "RightShoeAccessory",
    "Shirt": "Shirt", "Pants": "Pants", "TShirt": "TShirt", "Gear": "Gear",
    "Face": "Face", "Head": "Head", "Torso": "Torso", "RightArm": "RightArm",
    "LeftArm": "LeftArm", "RightLeg": "RightLeg", "LeftLeg": "LeftLeg",
    "ClimbAnimation": "ClimbAnimation", "RunAnimation": "RunAnimation",
    "JumpAnimation": "JumpAnimation", "EmoteAnimation": "EmoteAnimation"
};

const ENUM_TO_BUNDLE_TYPE = {
    "BodyParts": "BodyParts", "Shoes": "Shoes", "DynamicHead": "DynamicHead", "Head": "Head"
};

// CONFIGURACIÓN: Máximo de items por creador por página
const MAX_ITEMS_PER_CREATOR = 5;

function getAssetTypeName(assetTypeId) {
    return ASSET_TYPE_NAMES[assetTypeId] || "Hat";
}

function getBundleTypeName(bundleTypeId) {
    return BUNDLE_TYPE_NAMES[bundleTypeId] || "BodyParts";
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

function matchesBundleType(itemBundleType, requestedTypes) {
    if (!requestedTypes || requestedTypes.length === 0) return true;
    const itemTypeName = getBundleTypeName(itemBundleType);
    for (const requestedType of requestedTypes) {
        const typeName = ENUM_TO_BUNDLE_TYPE[requestedType] || requestedType;
        if (itemTypeName === typeName) return true;
    }
    return false;
}

// FUNCIÓN: Limitar items por creador
function limitItemsPerCreator(items, maxPerCreator) {
    const creatorCounts = {};
    const filteredItems = [];
    
    for (const item of items) {
        const creatorId = item.CreatorTargetId || 0;
        const count = creatorCounts[creatorId] || 0;
        
        if (count < maxPerCreator) {
            filteredItems.push(item);
            creatorCounts[creatorId] = count + 1;
        }
    }
    
    return filteredItems;
}

app.get('/api/catalog/search', async (req, res) => {
    try {
        const keyword = req.query.keyword || '';
        const cursor = req.query.cursor || '';
        const limit = parseInt(req.query.limit) || 200;
        const assetTypesParam = req.query.assetTypes || '';
        const bundleTypesParam = req.query.bundleTypes || '';

        let requestedAssetTypes = assetTypesParam ? assetTypesParam.split(',').map(t => t.trim()) : [];
        let requestedBundleTypes = bundleTypesParam ? bundleTypesParam.split(',').map(t => t.trim()) : [];

        let allItems = [];

        // ===== BUSCAR ASSETS =====
        let assetUrl = `https://catalog.roproxy.com/v2/search/items/details?category=all&limit=${limit}&sortType=3`;
        if (keyword) assetUrl += `&keyword=${encodeURIComponent(keyword)}`;
        if (cursor) assetUrl += `&cursor=${cursor}`;

        console.log(`🔗 Fetching Assets: ${assetUrl}`);

        const assetResponse = await fetch(assetUrl, {
            headers: { 'User-Agent': 'Roblox/WinInet', 'Accept': 'application/json' }
        });

        if (assetResponse.ok) {
            const assetData = await assetResponse.json();
            let assetItems = Array.isArray(assetData.data) ? assetData.data : [];

            if (requestedAssetTypes.length > 0) {
                assetItems = assetItems.filter(item => matchesAssetType(item.assetType, requestedAssetTypes));
            }

            assetItems.forEach(item => {
                allItems.push({
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
                    CreatorHasVerifiedBadge: item.creator?.hasVerifiedBadge || false,
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
                });
            });
        }

        // ===== BUSCAR BUNDLES (Personajes 3D) =====
        const shouldFetchBundles = requestedBundleTypes.length > 0 || 
                                   (requestedAssetTypes.length === 0 && requestedBundleTypes.length === 0);

        if (shouldFetchBundles) {
            let bundleUrl = `https://catalog.roproxy.com/v2/search/items/details?category=AvatarBundles&limit=${limit}&sortType=3`;
            if (keyword) bundleUrl += `&keyword=${encodeURIComponent(keyword)}`;

            console.log(`🔗 Fetching Bundles: ${bundleUrl}`);

            const bundleResponse = await fetch(bundleUrl, {
                headers: { 'User-Agent': 'Roblox/WinInet', 'Accept': 'application/json' }
            });

            if (bundleResponse.ok) {
                const bundleData = await bundleResponse.json();
                let bundleItems = Array.isArray(bundleData.data) ? bundleData.data : [];

                if (requestedBundleTypes.length > 0) {
                    bundleItems = bundleItems.filter(item => matchesBundleType(item.bundleType, requestedBundleTypes));
                }

                bundleItems.forEach(item => {
                    allItems.push({
                        Id: item.id,
                        Name: item.name || "Sin nombre",
                        ItemType: "Bundle",
                        BundleType: getBundleTypeName(item.bundleType),
                        Price: item.price || 0,
                        ProductId: item.productId || item.id,
                        IsPurchasable: true,
                        IsOffSale: false,
                        CreatorName: item.creator?.name || "Desconocido",
                        CreatorTargetId: item.creator?.id || 0,
                        CreatorType: item.creator?.type || "User",
                        CreatorHasVerifiedBadge: item.creator?.hasVerifiedBadge || false,
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
                    });
                });
            }
        }

        // ===== APLICAR LÍMITE POR CREADOR =====
        allItems = limitItemsPerCreator(allItems, MAX_ITEMS_PER_CREATOR);

        // ===== MEZCLAR ITEMS PARA VARIEDAD =====
        allItems.sort(() => Math.random() - 0.5);

        console.log(`✅ Enviados ${allItems.length} items (limitados a ${MAX_ITEMS_PER_CREATOR} por creador)`);

        res.json({
            items: allItems,
            hasMore: true,
            nextCursor: cursor || null
        });

    } catch (err) {
        console.error(`❌ Error: ${err.message}`);
        res.status(200).json({ items: [], hasMore: false, nextCursor: null });
    }
});

app.listen(PORT, '0.0.0.0', () => {
    console.log(`✅ Servidor corriendo en puerto ${PORT}`);
});
