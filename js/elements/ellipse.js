/* ---- Quadratic Bizier curve class ---- */
function Ellipse(name = "Ellipse") {
	self = this;
	this.__proto__ = new ComponentAbstract();
	this.type = "ellipse";

	this.points = [
		{x: mousePosition.x, y: mousePosition.y},
		{x: mousePosition.x - cellSize * 2, y: mousePosition.y},
		{x: mousePosition.x, y: mousePosition.y - cellSize}
	];

	this.name = name + this.id;

	this.getXRadius = function () {
		return Math.sqrt(Math.pow(this.points[1].x - this.points[0].x, 2));
	};

	this.getYRadius = function () {
		return Math.sqrt(Math.pow(this.points[2].y - this.points[0].y, 2));
	};

	this.addPoint = function (point) {
		// it's not possible to add point to this element
	}

	this.removePoint = function (index) {
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

		return $("<ellipse/>")
				.attr("cx", this.points[0].x)
				.attr("cy", this.points[0].y)
				.attr("rx", this.getXRadius())
				.attr("ry", this.getYRadius())
				.attr("stroke", "black")
				.attr("stroke-width", this.strokeWidth)
				.attr("fill", (this.looped) ? "white" : "transparent")
				.attr("class", "svg-element")
				.attr("data-id", this.id)
				.attr("data-class", "Ellipse");
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
		;

		componentElements.push(
				$('<line/>')
				.attr("x1", this.points[0].x)
				.attr("y1", this.points[0].y)
				.attr("x2", this.points[1].x)
				.attr("y2", this.points[0].y)
				.attr('stroke', "black")
				.attr("stroke-dasharray", "6, 3")
				.attr("class", "active-component-element")
				.attr("data-component-id", this.id)
				);

		componentElements.push(
				$('<line/>')
				.attr("x1", this.points[0].x)
				.attr("y1", this.points[0].y)
				.attr("x2", this.points[0].x)
				.attr("y2", this.points[2].y)
				.attr('stroke', "black")
				.attr("stroke-dasharray", "6, 3")
				.attr("class", "active-component-element")
				.attr("data-component-id", this.id)
				);		

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
		// Y raduis point
		if (index !== 2) {
			this.points[index].x = newPosition.x;
		}
		// X raduis point
		if (index !== 1) {
			this.points[index].y = newPosition.y;
		}

		if (index === 0) {
			this.points[2].x = newPosition.x;
			this.points[1].y = newPosition.y;
		}

	}

	this.onShiftedClick = function (data) {
		point = {x: data.PositionX, y: data.PositionY}
		this.addPoint(point);
	}

	this.getPreparedAttributesMenu = function () {
		let menuStruct = [];

		let groupFields = [{type: "text", name: "Name", val: this.name}];

		menuStruct.push({groupName: "General", fields: groupFields, groupLabels: []});

		groupFields = [];
		for (let i = 0; i < this.points.length; i++) {
			let point = {type: "XYPoint", val: [
					(this.points[i].x + mainSvgContainer.globalX) / mainSvgContainer.scaleFactor * mainSvgContainer.gridSizeScaleFactor,
					((svgHeight - this.points[i].y) + mainSvgContainer.globalY) / mainSvgContainer.scaleFactor * mainSvgContainer.gridSizeScaleFactor
				]};
			switch (i) {
				case 0:
					point.name = __("Center");
					break;
				case 1:
					point.name = __("X Radius Control");
					break;
				case 2:
					point.name = __("Y Radius Control");
					break;
			}

			point.index = i;

			groupFields.push(point);
		}

		menuStruct.push({groupName: "Points", fields: groupFields, groupLabels: ["X", "Y"]});

		return menuStruct;
	}

	this.isDeletablePoint = function (index) {

		if (index > 2) {
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
		let ellipse = jqSvg.ellipse(null, this.points[0].x, this.points[0].y, this.getXRadius(), this.getYRadius(), null);

		return ellipse;
	}

	this.getLength = function () {
		return (Math.PI * (this.getXRadius() + this.getYRadius()) / mainSvgContainer.scaleFactor) * mainSvgContainer.gridSizeScaleFactor;
	}

	this.getAbsolutePosition = function () {
		return {
			x: parseInt((this.points[0].x + mainSvgContainer.globalX) + this.getAABB().width / 2),
			y: parseInt(((svgHeight - this.points[0].y) + mainSvgContainer.globalY) - this.getAABB().height / 2)
		};
	}

	this.copy = function () {
		let copy = new Ellipse();
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

		let polyline = $('<polyline/>')
				.attr('class', 'anim-element')
				.attr('data-role', 'active-anim-element')
				.attr('fill', "none")
				.attr('stroke', "red")
				.attr('stroke-width', "3")
				.attr('data-elem-id', this.id)
				.attr('points', '');

		$("#svg").append(polyline);

		let t = 0;
		let p = {x: 0, y: 0};

		function animStep(id, self) {

			p.x = (Math.sin(Math.PI * t) * self.getXRadius() + p1.x);
			p.y = (Math.cos(Math.PI * t) * self.getYRadius() + p1.y);

			var sPoints = $('[data-role="active-anim-element"][data-elem-id=' + id + ']').attr("points");

			$('[data-role="active-anim-element"][data-elem-id=' + id + ']').attr("points", sPoints + " " + p.x + "," + p.y);

			$("#svg").html($("#svg").html());

			if (t >= 2) {
				$("#svg").append($("<animend/>").attr("data-elem-id", id));
				$("#svg").html($("#svg").html());

				clearInterval(timerId);
			} else {
				if ((t + step) <= 2) {
					t += step;
				} else {
					t = 2;
				}
			}

		}

		let id = this.id;
		let self = this;

		var timerId =
				setInterval(function () {
					animStep(id, self);
				}, 10000 * (step / 5));

		this.timerId = timerId;

	}

	this.stopAnimation = function () {
		if (this.timerId) {
			clearInterval(this.timerId);
		}
}

this.getCommandsCount = function() {
	return 2 + (2 * parseInt(1 / sketch.interpolationStep));
}

}
/* ------------------------------------- */