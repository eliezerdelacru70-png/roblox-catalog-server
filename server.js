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
        // Usamos categoría 1 (Ropa/Accesorios) por defecto si no se envía nada
        const category = req.query.category || "1"; 

        const url = `https://catalog.roproxy.com/v1/search/items/details?limit=30&keyword=${encodeURIComponent(keyword)}&cursor=${cursor}&category=${category}`;

        let data;
        try {
            const response = await fetch(url);

            if (!response.ok) {
                console.error(`Proxy returned non-OK status: ${response.status} ${response.statusText} for URL: ${url}`);
                return res.json({ data: [], error: "PROXY_ERROR" });
            }

            data = await response.json();
        } catch (fetchErr) {
            console.error("Fetch or JSON parse error:", fetchErr);
            return res.json({ data: [], error: "PROXY_ERROR" });
        }

        // Limpiamos los datos para que Roblox los entienda fácil
        const items = Array.isArray(data.data) ? data.data : [];
        const cleaned = items.map(item => ({
            id: item.id,
            name: item.name,
            price: item.price || 0,
            itemType: item.itemType
        }));

        res.json({
            data: cleaned,
            nextCursor: data.nextPageCursor || ""
        });

    } catch (err) {
        console.error("Unexpected server error:", err);
        res.json({ data: [], error: "PROXY_ERROR" });
    }
});

app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
