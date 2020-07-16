
//let canvas,ctx,canvasRect,imRect,img,mouseIsDown,zoomInBut,zoomOutBut,showingBox,toggleBoxBut,nowInterpolating, drawContainingRect,detailncluded;
//let cRect; // the rectangle currently zoomed and panned to.
let dRect; // the rectangle of the detail
let contRect; // the smallest rect containing dRect with the same aspect ratio as the whole image. Used for zooming to the detail by interpolation
//let downX,downY; // the coordinates of the last mousedown

detailIncluded = 1;
showingBox = 1;

const drawRect = function(rect,color) {
	let {x,y,w,h} = rect;
	ctx.lineWidth =2;
	//ctx.strokeStyle = 'rgb(200,0,0)';
	ctx.strokeStyle = color;
	ctx.strokeRect(x,y,w,h);
}

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
	

const toggleBox = function () {
	showingBox = !showingBox;
	drawFrame();
	let msg = showingBox?'Hide Detail Box':'Show Detail Box';
	toggleBoxBut.innerHTML = msg;
}

		