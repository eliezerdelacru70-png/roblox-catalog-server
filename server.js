const express = require('express');
const cors = require('cors');
const fetch = require('node-fetch');

const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());

app.get("/api/catalog/search", async (req, res) => {
    try {
        const keyword = req.query.keyword || "";
        const cursor = req.query.cursor || "";
        // Usamos categoría 0 (todas las categorías) por defecto si no se envía nada
        const category = req.query.category || "0";

        const url = `https://catalog.roproxy.com/v1/search/items/details?limit=30&keyword=${encodeURIComponent(keyword)}&cursor=${cursor}&category=0&subcategory=0`;

        let data;
        try {
            const response = await fetch(url);

            if (!response.ok) {
                console.error(`Proxy returned non-OK status: ${response.status} ${response.statusText} for URL: ${url}`);
                return res.status(200).json({ data: [], nextCursor: "" });
            }

            data = await response.json();
        } catch (fetchErr) {
            console.error("Fetch or JSON parse error:", fetchErr);
            return res.status(200).json({ data: [], nextCursor: "" });
        }

        // Mapeamos los datos al formato exacto que espera el cliente de Roblox
        const items = Array.isArray(data.data) ? data.data : [];
        const cleaned = items.map(item => ({
            assetId: item.id,
            titulo: item.name,
            precio: item.price != null ? item.price : 0
        }));

        res.json({
            data: cleaned,
            nextCursor: data.nextPageCursor || ""
        });

    } catch (err) {
        console.error("Unexpected server error:", err);
        res.status(200).json({ data: [], nextCursor: "" });
    }
});

app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
