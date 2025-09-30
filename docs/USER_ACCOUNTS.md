# 👤 User Accounts & Authentication

Complete guide to user management, authentication, and password features.

## 🔐 Current User Accounts

### Super Admin
```
Email: marinusdebeer@gmail.com
Password: password123
Access: Full platform administration
```

**Features:**
- ✅ Manage all organizations
- ✅ View all users
- ✅ System-wide analytics
- ✅ Add/remove organizations
- ❌ Not tied to any specific organization

### Zen Zone Cleaning Admin
```
Email: admin@zenzonecleaning.com
Password: password123
Organization: Zen Zone Cleaning
Role: OWNER
```

**Features:**
- ✅ Full access to Zen Zone Cleaning data
- ✅ Manage clients, jobs, invoices
- ✅ Use calendar and all business features
- ❌ Cannot see other organizations
- ❌ No admin dashboard access

## 🔑 Account Settings

### Change Your Email (Coming Soon)
**Location:** `/settings` → Account tab

**Steps:**
1. Go to Settings
2. Click Account section
3. Enter new email address
4. Click "Update Email"
5. Verify new email address
6. Email updated!

### Change Your Password (Coming Soon)
**Location:** `/settings` → Security tab

**Steps:**
1. Go to Settings
2. Click Security section
3. Enter current password
4. Enter new password
5. Confirm new password
6. Click "Change Password"
7. Password updated!

## 🔄 Password Reset Flow

### For Regular Users (Forgot Password)

**Step 1: Request Reset**
1. Go to `/auth/signin`
2. Click "Forgot Password?" link
3. Enter your email address
4. Submit

**Step 2: Receive Email**
- Email sent with reset link
- Link valid for 1 hour
- One-time use token

**Step 3: Reset Password**
1. Click link in email
2. Enter new password
3. Confirm new password
4. Submit
5. Automatically logged in

### For Super Admin (Reset User Passwords)

**Location:** `/admin/users` → User detail

**Steps:**
1. Login as super admin
2. Go to Admin Dashboard
3. Click Users
4. Find user
5. Click "Send Password Reset"
6. Email sent to user
7. User follows normal reset flow

## 🛠️ Implementation Status

### ✅ Implemented
- User authentication
- Super admin flag
- Role-based access (OWNER, ADMIN, STAFF)
- Session management
- Organization membership

### 🚧 To Be Implemented

#### Password Reset
- Forgot password page
- Password reset token generation
- Password reset email template
- Token validation
- Password update endpoint

#### Account Settings
- Email change with verification
- Password change (authenticated)
- Profile information updates
- Notification preferences

#### Super Admin Features
- Force password reset for users
- Disable user accounts
- Manage user roles
- Audit user activity

## 📧 Email Features (Future)

### User Notifications
- Password reset emails
- Email verification
- Account changes notification
- Login alerts (optional)

### Admin Notifications
- New organization created
- User added to organization
- Password reset requested
- Security alerts

## 🔒 Security Features

### Current
✅ Bcrypt password hashing
✅ JWT session tokens
✅ CSRF protection (Next.js built-in)
✅ HTTP-only cookies
✅ Row Level Security (database)

### Future
- Password reset tokens (time-limited)
- Email verification tokens
- Two-factor authentication (2FA)
- Login attempt limiting
- IP-based blocking
- Session timeout settings

## 🎯 User Roles Explained

### Super Admin (`isSuperAdmin: true`)
- **Purpose**: Platform administrator
- **Access**: All organizations
- **Can do**: Everything
- **Example**: marinusdebeer@gmail.com

### Organization Owner (`role: OWNER`)
- **Purpose**: Business owner/manager
- **Access**: Their organization only
- **Can do**: All features within org
- **Example**: admin@zenzonecleaning.com

### Organization Admin (`role: ADMIN`)
- **Purpose**: Manager/supervisor
- **Access**: Their organization only
- **Can do**: Most features, limited settings
- **Example**: manager@company.com

### Organization Staff (`role: STAFF`)
- **Purpose**: Team member/employee
- **Access**: Their organization only
- **Can do**: Basic features, no admin
- **Example**: cleaner@company.com

## 📝 Adding New Users

### As Organization Owner
1. Go to Settings → Team
2. Click "Invite Team Member"
3. Enter email and role
4. Send invitation
5. User receives email with signup link

### As Super Admin
1. Go to Admin Dashboard
2. Click organization
3. Click "Add User"
4. Enter details and role
5. User created and email sent

## 🔐 Best Practices

### Password Security
- ✅ Minimum 8 characters
- ✅ Mix of letters, numbers, symbols
- ✅ Don't reuse passwords
- ✅ Change default passwords immediately
- ✅ Use unique passwords for each account

### Account Security
- ✅ Enable 2FA when available
- ✅ Verify email address
- ✅ Review login activity regularly
- ✅ Logout from public computers
- ✅ Don't share credentials

### For Super Admins
- ⚠️ Use strong, unique password
- ⚠️ Enable 2FA (when available)
- ⚠️ Keep separate from org accounts
- ⚠️ Limit super admin users
- ⚠️ Audit admin actions regularly

## 🚨 Account Recovery

### If You're Locked Out
1. Click "Forgot Password" on login
2. Enter your email
3. Check email for reset link
4. Follow reset instructions

### If Email is Wrong
- Contact organization owner
- Or contact super admin
- They can update your email

### If Organization is Wrong
- Contact super admin
- They can move you to correct organization
- Or create new membership

## 📊 Current Account Structure

```
marinusdebeer@gmail.com (Super Admin)
  └── No organization memberships
      └── Can access all organizations

admin@zenzonecleaning.com (Owner)
  └── Zen Zone Cleaning (OWNER role)
      └── Full access to Zen Zone data only
```

## 💡 Tips

- **Forgot which email?** - Ask super admin to look it up
- **Need to change roles?** - Organization owner can do this
- **Lost access?** - Use forgot password feature
- **Wrong organization?** - Contact super admin

---

**For security questions, contact: marinusdebeer@gmail.com** 🛡️
