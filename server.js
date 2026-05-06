const express = require("express");
const cors = require("cors");
const fetch = require("node-fetch");

const app = express();

app.use(cors());

app.get("/", (req, res) => {
    res.json({ status: "ok" });
});

app.get("/api/catalog/search", async (req, res) => {
    try {
        const url = "https://catalog.roproxy.com/v1/search/items/details?limit=30&category=All";

        const response = await fetch(url);
        const data = await response.json();

        res.json(data);
    } catch (err) {
        console.error(err);
        res.status(500).send("ERROR");
    }
});

const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
    console.log("Running on port " + PORT);
});
