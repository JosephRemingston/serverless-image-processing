const AWS = require('aws-sdk');
const jwt = require('jsonwebtoken');
const crypto = require('crypto');
const ApiError = require('../utils/ApiError.js');
const ApiResponse = require('../utils/ApiResponse.js');
const asyncHandler = require('../utils/asyncHandler.js');

const cognito = new AWS.CognitoIdentityServiceProvider({ region: 'ap-southeast-1' });
const clientId = '2rjfr227ulsl2dkdc14gir6l7q';
const clientSecret = '1oe4fenhdb8jebl16kr7f98va281pn8mdiljq6chvi85senuiguh';

function generateSecretHash(username) {
    return crypto.createHmac('SHA256', clientSecret)
        .update(username + clientId)
        .digest('base64');
}

const signup = asyncHandler(async (req, res) => {
    const { username, password, email } = req.body;
    const params = {
        ClientId: clientId,
        Username: username,
        Password: password,
        UserAttributes: [
            {
                Name: 'email',
                Value: email
            }
        ],
        SecretHash: generateSecretHash(username)
    };
    try {
        const data = await cognito.signUp(params).promise();
        return ApiResponse.success(res, 'Signup successful', data);
    } catch (error) {
        return ApiResponse.error(res, error.statusCode || 400, error.message || 'Signup failed', error);
    }
});

const confirmUser = asyncHandler(async (req, res) => {
    const { username, code } = req.body;
    const params = {
        ClientId: clientId,
        ConfirmationCode: code,
        Username: username,
        SecretHash: generateSecretHash(username)
    };
    try {
        const data = await cognito.confirmSignUp(params).promise();
        return ApiResponse.success(res, 'User confirmed', data);
    } catch (error) {
        return ApiResponse.error(res, error.statusCode || 400, error.message || 'Confirmation failed', error);
    }
});

const signin = asyncHandler(async (req, res) => {
    const { username, password } = req.body;
    const params = {
        AuthFlow: 'USER_PASSWORD_AUTH',
        ClientId: clientId,
        AuthParameters: {
            USERNAME: username,
            PASSWORD: password,
            SECRET_HASH: generateSecretHash(username)
        }
    };
    try {
        const data = await cognito.initiateAuth(params).promise();
        const token = jwt.sign({ username: data.AuthenticationResult.AccessToken }, 'your-secret-key', { expiresIn: '1h' });
        return ApiResponse.success(res, 'Signin successful', { token, data });
    } catch (error) {
        return ApiResponse.error(res, error.statusCode || 400, error.message || 'Signin failed', error);
    }
});

module.exports = { signup, confirmUser, signin };
