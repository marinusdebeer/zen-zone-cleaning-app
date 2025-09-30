# 📧 Email SMTP Setup Guide

This guide will help you configure email functionality for CleanFlow, including password resets and welcome emails.

---

## 🎯 Quick Start

### 1. Choose an Email Provider

CleanFlow supports any SMTP email provider. Popular options:

| Provider | Best For | Cost |
|----------|----------|------|
| **Gmail** | Development/Testing | Free |
| **SendGrid** | Production (High Volume) | Free tier: 100 emails/day |
| **AWS SES** | Production (Low Cost) | $0.10 per 1,000 emails |
| **Mailgun** | Production (Developer-Friendly) | Free tier: 5,000 emails/month |
| **Resend** | Production (Modern) | Free tier: 3,000 emails/month |

### 2. Add Environment Variables

Create a `.env.local` file in your project root (if it doesn't exist) and add:

```bash
# Email Configuration
SMTP_HOST="smtp.gmail.com"
SMTP_PORT="587"
SMTP_USER="your-email@gmail.com"
SMTP_PASSWORD="your-app-password"
SMTP_FROM="CleanFlow <noreply@yourdomain.com>"

# App URL (for email links)
APP_URL="http://localhost:3000"
```

---

## 📮 Provider-Specific Setup

### Option 1: Gmail (For Development)

**✅ Best for:** Testing and development

**Steps:**

1. **Enable 2-Factor Authentication** on your Gmail account
   - Go to: https://myaccount.google.com/security
   - Enable "2-Step Verification"

2. **Generate App Password**
   - Go to: https://myaccount.google.com/apppasswords
   - Select "Mail" and your device
   - Copy the 16-character password

3. **Add to `.env.local`:**
```bash
SMTP_HOST="smtp.gmail.com"
SMTP_PORT="587"
SMTP_USER="your-email@gmail.com"
SMTP_PASSWORD="abcd efgh ijkl mnop"  # Your 16-char app password (no spaces)
SMTP_FROM="CleanFlow <your-email@gmail.com>"
APP_URL="http://localhost:3000"
```

**⚠️ Note:** Gmail has a daily sending limit of ~500 emails. Not recommended for production.

---

### Option 2: SendGrid (Recommended for Production)

**✅ Best for:** Production with high email volume

**Steps:**

1. **Create SendGrid Account**
   - Sign up at: https://sendgrid.com
   - Free tier: 100 emails/day forever

2. **Create API Key**
   - Go to Settings → API Keys
   - Click "Create API Key"
   - Name it "CleanFlow"
   - Select "Full Access"
   - Copy the API key

3. **Verify Sender Identity**
   - Go to Settings → Sender Authentication
   - Verify a single sender email OR
   - Authenticate your domain (recommended)

4. **Add to `.env.local`:**
```bash
SMTP_HOST="smtp.sendgrid.net"
SMTP_PORT="587"
SMTP_USER="apikey"
SMTP_PASSWORD="SG.xxxxxxxxxxxxxxxxxxxxx"  # Your API key
SMTP_FROM="CleanFlow <noreply@yourdomain.com>"
APP_URL="https://yourdomain.com"
```

---

### Option 3: AWS SES (Cheapest for Production)

**✅ Best for:** High-volume production use with lowest cost

**Steps:**

1. **Set up AWS SES**
   - Go to: https://console.aws.amazon.com/ses
   - Verify your domain or email
   - Request production access (removes sandbox limits)

2. **Create SMTP Credentials**
   - In SES Console → SMTP Settings
   - Click "Create SMTP Credentials"
   - Download the credentials

3. **Add to `.env.local`:**
```bash
SMTP_HOST="email-smtp.us-east-1.amazonaws.com"  # Check your region
SMTP_PORT="587"
SMTP_USER="AKIA..."  # Your AWS SMTP username
SMTP_PASSWORD="..."  # Your AWS SMTP password
SMTP_FROM="CleanFlow <noreply@yourdomain.com>"
APP_URL="https://yourdomain.com"
```

**💰 Cost:** $0.10 per 1,000 emails

---

### Option 4: Mailgun

**✅ Best for:** Developer-friendly with good free tier

**Steps:**

1. **Create Mailgun Account**
   - Sign up at: https://mailgun.com
   - Free tier: 5,000 emails/month for 3 months

2. **Get SMTP Credentials**
   - Go to Sending → Domain Settings → SMTP Credentials
   - Or use: https://app.mailgun.com/app/sending/domains

3. **Add to `.env.local`:**
```bash
SMTP_HOST="smtp.mailgun.org"
SMTP_PORT="587"
SMTP_USER="postmaster@yourdomain.mailgun.org"
SMTP_PASSWORD="your-smtp-password"
SMTP_FROM="CleanFlow <noreply@yourdomain.com>"
APP_URL="https://yourdomain.com"
```

---

### Option 5: Resend (Modern Alternative)

**✅ Best for:** Modern, developer-first approach

**Steps:**

1. **Create Resend Account**
   - Sign up at: https://resend.com
   - Free tier: 3,000 emails/month, 100/day

2. **Get API Key**
   - Go to API Keys → Create
   - Copy the key

3. **Add to `.env.local`:**
```bash
SMTP_HOST="smtp.resend.com"
SMTP_PORT="587"
SMTP_USER="resend"
SMTP_PASSWORD="re_..."  # Your API key
SMTP_FROM="CleanFlow <noreply@yourdomain.com>"
APP_URL="https://yourdomain.com"
```

---

## 🧪 Testing Your Email Configuration

### Method 1: Use the Admin Settings Page

1. Start your dev server: `npm run dev`
2. Login as super admin (`marinusdebeer@gmail.com`)
3. Go to `/admin/settings`
4. Click "Send Test Email"
5. Check your inbox

### Method 2: Test Password Reset

1. Login as super admin
2. Go to any organization detail page
3. Click "Reset Password" for a user
4. Check if email is received

### Method 3: Create New Organization

1. Login as super admin
2. Create a new organization
3. Check if welcome email is sent to the owner

---

## 📝 Environment Variables Reference

| Variable | Required | Default | Description |
|----------|----------|---------|-------------|
| `SMTP_HOST` | ✅ Yes | `smtp.gmail.com` | SMTP server hostname |
| `SMTP_PORT` | ✅ Yes | `587` | SMTP port (587 for TLS, 465 for SSL) |
| `SMTP_USER` | ✅ Yes | - | SMTP username or API key |
| `SMTP_PASSWORD` | ✅ Yes | - | SMTP password or API secret |
| `SMTP_FROM` | ✅ Yes | `CleanFlow <noreply@cleanflow.com>` | From email address and name |
| `SMTP_SECURE` | ⚪ No | `false` | Use SSL (true for port 465) |
| `APP_URL` | ✅ Yes | `http://localhost:3000` | Your app URL (for email links) |

---

## 🎨 Email Templates

CleanFlow sends these emails automatically:

### 1. Welcome Email
**Sent when:** New organization is created  
**Contains:**
- Organization name
- Login credentials
- Temporary password
- Getting started guide

### 2. Password Reset Email
**Sent when:** Admin resets a user's password  
**Contains:**
- New temporary password
- Login instructions
- Security warning

---

## 🚀 Production Deployment

### For Vercel:

1. Go to your project settings
2. Add environment variables:
   ```
   SMTP_HOST=smtp.sendgrid.net
   SMTP_PORT=587
   SMTP_USER=apikey
   SMTP_PASSWORD=SG.xxxxx...
   SMTP_FROM=CleanFlow <noreply@yourdomain.com>
   APP_URL=https://yourdomain.com
   ```

3. Redeploy your app

### For Other Platforms:

Add the same environment variables through your hosting platform's dashboard.

---

## 🔒 Security Best Practices

1. **Never commit `.env.local` to Git** (already in `.gitignore`)
2. **Use App Passwords** for Gmail, not your regular password
3. **Rotate API keys** regularly
4. **Use domain authentication** for better deliverability
5. **Monitor your sending limits** to avoid service disruption

---

## ❓ Troubleshooting

### "SMTP connection failed"
- ✅ Check your username and password
- ✅ Verify the SMTP host and port
- ✅ For Gmail: Make sure you're using an App Password
- ✅ Check firewall settings

### "Authentication failed"
- ✅ Verify API key hasn't expired
- ✅ Check for extra spaces in credentials
- ✅ Ensure account is active and verified

### Emails go to spam
- ✅ Set up SPF, DKIM, and DMARC records
- ✅ Use a verified domain
- ✅ Add a professional email signature
- ✅ Don't use free email domains (gmail.com) as FROM address

### "Daily sending limit exceeded"
- ✅ Upgrade your plan
- ✅ Use a different provider (SendGrid, SES)
- ✅ Wait 24 hours for limit to reset

---

## 📊 Email Volume Comparison

| Provider | Free Tier | Paid Plans | Best Use Case |
|----------|-----------|------------|---------------|
| **Gmail** | 500/day | N/A | Development only |
| **SendGrid** | 100/day | $19.95/mo (50k) | Mid-size businesses |
| **AWS SES** | None | $0.10/1000 | High volume, cost-conscious |
| **Mailgun** | 5,000/mo (3mo) | $35/mo (50k) | Developers |
| **Resend** | 3,000/mo | $20/mo (50k) | Modern startups |

---

## 🎯 Recommended Setup

### For Development:
```bash
# Use Gmail with App Password
SMTP_HOST="smtp.gmail.com"
SMTP_PORT="587"
SMTP_USER="your-dev-email@gmail.com"
SMTP_PASSWORD="your-app-password"
```

### For Production:
```bash
# Use SendGrid or AWS SES
SMTP_HOST="smtp.sendgrid.net"
SMTP_PORT="587"
SMTP_USER="apikey"
SMTP_PASSWORD="SG.xxxxx"
SMTP_FROM="CleanFlow <noreply@yourdomain.com>"
```

---

## 📞 Need Help?

If you're still having issues:
1. Check the server console for detailed error messages
2. Verify your environment variables are loaded: `console.log(process.env.SMTP_HOST)`
3. Use the test email feature in `/admin/settings`
4. Contact your email provider's support

---

**✅ Once configured, CleanFlow will automatically send:**
- Welcome emails to new organization owners
- Password reset emails when admins reset passwords
- All emails use professional, branded templates

🎉 **You're all set!**
