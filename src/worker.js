var url = require("url");

const html = `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8" />
<title>Upload test</title>
</head>
<body>
<h2>Upload test</h2>
<form id="upload_form" enctype="multipart/form-data" method="post">
<input type="file" name="file1" id="file1" onchange="uploadFile()" /><br/>
<progress id="progressBar" value="0" max="100" style="width: 300px"></progress>
<h3 id="status"></h3>
<p id="loaded_n_total"></p>
</form>
<script src="/script.js"></script>
</body>
</html>
`;

const script = `function _(el) {
  return document.getElementById(el);
}

function uploadFile() {
  var file = _("file1").files[0];
  var formdata = new FormData();
  formdata.append("file1", file);
  var ajax = new XMLHttpRequest();
  ajax.upload.addEventListener("progress", progressHandler, false);
  ajax.addEventListener("load", completeHandler, false);
  ajax.addEventListener("error", errorHandler, false);
  ajax.addEventListener("abort", abortHandler, false);
  ajax.open("POST", "/");
  ajax.send(formdata);
}

function progressHandler(event) {
  _("loaded_n_total").innerHTML = "Uploaded " + event.loaded + " bytes of " + event.total;
  var percent = (event.loaded / event.total) * 100;
  _("progressBar").value = Math.round(percent);
  _("status").innerHTML = Math.round(percent) + "% uploaded... please wait";
}

function completeHandler(event) {
  _("status").innerHTML = event.target.responseText;
  _("progressBar").value = 0; //wil clear progress bar after successful upload
}

function errorHandler(event) {
  _("status").innerHTML = "Upload Failed";
}

function abortHandler(event) {
  _("status").innerHTML = "Upload Aborted";
}`

export default {
	async fetch(request, env, ctx) {
		return handleRequest(request)
	},
};

async function handleRequest(request) {
	var path = url.parse(request.url).pathname
	if (request.method === 'GET') {
		if (path === '/') {
			return new Response(html, {
				headers: {
					"content-type": "text/html;charset=UTF-8",
				},
			});
		} else if (path === '/script.js') {
			return new Response(script, {
				headers: {
					"content-type": "application/javascript;charset=UTF-8"
				},
			});
		} else {
			return new Response('Not found', {
				status: 404,
				statusText: 'Not found',
			});
		}
	} else if (request.method === 'POST') {
		const formData = await request.formData();
		console.log(formData)
		const file = formData.get('file');
		const hash = await sha1(file);

		return new Response(JSON.stringify({
			name: file.name,
			type: file.type,
			size: file.size,
			hash,
		}));
	} else {
		return new Response('Method not allowed', {
			status: 405,
			statusText: 'Method not allowed',
		});
	}
}

async function sha1(file) {
	const fileData = await file.arrayBuffer();
	const digest = await crypto.subtle.digest('SHA-1', fileData);
	const array = Array.from(new Uint8Array(digest));
	const sha1 = array.map(b => b.toString(16).padStart(2, '0')).join('')
	return sha1;
}
