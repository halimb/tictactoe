const NT = "nonterminal";
const MAXI = 1;
const MINI = -1;
const TIE = 0;
var cells = [];

var n = 0;

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
	},

	getMoves: function(cells, player) {
		var res = [];
		for(var i = 0; i < cells.length; i++) {
			for(var j = 0; j < cells[i].length; j++) {
				if(cells[i][j] == 0) {
					var temp = cells.map(function(arr){
						return arr.slice();
					});
					temp[i][j] = player;
					res.push(temp);
				}
			}
		}
		return res;
	}
}

function Board(cells, player) {
	this.cells = cells;
	this.player = player;
	this.terminal = this.checkState(this.cells);
	this.possibleMoves = (this.terminal != NT)? 
			[] : this.getMoves(this.cells, player);
}

function minimax(board) {
	if(board.terminal != NT) {
		res = board.terminal;
		// if(res == TIE) {
		// 	res = board.player;
		// }
		return res;
	}
	else{
		var pl = board.player;
		var moves = board.possibleMoves;
		var next = (pl == MAXI) ? MINI : MAXI;
		var bestVal = (pl == MAXI) ? -1000 : 1000;
		var best = (pl == MAXI) ? Math.max : Math.min;
		for(var i = 0; i < moves.length; i++) {
			var newBoard = new Board(moves[i], pl);
			var mm = minimax(newBoard);
			bestVal = best(bestVal, mm);
		}
		return bestVal;
	}
}

function nextMove(board) {
	var	pl = board.player;
	var moves = board.possibleMoves;
	var values = [];
	var index;
	if(moves.length > 7) {
		index = Math.floor(Math.random() * 9);
	}
	else{
		console.log("\n\n");

		for(var i = 0; i < moves.length; i++) {
			var b = new Board(moves[i], pl);
			var mm = minimax(b);
			values.push(mm);
			console.log("minimax : " + mm +" for state : ");
			printBoard(moves[i]);
		}
		var best = (pl == MAXI) ? 
			Math.max(...values) : Math.min(...values);
		index = values.indexOf(best);
	}
	displayBoard(moves[index]);
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
			
			/*var cross = e.button;/*
			var active = e.button == 0 ? "cross" : "circle";
			var hidden = active == "cross" ? "circle" : "cross";
			
			var activeImg = document.getElementById(active + id);
			var hiddenImg = document.getElementById(hidden + id);
			
			activeImg.style.visibility = "visible"
			
			hiddenImg.style.visibility = "hidden"*/
			cells = updateBoard(cells, id, 1);
			// displayBoard(cells)
			// console.log(new Board(cells, -1).terminal)
			cells = nextMove( new Board(cells, -1));
		}

		else {
			console.log("the target isn't a cell !")
		}
	}
}

function updateBoard(cells, id, val) {
	cells[Math.floor(id / 3)][id % 3] = val;
	return cells;
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