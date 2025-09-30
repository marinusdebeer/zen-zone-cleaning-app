import nodemailer from 'nodemailer';

// Email configuration from environment variables
const SMTP_CONFIG = {
  host: process.env.SMTP_HOST || 'smtp.gmail.com',
  port: parseInt(process.env.SMTP_PORT || '587'),
  secure: process.env.SMTP_SECURE === 'true', // true for 465, false for other ports
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASSWORD,
  },
};

const FROM_EMAIL = process.env.SMTP_FROM || 'CleanFlow <noreply@cleanflow.com>';
const APP_URL = process.env.APP_URL || process.env.NEXTAUTH_URL || 'http://localhost:3000';

// Create reusable transporter
let transporter: nodemailer.Transporter | null = null;

function getTransporter() {
  if (!transporter) {
    transporter = nodemailer.createTransport(SMTP_CONFIG);
  }
  return transporter;
}

// Verify SMTP connection
export async function verifyEmailConfig(): Promise<boolean> {
  try {
    if (!process.env.SMTP_USER || !process.env.SMTP_PASSWORD) {
      console.log('⚠️  Email not configured - SMTP credentials missing');
      return false;
    }
    
    const transport = getTransporter();
    await transport.verify();
    console.log('✅ Email configuration verified');
    return true;
  } catch (error) {
    console.error('❌ Email configuration error:', error);
    return false;
  }
}

/**
 * Send password reset email
 */
export async function sendPasswordResetEmail(
  email: string,
  userName: string,
  temporaryPassword: string
): Promise<void> {
  const transport = getTransporter();

  const htmlContent = `
<!DOCTYPE html>
<html>
<head>
  <style>
    body { font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; line-height: 1.6; color: #333; }
    .container { max-width: 600px; margin: 0 auto; padding: 20px; }
    .header { background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }
    .content { background: #f8f9fa; padding: 30px; border-radius: 0 0 10px 10px; }
    .password-box { background: white; border: 2px dashed #667eea; padding: 20px; margin: 20px 0; text-align: center; border-radius: 8px; }
    .password { font-size: 24px; font-weight: bold; color: #667eea; letter-spacing: 2px; font-family: 'Courier New', monospace; }
    .button { display: inline-block; padding: 12px 30px; background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; text-decoration: none; border-radius: 5px; margin: 20px 0; }
    .footer { text-align: center; margin-top: 30px; padding-top: 20px; border-top: 1px solid #ddd; color: #666; font-size: 12px; }
    .warning { background: #fff3cd; border-left: 4px solid #ffc107; padding: 15px; margin: 20px 0; border-radius: 4px; }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <h1 style="margin: 0;">🔐 Password Reset</h1>
      <p style="margin: 10px 0 0 0; opacity: 0.9;">CleanFlow Admin</p>
    </div>
    <div class="content">
      <p>Hi <strong>${userName}</strong>,</p>
      
      <p>Your password has been reset by a CleanFlow administrator. Here is your temporary password:</p>
      
      <div class="password-box">
        <div class="password">${temporaryPassword}</div>
      </div>
      
      <div class="warning">
        <strong>⚠️ Important:</strong> Please change this temporary password immediately after logging in for security reasons.
      </div>
      
      <p>To access your account:</p>
      <ol>
        <li>Go to the CleanFlow login page</li>
        <li>Enter your email: <strong>${email}</strong></li>
        <li>Use the temporary password above</li>
        <li>Change your password in account settings</li>
      </ol>
      
      <center>
        <a href="${APP_URL}/auth/signin" class="button">Login to CleanFlow</a>
      </center>
      
      <p style="margin-top: 30px; font-size: 14px; color: #666;">
        If you didn't request this password reset, please contact your administrator immediately.
      </p>
    </div>
    <div class="footer">
      <p>This is an automated email from CleanFlow. Please do not reply.</p>
      <p>© ${new Date().getFullYear()} CleanFlow. All rights reserved.</p>
    </div>
  </div>
</body>
</html>
  `;

  const textContent = `
Password Reset - CleanFlow

Hi ${userName},

Your password has been reset by a CleanFlow administrator.

Temporary Password: ${temporaryPassword}

⚠️ IMPORTANT: Please change this temporary password immediately after logging in.

To access your account:
1. Go to: ${APP_URL}/auth/signin
2. Email: ${email}
3. Use the temporary password above
4. Change your password in account settings

If you didn't request this password reset, contact your administrator immediately.

---
This is an automated email from CleanFlow. Please do not reply.
© ${new Date().getFullYear()} CleanFlow. All rights reserved.
  `;

  await transport.sendMail({
    from: FROM_EMAIL,
    to: email,
    subject: '🔐 Your CleanFlow Password Has Been Reset',
    text: textContent,
    html: htmlContent,
  });
}

/**
 * Send welcome email to new organization owner
 */
export async function sendWelcomeEmail(
  email: string,
  organizationName: string,
  ownerName: string,
  temporaryPassword: string
): Promise<void> {
  const transport = getTransporter();

  const htmlContent = `
<!DOCTYPE html>
<html>
<head>
  <style>
    body { font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; line-height: 1.6; color: #333; }
    .container { max-width: 600px; margin: 0 auto; padding: 20px; }
    .header { background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 40px; text-align: center; border-radius: 10px 10px 0 0; }
    .content { background: #f8f9fa; padding: 30px; border-radius: 0 0 10px 10px; }
    .password-box { background: white; border: 2px solid #667eea; padding: 20px; margin: 20px 0; text-align: center; border-radius: 8px; }
    .password { font-size: 24px; font-weight: bold; color: #667eea; letter-spacing: 2px; font-family: 'Courier New', monospace; }
    .button { display: inline-block; padding: 14px 35px; background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; text-decoration: none; border-radius: 5px; margin: 20px 0; font-weight: bold; }
    .feature-list { background: white; padding: 20px; border-radius: 8px; margin: 20px 0; }
    .feature-list li { margin: 10px 0; }
    .footer { text-align: center; margin-top: 30px; padding-top: 20px; border-top: 1px solid #ddd; color: #666; font-size: 12px; }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <h1 style="margin: 0; font-size: 32px;">🎉 Welcome to CleanFlow!</h1>
      <p style="margin: 10px 0 0 0; font-size: 18px; opacity: 0.95;">Your cleaning business management platform</p>
    </div>
    <div class="content">
      <p>Hi <strong>${ownerName}</strong>,</p>
      
      <p>Welcome to CleanFlow! Your organization <strong>${organizationName}</strong> has been successfully created.</p>
      
      <p>Here are your login credentials:</p>
      
      <div class="password-box">
        <p style="margin: 5px 0; color: #666;">Email</p>
        <div style="font-size: 16px; color: #333; margin-bottom: 15px;"><strong>${email}</strong></div>
        <p style="margin: 5px 0; color: #666;">Temporary Password</p>
        <div class="password">${temporaryPassword}</div>
      </div>
      
      <p><strong>⚠️ For security, please change your password after your first login.</strong></p>
      
      <center>
        <a href="${APP_URL}/auth/signin" class="button">Get Started →</a>
      </center>
      
      <div class="feature-list">
        <h3 style="margin-top: 0; color: #667eea;">What you can do with CleanFlow:</h3>
        <ul style="line-height: 1.8;">
          <li>📋 Manage clients and properties</li>
          <li>📅 Schedule jobs and recurring appointments</li>
          <li>💰 Create estimates and invoices</li>
          <li>👥 Manage your team members</li>
          <li>📊 Track business performance</li>
          <li>💳 Record payments and expenses</li>
        </ul>
      </div>
      
      <p style="margin-top: 30px;">Need help getting started? Our team is here to support you every step of the way.</p>
    </div>
    <div class="footer">
      <p>Questions? Contact us at support@cleanflow.com</p>
      <p>© ${new Date().getFullYear()} CleanFlow. All rights reserved.</p>
    </div>
  </div>
</body>
</html>
  `;

  const textContent = `
Welcome to CleanFlow!

Hi ${ownerName},

Welcome to CleanFlow! Your organization "${organizationName}" has been successfully created.

Login Credentials:
Email: ${email}
Temporary Password: ${temporaryPassword}

⚠️ For security, please change your password after your first login.

Get Started: ${APP_URL}/auth/signin

What you can do with CleanFlow:
- Manage clients and properties
- Schedule jobs and recurring appointments
- Create estimates and invoices
- Manage your team members
- Track business performance
- Record payments and expenses

Need help? Contact us at support@cleanflow.com

---
© ${new Date().getFullYear()} CleanFlow. All rights reserved.
  `;

  await transport.sendMail({
    from: FROM_EMAIL,
    to: email,
    subject: '🎉 Welcome to CleanFlow - Your Account is Ready!',
    text: textContent,
    html: htmlContent,
  });
}

/**
 * Send test email (for configuration verification)
 */
export async function sendTestEmail(toEmail: string): Promise<void> {
  const transport = getTransporter();

  await transport.sendMail({
    from: FROM_EMAIL,
    to: toEmail,
    subject: '✅ CleanFlow Email Test',
    html: `
      <div style="font-family: Arial, sans-serif; padding: 20px; max-width: 600px; margin: 0 auto;">
        <h2 style="color: #667eea;">✅ Email Configuration Successful!</h2>
        <p>This is a test email from CleanFlow.</p>
        <p>Your SMTP configuration is working correctly.</p>
        <hr style="border: 1px solid #eee; margin: 20px 0;">
        <p style="font-size: 12px; color: #666;">
          Sent at: ${new Date().toLocaleString()}<br>
          From: ${FROM_EMAIL}
        </p>
      </div>
    `,
    text: 'Email configuration test successful! Your SMTP settings are working correctly.',
  });
}

export async function sendPasswordResetLink(
  email: string,
  userName: string,
  resetUrl: string
): Promise<void> {
  const transport = getTransporter();

  const htmlContent = `
<!DOCTYPE html>
<html>
<head>
  <style>
    body { font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; line-height: 1.6; color: #333; }
    .container { max-width: 600px; margin: 0 auto; padding: 20px; }
    .header { background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }
    .content { background: #f8f9fa; padding: 30px; border-radius: 0 0 10px 10px; }
    .button { display: inline-block; padding: 14px 35px; background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white !important; text-decoration: none; border-radius: 5px; margin: 20px 0; font-weight: bold; }
    .footer { text-align: center; margin-top: 30px; padding-top: 20px; border-top: 1px solid #ddd; color: #666; font-size: 12px; }
    .warning { background: #fff3cd; border-left: 4px solid #ffc107; padding: 15px; margin: 20px 0; border-radius: 4px; }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <h1 style="margin: 0;">🔐 Reset Your Password</h1>
      <p style="margin: 10px 0 0 0; opacity: 0.9;">CleanFlow</p>
    </div>
    <div class="content">
      <p>Hi <strong>${userName}</strong>,</p>
      
      <p>We received a request to reset your password for your CleanFlow account.</p>
      
      <p>Click the button below to create a new password:</p>
      
      <center>
        <a href="${resetUrl}" class="button">Reset Password →</a>
      </center>
      
      <p style="color: #666; font-size: 14px; margin-top: 20px;">
        Or copy and paste this link into your browser:<br>
        <a href="${resetUrl}" style="color: #667eea; word-break: break-all;">${resetUrl}</a>
      </p>
      
      <div class="warning">
        <p style="margin: 0;"><strong>⚠️ This link will expire in 1 hour.</strong></p>
        <p style="margin: 5px 0 0 0; font-size: 14px;">If you didn't request this password reset, you can safely ignore this email.</p>
      </div>
      
      <p style="margin-top: 30px; font-size: 14px; color: #666;">
        For security reasons, never share this link with anyone.
      </p>
    </div>
    <div class="footer">
      <p>Questions? Contact us at support@cleanflow.com</p>
      <p>© ${new Date().getFullYear()} CleanFlow. All rights reserved.</p>
    </div>
  </div>
</body>
</html>
  `;

  const mailOptions = {
    from: FROM_EMAIL,
    to: email,
    subject: 'Reset Your CleanFlow Password',
    html: htmlContent,
  };

  await transport.sendMail(mailOptions);
}
