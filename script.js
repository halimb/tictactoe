const NT = "nonterminal";
const MAXI = 1;
const MINI = -1;
const TIE = 0;
var cells = [];

Board.prototype = {
	players: [MAXI, MINI],
	/* scan the whole board for any kind of line,
	   return an object representing the first line 
	   if any, or false if none */ 
	checkState: function(cells) {

		var res = NT;

		/*check for diagonal lines, 
		  if (fwd) check for forward diagonal line, 
		  else, check for backwards diagonal */
		var checkDiagonal = function(fwd, v) {
			var found = v;
			var tempCells = fwd ? 
				cells.slice().reverse() : cells;
			for(var i = 0; i < cells.length; i++) {
				if(tempCells[i][i] != v) {
					found = false;
				}
			}
			return found;
		}

		//ckeck for orthogonal lines (vertical or horizontal)
		var checkOrthogonal = function(v, vertical) {
			var found = false;
			for(var pos = 0; pos < cells.length; pos++) {
				found = (
					function() {
						for(var i = 0; i < cells.length; i++) {
							var cell = vertical ? 
							cells[i][pos] :
							cells[pos][i]
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
			for(var i = 0; i < cells.length; i++) {
				for(var j = 0; j < cells.length; j++) {
					if(cells[i][j] == 0) {
						break loop;
					}
					// TIE
					if(i + j == 4) {
						res = TIE;
					}
				}
			}
		}
		return res;
	}
}

function Board(cells) {
	this.cells = cells;
	this.terminal = this.checkState(this.cells);
}

function getMoves(board, player) {
	var res = [];
	if(board.terminal == NT) {
		for(var i = 0; i < board.cells.length; i++) {
			for(var j = 0; j < board.cells[i].length; j++) {
				if(board.cells[i][j] == 0) {
					var temp = board.cells.map(function(arr){
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
	n++;
	if(board.terminal != NT) {
		res = board.terminal;
		return res;
	}
	else{
		var moves = getMoves(board, player);
		var next = (player == MAXI) ? MINI : MAXI;
		var bestVal = (player == MAXI) ? -1000 : 1000;
		var best = (player == MAXI) ? Math.max : Math.min;

		for(var i = 0; i < moves.length; i++) {
			var newBoard = new Board(moves[i]);
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
		if(board.cells[1][1] != 0){
			index = 0;
		}
		else{
			return updateBoard(board.cells, 4, player);
		}
	}
	else{
		for(var i = 0; i < moves.length; i++) {
			var b = new Board(moves[i]);
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
	for(var i = 0; i < 3; i++) {
		for(var j = 0; j < 3; j++) {
			res += board[i][j] + "\t";
		}
		res += "\n"
	}
	console.log(res);
}

function init() {
	var board = '';
	for(var i = 0; i < 9; i++) {
		var crossImg = '<img id="cross' + i + 
		'" src="crosses/cross' + (i + 1) + '.svg" />';
		var circleImg = '<img id="circle' + i + 
		'" src="circles/circle' + (i + 1) + '.svg" />'
		var cell = '<div class="cell" id="' + i + '">' + 
		crossImg + circleImg + '</div>';
		board += cell;
	}
	document.getElementById("board").innerHTML = board;

	cells = [   [0, 0, 0],
				[0, 0, 0],
				[0, 0, 0]   ];
}

document.addEventListener('click', handleClick);

document.addEventListener("contextmenu", 
	function(ev) {handleClick(ev, true); return false;})
	
function handleClick(e, right) {
	if(cells.length > 0) {
		var id = parseInt(e.target.id);
		if(Number.isInteger(id)) {
			cells = updateBoard(cells, id, 1);
			cells = nextMove( new Board(cells), -1);
			displayBoard(cells);
			console.log(n);
			n = 0;
			board = new Board(cells, -1)
			if(board.terminal != NT) {
				console.log(
						(board.terminal == TIE) ? 
						"Tie !" : (board.terminal == MAXI) ? 
								"Crosses win !" : "Circles win !"
								);
			}
		}

		else {
			console.log("the target isn't a cell !")
		}
	}
}

function updateBoard(board, id, val) {
	board[Math.floor(id / 3)][id % 3] = val;
	return board;
}

function displayBoard(board) {
	for(var i = 0; i < board.length; i++) {
		for(var j = 0; j < board[i].length; j++) {
			var id = i * 3 + j;
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