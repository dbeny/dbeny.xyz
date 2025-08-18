import passportDiscord from "passport-discord";
import passport from "passport";
import Mongobase from "../db/mongo.js";

export function initPassportDiscord() {
	passport.use(
		new passportDiscord.Strategy(
			{
				clientID: process.env.DISCORD_OAUTH_CLIENT_ID,
				clientSecret: process.env.DISCORD_OAUTH_CLIENT_SECRET,
				callbackURL: process.env.DISCORD_OAUTH_REDIRECT_URL,
				scope: ["identify", "email", "guilds"],
				authorizationURL: process.env.DISCORD_OAUTH_AUTHORIZATION_URL
            },
			async (accessToken, refreshToken, profile, done) => {
				console.log(JSON.stringify(profile, null, 4));

				const neededGuild = process.env.DISCORD_OAUTH_GUILD_ID;
				if (
					!profile.guilds ||
					profile.guilds.length === 0 ||
					!profile.guilds.some((guild) => guild.id === neededGuild)
				) {
					return done(
						new Error(`User ${profile.username} is not in the specified discord server`),
						false
					);
				}

				let foundUser;
				try {
					foundUser = await Mongobase.findUser({ discordId: profile.id });
				} catch (error) {
					return done(error, false);
				}

				if (!foundUser) {
					try {
						if (!profile.email) {
							return done(
								new Error(`Discord did not provide an email for this user (${profile.id})`),
								false
							);
						}

						const newUserData = {
							username: profile.username,
							discordId: profile.id,
							email: profile.email
						};
						foundUser = await Mongobase.addUser(newUserData);
						return done(null, foundUser);
					} catch (error) {
						return done(error, false);
					}
				}

				return done(null, foundUser);
			}
		)
	);

	passport.serializeUser((user, done) => {
		done(null, user.discordId);
	});

	passport.deserializeUser(async (discordId, done) => {
		try {
			const foundUser = await Mongobase.findUser({ discordId });
			if (!foundUser) return done(null, false);
			return done(null, foundUser);
		} catch (error) {
			return done(error, false);
		}
	});
}
