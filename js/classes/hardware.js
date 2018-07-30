var Hardware = function() {
	
	this.deviceId = 1;
	
	this.dreelNumber = 1;
	this.dreelSize = 5;
		
	this.rotation = 1; // 1 - clockwise, 2 - anti-clockwise
	this.speed = 1000;
	
	this.coolantSupply = false;
	
	this.loadFromObject = function (obj) {
		this.deviceId = obj.deviceId;

		this.dreelNumber = obj.dreelNumber;
		this.dreelSize = obj.dreelSize;

		this.rotation = obj.rotation;

		this.speed = obj.speed;

		this.coolantSupply = obj.coolantSupply;
}
}


