const jwt = require('jsonwebtoken');

const generateToken = (userId) => {
  return jwt.sign({ userId }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRE
  });
};

const generateTokenResponse = (userId, role) => {
  const token = generateToken(userId);
  return {
    token,
    role
  };
};

module.exports = { generateToken, generateTokenResponse };

