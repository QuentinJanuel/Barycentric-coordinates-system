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
points.A = newPoint(0, -50, 0);
points.B = newPoint(100, 0, 100);
points.C = newPoint(-50, 0, 50);

// Compute barycenter of A, B and C
points.G = barycenter(points.A, points.B, points.C);

// Outer points
let size = 200;
points.x1 = newPoint(-size, 0, -size, newColor(100, 100, 100));
points.x2 = newPoint(-size, 0, +size, newColor(100, 100, 100));
points.x3 = newPoint(+size, 0, +size, newColor(100, 100, 100));
points.x4 = newPoint(+size, 0, -size, newColor(100, 100, 100));

// Camera
let cam = {x: 0, y: 0, z: 0};
let oldMouse = {x: 0, y: 0};
let dist;

// Y Scalar
let yScalar = 150;

// angles for moving the point A (temp)
let angleA = 0;
let angleB = 0;
let angleC = 0;

function setup(){
	createCanvas(window.innerWidth, window.innerHeight, WEBGL);
	cam.y = -300;
	cam.z = (height/2)/Math.tan(Math.PI/6);
}

function moveInSpace(){
	dist = Math.sqrt(cam.x*cam.x+cam.y*cam.y+cam.z*cam.z);
	if(mouseIsPressed){
		let newCam = {
			x: cam.x+oldMouse.x-mouseX,
			y: cam.y+oldMouse.y-mouseY
		};
		let idk = dist*dist-newCam.x*newCam.x-newCam.y*newCam.y;
		if(idk >= 0){
			cam.x = newCam.x;
			cam.y = newCam.y;
			cam.z = Math.sqrt(idk);
		}
	}
	oldMouse = {x: mouseX, y: mouseY};
	camera(cam.x, cam.y, cam.z, 0, 0, 0, 0, 1, 0);
}

function initSpace(){
	background(0);
	ambientLight(255);
	noStroke();
}

function drawPoint(point){
	if(point.color)
		ambientMaterial(point.color.r, point.color.g, point.color.b);
	else
		ambientMaterial(255, 0, 0);
	translate(point.x, point.y, point.z);
	sphere(5);
	translate(-point.x, -point.y, -point.z);
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

function draw(){
	initSpace();
	// Recompute the barycenter
	points.G = barycenter(points.A, points.B, points.C);
	// Move the point A, B, C (temp)
	points.A.y = (sin(angleA)-1)*yScalar/2;
	points.B.y = (sin(angleB)-1)*yScalar/2;
	points.C.y = (sin(angleC)-1)*yScalar/2;
	angleA += .005;
	angleB += .011;
	angleC += .016;
	// Points
	for(let key of ['A', 'B', 'C', 'G'])
		drawPoint(points[key]);
	// Planes
	drawBottomPlane();
	drawABCPlane();
	drawTopPlane();
	// Move
	moveInSpace();
}
