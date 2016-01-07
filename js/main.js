(function($) {
'use strict';

$('main').hide();
$('a').click(function(e) {
    e.preventDefault();
});

// ------------------------
// Globals
// ------------------------
var turn = "white";

var INVALID = "x9";

function placePiece(square, color, piece) {
	var filename = "media/pieces/" + color + "_" + piece + ".svg";
	var image = "<img src=\"" + filename + "\"/>";	

	$("#" + square).addClass(piece);
	$("#" + square).removeClass("black");
	if (color == "black") {
		$("#" + square).addClass(color);
	}
	$("#" + square).removeClass("empty");
	$("#" + square).html(image);
}

function placeOthers() {
	var colors = [[1,"white"],[8,"black"]];
	var files = "abcdefgh";
	var names = ["rook","knight","bishop","queen","king",
							"bishop","knight","rook"];

	for (var i = 0; i < colors.length; i++) {
		for (var file = 0; file < files.length; file++) {
			placePiece(files[file] + colors[i][0], colors[i][1], names[file]);
		}
	}

}

function placePawns() {
	var colors = [[2,"white"],[7,"black"]];
	var files = "abcdefgh";

	for (var i = 0; i < colors.length; i++) {
		for (var file = 0; file < files.length; file++) {
			placePiece(files[file] + colors[i][0], colors[i][1], "pawn");
		}
	}
}

function initBoard () {
	var files = "abcdefgh";
	var tiles = "";
	
	var count = 0;
	for (var i = files.length; i > 0; i--) {
		tiles += "<div class=\"rank\" id=\"rank" + i + "\">"
		for (var j = 0; j < files.length; j++) {
			var tileColor = count % 2 == 0 ? "light" : "dark";
	
			tiles += "<div class=\"square " + tileColor + " empty\" id=\"" + files[j] + i + "\"></div>";
			
			count++;
		}
		tiles += "</div> \n";
		count++;
	}
	$('#board').append(tiles);
}

function removePiece(square) {
	if ($("#" + square).hasClass("empty"))
		return;
	$("#" + square).removeClass(getPiece(square));
	$("#" + square).removeClass("black");
	$("#" + square).html("");
	$("#" + square).addClass("empty");
}

function getPiece(square) {
	var pieces = ["pawn", "rook", "king", "queen", "knight", "bishop"];

	for (var i = 0; i < pieces.length; i++) {
		if ($("#" + square).hasClass(pieces[i])) {
			return pieces[i];
		}
	}

	return -1;

}

function getColor(square) {
	return $("#" + square).hasClass("empty") ? "empty" : (
		$("#" + square).hasClass("black") ? "black" : "white");
}

function file(square) {
	return square[0];
}

function rank(square) {
	return parseInt(square.slice(1,square.length));
}

function isLegalRook(newSquare, oldSquare) {
	return file(oldSquare) === file(newSquare) 
			|| rank(oldSquare) === rank(newSquare);
}

function xDistance(square1, square2) {
	var val = "abcdefgh".indexOf(file(square1)) - "abcdefgh".indexOf(file(square2));
	return val < 0 ? -val : val;
}

function yDistance(square1, square2) {
	var val = rank(square1) - rank(square2);
	return val < 0 ? -val : val;
}

function isLegalBishop(newSquare, oldSquare) {
	return xDistance(newSquare,oldSquare) == yDistance(newSquare,oldSquare) 
		&& file(oldSquare) != file(newSquare) 
		&& rank(oldSquare) != rank(newSquare);
}

function valid(square) {
	
	var retVal = ("abcdefgh".indexOf(file(square)) != -1 
		&& rank(square) >= 1 
		&& rank(square) <= 8) ? square : INVALID; 

	return retVal;
}

function up(square) {
	return valid(file(square) + (rank(square) + 1));
}

function down(square) {
	return valid(file(square) + (rank(square) - 1));
}

function left(square) {
	return valid(String.fromCharCode(file(square).charCodeAt(0) - 1) + rank(square));
}

function right(square) {
	return valid(String.fromCharCode(file(square).charCodeAt(0) + 1) + rank(square));

}
function isLegal(piece, newSquare, oldSquare) {
	var color = getColor(oldSquare);

	if (getColor(newSquare) == getColor(oldSquare))
		return false;

	
	if (piece == "pawn") {
		var fileOffset = color == "black" ? -1 : 1;
		var fileOffsetFirstMove = (rank(oldSquare) == 2 || rank(oldSquare) == 7 ? 2 : 1) * fileOffset;

		var retVal = true;
		retVal &= (rank(oldSquare) + fileOffset == rank(newSquare) ||
			rank(oldSquare) + fileOffsetFirstMove == rank(newSquare));
		retVal &= file(newSquare) == file(oldSquare);
		retVal &= getPiece(newSquare) == -1;
		
		var attackSquare = left(color == "black" ? down(oldSquare) : up(oldSquare)); 
		retVal |= getPiece(attackSquare) != -1 && newSquare == attackSquare;	
		var attackSquare = right(color == "black" ? down(oldSquare) : up(oldSquare)); 
		retVal |= getPiece(attackSquare) != -1 && newSquare == attackSquare;	
	
		return retVal; 
	} else if (piece == "rook") {
			return isLegalRook(newSquare, oldSquare);		
	} else if (piece == "knight") {
		var retVal = 
			newSquare == up(up(left(oldSquare)))
			|| newSquare == left(left(up(oldSquare)))
			|| newSquare == right(right(up(oldSquare)))
			|| newSquare == up(up(right(oldSquare)))
			|| newSquare == left(left(down(oldSquare)))
			|| newSquare == down(down(left(oldSquare)))
			|| newSquare == right(right(down(oldSquare)))
			|| newSquare == down(down(right(oldSquare)));
		return retVal;
	} else if (piece == "bishop") {
		return isLegalBishop(newSquare, oldSquare);
	} else if (piece == "queen") {
		return isLegalRook(newSquare, oldSquare) 
				|| isLegalBishop(newSquare, oldSquare);
	} else if (piece == "king") {
		var retVal =
			newSquare == up(oldSquare)
			|| newSquare == down(oldSquare)
			|| newSquare == left(oldSquare)
			|| newSquare == right(oldSquare)
			|| newSquare == up(left(oldSquare))
			|| newSquare == up(right(oldSquare))
			|| newSquare == down(right(oldSquare))
			|| newSquare == down(left(oldSquare));

		return retVal;
	} else {
		return false;
	}
}

function movePiece(newSquare, oldSquare) {
	if (newSquare == oldSquare)
		return false;

	var color = getColor(oldSquare); 
	var piece = getPiece(oldSquare);
	if (possibleMoves(oldSquare).indexOf(newSquare) == -1)
		return false;

	if (color == "white" && piece == "pawn" && rank(newSquare) == 8) {
		piece = "queen";
	}
	
	if (color == "black" && piece == "pawn" && rank(newSquare) == 1) {
		piece = "queen";
	}

	removePiece(oldSquare);
	removePiece(newSquare);

	placePiece(newSquare, color, piece);	
	
	return true;

}

function getSurrounding(square) {
	var around = [up(square), down(square), left(square), right(square),
			up(right(square)), up(left(square)), down(left(square)), down(right(square))];
	return around.filter(function (elem) { return elem != INVALID });
}

function possibleMovesHelper(trySquare, origSquare, visited, valid) {
	if (!(trySquare in visited)) {
		var piece = getPiece(origSquare);
		visited[trySquare] = true;
		if (isLegal(piece, trySquare, origSquare)
			&& getColor(origSquare) != getColor(trySquare)) {
			valid.push(trySquare);
		}

		if ((getColor(trySquare) == "black" && getColor(origSquare) == "white")
			|| (getColor(trySquare) == "white" && getColor(origSquare) == "black")) {
			return;
		}

		var square;
		var surrounding = getSurrounding(trySquare);
		for (square in surrounding) {
			if (piece == "knight" || 
				(isLegal(piece, surrounding[square], origSquare))
					&& getColor(origSquare) != getColor(surrounding[square])
					&& !(surrounding[square] in visited)) {

				if (piece == "queen") {
					if (!isLegal(piece,up(origSquare),origSquare))
						visited[up(up(origSquare))] = true;
					if (!isLegal(piece,left(origSquare),origSquare))
						visited[left(left(origSquare))] = true;
					if (!isLegal(piece,down(origSquare),origSquare))
						visited[down(down(origSquare))] = true;
					if (!isLegal(piece,right(origSquare),origSquare))
						visited[right(right(origSquare))] = true;
				}	
				possibleMovesHelper(surrounding[square], origSquare, visited, valid);
			}
		}
	}
}

function possibleMoves(square) {
	var valid = [];
	possibleMovesHelper(square,square,[],valid);
	return valid;
}

initBoard();

placePawns();
placeOthers();

var currSquare = "";
var highlighted = [];

$('.square').click(function(e) {
	var obj = e.currentTarget;
	if (currSquare == "" 
		|| (getColor(currSquare) == getColor(obj.id) && getColor(obj.id) != "empty")) {
		
		if (getColor(currSquare) == getColor(obj.id) && getColor(obj.id) != "empty") {
			$("#" + currSquare).removeClass("selected");
			for (var i = 0; i < highlighted.length; i++) {
				$("#" + highlighted[i]).removeClass("highlighted");
			}
			highlighted = [];

		}
		if (getPiece(obj.id) != -1 && getColor(obj.id) == turn) {
			currSquare = obj.id;
			$(this).addClass("selected");
			highlighted = possibleMoves(obj.id);
			console.log(highlighted);
			for (var i = 0; i < highlighted.length; i++) {
				$("#" + highlighted[i]).addClass("highlighted");
			}
		}
	} else {
			var newSquare = obj.id;
			var success = movePiece(newSquare, currSquare);
			currSquare = "";
			$(".selected").removeClass("selected");
			for (var i = 0; i < highlighted.length; i++) {
				$("#" + highlighted[i]).removeClass("highlighted");
			}
			highlighted = [];
			if (success)
				turn = turn == "white" ? "black" : "white";
	}
});


})(jQuery);
