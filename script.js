
Board.prototype = {
	players: [1, 2, 5]
}

function Board(cells, player) {
	this.cells = cells;
	this.player = player;

	/* scan the whole board for any kind of line,
	   return an object representing the first line 
	   if any, or false if none */ 
	this.checkLine = function() {

		/*check for diagonal lines, 
		  if (fwd) check for forward diagonal line, 
		  else, check for backwards diagonal */
		this.checkDiagonal = function(fwd, val) {
			var tempCells = fwd ? 
				this.cells.slice().reverse() : this.cells;
			for(var i = 0; i < this.cells.length; i++) {
				if(tempCells[i][i] != val) {
					return false;
				}
			}
			this.terminal = true;
			return true;
		}

		//ckeck for orthogonal lines (vertical or horizontal)
		this.checkOrthogonal = function(pos, val, vertical) {
			for(var i = 0; i < this.cells.length; i++) {
				var cell = vertical ? 
					this.cells[i][pos] :
					this.cells[pos][i]
				if(cell != val) {
					return false;
				}
			}
			this.terminal = true;
			return true;
		}

		//loop through players and chek for a win
		for(var j = 0; j < this.players.length; j++) {
			var res = {};
			var value = this.players[j];
			res.win = (value == this.player);

			//Diagonals
			if(this.checkDiagonal(1, value)) {
				res.orientation = "diagonal";
				res.position = 1;
				return res;
			}
			if(this.checkDiagonal(0, value)) {
				res.orientation = "diagonal";
				res.position = 0;
				return res;
			}

			//Orthogonals
			for(var i = 0; i < this.cells.length; i++){
				//Vertical
				if(this.checkOrthogonal(i, value, true)) {
					res.orientation = "vertical";
					res.position = i;
					return res;
				}
				//Horizontal
				if(this.checkOrthogonal(i, value, false)) {
					res.orientation = "horizontal";
					res.position = i;
					return res;
				}
			}
		}
		//return false if no line was found
		return false;
	}
	this.terminal = this.checkLine();
}

var cells = [   [1, 0, 0],
				[1, 1, 1],
				[0, 2, 2]   ];

var test = new Board(cells, 2);
console.log("Borad.terminal: ");
console.log(test.terminal);