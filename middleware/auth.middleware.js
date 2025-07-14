var jwt = require('jsonwebtoken');

var authenticateJWT = (req , res , next) => {
    var token = req.headers.authorization;
    if(token){
        jwt.verify(token, 'your-secret-key' , (err, user) => {
            if(err){
                return res.sendStatus(403);
            }
            req.user = user;
            next();
        })
    }
    else{
        res.sendStatus(401);
    }
}

module.exports = authenticateJWT;