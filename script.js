const NT = "nonterminal";
const MAXI = 1;
const MINI = -1;
const TIE = 0;


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
			var found = true;
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
							if(cell != val) {
								return false;
							}
						}
						return true;
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
	this.terminal = this.checkState(cells);
	this.possibleMoves = (this.terminal != NT)? 
			[] : this.getMoves(cells, player);
}


/*
//TESTING
var cells = [   [1, 2, 5],
				[5, 1, 5],
				[5, 1, 2]   ];

var test = new Board(cells, 1);
console.log("Borad.terminal: ");
console.log(test.terminal);


for(var b = 0; b < 30; b++) {
	var grid = []
	for(var i = 0; i < 3; i++) {
		var row = []
		for(var j = 0; j < 3; j++) {
			var val = Math.round(Math.sin(2 * Math.random() * Math.PI));
			row.push(val);
		}
		grid.push(row);
	}
	var board = new Board(grid, 1);
	console.log("< <")
	printBoard(grid);
	console.log("Borad.terminal: ");
	console.log(board.terminal);
	console.log(" > > \n\n")

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
*/