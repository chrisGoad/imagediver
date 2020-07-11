
let canvas1,canvas2,ctx1,ctx2,canvasRect1,canvasRect2,imRect,fit,cRect,dragCorner,frect2,img,cImRect;
let imageIn = 'images/dogs.jpg';
let imageOut1 = 'images/dogs_1.jpg';
let imageOut2 = 'images/dogs_2.jpg';
const draw = function () {
//	debugger;
	canvas1 = document.getElementById('canvas1');
	ctx1 = canvas1.getContext('2d');
	canvas2 = document.getElementById('canvas2');
	ctx2 = canvas2.getContext('2d');
	img = new Image();
	//let img2 = canvas2;
	//ctx.fillStyle = 'rgb(200, 0, 0)';
  //ctx.fillRect(0, 0, 50, 50);
  //ctx.fillRect(0, 0, 50, 50);

const drawRect = function(rect) {
		let {x,y,w,h} = rect;
		ctx1.lineWidth =10;
		ctx1.strokeStyle = 'rgb(00,0,200)';
		ctx1.strokeRect(x,y,w,h);
	}
const fitRect= 	function(inRect,rect,margin) {
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

const oppositeCorner = function (c) {
	if (c==='ul') {
		return 'lr';
	}
	if (c==='ur') {
		return 'll';
	}
	if (c==='lr') {
		return 'ul';
	}
	if (c==='ll') {
		return 'ur';
	}
}
	
// nudge the given corner of cRect to p 
let cnt = 0;
const nudgeRect = function (which,p) {
	if (cnt++ > 1000000) {
		debugger;
	}
	let crns = corners(cRect);
	let op = oppositeCorner(which);
	let opc = crns[op];
  let w = Math.abs(opc.x - p.x);
  let h = Math.abs(opc.y - p.y);
	cRect.w = w;
	cRect.h = h;
	if (which === 'ul') {
		cRect.x = p.x;
		cRect.y = p.y;
		return;
	}
		if (which === 'ur') {
		cRect.y = p.y;
		return;
	}
	if (which === 'lr') {
		return;
	}
	if (which === 'll') {
		cRect.x = p.x;
		return;
	}
}
		
	
	
const corners = function (rect) {
		let {x,y,w,h} = rect;
		let ul = {x:x,y:y};
		let ur = {x:x+w,y:y};
		let lr = {x:x+w,y:y+h};
		let ll = {x:x,y:y+h};
		return {ul:ul,ur:ur,lr:lr,ll:ll};
	}
	
const distanceSquared = function (p,q) { // city street distance
	let {x:px,y:py} = p;
	let {x:qx,y:qy} = q;
	let xd = qx-px;
	let yd = qy-py;
	return xd*xd + yd*yd;
}

const nearCorner = function (rect,p) {
	let nearDS = 100;
	let crns = corners(rect);
	let {ul,ur,lr,ll} = crns;
	let dul = distanceSquared(p,ul);
	let dur = distanceSquared(p,ur);
	let dll = distanceSquared(p,ll);
	let dlr = distanceSquared(p,lr);
	if (dul < nearDS) {
		return 'ul';
	}
	if (dur < nearDS) {
		return 'ur';
	}
	if (dlr < nearDS) {
		return 'lr';
	}
	if (dll < nearDS) {
		return 'll';
	}
}

	
  
	
  canvas1.addEventListener('mousedown', e => {
		//debugger;
    let x = e.offsetX;
    let y = e.offsetY;
		let p =  {x:x,y:y}
		let nc = nearCorner(cRect,p);
		console.log('near corner',nc);
		dragCorner = nc;
		//console.log('x ',x,' y ',y);
  });
	
canvas1.addEventListener('mouseup', e => {
		//debugger;
		dragCorner = null;
		//console.log('x ',x,' y ',y);
  });

const cRectToRectInIm = function () {
	let {x,y,w,h} = cRect;
	let {x:ix,y:iy,w:iw,h:ih} = imRect;
	let {w:c1w,h:c1h} = canvasRect1;
	let {w:c2w,h:c2h} = canvasRect2;
	let {x:fDx,y:fy,w:fw,h:fh} = frect;
	let r = iw/c1w;
	let rsx = r*x;
	let rsy = r*y;
	let rsw = r*w;
	let rsh = r*h;
  return {x:rsx,y:rsy,w:rsw,h:rsh};
	
	let hr = h/fh;
	let iwr = iw/fw;
	let ihr = ih/fh;
	let rw = wr*iw;
	let rh = hr*ih;
	let rx = (x/fw)*iw;
	let ry = (y/fh)*ih;
  return {x:rx,y:ry,w:rw,h:rh};
}	
const drawFrame = function () {
	if (dragCorner) {
		debugger;
	}
	ctx1.clearRect(0,0,canvasRect1.w,canvasRect1.h);
	ctx1.drawImage(img,0,0,imRect.w,imRect.h,frect.x,frect.y,frect.w,frect.h);
	ctx1.drawImage(img,0,0,imRect.w,imRect.h,0,0,canvasRect1.w,canvasRect1.h);
	drawRect(cRect);
	ctx2.clearRect(0,0,canvasRect2.w,canvasRect2.h);
	cImRect = cRectToRectInIm();
	let fit = fitRect(cImRect,canvasRect2);
  frect2 = fit.rect;
  ctx2.drawImage(img,cImRect.x,cImRect.y,cImRect.w,cImRect.h,frect2.x,frect2.y,frect2.w,frect2.h);
	//let fit2 = fitRect(cRect,canvasRect);
  //let frect2 = fit2.rect;
	//ctx2.drawImage(img2,cRect.x,cRect.y,cRect.w,cRect.h,frect2.x,frect2.y,frect2.w,frect2.h);
	
}
canvas1.addEventListener('mousemove', e => {
    let x = e.offsetX;
    let y = e.offsetY;
		if (dragCorner) {
			let p =  {x:x,y:y};
			nudgeRect(dragCorner,p);
			drawFrame();
		}

		//console.log('x ',x,' y ',y);
  });

	debugger;
	img.addEventListener('load', function () {
		debugger;
		console.log('Load');
		let nw = img.naturalWidth;
		let nh = img.naturalHeight;
		canvasRect1 = {x:0,y:0,w:canvas1.width,h:canvas1.height};
		canvasRect2 = {x:0,y:0,w:canvas2.width,h:canvas2.height};
		imRect = {w:nw,h:nh};
		fit = fitRect(imRect,canvasRect1);
		frect = fit.rect;
	 canvas1.width = frect.w;
		canvas1.height = frect.h
	  canvasRect1.w = frect.w;
	  canvasRect1.h = frect.h;
		//ctx.drawImage(img,0,0,nw,nh,frect.x,frect.y,frect.w,frect.h);
		//ctx.drawImage(img,0,0,500,500);
		//ctx.fillStyle = 'rgb(200, 0, 0)';
    //ctx.fillRect(0, 0, 50, 50);
		let {w:cw,h:ch} = canvasRect1;
		let md = 0.5*Math.min(cw,ch);

		cRect = {x:0.5*(cw-md),y:0.5*(ch-md),w:md,h:md};
		//let r = {x:10,y:10,w:60,h:80};
		
		//drawRect(cRect);
		drawFrame();
		/*setTimeout( () => {
			alert('saving the image');
			debugger;
			harvestImage(canvas1,'images/test2.jpg');

		},2000);*/
		//cRect.w = 50;
		//drawFrame();
	},false);
	img.src = 'images/dogs.jpg';
}

const httpPost = function (url,data,cb) {
	let request = new XMLHttpRequest();
	request.open('POST',url, true);// meaning async
	request.setRequestHeader("Content-Type", "text/plain");
	request.onreadystatechange = function() { // Call a function when the state changes.
		 if (this.readyState === XMLHttpRequest.DONE && this.status === 200) {
			// Request finished. Do processing here.
			//debugger;
			if (cb) {
				cb('ok');
			}
		 }
	};
	request.send(data);	
}


const saveBase64Image = function (destPath,dataURL,cb) {
  let binary = atob(dataURL.split(',')[1]);
  // Create 8-bit unsigned array
  let arr = [];
  let ln = binary.length;
  for (let i =0; i < binary.length; i++) {
    arr.push(binary.charCodeAt(i));
  }
  let str = new Uint8Array(arr);
	httpPost(destPath,str,function (rs) { 
		 //debugger;
		 if (cb) {
			 cb();
		 }
	});
 //   fb.saveString(destPath,str,fb.jpegMetadata,undefined,cb);
  //}
}

 const harvestImage = function (cnv,dest,cb) {
		//debugger;
    let base64 = cnv.toDataURL('image/jpeg');
    saveBase64Image(dest,base64,cb);
  } 
	
	const saveImages = function () {
		harvestImage(canvas1,imageOut1, () => {
			canvas2.width = frect2.w;
			canvas2.height = frect2.h;
			ctx2.drawImage(img,cImRect.x,cImRect.y,cImRect.w,cImRect.h,0,0,frect2.w,frect2.h);
			harvestImage(canvas2,imageOut2,() => {
			  alert('images saved');
			})
		});
	}

	