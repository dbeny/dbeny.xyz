import express from "express";
import session from "express-session";
import cookieParser from "cookie-parser";
import dotenv from "dotenv";
import passport from "passport";
import path from "path";
import MongoStore from "connect-mongo";
import Mongobase from "./scripts/db/mongo.js";
import { initPassportDiscord } from "./scripts/auth/passport_config.js";
import { addDebugPosts } from "./scripts/importPosts.js";
import { initMailer } from "./scripts/mail/mailer.js";

dotenv.config();

initPassportDiscord(); 
initMailer()

const app = express();
const PORT = process.env.PORT || 3000;
const IS_DEV = process.env.NODE_ENV === "development";

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());

await Mongobase.connect();

app.use(
    session({
        secret: process.env.SESSION_SECRET || "supersecret",
        resave: false,
        saveUninitialized: false,
        store: MongoStore.create({
            mongoUrl: process.env.MONGO_CONNECTION_STRING,
            dbName: process.env.MONGO_DB_NAME,
            collectionName: "sessions"
        }),
        cookie: {
            secure: !IS_DEV, // secure cookies in production
            httpOnly: true,
            maxAge: 1000 * 60 * 60 * 24, // 1 day
            sameSite: IS_DEV ? "lax" : "none"
        }
    })
);

app.use(passport.initialize());
app.use(passport.session());

app.use(express.static(path.join(process.cwd(), "static")));
console.log("Public:", path.join(process.cwd(), "static"))

app.get("/", (req, res) => {
    res.sendFile(path.join(process.cwd(), "static/index.html"));
});

app.get("/ohnoey", (req, res) => {
    res.sendFile(path.join(process.cwd(), "static/ohnoey.html"))
});

app.get("/auth/discord", passport.authenticate("discord"));
app.get("/auth/discord/callback", passport.authenticate("discord", {
    failureRedirect: "/ohnoey",
    successRedirect: "/"
}));

app.get("/auth/check", (req, res) => {
    if (req.isAuthenticated()) {
        res.json({ authenticated: true, username: req.user.username });
    } else {
        res.json({ authenticated: false });
    }
});

//await addDebugPosts()

app.get("/posts/fetch", async (req, res) => {
    res.json(await Mongobase.getAllPosts());
});

// Start server
app.listen(PORT, () => {
    console.log(`Server running on port ${PORT} in ${IS_DEV ? "development" : "production"} mode`);
});
