const express = require('express');
const cors = require('cors');
const fetch = require('node-fetch');

const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());

app.get('/api/catalog/search', async (req, res) => {
    try {
        const { keyword = "", cursor = "" } = req.query;
        
        // URL Blindada: Si no hay keyword, busca por relevancia general
        const queryParam = keyword ? `&keyword=${encodeURIComponent(keyword)}` : "";
        const url = `https://catalog.roproxy.com/v1/search/items/details?limit=30${queryParam}&cursor=${cursor}&category=1&subcategory=1`;

        const response = await fetch(url, {
            headers: { 'User-Agent': 'Mozilla/5.0' }
        });

        const data = await response.json();
        
        // Si data.data no existe o está vacío, intentamos un fallback rápido
        let items = data.data || [];
        
        if (items.length === 0 && !keyword) {
            // Menú de emergencia: Si no hay nada, trae los más vendidos de ropa clásica
            const fallbackRes = await fetch(`https://catalog.roproxy.com/v1/search/items/details?limit=30&category=3&subcategory=3`);
            const fallbackData = await fallbackRes.json();
            items = fallbackData.data || [];
        }

        const cleaned = items.map(item => ({
            assetId: item.id,
            titulo: item.name || "Objeto",
            precio: item.price || 0
        }));

        res.json({
            data: cleaned,
            nextCursor: data.nextPageCursor || ""
        });

    } catch (err) {
        res.status(200).json({ data: [], nextCursor: "" });
    }
});

app.listen(PORT, () => console.log(`Server on ${PORT}`));
