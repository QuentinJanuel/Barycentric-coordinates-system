let points = {};
function newColor(red, green, blue){
	return {
		r: red, g: green, b: blue
	};
}
function newPoint(name, x, y, z, color){
	let point = {x: x, y: y, z: z};
	if(color)
		point.color = color;
	points[name] = point;
}
newPoint('A', 0, -100, 0);
newPoint('B', 100, 0, 100);
newPoint('C', -50, 0, 50);
// Compute barycenter of A, B and C
newPoint('G', (points.A.x+points.B.x+points.C.x)/3, (points.A.y+points.B.y+points.C.y)/3, (points.A.z+points.B.z+points.C.z)/3, newColor(0, 0, 255));
let size = 300;
newPoint('x1', -size, 0, -size, newColor(100, 100, 100));
newPoint('x2', -size, 0, +size, newColor(100, 100, 100));
newPoint('x3', +size, 0, +size, newColor(100, 100, 100));
newPoint('x4', +size, 0, -size, newColor(100, 100, 100));
let cam = {x: 0, y: 0, z: 0};
let oldMouse = {x: 0, y: 0};
let dist;

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

function draw(){
	initSpace();
	// Points
	for(let key of ['A', 'B', 'C', 'G'])
		drawPoint(points[key]);
	// Plane
	//First plane
	beginShape();
	for(let key of ['x1', 'x2', 'x3', 'x4'])
		vertex(points[key].x, points[key].y, points[key].z);
	endShape(CLOSE);
	// Inclined plane
	beginShape();
	ambientMaterial(100);
	for(let key of ['A', 'B', 'C'])
		vertex(points[key].x, points[key].y, points[key].z);
	endShape(CLOSE);
	// Move
	moveInSpace();
}