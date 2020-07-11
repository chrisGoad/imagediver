/* 
curl localhost:8080
*/
const http = require('http');
const fs = require('fs');
let port = 8082;
//const Buffer = require('Buffer');
//const mtypes = {html:'text/html',js:'text/javascript',
const mtypes = {html:'text/html',js:'application/javascript',json:'application/json',
                  css:'text/css',svg:'image/svg+xml',ico:'image/x-icon',jpg:'image/jpeg'};
const requestListener = function (req, res) {
	let iurl = req.url;
	let url = new URL('http://localhost:8080'+iurl);
	let method = req.method;
	//let url = req.url;
	let ipath = url.pathname;//.substring(1);
	let dot = ipath.lastIndexOf('.');
	//let ln = ipath.length;
	let ext = ipath.substring(dot+1);
	//let path = 'www/test2.html';
	//let path = 'www'+ipath;
	let path = ipath.substring(1);
	let ctype = mtypes[ext];
  console.log('path = ',path,' method=',method,' ctype = ',ctype);
	let data;
  if (method === 'POST') {
    //let data = '';
		ctype = 'image/jpg';
		let chunks = [];
    //let data = Buffer.alloc(0);
    //req.on('data', chunk => {
    //    data += chunk.toString(); // convert Buffer to string
    //});
		let dln = 0;
		req.on('data', chunk => {
			  dln += chunk.length;
			  console.log('got ',chunk.length,' bytes');
				chunks.push(chunk);
       // Buffer.concat([data,chunk]); // convert Buffer to string
    });
    req.on('end', () => {
        console.log('data length = ', dln);
				let  rs = Buffer.concat(chunks,dln);
        res.end('ok');
				let spath = ipath.substring(1);
				console.log('writing ',dln,' bytes to ',spath);
				fs.writeFileSync(spath,rs);

    });

		return;
	}



	let body,missing;
	//if (ctype && fs.existsSynch(path)) {
	if (fs.existsSync(path)) {
   // body	= fs.readFileSync(path).toString();
    body	= fs.readFileSync(path);
	} else {
		console.log('missing');
		missing = 1;
		body = '';
		ctype = 'text/plain';
	}
  //let ln = Buffer.byteLength(body);
  let ln = body.length;
	console.log('length',ln);
	//let body = ext;
		
	res.writeHead(missing?404:200, {
    'Content-Length': ln,
   // 'Content-Length': Buffer.byteLength(body),
	//'Content-Type': 'text/html'});
	//'Content-Type': 'text/plain'});
	'Content-Type': ctype+'; charset=utf-8'});
	//res.write(page);
  res.end(body);
	return;
	res.writeHead(missing?404:200, {
    'Content-Length': Buffer.byteLength(body),
   // 'Content-Length': Buffer.byteLength(body),
	'Content-Type': 'text/html'});
	//res.write(page);
  res.end(body);
}

const server = http.createServer(requestListener);
server.listen(port);