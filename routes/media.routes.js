const express = require("express");
const { generateSignedUrl } = require("../controllors/media.controllor.js");
const { verifyJWT } = require("../middleware/auth.middleware.js");

const router = express.Router();

router.get("/generate-signed-url", verifyJWT, generateSignedUrl);

module.exports = router;