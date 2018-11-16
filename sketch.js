let size = 600;
let scalar2D = 1/2;

function newColor(red, green, blue){
	return {
		r: red, g: green, b: blue
	};
}

function newPoint(x, y, z, color){
	let point = {x: x, y: y, z: z};
	if(color)
		point.color = color;
	return point;
}

function barycenter(point1, point2, point3){
	return newPoint(
		(point1.x+point2.x+point3.x)/3,
		(point1.y+point2.y+point3.y)/3,
		(point1.z+point2.z+point3.z)/3,
		newColor(0, 0, 255)
	);
}

let points = {};
// Triangle points
points.A = newPoint(0, 0, -200);
points.B = newPoint(100, 0, 100);
points.C = newPoint(-200, 0, 150);

// Compute barycenter of A, B and C
points.G = barycenter(points.A, points.B, points.C);

// The green point
points.D = newPoint(-75, 0, 50, newColor(0, 255, 0));

// 2D Canvas
let canvas2D = document.createElement("canvas");
canvas2D.setAttribute("width", size*scalar2D);
canvas2D.setAttribute("height", size*scalar2D);
document.body.appendChild(canvas2D);
let ctx2D = canvas2D.getContext("2d");
ctx2D.font = "20px Arial"
let clearCanvas2D = function(){
	ctx2D.fillStyle = "#FFF";
	ctx2D.fillRect(0, 0, canvas2D.width, canvas2D.height);
}
let draw2DPoints = function(){
	clearCanvas2D();
	for(key of ['A' ,'B', 'C', 'D', 'G']){
		let x = canvas2D.width/2+points[key].x*scalar2D;
		let y = canvas2D.height/2+points[key].z*scalar2D;
		if(points[key].color)
			ctx2D.fillStyle = "rgb("+points[key].color.r+", "+points[key].color.g+", "+points[key].color.b+")";
		else
			ctx2D.fillStyle = "#F00";
		ctx2D.beginPath();
		ctx2D.arc(x, y, 5, 0, 2*Math.PI);
		ctx2D.fill();
		ctx2D.closePath();
		let name = key;
		if(['A', 'B', 'C'].includes(key))
			name += " ("+Math.round(yToWeight(points[key].y)*100)/100+")";
		ctx2D.fillText(name, x+10, y+10);
	}
}
let movePointD = function(e){
	points.D.x = (e.clientX-canvas2D.width/2)/scalar2D;
	points.D.z = (e.clientY-canvas2D.height/2)/scalar2D;
	adaptPlaneToPointD();
	draw2DPoints();
}
// Marble
let marbleVisible = false;
let marbleSpeed = 0;
let canSpace = true;
let marble = newPoint(0, 0, 0);
let marbleRadius = 20;
let marbleDist = 0;

let mousePressed2D = false;
canvas2D.addEventListener("mousedown", function(e){
	mousePressed2D = true;
	movePointD(e);
	marbleVisible = false;
});
canvas2D.addEventListener("mouseup", function(){
	mousePressed2D = false;
});
canvas2D.addEventListener("mousemove", function(e){
	if(mousePressed2D){
		movePointD(e);
	}
});

// Outer points
points.x1 = newPoint(-size/2, 0, -size/2);
points.x2 = newPoint(-size/2, 0, +size/2);
points.x3 = newPoint(+size/2, 0, +size/2);
points.x4 = newPoint(+size/2, 0, -size/2);

// Variables
let yScalar = 300;
let mousePressedCanvas = false;
let graphics;

// Coord points
points["0"] = newPoint(-size/2, -yScalar, size/2, newColor(100, 100, 100));
points["1"] = newPoint(-size/2, 0, size/2, newColor(100, 100, 100));

// Camera
let cam = newPoint(0, 0, 0);
let oldMouse = {x: 0, y: 0};
let camDist = 1000;
let camTheta1 = Math.PI*2/3;
let camTheta2 = Math.PI/2;

function setup(){
	let canvas = createCanvas(window.innerWidth-canvas2D.width, window.innerHeight, WEBGL);
	canvas.mousePressed(function(){
		mousePressedCanvas = true;
	}).mouseReleased(function(){
		mousePressedCanvas = false;
	});
	graphics = createGraphics(300, 300);
	graphics.textAlign(CENTER, CENTER);
	graphics.textSize(200);
	adaptPlaneToPointD();
	draw2DPoints();
}

function moveInSpace(){
	if(mousePressedCanvas){
		camTheta2 += (mouseX-oldMouse.x)*Math.PI/180/3;
		camTheta1 += (mouseY-oldMouse.y)*Math.PI/180/3;
		let epsilon = .01;
		camTheta1 = Math.max(epsilon, Math.min(camTheta1, Math.PI-epsilon));
	}else
		camTheta2 += .001;
	oldMouse = {x: mouseX, y: mouseY};
	cam.x = camDist*Math.sin(camTheta1)*Math.cos(camTheta2);
	cam.z = camDist*Math.sin(camTheta1)*Math.sin(camTheta2);
	cam.y = camDist*Math.cos(camTheta1);
	camera(cam.x, cam.y, cam.z, 0, 0, 0, 0, 1, 0);
}

function mouseWheel(e){
	camDist = Math.min(1000, Math.max(400, camDist+e.delta/3));
}

function initSpace(){
	background(0);
	ambientLight(255);
	noStroke();
	moveInSpace();
}

function drawPoint(point, name){
	if(point.color){
		graphics.fill(point.color.r, point.color.g, point.color.b);
		ambientMaterial(point.color.r, point.color.g, point.color.b);
	}else{
		graphics.fill(255, 0, 0);
		ambientMaterial(255, 0, 0);
	}
	// Draw the point
	translate(point.x, point.y, point.z);
	sphere(5);
	translate(-point.x, -point.y, -point.z);
	if(['A', 'B', 'C', 'G', 'D'].includes(name)){
		translate(point.x, 0, point.z);
		sphere(5);
		translate(-point.x, 0, -point.z);
	}
	//
	// Draw text point
	let scal = 1/3;
	let up = 10;
	let textPoint = newPoint(
		cam.x+(point.x-cam.x)*scal,
		cam.y+(point.y-up-cam.y)*scal,
		cam.z+(point.z-cam.z)*scal
	);
	if(['A', 'B', 'C', 'G', 'D'].includes(name)){
		textPoint.y = cam.y+(-up-cam.y)*scal;
	}
	translate(textPoint.x, textPoint.y-up, textPoint.z);
	rotateY(-camTheta2+Math.PI/2);
	rotateX(camTheta1-Math.PI/2);
	graphics.clear();
	graphics.background(5, 4, 68);
	graphics.text(name, 150, 150);
	texture(graphics);
	plane(10);
	rotateX(-camTheta1+Math.PI/2);
	rotateY(camTheta2-Math.PI/2);
	translate(-textPoint.x, -textPoint.y+up, -textPoint.z);
	// Set back the ambient material
	ambientMaterial(255);
}

function drawBottomPlane(){
	ambientMaterial(255, 255, 255, 255);
	beginShape();
	for(let key of ['x1', 'x2', 'x3', 'x4'])
		vertex(points[key].x, points[key].y, points[key].z);
	endShape(CLOSE);
}

function drawTopPlane(){
	ambientMaterial(255, 255, 255, 100);
	beginShape();
	for(let key of ['x1', 'x2', 'x3', 'x4'])
		vertex(points[key].x, points[key].y-yScalar, points[key].z);
	endShape(CLOSE);
}

function getInclinedPlaneYCoord(x, z){
	// u is the vector AB
	let u = newPoint(
		points.B.x-points.A.x,
		points.B.y-points.A.y,
		points.B.z-points.A.z
	);
	// v is the vector AC
	let v = newPoint(
		points.C.x-points.A.x,
		points.C.y-points.A.y,
		points.C.z-points.A.z
	);
	// w is the vector Axi and its y coordinate is unkown
	let w = newPoint(
		x-points.A.x,
		0,
		z-points.A.z
	);
	let num = w.x*(u.y*v.z-v.y*u.z)+w.z*(u.x*v.y-v.x*u.y);
	let den = u.x*v.z-v.x*u.z;
	w.y = num/den;
	return w.y+points.A.y;
}

function drawABCPlane(){
	ambientMaterial(0, 100, 255);
	beginShape();
	for(let key of ['x1', 'x2', 'x3', 'x4']){
		let y = getInclinedPlaneYCoord(points[key].x, points[key].z);
		vertex(points[key].x, y, points[key].z);
	}
	endShape(CLOSE);
}

function weightToY(weight){
	return map(weight, 0, 1, -yScalar, 0);
}

function yToWeight(y){
	return map(y, 0, -yScalar, 1, 0);
}

function getABCCoord(point){
	let orig = {
		x: points.A.x,
		y: points.A.z
	};
	let ax = {
		x: point.x-points.A.x,
		y: point.z-points.A.z
	};
	let ab = {
		x: points.B.x-points.A.x,
		y: points.B.z-points.A.z
	};
	let ac = {
		x: points.C.x-points.A.x,
		y: points.C.z-points.A.z
	};
	let det = ab.x*ac.y-ac.x*ab.y;
	let alpha = ac.y*ax.x-ac.x*ax.y;
	let beta = ab.x*ax.y-ab.y*ax.x;
	alpha /= det;
	beta /= det;
	return {ab: alpha, ac: beta};
}

function getBaryCoord(point){
	let weightA, weightB, weightC;
	let abcCoord = getABCCoord(point);
	weightB = abcCoord.ab;
	weightC = abcCoord.ac;
	weightA = 1-weightB-weightC;
	return {
		a: weightA,
		b: weightB,
		c: weightC
	};
}

function adaptPlaneToPointD(){
	let bary = getBaryCoord(points.D);
	points.A.y = weightToY(bary.a);
	points.B.y = weightToY(bary.b);
	points.C.y = weightToY(bary.c);
}

function updateMarble(){
	marbleDist += marbleSpeed;
	if(marbleDist > 1){
		marbleDist = 1;
		marbleSpeed = 0;
		canSpace = true;
	}
	marble.x = points.G.x+marbleDist*(points.D.x-points.G.x);
	marble.z = points.G.z+marbleDist*(points.D.z-points.G.z);
	marble.y = getInclinedPlaneYCoord(marble.x, marble.z);
}
function drawMarble(){
	ambientMaterial(100, 200, 100);
	// Draw the marble
	translate(marble.x, marble.y-marbleRadius, marble.z);
	sphere(marbleRadius);
	translate(-marble.x, -marble.y+marbleRadius, -marble.z);
}
document.body.addEventListener("keydown", function(e){
	if(e.code == "Space" && canSpace){
		canSpace = false;
		marbleDist = 0;
		marbleSpeed = .01;
		marbleVisible = true;
	}
});

function draw(){
	initSpace();
	// Recompute the barycenter
	points.G = barycenter(points.A, points.B, points.C);
	points.D.y = getInclinedPlaneYCoord(points.D.x, points.D.z);
	// Points
	for(let key of ['A', 'B', 'C', 'G', 'D', '0', '1'])
		drawPoint(points[key], key);
	// Marble
	updateMarble();
	if(marbleVisible){
		drawMarble();
		draw2DPoints();
		ctx2D.fillStyle = "#000";
		ctx2D.fillRect(0, canvas2D.height-10, canvas2D.width*marbleDist, canvas2D.height);
	}
	// Planes
	drawBottomPlane();
	drawABCPlane();
	drawTopPlane();
}
