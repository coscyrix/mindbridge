import { createRequire } from 'module';
const require = createRequire(import.meta.url);
const dotenv = require('dotenv');;
const jwt = require('jsonwebtoken');;

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
        console.log('decodedToken',decodedToken);
        
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

  console.log('user----->',user);

  const payload = {
    username: user.user_email,
    isAdmin: true, // Ensure isAdmin value is accurately sourced
    tenant_id: user.tenant_id, // Add tenant_id to the payload
  };
  const secret = process.env.JWT_TOKEN_SECRET;
  const expiresIn = '1h';
  const token = jwt.sign(payload, secret, { expiresIn });

  return token;
}
