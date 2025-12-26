# Counselor Activation/Deactivation Module

## Overview

This module allows tenants to activate and deactivate their counselors, preventing deactivated counselors from accessing the system while maintaining their account data.

## Features Implemented

### 1. Database Schema Update

- **Prisma Schema**: `server/prisma/schema.prisma`
- Added `is_active` field to `users` model (Boolean, default: true)
- Field tracks activation status: true = active, false = deactivated
- To apply changes, run: `npx prisma migrate dev` or `npx prisma db push`

### 2. Backend API Endpoints

#### Endpoints

- **POST** `/api/counselor-activation/activate` - Activate a counselor
- **POST** `/api/counselor-activation/deactivate` - Deactivate a counselor
- **GET** `/api/counselor-activation/status?counselor_user_id={id}&tenant_id={id}` - Get activation status
- **GET** `/api/counselor-activation/counselors?tenant_id={id}` - Get all counselors for a tenant with activation status

#### Request/Response Examples

**Activate Counselor:**

```json
POST /api/counselor-activation/activate
{
  "counselor_user_id": 123,
  "tenant_id": 456
}
```

**Deactivate Counselor:**

```json
POST /api/counselor-activation/deactivate
{
  "counselor_user_id": 123,
  "tenant_id": 456
}
```

**Get Counselors:**

```json
GET /api/counselor-activation/counselors?tenant_id=456

Response:
{
  "message": "Counselors retrieved successfully",
  "data": [
    {
      "user_id": 123,
      "user_profile_id": 456,
      "email": "counselor@example.com",
      "name": "John Doe",
      "phone": "1234567890",
      "is_active": true
    }
  ]
}
```

### 3. Authentication & Authorization

#### Backend Authentication Middleware

- Updated `server/middlewares/token.js` to check `is_active` status for counselors
- Deactivated counselors receive 403 error with message: "Your account has been deactivated"
- Token payload now includes `user_id`, `user_profile_id`, and `role_id` for proper validation

#### Sign-In Logic

- Updated `server/models/auth/user.js` to:
  - Include `is_active` status in user object
  - Check activation status during login
  - Prevent login for deactivated counselors with appropriate error message

### 4. Frontend Implementation

#### Locked UI Component

- **Component**: `client/components/AccountLocked/index.js`
- Displays a locked screen when counselor account is deactivated
- Shows clear message: "Account Deactivated" with instructions to contact administrator

#### Middleware Updates

- Updated `client/middleware.js` to check `is_active` status
- Redirects deactivated counselors appropriately
- Prevents access to protected routes for deactivated accounts

#### Layout Component

- Updated `client/components/Layout/index.js` to check activation status
- Shows locked UI instead of normal layout when account is deactivated

#### Login Page

- Updated `client/pages/login.js` to detect and display locked UI for deactivated accounts

## Database Migration

To apply the database changes using Prisma, run:

```bash
# Generate Prisma Client and create migration
npx prisma migrate dev --name add_is_active_to_users

# Or push changes directly to database (for development)
npx prisma db push
```

After running the migration, generate the Prisma Client:

```bash
npx prisma generate
```

## Usage

### For Tenants (Role ID = 3)

1. **View All Counselors:**

   ```javascript
   GET /api/counselor-activation/counselors?tenant_id={tenant_id}
   ```

2. **Deactivate a Counselor:**

   ```javascript
   POST /api/counselor-activation/deactivate
   {
     "counselor_user_id": 123,
     "tenant_id": 456
   }
   ```

3. **Activate a Counselor:**
   ```javascript
   POST /api/counselor-activation/activate
   {
     "counselor_user_id": 123,
     "tenant_id": 456
   }
   ```

### Security Features

1. **Tenant Verification**: Only the tenant who owns the counselor can activate/deactivate them
2. **Role Validation**: Only users with `role_id = 3` (tenants) can perform activation/deactivation
3. **Database Checks**: System verifies counselor belongs to tenant before allowing changes
4. **Authentication**: All endpoints require valid authentication token

## User Experience

### For Deactivated Counselors

1. **Login Attempt**:

   - Receives error message: "Your account has been deactivated. Please contact your administrator."
   - Cannot proceed with login

2. **If Already Logged In**:

   - UI shows locked screen with lock icon
   - Message: "Your account has been deactivated by your administrator."
   - All protected routes are inaccessible

3. **After Reactivation**:
   - Can login normally
   - Full access restored

## Technical Details

### Files Created

- `server/models/counselorActivation.js` - Model layer
- `server/services/counselorActivation.js` - Service layer
- `server/controllers/counselorActivationController.js` - Controller layer
- `server/routes/counselorActivation.js` - Route definitions
- `client/components/AccountLocked/index.js` - Locked UI component

### Files Modified

- `server/migrations/add_is_active_to_users.sql` - Database migration
- `server/middlewares/token.js` - Authentication middleware
- `server/models/auth/user.js` - Sign-in logic
- `server/models/auth/authCommon.js` - Token generation
- `server/routes/index.js` - Router exports
- `server/server.js` - Router registration
- `client/middleware.js` - Frontend middleware
- `client/components/Layout/index.js` - Layout component
- `client/pages/login.js` - Login page

## Testing

### Test Scenarios

1. **Tenant activates counselor** - Should succeed
2. **Tenant deactivates counselor** - Should succeed
3. **Deactivated counselor tries to login** - Should fail with appropriate message
4. **Deactivated counselor with active session** - Should see locked UI
5. **Non-tenant tries to activate/deactivate** - Should fail with 403
6. **Tenant tries to activate/deactivate counselor from different tenant** - Should fail

## Notes

- The `is_active` field defaults to 1 (active) for all existing records
- Deactivation does not delete the account, only prevents access
- Activation status is checked on every authenticated request for counselors
- The system gracefully handles cases where the field might not exist (backward compatibility)
