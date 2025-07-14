const AWS = require('aws-sdk');
const ApiResponse = require('../utils/ApiResponse.js');
const asyncHandler = require('../utils/asyncHandler.js');

const cognito = new AWS.CognitoIdentityServiceProvider({ region: 'ap-southeast-1' });

const getUserProfile = asyncHandler(async (req, res) => {
    const params = {
        AccessToken: req.user.username
    };
    try {
        const data = await cognito.getUser(params).promise();
        return ApiResponse.success(res, 'User profile fetched', data);
    } catch (error) {
        return ApiResponse.error(res, error.statusCode || 400, error.message || 'Failed to fetch user profile', error);
    }
});

module.exports = { getUserProfile }; 