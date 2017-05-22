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
var crossRefs = [];
var circleRefs = [];
var circle = document.getElementById("crcl");
var cross = document.getElementById("cross");
var gblur = document.getElementById("gblur");
var boardDiv = document.getElementById("board");
var players = [MAXI, MINI];

boardDiv.addEventListener('click', handleClick);
document.getElementById("reset").onclick = initGame;
document.getElementById("crosses").onclick = function() { user = MAXI; initGame();}
document.getElementById("circles").onclick = function() { user = MINI; initGame();}	


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

function displayTerminal(state) {
	//adds glow filter to the targeted cells's svg
	function markCell(row, col) {
		var id = row * dim + col;
		circleRefs[id].setAttribute("filter", "url(#glow)");
		crossRefs[id].setAttribute("filter", "url(#glow)");
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
		animateGlow(.1);
	}
}

function animateGlow(val) {
	gblur.setAttribute("stdDeviation", val);
	if(val < glowRadius) {
		setTimeout(function(){animateGlow(val + .1)}, 10);
	}
}

function unmarkCells() {
	for(var i = 0; i < marked.length; i++) {
		var id = marked[i];
		circleRefs[id].setAttribute("filter", "");
		crossRefs[id].setAttribute("filter", "");
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
		var circle = document.getElementById("crcl");
		var cross = document.getElementById("cross");
		var circleClone = circle.cloneNode(true);
		var crossClone = cross.cloneNode(true);
		circleClone.id = "circle" + i;
		crossClone.id = "cross" + i; 
		cell.appendChild(circleClone);
		cell.appendChild(crossClone);
		divRefs.push(cell);
		crossRefs.push(crossClone);
		circleRefs.push(circleClone);
	}

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

	//make the first move if the computer plays crosses
	if(user == MINI) {
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
			if(terminal) {
				console.log("TERMINAL");
				playing = false;
				displayTerminal();
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

function displayBoard(board) {

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

	for(var i = 0; i < board.length; i++) {
		for(var j = 0; j < board[i].length; j++) {
			var id = i * dim + j;
			var cross = crossRefs[id].getElementsByClassName("slash");
			var circle = circleRefs[id].getElementsByClassName("circle");
			switch(board[i][j]) {
				case 0:
					kill(cross);
					kill(circle);
					break;
				case 1:
					animate(cross);
					kill(circle);
					break;
				case -1: 
					kill(cross);
					animate(circle);
					break;
				default:
					console.warn("illegal board value : " + board[i][j]);
					break;
			}
		}
	}
}

init();