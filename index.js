var express = require('express');
var bodyParser = require('body-parser');
var AWS = require('aws-sdk');
var jwt = require('jsonwebtoken');
const crypto = require('crypto');
const cors = require('cors');
const authRouter = require('./routes/auth.routes.js');
const userRouter = require('./routes/user.routes.js');
const imageRoutes = require('./routes/image.routes.js');
const mediaRoutes = require("./routes/media.routes.js");
const getSecrets = require("./utils/aws-secrets.js");
var app = express();

// CORS configuration
const corsOptions = {
    origin: '*', // Replace with your frontend domain in production
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization'],
    exposedHeaders: ['Content-Range', 'X-Content-Range'],
    credentials: true
};

app.use(cors(corsOptions));

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
