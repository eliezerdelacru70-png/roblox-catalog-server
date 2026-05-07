const express = require('express');
const fetch = require('node-fetch');
const app = express();

// Railway nos da el puerto automáticamente, si no usa el 8080
const PORT = process.env.PORT || 8080;

app.get('/api/catalog/search', async (req, res) => {
    try {
        const keyword = req.query.keyword || "cool";
        const cursor = req.query.cursor || "";
        
        // URL para traer TODO (3D y Clásico)
        const url = `https://catalog.roproxy.com/v1/search/items/details?category=0&limit=30&keyword=${encodeURIComponent(keyword)}&cursor=${cursor}`;

        const response = await fetch(url);
        
        if (!response.ok) {
            return res.status(200).json({ data: [] });
        }

        const data = await response.json();
        res.json(data);

    } catch (err) {
        console.error("Error en servidor:", err.message);
        res.status(200).json({ data: [] });
    }
});

// Esto evita que el servidor se quede trabado si hay un error
app.listen(PORT, '0.0.0.0', () => {
    console.log(`Servidor activo en puerto ${PORT}`);
}).on('error', (err) => {
    if (err.code === 'EADDRINUSE') {
        console.log('El puerto estaba ocupado, reintentando...');
    }
});
