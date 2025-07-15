var express = require('express');
var bodyParser = require('body-parser');
var AWS = require('aws-sdk');
var jwt = require('jsonwebtoken');
const crypto = require('crypto');
const authRouter = require('./routes/auth.routes.js');
const userRouter = require('./routes/user.routes.js');
const imageRoutes = require('./routes/image.routes.js');
var mediaRoutes = require("./controllors/media.controllor.js");
var getSecrets = require("./utils/aws-secrets.js");
var app = express();


var secrets = getSecrets();
AWS.config.update({
    accessKeyId : secrets.AWS_ACCESSKEY,
    secretAccessKey : secrets.AWS_SECRETACCESSKEY,
    region : "ap-southeast-1"
});
var cognito = new AWS.CognitoIdentityServiceProvider({ region: "ap-southeast-1" });
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