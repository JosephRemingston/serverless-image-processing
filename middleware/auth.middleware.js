const jwt = require('jsonwebtoken');
const asyncHandler = require("../utils/asyncHandler.js");
const ApiError = require("../utils/ApiError.js");
const ApiResponse = require("../utils/ApiResponse.js");

const verifyJWT = asyncHandler(async (req, res, next) => {
    try {
        const token = req.headers.authorization;
        
        if (!token) {
          return ApiResponse.error(res, 401, "Unauthorized - No token provided");
        }

        // Remove 'Bearer ' if present
        const tokenString = token.startsWith('Bearer ') ? token.slice(7) : token;

        jwt.verify(tokenString, 'your-secret-key', (err, decoded) => {
            if (err) {
              return ApiResponse.error(res, 403, "Invalid or expired token");
            }
            req.user = decoded;
            next();
        });
    } catch (error) {
        next(error);
    }
});



module.exports = { verifyJWT };