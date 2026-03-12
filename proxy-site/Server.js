const express = require("express");
const fetch = (...args) => import("node-fetch").then(({default: fetch}) => fetch(...args));

const app = express();

app.use(express.static("public"));

app.get("/proxy", async (req, res) => {

    let url = req.query.url;

    if (!url) {
        return res.send("No URL provided");
    }

    try {

        if (!url.startsWith("http")) {
            url = "https://" + url;
        }

        const response = await fetch(url);

        let html = await response.text();

        html = html.replace(/(href|src)=["']\/(.*?)["']/g, `$1="${url}/$2"`);

        res.send(html);

    } catch (err) {
        res.send("Proxy error: " + err.message);
    }

});

app.listen(3000, () => {
    console.log("Proxy running on port 3000");
});
