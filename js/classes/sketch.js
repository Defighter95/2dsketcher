function Sketch(name = "2D Sketch") {
	this.name = name;

	this.interpolationStep = 0.05;
	this.materialDeep = 1;

	this.useWorkCoords = false;
	this.workCoords = {x: 0, y: 0};

	this.toInch = false;
	this.compDeviceLength = false;

	this.useCircularInterpolation = true;
	this.useChoosedStop = false;

	this.material = 1; // 1 - wood, 2 - list metal

	this._commandsCount = 10;

	this.getPrice = function () {
		let totalPrice = 0;

		mainSvgContainer.elements.forEach(function (e) {
			totalPrice += e.getCommandsCount() * 0.05 + (e.getEstimatedTime() / 60) * 2.5;
		});

		return totalPrice + this._commandsCount * 0.1;
	}

	this.getMaterialCost = function () {
		let materialCost = 0.0;

		switch (sketch.material) {
			case 1: // glass
				materialCost = 204.90;
				break;
			case 2: // wood
				materialCost = 147.00;
				break;
			case 3: // plastic
				materialCost = 328.90;
				break;
			case 4: // aluminium
				materialCost = 45.90;
				break;
			case 5: // steel
				materialCost = 175.15;
				break;
			case 6: // brass
				materialCost = 0.00;
				break;
		}

		return materialCost;
	}

	this.getCommandsCount = function () {
		return this._commandsCount;
	}

	this.loadFromObject = function (obj) {
		this.name = obj.name;

		this.interpolationStep = obj.interpolationStep;
		this.materialDeep = obj.materialDeep;

		this.useWorkCoords = obj.useWorkCoords;

		this.workCoords.x = obj.x;
		this.workCoords.y = obj.y;

		this.toInch = obj.toInch;
		this.compDeviceLength = obj.compDeviceLength;

		this.useCircularInterpolation = obj.useCircularInterpolation;

		this.material = obj.material;
}
}


