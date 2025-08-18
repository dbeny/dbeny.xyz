import mongoose from "mongoose";
import { User, Posts } from "./schemas.js";
import {sendEmail} from "../mail/mailer.js";

export default class Mongobase {
	static models = {
		User: null,
		Posts: null
	};

	static async connect() {
		const connectionString = process.env.MONGO_CONNECTION_STRING;
		const dbName = process.env.MONGO_DB_NAME;

		await mongoose.connect(connectionString, {
			dbName,
			useNewUrlParser: true,
			useUnifiedTopology: true
		});

		this.models.User = User;
		this.models.Posts = Posts;
	}

	//posts
	static async addPost({ content_before, content_after, image, publisher_id }) {
		const post = new this.models.Posts({
			content_before,
			content_after,
			image,
			publisher_id
		});
		const savedPost = await post.save();

		const publisher = await this.models.User.findById(publisher_id);
		const publisherName = publisher ? publisher.username : "Unknown";

		const admins = await this.models.User.find({});
		const adminEmails = admins.map(a => a.email);

		await sendEmail(
			adminEmails,
			"New Post Added",
			`<p>User <strong>${publisherName}</strong> added a new post.</p>
			<p>Content Before: ${content_before.text}</p>
			<p>Content After: ${content_after?.text || "N/A"}</p>
			${image ? `<p>Image: <img src="${image}" alt="Post image" style="max-width:200px"/></p>` : ""}`
		);

		return savedPost;
	}

	static async deletePost(postId) {
		const post = await this.models.Posts.findById(postId);
		if (!post) return null;

		const publisher = await this.models.User.findById(post.publisher_id);
		const publisherName = publisher ? publisher.username : "Unknown";

		await this.models.Posts.findByIdAndDelete(postId);

		const admins = await this.models.User.find({});
		const adminEmails = admins.map(a => a.email);

		await sendEmail(
			adminEmails,
			"Post Deleted",
			`<p>User <strong>${publisherName}</strong> deleted a post.</p>
			<p>Content Before: ${post.content_before.text}</p>
			<p>Content After: ${post.content_after?.text || "N/A"}</p>
			${post.image ? `<p>Image: <img src="${post.image}" alt="Post image" style="max-width:200px"/></p>` : ""}`
		);

		return post;
	}

	static async addPosts(postsArray, publisher_id) {
		const posts = postsArray.map(p => ({
			content_before: p.content_before,
			content_after: p.content_after,
			image: p.image || null,
			publisher_id
		}));

		const publisher = await this.models.User.findById(publisher_id);
		const publisherName = publisher ? publisher.username : "Unknown";

		const admins = await this.models.User.find({});
		const adminEmails = admins.map(a => a.email);

		await sendEmail(
			adminEmails,
			`Already existing posts (${postsArray.length}) have been added`,
			`<p>User <strong>${publisherName}</strong> added ${postsArray.length} posts.</p>
			<div>${posts.map(post => {
				return `<div>${JSON.stringify(post)}</div>`
			})}</div>`
		);
		return await this.models.Posts.insertMany(posts);
	}

	static async editPost(postId, updates) {
		return await this.models.Posts.findByIdAndUpdate(
			postId,
			{ $set: updates },
			{ new: true }
		);
	}

	static async getAllPosts() {
		return await this.models.Posts.find({});
	}

	//users
	static async addUser({ username, discordId, email }) {
		const user = new this.models.User({ username, discordId, email });
		return await user.save();
	}

	static async deleteUser(userId) {
		return await this.models.User.findByIdAndDelete(userId);
	}

	static async findUser({ _id, discordId, email }) {
		const query = {};
		if (_id) query._id = _id;
		if (discordId) query.discordId = discordId;
		if (email) query.email = email;

		return await this.models.User.findOne(query);
	}
}
