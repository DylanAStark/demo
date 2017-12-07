let Player = (function(){

	let id = 'player',
		selector = $('#player'),
		index = 0,
		walkInterval = null,
		direction = 'down',
		animating = false,
		keysDown = 0,
		currentKey;

	const stepSpeed = 170,
		shiftSpeed = 100;

	let getIndexTemp = function (dir) {

		let i = index;

		if (dir === 'left') {
			i--;
		} else if (dir === 'right') {
			i++;
		} else if (dir === 'up') {
			i -= Game.getWidth();
		} else if (dir === 'down') {
			i += Game.getWidth();
		};

		return i;
	};

	let walk = function (dir) {

		if (Game.isPaused()) { return; }

		let indexTmp = getIndexTemp(dir);
		direction = dir;
		
		if (occupationCheck(indexTmp)) { return; };

		let x = getX(indexTmp),
			y = getY(indexTmp),
			map = Game.getMap();

		if ((dir === 'right' && x === 0) || ( dir === 'left' && x === (20 * (Game.getWidth() - 1))) 
		    || (map[indexTmp] === undefined) || (!Blocks[map[indexTmp]].canEnter)) {
			return;
		}

		index = indexTmp;
		animating = true;

		translate(x,y);
		Game.move(dir);

		setTimeout(function(){
			animating = false;
			let level = Game.getLevel();

			if (index === level.up || index === level.down) {
				let newLevel, dir;
				if (index === level.up) {
					newLevel = level.next;
					dir = 'up';
				} else if (index === level.down) {
					newLevel = level.previous;
					dir = 'down';
				}
				Game.build(newLevel, dir);
			}
		},shiftSpeed);
	};

	let interact = function () {

		if (animating) { return; }

		let indexTmp = getIndexTemp(direction),
			x = getX(indexTmp);

		if (( direction === 'right' && x === 0) || ( direction === 'left' && x === (20 * (Game.getWidth() - 1)))) { return; }

		for (let i = 0; i < activePeople.length; i++) {
			if (activePeople[i].index === indexTmp) {
				if (activePeople[i].friendly) {
					talk();
				} else {
					attack();
				}
			}
		}
	};

	let translate = function(x,y,z = 0) {
		selector.css({
				'-webkit-transform' : 'translate3d(' + x + 'px,' + y + 'px,' + z + 'px)',
				'-moz-transform'    : 'translate3d(' + x + 'px,' + y + 'px,' + z + 'px)',
				'-ms-transform'     : 'translate3d(' + x + 'px,' + y + 'px,' + z + 'px)',
				'-o-transform'      : 'translate3d(' + x + 'px,' + y + 'px,' + z + 'px)',
				'transform'         : 'translate3d(' + x + 'px,' + y + 'px,' + z + 'px)'
		});
	};

	let reset = function(){
		index = 0;
		translate(0,0);
	};

	let spawn = function(block){

		let level = Game.getLevel();

		if (block === "up") {
			index = level.down;
		} else if (block === "down") {
			index = level.up;
		} else {
			index = block;
		}

		let x = getX(index),
			y = getY(index);

		translate(x, y);

		Game.position(index);
	};

	let bindActions = function(){

		$(document).keydown(function(e){
			if( (e.which === 37 || e.which === 38 || e.which === 39 || e.which === 40) && currentKey !== e.which) {
				
				e.preventDefault();
				currentKey = e.which;
				keysDown++;
				clearInterval(walkInterval);

				let dir = '';
				if (e.which === 37) { dir = 'left'; } 
				else if (e.which === 38) { dir = 'up'; }
				else if (e.which === 39) { dir = 'right'; } 
				else if (e.which === 40) { dir = 'down'; }

				walk(dir);
				walkInterval = setInterval(function(){
					walk(dir);
				}, stepSpeed);
			};

			if (e.which === 32) {					
				e.preventDefault();
				interact();
			};
		});

		$(document).keyup(function(e){
			if (e.which === 37 || e.which === 38 || e.which === 39 || e.which === 40) {
				keysDown--;
				if (keysDown === 0) {
					clearInterval(walkInterval);
					currentKey = 0;
				}
			}
		});
	};

	let init = function(){
		bindActions();
	}

	return {
		id,
		init,
		reset,
		spawn
	};
	
})();

Player.init();