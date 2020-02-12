//<script type="text/javascript">
class Edge {
	constructor(head, tail, capacity) {
		this._head = head;
		this._tail = tail;
		this._capacity = capacity;
		this._flow = 0;
	}
	
	// Consider getters & setters for head, tail, capacity, & flow
	
	print() {
		return "(" + this._head + ", " + this._tail + " , " + this._capacity + ", " + this._flow + ")";
	}
}

class Graph {
	constructor() {
		this._edges = []
	}
	
	addEdge(head, tail, capacity) {
		this._edges.push(new Edge(head, tail, capacity));
	}
	
	/*
	*/
	depthFirstSearch(root, path, bottleneck, usedVertices) {
		//
		usedVertices.add(root);
		
		// Base case
		if (root === 't') {
			//console.log("The trivial case");
			return {'bool': true, 'bottleneck': bottleneck, 'path': path};
		}
		
		for (var i = 0; i < this._edges.length; i++) {
			var tmp = {};
			
			// Forward Edge
			if (this._edges[i]._head === root 
				&& this._edges[i]._flow < this._edges[i]._capacity
				&& usedVertices.has(this._edges[i]._tail) === false) {
				//console.log("Called CFP");
				tmp = this.checkForPath(this._edges[i], this._edges[i]._tail, path, bottleneck, usedVertices);
				if (tmp["bool"]) {
					return tmp;
				}
			}
			// SUSPECTED FOR ERROR
			// Backwards Edge
			if (this._edges[i]._tail === root 
				&& this._edges[i]._flow > 0
				&& usedVertices.has(this._edges[i]._head) === false
				&& this._edges[i] !== 's') {
				//console.log("Called CFP");
				tmp = this.checkForPath(this._edges[i], this._edges[i]._head, path, bottleneck, usedVertices);
				if (tmp["bool"]) {
					return tmp;
				}
			}
			
			// Debug
			/*
			if (this._edges[i]._head === root) {
				console.log(i + ": Start at the root");
			}
			if (this._edges[i]._flow < this._edges[i]._capacity) {
				console.log(i + ": Flow is less than capacity");
			}
			if (usedVertices.has(this._edges[i]._tail) === false) {
				console.log(i + ": The vertex is unused");
			}
			console.log(i + ": ")
			*/
		}
		
		//console.log("Returned false from DFS");
		return {'bool': false, 'bottleneck': Number.MAX_SAFE_INTEGER, 'path': path};;
	}
	// COMMENT
	checkForPath(edge, vertex, path, bottleneck, usedVertices) {
		//Debug
		//console.log("We made it into CFP");
		//
		var i = this.depthFirstSearch(vertex, path, bottleneck, usedVertices);
		if (i['bool'] !== false) {
			//
			path.unshift(edge);
				
			//
			var tmp = 0;
			if (vertex === edge._tail) {
				tmp = edge._capacity - edge._flow;
				//console.log('tmp: ' + tmp);
			}
			else {
				tmp = edge._flow;
			}
				
			if (bottleneck > tmp) {
				bottleneck = tmp;
			}
			if (bottleneck > i['bottleneck']) {
				bottleneck = i['bottleneck'];
			}
			//console.log("V===h: " + (vertex === edge._tail));
			//console.log(vertex);
			//console.log(edge._tail);
			//console.log("Returned True from CFP")
			//return true;
			return {'bool': true, 'bottleneck': bottleneck, 'path': path};
		}
		
		//console.log("Returned false from CFP");
		return {'bool': false, 'bottleneck': Number.MAX_SAFE_INTEGER, 'path': path};
	}
	
	aug(path, bottleneck) {
		
		var priorEdgeWasBackwards = false;
		
		// Update flows
		path[0]._flow += bottleneck;
		for (var i = 1; i < path.length; i++) {
			if (path[i - 1]._tail === path[i]._head && !priorEdgeWasBackwards
				|| path[i - 1]._head === path[i]._head && priorEdgeWasBackwards) {
				path[i]._flow += bottleneck;
				priorEdgeWasBackwards = false;
			}
			else {
				path[i]._flow -= bottleneck;
				priorEdgeWasBackwards = true;
			}
		}
	}
	
	// Tested
	maxFlow() {
		var path = []
		var b = Number.MAX_SAFE_INTEGER;
		var usedVertices = new Set();
		// There must be a better way
		//var i = this.depthFirstSearch('s', path, b, usedVertices);
		for (var i = this.depthFirstSearch('s', path, b, usedVertices); i['bool'];
			i = this.depthFirstSearch('s', path, b, usedVertices)) {
			//console.log(i['path']);
			this.aug(i['path'], i['bottleneck']);
			
			// Reset values
			usedVertices.clear();
			path.length = 0;
			b = Number.MAX_SAFE_INTEGER;
		}
		
		var minCut = 0;
		
		for (var i = 0; i < this._edges.length; i++) {
			if (this._edges[i]._tail === 't') {
				minCut += this._edges[i]._flow;
			}
		}
		
		return minCut;
	}
	
	print() {
		var result = ""
		for (var i = 0; i < this._edges.length; i++) {
			result += this._edges[i].print() + "\n";
		}
		return result;
	}
}

/*var graph1 = new Graph();
graph1.addEdge('s', 'a', 20);
graph1.addEdge('s', 'b', 10);
graph1.addEdge('a', 'b', 30);
graph1.addEdge('a', 't', 10);
graph1.addEdge('b', 't', 20);
console.log(graph1.maxFlow());

var graph = new Graph();
	graph.addEdge('s', 'a', 10);
	graph.addEdge('s', 'b', 3);
	graph.addEdge('s', 'd', 1);
	graph.addEdge('a', 'b', 1);
	graph.addEdge('a', 'c', 2);
	graph.addEdge('a', 't', 5);
	graph.addEdge('b', 'c', 6);
	graph.addEdge('d', 'b', 3);
	graph.addEdge('d', 'c', 3);
	graph.addEdge('d', 't', 10);
	graph.addEdge('c', 't', 5);
console.log(graph.maxFlow());

graph = new Graph();
graph.addEdge('s', 'a', 10)
graph.addEdge('s', 'c', 8)
graph.addEdge('a', 'b', 5)
graph.addEdge('a', 'c', 2)
graph.addEdge('b', 't', 7)
graph.addEdge('c', 'd', 10)
graph.addEdge('d', 'b', 8)
graph.addEdge('d', 't', 10)
console.log(graph.maxFlow())

graph = new Graph();
graph.addEdge('s', 'a', 10)
graph.addEdge('s', 'b', 8)
graph.addEdge('a', 'b', 2)
graph.addEdge('a', 'c', 8)
graph.addEdge('b', 'c', 6)
graph.addEdge('b', 'd', 7)
graph.addEdge('c', 't', 10)
graph.addEdge('d', 't', 10)
console.log(graph.maxFlow())

graph = new Graph();
graph.addEdge('s', 'a', 16)
graph.addEdge('s', 'b', 13)
graph.addEdge('a', 'b', 10)
graph.addEdge('a', 'c', 12)
graph.addEdge('b', 'a', 4)
graph.addEdge('b', 'd', 14)
graph.addEdge('c', 'b', 9)
graph.addEdge('c', 't', 20)
graph.addEdge('d', 'c', 7)
graph.addEdge('d', 't', 4)
console.log(graph.maxFlow())

//Testing
var path = [];
var b = Number.MAX_SAFE_INTEGER;
var usedVertices = new Set();
//console.log(graph.depthFirstSearch('s', path, b, usedVertices));
</script>
*/