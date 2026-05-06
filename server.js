app.get("/api/catalog/search", async (req, res) => {
    try {
        const keyword = req.query.keyword || "";

        const url = `https://catalog.roproxy.com/v1/search/items/details?limit=30&keyword=${encodeURIComponent(keyword)}&sortType=Relevance`;

        const response = await fetch(url);
        const data = await response.json();

        const cleaned = (data.data || []).map(item => {
            return {
                id: item.id,
                name: item.name,
                description: item.description || "Sin descripción",
                creator: item.creatorName || "Desconocido",
                price: item.price || 0,
                image: item.imageUrl,
                type: item.itemType || "Unknown"
            };
        });

        res.json({ data: cleaned });

    } catch (err) {
        console.error(err);
        res.status(500).json({ error: "ERROR" });
    }
});
