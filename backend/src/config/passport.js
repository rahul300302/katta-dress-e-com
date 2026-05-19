import passport from 'passport';
import { Strategy as GoogleStrategy } from 'passport-google-oauth20';
import env from './env.js';
import { User } from '../models/index.js';

export function configurePassport() {
  if (!env.google.clientId || !env.google.clientSecret) {
    console.warn('Google OAuth not configured — set GOOGLE_CLIENT_ID and GOOGLE_CLIENT_SECRET');
    return;
  }

  passport.use(
    new GoogleStrategy(
      {
        clientID: env.google.clientId,
        clientSecret: env.google.clientSecret,
        callbackURL: env.google.callbackUrl,
      },
      async (_accessToken, _refreshToken, profile, done) => {
        try {
          const email = profile.emails?.[0]?.value?.toLowerCase();
          if (!email) return done(new Error('Google account has no email'));

          let user = await User.findOne({ where: { googleId: profile.id } });
          if (!user) user = await User.findOne({ where: { email } });

          const isAdmin = env.adminEmails.includes(email);

          if (user) {
            await user.update({
              googleId: profile.id,
              name: profile.displayName || user.name,
              avatar: profile.photos?.[0]?.value || user.avatar,
              role: isAdmin ? 'admin' : user.role,
            });
          } else {
            user = await User.create({
              googleId: profile.id,
              email,
              name: profile.displayName || 'KATTA User',
              avatar: profile.photos?.[0]?.value || '',
              role: isAdmin ? 'admin' : 'user',
            });
          }

          user._id = user.id;
          done(null, user);
        } catch (err) {
          done(err);
        }
      }
    )
  );
}
