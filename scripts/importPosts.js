import fs from "fs";
import { load } from "cheerio"; // use load instead of * as cheerio
import Mongobase from "./db/mongo.js";

const html = fs.readFileSync("./old/posts.html", "utf-8");
const $ = load(html); // global $ for the whole document

function parsePost(liElement) {
    const $li = load(liElement)("li");

    // Skip <li new>
    if ($li.attr("new") !== undefined) return null;

    const liIsReply = $li.hasClass("reply"); // <--- whole post is a reply

    let content_before = { text: "", is_reply: false, emote: "" };
    let content_after = { text: "", is_reply: false, emote: "" };
    let image = null;

    let beforeImage = true;

    $li.contents().each((i, el) => {
        if (el.type === "tag" && el.tagName === "img") {
            image = load(el)("img").attr("src") || null;
            beforeImage = false;
        } 
        else if (el.type === "text") {
            const textContent = el.data.trim();
            if (textContent) {
                if (beforeImage) {
                    content_before.text += (content_before.text ? "\n" : "") + textContent;
                    if (liIsReply) content_before.is_reply = true;
                } else {
                    content_after.text += (content_after.text ? "\n" : "") + textContent;
                    if (liIsReply) content_after.is_reply = true;
                }
            }
        } 
        else if (el.type === "tag") {
            const $el = load(el).root();
            const textContent = $el.text().trim();
            if (textContent) {
                if (beforeImage) {
                    content_before.text += (content_before.text ? "\n" : "") + textContent;
                    if ($el.hasClass("reply") || liIsReply) content_before.is_reply = true;
                } else {
                    content_after.text += (content_after.text ? "\n" : "") + textContent;
                    if ($el.hasClass("reply") || liIsReply) content_after.is_reply = true;
                }
            }
        }
    });

    if (!image) content_after = null;

    return { content_before, content_after, image };
}

// Build posts array
const postsArray = [];
$("li").each((i, el) => {
    const post = parsePost($.html(el));
    if (post) postsArray.push(post);
});

// Replace with your actual publisher_id
const publisher_id = "68a2e26fdf173b9e150429cb";

export async function addDebugPosts() {
    try {
        await Mongobase.addPosts(postsArray, publisher_id);
        console.log("POSTS IMPORTED SUCCESSFULLY");
    } catch (err) {
        console.error("Error importing posts:", err);
    }
}

// Run directly
if (process.argv[1].endsWith("importPosts.js")) {
    addDebugPosts();
}
