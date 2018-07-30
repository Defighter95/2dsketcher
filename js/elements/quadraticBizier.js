/* ---- Quadratic Bizier curve class ---- */
function QuadraticBizier(name = "QuadraticBizier") {
	self = this;
	this.__proto__ = new ComponentAbstract();
	this.type = "qBizier";

	this.looped = false;

	this.points = [
		{x: mousePosition.x - cellSize, y: mousePosition.y},
		{x: mousePosition.x + cellSize, y: mousePosition.y},
		{x: mousePosition.x, y: mousePosition.y - cellSize}
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

		if (this.looped) {
			additionalPoints = "T";
		}

		if (this.points.length > 3) {
			if (!this.looped) {
				additionalPoints = "T";
			}
			for (let i = 3; i < this.points.length; i++) {
				additionalPoints += " " + points[i].x + " " + points[i].y;
			}
		}

		if (this.looped) {
			additionalPoints += " " + this.points[0].x + " " + this.points[0].y;
		}

		return $("<path/>").attr("d", "M" + points[0].x + " " + points[0].y + " Q " + points[2].x + " " + points[2].y + " " + points[1].x + " " + points[1].y + additionalPoints)
				.attr("stroke", "black")
				.attr("stroke-width", this.strokeWidth)
				.attr("fill", (this.looped) ? "white" : "transparent")
				.attr("class", "svg-element")
				.attr("data-id", this.id)
				.attr("data-class", "QuadraticBizier");
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

		componentElements.push(
				$('<polyline/>')
				.attr('class', 'active-component-element')
				.attr('data-role', 'curve-polyline')
				.attr('data-component-id', this.id)
				.attr('fill', "none")
				.attr('stroke', "black")
				.attr("stroke-dasharray", "6, 3")
				.attr('points', this.points[0].x + "," + this.points[0].y + " " + this.points[2].x + "," + this.points[2].y + " " + this.points[1].x + "," + this.points[1].y),
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

			switch (i) {
				case 0:
					point.name = __("Start");
					break;
				case 1:
					point.name = __("End");
					break;
				case 2:
					point.name = __("Control");
					break;
				default:
					point.name = __("Additional #") + (i - 2);
					point.deletable = true;
					break;
			}

			point.index = i;

			groupFields.push(point);
		}

		menuStruct.push({groupName: "Points", fields: groupFields, groupLabels: ["X", "Y"]});

		return menuStruct;
	}

	this.getAbsolutePosition = function () {
		return {
			x: parseInt((this.points[0].x + mainSvgContainer.globalX) + (this.getAABB().width / 2)),
			y: parseInt(((svgHeight - this.points[0].y) + mainSvgContainer.globalY) - (this.getAABB().height / 2))
		};
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
		let path = jqSvg.createPath();

		let obj = path.move(this.points[0].x, this.points[0].y).curveQ(this.points[2].x, this.points[2].y, this.points[1].x, this.points[1].y);

		for (let i = 3; i < this.points.length; i++) {
			obj.smoothQ(this.points[i].x, this.points[i].y)
		}

		return jqSvg.path(obj);
	}

	this.getLength = function () {
		return (this.toJqSVG().getTotalLength() / mainSvgContainer.scaleFactor) * mainSvgContainer.gridSizeScaleFactor;
	}

	this.copy = function () {
		let copy = new QuadraticBizier();
		let AABB = this.getAABB();

		let offsetX = getRandomArbitrary(-20, 20);
		let offsetY = getRandomArbitrary(-20, 20);

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
		let p2 = {x: this.points[2].x, y: this.points[2].y};
		let p3 = {x: this.points[1].x, y: this.points[1].y};

		let lastPointIndex = 2;
		var loopedPoint = (this.looped) ? false : true;

		let polyline = $('<polyline/>')
				.attr('class', 'anim-element')
				.attr('data-role', 'active-anim-element')
				.attr('fill', "none")
				.attr('stroke', "red")
				.attr('stroke-width', "3")
				.attr('data-elem-id', this.id)
				.attr('points', this.points[0].x + "," + this.points[0].y);

		$("#svg").append(polyline);

		let t = step;
		let p = {x: 0, y: 0};

		function animStep(id, self) {

			p.x = Math.pow(1 - t, 2) * p1.x + 2 * (1 - t) * t * p2.x + Math.pow(t, 2) * p3.x;
			p.y = Math.pow(1 - t, 2) * p1.y + 2 * (1 - t) * t * p2.y + Math.pow(t, 2) * p3.y;

			var sPoints = $('[data-role="active-anim-element"][data-elem-id=' + id + ']').attr("points");

			$('[data-role="active-anim-element"][data-elem-id=' + id + ']').attr("points", sPoints + " " + p.x + "," + p.y);

			$("#svg").html($("#svg").html());

			if (t >= 1) {
				lastPointIndex++;
				t = step;

				if (lastPointIndex > self.points.length - 1) {
					if (!loopedPoint) {
						loopedPoint = true;
						p1 = p3;

						p2.x = p1.x + (p1.x - p2.x);
						p2.y = p1.y + (p1.y - p2.y);

						p3 = self.points[0];
					} else {
						$("#svg").append($("<animend/>").attr("data-elem-id", id));
						$("#svg").html($("#svg").html());

						clearInterval(timerId);
					}

				} else {
					p1 = p3;

					p2.x = p1.x + (p1.x - p2.x);
					p2.y = p1.y + (p1.y - p2.y);

					p3 = self.points[lastPointIndex];
				}
			} else {
				if ((t + step) <= 1) {
					t += step;
				} else {
					t = 1;
				}
			}

		}

		var id = this.id;
		var self = this;

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
	return 2 + parseInt(1 / sketch.interpolationStep) * ((this.looped)?(this.points.length - 1):(this.points.length - 2)) + 1;
}

}

/* ------------------------------------- */