import mongoose from "mongoose";

const { ObjectId } = mongoose.Schema.Types;

//users
const userSchema = new mongoose.Schema({
    username: {
        type: String, required: true
    },
    discordId: {
        type: String, required: true
    },
    email: {
        type: String, required: false, match: /.+\@.+\..+/
    }
});

//posts
const postSchema = new mongoose.Schema({
    content_before: {
        text: { type: String, required: false },
        is_reply: { type: Boolean, required: false },
        emote: { type: String, required: false }
    },
    content_after: {
        text: { type: String, required: false },
        is_reply: { type: Boolean, required: false },
        emote: { type: String, required: false }
    },
    image: {
        type: String, required: false
    },
    publisher_id: {
        type: ObjectId, required: true
    }
});

//messages
const msgSchema = new mongoose.Schema({
    content: { type: String, required: true },
    date: { type: Date, required: true },
    sender_id: { type: ObjectId, required: true }
});

//export
export const User = mongoose.model(
    process.env.MONGO_COLLECTION_USERS || "users",
    userSchema
);

export const Posts = mongoose.model(
    process.env.MONGO_COLLECTION_POSTS || "posts",
    postSchema
);

export const Messages = mongoose.model(
    process.env.MONGO_COLLECTION_MESSAGES || "messages",
    msgSchema
);