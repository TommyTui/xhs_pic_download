const authMiddleware = require('./auth');
const doGetUrl = require("./main");

var express = require("express");
const bodyParser = require('body-parser');
var app = express();

app.use(bodyParser.json());

app.all("/getXhsPicUrl", authMiddleware, async function (req, res) {
  res.set("Content-Type", "application/json");
  const shareText = req.query.shareText || req.body.shareText;
  const xhsCookie = req.body.xhsCookie;
  if (!shareText) {
    res.status(400).json({ error: "Missing required parameter: shareText" });
    return;
  }
  try {
    const result = await doGetUrl(
      {
        shareText: shareText,
        xhsCookie: xhsCookie,
      },
      null
    );
    res.json(result);
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

const PORT = 7776;
app.listen(PORT, () => {
    console.log(`Server started on port: ${PORT}`);
    console.log(`Authentication: ${process.env.API_TOKEN ? 'On' : 'Off, Need to set API_TOKEN'}`);
});
