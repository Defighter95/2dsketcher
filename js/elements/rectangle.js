/* ---- Quadratic Bizier curve class ---- */
function Rectangle(name = "Rectangle") {
	self = this;
	this.__proto__ = new ComponentAbstract();
	this.type = "rectangle";

	this.looped = false;
	this.cr = 0;

	this.timerId = 0;

	this.points = [
		{x: mousePosition.x, y: mousePosition.y},
		{x: mousePosition.x + cellSize, y: mousePosition.y + cellSize}
	];

	this.name = name + this.id;

	this.addPoint = function (point) {
		this.points.push(point);
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

		return $("<rect/>")
				.attr("x", (this.points[0].x < this.points[1].x) ? this.points[0].x : this.points[1].x)
				.attr("y", (this.points[0].y < this.points[1].y) ? this.points[0].y : this.points[1].y)
				.attr("width", Math.abs(this.points[1].x - this.points[0].x))
				.attr("height", Math.abs(this.points[1].y - this.points[0].y))
				.attr("rx", this.cr)
				.attr("ry", this.cr)
				.attr("stroke", "black")
				.attr("stroke-width", this.strokeWidth)
				.attr("fill", (this.looped) ? "white" : "transparent")
				.attr("class", "svg-element")
				.attr("data-id", this.id)
				.attr("data-class", "Rectangle");
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
		point = {x: data.PositionX, y: data.PositionY}
		this.addPoint(point);
	}

	this.getPreparedAttributesMenu = function () {
		let menuStruct = [];

		let groupFields = [{type: "text", name: "Name", val: this.name}];
		groupFields.push({type: "number", name: "Cr", label: "Curve Radius", val: this.cr  / mainSvgContainer.scaleFactor * mainSvgContainer.gridSizeScaleFactor});

		menuStruct.push({groupName: "General", fields: groupFields, groupLabels: []});

		groupFields = [];
		for (let i = 0; i < this.points.length; i++) {
			let point = {type: "XYPoint", val: [
					(this.points[i].x + mainSvgContainer.globalX) / mainSvgContainer.scaleFactor * mainSvgContainer.gridSizeScaleFactor,
					((svgHeight - this.points[i].y) + mainSvgContainer.globalY) / mainSvgContainer.scaleFactor * mainSvgContainer.gridSizeScaleFactor
				]};
			switch (i) {
				case 0:
					point.name = "A";
					break;
				case 1:
					point.name = "B";
					break;
			}

			point.index = i;

			groupFields.push(point);
		}

		menuStruct.push({groupName: "Points", fields: groupFields, groupLabels: ["X", "Y"]});

		return menuStruct;
	}

	this.isDeletablePoint = function (index) {

		if (this.points.length > 2) {
			return true;
		} else {
			return false;
		}
	}

	this.scale = function (scaleFactor) {
		let basePoint = this.points[0];

		if (scaleFactor < 1) {
			this.move({x: -basePoint.x / 2, y: (svgHeight - basePoint.y) / 2});
		} else {
			this.move({x: basePoint.x, y: -(svgHeight - basePoint.y)});
		}

		for (let i = 1; i < this.points.length; i++) {
			let point = this.points[i];

			point.x += (point.x - basePoint.x) * (scaleFactor - 1);
			point.y += (point.y - basePoint.y) * (scaleFactor - 1);
		}
	};

	this.toJqSVG = function () {
		let rect = jqSvg.rect(null, this.points[0].x, this.points[0].y, Math.abs(this.points[0].x - this.points[1].x), Math.abs(this.points[0].y - this.points[1].y), this.cr, this.cr, null);

		return rect;
	};

	this.getLength = function () {
		return 2 * (Math.abs(this.points[0].x - this.points[1].x) + Math.abs(this.points[0].y - this.points[1].y)) / mainSvgContainer.scaleFactor * mainSvgContainer.gridSizeScaleFactor;
	};

	this.getAbsolutePosition = function () {
		return {
			x: parseInt((this.points[0].x + mainSvgContainer.globalX) + this.getAABB().width / 2),
			y: parseInt(((svgHeight - this.points[0].y) + mainSvgContainer.globalY) - this.getAABB().height / 2)
		};
	}

	this.copy = function () {
		let copy = new Rectangle();
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
			};
		}

		return copy;
	};

	this.showAnimation = function (step = 0.25) {

		if (sketch.useCircularInterpolation) {
			step = 0.05;
		}

		//let lastPointIndex = 3;
		let line = [];
		line.push($('<line/>')
				.attr('class', 'anim-element')
				.attr('data-role', 'active-anim-element')
				.attr('fill', "none")
				.attr('stroke', "red")
				.attr('stroke-width', "3")
				.attr('x1', Math.min(this.points[0].x, this.points[1].x) + +this.cr)
				.attr('y1', Math.min(this.points[0].y, this.points[1].y))
				.attr('x2', Math.max(this.points[0].x, this.points[1].x) - +this.cr)
				.attr('y2', Math.min(this.points[0].y, this.points[1].y)));

		line.push($('<line/>')
				.attr('class', 'anim-element')
				.attr('data-role', 'active-anim-element')
				.attr('fill', "none")
				.attr('stroke', "red")
				.attr('stroke-width', "3")
				.attr('x1', Math.max(this.points[0].x, this.points[1].x))
				.attr('y1', Math.min(this.points[0].y, this.points[1].y) + +this.cr)
				.attr('x2', Math.max(this.points[0].x, this.points[1].x))
				.attr('y2', Math.max(this.points[0].y, this.points[1].y) - +this.cr));

		line.push($('<line/>')
				.attr('class', 'anim-element')
				.attr('data-role', 'active-anim-element')
				.attr('fill', "none")
				.attr('stroke', "red")
				.attr('stroke-width', "3")
				.attr('x1', Math.max(this.points[0].x, this.points[1].x) - +this.cr)
				.attr('y1', Math.max(this.points[0].y, this.points[1].y))
				.attr('x2', Math.min(this.points[0].x, this.points[1].x) + +this.cr)
				.attr('y2', Math.max(this.points[0].y, this.points[1].y)));

		line.push($('<line/>')
				.attr('class', 'anim-element')
				.attr('data-role', 'active-anim-element')
				.attr('fill', "none")
				.attr('stroke', "red")
				.attr('stroke-width', "3")
				.attr('x1', Math.min(this.points[0].x, this.points[1].x))
				.attr('y1', Math.max(this.points[0].y, this.points[1].y) - +this.cr)
				.attr('x2', Math.min(this.points[0].x, this.points[1].x))
				.attr('y2', Math.min(this.points[0].y, this.points[1].y) + +this.cr));

		let t = 0;
		let p = {x: 0, y: 0};

		let sideNumber = 0;

		let startAngel = Math.PI;

		function animStep(id, self) {

			if ((sideNumber % 2)) {
				if ($('[data-role="active-anim-element"][data-side-number="' + sideNumber + '"][data-elem-id=' + id + ']').length === 0) {
					let polyline = $('<polyline/>')
							.attr('class', 'anim-element')
							.attr('data-role', 'active-anim-element')
							.attr('data-side-number', sideNumber)
							.attr('data-elem-id', id)
							.attr('fill', "none")
							.attr('stroke', "red")
							.attr('stroke-width', "3")
							.attr('points', '');

					$("#svg").append(polyline);
				}



				switch (sideNumber) {
					case 1:
						p.x = (Math.sin(startAngel - Math.PI * t) * self.cr + (Math.max(self.points[0].x, self.points[1].x) - +self.cr));
						p.y = (Math.cos(startAngel - Math.PI * t) * self.cr + (Math.min(self.points[0].y, self.points[1].y) + +self.cr));
						break;
					case 3:
						p.x = (Math.sin(startAngel - Math.PI * t) * self.cr + (Math.max(self.points[0].x, self.points[1].x) - +self.cr));
						p.y = (Math.cos(startAngel - Math.PI * t) * self.cr + (Math.max(self.points[0].y, self.points[1].y) - +self.cr));
						break;
					case 5:
						p.x = (Math.sin(startAngel - Math.PI * t) * self.cr + (Math.min(self.points[0].x, self.points[1].x) + +self.cr));
						p.y = (Math.cos(startAngel - Math.PI * t) * self.cr + (Math.max(self.points[0].y, self.points[1].y) - +self.cr));
						break;
					case 7:
						p.x = (Math.sin(startAngel - Math.PI * t) * self.cr + (Math.min(self.points[0].x, self.points[1].x) + +self.cr));
						p.y = (Math.cos(startAngel - Math.PI * t) * self.cr + (Math.min(self.points[0].y, self.points[1].y) + +self.cr));
						break;

				}

				let sPoints = $('[data-role="active-anim-element"][data-side-number="' + sideNumber + '"][data-elem-id=' + id + ']').attr("points");

				$('[data-role="active-anim-element"][data-side-number="' + sideNumber + '"][data-elem-id=' + id + ']').attr("points", sPoints + " " + p.x + "," + p.y);
			} else {
				$("#svg").append(line[Math.trunc(sideNumber / 2)]);
				t = Math.PI;
			}

			$("#svg").html($("#svg").html());


			if ((Math.PI * t) >= (Math.PI / 2)) {
				sideNumber++;
				t = 0;

				if (sideNumber > 7) {
					$("#svg").append($("<animend/>").attr("data-elem-id", id));
					$("#svg").html($("#svg").html());

					clearInterval(timerId);
				} else {
					switch (sideNumber) {
						case 3:
							startAngel = Math.PI / 2;
							break;
						case 5:
							startAngel = 0;
							break;
						case 7:
							startAngel = -Math.PI / 2;
							break;
					}

				}
			} else {
				if (Math.PI * (t + step) <= (Math.PI / 2)) {
					t += step;
				} else {
					t = (1 / 2);
				}
			}

		}

		let id = this.id;
		let self = this;

		let timerId =
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

	this.getCommandsCount = function () {

		if (this.cr) {
			
			if (!sketch.useCircularInterpolation) {
				return 6 + (2 * parseInt(1 / sketch.interpolationStep));
			} else {
				return 6 + 2 * 4;
			}
		} else {
			return 6;
		}
}

}
/* ------------------------------------- */