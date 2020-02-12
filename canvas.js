const canvas = document.getElementById('canvas');
const ctx = canvas.getContext("2d");

canvas.width = window.innerWidth;
canvas.height = window.innerHeight;

// Graph
let vertices = [];
let edges = [];

// Table
let tableRef;

// Input modes
let vertexMode = false;
let edgeMode = false;
let removeVertexMode = false;
//let vertex;

// Canvas vertex radius
const vertexRadius = 25;

// Canvas font size
const fontSize = 20;

// Source & Sink vertices
let source;
let sink;

// MaxFlow results
let calcedMaxFlow = false;
let maxFlow = 0; 


function rotPoint(x, y, rot) {
	newX = x * Math.cos(rot) - y * Math.sin(rot);
	newY = x * Math.sin(rot) + y * Math.cos(rot);
	return {'x': newX, 'y': newY};
}	

function drawTri(x, y, size, rotation) {
	ctx.beginPath();
	let p = rotPoint(-0.5 * size, -size, rotation);
	ctx.moveTo(x + p['x'], y + p['y']);
	p = rotPoint(-0.5 * size, size, rotation);
	ctx.lineTo(x + p['x'], y + p['y']);
	p = rotPoint(0.5 * size, 0, rotation);
	ctx.lineTo(x + p['x'], y + p['y']);
	ctx.fillStyle = 'black';
	ctx.fill();
}

class Vertex {																			
	constructor(x, y, radius) {
		this._x = x;
		this._y = y;
		this._radius = radius;
		this._selected = "hover";
		this._name = vertices.length > 2 ? vertices[vertices.length - 1]._name + 1: 0;		// Prevent vertices from having the same label, the first vertex that is not s or t is labelled 0
	}
	
	draw() {
		ctx.beginPath();
		ctx.arc(this._x, this._y, this._radius, 0, 2 * Math.PI);
		if (this._selected === "clicked") {
			ctx.strokeStyle = "green";
			ctx.fillStyle = "green";
		}
		else if (this._selected === "hover") {
			ctx.strokeStyle = "blue";
			ctx.fillStyle = "blue";
		}
		else {
			ctx.strokeStyle = "black";
			ctx.fillStyle = "black";
		}
		ctx.stroke();
		ctx.fill();
		ctx.closePath();
		
		// Vertex labels
		ctx.font = fontSize + "px Arial";
		ctx.fillStyle = "white";
		ctx.textAlign = "center";
		ctx.fillText(this._name, this._x, this._y + fontSize/3);
	}
	
	contains(x, y) {
		if (Math.pow(x - this._x, 2) + Math.pow(y - this._y, 2) <= Math.pow(this._radius, 2)) {
			return true;
		}
		else {
			return false;
		}
	}
}

class UI_Edge {
	constructor(v1, v2) {
		this._v1 = v1;
		this._v2 = v2;
		this._flow = '';
		this._capacity = 1;
	}
	
	draw() {
		if (this._v2._x !== 0 && this._v2._y !== 0) {
			ctx.beginPath();
			ctx.strokeStyle = 'black';
			ctx.lineWidth = 3;
			ctx.moveTo(this._v1._x, this._v1._y);
			ctx.lineTo(this._v2._x, this._v2._y);
			ctx.stroke();
			ctx.closePath();
			
			// Draw edge directionality arrow
			let midX = (this._v1._x + this._v2._x) / 2;
			let midY = (this._v1._y + this._v2._y) / 2;
			let slope = (this._v2._y - this._v1._y) / (this._v2._x - this._v1._x);
			let angle = Math.atan(slope);
			if (this._v1._x > this._v2._x) {
				angle -= Math.PI;
			}
			drawTri(midX, midY, 15, angle);
			
			// Dsiplay edge values
			ctx.font = fontSize + "px Arial";
			ctx.textAlign = "center";
			ctx.strokeStyle = "gray";
			ctx.strokeText(this._flow +"/" + this._capacity, midX, midY + fontSize/3);
			ctx.fillStyle = "white";
			ctx.fillText(this._flow + "/" + this._capacity, midX, midY + fontSize/3);
		}
	}
	
	equiv(ui_edge) {
		// Identical && Reverse Cases
		if ((this._v1 === ui_edge._v1 && this._v2 === ui_edge._v2) || (this._v1 === ui_edge._v2 && this._v2 === ui_edge._v1)) {
			return true;
		}
		else {
			return false;
		}
	}	
}

function init() {
	// Source and sink vertices
	source = new Vertex(window.innerWidth/4, window.innerHeight/2, vertexRadius);
	source._name = 's';
	source._selected = "";
	vertices.push(source);
	sink = new Vertex(window.innerWidth*3/4, window.innerHeight/2, vertexRadius);
	sink._name = 't';
	sink._selected = "";
	vertices.push(sink);
	
	window.requestAnimationFrame(update);
	tableRef = document.getElementById("data");
	/*
	let newRow = tableRef.insertRow(-1);
	let newCell = newRow.insertCell(0);
	let newText = document.createTextNode("test");
	newCell.append(newText);
	newCell = newRow.insertCell(1);
	let newTextBox = document.createElement("input");
	newTextBox.type="number";
	newTextBox.min="0";
	newTextBox.max="Number.MAX_SAFE_INTEGER";
	newTextBox.step="1";
	newCell.append(newTextBox);
	
	// 2nd row
	newRow = tableRef.insertRow(-1);
	newCell = newRow.insertCell(0);
	newText = document.createTextNode("test");
	newCell.append(newText);
	newCell = newRow.insertCell(1);
	newTextBox = document.createElement("input");
	newTextBox.type="number";
	newTextBox.min="0";
	newTextBox.max="Number.MAX_SAFE_INTEGER";
	newTextBox.step="1";
	newCell.append(newTextBox);
	
	for (let i = 0; i < 3; i++) {
		appendRow("test"+i);
	}
	*/
}

function update() {
	//Clear the canvas
	//ctx.globalCompositeOperation = 'destination-over'
	ctx.fillStyle = 'white';
	ctx.clearRect(0, 0, canvas.width, canvas.height);
	
	//vertex.draw();
	//vx.draw();
	
	// Draw edges - draw egdes fisrt
	for (let i = 0; i < edges.length; i++) {
		// Update edge value
		if (!edgeMode || edges[i]._v2 !== 0) {
			edges[i]._capacity = tableRef.rows[i + 1].cells[1].children[0].valueAsNumber;
		}
		
		edges[i].draw();
	}
	
	// Draw vertices - draw vertices over the edges
	for (let i = 0; i < vertices.length; i++) {		
		vertices[i].draw();
	}
	
	//if (vertexMode || edgeMode) {
		//window.requestAnimationFrame(update);
	//}
	
	// Display the max flow
	if (calcedMaxFlow === true) {
		ctx.fillStyle = "black";
		ctx.font = fontSize + "px Arial";
		ctx.textAlign = "center";
		ctx.fillText("Max Flow: " + maxFlow, window.innerWidth*5/6, window.innerHeight/2 + fontSize/3);
	}
}

// Input
canvas.addEventListener('mousemove', e => {
	if (vertexMode || edgeMode || removeVertexMode) {
		for (let i = 0; i < vertices.length; i++) {
			if (vertices[i].contains(e.clientX, e.clientY)) {
				if (vertices[i]._selected === "") {
					vertices[i]._selected = "hover";
				}
			}
			else if (vertices[i]._selected === "hover") {
				vertices[i]._selected = "";
			}
		}
	}
	
	window.requestAnimationFrame(update);
});

canvas.addEventListener('mousedown', e => {
	// Prevent vertices from being spawned on top of each other
	let overlapse = false;
	for (let i = 0; i < vertices.length; i++) {
		if (vertices[i].contains(e.clientX, e.clientY)) {
			overlapse = true;
			
			// Edge adding
			if (edgeMode) {
				if (edges.length === 0 || edges[edges.length - 1]._v2 !== 0) {
					edges.push(new UI_Edge(vertices[i], 0));
					vertices[i]._selected = "clicked";
				}
				// Prevent edges that start and finish at the same vertex
				else if (edges[edges.length - 1]._v1 !== vertices[i]){
					edges[edges.length - 1]._v2 = vertices[i];
					edges[edges.length - 1]._v1._selected = "";
				
					// Remove duplicate and reverse edges
					for (let j = 0; j < edges.length - 1; j++) {
						if(edges[j].equiv(edges[edges.length - 1])) {
							edges.pop();
							break;
						}
					}
				
					// Add ui_edge to table
					appendRow(edges[edges.length - 1]._v1._name + "-" + edges[edges.length - 1]._v2._name);
				}
				break;
			}
			
			// Vertex Removal
			if (overlapse && removeVertexMode) {
				// Cannot delete the source, the vertex labelled s, or the sink, the vertex labelled t
				if (vertices[i]._name === 's' || vertices[i]._name === 't') {
					break;
				}
	
				// Remove edges containing the vertex from the table, start at the last row and move toward row 0 as we are deleting rows
				for (let j = tableRef.rows.length-1; j > 0; j--) {
					if(tableRef.rows[j].cells[0].innerHTML.indexOf(vertices[i]._name) != -1) {
						tableRef.deleteRow(j);
					}						
				}
				
				// Remove edges from the edges array
				for (let j = edges.length-1; j >= 0; j--) {
					if (edges[j]._v1 === vertices[i] || edges[j]._v2 === vertices[i]) {
						edges.splice(j, 1);
					}
				}
	
				// Remove the vertex
				vertices.splice(i, 1);
			}
		}
	}
	
	// Make sure we aren't overlapping an existing vertex and we're in vertex adding mode
 	if (!overlapse && vertexMode) {
		if (edges.length > 0 && edges[edges.length - 1]._v2 === 0) {
			// Remove the half completed ui_edge
			edges[edges.length - 1]._v1._selected = "";
			edges.pop();
		}
		else {
			vertices.push(new Vertex(e.clientX, e.clientY, vertexRadius));
		}
	}
	
	window.requestAnimationFrame(update);
});

function toggleVertex() {
	vertexMode = !vertexMode;
	edgeMode = false;
	removeVertexMode = false;
	document.getElementById("vertex-button").className = vertexMode ? "on" : "off";
	document.getElementById("edge-button").className = "off";
	document.getElementById('remove-vertex-button').className = "off";
	
	resetVertices();
}

function toggleEdge() {
	edgeMode = !edgeMode;
	vertexMode = false;
	removeVertexMode = false;
	document.getElementById("edge-button").className = edgeMode ? "on" : "off";
	document.getElementById("vertex-button").className = "off";
	document.getElementById('remove-vertex-button').className = "off";
	
	if (!edgeMode && edges[edges.length-1]._v2 === 0) {
		edges.pop();

		resetVertices();
	}
}

// Set all vertices selected var to "" & update the display
function resetVertices() {
	// Reset all vertices
	for (let i = 0; i < vertices.length; i++) {
		vertices[i]._selected = "";
	}
		
	window.requestAnimationFrame(update);
}

// Reset the display, called cls aka Clear Screen as clear did not work, is clear a keyword?
function cls() {
	// Clear the graph
	vertices.length = 0;
	edges.length = 0;
	window.requestAnimationFrame(update);
	
	// Clear the table
	const rows = tableRef.rows.length;
	for (let i = 1; i < rows; i++) {
		tableRef.deleteRow(-1);
	}
	
	// Clear buttons
	vertexMode = false;
	document.getElementById("vertex-button").className = "off";
	edgeMode = false;
	document.getElementById("edge-button").className = "off";
	removeVertexMode = false;
	document.getElementById("remove-vertex-button").className = "off";
	
	// Reset Max Flow vars
	calcedMaxFlow = false;
	maxFlow = 0;
	
	init();
}

// Adds completed edges to the table
function appendRow(str) {
	let newRow = tableRef.insertRow(-1);
	let newCell = newRow.insertCell(0);
	let newText = document.createTextNode(str);
	newCell.append(newText);
	newCell = newRow.insertCell(1);
	let newTextBox = document.createElement("input");
	newTextBox.type="number";
	newTextBox.min="1";
	newTextBox.max="Number.MAX_SAFE_INTEGER";
	newTextBox.step="1";
	newTextBox.value="1";
	newTextBox.onchange = function(){
		window.requestAnimationFrame(update); 
	
		// Reset Max Flow vars
		calcedMaxFlow = false;
		maxFlow = 0;
	};
	newCell.append(newTextBox);
		
	// Do nothing
	//newTextBox.width="1"; Not really doing anything
}


function removeVertex() {
	removeVertexMode = !removeVertexMode;
	vertexMode = false;
	edgeMode = false;
	
	// Update UI
	document.getElementById('remove-vertex-button').className = removeVertexMode ? "on" : "off";
	document.getElementById("vertex-button").className = "off";
	document.getElementById("edge-button").className = "off";
	
	// Reset Max Flow vars
	calcedMaxFlow = false;
	maxFlow = 0;
}

function run() {
	let graph = new Graph();
	
	// Populate the graph, start at 1 to skip the header
	for (let i = 1; i < tableRef.rows.length; i++) {
		let edgeStart = tableRef.rows[i].cells[0].innerHTML.split('-')[0];
		let edgeEnd = tableRef.rows[i].cells[0].innerHTML.split('-').slice(1)[0];
		graph.addEdge(edgeStart, edgeEnd, tableRef.rows[i].cells[1].children[0].valueAsNumber);
		
		/*
		console.log(edgeStart);
		console.log(edgeEnd);
		console.log(tableRef.rows[i].cells[1].children[0].valueAsNumber);
		*/
	}
	
	// Update Max Flow vars
	calcedMaxFlow = true;
	maxFlow = graph.maxFlow();
	
	
	// Retrieve the edge flow values
	for (let i = 0; i < graph._edges.length; i++) {
		edges[i]._flow = graph._edges[i]._flow;
		//console.log(graph._edges[i]._flow);
	}

	window.requestAnimationFrame(update);
}