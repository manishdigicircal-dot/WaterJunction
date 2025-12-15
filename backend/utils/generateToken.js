import jwt from 'jsonwebtoken';

// Fallback secrets so app doesn't crash if env vars are missing (for dev/demo).
// NOTE: In real production, ALWAYS override these with strong secrets in env vars.
const JWT_SECRET = process.env.JWT_SECRET || 'dev_jwt_secret_change_me';
const JWT_REFRESH_SECRET =
  process.env.JWT_REFRESH_SECRET || 'dev_jwt_refresh_secret_change_me';

export const generateToken = (id) => {
  return jwt.sign({ id }, JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRE || '7d'
  });
};

export const generateRefreshToken = (id) => {
  return jwt.sign({ id }, JWT_REFRESH_SECRET, {
    expiresIn: process.env.JWT_REFRESH_EXPIRE || '30d'
  });
};

export const sendTokenResponse = (user, statusCode, res) => {
  const token = generateToken(user._id);
  const refreshToken = generateRefreshToken(user._id);

  // Save refresh token to user
  user.refreshToken = refreshToken;
  user.save({ validateBeforeSave: false });

  const options = {
    expires: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // 30 days
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'strict'
  };

  res
    .status(statusCode)
    .cookie('token', token, options)
    .json({
      success: true,
      token,
      refreshToken,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        phone: user.phone,
        role: user.role,
        profilePhoto: user.profilePhoto
      }
    });
};




