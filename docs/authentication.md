# Authentication Strategy

## Overview

Hybrid authentication approach supporting both OAuth (Google) and traditional email/password authentication.

## Authentication Providers

### 1. Google OAuth (Primary)
- **Why**: Easiest onboarding, no password management for users
- **Implementation**: OAuth 2.0 flow
- **User data**: Email, name, profile picture
- **Benefits**:
  - One-click sign up/login
  - No password to remember
  - Verified email by default
  - Trust factor (Google identity)

### 2. Email/Password (Fallback)
- **Why**: Not everyone wants to use Google, or may not have Google account
- **Security requirements**:
  - Bcrypt/Argon2 password hashing
  - Minimum password strength requirements
  - Email verification required
  - Password reset flow via email

## Authentication Flow

### Sign Up Flow

#### Google OAuth Sign Up
```
1. User clicks "Sign up with Google"
2. Redirect to Google OAuth consent screen
3. User approves permissions
4. Google redirects back with authorization code
5. Exchange code for user info (email, name)
6. Check if user exists:
   - If exists: Log them in
   - If not: Create user account with google_id
7. Prompt to create or join a tenant/business
8. Assign OWNER role if creating new tenant
9. Redirect to dashboard
```

#### Email/Password Sign Up
```
1. User enters email, password, full name
2. Validate email format and password strength
3. Hash password with bcrypt (cost factor 12)
4. Create user account
5. Send verification email
6. Prompt to create or join a tenant/business
7. Assign OWNER role if creating new tenant
8. User must verify email before full access
```

### Login Flow

#### Google OAuth Login
```
1. User clicks "Login with Google"
2. OAuth flow (same as sign up)
3. Match user by google_id or email
4. If user has multiple tenants, show tenant selector
5. Set session with user_id, tenant_id, role
6. Redirect to dashboard
```

#### Email/Password Login
```
1. User enters email and password
2. Validate credentials
3. Check email verification status
4. If user has multiple tenants, show tenant selector
5. Set session with user_id, tenant_id, role
6. Redirect to dashboard
```

## Multi-Tenant Access

### Tenant Selection
When a user belongs to multiple tenants:
```
1. After login, show tenant selection screen
2. Display all tenants user has access to
3. Show role for each tenant
4. User selects tenant
5. Session includes selected tenant_id
6. Can switch tenants without re-login
```

### Tenant Invitation
Existing users can be invited to join a tenant:
```
1. OWNER/MANAGER sends invitation email
2. Email contains secure token
3. User clicks invitation link
4. If not logged in: prompt to login/sign up
5. If logged in: confirm joining tenant
6. Create tenant_users record with specified role
7. User can now switch to new tenant
```

## Session Management

### Session Data
```typescript
interface Session {
  user: {
    id: string;
    email: string;
    fullName: string;
  };
  tenant: {
    id: string;
    name: string;
    slug: string;
  };
  role: 'OWNER' | 'MANAGER' | 'CASHIER';
  expiresAt: Date;
}
```

### Session Storage Options
1. **JWT tokens**: Stateless, stored in httpOnly cookies
2. **Database sessions**: More control, can revoke anytime
3. **Hybrid**: JWT for quick auth checks, DB for user/tenant data

## Role-Based Access Control (RBAC)

### Roles & Permissions

#### OWNER
- Full access to everything
- Can manage users and assign roles
- Can delete tenant
- Can modify business settings
- Access to all reports and analytics

#### MANAGER
- Can manage products and inventory
- Can view sales reports
- Can manage customers
- Cannot manage users or business settings
- Cannot delete tenant

#### CASHIER
- Can process transactions
- Can view products
- Limited inventory view (stock levels only)
- Cannot access reports
- Cannot manage anything

### Permission Checks
```typescript
// Middleware example
function requireRole(allowedRoles: Role[]) {
  return async (req, res, next) => {
    const { role } = req.session;
    if (!allowedRoles.includes(role)) {
      return res.status(403).json({ error: 'Forbidden' });
    }
    next();
  };
}

// Usage
app.post('/api/products', requireRole(['OWNER', 'MANAGER']), createProduct);
app.get('/api/reports', requireRole(['OWNER', 'MANAGER']), getReports);
```

## Security Considerations

### Password Security
- Minimum 8 characters
- Require mix of uppercase, lowercase, numbers
- Hash with bcrypt (cost factor 12) or Argon2id
- Rate limit login attempts (5 attempts per 15 minutes)
- Account lockout after repeated failed attempts

### OAuth Security
- Validate OAuth state parameter to prevent CSRF
- Use secure redirect URLs (whitelist)
- Store minimal OAuth tokens
- Refresh token rotation

### Session Security
- httpOnly cookies (prevent XSS)
- secure flag (HTTPS only)
- sameSite: 'strict' or 'lax'
- Short expiration (7-30 days)
- Refresh token mechanism

### API Security
- CORS configuration
- Rate limiting
- Input validation
- SQL injection prevention (use parameterized queries)
- XSS prevention (sanitize inputs)

## Implementation Libraries

### Recommended Stack
- **SvelteKit** with server-side authentication
- **Auth.js** (formerly NextAuth.js) - supports both OAuth and credentials
- **Lucia** - Lightweight alternative, full control
- **bcrypt** or **@node-rs/argon2** - Password hashing
- **Zod** - Input validation

### Example with Auth.js
```typescript
// auth.config.ts
import Google from '@auth/core/providers/google';
import Credentials from '@auth/core/providers/credentials';
import { SvelteKitAuth } from '@auth/sveltekit';

export const { handle, signIn, signOut } = SvelteKitAuth({
  providers: [
    Google({
      clientId: env.GOOGLE_CLIENT_ID,
      clientSecret: env.GOOGLE_CLIENT_SECRET,
    }),
    Credentials({
      async authorize(credentials) {
        // Validate email/password
        // Return user object if valid
      }
    })
  ],
  callbacks: {
    async jwt({ token, user }) {
      // Add tenant info to token
    },
    async session({ session, token }) {
      // Add tenant and role to session
    }
  }
});
```

## Email Verification & Password Reset

### Email Verification
```
1. Generate secure random token (UUID or crypto.randomBytes)
2. Store token in database with expiration (24 hours)
3. Send email with verification link
4. User clicks link, validate token
5. Mark email as verified
6. Delete used token
```

### Password Reset
```
1. User requests password reset
2. Generate secure reset token
3. Store token with expiration (1 hour)
4. Send reset email
5. User clicks link, enters new password
6. Validate token, update password
7. Delete used token
8. Invalidate all existing sessions
```

## Testing Authentication

### Test Cases
- [ ] Google OAuth sign up creates user and tenant
- [ ] Email/password sign up with verification
- [ ] Login with Google OAuth
- [ ] Login with email/password
- [ ] Invalid credentials rejected
- [ ] Rate limiting on login attempts
- [ ] Tenant selection for multi-tenant users
- [ ] Tenant invitation flow
- [ ] Role-based access control
- [ ] Session expiration and refresh
- [ ] Password reset flow
- [ ] Email verification flow

## Next Steps

1. Choose authentication library (Auth.js vs Lucia)
2. Set up Google OAuth credentials (Google Cloud Console)
3. Implement email service (SendGrid, Resend, or SMTP)
4. Create auth UI components (login, signup, tenant selector)
5. Implement session middleware
6. Add role-based access control to all protected routes
