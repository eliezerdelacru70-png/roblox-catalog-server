import express from "express";
import cors from "cors";

const app = express();

app.use(cors());
app.use(express.json());

// TEST (esto debe funcionar sí o sí)
app.get("/", (req, res) => {
    res.send("SERVER OK 🔥");
});

// CATÁLOGO
app.get("/api/catalog/search", async (req, res) => {
    try {
        const limit = 30;

        const url = `https://catalog.roproxy.com/v1/search/items/details?limit=${limit}&category=All`;

        const response = await fetch(url);
        const data = await response.json();

        res.json(data);

    } catch (err) {
        console.error("ERROR:", err);
        res.status(500).json({ error: "Server crash" });
    }
});

const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
    console.log("Server running on port " + PORT);
});
