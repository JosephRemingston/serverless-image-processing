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

    console.log('Signin attempt for username:', username);

    // Input validation
    if (!username || !password) {
        console.log('Signin failed: Missing username or password');
        return ApiResponse.error(res, 400, "Username and password are required");
    }

    try {
        // Generate secret hash
        const secretHash = generateSecretHash(username);
        console.log('Generated secret hash for authentication');

        // Cognito authentication parameters
        const params = {
            AuthFlow: 'USER_PASSWORD_AUTH',
            ClientId: clientId,
            AuthParameters: {
                USERNAME: username,
                PASSWORD: password,
                SECRET_HASH: secretHash
            }
        };

        console.log('Attempting Cognito authentication...');

        // Authenticate with Cognito
        const cognitoData = await cognito.initiateAuth(params).promise();
        console.log('Cognito authentication response:', JSON.stringify(cognitoData, null, 2));
        
        if (!cognitoData || !cognitoData.AuthenticationResult) {
            console.log('Authentication failed: No authentication result from Cognito');
            return ApiResponse.error(res, 401, "Authentication failed");
        }

        // Find user in our database
        console.log('Looking up user in database...');
        const userData = await user.findOne({ email: username });
        if (!userData) {
            console.log('User not found in database for email:', username);
            return ApiResponse.error(res, 404, "User not found in database");
        }
        console.log('User found in database:', userData._id);


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
        console.error('Signin error:', {
            code: error.code,
            message: error.message,
            stack: error.stack
        });

        // Handle specific Cognito errors
        if (error.code === 'NotAuthorizedException') {
            return ApiResponse.error(res, 401, "Invalid username or password");
        }
        if (error.code === 'UserNotConfirmedException') {
            return ApiResponse.error(res, 403, "Please confirm your user account with the code sent to your email");
        }
        if (error.code === 'PasswordResetRequiredException') {
            return ApiResponse.error(res, 403, "Password reset required. Please reset your password");
        }
        if (error.code === 'UserNotFoundException') {
            return ApiResponse.error(res, 404, "User account not found");
        }
        if (error.code === 'InvalidParameterException') {
            console.error('Invalid parameter:', error.message);
            return ApiResponse.error(res, 400, "Invalid login parameters provided");
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
