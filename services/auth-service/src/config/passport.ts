import passport, { Passport } from "passport";
import User from "../models/User.model.js";
import { Strategy, type Profile } from "passport-google-oauth20";

console.log("Passport config loaded");


passport.use(
    new Strategy(
        {
            clientID: process.env.GOOGLE_CLIENT_ID!,
            clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
            callbackURL: process.env.GOOGLE_CALLBACK_URL!,
            scope: ['email', 'profile'],   // 

        },
        async (
            _accessToken: string,
            _refreshToken: string,
            profile: Profile,
            done
        ) => {
            try {
                if (!profile) {
                    return done(new Error("Google profile not found"), false);
                }
                if (!profile.emails || profile.emails.length === 0) {
                    return done(new Error("No email provided by Google"), false);
                }

                const email = profile.emails?.[0]?.value
                if (!email) {
                    return done(new Error("No email provided by Google"), false);
                }

                let user = await User.findOne({ email });

                if (!user) {
                    user = await User.create({
                        name: profile.displayName,
                        email,
                        provider: "google",
                    });
                }


                return done(null, user);
            } catch (error) {
                return done(error as Error, false);
            }
        }

    )

);

export default passport;
