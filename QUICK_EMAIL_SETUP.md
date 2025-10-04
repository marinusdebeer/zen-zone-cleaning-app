# 📧 Quick Email Setup for CleanFlow

## ✅ What's Been Installed

I've set up a complete email system for CleanFlow. Here's what's working:

### 📦 Packages Installed
- ✅ `nodemailer` - For sending emails via SMTP
- ✅ `@types/nodemailer` - TypeScript support

### 🎨 Email Templates Created
1. **Welcome Email** - Sent when new organization is created
2. **Password Reset Email** - Sent when admin resets a user's password

### 🔧 Features Implemented
- ✅ Automatic welcome emails with login credentials
- ✅ Password reset emails with temporary passwords
- ✅ Beautiful HTML email templates
- ✅ Graceful error handling (operations don't fail if email fails)
- ✅ Console logging for debugging
- ✅ Support for all major email providers

---

## 🚀 Quick Start (5 Minutes)

### Option A: Use Gmail (Easiest for Testing)

1. **Enable 2FA on Gmail**
   - Go to: https://myaccount.google.com/security
   - Turn on "2-Step Verification"

2. **Generate App Password**
   - Go to: https://myaccount.google.com/apppasswords
   - Select "Mail" → Your device
   - Copy the 16-character password (remove spaces)

3. **Add to `.env` file:**
```bash
SMTP_HOST="smtp.gmail.com"
SMTP_PORT="587"
SMTP_USER="your-email@gmail.com"
SMTP_PASSWORD="abcdefghijklmnop"  # Your 16-char app password (no spaces)
SMTP_FROM="CleanFlow <your-email@gmail.com>"
APP_URL="http://localhost:3000"
```

5. **Restart your dev server:**
```bash
npm run dev
```

6. **Test it:**
   - Login as super admin (`marinusdebeer@gmail.com`)
   - Create a new organization
   - Check your email for the welcome message!

---

### Option B: Use SendGrid (Best for Production)

1. **Create SendGrid Account**
   - Go to: https://sendgrid.com
   - Sign up (free tier: 100 emails/day)

2. **Create API Key**
   - Go to Settings → API Keys
   - Click "Create API Key"
   - Name: "CleanFlow"
   - Permission: Full Access
   - Copy the key (starts with `SG.`)

3. **Verify Sender**
   - Go to Settings → Sender Authentication
   - Verify an email address

4. **Add to `.env`:**
```bash
SMTP_HOST="smtp.sendgrid.net"
SMTP_PORT="587"
SMTP_USER="apikey"
SMTP_PASSWORD="SG.xxxxxxxxxxxxxxxxxxxxxx"  # Your API key
SMTP_FROM="CleanFlow <noreply@yourdomain.com>"
APP_URL="http://localhost:3000"
```

5. **Restart and test!**

---

## 🧪 How to Test

### Test 1: Create New Organization
1. Login as super admin
2. Go to `/admin`
3. Click "New Organization"
4. Fill in the form with YOUR email
5. Click "Create Organization"
6. ✅ Check your inbox for welcome email

### Test 2: Password Reset
1. Login as super admin
2. Go to any organization detail page
3. Click "Reset Password" on a user
4. ✅ Check the user's inbox for reset email

### Test 3: Check Console
Look for these messages in your terminal:
```
✅ Welcome email sent to: user@example.com
✅ Password reset email sent to: user@example.com
```

If you see:
```
⚠️  Failed to send welcome email: [error]
```
Check your SMTP credentials!

---

## 📂 Files Created/Modified

### New Files:
- `src/lib/email.ts` - Email sending functions
- `docs/EMAIL_SETUP.md` - Detailed setup guide
- `ENV_TEMPLATE.txt` - Environment variables template
- `QUICK_EMAIL_SETUP.md` - This file!

### Modified Files:
- `src/server/actions/admin.ts` - Added email sending to admin actions
- `package.json` - Added nodemailer packages
- `docs/README.md` - Added email setup link

---

## 🎨 Email Preview

### Welcome Email Includes:
- 🎉 Welcome message with organization name
- 📧 Email address
- 🔐 Temporary password
- 🔗 Login button
- 📋 Feature list
- ⚠️ Security reminder

### Password Reset Email Includes:
- 🔐 New temporary password
- 📧 Email address
- 🔗 Login button
- ⚠️ Security warning
- 📝 Step-by-step instructions

---

## ⚙️ Environment Variables Explained

| Variable | Required | Example | Description |
|----------|----------|---------|-------------|
| `SMTP_HOST` | ✅ Yes | `smtp.gmail.com` | Your email provider's SMTP server |
| `SMTP_PORT` | ✅ Yes | `587` | SMTP port (587 for TLS, 465 for SSL) |
| `SMTP_USER` | ✅ Yes | `your-email@gmail.com` | Your email/username |
| `SMTP_PASSWORD` | ✅ Yes | `abc...` | Your password/API key |
| `SMTP_FROM` | ✅ Yes | `CleanFlow <noreply@domain.com>` | From address |
| `APP_URL` | ✅ Yes | `http://localhost:3000` | Your app URL |

---

## 🐛 Troubleshooting

### Emails Not Sending?

**Check 1: Environment Variables**
```bash
# In your terminal, verify they're set:
echo $SMTP_HOST
echo $SMTP_USER
```

**Check 2: Console Errors**
Look for error messages in your terminal when running `npm run dev`

**Check 3: Credentials**
- Gmail: Using App Password (not regular password)?
- SendGrid: API key correct? Starts with `SG.`?
- All: No extra spaces in credentials?

**Check 4: Restart Server**
```bash
# Stop the server (Ctrl+C)
# Start again:
npm run dev
```

### Emails Go to Spam?

For development/testing with Gmail:
- ✅ This is normal for development
- ✅ Check your spam folder
- ✅ Mark as "Not Spam"

For production:
- Use SendGrid or AWS SES
- Set up SPF, DKIM, DMARC records
- Use your own domain for FROM address

### "Invalid login" Error?

**Gmail:**
- Make sure 2FA is enabled
- Use App Password, not regular password
- App password should be 16 characters (no spaces)

**SendGrid:**
- SMTP_USER should be exactly: `apikey`
- SMTP_PASSWORD should be your full API key

---

## 📊 Provider Comparison

| Provider | Free Tier | Setup Difficulty | Best For |
|----------|-----------|------------------|----------|
| **Gmail** | 500/day | ⭐ Easy | Testing |
| **SendGrid** | 100/day | ⭐⭐ Medium | Production |
| **AWS SES** | None ($0.10/1k) | ⭐⭐⭐ Hard | High Volume |
| **Mailgun** | 5,000/mo | ⭐⭐ Medium | Developers |

---

## 🚀 Next Steps

1. **For Development:**
   - Use Gmail setup (takes 5 minutes)
   - Test creating organizations
   - Test password resets

2. **Before Production:**
   - Switch to SendGrid or AWS SES
   - Use your own domain for FROM address
   - Set up proper DNS records (SPF, DKIM)
   - Test thoroughly

3. **Read Full Guide:**
   - See `docs/EMAIL_SETUP.md` for detailed instructions
   - Includes setup for all providers
   - Production best practices

---

## 💡 Tips

- **Development:** Gmail is perfect for testing
- **Production:** Use SendGrid (easiest) or AWS SES (cheapest)
- **Custom Domain:** Better deliverability, looks more professional
- **Monitor:** Check console logs to see if emails are sending
- **Test First:** Always test before deploying to production

---

## ✅ Checklist

- [ ] Choose email provider (Gmail for dev, SendGrid for prod)
- [ ] Create account and get credentials
- [ ] Add credentials to `.env`
- [ ] Restart dev server
- [ ] Test creating organization
- [ ] Test password reset
- [ ] Check console for success/error messages
- [ ] Verify emails are received
- [ ] Check spam folder if needed

---

## 🎉 You're Done!

Once configured, CleanFlow will automatically send:
- ✅ Welcome emails when organizations are created
- ✅ Password reset emails when admins reset passwords
- ✅ Beautiful, professional email templates
- ✅ All with your branding

Need more help? Check `docs/EMAIL_SETUP.md` for detailed instructions!

---

**Note:** If emails are not critical for your testing right now, you can skip this setup. The app will continue to work - it just won't send emails. Passwords will still be generated and shown in the console and on the success page.
