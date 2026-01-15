# Registration Token Security

## Overview

The Trinity Lodge Management System now includes a **registration token** security feature to prevent unauthorized user registration. Only users who possess the correct registration token can create new accounts.

## Configuration

### Backend (.env)

The registration token is stored in the `.env` file:

```env
REGISTRATION_TOKEN=919847073856
```

**Important:**
- Never commit the `.env` file to version control
- Change the default token to a secure value in production
- Share the token only with authorized personnel who need to create accounts

## How It Works

### 1. User Registration Flow

When a new user attempts to register:

1. User clicks "Don't have an account? Sign up" on the login page
2. Registration form appears with these fields:
   - **Username** (required)
   - **Password** (required, minimum 6 characters)
   - **Confirm Password** (required, must match password)
   - **Role** (Staff or Admin)
   - **Registration Token** (required)

3. User enters all details including the registration token
4. Upon submission:
   - Frontend sends registration request to backend
   - Backend validates the token against `REGISTRATION_TOKEN` in `.env`
   - If token matches: Account is created and user is auto-logged in
   - If token is invalid: Returns error "Invalid registration token"

### 2. Security Benefits

- **Prevents unauthorized signups**: Random users cannot create accounts
- **Controlled access**: Only authorized personnel with the token can register
- **Simple implementation**: Single token configured in environment
- **Easy to change**: Update `.env` file to rotate the token

## API Changes

### Register Endpoint

**POST** `/api/auth/register`

**Request Body:**
```json
{
  "username": "john_doe",
  "password": "secure123",
  "role": "STAFF",
  "registration_token": "919847073856"
}
```

**Success Response (201):**
```json
{
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "user": {
    "id": "uuid-here",
    "username": "john_doe",
    "role": "STAFF"
  }
}
```

**Error Response - Invalid Token (401):**
```json
{
  "error": "Invalid registration token"
}
```

**Error Response - Existing Username (400):**
```json
{
  "error": "username already exists"
}
```

## Files Modified

### Backend

1. **backend/internal/config/config.go**
   - Added `RegistrationToken` field to Config struct
   - Loads token from `REGISTRATION_TOKEN` env variable

2. **backend/internal/handlers/auth_handler.go**
   - Added `registration_token` field to `RegisterRequest`
   - Added config to `AuthHandler` struct
   - Validates token before creating account
   - Updated to return token + user (auto-login after registration)

3. **backend/internal/services/auth_service.go**
   - Updated `Register()` to return `(string, *models.User, error)`
   - Generates JWT token for auto-login after successful registration

4. **backend/cmd/server/main.go**
   - Updated `NewAuthHandler()` call to pass config

### Frontend

1. **frontend/src/pages/Login.tsx**
   - Added `registrationToken` state
   - Added Registration Token input field (shown only in sign-up mode)
   - Passes token in register request

2. **frontend/src/services/auth.service.ts**
   - Added `registration_token` field to `RegisterRequest` interface

### Environment

1. **.env** (created)
   - Contains `REGISTRATION_TOKEN=919847073856`

2. **.env.example** (created)
   - Template with `REGISTRATION_TOKEN` for team members

## Usage Instructions

### For Administrators

**Changing the Registration Token:**

1. Edit `d:\Trinity\.env`
2. Update `REGISTRATION_TOKEN=your-new-token-here`
3. Restart the backend server
4. Share the new token with authorized personnel

**Sharing the Token Securely:**

- Do NOT email or message the token in plain text
- Use secure communication channels
- Consider rotating the token periodically
- Remove access by changing the token

### For New Users

**Creating an Account:**

1. Navigate to login page
2. Click "Don't have an account? Sign up"
3. Fill in:
   - Username (unique)
   - Password (minimum 6 characters)
   - Confirm Password (must match)
   - Role (Staff or Admin)
   - **Registration Token** (obtain from administrator)
4. Click "Sign up"
5. Upon success, you'll be automatically logged in

**If Registration Fails:**

- **"Invalid registration token"**: Contact administrator for correct token
- **"username already exists"**: Choose a different username
- **"Passwords do not match"**: Ensure both password fields are identical
- **"Password must be at least 6 characters long"**: Use a longer password

## Security Best Practices

### Token Management

1. **Use Strong Tokens**
   - Minimum 12 characters
   - Mix of numbers and letters
   - Example: `TL-2026-9xK7mP3nQ8wR`

2. **Rotate Regularly**
   - Change token every 3-6 months
   - Change immediately if compromised
   - Keep a log of token changes

3. **Limit Distribution**
   - Only share with personnel who need to create accounts
   - Revoke access by changing token when staff leaves

### Environment File Security

1. **Never commit `.env`**
   - Already in `.gitignore`
   - Contains sensitive configuration

2. **Backup Securely**
   - Store backup of `.env` in secure location
   - Encrypt if storing in cloud

3. **Production Deployment**
   - Use different token for production
   - Set via environment variables (not in `.env` file)
   - Use secrets management (AWS Secrets Manager, Azure Key Vault, etc.)

## Troubleshooting

### Backend shows "invalid credentials" after registration
- **Issue**: User account created but auto-login failed
- **Solution**: Try logging in manually with created credentials

### Frontend shows CORS error during registration
- **Issue**: Backend not allowing frontend origin
- **Solution**: Check `ALLOWED_ORIGINS` in backend `.env`

### Registration succeeds but token shown in browser console
- **Issue**: Browser DevTools shows API request with token
- **Note**: This is normal - token is only validated server-side
- **Security**: Ensure HTTPS in production to encrypt requests

## Alternative Security Approaches

For enhanced security, consider these alternatives:

### 1. Admin-Only Registration
- Remove public registration endpoint
- Add admin dashboard to create users
- Admins create accounts for new staff

### 2. Email Verification
- Send verification email after registration
- Activate account only after email confirmation
- Requires email server configuration

### 3. Multi-Factor Token
- Require both registration token AND email verification
- Maximum security for account creation

## Deployment Considerations

### Development
```env
REGISTRATION_TOKEN=919847073856
```

### Staging
```env
REGISTRATION_TOKEN=TL-STAGING-Ab3Xy9Pq7Mn
```

### Production
```bash
# Set as environment variable, not in .env file
export REGISTRATION_TOKEN="TL-PROD-Zx8Kw4Lm2Vn9Qr"
```

---

**Status**: ✅ Implemented and Ready

**Version**: 1.0.0
**Date**: January 15, 2026

For questions or issues, contact the system administrator.
