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
        const cursor = req.query.cursor || '';
        const limit = req.query.limit || '30';
        const assetTypes = req.query.assetTypes || '';
        const bundleTypes = req.query.bundleTypes || '';

        // Endpoint de roproxy
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

        // Transformar al formato que Roblox espera
        const items = Array.isArray(data.data) ? data.data.map(item => ({
            Id: item.id,
            Name: item.name || "Sin nombre",
            ItemType: "Asset",
            AssetType: item.assetType || "Unknown",
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
