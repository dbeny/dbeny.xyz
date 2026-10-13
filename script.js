function updateNum(num) {
	return String(num < 10 ? "0" + num : num);
}

function findNextSymmetricTimestamp() {
	const now = new Date();

	for (
		let year = now.getFullYear();
		year <= now.getFullYear() + 100;
		year++
	) {
		for (let month = 1; month <= 12; month++) {
			const maxDay = new Date(year, month, 0).getDate();

			// Try each valid symmetric value for day/hour/minute/second
			for (let value = 0; value <= 23; value++) {
				if (value === 0 || value > maxDay || value > 12) continue; // value must be a valid month and day

				const candidate = new Date(
					year,
					value - 1,
					value,
					value,
					value,
					value
				);
				if (candidate > now) {
					const options = { month: "short" };
					const monthName = candidate.toLocaleString(
						"en-US",
						options
					);
					const day = String(candidate.getDate()).padStart(2, "0");
					const hh = String(candidate.getHours()).padStart(2, "0");
					const mm = String(candidate.getMinutes()).padStart(2, "0");
					const ss = String(candidate.getSeconds()).padStart(2, "0");

					return `${monthName} ${day}, ${year} ${hh}:${mm}:${ss}`;
				}
			}
		}
	}
	return null;
}

function getTimeUntilLongTime(currentDate, targetDate) {
	let dateObj = new Date(targetDate);
	let remainingTime = dateObj.getTime() - currentDate.getTime();

	const days = Math.floor(remainingTime / (1000 * 60 * 60 * 24));
	const hours = Math.floor(
		(remainingTime % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60)
	);
	const minutes = Math.floor(
		(remainingTime % (1000 * 60 * 60)) / (1000 * 60)
	);
	const seconds = Math.floor((remainingTime % (1000 * 60)) / 1000);

	console.log(
		`RETURNED:${JSON.stringify([
			updateNum(days),
			updateNum(hours),
			updateNum(minutes),
			updateNum(seconds),
		])}`
	);
	return [
		updateNum(days),
		updateNum(hours),
		updateNum(minutes),
		updateNum(seconds),
	];
}

function getTimeUntilWords(currentDate, targetDate) {
	let target = new Date(targetDate);
	let diff = currentDate.getTime() - target.getTime();

	let dYears = Math.floor(diff / (1000 * 60 * 60 * 24 * 365));
	let dDays = Math.floor(diff / (1000 * 60 * 60 * 24));
	return `${dYears > 0 ? dYears + " éve és " : ""}${
		dDays - dYears * 365
	} napja`;
}

function getRemainingTime() {
	//realtime to new year
	const nextYear = new Date().getFullYear() + 1;
	let currentTime = new Date();

	let dhms = getTimeUntilLongTime(currentTime, `Jan 1, ${nextYear} 00:00:00`);
	let list = ["d", "h", "m", "s"];
	for (let i = 0; i < 4; i++) {
		setInnerTextForId(list[i], dhms[i]);
	}

	let dhmsv = getTimeUntilLongTime(currentTime, `Apr 12, 2030 12:00:00`);
	for (let i = 0; i < 4; i++) {
		setInnerTextForId(`${list[i]}${list[i]}`, dhmsv[i]);
	}

	setInnerTextForId(
		"created-at",
		getTimeUntilWords(currentTime, "Dec 15, 2023 09:29:00")
	);
	setInnerTextForId(
		"edited-at",
		getTimeUntilWords(currentTime, "Aug 12, 2026 23:40:00")
	);

	let symmetric = findNextSymmetricTimestamp();
	let dhms2 = getTimeUntilLongTime(currentTime, symmetric);
	for (let i = 0; i < 4; i++) {
		setInnerTextForId(`${list[i]}${list[i]}${list[i]}`, dhms2[i]);
	}
	setInnerTextForId("symmetric", `(${symmetric})`);

	setInnerTextForId(
		"mestermc",
		getTimeUntilWords(currentTime, "Oct 16, 2014, 17:39:46")
	);
	setInnerTextForId(
		"unix",
		getTimeUntilWords(currentTime, "Jan 1, 1970 00:00:00")
	);
	setInnerTextForId(
		"metallica",
		getTimeUntilWords(currentTime, "Oct 28, 1981 12:00:00")
	);
	setInnerTextForId(
		"kardos",
		getTimeUntilWords(currentTime, "Mar 20, 2007 12:00:00")
	);
}

function setInnerTextForId(id, text) {
	document.getElementById(id).innerText = text;
}

function initialize() {
	setInterval(() => {
		const remainingTimeMs = getRemainingTime();
		if (remainingTimeMs == 0) {
			console.log("jovan amugy is a fidesz nyer, koltozok csa");
			clearInterval();
		}
	}, 1000);
}

const emotes = {
	catWow: "./catWow.webp",
	ANGERY: "./ANGERY.webp",
	HOMÁR: "./REDLOBSTER.webp",
	BandiOfUndying: "./BandiOfUndying.webp",
};

const emoteNames = Object.keys(emotes).map((name) =>
	name.replace(/[-/\\^$*+?.()|[\]{}]/g, "\\$&")
);
const emoteRegex = new RegExp(`:(${emoteNames.join("|")}):`, "g");

function replaceEmotesInTextNode(textNode) {
	const text = textNode.nodeValue;
	let match;
	let lastIndex = 0;
	const fragment = document.createDocumentFragment();

	emoteRegex.lastIndex = 0;
	while ((match = emoteRegex.exec(text)) !== null) {
		const [fullMatch, name] = match;
		const idx = match.index;

		if (idx > lastIndex) {
			fragment.appendChild(
				document.createTextNode(text.slice(lastIndex, idx))
			);
		}

		const img = document.createElement("img");
		img.src = emotes[name];
		img.alt = fullMatch;
		img.className = "emote";
		fragment.appendChild(img);

		lastIndex = idx + fullMatch.length;
	}

	if (lastIndex < text.length) {
		fragment.appendChild(document.createTextNode(text.slice(lastIndex)));
	}

	if (fragment.childNodes.length) {
		textNode.parentNode.replaceChild(fragment, textNode);
	}
}

function walkAndReplace(root) {
	const walker = document.createTreeWalker(root, NodeFilter.SHOW_TEXT, {
		acceptNode(node) {
			if (!node.nodeValue.trim()) return NodeFilter.FILTER_REJECT;
			const parentTag = node.parentNode && node.parentNode.nodeName;
			if (parentTag === "SCRIPT" || parentTag === "STYLE")
				return NodeFilter.FILTER_REJECT;
			return NodeFilter.FILTER_ACCEPT;
		},
	});

	const toProcess = [];
	let node;
	while ((node = walker.nextNode())) {
		if (emoteRegex.test(node.nodeValue)) {
			toProcess.push(node);
		}
	}
	toProcess.forEach(replaceEmotesInTextNode);
}

async function getAllGifUrls(dir = "media") {
    try {
        const resp = await fetch(`/${dir}/files.json`);
        const filenames = await resp.json();
    
        return filenames.map(filename => {
            return `${window.location.origin}/${dir}/${filename}`;
        });
    } catch (ew) {
        console.error(`Couldn't read directory ${dir}.`);
        return [];
    }
}

async function renderGifPopupAndGifs() {
	const gifArray = await getAllGifUrls();

	const createElement = (tag, options = {}) => {
		const el = document.createElement(tag);

		if (options.className) el.className = options.className;
		if (options.content) el.innerText = options.content;
		if (options.src) el.src = options.src;
		if (options.width) el.width = options.width;

		return el;
	}

	const backdrop = createElement("div", { className: "backdrop"});
	const container = createElement("div", { className: "popup" });
	const innerContainer = createElement("div", { className: "inner-popup" });
	const headerContainer = createElement("div", { className: "header-container" });
	const gifContainer = createElement("div", { className: "gif-container" });
	const buttonRow = createElement("div", { className: "button-row" });
	const copyDisclaimer = createElement("span", { className: "copy-disclaimer", content: "Ha rányomsz a gifre, vágólapra másolja a linkjét." });

	const headerTitle = createElement("h1", { className: "header-title", content: "Gif-tárház" });

	gifArray.forEach(url => {
		const img = createElement("img", { src: url, width: "400" });
		gifContainer.append(img);

		img.addEventListener("click", () => {
            navigator.clipboard.writeText(url);
			imageCopiedToast("Ellvitted a gifemet a vágólapra :ANGERY:");
        });
	});

	const closeBtn = createElement("btn", { className: "close-popup", content: "Végezetül"});
	buttonRow.append(closeBtn, copyDisclaimer);
	
	headerContainer.append(headerTitle);
	innerContainer.append(headerContainer, gifContainer, buttonRow);
	container.append(innerContainer);	
	backdrop.append(container);

	document.body.prepend(backdrop);

	closeBtn.addEventListener("click", () => {
		if (backdrop) backdrop.remove();
	});

	backdrop.addEventListener("click", (e) => {
        if (e.target === backdrop) backdrop.remove();
    });
}

const imageCopiedToast = (text) => {
    let toast = document.getElementById('toast');
    if (!toast) {
        toast = document.createElement('div');
        toast.id = 'toast';
        toast.className = 'toast';
        document.body.append(toast);
    }
    toast.innerText = text;
	walkAndReplace(toast);
    toast.style.display = 'block';

    setTimeout(() => { 
        toast.remove();
    }, 2000);
};

addEventListener("DOMContentLoaded", async (event) => {
	initialize();
	const items = document.querySelectorAll("li");

	const observer = new IntersectionObserver(
		(entries) => {
			entries.forEach((entry) => {
				if (entry.isIntersecting) {
					entry.target.classList.add("visible");
					observer.unobserve(entry.target);
				}
			});
		},
		{
			threshold: 0.1,
		}
	);

	items.forEach((li) => {
		observer.observe(li);
	});

	walkAndReplace(document.body);

	const mo = new MutationObserver((mutations) => {
		for (const m of mutations) {
			m.addedNodes.forEach((n) => {
				if (n.nodeType === Node.ELEMENT_NODE) {
					walkAndReplace(n);
				}
			});
		}
	});
	mo.observe(document.body, { childList: true, subtree: true });

	const gifButton = document.querySelector(".gif-button");

	gifButton.addEventListener("click", async () => {
		await renderGifPopupAndGifs();
	});
});
