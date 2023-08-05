export default {
	async fetch(request, env, ctx) {
		return handleRequest(request)
	},
};

async function handleRequest(request) {
	const formData = await request.formData();
	const file = formData.get('file');
	const hash = await sha1(file);

	return new Response(JSON.stringify({
		name: file.name,
		type: file.type,
		size: file.size,
		hash,
	}));
}

async function sha1(file) {
	const fileData = await file.arrayBuffer();
	const digest = await crypto.subtle.digest('SHA-1', fileData);
	const array = Array.from(new Uint8Array(digest));
	const sha1 = array.map(b => b.toString(16).padStart(2, '0')).join('')
	return sha1;
}
