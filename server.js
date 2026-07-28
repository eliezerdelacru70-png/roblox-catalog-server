const express = require('express');
const cors = require('cors');

const app = express();
const PORT = process.env.PORT || 8080;

app.use(cors());
app.use(express.json());


app.get('/api/catalog/search', async (req, res) => {
    try {
        const keyword = req.query.keyword || '';
        const limit = req.query.limit || '50';
        const cursor = req.query.cursor || '';

        let url = `https://catalog.roblox.com/v2/search/items/details?limit=${limit}`;

        if (keyword) {
            url += `&keyword=${encodeURIComponent(keyword)}`;
        }

        if (cursor) {
            url += `&cursor=${encodeURIComponent(cursor)}`;
        }

        console.log("🔎 Roblox API:", url);


        const response = await fetch(url, {
            headers: {
                "User-Agent": "Roblox/WinInet",
                "Accept": "application/json"
            }
        });


        if (!response.ok) {
            throw new Error(`Roblox API error ${response.status}`);
        }


        const data = await response.json();


        const items = Array.isArray(data.data)
            ? data.data
            : [];


        const mappedItems = items.map(item => ({
            id: item.id,
            name: item.name || "Sin nombre",
            price: item.price || 0,
            assetType: item.assetType || 0,
            creatorName: item.creator?.name || "Roblox"
        }));


        res.json({
            data: mappedItems,
            nextPageCursor: data.nextPageCursor || null
        });


        console.log(`✅ Enviados ${mappedItems.length} items`);

    } catch (error) {

        console.error("❌ Error:", error.message);


        res.json({
            data: [],
            nextPageCursor: null
        });
    }
});


app.listen(PORT, "0.0.0.0", () => {
    console.log(`🚀 Servidor corriendo en puerto ${PORT}`);
});
