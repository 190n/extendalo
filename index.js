const cheerio = require('cheerio');
const fs = require('fs');
const path = require('path');

if (typeof fetch == 'undefined') {
	console.error('run with --experimental-fetch');
	process.exit(1);
}

const webhookURL = `https://discord.com/api/webhooks/${process.env.WEBHOOK_ID}/${process.env.WEBHOOK_TOKEN}`,
	watchURL = process.env.WATCH_URL,
	persistDir = process.env.PERSIST_DIR ?? '.',
	persistFile = path.join(persistDir, 'last-content.txt');

let lastContent = fs.existsSync(persistFile) ? fs.readFileSync(persistFile) : '';
async function update() {
	const html = await (await fetch(watchURL)).text(),
		$ = cheerio.load(html);

	const lines = $('a[href=pa8.pdf]').parent().text().split('\n'),
		pa7Index = lines.findIndex(l => l.includes('pa8')),
		endIndex = lines.length,
		relevantLines = lines.slice(pa7Index, endIndex).filter(l => !l.match(/^\s*$/)),
		final = relevantLines.map(l => l.replaceAll(/^\s+|\s+$/g, '')).join('\n');

	if (final != lastContent) {
		console.log('change detected');
		const message = `<@&912976235632676875>
a change was detected <:monke:912986988020383774>
before:
\`\`\`
${lastContent == '' ? ' ' : lastContent}
\`\`\`
after:
\`\`\`
${final}
\`\`\`
from <${watchURL}>
*ping 190n if i goofed*
`;

		lastContent = final;
		fs.writeFileSync(persistFile, final);
		await fetch(webhookURL, {
			method: 'POST',
			headers: {
				'Content-Type': 'application/json',
			},
			body: JSON.stringify({
				content: message,
			}),
		});
	} else {
		console.log('no change');
	}

	setTimeout(update, 60000);
}

update();
