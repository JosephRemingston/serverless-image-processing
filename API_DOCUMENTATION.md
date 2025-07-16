# Serverless Media Processing API Documentation

## Base URL
```
http://localhost:3000/api
```

## Authentication

### 1. Sign Up
Create a new user account.

```http
POST /auth/signup
Content-Type: application/json

{
    "username": "testuser",
    "password": "Test@123",
    "email": "test@example.com"
}
```

#### Response
```json
{
    "success": true,
    "message": "Signup successful",
    "data": {
        "UserConfirmed": false,
        "UserSub": "xxxx-xxxx-xxxx",
        "CodeDeliveryDetails": {
            "Destination": "t***@example.com",
            "DeliveryMedium": "EMAIL",
            "AttributeName": "email"
        }
    }
}
```

### 2. Confirm User
Confirm user account with the verification code sent to email.

```http
POST /auth/confirm-user
Content-Type: application/json

{
    "username": "testuser",
    "code": "123456"
}
```

#### Response
```json
{
    "success": true,
    "message": "User confirmed",
    "data": {}
}
```

### 3. Sign In
Authenticate user and receive JWT token.

```http
POST /auth/signin
Content-Type: application/json

{
    "username": "testuser",
    "password": "Test@123"
}
```

#### Response
```json
{
    "success": true,
    "message": "Signin successful",
    "data": {
        "token": "eyJhbGciOiJIUzI1NiIs...",
        "data": {
            "AuthenticationResult": {
                "AccessToken": "eyJhbGciOiJIUzI1...",
                "ExpiresIn": 3600,
                "TokenType": "Bearer",
                "RefreshToken": "eyJhbGciOiJIUzI1..."
            }
        }
    }
}
```

## User Management

### Get User Profile
Retrieve the authenticated user's profile.

```http
GET /user/profile
Authorization: Bearer eyJhbGciOiJIUzI1NiIs...
```

#### Response
```json
{
    "success": true,
    "message": "User profile fetched",
    "data": {
        "Username": "testuser",
        "UserAttributes": [
            {
                "Name": "email",
                "Value": "test@example.com"
            },
            {
                "Name": "sub",
                "Value": "xxxx-xxxx-xxxx"
            }
        ]
    }
}
```

## Media Operations

### Generate Signed URL
Get a pre-signed URL for uploading media to S3.

```http
GET /media/generate-signed-url
Authorization: Bearer eyJhbGciOiJIUzI1NiIs...
```

#### Response
```json
{
    "success": true,
    "message": "signed url generated",
    "data": {
        "signed url": "https://serverless-media-processing-upload.s3.ap-southeast-1.amazonaws.com/uploads/abc123_testuser.png?AWSAccessKeyId=...",
        "filename": "abc123_testuser.png"
    }
}
```

## Error Responses

### 401 Unauthorized
```json
{
    "success": false,
    "message": "Unauthorized - No token provided"
}
```

### 403 Forbidden
```json
{
    "success": false,
    "message": "Invalid or expired token"
}
```

### 400 Bad Request
```json
{
    "success": false,
    "message": "Error message specific to the validation/request issue"
}
```

### 500 Internal Server Error
```json
{
    "success": false,
    "message": "Internal Server Error",
    "errors": "Detailed error message"
}
```

## Testing with cURL

### Sign Up
```bash
curl -X POST http://localhost:3000/api/auth/signup \
-H "Content-Type: application/json" \
-d '{"username":"testuser","password":"Test@123","email":"test@example.com"}'
```

### Sign In
```bash
curl -X POST http://localhost:3000/api/auth/signin \
-H "Content-Type: application/json" \
-d '{"username":"testuser","password":"Test@123"}'
```

### Get Profile
```bash
curl http://localhost:3000/api/user/profile \
-H "Authorization: Bearer YOUR_JWT_TOKEN"
```

### Generate Signed URL
```bash
curl http://localhost:3000/api/media/generate-signed-url \
-H "Authorization: Bearer YOUR_JWT_TOKEN"
```

## Important Notes

1. Replace `YOUR_JWT_TOKEN` with the actual token received from signin
2. All timestamps are in ISO 8601 format
3. Protected routes require a valid JWT token in the Authorization header
4. File uploads are limited to PNG format
5. Tokens expire after 1 hour

## Development Setup

1. Install dependencies:
   ```bash
   npm install
   ```

2. Start the server:
   ```bash
   npm start
   ```

3. Server will run on port 3000 by default

## Environment Variables Required

- AWS_ACCESSKEY
- AWS_SECRETACCESSKEY
- AWS_REGION (default: ap-southeast-1)
- COGNITO_CLIENT_ID
- COGNITO_CLIENT_SECRET
