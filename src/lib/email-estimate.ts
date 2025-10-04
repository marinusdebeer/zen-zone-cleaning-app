/**
 * ESTIMATE EMAIL FUNCTIONALITY
 * 
 * Purpose:
 * Send estimate emails to clients with professional templates
 */

import nodemailer from 'nodemailer';

const SMTP_CONFIG = {
  host: process.env.SMTP_HOST || 'smtp.gmail.com',
  port: parseInt(process.env.SMTP_PORT || '587'),
  secure: process.env.SMTP_SECURE === 'true',
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASSWORD,
  },
};

const FROM_EMAIL = process.env.SMTP_FROM || 'Zen Zone Cleaning <noreply@zenzonecleaning.com>';
const APP_URL = process.env.APP_URL || process.env.NEXTAUTH_URL || 'http://localhost:3000';

function getTransporter() {
  return nodemailer.createTransport(SMTP_CONFIG);
}

export async function sendEstimateEmail(data: {
  to: string;
  subject: string;
  body: string;
  estimateId: string;
  clientName: string;
  estimateTitle: string;
  estimateTotal: number;
  attachments?: { filename: string; content: Buffer }[];
}): Promise<void> {
  const transport = getTransporter();

  // Format the body with line breaks
  const formattedBody = data.body.replace(/\n/g, '<br>');

  const htmlContent = `
<!DOCTYPE html>
<html>
<head>
  <style>
    body { font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; line-height: 1.6; color: #333; background-color: #f5f5f5; }
    .container { max-width: 600px; margin: 0 auto; padding: 20px; }
    .email-wrapper { background: white; border-radius: 12px; overflow: hidden; box-shadow: 0 2px 8px rgba(0,0,0,0.1); }
    .header { background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 40px 30px; text-align: center; }
    .content { padding: 30px; }
    .estimate-box { background: #f8f9fa; border-left: 4px solid #667eea; padding: 20px; margin: 20px 0; border-radius: 4px; }
    .total { font-size: 28px; font-weight: bold; color: #667eea; }
    .button { display: inline-block; padding: 14px 35px; background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white !important; text-decoration: none; border-radius: 6px; margin: 20px 0; font-weight: bold; }
    .footer { text-align: center; padding: 20px; border-top: 1px solid #e5e5e5; color: #666; font-size: 13px; }
    .message-body { background: #f8f9fa; padding: 20px; border-radius: 8px; margin: 20px 0; white-space: pre-wrap; }
  </style>
</head>
<body>
  <div class="container">
    <div class="email-wrapper">
      <div class="header">
        <h1 style="margin: 0; font-size: 32px;">📄 Estimate Ready</h1>
        <p style="margin: 10px 0 0 0; opacity: 0.95; font-size: 16px;">Zen Zone Cleaning</p>
      </div>
      <div class="content">
        <div class="message-body">
          ${formattedBody}
        </div>
        
        <div class="estimate-box">
          <h3 style="margin-top: 0; color: #667eea;">Estimate Details</h3>
          <p style="margin: 5px 0;"><strong>Service:</strong> ${data.estimateTitle}</p>
          <p style="margin: 5px 0;"><strong>Total Amount:</strong></p>
          <div class="total">$${data.estimateTotal.toFixed(2)}</div>
          <p style="margin-top: 15px; font-size: 13px; color: #666;">
            Please review the attached estimate PDF for complete details.
          </p>
        </div>
        
        <center>
          <a href="${APP_URL}/estimates/${data.estimateId}" class="button">View Estimate Online →</a>
        </center>
        
        <p style="margin-top: 30px; font-size: 14px; color: #666;">
          Have questions? Feel free to reply to this email or give us a call.
        </p>
      </div>
      <div class="footer">
        <p>Thank you for choosing Zen Zone Cleaning!</p>
        <p style="margin-top: 5px;">© ${new Date().getFullYear()} Zen Zone Cleaning. All rights reserved.</p>
      </div>
    </div>
  </div>
</body>
</html>
  `;

  const textContent = `
${data.body}

---

Estimate Details:
Service: ${data.estimateTitle}
Total: $${data.estimateTotal.toFixed(2)}

View online: ${APP_URL}/estimates/${data.estimateId}

---
Thank you for choosing Zen Zone Cleaning!
© ${new Date().getFullYear()} Zen Zone Cleaning. All rights reserved.
  `;

  // Prepare mail options
  const mailOptions: any = {
    from: FROM_EMAIL,
    to: data.to,
    subject: data.subject,
    text: textContent,
    html: htmlContent,
    attachments: data.attachments || [],
  };

  // Send email
  await transport.sendMail(mailOptions);
}

