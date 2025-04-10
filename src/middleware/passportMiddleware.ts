import passport from "passport";
import jwt from "jsonwebtoken";
import { ExtractJwt, Strategy as JwtStrategy } from "passport-jwt";
import jwksClient from "jwks-rsa";
import { getAuth0Config } from "../config/auth0";
import logger from "../utils/logger";

const auth0Config = getAuth0Config();

const configurePassport = () => {
  const client = jwksClient({
    jwksUri: `https://${auth0Config.domain}/.well-known/jwks.json`,
  });

  passport.use(
    new JwtStrategy(
      {
        jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
        audience: auth0Config.apiIdentifier,
        issuer: `https://${auth0Config.domain}/`,
        algorithms: ["RS256"],
        secretOrKeyProvider: (req, rawJwt, done) => {
          logger.info(`JWT authentication attempt with token: ${rawJwt?.substring(0, 15)}...`);

          try {
            const decoded = jwt.decode(rawJwt, { complete: true });
            if (!decoded) {
              logger.error('JWT decoding failed', { tokenSnippet: rawJwt?.substring(0, 15) });
              return done(new Error('Invalid token format'));
            }

            logger.debug('JWT header decoded', { header: decoded.header });
            
            if (!decoded.header.kid) {
              logger.error('Missing key ID in JWT header');
              return done(new Error('Invalid token header'));
            }

            client.getSigningKey(decoded.header.kid, (err, key) => {
              if (err) {
                logger.error('Auth0 JWKS retrieval failed', { error: err });
                return done(err);
              }
              logger.debug('Successfully retrieved signing key', { keyId: decoded.header.kid });
              done(null, key.getPublicKey());
            });
          } catch (error) {
            logger.error('JWT processing error', { error });
            done(error);
          }
        },
      },
      (jwtPayload, done) => {
        logger.info('JWT validation successful', { 
          userId: jwtPayload.sub,
          scope: jwtPayload.scope 
        });
        done(null, jwtPayload);
      }
    )
  );
};

export default configurePassport;
