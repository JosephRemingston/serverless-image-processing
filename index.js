var express = require('express');
var bodyParser = require('body-parser');
var AWS = require('aws-sdk');
var jwt = require('jsonwebtoken');
const crypto = require('crypto');
const authRouter = require('./routes/auth.routes.js');
const userRouter = require('./routes/user.routes.js');
const imageRoutes = require('./routes/image.routes.js');
var mediaRoutes = require("./controllors/media.controllor.js");

var app = express();



AWS.config.update({
    accessKeyId : "AKIAVVTU3VFINIXILKMC",
    secretAccessKey : "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",
    region : "ap-southeast-1"
});
var cognito = new AWS.CognitoIdentityServiceProvider({ region: "ap-southeast-1" });
var clientId = "2rjfr227ulsl2dkdc14gir6l7q"
var clientSecret = "1oe4fenhdb8jebl16kr7f98va281pn8mdiljq6chvi85senuiguh"; // <-- Add your Cognito App Client Secret here

app.use(bodyParser.json());

var PORT = 3000;

app.get("/" , (req , res) => {
    res.json({
        message: "server"
    })
})

app.use('/api/auth', authRouter);
app.use('/api/user', userRouter);
app.use('/api/image', imageRoutes);
app.use("/api/media", mediaRoutes);

app.listen(PORT , () => {
    console.log("server");
})