import passport from "passport";
import { ExtractJwt, Strategy as JwtStrategy } from "passport-jwt";
import { getAuthConfig } from "../config/auth";

// Verifies the access tokens this API issues at /api/auth/login.
// req.user is the token payload: { sub, email, ... }.
const configurePassport = () => {
  const authConfig = getAuthConfig();

  passport.use(
    new JwtStrategy(
      {
        jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
        secretOrKey: authConfig.jwtSecret,
        issuer: authConfig.issuer,
        algorithms: ["HS256"],
      },
      (jwtPayload, done) => done(null, jwtPayload)
    )
  );
};

export default configurePassport;
