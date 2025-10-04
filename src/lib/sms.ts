/**
 * SMS FUNCTIONALITY (Twilio)
 * 
 * Purpose:
 * Send SMS messages to clients using Twilio
 */

// @ts-ignore - Twilio types may not be available
import twilio from 'twilio';

const TWILIO_CONFIG = {
  accountSid: process.env.TWILIO_ACCOUNT_SID,
  authToken: process.env.TWILIO_AUTH_TOKEN,
  phoneNumber: process.env.TWILIO_PHONE_NUMBER,
};

function getTwilioClient() {
  if (!TWILIO_CONFIG.accountSid || !TWILIO_CONFIG.authToken) {
    throw new Error('Twilio not configured. Please add TWILIO_ACCOUNT_SID and TWILIO_AUTH_TOKEN to .env');
  }
  return twilio(TWILIO_CONFIG.accountSid, TWILIO_CONFIG.authToken);
}

export async function verifyTwilioConfig(): Promise<boolean> {
  try {
    if (!TWILIO_CONFIG.accountSid || !TWILIO_CONFIG.authToken || !TWILIO_CONFIG.phoneNumber) {
      console.log('⚠️  Twilio not configured - credentials missing');
      return false;
    }
    
    const client = getTwilioClient();
    // Verify by fetching account info
    await client.api.accounts(TWILIO_CONFIG.accountSid).fetch();
    console.log('✅ Twilio configuration verified');
    return true;
  } catch (error) {
    console.error('❌ Twilio configuration error:', error);
    return false;
  }
}

export async function sendEstimateSMS(data: {
  to: string;
  estimateTitle: string;
  estimateTotal: number;
  estimateUrl: string;
}): Promise<void> {
  const client = getTwilioClient();

  if (!TWILIO_CONFIG.phoneNumber) {
    throw new Error('Twilio phone number not configured');
  }

  // Format phone number (remove spaces, dashes, etc.)
  const formattedTo = data.to.replace(/[\s\-\(\)]/g, '');
  
  // Ensure it has country code
  const phoneNumber = formattedTo.startsWith('+') ? formattedTo : `+1${formattedTo}`;

  const message = `Hi! Your estimate for "${data.estimateTitle}" is ready.

Total: $${data.estimateTotal.toFixed(2)}

View your estimate: ${data.estimateUrl}

- Zen Zone Cleaning`;

  await client.messages.create({
    body: message,
    from: TWILIO_CONFIG.phoneNumber,
    to: phoneNumber,
  });
}

