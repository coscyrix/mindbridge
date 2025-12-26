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
    jwt.verify(token, process.env.JWT_TOKEN_SECRET, async (error, decodedToken) => {
      if (error) {
        return res.status(403).json({
          status: 'Failed',
          msg_id: 'auth',
          message: 'Authentication failed!',
        });
      } else {
        console.log('decodedToken',decodedToken);
        
        // Check if user is a counselor (role_id = 2) or tenant (role_id = 3) and verify activation status from token
        // is_active is now included in the JWT token to avoid database query on every request
        if ((decodedToken.role_id === 2 || decodedToken.role_id === 3)) {
          // Check is_active from token (avoids database query)
          const isActive = decodedToken.is_active !== false && decodedToken.is_active !== 0 && decodedToken.is_active !== undefined;
          
          if (!isActive) {
            return res.status(403).json({
              status: 'Failed',
              msg_id: 'account_deactivated',
              message: 'Your account has been deactivated. Please contact your administrator.',
            });
          }
        }
        
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
