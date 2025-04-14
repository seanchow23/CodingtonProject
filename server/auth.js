const passport = require('passport');
const GoogleStrategy = require('passport-google-oauth20').Strategy;
const User = require('./models/user'); // make sure this path is correct

passport.use(new GoogleStrategy({
  clientID: process.env.GOOGLE_CLIENT_ID,
  clientSecret: process.env.GOOGLE_CLIENT_SECRET,
  callbackURL: process.env.GOOGLE_CALLBACK_URL
},
async (accessToken, refreshToken, profile, done) => {
  try {
    const email = profile.emails[0].value;

    // Check if the user exists
    let user = await User.findOne({ email });

    if (!user) {
      // Create a new user
      user = await User.create({
        username: profile.displayName,
        email,
        googleAuth: {
          googleId: profile.id,
          accessToken
        }
      });
    }

    done(null, user); // Pass the user to the session
  } catch (err) {
    done(err, null);
  }
}));

// Store the user's ID in the session
passport.serializeUser((user, done) => {
  done(null, user.id);
});

// Get the full user object from the ID in the session
passport.deserializeUser(async (id, done) => {
  try {
    const user = await User.findById(id);
    done(null, user);
  } catch (err) {
    done(err, null);
  }
});
