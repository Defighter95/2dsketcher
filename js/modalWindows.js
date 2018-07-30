function formatDate(date) {
	var hours = date.getHours();
	var minutes = date.getMinutes();
	var ampm = hours >= 12 ? 'pm' : 'am';

	hours = hours % 12;
	hours = hours ? hours : 12;
	minutes = minutes < 10 ? '0' + minutes : minutes;

	var strTime = hours + ':' + minutes + ' ' + ampm;

	return date.getDate() + "/" + (date.getMonth() + 1) + "/" + date.getFullYear() + "  " + strTime;
}

function aboutModal() {
	$('#modalWindow .modal-title').html(__("About"));
	$('#modalWindow .modal-footer').html('').append(
			$('<button>')
			.attr('type', 'button')
			.attr('class', 'btn btn-secondary')
			.attr('data-dismiss', 'modal')
			.html('OK')
			);
	$('#modalWindow .modal-body').html($('#about-modal-body').html());

	$('#modalWindow').modal();

}

function showDetailsModal(data) {
	$('#modalWindow .modal-title').html(__("Details") + ': ' + data['name']);
	$('#modalWindow .modal-footer').html('').append(
			$('<button>')
			.attr('type', 'button')
			.attr('class', 'btn btn-secondary')
			.attr('data-dismiss', 'modal')
			.html('OK')
			);
	$('#modalWindow .modal-body').html($('#detail-modal-body').html());

	$('.modal-body #detail-modal-body-form-length').html(data['length'].toFixed(2));
	$('.modal-body #detail-modal-body-form-square').html(data['square'].toFixed(2));
	$('.modal-body #detail-modal-body-form-commands-count').html(data['commandsCount']);
	$('.modal-body #detail-modal-body-form-cost').html(data['price'].toFixed(2));
	$('.modal-body #detail-modal-body-form-time').html(parseInt(data['time']));
	$('#modalWindow').modal();
}

function showGenerateProgrammModal() {
	$('#modalWindow .modal-title').html(__("Control programm generation"));
	$('#modalWindow .modal-footer').html('');

	$('#modalWindow .modal-body').html($('#generate-control-programm-body').html());

	$('#modalWindow').modal();

	let aElems = JSON.stringify(createElementsExportArray());
	
	$.post(
			'../action/createGCodes.php',
			{
				elements: aElems,
				sketch: JSON.stringify(sketch),
				hardware: JSON.stringify(hardware),
				svg: JSON.stringify(mainSvgContainer)
			},
			function (data) {
				$('#modalWindow .modal-body').html('<span style="color:red">' + __("Success") + '!</span> ' + __("Control programm for") + ' <b>' + sketch.name + '</b> ' + __("successful created") + '!');

				$('#modalWindow .modal-footer').prepend(
						$("<a>").attr("href", "../action/codes/" + JSON.parse(data)['fileName']).attr("download", "").append($('<button>')
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

function showCanvasParamsModal(data) {
	$('#modalWindow .modal-title').html(__("Canvas Properties"));

	$('#modalWindow .modal-footer').html('').append(
			$('<button>')
			.attr('type', 'button')
			.attr('class', 'btn btn-secondary')
			.attr('data-dismiss', 'modal')
			.html(__("SAVE")).on("click",
			function () {
				$('.svg-grid').remove();
				mainSvgContainer.gridSizeScaleFactor = $("#canvas-params-cell-size").val() / defaultGridSize;
				subGrids = +$("#canvas-params-subcell-count").val() - 1;
				createGridAndArrows();

				if (!activeComponent) {
					BuildElementForm(mainSvgContainer.getPreparedAttributesMenu(), true);
				}
			})
			).append($('<button>')
			.attr('type', 'button')
			.attr('class', 'btn btn-secondary')
			.attr('data-dismiss', 'modal')
			.html(__("CANCEL")));
	;

	$('#modalWindow .modal-body').html($('#canvas-params-form').html());

	$('.modal-body #canvas-params-cell-size').attr("value", data['cellSize']);
	$('.modal-body #canvas-params-subcell-count').attr("value", +data['subCells'] + 1);

	$('#modalWindow').modal();
}

function showLinksModal() {
	$('#modalWindow .modal-title').html(__("Usefull Links"));

	$('#modalWindow .modal-footer').html('').append(
			$('<button>')
			.attr('type', 'button')
			.attr('class', 'btn btn-secondary')
			.attr('data-dismiss', 'modal')
			.html('OK')
			);

	$('#modalWindow .modal-body').html($('#links-modal-body').html());

	$('#modalWindow').modal();
}

function showSaveToDbModal() {
	$('#modalWindow .modal-title').html(__("Save to DB"));

	$('#modalWindow .modal-footer').html('').append(
			$('<button>')
			.attr('type', 'button')
			.attr('class', 'btn btn-secondary')
			.attr('data-dismiss', 'modal')
			.html('OK')
			);

	$('#modalWindow .modal-body').html($('#db-save-body').html());

	$('#modalWindow').modal();
}

function showFaqModal() {
	$('#modalWindow .modal-title').html(__("FAQ"));

	$('#modalWindow .modal-footer').html('').append(
			$('<button>')
			.attr('type', 'button')
			.attr('class', 'btn btn-secondary')
			.attr('data-dismiss', 'modal')
			.html('OK')
			);

	$('#modalWindow .modal-body').html($('#faq-modal-body').html());

	$('#modalWindow').modal();
}

function loadFileModal() {
	var files;

	$('#modalWindow .modal-title').html(__("Import from File"));

	$('#modalWindow .modal-footer').html('').append(
			$('<button>')
			.attr('type', 'button')
			.attr('class', 'btn btn-secondary uploaf-file')
			.attr('data-dismiss', 'modal')
			.attr('disabled', 'true')
			.html(__("UPLOAD")).on("click", function () {
		$('#db-save-body-downloading').css("display", "block");

		event.preventDefault();

		if (typeof files == 'undefined') {
			return;
		}

		var data = new FormData();

		$.each(files, function (key, value) {
			data.append(key, value);
		});

		$.ajax({
			url: '../action/loadFile.php',
			type: 'POST', // важно!
			data: data,
			cache: false,
			dataType: 'text',
			processData: false,
			contentType: false,
			success: function (data) {
				loadSketch(data);
			},
			error: function (jqXHR, status) {
				console.error('ОШИБКА AJAX запроса: ' + status, jqXHR);
			}

		});
	})
			).append($('<button>')
			.attr('type', 'button')
			.attr('class', 'btn btn-secondary')
			.attr('data-dismiss', 'modal')
			.html(__("CANCEL")));

	$('#modalWindow .modal-body').html($('#load-file-body').html());

	$('#modalWindow').modal();

	$('#load-file-form input[type=file]').on('change', function () {
		$('.uploaf-file').removeAttr('disabled');
		files = this.files;
	});
}

function showSketchPropsModal() {
	$('#modalWindow .modal-title').html(__("Sketch Properties"));

	$('#modalWindow .modal-footer').html('').append(
			$('<button>')
			.attr('type', 'button')
			.attr('class', 'btn btn-secondary')
			.attr('data-dismiss', 'modal')
			.html(__("SAVE")).on("click", function () {
		sketch.interpolationStep = +$('#sketch-properties-form-inter').val();
		sketch.materialDeep = +$('#sketch-properties-material-deeps').val();
		sketch.material = +$('#sketch-properties-material-type').val();
		
		sketch.useWorkCoords = $('#sketch-properties-use-work-system').is(":checked");
		sketch.toInch = $('#sketch-properties-mm-to-inch').is(":checked");
		sketch.compDeviceLength = $('#sketch-properties-compensation-dvice-length').is(":checked");
		sketch.useCircularInterpolation = $('#sketch-properties-use-circ-inter').is(":checked");
		sketch.useChoosedStop =  $('#sketch-properties-use-choosed-stop').is(":checked");

		sketch.workCoords = {
			x: +$('#sketch-properties-work-system-x').val(),
			y: +$('#sketch-properties-work-system-y').val()
		};
	})
			).append($('<button>')
			.attr('type', 'button')
			.attr('class', 'btn btn-secondary')
			.attr('data-dismiss', 'modal')
			.html(__("CANCEL")));

	$('#modalWindow .modal-body').html($('#sketch-properties-modal-body').html());
	$('#sketch-properties-form-inter').val(sketch.interpolationStep);
	$('#sketch-properties-form-inter-value').html("(" + sketch.interpolationStep + ")");

	$('#sketch-properties-material-deeps').val(sketch.materialDeep);
	$('#sketch-properties-material-type').val(sketch.material);

	if (sketch.useWorkCoords) {
		$('#sketch-properties-use-work-system').attr('checked', 'checked');
		$('.sketch-properties-work-system').removeAttr("disabled");

		$('#sketch-properties-work-system-x').val(sketch.workCoords.x);
		$('#sketch-properties-work-system-y').val(sketch.workCoords.y);
	} else {
		$('.sketch-properties-work-system').attr("disabled", "true");
	}

	if (sketch.toInch) {
		$('#sketch-properties-mm-to-inch').attr('checked', 'checked');
	}

	if (sketch.compDeviceLength) {
		$('#sketch-properties-compensation-dvice-length').attr('checked', 'checked');
	}

	if (sketch.useCircularInterpolation) {
		$('#sketch-properties-use-circ-inter').attr('checked', 'checked');
	}
	
	if (sketch.useChoosedStop) {
		$('#sketch-properties-use-choosed-stop').attr('checked', 'checked');
	}


	buildSketchPropsStepDemo();

	$('#sketch-properties-form-inter').on('change', function () {
		sketch.interpolationStep = +$(this).val();
		$('#sketch-properties-form-inter-value').html("(" + sketch.interpolationStep + ")");
		buildSketchPropsStepDemo();
	});

	$('#sketch-properties-use-work-system').on('change', function () {
		if (!$(this).is(":checked")) {
			$('.sketch-properties-work-system').attr("disabled", "true");
		} else {
			$('.sketch-properties-work-system').removeAttr("disabled");
		}
	});

	$('#modalWindow').modal();
}

function showHardwareSettingsModal() {
	$('#modalWindow .modal-title').html(__("Hardware Properties"));

	$('#modalWindow .modal-footer').html('').append(
			$('<button>')
			.attr('type', 'button')
			.attr('class', 'btn btn-secondary')
			.attr('data-dismiss', 'modal')
			.html(__("SAVE")).on("click", function () {
		hardware.deviceId = +$("#hardware-settings-form-device").val();
		hardware.dreelSize = +$("#hardware-settings-drill-size").val();
		hardware.speed = +$("#hardware-settings-speed").val();

		hardware.rotation = +$("#hardware-settings-drill-rotation").val();
		hardware.dreelNumber = +$("#hardware-settings-drill-no").val();

		hardware.coolantSupply = $('#hardware-settings-coolant-supply').is(":checked");
	})
			).append($('<button>')
			.attr('type', 'button')
			.attr('class', 'btn btn-secondary')
			.attr('data-dismiss', 'modal')
			.html(__("CANCEL")));

	$('#modalWindow .modal-body').html($('#hardware-settings-modal-body').html());

	$("#hardware-settings-form-device").val(hardware.deviceId);

	$("#hardware-settings-drill-size").val(hardware.dreelSize);
	$("#hardware-settings-drill-size-value").html("(" + $("#hardware-settings-drill-size").val() + ")");

	$("#hardware-settings-speed").val(hardware.speed);

	if (hardware.coolantSupply) {
		$('#hardware-settings-coolant-supply').attr('checked', 'checked');
	}

	$("#hardware-settings-drill-no").val(hardware.dreelNumber);
	$("#hardware-settings-drill-rotation").val(hardware.rotation);

	buildSketchDrillSize(hardware.dreelSize);
	imgToDrillRotation();

	$("#device-pic").attr("src", "img/hardware_1_" + hardware.deviceId + ".jpg");

	$('#hardware-settings-form-device').on('change', function () {
		$("#device-pic").attr("src", "img/hardware_1_" + $("#hardware-settings-form-device").val() + ".jpg");
	});

	$('#hardware-settings-drill-size').on('change', function () {
		buildSketchDrillSize(+$("#hardware-settings-drill-size").val());
		$("#hardware-settings-drill-size-value").html("(" + $("#hardware-settings-drill-size").val() + ")");
	});

	$('#hardware-settings-drill-rotation').on('change', function () {
		imgToDrillRotation();
	});

	$('#modalWindow').modal();
}

function showLoadFromBdModal() {
	$('#modalWindow .modal-title').html(__("Import Sketch from DB"));

	$('#modalWindow .modal-footer').html('');

	$('#modalWindow .modal-body').html($('#load-from-bd-modal-body').html());

	$.post(
			'../action/getSketchesFromDb.php',
			null,
			function (data) {
				$("#load-from-bd-modal-body-loading").css("display", "none");
				$("#modalWindow .modal-body table").css("display", "table");
				let sketches = JSON.parse(data)
				sketches.forEach(function (elem) {
					$('#modalWindow .modal-body table').append(
							$("<tr>")
							.append($("<td>").html(elem.name))
							.append($("<td>").html(formatDate(new Date(+elem.created_at * 1000))))
							.append($("<td>").append($("<span>").css("cursor", "pointer").addClass("oi oi-data-transfer-download").attr("data-file", elem.filepath).on("click", function () {
								$.post(
										'../action/loadSketchFromServer.php',
										{file: $(this).data("file")},
										function (data) {
											loadSketch(data);
										},
										'text'
										);
								$('#modalWindow').modal('toggle');
							})))
							);
				});
			},
			'text'
			);

	$('#modalWindow').modal();
}

function showSketchTotalInfoModal(data) {
	$('#modalWindow .modal-title').html(__("Sketch Total Info"));
	$('#modalWindow .modal-footer').html('').append(
			$('<button>')
			.attr('type', 'button')
			.attr('class', 'btn btn-secondary')
			.attr('data-dismiss', 'modal')
			.html('OK')
			);
	$('#modalWindow .modal-body').html($('#sketch-info-modal-body').html());

	$('.modal-body #sketch-info-modal-body-form-length').html(data['length'].toFixed(2));
	$('.modal-body #sketch-info-modal-body-form-square').html(data['square'].toFixed(2));
	$('.modal-body #sketch-info-modal-body-form-commands-count').html(data['commandsCount']);
	$('.modal-body #sketch-info-modal-body-form-cost').html(data['price'].toFixed(2));
	$('.modal-body #sketch-info-modal-body-form-time').html(parseInt(data['time']));
	$('#modalWindow').modal();
}

function buildSketchPropsStepDemo() {
	let p1 = {x: 0, y: 0};
	let p2 = {x: 25, y: 50};
	let p3 = {x: 50, y: 0};

	let sPoints = "";
	let p = {};

	for (let t = 0; t <= 1 + +sketch.interpolationStep; t += +sketch.interpolationStep) {
		p.x = Math.pow(1 - t, 2) * p1.x + 2 * (1 - t) * t * p2.x + Math.pow(t, 2) * p3.x;
		p.y = Math.pow(1 - t, 2) * p1.y + 2 * (1 - t) * t * p2.y + Math.pow(t, 2) * p3.y;

		sPoints += " " + p.x + "," + p.y;
	}

	let sPolyline = $("<polyline/>").attr("points", sPoints)
			.attr("stroke", "black")
			.attr("stroke-width", this.strokeWidth)
			.attr("fill", "transparent");

	$('#sketch-step-demo').html("");
	$('#sketch-step-demo').append(sPolyline);
	$('#sketch-step-demo').html($('#sketch-step-demo').html());
}

function buildSketchDrillSize(diameter) {
	let offset = 20 + 0.25 * 20;

	let circle = $("<circle/>")
			.attr("cx", offset)
			.attr("cy", offset)
			.attr("r", diameter)
			.attr("stroke", "black")
			.attr("stroke-width", this.strokeWidth)
			.attr("fill", "white");

	let lineX = $('<line/>')
			.attr("x1", Math.abs(offset - diameter) - 0.25 * diameter)
			.attr("y1", offset)
			.attr("x2", offset + 1.25 * diameter)
			.attr("y2", offset)
			.attr('stroke', "black")
			.attr("stroke-dasharray", "6, 3");

	let lineY = $('<line/>')
			.attr("x1", offset)
			.attr("y1", Math.abs(offset - diameter) - 0.25 * diameter)
			.attr("x2", offset)
			.attr("y2", offset + 1.25 * diameter)
			.attr('stroke', "black")
			.attr("stroke-dasharray", "6, 3");

	$('#drill-size').html("");
	$('#drill-size').append(circle).append(lineX).append(lineY);
	;
	$('#drill-size').html($('#drill-size').html());
}

function imgToDrillRotation() {

	switch (+$("#hardware-settings-drill-rotation").val()) {
		case 1:
			$("#hardware-settings-drill-rotation-img").attr("src", "clockwise.png");
			break;
		case 2:
			$("#hardware-settings-drill-rotation-img").attr("src", "anti-clockwise.jpg");
			break;
	}

}