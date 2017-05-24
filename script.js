//Board dimension
const dim = 3;

const NT = "nonterminal";
const TIE = 0;
const MAXI = 1;
const MINI = -1;
const FORWARD = 1;
const BACKWARD = 0;
const DIAGONAL = 2;
const VERTICAL = 1;
const HORIZONTAL = 0;

var orientation, position, terminal;
var iw = window.innerWidth;
var ow = window.outerWidth;
var glowRadius = iw / 200;
var user = 1;
var cells = [];
var marked = [];
var divRefs = [];
var xRefs = [];
var oRefs = [];
var o = document.getElementById("crcl");
var x = document.getElementById("x");
var gblur = document.getElementById("gblur");
var boardDiv = document.getElementById("board");
var xes = document.getElementById("xes");
var os = document.getElementById("os");
var reset = document.getElementById("reset");
var panel = document.getElementById("panel");
var players = [MAXI, MINI];

init();

boardDiv.onclick = handleClick;
reset.onclick = initGame;

xes.onclick = function() { 
		if(user != MAXI) {
			user = MAXI; 
			initGame(); 
			glow(x, true);
			glow(o, false);
			animateGlow(glowRadius / 3);
		}
	}

os.onclick = function() {
		if(user != MINI) {
			 user = MINI; 
			 initGame();
			 glow(x, false);
			 glow(o, true);
			 animateGlow(glowRadius / 3);
		}
	}


window.onresize = function() { 
	if(ow != window.outerWidth){
		iw = window.innerWidth;
		ow = window.outerWidth;
		glowRadius = iw / 200;
	}
}

/* scan the whole board for any kind of line,
   return the player value if a line is found,
   TIE if tie, else : "nonterminal" */ 
function checkState(board) {

	var res = NT;

	/*check for diagonal lines, 
	  if (fwd) check for forward diagonal line, 
	  else, check for backwards diagonal */
	var checkDiagonal = function(fwd, v) {
		var found = v;
		var tempCells = fwd ? 
			board.slice().reverse() : board;
		for(var i = 0; i < board.length; i++) {
			if(tempCells[i][i] != v) {
				found = false;
			}
		}
		if(found) {
			orientation = DIAGONAL;
			position = fwd;
		}
		return found;
	}

	//check for orthogonal lines (vertical or horizontal)
	var checkOrthogonal = function(v, orient) {
		var found = false;
		for(var pos = 0; pos < board.length; pos++) {

			found = (
				function() {
					for(var i = 0; i < board.length; i++) {
						var cell = orient ? 
						board[i][pos] :
						board[pos][i]
						if(cell != v) {
							return false;
						}
					}
					return v;
				}
			) ();
			if(found) {
				orientation = orient;
				position = pos;
				break;
			}

		}
		return found;
	}

	//check for a win for any player
	for(var j = 0; j < this.players.length; j++) {
		var val = this.players[j];
		//Line
		if(	checkOrthogonal(val, HORIZONTAL) ||
			checkOrthogonal(val, VERTICAL) ||
			checkDiagonal(FORWARD, val)   ||
			checkDiagonal(BACKWARD, val)    ) {
			res = val;
			break;
		}
	}

	if(res == NT) {
	//check for tie state
	loop:
		for(var i = 0; i < board.length; i++) {
			for(var j = 0; j < board.length; j++) {
				if(board[i][j] == 0) {
					break loop;
				}
				// TIE
				if(i + j == (dim - 1) * (dim - 1)) {
					res = TIE;
				}
			}
		}
	}
	return res;
}

function getMoves(board, player) {
	var res = [];
	for(var i = 0; i < board.length; i++) {
		for(var j = 0; j < board[i].length; j++) {
			if(board[i][j] == 0) {
				var temp = board.map(function(arr){
					return arr.slice();
				});
				temp[i][j] = player;
				res.push(temp);
			}
		}
	}
	return res;
}

function minimax(board, player) {
	var state = checkState(board);
	if(state != NT) {
		return state;
	}
	else{
		var moves = getMoves(board, player);
		var next = (player == MAXI) ? MINI : MAXI;
		var bestVal = (player == MAXI) ? -1000 : 1000;
		var best = (player == MAXI) ? Math.max : Math.min;

		for(var i = 0; i < moves.length; i++) {
			var newBoard = moves[i];
			var mm = minimax(newBoard, next);
			bestVal = best(bestVal, mm);
		}

		return bestVal;
	}
}

function nextMove(board, player) {

	var moves = getMoves(board, player);
	var	pl = player;
	var next = pl * -1;
	var values = [];
	var res = [];
	var index;

	if(moves.length > 0) {
		/* heuristic: on the first move,
		 pick the center cell if empty, 
		 if not, pick the first empry cell */ 	
		if(moves.length > 7) {
			var cX = (dim - 1) / 2;
			var cY =  (dim - 1) / 2;
			if(dim % 2 != 0 && board[cX][cY] == 0){
				var centerIndex = (dim * dim - 1) / 2
				return updateBoard(board, centerIndex, player);
			}
			else{
				index = 0;
			}
		}

		else{
			for(var i = 0; i < moves.length; i++) {
				var b = moves[i];
				var mm = minimax(b, next);
				values.push(mm);
			}
			var best = (pl == MAXI) ? 
				Math.max(...values) : Math.min(...values);
			index = values.indexOf(best);
		}
		res = moves[index];
	}
	else {
		res = board;
	}
	if(checkState(res) != NT) {
		terminal = true;
	}
	return res; 
}

function glow(svg, gl) {
	var attr = gl ? "url(#glow)" : "";
	svg.setAttribute("filter", attr);
}

function displayState(state) {
	if(state != TIE) {
		var winner = state == 1 ? "crosses" : "circles"
		var message = winner + "<br>win !";
	}
	else {
		var message = "TIE";
	}
	panel.innerHTML = message
	panel.style.zIndex = 2;
	panel.className = "pnl show-txt"
	document.getElementById("blur").className = "blur";
	document.getElementById("blur").style.zIndex = 1;
}

function displayTerminal(state) {
	//adds glow filter to the targeted cells's svg
	function markCell(row, col) {
		var id = row * dim + col;
		glow(oRefs[id], true);
		glow(xRefs[id], true);
		marked.push(id);
	}

	function displayOrtho(pos, orient) {
		for(var i = 0; i < cells.length; i++) {
			var row = orient ? i : pos;
			var col = orient ? pos : i;
			markCell(row, col);
		}
	}

	function displayDiag(fwd) {
		var len = cells.length - 1;
		for(var i = 0; i <= len; i++) {
			var col = fwd ? len - i : i;
			markCell(i, col);
		}
	}

	if(state != TIE) {
		if(orientation == DIAGONAL ) {
			displayDiag(position);
		}
		else{
			displayOrtho(position, orientation);
		}
		animateGlow(glowRadius);
	}
	setTimeout(function(){displayState(state);}, 1000)
	
}

panel.onclick = function() {
	panel.style.zIndex = "-1";
	panel.innerHTML = "";
	initGame();
	document.getElementById("blur").className = "";
}

function animateGlow(radius) {
	anim(.1);
	function anim(val) {
		gblur.setAttribute("stdDeviation", val);
		if(val < radius) {
			setTimeout(function(){anim(val + .1)}, 10);
		}
	}
	
}

function unmarkCells() {
	for(var i = 0; i < marked.length; i++) {
		var id = marked[i];
		var o = oRefs[id];
		var x = xRefs[id]
		glow(x, false);
		glow(o, false);
	} 
}

function init() {
	var board = '';
	boardDiv.innerHTML = '';

	//populate the board with svgs
	for(var i = 0; i < dim * dim; i++) {
		var cell = '<div class="cell" id="' + i + '"></div>';
		board += cell;
	}
	boardDiv.innerHTML = board;


	// get references to cell divs
	for(var i = 0; i < dim * dim; i++) {
		var cell = document.getElementById(i);
		var oClone = o.cloneNode(true);
		var xClone = x.cloneNode(true);
		oClone.id = "o" + i;
		xClone.id = "x" + i; 
		cell.appendChild(oClone);
		cell.appendChild(xClone);
		divRefs.push(cell);
		xRefs.push(xClone);
		oRefs.push(oClone);
	}
	o.setAttribute("class", "player");
	x.setAttribute("class", "player");
	crcl =  o.getElementsByClassName("o");
	crs = x.getElementsByClassName("slash");
	animate(crcl);
	animate(crs);

	initGame();
}

function initGame() {
	playing = true;
	terminal = false;
	cells = [];

	//populate the initial board
	for(var i = 0; i < dim; i++) {
		var row = [];
		for(var j = 0; j < dim; j++) {
			row.push(0);
		}
		cells.push(row);
	}

	//make the first move if the computer plays xes
	if(user == MINI) {
		console.log("YO")
		cells = nextMove(cells, MAXI);
	}
	unmarkCells();
	displayBoard(cells);
}

function handleClick(e) {
	if(playing) {
		var id = parseInt(e.target.id.match(/[0-9]+/));
		if(Number.isInteger(id)) {

			var row = Math.floor(id / dim);
			var col = id % dim;

			if(cells[row][col] == 0) {
				cells = updateBoard(cells, id, user);
				cells = nextMove(cells, user * -1);
				displayBoard(cells);
			}

			var state = checkState(cells);
			if(state != NT) {
				console.log("TERMINAL");
				playing = false;
				displayTerminal(state);
			}
		}
	}
}

function updateBoard(board, id, val) {
	var row = Math.floor(id / board.length);
	var col = id % board.length
	board[row][col] = val;
	return board;
}

function animate(paths) {
	for(var i = 0; i < paths.length; i++) {
		paths[i].style.animation = "draw .35s ease forwards";
	}
}

function kill(paths) {
	for(var i = 0; i < paths.length; i++) {
		paths[i].style.animation = "";
	}
}

function displayBoard(board) {

	for(var i = 0; i < board.length; i++) {
		for(var j = 0; j < board[i].length; j++) {
			var id = i * dim + j;
			var x = xRefs[id].getElementsByClassName("slash");
			var o = oRefs[id].getElementsByClassName("o");
			switch(board[i][j]) {
				case 0:
					kill(x);
					kill(o);
					break;
				case 1:
					animate(x);
					kill(o);
					break;
				case -1: 
					kill(x);
					animate(o);
					break;
				default:
					console.warn("illegal board value : " + board[i][j]);
					break;
			}
		}
	}
}
