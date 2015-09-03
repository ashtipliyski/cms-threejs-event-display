document.mouseDown = 0;

document.onmouseup = function() {
	if (document.mouseDown > 0) {
		--document.mouseDown;
	}
};

