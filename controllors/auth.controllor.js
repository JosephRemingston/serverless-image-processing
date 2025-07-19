const AWS = require('aws-sdk');
const jwt = require('jsonwebtoken');
const crypto = require('crypto');
const ApiError = require('../utils/ApiError.js');
const ApiResponse = require('../utils/ApiResponse.js');
const asyncHandler = require('../utils/asyncHandler.js');
var user = require("../models/user.model.js");
var getSecrets = require("../utils/aws-secrets");

var secrets = getSecrets();
const cognito = new AWS.CognitoIdentityServiceProvider({ region: 'ap-southeast-1' });
const clientId = "2rjfr227ulsl2dkdc14gir6l7q"; // Replace with your actual Cognito Client ID
const clientSecret = "1oe4fenhdb8jebl16kr7f98va281pn8mdiljq6chvi85senuiguh";
console.log(clientId);
console.log(clientSecret);

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
        if(data){
            var userData = {
                username: username,
                email : username,
            }

            var newUser = await user.create(userData);
            if(newUser) {
                console.log("User created successfully:", newUser);
                return ApiResponse.success(res, 'User confirmed', data);
            }
            else{
                return ApiResponse.error(res, 500, 'User creation failed', {});
            }
        }
    } catch (error) {
        return ApiResponse.error(res, error.statusCode || 400, error.message || 'Confirmation failed', error);
    }
});

const signin = asyncHandler(async (req, res) => {
    const { username, password } = req.body;

    // Input validation
    if (!username || !password) {
        return ApiResponse.error(res, 400, "Username and password are required");
    }

    try {
        // Cognito authentication parameters
        const params = {
            AuthFlow: 'USER_PASSWORD_AUTH',
            ClientId: clientId,
            AuthParameters: {
                USERNAME: username,  // Cognito expects USERNAME, not EMAIL
                PASSWORD: password,
                SECRET_HASH: generateSecretHash(username)
            }
        };

        // Authenticate with Cognito
        const cognitoData = await cognito.initiateAuth(params).promise();
        
        if (!cognitoData || !cognitoData.AuthenticationResult) {
            return ApiResponse.error(res, 401, "Authentication failed");
        }

        // Find user in our database
        const userData = await user.findOne({ email: username });
        if (!userData) {
            return ApiResponse.error(res, 404, "User not found in database");
        }


        // Generate JWT token with proper claims
        const token = jwt.sign(
            {
                username: username,
                userId: userData._id,
                iat: Math.floor(Date.now() / 1000),
            },
            "your-secret-key",
            {
                expiresIn: '1h',
                algorithm: 'HS256'
            }
        );

        return ApiResponse.success(res, 'Signin successful', {
            token,
            user: {
                id: userData._id,
                username: userData.username,
                email: userData.email
            },
            cognitoTokens: {
                accessToken: cognitoData.AuthenticationResult.AccessToken,
                refreshToken: cognitoData.AuthenticationResult.RefreshToken,
                expiresIn: cognitoData.AuthenticationResult.ExpiresIn
            }
        });

    } catch (error) {
        console.error('Signin error:', error);

        // Handle specific Cognito errors
        if (error.code === 'NotAuthorizedException') {
            return ApiResponse.error(res, 401, "Invalid username or password");
        }
        if (error.code === 'UserNotConfirmedException') {
            return ApiResponse.error(res, 403, "User is not confirmed");
        }
        if (error.code === 'PasswordResetRequiredException') {
            return ApiResponse.error(res, 403, "Password reset required");
        }
        if (error.code === 'UserNotFoundException') {
            return ApiResponse.error(res, 404, "User not found");
        }

        return ApiResponse.error(
            res, 
            error.statusCode || 500,
            error.message || 'Authentication failed',
            { requestId: error.requestId }
        );
    }
});

module.exports = { signup, confirmUser, signin };
