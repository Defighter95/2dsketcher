/* ---- Quadratic Bizier curve class ---- */
function PolyLine(name = "PolyLine") {
	self = this;
	this.__proto__ = new ComponentAbstract();
	this.type = "pLine";

	this.looped = false;

	this.points = [
		{x: mousePosition.x - cellSize, y: mousePosition.y},
		{x: mousePosition.x + cellSize, y: mousePosition.y}
	];

	this.name = name + this.id;

	this.addPoint = function (point) {
		historicStack.add();

		this.points.push(point);
	}

	this.removePoint = function (index) {
		historicStack.add();

		this.points.splice(index, 1);
	}

	this.returnSvg = function () {
		let points = this.points;
		let additionalPoints = "";

		if (this.points.length > 2) {

			for (let i = 2; i < this.points.length; i++) {
				additionalPoints += " " + points[i].x + "," + points[i].y;
			}
		}

		if (this.looped) {
			additionalPoints += " " + this.points[0].x + "," + this.points[0].y;
		}

		return $("<polyline/>").attr("points", points[0].x + "," + points[0].y + " " + points[1].x + "," + points[1].y + additionalPoints)
				.attr("stroke", "black")
				.attr("stroke-width", this.strokeWidth)
				.attr("fill", (this.looped) ? "white" : "transparent")
				.attr("class", "svg-element")
				.attr("data-id", this.id)
				.attr("data-class", "PolyLine");
	};

	this.returnActiveComponentElements = function () {
		let componentElements = [];
		for (let i = 0; i < this.points.length; i++) {
			componentElements.push(
					$('<circle/>')
					.attr('class', 'active-component-element')
					.attr('data-role', 'curve-point')
					.attr('data-index', i)
					.attr('data-component-id', this.id)
					.attr('cx', this.points[i].x)
					.attr('cy', this.points[i].y)
					.attr('r', pointsRadius)
					.attr('fill', "black")
					);
		}		

		return componentElements;
	}

	this.move = function (positionDelta = null) {

		let mouseDelta = {
			x: mousePosition.x - oldMousePosition.x,
			y: mousePosition.y - oldMousePosition.y
		}

		if (positionDelta) {
			mouseDelta = {
				x: positionDelta.x,
				y: positionDelta.y
			}
		}

		for (let i = 0; i < this.points.length; i++) {
			this.points[i].x = +this.points[i].x + mouseDelta.x;
			this.points[i].y = +this.points[i].y + mouseDelta.y;
		}
	}

	this.movePoint = function (index, newPosition) {

		this.points[index].x = newPosition.x;
		this.points[index].y = newPosition.y;
	}

	this.onShiftedClick = function (data) {
		point = {x: data.PositionX, y: data.PositionY};
		this.addPoint(point);

	}

	this.getPreparedAttributesMenu = function () {
		let menuStruct = [];

		let groupFields = [];
		groupFields.push({type: "text", name: "Name", val: this.name});
		groupFields.push({type: "bool", name: "Looped", val: this.looped});

		menuStruct.push({groupName: "General", fields: groupFields, groupLabels: []});

		groupFields = [];
		for (let i = 0; i < this.points.length; i++) {
			let point = {
				type: "XYPoint",
				val: [
					(this.points[i].x + mainSvgContainer.globalX) / mainSvgContainer.scaleFactor * mainSvgContainer.gridSizeScaleFactor,
					((svgHeight - this.points[i].y) + mainSvgContainer.globalY) / mainSvgContainer.scaleFactor * mainSvgContainer.gridSizeScaleFactor
				]};

			point.name = __("Point #") + (i + 1);

			if (this.points.length > 2) {
				point.deletable = true;
			}

			point.index = i;

			groupFields.push(point);
		}

		menuStruct.push({groupName: "Points", fields: groupFields, groupLabels: ["X", "Y"]});

		return menuStruct;
	}

	this.getAbsolutePosition = function () {
		return {
			x: parseInt((this.points[0].x + mainSvgContainer.globalX) + this.getAABB().width / 2),
			y: parseInt(((svgHeight - this.points[0].y) + mainSvgContainer.globalY) - this.getAABB().height / 2)
		};
	}

	this.isDeletablePoint = function () {

		if (this.points.length > 2) {
			return true;
		} else {
			return false;
		}
	}

	this.scale = function (scaleFactor) {
		let basePoint = this.points[0];
		if (scaleFactor < 1) {
			this.move({x: -basePoint.x / 2, y: (svgHeight - basePoint.y) / 2})
		} else {
			this.move({x: basePoint.x, y: -(svgHeight - basePoint.y)})
		}

		for (let i = 1; i < this.points.length; i++) {
			let point = this.points[i];
			point.x += (point.x - basePoint.x) * (scaleFactor - 1);
			point.y += (point.y - basePoint.y) * (scaleFactor - 1);
		}
	}

	this.toJqSVG = function () {
		var points = [];

		for (let i = 0; i < this.points.length; i++) {
			points[i] = [];
			points[i][0] = this.points[i].x;
			points[i][1] = this.points[i].y;
		}

		let polyline = jqSvg.polyline(null, points, null);
		
		return polyline;
	}

	this.getLength = function () {
		var bufferLength = 0;

		for (let i = 1; i < this.points.length; i++) {
			bufferLength += Math.sqrt(Math.pow(this.points[i - 1].x - this.points[i].x, 2) + Math.pow(this.points[i - 1].y - this.points[i].y, 2));
		}

		return bufferLength / mainSvgContainer.scaleFactor * mainSvgContainer.gridSizeScaleFactor;
	}

	this.copy = function () {
		let copy = new PolyLine();
		let AABB = this.getAABB();

		let offsetX = getRandomArbitrary(-50, 50);
		let offsetY = getRandomArbitrary(-50, 50);

		if (offsetX >= 0) {
			offsetX += AABB.width;
		} else {
			offsetX -= AABB.width;
		}

		if (offsetY >= 0) {
			offsetY += AABB.width;
		} else {
			offsetY -= AABB.width;
		}

		for (let i = 0; i < this.points.length; i++) {
			copy.points[i] = {
				x: this.points[i].x + offsetX,
				y: this.points[i].y + offsetY
			}
		}

		return copy;
	}

	this.showAnimation = function (step = 0.05) {

		let p1 = {x: this.points[0].x, y: this.points[0].y};
		let p2 = {x: this.points[1].x, y: this.points[1].y};

		let lastPointIndex = 1;
		var loopedPoint = (this.looped) ? false : true;

		let polyline = $('<polyline/>')
				.attr('class', 'anim-element')
				.attr('data-role', 'active-anim-element')
				.attr('fill', "none")
				.attr('stroke', "red")
				.attr('stroke-width', "3")
				.attr('data-elem-id', this.id)
				.attr('points', p1.x + "," + p1.y);

		$("#svg").append(polyline);

		let p = {x: 0, y: 0};

		function animStep(id, self) {

			var sPoints = $('[data-role="active-anim-element"][data-elem-id=' + id + ']').attr("points");

			$('[data-role="active-anim-element"][data-elem-id=' + id + ']').attr("points", sPoints + " " + p2.x + "," + p2.y);

			$("#svg").html($("#svg").html());


			lastPointIndex++;
			t = step;

			if (lastPointIndex > self.points.length - 1) {
				if (!loopedPoint) {
					loopedPoint = true;
					p1 = p2;
					p2 = self.points[0];
				} else {
					$("#svg").append($("<animend/>").attr("data-elem-id", id));
					$("#svg").html($("#svg").html());

					clearInterval(timerId);
				}
			} else {
				p1 = p2;
				p2 = self.points[lastPointIndex];
			}
		}

		let id = this.id;
		let self = this;

		var timerId =
				setInterval(function () {
					animStep(id, self);
				}, 1000);

		this.timerId = timerId;
	}

	this.stopAnimation = function () {
		if (this.timerId) {
			clearInterval(this.timerId);
		}
}

this.getCommandsCount = function() {
	return 2 + ((this.looped)?(this.points.length + 1):(this.points.length));
}

}

/* ------------------------------------- */