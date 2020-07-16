
let canvas,ctx,canvasRect,imRect,img,mouseIsDown,zoomInBut,zoomOutBut,showingBox,toggleBoxBut,nowInterpolating, drawContainingRect,detailIncluded,month,image,imageIn,data;
let cRect; // the rectangle currently zoomed and panned to.
//let dRect; // the rectangle of the detail
//let contRect; // the smallest rect containing dRect with the same aspect ratio as the whole image. Used for zooming to the detail by interpolation
let downX,downY; // the coordinates of the last mousedown


  
//   from http://paulgueller.com/2011/04/26/parse-the-querystring-with-jquery/
const parseQueryString = function() {
  let nvpair = {};
  let qs = window.location.search.replace('?','');
	
	
  let pairs = qs.split('&');
  pairs.forEach(function(v) {
    let pair = v.split('=');
    if (pair.length>1) {
      nvpair[pair[0]] = pair[1];
    }
  });
  return nvpair;
}

const httpGet = function (url,cb) { // there is a fancier version in core/install.js
/* from youmightnotneedjquery.com */
 // let performGet = function (url) {
    let request = new XMLHttpRequest();
    request.open('GET',url,true);// meaning async
    request.onload = function() {
      if (cb) {
        if (request.status >= 200 && request.status < 400) {
        // Success!
          cb(undefined,request.responseText);
        } else {
          cb('http GET error for url='+url);
        }
        // We reached our target server, but it returned an error
      }
    }  
    request.onerror = function() {
        cb('http GET error for url='+url);
    };
    request.send();
  }
 // vars.mapUrl(iurl,performGet)
//}

const draw = function (includeDetail) {
	debugger;
	let title;
	detailIncluded = includeDetail;
	let qs = parseQueryString();
	month = qs.month;
	image = qs.image;
	let mnim = `${month}/${image}`;
	imageIn = `${mnim}.jpg`;
	let datzUrl = `${mnim}_data.json`;
  const finishUp = function () {
		canvas = document.getElementById('zoomCanvas');
		ctx = canvas.getContext('2d');
		let winWd = window.innerWidth;
		let winHt = window.innerHeight;
		let wf = 0.9;
		canvas.width = winWd * wf;
		canvas.height = winHt * wf - 30;
		img = new Image();
		zoomInBut = document.getElementById('zoomInButton');
		zoomOutBut = document.getElementById('zoomOutButton');
		toggleBoxBut = document.getElementById('toggleBoxButton');
		titleDiv = document.getElementById('titleDiv');
		if (titleDiv) {
			titleDiv.innerHTML = title;
		}
		//showingBox =1;
		addListeners();
		img.src = imageIn;
	};
	httpGet(`${mnim}.json`,function (err,json) {
		debugger;
		let jsonob = JSON.parse(json);
		title = jsonob.title;
		if (detailIncluded) {
			httpGet(`${mnim}_data.json`,function (err,djson) {
				debugger;
				data= JSON.parse(djson);
				showingBox = 1;
			  finishUp();
			});
		} else {
			finishUp();
		}
	});
	
}
/*
const drawRect = function(rect,color) {
	let {x,y,w,h} = rect;
	ctx.lineWidth =2;
	//ctx.strokeStyle = 'rgb(200,0,0)';
	ctx.strokeStyle = color;
	ctx.strokeRect(x,y,w,h);
}
*/
	
const fitRect= 	function(inRect,rect) {
	let {w,h} = rect;
	let {w:iw,h:ih} = inRect;	
	let ar = w/h;
	let iar = iw/ih;
	let oh,ow,r;
	if (iar > ar) { // scale by width
		r = w/iw;
		ow = w;
		oh = r * ih;
		x = 0;
		y = 0.5* (h - oh);;
		return {kind:'hfit',ratio:r,rect:{x:x,y:y,w:ow,h:oh}};
	} else { //scale by height
		r = h/ih;
		oh = h;
		ow = r * iw;
		x = 0.5*(w - ow);
		y = 0;
		return {kind:'vfit',ratio:r,rect:{x:x,y:y,w:ow,h:oh}};
	}
}
/*
const containingRect = function(rect,aspectRatio) { // the smallest rectanble containing rect with the given aspect ratio
	let {x,y,w,h} = rect;
	let cx = x + 0.5*w;
	let cy = y + 0.5*h;
	let ar = w/h;
	let nw,nh;
	if (ar > aspectRatio) { // need to increase height
	  nw = w;
    nh = w/aspectRatio;
	} else { // need to increaase width
		nw  = h*aspectRatio;
		nh = h;
	}
	let nx = cx - 0.5*nw;
	let ny = cy - 0.5*nh;
	return {x:nx,y:ny,w:nw,h:nh};
}
		
	*/
  
	

const cRectToRectInIm = function () {
	let {x,y,w,h} = cRect;
	let {x:ix,y:iy,w:iw,h:ih} = imRect;
	let {w:cw,h:ch} = canvasRect;
	let r = iw/cw;
	let rsx = r*x;
	let rsy = r*y;
	let rsw = r*w;
	let rsh = r*h;
	return {x:rsx,y:rsy,w:rsw,h:rsh};
}	

const cZoom = function () {
	let cnw = canvasRect.w;
	let cw = cRect.w;
	return cnw/cw;
}

const adjustForZoomPan = function (rect) {
	let {x,y,w,h} = rect;
	let {x:cx,y:cy,w:cw,h:ch} = cRect;
	let zoom = cZoom();
	let nw = w*zoom;
	let nh = h*zoom;
	let rx = x - cx;
	let ry = y - cy;
	let nx = rx*zoom;
	let ny = ry*zoom;
	return {x:nx,y:ny,w:nw,h:nh};
}
	
	
const drawFrame = function () {
	ctx.clearRect(0,0,canvasRect.w,canvasRect.h);
	let rectInImage = cRectToRectInIm();
	ctx.drawImage(img,rectInImage.x,rectInImage.y,rectInImage.w,rectInImage.h,0,0,canvasRect.w,canvasRect.h);
	if (showingBox) {
		let adRect = adjustForZoomPan(dRect);
		if (showingBox) drawRect(adRect,'rgb(200,0,0)');
	}
}


const zoom = function (factor) {
	let {x,y,w,h} = cRect;
	let {w:cw,h:ch} = canvasRect;
	let cx = x + 0.5*w;
	let cy = y + 0.5*h;
	let nw = w / factor;
	let nh = h / factor;
	let mxx = cw-nw;
	let mxy = ch-nh;
	let nx = cx - 0.5*nw;
	nx = Math.min(mxx,Math.max(nx,0));
	let ny = cy - 0.5*nh;		
	ny = Math.min(mxy,Math.max(ny,0));
	cRect.x = nx;
	cRect.y = ny;
	cRect.w = nw;
	cRect.h = nh;
}

let zf = 1.05;

const zoomIn = function () {
	zoom(zf);
	drawFrame();
}

const zoomOut = function () {
	let zm = cZoom();
	if (zm <= 1) {
		return 'done';
	}
	let nz = Math.max(zm/ zf,1);
	zoom(nz/zm);
	drawFrame();
}

let zoomInterval = 50;
let nowZooming = 0;
let zoomDirection = 'in';
const startZooming = function () {
	const inner = function () {
		if (!nowZooming) {
			return;
		}
		if (zoomDirection === 'in') {
			zoomIn();
		} else {
			let zo = zoomOut();
			if (zo === 'done') {
				return;
			}
		}
		setTimeout(inner,zoomInterval);
	}
	inner();
}
	
/*
const interpolate = function (v1,v2,f) {
	return v1 + (v2-v1)*f;
}
let intTo = 1.0;
const scaleBy = function (rect,f) {
	let {x,y,w,h} = rect;
	let cx = x + 0.5*w;
	let cy = y + 0.5*h;
	let nw = w*f;
	let nh = h*f;
	let nx = cx-0.5*nw;
	let ny = cy-0.5*nh;
	return {x:nx,y:ny,w:nw,h:nh};
}
const interpolateRects = function (rect1,rect2,f) {
	let {x:x1,y:y1,w:w1,h:h1} = rect1;
	let {x:x2,y:y2,w:w2,h:h2} = rect2;
	let nx = interpolate(x1,x2,f);
	let ny= interpolate(y1,y2,f);
	let nw= interpolate(w1,w2,f);
	let nh= interpolate(h1,h2,f);
	return {x:nx,y:ny,w:nw,h:nh};
}

const interpolateInNSteps = function (rect1, rect2, n,interval) {
	if (nowInterpolating) {
		return;
	}
	nowInterpolating = 1;
	const inner = function (i) {
		debugger;
		let iRect;
		if (i === n) {
			iRect = scaleBy(rect2,1.05);
		} else {
			let f = i/n;
			iRect = interpolateRects(rect1,rect2,f);
			if (iRect === 'done') {
				return 'done';
			}
		}
		cRect = iRect;
		drawFrame();
		if (i === n) {
			nowInterpolating = 0;
			return 'done';
		}
		setTimeout(() => inner(i+1),interval);
	}
	inner(0);
}

const zoomToDetail = function () {
	interpolateInNSteps(canvasRect,contRect,30,30);
}
	*/
const viewAll = function () {
	Object.assign(cRect,canvasRect);
	drawFrame();
}
/*
const toggleBox = function () {
	showingBox = !showingBox;
	drawFrame();
	let msg = showingBox?'Hide Detail Box':'Show Detail Box';
	toggleBoxBut.innerHTML = msg;
}
*/
const addListeners = function () {
	canvas.addEventListener('mousedown', e => {
		mouseIsDown = 1;
		let x = e.offsetX;
		let y = e.offsetY;
		downX = x;
		downY = y;
		downRect = {x:cRect.x,y:cRect.y,w:cRect.w,h:cRect.h};
	});
	canvas.addEventListener('mouseup', e => {
		mouseIsDown = 0;
	});
	canvas.addEventListener('mouseout', e => {
		mouseIsDown = 0;
	});
	canvas.addEventListener('mousemove', e => { // panning
		if (!mouseIsDown) {
			return;
		}
		let xx = e.offsetX;
		let yy = e.offsetY;
		let dx = downX - xx;
		let dy = downY - yy;
		let {x,y,w,h} = downRect;
		let {w:cw,h:ch} = canvasRect;
		let mxx = cw-w;
		let mxy = ch-h;
		let zoom = cZoom();
		let nx  = x + dx/zoom;
		nx = Math.min(mxx,Math.max(nx,0));
		cRect.x = nx;
		let ny  = y + dy/zoom;
		ny = Math.min(mxy,Math.max(ny,0));
		cRect.y = ny;	
		drawFrame();

	});
	zoomInBut.addEventListener('mousedown',() => {
		zoomDirection = 'in';
		nowZooming = 1;
		startZooming();
	});
	zoomInBut.addEventListener('mouseup',() => {nowZooming = 0;});
	zoomInBut.addEventListener('mouseout',() => {nowZooming = 0;});
	zoomOutBut.addEventListener('mousedown',() => {
		zoomDirection = 'out';
		nowZooming = 1;
		startZooming();
	});
	zoomOutBut.addEventListener('mouseup',() => {nowZooming = 0;});
	zoomOutBut.addEventListener('mouseout',() => {nowZooming = 0;});

	img.addEventListener('load', function () {
		debugger;
		let nw = img.naturalWidth;
		let nh = img.naturalHeight;
		canvasRect = {x:0,y:0,w:canvas.width,h:canvas.height};
		imRect = {w:nw,h:nh};
		fit = fitRect(imRect,canvasRect);
		let frect = fit.rect;
		canvas.width = frect.w;
		canvas.height = frect.h;
		cRect = {x:0,y:0,w:canvas.width,h:canvas.height};
		if (detailIncluded) {
			let ddRect = data.detail;
			let dcRect = data.canvas;
			let ratio = (canvas.width)/(dcRect.w);
			dRect = {x:ratio*ddRect.x,y:ratio*ddRect.y,w:ratio*ddRect.w,h:ratio*ddRect.h}
		}
		canvasRect = {x:0,y:0,w:canvas.width,h:canvas.height};
		drawFrame();
		if (detailIncluded) {
			let ar = (canvasRect.w)/(canvasRect.h);
			contRect = containingRect(dRect,ar);
			if (drawContainingRect) {
				drawRect(contRect,'blue');
			}
		}
	},false);
}
		