import twilio from 'twilio';

const accountSid = process.env.TWILIO_ACCOUNT_SID;
const authToken = process.env.TWILIO_AUTH_TOKEN;
const twilioPhone = process.env.TWILIO_PHONE_NUMBER;

// For development/testing without Twilio
export const generateOTP = () => {
  return Math.floor(100000 + Math.random() * 900000).toString();
};

export const sendOTP = async (phoneNumber, otp) => {
  // If Twilio is configured, use it
  if (accountSid && authToken && twilioPhone) {
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










const accountSid = process.env.TWILIO_ACCOUNT_SID;
const authToken = process.env.TWILIO_AUTH_TOKEN;
const twilioPhone = process.env.TWILIO_PHONE_NUMBER;

// For development/testing without Twilio
export const generateOTP = () => {
  return Math.floor(100000 + Math.random() * 900000).toString();
};

export const sendOTP = async (phoneNumber, otp) => {
  // If Twilio is configured, use it
  if (accountSid && authToken && twilioPhone) {
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










