/* ---- Additional and helpers functions ---- */
function getRandomArbitrary(min, max) {
	return Math.trunc(Math.random() * (max - min) + min);
}

var pointsRadius = 5;
var generatedIds = [];

var jqSvg = null;

var debug = true;

var stopSimulate = false;

var translater = new Translater();
translater.setLanguage("Ukrainian");

var sketch = new Sketch();
var hardware = new Hardware();

function __(text) {
	if (translater.lngIndex == -1) {
		return text;
	}

	let phraseText = "";

	if (translater.phrases[text]) {
		phraseText = translater.phrases[text][translater.lngIndex];
	} else {
		phraseText = text;
	}

	return phraseText;
}

function log(msg) {
	if (debug) {
		console.log(msg);
	}
}

function getFormControlButtons(svgContainerForm = false) {
	if (!svgContainerForm) {
		return $("<div>").attr("class", "form-group row")
				.append($("<div>").attr("class", "col-sm-12")
						.append($("<button>").attr("class", "btn btn-secondary btn-sm form-save margined-button").html(" " + __("Save")).prepend($("<span>").addClass("oi").addClass("oi-check"))).append(" ")
						.append($("<button>").attr("class", "btn btn-secondary btn-sm form-restore margined-button").html(" " + __("Restore")).prepend($("<span>").addClass("oi").addClass("oi-chevron-left"))).append(" ")
						.append($("<button>").attr("class", "btn btn-secondary btn-sm form-copy margined-button").html(" " + __("Copy")).prepend($("<span>").addClass("oi").addClass("oi-fork"))).append(" ")
						.append($("<button>").attr("class", "btn btn-secondary btn-sm form-details margined-button").html(" " + __("Details")).prepend($("<span>").addClass("oi").addClass("oi-magnifying-glass"))).append(" ")
						.append($("<button>").attr("class", "btn btn-secondary btn-sm form-delete margined-button").html(" " + __("Delete")).prepend($("<span>").addClass("oi").addClass("oi-x"))).append(" ")
						);
	} else {
		return $("<div>").attr("class", "form-group row")
				.append($("<div>").attr("class", "col-sm-12")
						.append($("<button>").attr("class", "btn btn-secondary btn-sm form-save").html(" " + __("Save")).prepend($("<span>").addClass("oi").addClass("oi-check"))).append(" ")
						.append($("<button>").attr("class", "btn btn-secondary btn-sm form-restore").html(" " + __("Restore")).prepend($("<span>").addClass("oi").addClass("oi-chevron-left"))).append(" ")
						.append($("<button>").attr("class", "btn btn-secondary btn-sm form-details").html(" " + __("Details")).prepend($("<span>").addClass("oi").addClass("oi-magnifying-glass"))).append(" ")
						);
}

}

function BuildElementForm(form, svgContainerForm = false) {
	$('#active-element-form').css("display", "block");
	$('#active-element-form').html("");

	for (let i = 0; i < form.length; i++) {
		let fieldsGroup = form[i];

		let groupHead = $('<div>')
				.attr("class", "row")
				.append($("<label>")
						.attr("class", "col-sm-4 col-form-label font-weight-bold")
						.html(__(fieldsGroup.groupName)));

		for (let i = 0; i < fieldsGroup.groupLabels.length; i++) {
			groupHead
					.append($('<div>')
							.attr("class", "col")
							.append($("<input/>")
									.attr("class", "form-control-plaintext text-center font-weight-bold")
									.attr("type", "text")
									.attr("value", fieldsGroup.groupLabels[i])
									.attr("readonly", "true")))
					;

		}

		let groupContent = $('<div>').attr("class", "form-group").append(groupHead);

		for (let i = 0; i < fieldsGroup.fields.length; i++) {
			let field = fieldsGroup.fields[i];
			let BuildedFields = [];

			switch (field.type) {
				case "text":
					BuildedFields.push(
							$("<input/>")
							.attr("type", "text")
							.attr("name", field.name)
							.attr("value", field.val)
							.attr("data-label", field.name)
							.attr("class", (field.readOnly) ? "form-control-plaintext font-weight-bold text-center" : "form-control")
							.attr("valuable", "1")
							);
					break;
				case "bool":
					BuildedFields.push(
							$("<input/>")
							.attr("type", "checkbox")
							.attr("name", field.name)
							.attr("value", field.val)
							.attr("data-label", field.name)
							.attr("class", (field.readOnly) ? "form-control-plaintext font-weight-bold text-center" : "form-control")
							.attr("valuable", "1")
							.attr("checked", field.val)
							);
					break;
				case "XYPoint":
					for (let z = 0; z < field.val.length; z++)
					{
						BuildedFields.push(
								$("<input/>")
								.attr("type", "number")
								.attr("step", "0.001")
								.attr("name", (fieldsGroup.groupName + "_" + i + "_" + fieldsGroup.groupLabels[z]).toLowerCase())
								.attr("value", (field.val[z]).toFixed(3))
								.attr("data-label", field.name)
								.attr("class", (field.readOnly) ? "form-control-plaintext font-weight-bold text-center" : "form-control")
								.attr("valuable", "1")
								);
					}
					break;
				case "number":
					BuildedFields.push(
							$("<input/>")
							.attr("type", "number")
							.attr("step", "0.001")
							.attr("name", field.name)
							.attr("value", field.val)
							.attr("data-label", field.name)
							.attr("class", (field.readOnly) ? "form-control-plaintext font-weight-bold text-center" : "form-control")
							.attr("valuable", "1")
							.attr("checked", field.val)
							);
					break;
			}

			if (field.readOnly) {
				BuildedFields[BuildedFields.length - 1].attr("readonly", "true");
			}

			let labelContent = $("<label>").attr("class", "col-sm-4 col-form-label").html((field.label) ? __(field.label) : __(field.name));
			if (field.deletable) {
				labelContent.append(" ").append($("<span>").attr("class", "oi oi-x form-delete-point").css("color", "#b95c5c").css("cursor", "pointer").attr("data-index", field.index));
			}

			let groupDiv = $('<div>').attr("class", "row")
					.append(labelContent);

			for (let i = 0; i < BuildedFields.length; i++) {
				groupDiv.append($('<div>').attr("class", "col").append(BuildedFields[i]));
			}

			groupContent.append(groupDiv);

		}

		$('#active-element-form').append(groupContent);

		if (i != form.length - 1) {
			$('#active-element-form').append($("<hr/>"));
		}
	}
	$('#active-element-form').append(getFormControlButtons(svgContainerForm));

	$('#active-element-form').append($("<input/>").attr("type", "hidden"), );

	$('#active-element-form').html($('#active-element-form').html());

	updateFormTriggers(svgContainerForm);
}

function clearElementForm() {
	BuildElementForm(mainSvgContainer.getPreparedAttributesMenu(), true);
}

var updateFormTriggers = function (svgContainerForm = false) {

	$(".form-details").off().on("click", function (event) {
		event.preventDefault();
		if (!svgContainerForm) {
			let data = {
				name: activeComponent.name,
				length: activeComponent.getLength(),
				square: activeComponent.getSquare(),
				commandsCount: activeComponent.getCommandsCount(),
				price: activeComponent.getPrice(),
				time: activeComponent.getEstimatedTime()
			}

			showDetailsModal(data);
		} else {
			showSketchTotalInfoModal(mainSvgContainer.getSketchTotalInfo());
		}
	});

	$(".form-copy").off().on("click", function (event) {
		event.preventDefault();

		let copy = activeComponent.copy();

		componentRefresh(copy, false);
	});

	$(".form-restore").off().on("click", function (event) {
		event.preventDefault();

		if (!svgContainerForm) {
			componentRefresh(activeComponent);
		} else {
			BuildElementForm(mainSvgContainer.getPreparedAttributesMenu(), true);
		}

	});

	$(".form-delete").off().on("click", function (event) {
		event.preventDefault();
		deleteActiveComponent();
		BuildElementForm(mainSvgContainer.getPreparedAttributesMenu(), true);
	});

	$(".form-delete-point").off().on("click", function (event) {
		event.preventDefault();
		activeComponent.removePoint($(this).data("index"));

		$('.active-component-element').remove();
		componentRefresh(activeComponent)
	});

	$("form").off().on("submit", function (event) {
		event.preventDefault();
		formSave($(this));
	});

	$("form-save").off().on("click", function (event) {
		event.preventDefault();
		formSave($(this));
	});

}

function formSave(form = null) {

	if (!form) {
		form = $('#active-element-form');
	}

	let fields = form.find("input[valuable='1']");

	fields.each(function () {
		log(($(this).attr("name")).toLowerCase());

		let v = ($(this).attr("name").toLowerCase()).split("_");
		log(v);

		let formLinkedObject = (activeComponent) ? activeComponent : mainSvgContainer;

		if (v.length === 1) {
			formLinkedObject[v[0]] = $(this).val();
			if ($(this).attr("type") == "checkbox") {
				formLinkedObject[v[0]] = $(this).is(':checked');
			}
			if ($(this).attr("type") == "number") {			
				formLinkedObject[v[0]] = mainSvgContainer.scaleFactor * $(this).val() / mainSvgContainer.gridSizeScaleFactor;
			}
		} else if (v.length === 2) {
			formLinkedObject[v[0]][v[1]] = $(this).val();
		} else if (v.length === 3) {
			log(formLinkedObject[v[0]][v[1]][v[2]]);

			if (~v[0].indexOf("point")) {
				var val = mainSvgContainer.scaleFactor * $(this).val() / mainSvgContainer.gridSizeScaleFactor;

				if (~v[2].indexOf("x")) {
					val -= mainSvgContainer.globalX;
				} else if (~v[2].indexOf("y")) {
					val -= mainSvgContainer.globalY;
					val = svgHeight - val;
				}

				formLinkedObject[v[0]][v[1]][v[2]] = val;
			}
		}

	});

	if (activeComponent) {
		$('.active-component-element').remove();
		componentRefresh(activeComponent);
}

}
/* ----------------------------------------- */

var HistoricStack = function () {
	this.historyStack = [];
	this.positionsHistoryStack = [];
	this.index = -1;
	this.currentMax = 0;
	this.saveLastState = false;
	this.positionCorrected = [];
	this.globalPos = [];
	this.scalesHistoryStack = [];

	this.add = function () {

		this.index++;
		this.currentMax = this.index;
		this.saveLastState = true;

		var tempHistoryStack = [];


		mainSvgContainer.elements.forEach(function (obj) {
			tempHistoryStack[obj.id] = jQuery.extend(true, {}, obj);
		});
		this.historyStack[this.index] = jQuery.extend(true, [], tempHistoryStack);
		this.positionsHistoryStack[this.index] = {x: mainSvgContainer.globalX, y: mainSvgContainer.globalY};
		this.scalesHistoryStack[this.index] = mainSvgContainer.scaleFactor;
	}

	this.undo = function () {

		if (this.index >= 0) {

			if (this.saveLastState) {
				this.add();
				this.saveLastState = false;
				this.index--;
			}

			let objs = this.historyStack[this.index];
			let pos = this.positionsHistoryStack[this.index];

			mainSvgContainer.globalX = this.positionsHistoryStack[this.index].x;
			mainSvgContainer.globalY = this.positionsHistoryStack[this.index].y;

			$('.active-component-element').remove();

			$(".svg-element").remove();

			let idsArray = [];

			mainSvgContainer.elements = [];
			$(".element-list-item").remove();

			let positionCorrected = this.positionCorrected[this.index];

			if (mainSvgContainer.scaleFactor > this.scalesHistoryStack[this.index]) {
				mainSvgContainer.scale(0.5);
				mainSvgContainer.moveSvgOn({x: svgWidth / 4, y: -svgHeight / 4});
			} else if (mainSvgContainer.scaleFactor < this.scalesHistoryStack[this.index]) {
				mainSvgContainer.scale(2);
				mainSvgContainer.moveSvgOn({x: -svgWidth / 2, y: +svgHeight / 2});
			}

			objs.forEach(function (obj) {
				if (!positionCorrected) {
					obj.move({x: pos.x - mainSvgContainer.globalX, y: mainSvgContainer.globalY - pos.y});
				}
				let isActive = (activeComponent && activeComponent.id == obj.id);
				componentRefresh(obj, isActive, false, true);

				idsArray.push(obj.id);

			});

			this.positionCorrected[this.index] = true;

			createGridAndArrows();
			$("#" + mainSvgContainer.elementId).trigger("click");

			this.index--;
		}
	}
	this.redo = function () {

		if ((this.index + 1) < this.currentMax) {
			this.index++;
			let objs = this.historyStack[this.index + 1];
			//let pos = this.positionsHistoryStack[this.index];

			mainSvgContainer.globalX = this.positionsHistoryStack[this.index + 1].x;
			mainSvgContainer.globalY = this.positionsHistoryStack[this.index + 1].y;

			this.saveLastState = false;

			$('.active-component-element').remove();

			$(".element-list-item").remove();

			if (mainSvgContainer.scaleFactor > this.scalesHistoryStack[this.index]) {
				mainSvgContainer.scale(0.5);
				mainSvgContainer.moveSvgOn({x: svgWidth / 4, y: -svgHeight / 4});
			} else if (mainSvgContainer.scaleFactor < this.scalesHistoryStack[this.index]) {
				mainSvgContainer.scale(2);
				mainSvgContainer.moveSvgOn({x: -svgWidth / 2, y: +svgHeight / 2});
			}

			objs.forEach(function (obj) {
				let isActive = (activeComponent && activeComponent.id == obj.id);

				let idsArray = [];

				componentRefresh(obj, isActive, false, true);

				idsArray.push(obj.id);

				mainSvgContainer.elements[obj.id] = jQuery.extend(true, {}, obj);
			})

			createGridAndArrows();
			$("#" + mainSvgContainer.elementId).trigger("click");
		}
	}

}

var historicStack = new HistoricStack();

/* ---- WorkArea class ---- */
var WorkArea = function (name = "2D Sketch") {
	self = this;
	this.elements = [];

	this.globalX = 0;
	this.globalY = 0;

	this.scaleFactor = 1;
	this.gridSizeScaleFactor = 1;

	this.name = name;
	this.elementId = "svg";

	this.activeElement = null;

	this.addElement = function (elem, importantAdd = false) {
		if (this.elements.indexOf(elem) == -1 || importantAdd) {
			this.elements[elem.id] = elem;

			$(".element-list-item[data-id=" + elem.id + "]").remove();
			$("#element-list").append($("<div>").addClass("row element-list-item").attr("data-id", elem.id).append($("<span>").addClass("col").attr("data-id", elem.id).css("cursor", "pointer").html(elem.name)));
			$("#element-list").html($("#element-list").html());

			sortElements($("#element-list"), $('#element-list').find('.element-list-item'), function (a, b) {
				let aName = mainSvgContainer.elements[$($(a).find("span")[0]).data("id")].name;
				let bName = mainSvgContainer.elements[$($(b).find("span")[0]).data("id")].name;

				return aName.localeCompare(bName);
			});

			$("#element-list").html($("#element-list").html());
		}

		$(".element-list-item span[data-id=" + elem.id + "]").html(elem.name);
	}

	this.removeElement = function (elem) {
		var index = this.elements.indexOf(elem);

		if (index > -1) {
			delete this.elements[index];
		}

		$(".element-list-item[data-id=" + elem.id + "]").remove();
	}

	this.setActiveElement = function (elem) {
		this.activeElement = elem;
	}

	this.moveSvgTo = function (newPosition = null) {

		let mouseDelta = {
			x: mousePosition.x - oldMousePosition.x,
			y: mousePosition.y - oldMousePosition.y
		}

		if (newPosition) {
			mouseDelta = {
				x: this.globalX + newPosition.x,
				y: -(this.globalY + newPosition.y)
			}
		}

		this.globalX -= mouseDelta.x;
		this.globalY += mouseDelta.y;

		svgContainer = $('#' + this.name);

		$('.svg-grid').remove();
		createGridAndArrows(svgContainer);

		this.elements.forEach(function (elem) {
			elem.move(mouseDelta);
			$('.active-component-element').remove();
			if (elem != activeComponent) {
				componentRefresh(elem, false, true);
			} else {
				componentRefresh(elem, true, true);
			}
		});

		svgContainer.html($('#svg').html());

		BuildElementForm(mainSvgContainer.getPreparedAttributesMenu(), true);
	}

	this.moveSvgOn = function (deltaPosition = null) {
		mouseDelta = {
			x: this.globalX + deltaPosition.x,
			y: -(this.globalY + deltaPosition.y)
		}

		this.globalX -= deltaPosition.x;
		this.globalY += deltaPosition.y;

		svgContainer = $('#' + this.name);

		$('.svg-grid').remove();
		createGridAndArrows(svgContainer);

		this.elements.forEach(function (elem) {
			elem.move(deltaPosition);
			$('.active-component-element').remove();
			componentRefresh(elem, false, true);
		});

		svgContainer.html($('#svg').html());

		BuildElementForm(mainSvgContainer.getPreparedAttributesMenu(), true);
	}

	this.scale = function (scaleFactor) {

		this.scaleFactor *= scaleFactor;

		this.globalX *= scaleFactor;
		this.globalY *= scaleFactor;


		this.elements.forEach(function (elem) {
			elem.scale(scaleFactor);
			$('.active-component-element').remove();
			componentRefresh(elem, false, true);
		});

		$('.svg-grid').remove();

		svgContainer = $('#' + this.name);

		createGridAndArrows(svgContainer, scaleFactor);
		svgContainer.html($('#svg').html());

		BuildElementForm(mainSvgContainer.getPreparedAttributesMenu(), true);
	}

	this.getPreparedAttributesMenu = function () {
		let menuStruct = [];

		let groupFields = [];

		groupFields.push({type: "text", name: "Name", val: this.name});
		menuStruct.push({groupName: "General", fields: groupFields, groupLabels: []});

		groupFields = [];

		groupFields.push({type: "text", name: "scaleFactor", label: "Scale Factor", readOnly: true, val: this.scaleFactor});
		groupFields.push({type: "text", name: "globalX", label: "X Position", readOnly: true, val: (this.globalX + svgWidth / 2) / this.scaleFactor});
		groupFields.push({type: "text", name: "globalY", label: "Y Position", readOnly: true, val: (this.globalY + svgHeight / 2) / this.scaleFactor});
		menuStruct.push({groupName: "View", fields: groupFields, groupLabels: []});

		groupFields = [];

		groupFields.push({type: "text", name: "Grid Size (mm)", readOnly: true, val: mainSvgContainer.gridSizeScaleFactor * defaultGridSize});
		groupFields.push({type: "text", name: "subGrids per Cell", readOnly: true, val: subGrids + 1});

		menuStruct.push({groupName: "Grid Params", fields: groupFields, groupLabels: []});

		return menuStruct;
	}

	this.getSketchTotalInfo = function () {
		data = {
			name: this.name,
			length: 0,
			square: 0,
			commandsCount: sketch.getCommandsCount(),
			price: sketch.getPrice(),
			time: 0
		};

		let first = true;

		let minCoords = {x: 0, y: 0};
		let maxCoords = {x: 0, y: 0};

		this.elements.forEach(function (elem) {

			if (first) {
				first = false;
				minCoords = {x: elem.points[0].x, y: elem.points[0].y};
				maxCoords = {x: elem.points[0].x, y: elem.points[0].y};
			}

			data.length += elem.getLength();
			data.time += elem.getEstimatedTime();
			data.commandsCount += elem.getCommandsCount();

			elem.points.forEach(function (point) {
				if (point.x < minCoords.x) {
					minCoords.x = point.x;
				}

				if (point.x > maxCoords.x) {
					maxCoords.x = point.x;
				}

				if (point.y < minCoords.y) {
					minCoords.y = point.y;
				}

				if (point.y > maxCoords.y) {
					maxCoords.y = point.y;
				}
			});
		});

		let square = (Math.abs(minCoords.x - maxCoords.x) * Math.abs(minCoords.y - maxCoords.y) / Math.pow(mainSvgContainer.scaleFactor, 2)) * Math.pow(mainSvgContainer.gridSizeScaleFactor, 2);

		data.square = square;
		data.time *= 1.25;
		data.price += square / 1000000 * sketch.getMaterialCost() * sketch.materialDeep;

		return data;
	};
};
/* ---------------------- */

var mainSvgContainer = new WorkArea();

var choosedMenuComponent = null;
var activeComponent = null;

var addActiveComponentElements = function (elem) {

	let activeComponentElements = elem.returnActiveComponentElements();

	for (let i = 0; i < activeComponentElements.length; i++) {
		$('#' + mainSvgContainer.elementId).append(activeComponentElements[i]);
	}

	$('#' + mainSvgContainer.elementId).html($('#svg').html());

	updateTriggers();
}

var removeActiveComponentElements = function () {
	$('.active-component-element').remove();
}

var ComponentFactory = function (component) {
	historicStack.add();
	var elem = null;

	switch (component) {
		case 'qBizier':
			elem = new QuadraticBizier();
			break;
		case 'cBizier':
			elem = new CubicBizier();
			break;
		case 'pLine':
			elem = new PolyLine();
			break;
		case 'circle':
			elem = new Circle();
			break;
		case 'rectangle':
			elem = new Rectangle();
			break;
		case 'ellipse':
			elem = new Ellipse();
			break;
		default:
			console.error('Unable to create object: component class not found!');
	}

	if (elem) {
		componentRefresh(elem);
	}

	return elem;
}

var activeComponentShiftAction = function (elem) {
	elem.onShiftedClick({PositionX: mousePosition.x, PositionY: mousePosition.y});

	$('.svg-element[data-id=' + elem.id + ']').remove();
	$('.active-component-element').remove();

	componentRefresh(elem);
	updateTriggers();
}

var buildGizmo = function (elem) {
	let AABB = elem.getAABB();
	let gizmoLineLength = pointsRadius * 2;

	let topLeft = {x: AABB.left - $('#svg').offset().left - pointsRadius + window.pageXOffset, y: AABB.top - $('#svg').offset().top - pointsRadius + window.pageYOffset};
	let topRight = {x: AABB.left - $('#svg').offset().left + AABB.width + pointsRadius + window.pageXOffset, y: AABB.top - $('#svg').offset().top - pointsRadius + window.pageYOffset};
	let bottomLeft = {x: AABB.left - $('#svg').offset().left - pointsRadius + window.pageXOffset, y: AABB.top - $('#svg').offset().top + AABB.height + pointsRadius + window.pageYOffset};
	let bottomRight = {x: AABB.left - $('#svg').offset().left + AABB.width + pointsRadius + window.pageXOffset, y: AABB.top - $('#svg').offset().top + AABB.height + pointsRadius + window.pageYOffset};

	$('#' + mainSvgContainer.elementId).append(
			$('<polyline/>')
			.attr("class", 'active-component-element')
			.attr('fill', "none")
			.attr('stroke', 'red')
			.attr('points', topLeft.x + ',' + (topLeft.y + gizmoLineLength) + ' ' + topLeft.x + ',' + topLeft.y + ' ' + (topLeft.x + gizmoLineLength) + ',' + topLeft.y)
			);

	$('#' + mainSvgContainer.elementId).append(
			$('<polyline/>')
			.attr("class", 'active-component-element')
			.attr('fill', "none")
			.attr('stroke', 'red')
			.attr('points', topRight.x + ',' + (topRight.y + gizmoLineLength) + ' ' + topRight.x + ',' + topRight.y + ' ' + (topRight.x - gizmoLineLength) + ',' + topRight.y)
			);

	$('#' + mainSvgContainer.elementId).append(
			$('<polyline/>')
			.attr("class", 'active-component-element')
			.attr('fill', "none")
			.attr('stroke', 'red')
			.attr('points', bottomLeft.x + ',' + (bottomLeft.y - gizmoLineLength) + ' ' + bottomLeft.x + ',' + bottomLeft.y + ' ' + (bottomLeft.x + gizmoLineLength) + ',' + bottomLeft.y)
			);

	$('#' + mainSvgContainer.elementId).append(
			$('<polyline/>')
			.attr("class", 'active-component-element')
			.attr('fill', "none")
			.attr('stroke', 'red')
			.attr('points', bottomRight.x + ',' + (bottomRight.y - gizmoLineLength) + ' ' + bottomRight.x + ',' + bottomRight.y + ' ' + (bottomRight.x - gizmoLineLength) + ',' + bottomRight.y)
			);

	$('#' + mainSvgContainer.elementId).html($('#svg').html());
}

var sortElements = function (wrapper, elements, method = null) {
	[].sort.call(elements, method);

	elements.each(function () {
		wrapper.append(this);
	});
};

var componentRefresh = function (elem, isActive = true, moveAction = false, importantAdd = false) {

	$('.svg-element[data-id=' + elem.id + ']').remove();

	mainSvgContainer.addElement(elem, importantAdd);

	let created = elem.returnSvg();
	$('#' + mainSvgContainer.elementId).append(created);

	$('#' + mainSvgContainer.elementId).html($('#svg').html());

	if (!moveAction) {/* It really makes bottleneck in a lot of case to using, I'm looking for way to resolve it for future */
		sortElements($('#svg'), $('#svg').find('.svg-element'), function (a, b) {
			let aSquare = mainSvgContainer.elements[$(a).data("id")].getSquare();
			let bSquare = mainSvgContainer.elements[$(b).data("id")].getSquare();

			if (aSquare < bSquare) {
				return 1;
			} else if (aSquare > bSquare) {
				return -1;
			} else
				return 0;
		});
	}

	if (isActive) {
		let activeComponentElements = elem.returnActiveComponentElements();
		for (let i = 0; i < activeComponentElements.length; i++) {
			$('#' + mainSvgContainer.elementId).append(activeComponentElements[i]);
		}

		$('#' + mainSvgContainer.elementId).html($('#svg').html());

		BuildElementForm(elem.getPreparedAttributesMenu());
		buildGizmo(elem);
	}

	updateTriggers();
};

var isComponentClicked = false;

var deleteActiveComponent = function () {
	if (activeComponent) {
		$('.svg-element[data-id=' + activeComponent.id + ']').remove();
		$('.active-component-element').remove();
		mainSvgContainer.removeElement(activeComponent);
		BuildElementForm(mainSvgContainer.getPreparedAttributesMenu(), true);
		updateTriggers();
		return true;
	} else {
		return false;
	}
};

var animActiveComponent = function () {
	if (activeComponent) {
		simulate(activeComponent);
		return true;
	} else {
		return false;
	}
};

var newStateFixed = false;

var updateTriggers = function () {

	$('body').off().keypress(function (event) {
		let keyCode = event.originalEvent.code;
		let isShifted = event.shiftKey;

		if (isShifted) {
			switch (keyCode)
			{
				case 'KeyD': // delete active element
					deleteActiveComponent();
					break;

				case 'KeyA': // delete active element
					animActiveComponent();
					break;
			}
		}

	});

	$('.component-menu-element').off().on('click', function () {
		choosedMenuComponent = $(this).data("class");
	});

	$('.svg-control-button').off().on('click', function () {
		executeSvgAction($(this).data("action"));
	});

	$('.main-menu-buttons a').off().on('click', function () {
		executeMainMenuAction($(this).data("action"));
	});

	$('#' + mainSvgContainer.elementId).off().on('click', function (event) {
		let isShifted = event.shiftKey;

		if (activeComponent && isShifted) {
			activeComponentShiftAction(activeComponent);
		}

		isComponentClicked = false;

		if (!isShifted) {
			$('.active-component-element').remove();
			clearElementForm();
			$(this).html($(this).html());
			activeComponent = null;
		}

		if (choosedMenuComponent) {
			var elem = ComponentFactory(choosedMenuComponent);
			activeComponent = elem;
			choosedMenuComponent = null;
			$('.component-menu-element').blur();
		}

		updateTriggers();
	});

	$('.svg-element').off().mousedown(function () {
		if (!choosedMenuComponent) {
			isComponentClicked = true;
			let isShifted = event.shiftKey;

			if (!isShifted) {
				$('.active-component-element').remove();
				$('#' + mainSvgContainer.elementId).html($('#svg').html());

				activeComponent = mainSvgContainer.elements[$(this).data("id")];
				toMoveComponent = mainSvgContainer.elements[$(this).data("id")];

				addActiveComponentElements(activeComponent);
				buildGizmo(activeComponent);
				BuildElementForm(activeComponent.getPreparedAttributesMenu());
			}

			if (isShifted) {
				activeComponentShiftAction(activeComponent);
			}
		} else {
			$('.active-component-element').remove();
			var elem = ComponentFactory(choosedMenuComponent);
			activeComponent = elem;
			choosedMenuComponent = null;
			$('.component-menu-element').blur();
		}

		updateTriggers();
	}).mouseup(function () {
		toMoveComponent = null;
	});

	$('#' + mainSvgContainer.elementId).bind('mousemove', function (mouseMoveEvent) {
		oldMousePosition.x = mousePosition.x;
		oldMousePosition.y = mousePosition.y;

		mousePosition.x = mouseMoveEvent.pageX - $(this).offset().left;
		mousePosition.y = mouseMoveEvent.pageY - $(this).offset().top;

		if (down && !mouseMoveEvent.shiftKey && !toMoveComponent && toMovePointIndex === null) {

			if (!newStateFixed) {
				historicStack.add();
				newStateFixed = true;
			}

			mainSvgContainer.moveSvgTo();
			updateTriggers();
		}

		if (toMoveComponent && down) {

			if (!newStateFixed) {
				historicStack.add();
				newStateFixed = true;
			}

			$('.svg-element[data-id=' + toMoveComponent.id + ']').remove();
			$('.active-component-element').remove();

			toMoveComponent.move();

			componentRefresh(toMoveComponent);
			updateTriggers();
		}

		if (pointComponent && toMovePointIndex !== null && down) {
			$('.svg-element[data-id=' + pointComponent.id + ']').remove();
			$('.active-component-element').remove();

			pointComponent.movePoint(toMovePointIndex, mousePosition);

			componentRefresh(pointComponent);
			updateTriggers();
		}
	});

	$('[data-role="curve-point"]').off().mousedown(function (event) {
		historicStack.add();
		pointComponent = mainSvgContainer.elements[$(this).data("component-id")];
		let isShifted = event.shiftKey;
		let pointIndex = $(this).data("index");

		if (!isShifted) {
			toMovePointIndex = pointIndex;
		}

		if (isShifted && pointComponent.isDeletablePoint(pointIndex)) {
			pointComponent.removePoint(pointIndex);

			$('.svg-element[data-id=' + pointComponent.id + ']').remove();
			$('.active-component-element').remove();

			componentRefresh(pointComponent);
			updateTriggers();
		}
	});

	$('#' + mainSvgContainer.elementId).mousedown(function () {
		if (false) {
			oldMousePosition.x = mousePosition.x;
			oldMousePosition.y = mousePosition.y;
		}
		down = true;
	}).mouseup(function () {
		toMoveComponent = null;
		pointComponent = null;
		toMovePointIndex = null;
		down = false;
		newStateFixed = false;
	});

	$(".element-list-item span").off().click(function () {
		$('.active-component-element').remove();

		let elemId = $(this).data("id");
		activeComponent = mainSvgContainer.elements[elemId];
		mainSvgContainer.moveSvgTo({x: +svgWidth / 2 - activeComponent.getAbsolutePosition().x, y: +svgHeight / 2 - activeComponent.getAbsolutePosition().y});
		componentRefresh(activeComponent);
	});
};

var toMoveComponent = null;
var toMovePointIndex = null;
var pointComponent = null;
var oldMousePosition = {x: 0, y: 0};
var mousePosition = {x: 0, y: 0};
var down = false;

var defaultGridSize = 50;
var cellSize = defaultGridSize;
var cellOffset = 5;
var subGrids = 0;

let arrowAngelKoef = 3;
let textSize = 12;

var svgWidth = 0;
var svgHeight = 0;

var initialSvg = function () {
	svgWidth = $("#demo-div")[0].getBoundingClientRect().width - 40;
	svgHeight = window.innerHeight - 150;

	$("#svg").attr("width", svgWidth).attr("height", svgHeight);

	createGridAndArrows();
	updateTriggers();

	mainSvgContainer.moveSvgTo({x: +svgWidth / 2, y: +svgHeight / 2});

	$("#svg").attr("width", svgWidth).attr("height", svgHeight);
}


$(function () {
	initialSvg();
	
	formHeight = window.innerHeight - 100;
	$(".active-element-form-container").css("max-height", formHeight);

	// create JqSvg object on faked non-displayed div
	$("#jqSvg").svg({
		onLoad: function (svg) {
			jqSvg = svg;
		}
	});

	$(window).resize(function () {

	});
});

var createGrid = function (svgContainer) {
	let offset = {x: mainSvgContainer.globalX % cellSize, y: mainSvgContainer.globalY % cellSize};

	let centerGrid = {
		x: -mainSvgContainer.globalX,
		y: +svgContainer.attr("height") + mainSvgContainer.globalY
	};

	svgContainer.append(
			$("<line/>")
			.attr("x1", centerGrid.x)
			.attr("x2", centerGrid.x)
			.attr("y1", 0)
			.attr("y2", svgContainer.attr("height"))
			.attr("stroke-width", 0.8)
			//.attr("stroke-dasharray", "2 8")
			.attr("stroke", "gray")
			.attr("class", "svg-grid")
			);

	svgContainer.append(
			$("<line/>")
			.attr("x1", 0)
			.attr("x2", svgContainer.attr("width"))
			.attr("y1", centerGrid.y)
			.attr("y2", centerGrid.y)
			.attr("stroke-width", 0.8)
			//.attr("stroke-dasharray", "2 8")
			.attr("stroke", "gray")
			.attr("class", "svg-grid")
			);

	for (let i = -cellSize; i <= (+svgContainer.attr("width")) + cellSize; i += cellSize) {
		svgContainer.append(
				$("<line/>")
				.attr("x1", parseInt(+i - offset.x))
				.attr("x2", parseInt(+i - offset.x))
				.attr("y1", 0)
				.attr("y2", svgContainer.attr("height"))
				.attr("stroke-width", 0.3)
				//.attr("stroke-dasharray", "2 8")
				.attr("stroke", "gray")
				.attr("class", "svg-grid")
				);
	}

	for (let i = +svgContainer.attr("height") + cellSize; i >= -cellSize; i -= cellSize) {
		svgContainer.append(
				$("<line/>")
				.attr("x1", 0)
				.attr("x2", svgContainer.attr("width"))
				.attr("y1", parseInt(+i + offset.y))
				.attr("y2", parseInt(+i + offset.y))
				.attr("stroke-width", 0.3)
				//.attr("stroke-dasharray", "2.2 7")
				.attr("stroke", "gray")
				.attr("class", "svg-grid")
				);
	}

	for (let i = -cellSize * 2; i <= +svgContainer.attr("width") + cellSize; i += cellSize) {
		let counter = 0;
		for (let z = i + (cellSize / (subGrids + 1)); z < (i + cellSize); z += cellSize / (subGrids + 1)) {
			counter++;

			svgContainer.append(
					$("<line/>")
					.attr("x1", parseInt(+z - offset.x))
					.attr("x2", parseInt(+z - offset.x))
					.attr("y1", 0)
					.attr("y2", svgContainer.attr("height"))
					.attr("stroke-width", 0.1)
					.attr("stroke-dasharray", "10 2")
					.attr("stroke", "#efefef")
					.attr("class", "svg-grid")
					);

			if (counter >= subGrids) {
				break;
			}
		}
	}

	for (let i = +svgContainer.attr("height") + cellSize; i >= -cellSize * 2; i -= cellSize) {
		let counter = 0;
		for (let z = i + (cellSize / (subGrids + 1)); z < (i + cellSize); z += cellSize / (subGrids + 1)) {
			counter++;

			svgContainer.append(
					$("<line/>")
					.attr("x1", 0)
					.attr("x2", svgContainer.attr("width"))
					.attr("y1", parseInt(+z + offset.y))
					.attr("y2", parseInt(+z + offset.y))
					.attr("stroke-width", 0.1)
					.attr("stroke-dasharray", "10 2")
					.attr("stroke", "#efefef")
					.attr("class", "svg-grid")
					);

			if (counter >= subGrids) {
				break;
			}
		}
	}

	svgContainer.append(
			$('<text>')
			.attr("x", (defaultGridSize))
			.attr("y", (svgContainer.attr("height") - cellOffset - arrowAngelKoef))
			.attr("font-family", "Verdana")
			.attr('font-size', textSize)
			.attr("class", "svg-grid")
			.css("fill", "black")
			.html("(" + (mainSvgContainer.globalX / mainSvgContainer.scaleFactor + (svgWidth / 2 * (defaultGridSize / cellSize))) + ")")
			);

	svgContainer.append(
			$('<text>')
			.attr("x", (arrowAngelKoef) + textSize)
			.attr("y", (svgContainer.attr("height") - (defaultGridSize - (textSize - 2))))
			.attr("font-family", "Verdana")
			.attr('font-size', textSize)
			.attr("class", "svg-grid")
			.css("fill", "black")
			.html("(" + (mainSvgContainer.globalY / mainSvgContainer.scaleFactor + (svgHeight / 2 * (defaultGridSize / cellSize))) + ")")
			);
}

var createGridAndArrows = function (container = null, scaleFactor = 1) {
	$('.svg-grid').remove();

	cellSize *= scaleFactor;
	textSize = defaultGridSize / 5;

	let svgContainer = $('#' + mainSvgContainer.elementId);
	if (container) {
		svgContainer = $('#' + mainSvgContainer.elementId);
	}

	createGrid(svgContainer);

	svgContainer.append(
			$("<line/>")
			.attr("x1", cellOffset)
			.attr("x2", cellOffset)
			.attr("y1", svgContainer.attr("height") - cellOffset)
			.attr("y2", svgContainer.attr("height") - (defaultGridSize))
			.attr("stroke-width", 0.7)
			.attr("stroke", "black")
			.attr("class", "svg-grid")
			);

	svgContainer.append(
			$("<line/>")
			.attr("x1", cellOffset)
			.attr("x2", defaultGridSize)
			.attr("y1", svgContainer.attr("height") - cellOffset)
			.attr("y2", svgContainer.attr("height") - cellOffset)
			.attr("stroke-width", 0.7)
			.attr("stroke", "black")
			.attr("class", "svg-grid")
			);

	svgContainer.append(
			$('<polyline/>')
			.attr("stroke-width", 0.7)
			.attr("stroke", "black")
			.attr("fill", "none")
			.attr('points', (cellOffset - arrowAngelKoef) + "," + (svgContainer.attr("height") - (defaultGridSize - (defaultGridSize / 5))) + " " + (cellOffset) + "," + (svgContainer.attr("height") - (defaultGridSize)) + " " + (cellOffset + arrowAngelKoef) + "," + (svgContainer.attr("height") - (defaultGridSize - (defaultGridSize / 5))))
			.attr("class", "svg-grid")
			);

	svgContainer.append(
			$('<polyline/>')
			.attr("stroke-width", 0.7)
			.attr("stroke", "black")
			.attr("fill", "none")
			.attr('points', (defaultGridSize - (defaultGridSize / 5)) + "," + (svgContainer.attr("height") - cellOffset - arrowAngelKoef) + " " + (defaultGridSize) + "," + (svgContainer.attr("height") - cellOffset) + " " + (defaultGridSize - (defaultGridSize / 5)) + "," + (svgContainer.attr("height") - (cellOffset - arrowAngelKoef)))
			.attr("class", "svg-grid")
			);

	svgContainer.append(
			$('<text>')
			.attr("x", (defaultGridSize - (textSize - 2)))
			.attr("y", (svgContainer.attr("height") - cellOffset - arrowAngelKoef))
			.attr("font-family", "Verdana")
			.attr('font-size', textSize)
			.css("fill", "green")
			.html("X")
			.attr("class", "svg-grid")
			);

	svgContainer.append(
			$('<text>')
			.attr("x", (cellOffset + arrowAngelKoef))
			.attr("y", (svgContainer.attr("height") - (defaultGridSize - (textSize - 2))))
			.attr("font-family", "Verdana")
			.attr('font-size', textSize)
			.css("fill", "red")
			.html("Y")
			.attr("class", "svg-grid")
			);

	svgContainer.append(
			$('<polyline/>')
			.attr("stroke-width", 1)
			.attr("stroke", "black")
			.attr("fill", "none")
			.attr('points', (svgContainer.attr("width") - cellOffset) + "," + (svgContainer.attr("height") - cellOffset - (defaultGridSize / 5)) + " " + (svgContainer.attr("width") - cellOffset) + "," + (svgContainer.attr("height") - cellOffset) + " " + (svgContainer.attr("width") - defaultGridSize - cellOffset) + "," + (svgContainer.attr("height") - cellOffset) + " " + (svgContainer.attr("width") - defaultGridSize - cellOffset) + "," + (svgContainer.attr("height") - cellOffset - (defaultGridSize / 5)))
			.attr("class", "svg-grid")
			);

	svgContainer.append(
			$('<text>')
			.attr("x", (svgContainer.attr("width") - cellOffset - (defaultGridSize / 2)) - parseInt(textSize * 1.7))
			.attr("y", (svgContainer.attr("height") - cellOffset - (defaultGridSize / 10)))
			.attr("font-family", "Verdana")
			.attr('font-size', textSize)
			.css("fill", "black")
			.html(defaultGridSize * mainSvgContainer.gridSizeScaleFactor * (defaultGridSize / cellSize) + 'mm')
			.attr("class", "svg-grid")
			);

	svgContainer.html($('#svg').html());
}

var executeSvgAction = function (action) {
	switch (action) {
		case 'zoom-in':
			historicStack.add();
			mainSvgContainer.scale(2);
			mainSvgContainer.moveSvgOn({x: -svgWidth / 2, y: +svgHeight / 2});
			break;
		case 'zoom-out':
			historicStack.add();
			mainSvgContainer.scale(0.5);
			mainSvgContainer.moveSvgOn({x: svgWidth / 4, y: -svgHeight / 4});
			break;
		case 'to-zero':
			mainSvgContainer.moveSvgTo({x: +svgWidth / 2, y: +svgHeight / 2});
			break;
		case 'params':
			showCanvasParamsModal({
				cellSize: defaultGridSize * mainSvgContainer.gridSizeScaleFactor,
				subCells: subGrids,
			});
			break;
		case 'undo':
			historicStack.undo();
			break;
		case 'redo':
			historicStack.redo();
			break;
		case 'simulate-start':
			simulate();
			break;
		case 'simulate-stop':
			stopSimulate = true;
			break;

	}

	if (action != 'simulate-start') {
		updateTriggers();
	}
}

function createElementsExportArray() {
	let elements = [];

	mainSvgContainer.elements.forEach(function (elem) {
		elements.push(jQuery.extend(true, {}, elem));
	});

	let aExport = [];

	elements.forEach(function (elem) {
		aExport.push(elem);
	});

	aExport.sort(function (a, b) {
		let aSquare = a.getSquare();
		let bSquare = b.getSquare();

		if (aSquare > bSquare) {
			return 1;
		} else if (aSquare < bSquare) {
			return -1;
		} else
			return 0;
	});

	aExport.forEach(function (elem) {
		for (let i = 0; i < elem.points.length; i++) {
			elem.points[i].x = ((elem.points[i].x + mainSvgContainer.globalX) / mainSvgContainer.scaleFactor * mainSvgContainer.gridSizeScaleFactor).toFixed(3),
			elem.points[i].y = (((svgHeight - elem.points[i].y) + mainSvgContainer.globalY) / mainSvgContainer.scaleFactor * mainSvgContainer.gridSizeScaleFactor).toFixed(3)
		}
	});

	return aExport;
}

var exportToDb = function () {

	let aExport = createElementsExportArray();
	let data = JSON.stringify(aExport);

	sketch.name = mainSvgContainer.name; // sorry, bad architecture is faced here

	$.post(
			'../action/saveToDb.php',
			{
				elements: data,
				sketch: JSON.stringify(sketch),
				hardware: JSON.stringify(hardware),
				svg: JSON.stringify(mainSvgContainer)
			},
			function (data) {
				$('#modalWindow .modal-body').html('<span style="color:red">' + __("Success") + '!</span> ' + __("Sketch") + ' <b>' + sketch.name + '</b> ' + __("successful saved to DB") + '!');

				$('#modalWindow .modal-footer').prepend(
						$("<a>").attr("href", "../action/uploads/" + JSON.parse(data)['fileName']).attr("download", "").append($('<button>')
						.attr('type', 'button')
						.attr('class', 'btn btn-secondary')
						.html(__("DOWNLOAD"))
						).on("click", function () {
					$('#modalWindow').modal('toggle');
				}));
			},
			'text'
			);
}

var executeMainMenuAction = function (action) {
	switch (action) {
		case 'about-window':
			aboutModal({cellSize: defaultGridSize * mainSvgContainer.gridSizeScaleFactor});
			break;
		case 'canva-params':
			showCanvasParamsModal({
				cellSize: defaultGridSize * mainSvgContainer.gridSizeScaleFactor,
				subCells: subGrids,
			});
			break;
		case 'usefull-links':
			showLinksModal();
			break;
		case 'db-export':
			showSaveToDbModal();
			exportToDb();
			break;
		case 'load-file':
			loadFileModal();
			break;
		case 'sketh-props':
			showSketchPropsModal();
			break;
		case 'get-from-bd':
			showLoadFromBdModal();
			break;
		case 'hardware-sets':
			showHardwareSettingsModal();
			break;
		case 'sketch-info':
			showSketchTotalInfoModal(mainSvgContainer.getSketchTotalInfo());
			break;
		case 'undo':
			historicStack.undo();
			break;
		case 'redo':
			historicStack.redo();
			break;
		case 'faq':
			showFaqModal();
			break;
		case 'gen-codes':
			showGenerateProgrammModal();
			break;
		case 'simulate':
			simulate();
			break;
		case 'clear':
			clear()
					;

	}

	if (action != 'simulate') {
		updateTriggers();
	}

}

function clear() {
	sketch = new Sketch();
	hardware = new Hardware();

	mainSvgContainer.elements.forEach(function (e) {
		mainSvgContainer.removeElement(e);
	});

	$(".svg-element").remove();
	$(".active-component-element").remove();

	mainSvgContainer = new WorkArea();

	initialSvg();
}

function loadSketch(data) {
	let parsedData = JSON.parse(data);

	$(".svg-element").remove();
	mainSvgContainer.elements.forEach(function (obj) {
		mainSvgContainer.removeElement(obj);
	});

	mainSvgContainer.gridSizeScaleFactor = parsedData.svg.gridSizeScaleFactor;
	mainSvgContainer.name = parsedData.sketch.name;

	sketch.loadFromObject(parsedData.sketch);
	hardware.loadFromObject(parsedData.hardware);

	parsedData.elements.forEach(function (obj) {
		let elem = ComponentFactory(obj.type);
		elem.looped = obj.looped;
		elem.name = obj.name;

		if (obj.type == "rectangle") {
			elem.cr = obj.cr;
		}

		if (obj.type == "cBizier") {

			for (let i = 5; i < obj.points.length; i += 2) {
				elem.addPoint(obj.points[i]);
			}
		}

		if (obj.type == "qBizier") {

			for (let i = 3; i < obj.points.length; i++) {
				elem.addPoint(obj.points[i]);
			}
		}

		if (obj.type == "pLine") {

			for (let i = 2; i < obj.points.length; i++) {
				elem.addPoint(obj.points[i]);
			}
		}

		for (let i = 0; i < elem.points.length; i++) {
			elem.points[i].x = mainSvgContainer.scaleFactor * obj.points[i].x / mainSvgContainer.gridSizeScaleFactor;
			elem.points[i].y = mainSvgContainer.scaleFactor * obj.points[i].y / mainSvgContainer.gridSizeScaleFactor;

			elem.points[i].x -= mainSvgContainer.globalX;
			elem.points[i].y -= mainSvgContainer.globalY;
			elem.points[i].y = svgHeight - elem.points[i].y;
		}
	});

	mainSvgContainer.moveSvgTo({x: +svgWidth / 2, y: +svgHeight / 2});
}

function unbindAll() {
	$('*').unbind().off();
}


function clearAnims() {
	$('.anim-element').remove();
	$("animend").remove();
	$('#' + mainSvgContainer.elementId).html($('#' + mainSvgContainer.elementId).html());

	updateTriggers();

}

function simulate(elem = null) {

	clearAnims();
	unbindAll();

	let aElements = [];

	if (!elem) {

		mainSvgContainer.elements.forEach(function (elem) {
			aElements.push(elem);
		});

		aElements.sort(function (a, b) {
			let aSquare = a.getSquare();
			let bSquare = b.getSquare();

			if (aSquare > bSquare) {
				return 1;
			} else if (aSquare < bSquare) {
				return -1;
			} else
				return 0;
		});
	} else {
		aElements.push(elem);
	}


	$('.svg-control-button.simulate-stop').off().on('click', function () {
		executeSvgAction($(this).data("action"));
	});

	$(".simulate-start").css("display", "none");
	$(".simulate-stop").css("display", "block");

	$(".svg-element").css("display", "none");
	$(".active-component-element").remove();

	let animStarted = false;
	let i = 0;

	if (aElements.length) {

		let int = setInterval(function () {

			let animended = $("animend[data-elem-id=" + aElements[i].id + "]").length;

			if (animended) {
				animStarted = false;
				i++;
			}

			if (i >= aElements.length || stopSimulate) {
				stopSimulate = false;

				if (aElements[i]) {
					aElements[i].stopAnimation();
				}

				setTimeout(function () {
					clearAnims();
					updateTriggers();

					$(".simulate-start").css("display", "block");
					$(".simulate-stop").css("display", "none");
					$(".svg-element").css("display", "block");
				}, 100);

				clearInterval(int);
			}

			if (!animStarted) {
				animStarted = true;

				if (aElements[i]) {
					aElements[i].showAnimation(sketch.interpolationStep);
				}
			}



		}, 50);
	} else {
		$(".simulate-start").css("display", "block");
		$(".simulate-stop").css("display", "none");
		updateTriggers();
}
}



