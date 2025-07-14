var express = require("express");
var generateSignedUrl = require("../controllors/media.controllor.js");


var router = express.Router();

router.get("/generate-signed-url" , generateSignedUrl);

module.exports = router;