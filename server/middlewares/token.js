import dotenv from 'dotenv';
import jwt from 'jsonwebtoken';

dotenv.config();

export async function authenticate(req, res, next) {
  const { authorization } = req.headers;
  if (authorization) {
    const token = authorization.split(' ')[1];

    // Verify JWT token
    jwt.verify(token, process.env.JWT_TOKEN_SECRET, (error, decodedToken) => {
      if (error) {
        return res.status(403).json({
          status: 'Failed',
          msg_id: 'auth',
          message: 'Authentication failed!',
        });
      } else {
        req.decoded = decodedToken;
        next();
      }
    });
  } else {
    return res.status(403).json('Please Provide a token!');
  }
}

export function generateAccessToken(user) {
  if (!user) throw new Error('Invalid user for token generation');

  const payload = {
    username: user.user_email,
    isAdmin: true, // Ensure isAdmin value is accurately sourced
  };
  const secret = process.env.JWT_TOKEN_SECRET;
  const expiresIn = '1h';
  const token = jwt.sign(payload, secret, { expiresIn });

  return token;
}
