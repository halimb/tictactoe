
function Board(cells) {
	this.cells = cells;;
	this.len = this.cells.length;

	/*checks for diagonal lines, 
	  if (fwd) checks for forward diagonal line, 
	  else, checks for backwards diagonal */
	this.checkDiagonal = function(fwd, value) {
		var tempCells = fwd ? 
			this.cells.slice().reverse() : this.cells;
		for(var i = 0; i < this.len; i++) {
			if(tempCells[i][i] != value) {
				return false;;
			}
		}
		return true;
	}

	//ckecks for orthogonal lines (vertical or horizontal)
	this.checkOrthogonal = function(pos, value, vertical) {
		for(var i = 0; i < this.len; i++) {
			var cell = vertical ? 
				this.cells[i][pos] :
				this.cells[pos][i]
			if(cell != value) {
				return false;
			}
		}
		return true;
	}

	/* scans the whole board for any kind of line.
	   returns an object representing the first line 
	   if any, or false if none */ 
	this.checkLine = function(value) {
		var res = {};
		res.value = value;
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
		for(var i = 0; i < this.len; i++){
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
		return false;
	}
}

var cells = [   
				[3, 1, 3, 1, 2, 3],
				[1, 3, 3, 1, 3, 3],
				[0, 0, 0, 0, 0, 0],
				[3, 0, 0, 3, 2, 0],
				[3, 0, 3, 1, 3, 3],
				[3, 1, 3, 1, 2, 3],];

var test = new Board(cells);

console.log(test.checkLine(3));