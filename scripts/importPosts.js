import fs from "fs";
import * as cheerio from "cheerio";
import Mongobase from "./db/mongo.js";

const html = fs.readFileSync("./old/posts.html", "utf-8"); // load your HTML file
const $ = cheerio.load(html); // now $ is defined for the whole document

function parsePost(liElement) {
    const $li = cheerio.load(liElement); // for the individual <li>
    
    let content_before = { text: '', is_reply: false, emote: '' };
    let content_after = { text: '', is_reply: false, emote: '' };
    let image = null;
    
    const children = $li.root().children();
    
    let beforeImage = true;
    
    children.each((i, el) => {
        if ($li(el).attr('new') !== undefined) return null;
        
        if (el.tagName === 'img') {
            image = $li(el).attr('src'); // use $li here
            beforeImage = false;
        } else {
            const textContent = $li(el).text().trim();
            if (textContent) {
                if (beforeImage) content_before.text += (content_before.text ? '\n' : '') + textContent;
                else content_after.text += (content_after.text ? '\n' : '') + textContent;
            }
        }
    });

    // If no image exists, everything goes into content_before
    if (!image) content_after = null;

    return { content_before, content_after, image };
}

// Example usage
const postsArray = [];
$('li').each((i, el) => {
    postsArray.push(parsePost($.html(el))); // now $ is defined
});

// Replace with your publisher_id
const publisher_id = "68a2e26fdf173b9e150429cb";

export async function addDebugPosts() {
    await Mongobase.addPosts(postsArray, publisher_id);
    console.log("POSTS IMPORTED SUCCESSFULLY");
}
