var boardDiv = document.getElementById("board");
//Board dimension
const dim = 3;

const NT = "nonterminal";
const MAXI = 1;
const MINI = -1;
const TIE = 0;
var cells;


var players = [MAXI, MINI];
/* scan the whole board for any kind of line,
   return an object representing the first line 
   if any, or false if none */ 
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
		return found;
	}

	//ckeck for orthogonal lines (vertical or horizontal)
	var checkOrthogonal = function(v, vertical) {
		var found = false;
		for(var pos = 0; pos < board.length; pos++) {
			found = (
				function() {
					for(var i = 0; i < board.length; i++) {
						var cell = vertical ? 
						board[i][pos] :
						board[pos][i]
						if(cell != v) {
							return false;
						}
					}
					return v;
				}
			)();
			if(found) {
				break;
			}
		}
		return found;
	}

	//check for a win for any player
	for(var j = 0; j < this.players.length; j++) {
		var val = this.players[j];
		//Line
		if(	checkOrthogonal(val, 0) ||
			checkOrthogonal(val, 1) ||
			checkDiagonal(1, val)   ||
			checkDiagonal(0, val)    ) {
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
	var state = checkState(board);
	if(state == NT) {
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
	}
	return res;
}

var n = 0;

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
	var	pl = player;
	var next = pl * -1;
	var moves = getMoves(board, player);
	var values = [];
	var index;

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
	return moves[index]; 
}


function printBoard(board) {
	var res = "";
	for(var i = 0; i < dim; i++) {
		for(var j = 0; j < dim; j++) {
			res += board[i][j] + "\t";
		}
		res += "\n"
	}
	console.log(res);
}

function init() {
	var board = '';
	boardDiv.innerHTML = '';
	for(var i = 0; i < dim * dim; i++) {
		var crossImg = '<img id="cross' + i + 
		'" src="crosses/cross' + (i + 1) + '.svg" />';
		var circleImg = '<img id="circle' + i + 
		'" src="circles/circle' + (i + 1) + '.svg" />'
		var cell = '<div class="cell" id="' + i + '">' + 
		crossImg + circleImg + '</div>';
		board += cell;
	}
	boardDiv.innerHTML = board;


	//populate the initial board
	cells = [];
	for(var i = 0; i < dim; i++) {
		var row = [];
		for(var j = 0; j < dim; j++) {
			row.push(0);
		}
		cells.push(row);
	}
	playing = true;
	printBoard(cells)}

document.addEventListener('click', handleClick);

document.addEventListener("contextmenu", 
	function(ev) {handleClick(ev, true); return false;})

document.getElementById("reset").onclick = init;
	
function handleClick(e, right) {
	if(cells.length > 0) {
		var id = parseInt(e.target.id);
		if(playing && Number.isInteger(id)) {
			cells = updateBoard(cells, id, 1);
			cells = nextMove(cells, -1);
			displayBoard(cells);
			console.log(n);
			n = 0;
			printBoard(cells);
			var state = checkState(cells);
			if(state != NT) {
				console.log(
						(state == TIE) ? 
						"Tie !" : (state == MAXI) ? 
								"Crosses win !" : "Circles win !"
							);
				playing = false;
			}
		}

		else {
			console.log("the target isn't a cell !")
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
	for(var i = 0; i < board.length; i++) {
		for(var j = 0; j < board[i].length; j++) {
			var id = i * dim + j;
			var cross = document.getElementById("cross" + id);
			var circle = document.getElementById("circle" + id);
			var crossVis, circleVis;
			switch(board[i][j]) {
				case 0:
					crossVis = "hidden";
					circleVis = "hidden";
					break;
				case 1:
					crossVis = "visible";
					circleVis = "hidden";
					break;
				case -1: 
					crossVis = "hidden";
					circleVis = "visible";
					break;
				default:
					console.warn("illegal board value : " + board[i][j]);
					break;
			}
			cross.style.visibility = crossVis;
			circle.style.visibility = circleVis;
		}
	}
}


init();
//displayBoard(cells);