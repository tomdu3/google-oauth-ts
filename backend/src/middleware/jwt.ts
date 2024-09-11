import jwt from 'jsonwebtoken';

const accessSecret = process.env.JWT_SECRET || 'access_secret';
const refreshSecret = process.env.JWT_REFRESH_SECRET || 'refresh_secret';

export const generateAccessToken = (userId: number) => {
  return jwt.sign({ id: userId }, accessSecret, { expiresIn: '1h' });
};

export const generateRefreshToken = (userId: number) => {
  return jwt.sign({ id: userId }, refreshSecret, { expiresIn: '7d' });
};

export const verifyAccessToken = (token: string) => {
  try {
    return jwt.verify(token, accessSecret);
  } catch (err) {
    throw new Error('Invalid access token');
  }
};

export const verifyRefreshToken = (token: string) => {
  try {
    return jwt.verify(token, refreshSecret);
  } catch (err) {
    throw new Error('Invalid refresh token');
  }
};