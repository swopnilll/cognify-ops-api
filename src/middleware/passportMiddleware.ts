import passport from 'passport';
import jwt from 'jsonwebtoken'; // Add this
import { ExtractJwt, Strategy as JwtStrategy } from 'passport-jwt';
import jwksClient from 'jwks-rsa';
import { getAuth0Config } from '../config/auth0';

const auth0Config = getAuth0Config();

const configurePassport = () => {
  const client = jwksClient({
    jwksUri: `https://${auth0Config.domain}/.well-known/jwks.json`,
  });

  passport.use(
    new JwtStrategy(
      {
        jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
        audience: auth0Config.apiIdentifier, // Must match Auth0 API Identifier
        issuer: `https://${auth0Config.domain}/`, // Trailing slash required
        algorithms: ['RS256'],
        secretOrKeyProvider: (req, rawJwt, done) => {
          console.log('rawJwt from request header:', rawJwt); // Log the token here

          // Decode JWT without verifying to access header
          const decoded = jwt.decode(rawJwt, { complete: true });

          if (!decoded) {
            console.error('JWT could not be decoded. Check the format of the JWT.');
            return done(new Error('JWT decoding failed'));
          }

          console.log('Decoded JWT:', decoded); // Log decoded JWT to inspect the payload and header

          // Ensure the JWT header contains 'kid' (Key ID)
          if (!decoded?.header?.kid) {
            console.error('JWT header missing "kid" field.');
            return done(new Error('Missing "kid" in token header'));
          }

          // Retrieve the public key using the kid (Key ID) from Auth0
          client.getSigningKey(decoded.header.kid, (err, key) => {
            if (err) {
              console.error('Error fetching the signing key from Auth0:', err);
              return done(err);
            }

            // Log the signing key for debugging
            console.log('Signing Key:', key);

            // Provide the public key to validate the JWT
            done(null, key.getPublicKey());
          });
        },
      },
      (jwtPayload, done) => {
        // Log the decoded JWT payload
        console.log('Decoded JWT Payload:', jwtPayload);

        // Continue with the JWT validation
        done(null, jwtPayload);
      }
    )
  );
};

export default configurePassport;
