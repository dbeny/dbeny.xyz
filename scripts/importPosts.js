import fs from "fs";
import * as cheerio from "cheerio";
import Mongobase from "./db/mongo.js";

// Load HTML file
const html = fs.readFileSync("./old/posts.html", "utf-8");
const $ = cheerio.load(html); // global $ for the whole document

function parsePost(liElement) {
    const $li = cheerio.load(liElement, { xmlMode: true })('li');

    // Skip <li new>
    if ($li.attr('new') !== undefined) return null;

    let content_before = { text: '', is_reply: false, emote: '' };
    let content_after = { text: '', is_reply: false, emote: '' };
    let image = null;

    let beforeImage = true;

    $li.contents().each((i, el) => {
        if (el.type === 'tag' && el.tagName === 'img') {
            image = $li(el).attr('src') || null;
            beforeImage = false;
        } else if (el.type === 'text') {
            const textContent = el.data.trim();
            if (textContent) {
                if (beforeImage) content_before.text += (content_before.text ? '\n' : '') + textContent;
                else content_after.text += (content_after.text ? '\n' : '') + textContent;
            }
        } else if (el.type === 'tag' && el.tagName === 'span' && $li(el).hasClass('reply')) {
            // Example: detect a reply by class="reply"
            const textContent = $li(el).text().trim();
            if (beforeImage) {
                content_before.text += (content_before.text ? '\n' : '') + textContent;
                content_before.is_reply = true;
            } else {
                content_after.text += (content_after.text ? '\n' : '') + textContent;
                content_after.is_reply = true;
            }
        }
    });

    if (!image) content_after = null;

    return { content_before, content_after, image };
}

// Build posts array
const postsArray = [];
$('li').each((i, el) => {
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

// If you want to run directly from node:
if (process.argv[1].endsWith("importPosts.js")) {
    addDebugPosts();
}