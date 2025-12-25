// Dynamic import for optional Twilio dependency
let twilio = null;
try {
  twilio = (await import('twilio')).default;
} catch (error) {
  console.warn('⚠️ Twilio not installed - OTP will be logged to console only');
}

const accountSid = process.env.TWILIO_ACCOUNT_SID;
const authToken = process.env.TWILIO_AUTH_TOKEN;
const twilioPhone = process.env.TWILIO_PHONE_NUMBER;

// For development/testing without Twilio
export const generateOTP = () => {
  return Math.floor(100000 + Math.random() * 900000).toString();
};

export const sendOTP = async (phoneNumber, otp) => {
  // If Twilio is configured and available, use it
  if (twilio && accountSid && authToken && twilioPhone) {
    try {
      const client = twilio(accountSid, authToken);
      await client.messages.create({
        body: `Your WaterJunction OTP is: ${otp}. Valid for 10 minutes.`,
        from: twilioPhone,
        to: phoneNumber
      });
      return true;
    } catch (error) {
      console.error('Twilio error:', error);
      return false;
    }
  } else {
    // Development mode - just log the OTP
    console.log(`📱 OTP for ${phoneNumber}: ${otp}`);
    return true;
  }
};