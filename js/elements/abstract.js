/* ---- Base Component class ---- */
function ComponentAbstract() {
	this.strokeWidth = 2;

	this.generateId = function () {
		let id = 0;

		do {
			id = getRandomArbitrary(1, 10000);
		} while (generatedIds.indexOf(id) !== -1);

		generatedIds.push(id);
		return id;
	}

	this.id = this.generateId();
	this.points = [];
	this.name = "BaseComponentName";

	this.getAABB = function () {
		return $('.svg-element[data-id=' + this.id + ']')[0].getBoundingClientRect();
	}

	this.getSquare = function () {
		let AABB = this.getAABB();
		return (AABB.width * AABB.height / Math.pow(mainSvgContainer.scaleFactor, 2)) * Math.pow(mainSvgContainer.gridSizeScaleFactor, 2);
	}

	this.getEstimatedTime = function () {
		return this.getLength() / (hardware.speed / 60) + this.getCommandsCount() * 2;
	}

	this.getPrice = function () {
		return this.getSquare() / 1000000 * sketch.getMaterialCost() * sketch.materialDeep + this.getCommandsCount() * 0.05 + (this.getEstimatedTime() / 60) * 2.5;		
	}

	/*  Abstract methods  */
	this.returnSvg = function () {
		console.error('You nedd to override this method in child class!')
	};

	this.addPoint = function () {
		console.error('You nedd to override this method in child class!')
	};

	this.removePoint = function () {
		console.error('You nedd to override this method in child class!')
	};

	this.isDeletablePoint = function () {
		console.error('You nedd to override this method in child class!')
	};

	this.returnActiveComponentElements = function () {
		console.error('You nedd to override this method in child class!')
	};

	this.move = function () {
		console.error('You nedd to override this method in child class!')
	};

	this.scale = function () {
		console.error('You nedd to override this method in child class!')
	};

	this.movePoint = function () {
		console.error('You nedd to override this method in child class!')
	};

	this.onShiftedClick = function () {
		console.error('You nedd to override this method in child class!')
	};

	this.getPreparedAttributesMenu = function () {
		console.error('You nedd to override this method in child class!')
	};

	this.toJqSVG = function () {
		console.error('You nedd to override this method in child class!')
	};

	this.getLength = function () {
		console.error('You nedd to override this method in child class!')
	};
	
	this.getCommandsCount = function () {
		console.error('You nedd to override this method in child class!')
	};
	
	this.showAnimation = function () {
		console.error('You nedd to override this method in child class!')
	};
	
	this.stopAnimation = function () {
		console.error('You nedd to override this method in child class!')
	};
	
	this.copy = function () {
		console.error('You nedd to override this method in child class!')
	};

	/*  End of Abstract methods  */

}
/* ------------------------------ */