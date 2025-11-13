jQuery(document).ready(function ($) {
	var map = new L.Map("map", {
		center: new L.LatLng(53.9618, 58.4277),
		zoom: 13,
	});
	var osm = new L.TileLayer("https://map.gtt.to.it/pandonia/{z}/{x}/{y}.png").addTo(map);
	var styles = [
		{
			featureType: "administrative",
			elementType: "all",
			stylers: [
				{
					visibility: "on",
				},
				{
					lightness: 33,
				},
			],
		},
		{
			featureType: "landscape",
			elementType: "all",
			stylers: [
				{
					color: "#f2e5d4",
				},
			],
		},
		{
			featureType: "poi.park",
			elementType: "geometry",
			stylers: [
				{
					color: "#c5dac6",
				},
			],
		},
		{
			featureType: "poi.park",
			elementType: "labels",
			stylers: [
				{
					visibility: "on",
				},
				{
					lightness: 20,
				},
			],
		},
		{
			featureType: "road",
			elementType: "all",
			stylers: [
				{
					lightness: 20,
				},
			],
		},
		{
			featureType: "road.highway",
			elementType: "geometry",
			stylers: [
				{
					color: "#c5c6c6",
				},
			],
		},
		{
			featureType: "road.arterial",
			elementType: "geometry",
			stylers: [
				{
					color: "#e4d7c6",
				},
			],
		},
		{
			featureType: "road.local",
			elementType: "geometry",
			stylers: [
				{
					color: "#fbfaf7",
				},
			],
		},
		{
			featureType: "transit",
			elementType: "all",
			stylers: [
				{
					hue: "#f69d94",
				},
				{
					saturation: 84,
				},
				{
					lightness: 9,
				},
				{
					visibility: "off",
				},
			],
		},
		{
			featureType: "water",
			elementType: "all",
			stylers: [
				{
					visibility: "on",
				},
				{
					color: "#acbcc9",
				},
			],
		},
	];

	var ico_palina = L.icon({
		iconUrl: "/leaflet/images/ico3/ico_bus_giallo.png",
	});
	var ico_palina_start = L.icon({
		iconUrl: "/leaflet/images/ico3/ico_verde.png",
	});
	var ico_palina_stop = L.icon({
		iconUrl: "/leaflet/images/ico3/ico_rossa.png",
	});

	map.addControl(new L.Control.Fullscreen());

	function FormatDissPassagio(passaggio) {
		if (passaggio.length > 5) {
			var s_passaggio = passaggio.substring(0, 5);
			if (s_passaggio.indexOf("_") != 6) {
				var s_passaggio_type = s_passaggio.substring(5, 6);
				var s_passaggio_title;
				switch (s_passaggio_type) {
					case "R":
						s_passaggio_title = "per ritardo";
						break;
					case "G":
						s_passaggio_title = "per guasto";
						break;
					default:
						s_passaggio_title = "generico";
						break;
				}
				s_passaggio_title = "Il seguente passaggio teorico potrebbe essere soggetto ad un disservizio " + s_passaggio_title;
				var s_passaggio_style = 'style="text-decoration: line-through;" ';
			} else {
				var s_passaggio_style = "";
				var s_passaggio_title = "";
			}
			return (
				"<em " +
				s_passaggio_style +
				'">' +
				s_passaggio +
				'</em><i class="fa fa-exclamation-triangle" aria-hidden="true" style="color: orangered;" title="' +
				s_passaggio_title +
				'"></i>' +
				"&nbsp;"
			);
		} else {
			return "<em>" + passaggio + "&nbsp;" + "</em>";
		}
	}

	var myIcon = L.icon({
		iconUrl: "/leaflet/images/ico3/ico_verde.png",
		className: "percorso0",
		iconAnchor: [12, 25],
	});
	L.marker([45.12011, 7.71079], {
		icon: myIcon,
	})
		.addTo(map)
		.bindPopup(
			'<div id="popupcontent_0"><p>Fermata: <strong>1362 - PARK STURA CAP.</strong>. <br>Passaggi (* se previsione in tempo reale):</p><div class="loading">Caricamento dati <span class="glyphicon glyphicon-refresh glyphicon-refresh-animate"></span></div></div>',
			{
				minWidth: 420,
				maxHeight: 400,
			}
		)
		.on("click", function (e) {
			jQuery.getJSON(
				"/cms/index.php?option=com_gtt&task=palina.getTransitiOld&palina=1362&bacino=U&realtime=true",
				{
					get_param: "value",
				},
				function (data) {
					jQuery(".loading").hide();
					jQuery("#popupcontent_0").append('<table id="table_popup_0" class="table table-condensed table-striped table-hover passaggi"></table>');
					jQuery.each(data, function (index, element) {
						var row = jQuery("<tr>");
						if (element.Linea != undefined) {
							row.append("<th>" + element.LineaAlias + "<small> (" + element.Direzione + ")</small></th>");

							controllo_passaggi = 0;

							jQuery.each(element.PassaggiRT, function (i, passaggio) {
								++controllo_passaggi;
								if (controllo_passaggi < 5) {
									var td = jQuery("<td>").text(passaggio).append("<sup>*</sup>").appendTo(row).wrapInner("<i></i>");
								}
							});

							if (controllo_passaggi == 0) {
								jQuery.each(element.PassaggiPR, function (i, passaggio) {
									++controllo_passaggi;
									if (controllo_passaggi <= 5) {
										var td = jQuery("<td>").append(FormatDissPassagio(passaggio)).appendTo(row);
									}
								});
							}

							if (row.find("td").length == "1") {
								var td = jQuery("<td>").text(" ").appendTo(row);
							}
							if (row.find("td").length == "2") {
								var td = jQuery("<td>").text(" ").appendTo(row);
							}
							if (row.find("td").length == "3") {
								var td = jQuery("<td>").text(" ").appendTo(row);
							}
							if (row.find("td").length == "4") {
								var td = jQuery("<td>").text(" ").appendTo(row);
							}
						} else row.append("<th>Nessun risultato</th>");

						jQuery("#table_popup_0").append(row);
					});
				}
			);
			map.panTo(this.getLatLng()); //centratura del fumetto al click
		});

	var myIcon = L.icon({
		iconUrl: "/leaflet/images/ico3/bus_stop_r.png",
		className: "percorso0",
		iconAnchor: [12, 25],
	});
	L.marker([45.11885, 7.70993], {
		icon: myIcon,
	})
		.addTo(map)
		.bindPopup(
			'<div id="popupcontent_1"><p>Fermata: <strong>1183 - AUTOSTRADE NORD</strong>. <br>Passaggi (* se previsione in tempo reale):</p><div class="loading">Caricamento dati <span class="glyphicon glyphicon-refresh glyphicon-refresh-animate"></span></div></div>',
			{
				minWidth: 420,
				maxHeight: 400,
			}
		)
		.on("click", function (e) {
			jQuery.getJSON(
				"/cms/index.php?option=com_gtt&task=palina.getTransitiOld&palina=1183&bacino=U&realtime=true",
				{
					get_param: "value",
				},
				function (data) {
					jQuery(".loading").hide();
					jQuery("#popupcontent_1").append('<table id="table_popup_1" class="table table-condensed table-striped table-hover passaggi"></table>');
					jQuery.each(data, function (index, element) {
						var row = jQuery("<tr>");
						if (element.Linea != undefined) {
							row.append("<th>" + element.LineaAlias + "<small> (" + element.Direzione + ")</small></th>");

							controllo_passaggi = 0;

							jQuery.each(element.PassaggiRT, function (i, passaggio) {
								++controllo_passaggi;
								if (controllo_passaggi < 5) {
									var td = jQuery("<td>").text(passaggio).append("<sup>*</sup>").appendTo(row).wrapInner("<i></i>");
								}
							});

							if (controllo_passaggi == 0) {
								jQuery.each(element.PassaggiPR, function (i, passaggio) {
									++controllo_passaggi;
									if (controllo_passaggi <= 5) {
										var td = jQuery("<td>").append(FormatDissPassagio(passaggio)).appendTo(row);
									}
								});
							}

							if (row.find("td").length == "1") {
								var td = jQuery("<td>").text(" ").appendTo(row);
							}
							if (row.find("td").length == "2") {
								var td = jQuery("<td>").text(" ").appendTo(row);
							}
							if (row.find("td").length == "3") {
								var td = jQuery("<td>").text(" ").appendTo(row);
							}
							if (row.find("td").length == "4") {
								var td = jQuery("<td>").text(" ").appendTo(row);
							}
						} else row.append("<th>Nessun risultato</th>");

						jQuery("#table_popup_1").append(row);
					});
				}
			);
			map.panTo(this.getLatLng()); //centratura del fumetto al click
		});

	var myIcon = L.icon({
		iconUrl: "/leaflet/images/ico3/bus_stop_r.png",
		className: "percorso0",
		iconAnchor: [12, 25],
	});
	L.marker([45.11776, 7.70623], {
		icon: myIcon,
	})
		.addTo(map)
		.bindPopup(
			'<div id="popupcontent_2"><p>Fermata: <strong>1331 - TEMPIA</strong>. <br>Passaggi (* se previsione in tempo reale):</p><div class="loading">Caricamento dati <span class="glyphicon glyphicon-refresh glyphicon-refresh-animate"></span></div></div>',
			{
				minWidth: 420,
				maxHeight: 400,
			}
		)
		.on("click", function (e) {
			jQuery.getJSON(
				"/cms/index.php?option=com_gtt&task=palina.getTransitiOld&palina=1331&bacino=U&realtime=true",
				{
					get_param: "value",
				},
				function (data) {
					jQuery(".loading").hide();
					jQuery("#popupcontent_2").append('<table id="table_popup_2" class="table table-condensed table-striped table-hover passaggi"></table>');
					jQuery.each(data, function (index, element) {
						var row = jQuery("<tr>");
						if (element.Linea != undefined) {
							row.append("<th>" + element.LineaAlias + "<small> (" + element.Direzione + ")</small></th>");

							controllo_passaggi = 0;

							jQuery.each(element.PassaggiRT, function (i, passaggio) {
								++controllo_passaggi;
								if (controllo_passaggi < 5) {
									var td = jQuery("<td>").text(passaggio).append("<sup>*</sup>").appendTo(row).wrapInner("<i></i>");
								}
							});

							if (controllo_passaggi == 0) {
								jQuery.each(element.PassaggiPR, function (i, passaggio) {
									++controllo_passaggi;
									if (controllo_passaggi <= 5) {
										var td = jQuery("<td>").append(FormatDissPassagio(passaggio)).appendTo(row);
									}
								});
							}

							if (row.find("td").length == "1") {
								var td = jQuery("<td>").text(" ").appendTo(row);
							}
							if (row.find("td").length == "2") {
								var td = jQuery("<td>").text(" ").appendTo(row);
							}
							if (row.find("td").length == "3") {
								var td = jQuery("<td>").text(" ").appendTo(row);
							}
							if (row.find("td").length == "4") {
								var td = jQuery("<td>").text(" ").appendTo(row);
							}
						} else row.append("<th>Nessun risultato</th>");

						jQuery("#table_popup_2").append(row);
					});
				}
			);
			map.panTo(this.getLatLng()); //centratura del fumetto al click
		});

	var myIcon = L.icon({
		iconUrl: "/leaflet/images/ico3/bus_stop_r.png",
		className: "percorso0",
		iconAnchor: [12, 25],
	});
	L.marker([45.11722, 7.70442], {
		icon: myIcon,
	})
		.addTo(map)
		.bindPopup(
			'<div id="popupcontent_3"><p>Fermata: <strong>1186 - IVREA</strong>. <br>Passaggi (* se previsione in tempo reale):</p><div class="loading">Caricamento dati <span class="glyphicon glyphicon-refresh glyphicon-refresh-animate"></span></div></div>',
			{
				minWidth: 420,
				maxHeight: 400,
			}
		)
		.on("click", function (e) {
			jQuery.getJSON(
				"/cms/index.php?option=com_gtt&task=palina.getTransitiOld&palina=1186&bacino=U&realtime=true",
				{
					get_param: "value",
				},
				function (data) {
					jQuery(".loading").hide();
					jQuery("#popupcontent_3").append('<table id="table_popup_3" class="table table-condensed table-striped table-hover passaggi"></table>');
					jQuery.each(data, function (index, element) {
						var row = jQuery("<tr>");
						if (element.Linea != undefined) {
							row.append("<th>" + element.LineaAlias + "<small> (" + element.Direzione + ")</small></th>");

							controllo_passaggi = 0;

							jQuery.each(element.PassaggiRT, function (i, passaggio) {
								++controllo_passaggi;
								if (controllo_passaggi < 5) {
									var td = jQuery("<td>").text(passaggio).append("<sup>*</sup>").appendTo(row).wrapInner("<i></i>");
								}
							});

							if (controllo_passaggi == 0) {
								jQuery.each(element.PassaggiPR, function (i, passaggio) {
									++controllo_passaggi;
									if (controllo_passaggi <= 5) {
										var td = jQuery("<td>").append(FormatDissPassagio(passaggio)).appendTo(row);
									}
								});
							}

							if (row.find("td").length == "1") {
								var td = jQuery("<td>").text(" ").appendTo(row);
							}
							if (row.find("td").length == "2") {
								var td = jQuery("<td>").text(" ").appendTo(row);
							}
							if (row.find("td").length == "3") {
								var td = jQuery("<td>").text(" ").appendTo(row);
							}
							if (row.find("td").length == "4") {
								var td = jQuery("<td>").text(" ").appendTo(row);
							}
						} else row.append("<th>Nessun risultato</th>");

						jQuery("#table_popup_3").append(row);
					});
				}
			);
			map.panTo(this.getLatLng()); //centratura del fumetto al click
		});

	var myIcon = L.icon({
		iconUrl: "/leaflet/images/ico3/bus_stop_r.png",
		className: "percorso0",
		iconAnchor: [12, 25],
	});
	L.marker([45.11634, 7.70125], {
		icon: myIcon,
	})
		.addTo(map)
		.bindPopup(
			'<div id="popupcontent_4"><p>Fermata: <strong>1188 - ANTIOCA</strong>. <br>Passaggi (* se previsione in tempo reale):</p><div class="loading">Caricamento dati <span class="glyphicon glyphicon-refresh glyphicon-refresh-animate"></span></div></div>',
			{
				minWidth: 420,
				maxHeight: 400,
			}
		)
		.on("click", function (e) {
			jQuery.getJSON(
				"/cms/index.php?option=com_gtt&task=palina.getTransitiOld&palina=1188&bacino=U&realtime=true",
				{
					get_param: "value",
				},
				function (data) {
					jQuery(".loading").hide();
					jQuery("#popupcontent_4").append('<table id="table_popup_4" class="table table-condensed table-striped table-hover passaggi"></table>');
					jQuery.each(data, function (index, element) {
						var row = jQuery("<tr>");
						if (element.Linea != undefined) {
							row.append("<th>" + element.LineaAlias + "<small> (" + element.Direzione + ")</small></th>");

							controllo_passaggi = 0;

							jQuery.each(element.PassaggiRT, function (i, passaggio) {
								++controllo_passaggi;
								if (controllo_passaggi < 5) {
									var td = jQuery("<td>").text(passaggio).append("<sup>*</sup>").appendTo(row).wrapInner("<i></i>");
								}
							});

							if (controllo_passaggi == 0) {
								jQuery.each(element.PassaggiPR, function (i, passaggio) {
									++controllo_passaggi;
									if (controllo_passaggi <= 5) {
										var td = jQuery("<td>").append(FormatDissPassagio(passaggio)).appendTo(row);
									}
								});
							}

							if (row.find("td").length == "1") {
								var td = jQuery("<td>").text(" ").appendTo(row);
							}
							if (row.find("td").length == "2") {
								var td = jQuery("<td>").text(" ").appendTo(row);
							}
							if (row.find("td").length == "3") {
								var td = jQuery("<td>").text(" ").appendTo(row);
							}
							if (row.find("td").length == "4") {
								var td = jQuery("<td>").text(" ").appendTo(row);
							}
						} else row.append("<th>Nessun risultato</th>");

						jQuery("#table_popup_4").append(row);
					});
				}
			);
			map.panTo(this.getLatLng()); //centratura del fumetto al click
		});

	var myIcon = L.icon({
		iconUrl: "/leaflet/images/ico3/bus_stop_r.png",
		className: "percorso0",
		iconAnchor: [12, 25],
	});
	L.marker([45.11507, 7.69887], {
		icon: myIcon,
	})
		.addTo(map)
		.bindPopup(
			'<div id="popupcontent_5"><p>Fermata: <strong>3538 - GERMAGNANO </strong>. <br>Passaggi (* se previsione in tempo reale):</p><div class="loading">Caricamento dati <span class="glyphicon glyphicon-refresh glyphicon-refresh-animate"></span></div></div>',
			{
				minWidth: 420,
				maxHeight: 400,
			}
		)
		.on("click", function (e) {
			jQuery.getJSON(
				"/cms/index.php?option=com_gtt&task=palina.getTransitiOld&palina=3538&bacino=U&realtime=true",
				{
					get_param: "value",
				},
				function (data) {
					jQuery(".loading").hide();
					jQuery("#popupcontent_5").append('<table id="table_popup_5" class="table table-condensed table-striped table-hover passaggi"></table>');
					jQuery.each(data, function (index, element) {
						var row = jQuery("<tr>");
						if (element.Linea != undefined) {
							row.append("<th>" + element.LineaAlias + "<small> (" + element.Direzione + ")</small></th>");

							controllo_passaggi = 0;

							jQuery.each(element.PassaggiRT, function (i, passaggio) {
								++controllo_passaggi;
								if (controllo_passaggi < 5) {
									var td = jQuery("<td>").text(passaggio).append("<sup>*</sup>").appendTo(row).wrapInner("<i></i>");
								}
							});

							if (controllo_passaggi == 0) {
								jQuery.each(element.PassaggiPR, function (i, passaggio) {
									++controllo_passaggi;
									if (controllo_passaggi <= 5) {
										var td = jQuery("<td>").append(FormatDissPassagio(passaggio)).appendTo(row);
									}
								});
							}

							if (row.find("td").length == "1") {
								var td = jQuery("<td>").text(" ").appendTo(row);
							}
							if (row.find("td").length == "2") {
								var td = jQuery("<td>").text(" ").appendTo(row);
							}
							if (row.find("td").length == "3") {
								var td = jQuery("<td>").text(" ").appendTo(row);
							}
							if (row.find("td").length == "4") {
								var td = jQuery("<td>").text(" ").appendTo(row);
							}
						} else row.append("<th>Nessun risultato</th>");

						jQuery("#table_popup_5").append(row);
					});
				}
			);
			map.panTo(this.getLatLng()); //centratura del fumetto al click
		});

	var myIcon = L.icon({
		iconUrl: "/leaflet/images/ico3/bus_stop_r.png",
		className: "percorso0",
		iconAnchor: [12, 25],
	});
	L.marker([45.11073, 7.69775], {
		icon: myIcon,
	})
		.addTo(map)
		.bindPopup(
			'<div id="popupcontent_6"><p>Fermata: <strong>1190 - BELGIOIOSO</strong>. <br>Passaggi (* se previsione in tempo reale):</p><div class="loading">Caricamento dati <span class="glyphicon glyphicon-refresh glyphicon-refresh-animate"></span></div></div>',
			{
				minWidth: 420,
				maxHeight: 400,
			}
		)
		.on("click", function (e) {
			jQuery.getJSON(
				"/cms/index.php?option=com_gtt&task=palina.getTransitiOld&palina=1190&bacino=U&realtime=true",
				{
					get_param: "value",
				},
				function (data) {
					jQuery(".loading").hide();
					jQuery("#popupcontent_6").append('<table id="table_popup_6" class="table table-condensed table-striped table-hover passaggi"></table>');
					jQuery.each(data, function (index, element) {
						var row = jQuery("<tr>");
						if (element.Linea != undefined) {
							row.append("<th>" + element.LineaAlias + "<small> (" + element.Direzione + ")</small></th>");

							controllo_passaggi = 0;

							jQuery.each(element.PassaggiRT, function (i, passaggio) {
								++controllo_passaggi;
								if (controllo_passaggi < 5) {
									var td = jQuery("<td>").text(passaggio).append("<sup>*</sup>").appendTo(row).wrapInner("<i></i>");
								}
							});

							if (controllo_passaggi == 0) {
								jQuery.each(element.PassaggiPR, function (i, passaggio) {
									++controllo_passaggi;
									if (controllo_passaggi <= 5) {
										var td = jQuery("<td>").append(FormatDissPassagio(passaggio)).appendTo(row);
									}
								});
							}

							if (row.find("td").length == "1") {
								var td = jQuery("<td>").text(" ").appendTo(row);
							}
							if (row.find("td").length == "2") {
								var td = jQuery("<td>").text(" ").appendTo(row);
							}
							if (row.find("td").length == "3") {
								var td = jQuery("<td>").text(" ").appendTo(row);
							}
							if (row.find("td").length == "4") {
								var td = jQuery("<td>").text(" ").appendTo(row);
							}
						} else row.append("<th>Nessun risultato</th>");

						jQuery("#table_popup_6").append(row);
					});
				}
			);
			map.panTo(this.getLatLng()); //centratura del fumetto al click
		});

	var myIcon = L.icon({
		iconUrl: "/leaflet/images/ico3/bus_stop_r.png",
		className: "percorso0",
		iconAnchor: [12, 25],
	});
	L.marker([45.10887, 7.69724], {
		icon: myIcon,
	})
		.addTo(map)
		.bindPopup(
			'<div id="popupcontent_7"><p>Fermata: <strong>1192 - CENA</strong>. <br>Passaggi (* se previsione in tempo reale):</p><div class="loading">Caricamento dati <span class="glyphicon glyphicon-refresh glyphicon-refresh-animate"></span></div></div>',
			{
				minWidth: 420,
				maxHeight: 400,
			}
		)
		.on("click", function (e) {
			jQuery.getJSON(
				"/cms/index.php?option=com_gtt&task=palina.getTransitiOld&palina=1192&bacino=U&realtime=true",
				{
					get_param: "value",
				},
				function (data) {
					jQuery(".loading").hide();
					jQuery("#popupcontent_7").append('<table id="table_popup_7" class="table table-condensed table-striped table-hover passaggi"></table>');
					jQuery.each(data, function (index, element) {
						var row = jQuery("<tr>");
						if (element.Linea != undefined) {
							row.append("<th>" + element.LineaAlias + "<small> (" + element.Direzione + ")</small></th>");

							controllo_passaggi = 0;

							jQuery.each(element.PassaggiRT, function (i, passaggio) {
								++controllo_passaggi;
								if (controllo_passaggi < 5) {
									var td = jQuery("<td>").text(passaggio).append("<sup>*</sup>").appendTo(row).wrapInner("<i></i>");
								}
							});

							if (controllo_passaggi == 0) {
								jQuery.each(element.PassaggiPR, function (i, passaggio) {
									++controllo_passaggi;
									if (controllo_passaggi <= 5) {
										var td = jQuery("<td>").append(FormatDissPassagio(passaggio)).appendTo(row);
									}
								});
							}

							if (row.find("td").length == "1") {
								var td = jQuery("<td>").text(" ").appendTo(row);
							}
							if (row.find("td").length == "2") {
								var td = jQuery("<td>").text(" ").appendTo(row);
							}
							if (row.find("td").length == "3") {
								var td = jQuery("<td>").text(" ").appendTo(row);
							}
							if (row.find("td").length == "4") {
								var td = jQuery("<td>").text(" ").appendTo(row);
							}
						} else row.append("<th>Nessun risultato</th>");

						jQuery("#table_popup_7").append(row);
					});
				}
			);
			map.panTo(this.getLatLng()); //centratura del fumetto al click
		});

	var myIcon = L.icon({
		iconUrl: "/leaflet/images/ico3/bus_stop_r.png",
		className: "percorso0",
		iconAnchor: [12, 25],
	});
	L.marker([45.10586, 7.69636], {
		icon: myIcon,
	})
		.addTo(map)
		.bindPopup(
			'<div id="popupcontent_8"><p>Fermata: <strong>1194 - REISS ROMOLI</strong>. <br>Passaggi (* se previsione in tempo reale):</p><div class="loading">Caricamento dati <span class="glyphicon glyphicon-refresh glyphicon-refresh-animate"></span></div></div>',
			{
				minWidth: 420,
				maxHeight: 400,
			}
		)
		.on("click", function (e) {
			jQuery.getJSON(
				"/cms/index.php?option=com_gtt&task=palina.getTransitiOld&palina=1194&bacino=U&realtime=true",
				{
					get_param: "value",
				},
				function (data) {
					jQuery(".loading").hide();
					jQuery("#popupcontent_8").append('<table id="table_popup_8" class="table table-condensed table-striped table-hover passaggi"></table>');
					jQuery.each(data, function (index, element) {
						var row = jQuery("<tr>");
						if (element.Linea != undefined) {
							row.append("<th>" + element.LineaAlias + "<small> (" + element.Direzione + ")</small></th>");

							controllo_passaggi = 0;

							jQuery.each(element.PassaggiRT, function (i, passaggio) {
								++controllo_passaggi;
								if (controllo_passaggi < 5) {
									var td = jQuery("<td>").text(passaggio).append("<sup>*</sup>").appendTo(row).wrapInner("<i></i>");
								}
							});

							if (controllo_passaggi == 0) {
								jQuery.each(element.PassaggiPR, function (i, passaggio) {
									++controllo_passaggi;
									if (controllo_passaggi <= 5) {
										var td = jQuery("<td>").append(FormatDissPassagio(passaggio)).appendTo(row);
									}
								});
							}

							if (row.find("td").length == "1") {
								var td = jQuery("<td>").text(" ").appendTo(row);
							}
							if (row.find("td").length == "2") {
								var td = jQuery("<td>").text(" ").appendTo(row);
							}
							if (row.find("td").length == "3") {
								var td = jQuery("<td>").text(" ").appendTo(row);
							}
							if (row.find("td").length == "4") {
								var td = jQuery("<td>").text(" ").appendTo(row);
							}
						} else row.append("<th>Nessun risultato</th>");

						jQuery("#table_popup_8").append(row);
					});
				}
			);
			map.panTo(this.getLatLng()); //centratura del fumetto al click
		});

	var myIcon = L.icon({
		iconUrl: "/leaflet/images/ico3/bus_stop_r.png",
		className: "percorso0",
		iconAnchor: [12, 25],
	});
	L.marker([45.10281, 7.69489], {
		icon: myIcon,
	})
		.addTo(map)
		.bindPopup(
			'<div id="popupcontent_9"><p>Fermata: <strong>1198 - REBAUDENGO SUD</strong>. <br>Passaggi (* se previsione in tempo reale):</p><div class="loading">Caricamento dati <span class="glyphicon glyphicon-refresh glyphicon-refresh-animate"></span></div></div>',
			{
				minWidth: 420,
				maxHeight: 400,
			}
		)
		.on("click", function (e) {
			jQuery.getJSON(
				"/cms/index.php?option=com_gtt&task=palina.getTransitiOld&palina=1198&bacino=U&realtime=true",
				{
					get_param: "value",
				},
				function (data) {
					jQuery(".loading").hide();
					jQuery("#popupcontent_9").append('<table id="table_popup_9" class="table table-condensed table-striped table-hover passaggi"></table>');
					jQuery.each(data, function (index, element) {
						var row = jQuery("<tr>");
						if (element.Linea != undefined) {
							row.append("<th>" + element.LineaAlias + "<small> (" + element.Direzione + ")</small></th>");

							controllo_passaggi = 0;

							jQuery.each(element.PassaggiRT, function (i, passaggio) {
								++controllo_passaggi;
								if (controllo_passaggi < 5) {
									var td = jQuery("<td>").text(passaggio).append("<sup>*</sup>").appendTo(row).wrapInner("<i></i>");
								}
							});

							if (controllo_passaggi == 0) {
								jQuery.each(element.PassaggiPR, function (i, passaggio) {
									++controllo_passaggi;
									if (controllo_passaggi <= 5) {
										var td = jQuery("<td>").append(FormatDissPassagio(passaggio)).appendTo(row);
									}
								});
							}

							if (row.find("td").length == "1") {
								var td = jQuery("<td>").text(" ").appendTo(row);
							}
							if (row.find("td").length == "2") {
								var td = jQuery("<td>").text(" ").appendTo(row);
							}
							if (row.find("td").length == "3") {
								var td = jQuery("<td>").text(" ").appendTo(row);
							}
							if (row.find("td").length == "4") {
								var td = jQuery("<td>").text(" ").appendTo(row);
							}
						} else row.append("<th>Nessun risultato</th>");

						jQuery("#table_popup_9").append(row);
					});
				}
			);
			map.panTo(this.getLatLng()); //centratura del fumetto al click
		});

	var myIcon = L.icon({
		iconUrl: "/leaflet/images/ico3/bus_stop_r.png",
		className: "percorso0",
		iconAnchor: [12, 25],
	});
	L.marker([45.10061, 7.69379], {
		icon: myIcon,
	})
		.addTo(map)
		.bindPopup(
			'<div id="popupcontent_10"><p>Fermata: <strong>1201 - GOTTARDO</strong>. <br>Passaggi (* se previsione in tempo reale):</p><div class="loading">Caricamento dati <span class="glyphicon glyphicon-refresh glyphicon-refresh-animate"></span></div></div>',
			{
				minWidth: 420,
				maxHeight: 400,
			}
		)
		.on("click", function (e) {
			jQuery.getJSON(
				"/cms/index.php?option=com_gtt&task=palina.getTransitiOld&palina=1201&bacino=U&realtime=true",
				{
					get_param: "value",
				},
				function (data) {
					jQuery(".loading").hide();
					jQuery("#popupcontent_10").append('<table id="table_popup_10" class="table table-condensed table-striped table-hover passaggi"></table>');
					jQuery.each(data, function (index, element) {
						var row = jQuery("<tr>");
						if (element.Linea != undefined) {
							row.append("<th>" + element.LineaAlias + "<small> (" + element.Direzione + ")</small></th>");

							controllo_passaggi = 0;

							jQuery.each(element.PassaggiRT, function (i, passaggio) {
								++controllo_passaggi;
								if (controllo_passaggi < 5) {
									var td = jQuery("<td>").text(passaggio).append("<sup>*</sup>").appendTo(row).wrapInner("<i></i>");
								}
							});

							if (controllo_passaggi == 0) {
								jQuery.each(element.PassaggiPR, function (i, passaggio) {
									++controllo_passaggi;
									if (controllo_passaggi <= 5) {
										var td = jQuery("<td>").append(FormatDissPassagio(passaggio)).appendTo(row);
									}
								});
							}

							if (row.find("td").length == "1") {
								var td = jQuery("<td>").text(" ").appendTo(row);
							}
							if (row.find("td").length == "2") {
								var td = jQuery("<td>").text(" ").appendTo(row);
							}
							if (row.find("td").length == "3") {
								var td = jQuery("<td>").text(" ").appendTo(row);
							}
							if (row.find("td").length == "4") {
								var td = jQuery("<td>").text(" ").appendTo(row);
							}
						} else row.append("<th>Nessun risultato</th>");

						jQuery("#table_popup_10").append(row);
					});
				}
			);
			map.panTo(this.getLatLng()); //centratura del fumetto al click
		});

	var myIcon = L.icon({
		iconUrl: "/leaflet/images/ico3/bus_stop_r.png",
		className: "percorso0",
		iconAnchor: [12, 25],
	});
	L.marker([45.09804, 7.69258], {
		icon: myIcon,
	})
		.addTo(map)
		.bindPopup(
			'<div id="popupcontent_11"><p>Fermata: <strong>1203 - RONDISSONE</strong>. <br>Passaggi (* se previsione in tempo reale):</p><div class="loading">Caricamento dati <span class="glyphicon glyphicon-refresh glyphicon-refresh-animate"></span></div></div>',
			{
				minWidth: 420,
				maxHeight: 400,
			}
		)
		.on("click", function (e) {
			jQuery.getJSON(
				"/cms/index.php?option=com_gtt&task=palina.getTransitiOld&palina=1203&bacino=U&realtime=true",
				{
					get_param: "value",
				},
				function (data) {
					jQuery(".loading").hide();
					jQuery("#popupcontent_11").append('<table id="table_popup_11" class="table table-condensed table-striped table-hover passaggi"></table>');
					jQuery.each(data, function (index, element) {
						var row = jQuery("<tr>");
						if (element.Linea != undefined) {
							row.append("<th>" + element.LineaAlias + "<small> (" + element.Direzione + ")</small></th>");

							controllo_passaggi = 0;

							jQuery.each(element.PassaggiRT, function (i, passaggio) {
								++controllo_passaggi;
								if (controllo_passaggi < 5) {
									var td = jQuery("<td>").text(passaggio).append("<sup>*</sup>").appendTo(row).wrapInner("<i></i>");
								}
							});

							if (controllo_passaggi == 0) {
								jQuery.each(element.PassaggiPR, function (i, passaggio) {
									++controllo_passaggi;
									if (controllo_passaggi <= 5) {
										var td = jQuery("<td>").append(FormatDissPassagio(passaggio)).appendTo(row);
									}
								});
							}

							if (row.find("td").length == "1") {
								var td = jQuery("<td>").text(" ").appendTo(row);
							}
							if (row.find("td").length == "2") {
								var td = jQuery("<td>").text(" ").appendTo(row);
							}
							if (row.find("td").length == "3") {
								var td = jQuery("<td>").text(" ").appendTo(row);
							}
							if (row.find("td").length == "4") {
								var td = jQuery("<td>").text(" ").appendTo(row);
							}
						} else row.append("<th>Nessun risultato</th>");

						jQuery("#table_popup_11").append(row);
					});
				}
			);
			map.panTo(this.getLatLng()); //centratura del fumetto al click
		});

	var myIcon = L.icon({
		iconUrl: "/leaflet/images/ico3/bus_stop_r.png",
		className: "percorso0",
		iconAnchor: [12, 25],
	});
	L.marker([45.09505, 7.69111], {
		icon: myIcon,
	})
		.addTo(map)
		.bindPopup(
			'<div id="popupcontent_12"><p>Fermata: <strong>1205 - LAURO ROSSI</strong>. <br>Passaggi (* se previsione in tempo reale):</p><div class="loading">Caricamento dati <span class="glyphicon glyphicon-refresh glyphicon-refresh-animate"></span></div></div>',
			{
				minWidth: 420,
				maxHeight: 400,
			}
		)
		.on("click", function (e) {
			jQuery.getJSON(
				"/cms/index.php?option=com_gtt&task=palina.getTransitiOld&palina=1205&bacino=U&realtime=true",
				{
					get_param: "value",
				},
				function (data) {
					jQuery(".loading").hide();
					jQuery("#popupcontent_12").append('<table id="table_popup_12" class="table table-condensed table-striped table-hover passaggi"></table>');
					jQuery.each(data, function (index, element) {
						var row = jQuery("<tr>");
						if (element.Linea != undefined) {
							row.append("<th>" + element.LineaAlias + "<small> (" + element.Direzione + ")</small></th>");

							controllo_passaggi = 0;

							jQuery.each(element.PassaggiRT, function (i, passaggio) {
								++controllo_passaggi;
								if (controllo_passaggi < 5) {
									var td = jQuery("<td>").text(passaggio).append("<sup>*</sup>").appendTo(row).wrapInner("<i></i>");
								}
							});

							if (controllo_passaggi == 0) {
								jQuery.each(element.PassaggiPR, function (i, passaggio) {
									++controllo_passaggi;
									if (controllo_passaggi <= 5) {
										var td = jQuery("<td>").append(FormatDissPassagio(passaggio)).appendTo(row);
									}
								});
							}

							if (row.find("td").length == "1") {
								var td = jQuery("<td>").text(" ").appendTo(row);
							}
							if (row.find("td").length == "2") {
								var td = jQuery("<td>").text(" ").appendTo(row);
							}
							if (row.find("td").length == "3") {
								var td = jQuery("<td>").text(" ").appendTo(row);
							}
							if (row.find("td").length == "4") {
								var td = jQuery("<td>").text(" ").appendTo(row);
							}
						} else row.append("<th>Nessun risultato</th>");

						jQuery("#table_popup_12").append(row);
					});
				}
			);
			map.panTo(this.getLatLng()); //centratura del fumetto al click
		});

	var myIcon = L.icon({
		iconUrl: "/leaflet/images/ico3/bus_stop_r.png",
		className: "percorso0",
		iconAnchor: [12, 25],
	});
	L.marker([45.09323, 7.69024], {
		icon: myIcon,
	})
		.addTo(map)
		.bindPopup(
			'<div id="popupcontent_13"><p>Fermata: <strong>1207 - VALPRATO</strong>. <br>Passaggi (* se previsione in tempo reale):</p><div class="loading">Caricamento dati <span class="glyphicon glyphicon-refresh glyphicon-refresh-animate"></span></div></div>',
			{
				minWidth: 420,
				maxHeight: 400,
			}
		)
		.on("click", function (e) {
			jQuery.getJSON(
				"/cms/index.php?option=com_gtt&task=palina.getTransitiOld&palina=1207&bacino=U&realtime=true",
				{
					get_param: "value",
				},
				function (data) {
					jQuery(".loading").hide();
					jQuery("#popupcontent_13").append('<table id="table_popup_13" class="table table-condensed table-striped table-hover passaggi"></table>');
					jQuery.each(data, function (index, element) {
						var row = jQuery("<tr>");
						if (element.Linea != undefined) {
							row.append("<th>" + element.LineaAlias + "<small> (" + element.Direzione + ")</small></th>");

							controllo_passaggi = 0;

							jQuery.each(element.PassaggiRT, function (i, passaggio) {
								++controllo_passaggi;
								if (controllo_passaggi < 5) {
									var td = jQuery("<td>").text(passaggio).append("<sup>*</sup>").appendTo(row).wrapInner("<i></i>");
								}
							});

							if (controllo_passaggi == 0) {
								jQuery.each(element.PassaggiPR, function (i, passaggio) {
									++controllo_passaggi;
									if (controllo_passaggi <= 5) {
										var td = jQuery("<td>").append(FormatDissPassagio(passaggio)).appendTo(row);
									}
								});
							}

							if (row.find("td").length == "1") {
								var td = jQuery("<td>").text(" ").appendTo(row);
							}
							if (row.find("td").length == "2") {
								var td = jQuery("<td>").text(" ").appendTo(row);
							}
							if (row.find("td").length == "3") {
								var td = jQuery("<td>").text(" ").appendTo(row);
							}
							if (row.find("td").length == "4") {
								var td = jQuery("<td>").text(" ").appendTo(row);
							}
						} else row.append("<th>Nessun risultato</th>");

						jQuery("#table_popup_13").append(row);
					});
				}
			);
			map.panTo(this.getLatLng()); //centratura del fumetto al click
		});

	var myIcon = L.icon({
		iconUrl: "/leaflet/images/ico3/bus_stop_r.png",
		className: "percorso0",
		iconAnchor: [12, 25],
	});
	L.marker([45.09012, 7.68877], {
		icon: myIcon,
	})
		.addTo(map)
		.bindPopup(
			'<div id="popupcontent_14"><p>Fermata: <strong>1209 - CRISPI NORD</strong>. <br>Passaggi (* se previsione in tempo reale):</p><div class="loading">Caricamento dati <span class="glyphicon glyphicon-refresh glyphicon-refresh-animate"></span></div></div>',
			{
				minWidth: 420,
				maxHeight: 400,
			}
		)
		.on("click", function (e) {
			jQuery.getJSON(
				"/cms/index.php?option=com_gtt&task=palina.getTransitiOld&palina=1209&bacino=U&realtime=true",
				{
					get_param: "value",
				},
				function (data) {
					jQuery(".loading").hide();
					jQuery("#popupcontent_14").append('<table id="table_popup_14" class="table table-condensed table-striped table-hover passaggi"></table>');
					jQuery.each(data, function (index, element) {
						var row = jQuery("<tr>");
						if (element.Linea != undefined) {
							row.append("<th>" + element.LineaAlias + "<small> (" + element.Direzione + ")</small></th>");

							controllo_passaggi = 0;

							jQuery.each(element.PassaggiRT, function (i, passaggio) {
								++controllo_passaggi;
								if (controllo_passaggi < 5) {
									var td = jQuery("<td>").text(passaggio).append("<sup>*</sup>").appendTo(row).wrapInner("<i></i>");
								}
							});

							if (controllo_passaggi == 0) {
								jQuery.each(element.PassaggiPR, function (i, passaggio) {
									++controllo_passaggi;
									if (controllo_passaggi <= 5) {
										var td = jQuery("<td>").append(FormatDissPassagio(passaggio)).appendTo(row);
									}
								});
							}

							if (row.find("td").length == "1") {
								var td = jQuery("<td>").text(" ").appendTo(row);
							}
							if (row.find("td").length == "2") {
								var td = jQuery("<td>").text(" ").appendTo(row);
							}
							if (row.find("td").length == "3") {
								var td = jQuery("<td>").text(" ").appendTo(row);
							}
							if (row.find("td").length == "4") {
								var td = jQuery("<td>").text(" ").appendTo(row);
							}
						} else row.append("<th>Nessun risultato</th>");

						jQuery("#table_popup_14").append(row);
					});
				}
			);
			map.panTo(this.getLatLng()); //centratura del fumetto al click
		});

	var myIcon = L.icon({
		iconUrl: "/leaflet/images/ico3/bus_stop_r.png",
		className: "percorso0",
		iconAnchor: [12, 25],
	});
	L.marker([45.08844, 7.68796], {
		icon: myIcon,
	})
		.addTo(map)
		.bindPopup(
			'<div id="popupcontent_15"><p>Fermata: <strong>1210 - CRISPI SUD</strong>. <br>Passaggi (* se previsione in tempo reale):</p><div class="loading">Caricamento dati <span class="glyphicon glyphicon-refresh glyphicon-refresh-animate"></span></div></div>',
			{
				minWidth: 420,
				maxHeight: 400,
			}
		)
		.on("click", function (e) {
			jQuery.getJSON(
				"/cms/index.php?option=com_gtt&task=palina.getTransitiOld&palina=1210&bacino=U&realtime=true",
				{
					get_param: "value",
				},
				function (data) {
					jQuery(".loading").hide();
					jQuery("#popupcontent_15").append('<table id="table_popup_15" class="table table-condensed table-striped table-hover passaggi"></table>');
					jQuery.each(data, function (index, element) {
						var row = jQuery("<tr>");
						if (element.Linea != undefined) {
							row.append("<th>" + element.LineaAlias + "<small> (" + element.Direzione + ")</small></th>");

							controllo_passaggi = 0;

							jQuery.each(element.PassaggiRT, function (i, passaggio) {
								++controllo_passaggi;
								if (controllo_passaggi < 5) {
									var td = jQuery("<td>").text(passaggio).append("<sup>*</sup>").appendTo(row).wrapInner("<i></i>");
								}
							});

							if (controllo_passaggi == 0) {
								jQuery.each(element.PassaggiPR, function (i, passaggio) {
									++controllo_passaggi;
									if (controllo_passaggi <= 5) {
										var td = jQuery("<td>").append(FormatDissPassagio(passaggio)).appendTo(row);
									}
								});
							}

							if (row.find("td").length == "1") {
								var td = jQuery("<td>").text(" ").appendTo(row);
							}
							if (row.find("td").length == "2") {
								var td = jQuery("<td>").text(" ").appendTo(row);
							}
							if (row.find("td").length == "3") {
								var td = jQuery("<td>").text(" ").appendTo(row);
							}
							if (row.find("td").length == "4") {
								var td = jQuery("<td>").text(" ").appendTo(row);
							}
						} else row.append("<th>Nessun risultato</th>");

						jQuery("#table_popup_15").append(row);
					});
				}
			);
			map.panTo(this.getLatLng()); //centratura del fumetto al click
		});

	var myIcon = L.icon({
		iconUrl: "/leaflet/images/ico3/bus_stop_r.png",
		className: "percorso0",
		iconAnchor: [12, 25],
	});
	L.marker([45.08422, 7.68576], {
		icon: myIcon,
	})
		.addTo(map)
		.bindPopup(
			'<div id="popupcontent_16"><p>Fermata: <strong>1214 - VII CIRCOSCRIZIONE</strong>. <br>Passaggi (* se previsione in tempo reale):</p><div class="loading">Caricamento dati <span class="glyphicon glyphicon-refresh glyphicon-refresh-animate"></span></div></div>',
			{
				minWidth: 420,
				maxHeight: 400,
			}
		)
		.on("click", function (e) {
			jQuery.getJSON(
				"/cms/index.php?option=com_gtt&task=palina.getTransitiOld&palina=1214&bacino=U&realtime=true",
				{
					get_param: "value",
				},
				function (data) {
					jQuery(".loading").hide();
					jQuery("#popupcontent_16").append('<table id="table_popup_16" class="table table-condensed table-striped table-hover passaggi"></table>');
					jQuery.each(data, function (index, element) {
						var row = jQuery("<tr>");
						if (element.Linea != undefined) {
							row.append("<th>" + element.LineaAlias + "<small> (" + element.Direzione + ")</small></th>");

							controllo_passaggi = 0;

							jQuery.each(element.PassaggiRT, function (i, passaggio) {
								++controllo_passaggi;
								if (controllo_passaggi < 5) {
									var td = jQuery("<td>").text(passaggio).append("<sup>*</sup>").appendTo(row).wrapInner("<i></i>");
								}
							});

							if (controllo_passaggi == 0) {
								jQuery.each(element.PassaggiPR, function (i, passaggio) {
									++controllo_passaggi;
									if (controllo_passaggi <= 5) {
										var td = jQuery("<td>").append(FormatDissPassagio(passaggio)).appendTo(row);
									}
								});
							}

							if (row.find("td").length == "1") {
								var td = jQuery("<td>").text(" ").appendTo(row);
							}
							if (row.find("td").length == "2") {
								var td = jQuery("<td>").text(" ").appendTo(row);
							}
							if (row.find("td").length == "3") {
								var td = jQuery("<td>").text(" ").appendTo(row);
							}
							if (row.find("td").length == "4") {
								var td = jQuery("<td>").text(" ").appendTo(row);
							}
						} else row.append("<th>Nessun risultato</th>");

						jQuery("#table_popup_16").append(row);
					});
				}
			);
			map.panTo(this.getLatLng()); //centratura del fumetto al click
		});

	var myIcon = L.icon({
		iconUrl: "/leaflet/images/ico3/bus_stop_r.png",
		className: "percorso0",
		iconAnchor: [12, 25],
	});
	L.marker([45.08176, 7.68687], {
		icon: myIcon,
	})
		.addTo(map)
		.bindPopup(
			'<div id="popupcontent_17"><p>Fermata: <strong>1216 - EMILIA</strong>. <br>Passaggi (* se previsione in tempo reale):</p><div class="loading">Caricamento dati <span class="glyphicon glyphicon-refresh glyphicon-refresh-animate"></span></div></div>',
			{
				minWidth: 420,
				maxHeight: 400,
			}
		)
		.on("click", function (e) {
			jQuery.getJSON(
				"/cms/index.php?option=com_gtt&task=palina.getTransitiOld&palina=1216&bacino=U&realtime=true",
				{
					get_param: "value",
				},
				function (data) {
					jQuery(".loading").hide();
					jQuery("#popupcontent_17").append('<table id="table_popup_17" class="table table-condensed table-striped table-hover passaggi"></table>');
					jQuery.each(data, function (index, element) {
						var row = jQuery("<tr>");
						if (element.Linea != undefined) {
							row.append("<th>" + element.LineaAlias + "<small> (" + element.Direzione + ")</small></th>");

							controllo_passaggi = 0;

							jQuery.each(element.PassaggiRT, function (i, passaggio) {
								++controllo_passaggi;
								if (controllo_passaggi < 5) {
									var td = jQuery("<td>").text(passaggio).append("<sup>*</sup>").appendTo(row).wrapInner("<i></i>");
								}
							});

							if (controllo_passaggi == 0) {
								jQuery.each(element.PassaggiPR, function (i, passaggio) {
									++controllo_passaggi;
									if (controllo_passaggi <= 5) {
										var td = jQuery("<td>").append(FormatDissPassagio(passaggio)).appendTo(row);
									}
								});
							}

							if (row.find("td").length == "1") {
								var td = jQuery("<td>").text(" ").appendTo(row);
							}
							if (row.find("td").length == "2") {
								var td = jQuery("<td>").text(" ").appendTo(row);
							}
							if (row.find("td").length == "3") {
								var td = jQuery("<td>").text(" ").appendTo(row);
							}
							if (row.find("td").length == "4") {
								var td = jQuery("<td>").text(" ").appendTo(row);
							}
						} else row.append("<th>Nessun risultato</th>");

						jQuery("#table_popup_17").append(row);
					});
				}
			);
			map.panTo(this.getLatLng()); //centratura del fumetto al click
		});

	var myIcon = L.icon({
		iconUrl: "/leaflet/images/ico3/bus_stop_r.png",
		className: "percorso0",
		iconAnchor: [12, 25],
	});
	L.marker([45.07945, 7.68522], {
		icon: myIcon,
	})
		.addTo(map)
		.bindPopup(
			'<div id="popupcontent_18"><p>Fermata: <strong>240 - BORGO DORA</strong>. <br>Passaggi (* se previsione in tempo reale):</p><div class="loading">Caricamento dati <span class="glyphicon glyphicon-refresh glyphicon-refresh-animate"></span></div></div>',
			{
				minWidth: 420,
				maxHeight: 400,
			}
		)
		.on("click", function (e) {
			jQuery.getJSON(
				"/cms/index.php?option=com_gtt&task=palina.getTransitiOld&palina=240&bacino=U&realtime=true",
				{
					get_param: "value",
				},
				function (data) {
					jQuery(".loading").hide();
					jQuery("#popupcontent_18").append('<table id="table_popup_18" class="table table-condensed table-striped table-hover passaggi"></table>');
					jQuery.each(data, function (index, element) {
						var row = jQuery("<tr>");
						if (element.Linea != undefined) {
							row.append("<th>" + element.LineaAlias + "<small> (" + element.Direzione + ")</small></th>");

							controllo_passaggi = 0;

							jQuery.each(element.PassaggiRT, function (i, passaggio) {
								++controllo_passaggi;
								if (controllo_passaggi < 5) {
									var td = jQuery("<td>").text(passaggio).append("<sup>*</sup>").appendTo(row).wrapInner("<i></i>");
								}
							});

							if (controllo_passaggi == 0) {
								jQuery.each(element.PassaggiPR, function (i, passaggio) {
									++controllo_passaggi;
									if (controllo_passaggi <= 5) {
										var td = jQuery("<td>").append(FormatDissPassagio(passaggio)).appendTo(row);
									}
								});
							}

							if (row.find("td").length == "1") {
								var td = jQuery("<td>").text(" ").appendTo(row);
							}
							if (row.find("td").length == "2") {
								var td = jQuery("<td>").text(" ").appendTo(row);
							}
							if (row.find("td").length == "3") {
								var td = jQuery("<td>").text(" ").appendTo(row);
							}
							if (row.find("td").length == "4") {
								var td = jQuery("<td>").text(" ").appendTo(row);
							}
						} else row.append("<th>Nessun risultato</th>");

						jQuery("#table_popup_18").append(row);
					});
				}
			);
			map.panTo(this.getLatLng()); //centratura del fumetto al click
		});

	var myIcon = L.icon({
		iconUrl: "/leaflet/images/ico3/bus_stop_r.png",
		className: "percorso0",
		iconAnchor: [12, 25],
	});
	L.marker([45.07607, 7.68304], {
		icon: myIcon,
	})
		.addTo(map)
		.bindPopup(
			'<div id="popupcontent_19"><p>Fermata: <strong>200 - PORTA PALAZZO SUD</strong>. <br>Passaggi (* se previsione in tempo reale):</p><div class="loading">Caricamento dati <span class="glyphicon glyphicon-refresh glyphicon-refresh-animate"></span></div></div>',
			{
				minWidth: 420,
				maxHeight: 400,
			}
		)
		.on("click", function (e) {
			jQuery.getJSON(
				"/cms/index.php?option=com_gtt&task=palina.getTransitiOld&palina=200&bacino=U&realtime=true",
				{
					get_param: "value",
				},
				function (data) {
					jQuery(".loading").hide();
					jQuery("#popupcontent_19").append('<table id="table_popup_19" class="table table-condensed table-striped table-hover passaggi"></table>');
					jQuery.each(data, function (index, element) {
						var row = jQuery("<tr>");
						if (element.Linea != undefined) {
							row.append("<th>" + element.LineaAlias + "<small> (" + element.Direzione + ")</small></th>");

							controllo_passaggi = 0;

							jQuery.each(element.PassaggiRT, function (i, passaggio) {
								++controllo_passaggi;
								if (controllo_passaggi < 5) {
									var td = jQuery("<td>").text(passaggio).append("<sup>*</sup>").appendTo(row).wrapInner("<i></i>");
								}
							});

							if (controllo_passaggi == 0) {
								jQuery.each(element.PassaggiPR, function (i, passaggio) {
									++controllo_passaggi;
									if (controllo_passaggi <= 5) {
										var td = jQuery("<td>").append(FormatDissPassagio(passaggio)).appendTo(row);
									}
								});
							}

							if (row.find("td").length == "1") {
								var td = jQuery("<td>").text(" ").appendTo(row);
							}
							if (row.find("td").length == "2") {
								var td = jQuery("<td>").text(" ").appendTo(row);
							}
							if (row.find("td").length == "3") {
								var td = jQuery("<td>").text(" ").appendTo(row);
							}
							if (row.find("td").length == "4") {
								var td = jQuery("<td>").text(" ").appendTo(row);
							}
						} else row.append("<th>Nessun risultato</th>");

						jQuery("#table_popup_19").append(row);
					});
				}
			);
			map.panTo(this.getLatLng()); //centratura del fumetto al click
		});

	var myIcon = L.icon({
		iconUrl: "/leaflet/images/ico3/bus_stop_r.png",
		className: "percorso0",
		iconAnchor: [12, 25],
	});
	L.marker([45.07366, 7.68145], {
		icon: myIcon,
	})
		.addTo(map)
		.bindPopup(
			'<div id="popupcontent_20"><p>Fermata: <strong>242 - CORTE D\'APPELLO</strong>. <br>Passaggi (* se previsione in tempo reale):</p><div class="loading">Caricamento dati <span class="glyphicon glyphicon-refresh glyphicon-refresh-animate"></span></div></div>',
			{
				minWidth: 420,
				maxHeight: 400,
			}
		)
		.on("click", function (e) {
			jQuery.getJSON(
				"/cms/index.php?option=com_gtt&task=palina.getTransitiOld&palina=242&bacino=U&realtime=true",
				{
					get_param: "value",
				},
				function (data) {
					jQuery(".loading").hide();
					jQuery("#popupcontent_20").append('<table id="table_popup_20" class="table table-condensed table-striped table-hover passaggi"></table>');
					jQuery.each(data, function (index, element) {
						var row = jQuery("<tr>");
						if (element.Linea != undefined) {
							row.append("<th>" + element.LineaAlias + "<small> (" + element.Direzione + ")</small></th>");

							controllo_passaggi = 0;

							jQuery.each(element.PassaggiRT, function (i, passaggio) {
								++controllo_passaggi;
								if (controllo_passaggi < 5) {
									var td = jQuery("<td>").text(passaggio).append("<sup>*</sup>").appendTo(row).wrapInner("<i></i>");
								}
							});

							if (controllo_passaggi == 0) {
								jQuery.each(element.PassaggiPR, function (i, passaggio) {
									++controllo_passaggi;
									if (controllo_passaggi <= 5) {
										var td = jQuery("<td>").append(FormatDissPassagio(passaggio)).appendTo(row);
									}
								});
							}

							if (row.find("td").length == "1") {
								var td = jQuery("<td>").text(" ").appendTo(row);
							}
							if (row.find("td").length == "2") {
								var td = jQuery("<td>").text(" ").appendTo(row);
							}
							if (row.find("td").length == "3") {
								var td = jQuery("<td>").text(" ").appendTo(row);
							}
							if (row.find("td").length == "4") {
								var td = jQuery("<td>").text(" ").appendTo(row);
							}
						} else row.append("<th>Nessun risultato</th>");

						jQuery("#table_popup_20").append(row);
					});
				}
			);
			map.panTo(this.getLatLng()); //centratura del fumetto al click
		});

	var myIcon = L.icon({
		iconUrl: "/leaflet/images/ico3/bus_stop_r.png",
		className: "percorso0",
		iconAnchor: [12, 25],
	});
	L.marker([45.0715, 7.6799], {
		icon: myIcon,
	})
		.addTo(map)
		.bindPopup(
			'<div id="popupcontent_21"><p>Fermata: <strong>244 - MONTE DI PIETÀ</strong>. <br>Passaggi (* se previsione in tempo reale):</p><div class="loading">Caricamento dati <span class="glyphicon glyphicon-refresh glyphicon-refresh-animate"></span></div></div>',
			{
				minWidth: 420,
				maxHeight: 400,
			}
		)
		.on("click", function (e) {
			jQuery.getJSON(
				"/cms/index.php?option=com_gtt&task=palina.getTransitiOld&palina=244&bacino=U&realtime=true",
				{
					get_param: "value",
				},
				function (data) {
					jQuery(".loading").hide();
					jQuery("#popupcontent_21").append('<table id="table_popup_21" class="table table-condensed table-striped table-hover passaggi"></table>');
					jQuery.each(data, function (index, element) {
						var row = jQuery("<tr>");
						if (element.Linea != undefined) {
							row.append("<th>" + element.LineaAlias + "<small> (" + element.Direzione + ")</small></th>");

							controllo_passaggi = 0;

							jQuery.each(element.PassaggiRT, function (i, passaggio) {
								++controllo_passaggi;
								if (controllo_passaggi < 5) {
									var td = jQuery("<td>").text(passaggio).append("<sup>*</sup>").appendTo(row).wrapInner("<i></i>");
								}
							});

							if (controllo_passaggi == 0) {
								jQuery.each(element.PassaggiPR, function (i, passaggio) {
									++controllo_passaggi;
									if (controllo_passaggi <= 5) {
										var td = jQuery("<td>").append(FormatDissPassagio(passaggio)).appendTo(row);
									}
								});
							}

							if (row.find("td").length == "1") {
								var td = jQuery("<td>").text(" ").appendTo(row);
							}
							if (row.find("td").length == "2") {
								var td = jQuery("<td>").text(" ").appendTo(row);
							}
							if (row.find("td").length == "3") {
								var td = jQuery("<td>").text(" ").appendTo(row);
							}
							if (row.find("td").length == "4") {
								var td = jQuery("<td>").text(" ").appendTo(row);
							}
						} else row.append("<th>Nessun risultato</th>");

						jQuery("#table_popup_21").append(row);
					});
				}
			);
			map.panTo(this.getLatLng()); //centratura del fumetto al click
		});

	var myIcon = L.icon({
		iconUrl: "/leaflet/images/ico3/bus_stop_r.png",
		className: "percorso0",
		iconAnchor: [12, 25],
	});
	L.marker([45.07119, 7.67521], {
		icon: myIcon,
	})
		.addTo(map)
		.bindPopup(
			'<div id="popupcontent_22"><p>Fermata: <strong>468 - SICCARDI</strong>. <br>Passaggi (* se previsione in tempo reale):</p><div class="loading">Caricamento dati <span class="glyphicon glyphicon-refresh glyphicon-refresh-animate"></span></div></div>',
			{
				minWidth: 420,
				maxHeight: 400,
			}
		)
		.on("click", function (e) {
			jQuery.getJSON(
				"/cms/index.php?option=com_gtt&task=palina.getTransitiOld&palina=468&bacino=U&realtime=true",
				{
					get_param: "value",
				},
				function (data) {
					jQuery(".loading").hide();
					jQuery("#popupcontent_22").append('<table id="table_popup_22" class="table table-condensed table-striped table-hover passaggi"></table>');
					jQuery.each(data, function (index, element) {
						var row = jQuery("<tr>");
						if (element.Linea != undefined) {
							row.append("<th>" + element.LineaAlias + "<small> (" + element.Direzione + ")</small></th>");

							controllo_passaggi = 0;

							jQuery.each(element.PassaggiRT, function (i, passaggio) {
								++controllo_passaggi;
								if (controllo_passaggi < 5) {
									var td = jQuery("<td>").text(passaggio).append("<sup>*</sup>").appendTo(row).wrapInner("<i></i>");
								}
							});

							if (controllo_passaggi == 0) {
								jQuery.each(element.PassaggiPR, function (i, passaggio) {
									++controllo_passaggi;
									if (controllo_passaggi <= 5) {
										var td = jQuery("<td>").append(FormatDissPassagio(passaggio)).appendTo(row);
									}
								});
							}

							if (row.find("td").length == "1") {
								var td = jQuery("<td>").text(" ").appendTo(row);
							}
							if (row.find("td").length == "2") {
								var td = jQuery("<td>").text(" ").appendTo(row);
							}
							if (row.find("td").length == "3") {
								var td = jQuery("<td>").text(" ").appendTo(row);
							}
							if (row.find("td").length == "4") {
								var td = jQuery("<td>").text(" ").appendTo(row);
							}
						} else row.append("<th>Nessun risultato</th>");

						jQuery("#table_popup_22").append(row);
					});
				}
			);
			map.panTo(this.getLatLng()); //centratura del fumetto al click
		});

	var myIcon = L.icon({
		iconUrl: "/leaflet/images/ico3/ico_rossa.png",
		className: "percorso0",
		iconAnchor: [12, 25],
	});
	L.marker([45.07335, 7.66751], {
		icon: myIcon,
	})
		.addTo(map)
		.bindPopup(
			'<div id="popupcontent_23"><p>Fermata: <strong>1118 - BOLZANO CAP.</strong>. <br>Passaggi (* se previsione in tempo reale):</p><div class="loading">Caricamento dati <span class="glyphicon glyphicon-refresh glyphicon-refresh-animate"></span></div></div>',
			{
				minWidth: 420,
				maxHeight: 400,
			}
		)
		.on("click", function (e) {
			jQuery.getJSON(
				"/cms/index.php?option=com_gtt&task=palina.getTransitiOld&palina=1118&bacino=U&realtime=true",
				{
					get_param: "value",
				},
				function (data) {
					jQuery(".loading").hide();
					jQuery("#popupcontent_23").append('<table id="table_popup_23" class="table table-condensed table-striped table-hover passaggi"></table>');
					jQuery.each(data, function (index, element) {
						var row = jQuery("<tr>");
						if (element.Linea != undefined) {
							row.append("<th>" + element.LineaAlias + "<small> (" + element.Direzione + ")</small></th>");

							controllo_passaggi = 0;

							jQuery.each(element.PassaggiRT, function (i, passaggio) {
								++controllo_passaggi;
								if (controllo_passaggi < 5) {
									var td = jQuery("<td>").text(passaggio).append("<sup>*</sup>").appendTo(row).wrapInner("<i></i>");
								}
							});

							if (controllo_passaggi == 0) {
								jQuery.each(element.PassaggiPR, function (i, passaggio) {
									++controllo_passaggi;
									if (controllo_passaggi <= 5) {
										var td = jQuery("<td>").append(FormatDissPassagio(passaggio)).appendTo(row);
									}
								});
							}

							if (row.find("td").length == "1") {
								var td = jQuery("<td>").text(" ").appendTo(row);
							}
							if (row.find("td").length == "2") {
								var td = jQuery("<td>").text(" ").appendTo(row);
							}
							if (row.find("td").length == "3") {
								var td = jQuery("<td>").text(" ").appendTo(row);
							}
							if (row.find("td").length == "4") {
								var td = jQuery("<td>").text(" ").appendTo(row);
							}
						} else row.append("<th>Nessun risultato</th>");

						jQuery("#table_popup_23").append(row);
					});
				}
			);
			map.panTo(this.getLatLng()); //centratura del fumetto al click
		});

	var firstpolyline = new L.Polyline(
		[
			new L.LatLng(45.12015, 7.71095),
			new L.LatLng(45.12006, 7.71061),
			new L.LatLng(45.11926, 7.71108),
			new L.LatLng(45.11913, 7.71091),
			new L.LatLng(45.11872, 7.70966),
			new L.LatLng(45.11596, 7.7003),
			new L.LatLng(45.11568, 7.69969),
			new L.LatLng(45.11534, 7.69926),
			new L.LatLng(45.11494, 7.69893),
			new L.LatLng(45.11437, 7.69873),
			new L.LatLng(45.10613, 7.69659),
			new L.LatLng(45.09087, 7.68924),
			new L.LatLng(45.08913, 7.6883),
			new L.LatLng(45.0885, 7.68811),
			new L.LatLng(45.08678, 7.68717),
			new L.LatLng(45.08365, 7.68566),
			new L.LatLng(45.08299, 7.6877),
			new L.LatLng(45.07292, 7.6811),
			new L.LatLng(45.07045, 7.67928),
			new L.LatLng(45.07037, 7.67901),
			new L.LatLng(45.07026, 7.67774),
			new L.LatLng(45.07354, 7.66856),
			new L.LatLng(45.07366, 7.66828),
			new L.LatLng(45.07381, 7.66827),
			new L.LatLng(45.07389, 7.66815),
			new L.LatLng(45.07389, 7.66796),
			new L.LatLng(45.07384, 7.66788),
			new L.LatLng(45.07334, 7.66758),
		],
		{
			color: "#ff0000",
			className: "percorso0",
			opacity: 0.6,
			weight: 5,
			offset: 3,
		}
	);
	firstpolyline.addTo(map);

	var myIcon = L.icon({
		iconUrl: "/leaflet/images/ico3/ico_verde.png",
		className: "percorso1",
		iconAnchor: [12, 25],
	});
	L.marker([45.07335, 7.66751], {
		icon: myIcon,
	})
		.addTo(map)
		.bindPopup(
			'<div id="popupcontent_0"><p>Fermata: <strong>1118 - BOLZANO CAP.</strong>. <br>Passaggi (* se previsione in tempo reale):</p><div class="loading">Caricamento dati <span class="glyphicon glyphicon-refresh glyphicon-refresh-animate"></span></div></div>',
			{
				minWidth: 420,
				maxHeight: 400,
			}
		)
		.on("click", function (e) {
			jQuery.getJSON(
				"/cms/index.php?option=com_gtt&task=palina.getTransitiOld&palina=1118&bacino=U&realtime=true",
				{
					get_param: "value",
				},
				function (data) {
					jQuery(".loading").hide();
					jQuery("#popupcontent_0").append('<table id="table_popup_0" class="table table-condensed table-striped table-hover passaggi"></table>');
					jQuery.each(data, function (index, element) {
						var row = jQuery("<tr>");
						if (element.Linea != undefined) {
							row.append("<th>" + element.LineaAlias + "<small> (" + element.Direzione + ")</small></th>");

							controllo_passaggi = 0;

							jQuery.each(element.PassaggiRT, function (i, passaggio) {
								++controllo_passaggi;
								if (controllo_passaggi < 5) {
									var td = jQuery("<td>").text(passaggio).append("<sup>*</sup>").appendTo(row).wrapInner("<i></i>");
								}
							});

							if (controllo_passaggi == 0) {
								jQuery.each(element.PassaggiPR, function (i, passaggio) {
									++controllo_passaggi;
									if (controllo_passaggi <= 5) {
										var td = jQuery("<td>").append(FormatDissPassagio(passaggio)).appendTo(row);
									}
								});
							}

							if (row.find("td").length == "1") {
								var td = jQuery("<td>").text(" ").appendTo(row);
							}
							if (row.find("td").length == "2") {
								var td = jQuery("<td>").text(" ").appendTo(row);
							}
							if (row.find("td").length == "3") {
								var td = jQuery("<td>").text(" ").appendTo(row);
							}
							if (row.find("td").length == "4") {
								var td = jQuery("<td>").text(" ").appendTo(row);
							}
						} else row.append("<th>Nessun risultato</th>");

						jQuery("#table_popup_0").append(row);
					});
				}
			);
			map.panTo(this.getLatLng()); //centratura del fumetto al click
		});

	var myIcon = L.icon({
		iconUrl: "/leaflet/images/ico3/bus_stop_b.png",
		className: "percorso1",
		iconAnchor: [12, 25],
	});
	L.marker([45.07144, 7.67444], {
		icon: myIcon,
	})
		.addTo(map)
		.bindPopup(
			'<div id="popupcontent_1"><p>Fermata: <strong>467 - SICCARDI</strong>. <br>Passaggi (* se previsione in tempo reale):</p><div class="loading">Caricamento dati <span class="glyphicon glyphicon-refresh glyphicon-refresh-animate"></span></div></div>',
			{
				minWidth: 420,
				maxHeight: 400,
			}
		)
		.on("click", function (e) {
			jQuery.getJSON(
				"/cms/index.php?option=com_gtt&task=palina.getTransitiOld&palina=467&bacino=U&realtime=true",
				{
					get_param: "value",
				},
				function (data) {
					jQuery(".loading").hide();
					jQuery("#popupcontent_1").append('<table id="table_popup_1" class="table table-condensed table-striped table-hover passaggi"></table>');
					jQuery.each(data, function (index, element) {
						var row = jQuery("<tr>");
						if (element.Linea != undefined) {
							row.append("<th>" + element.LineaAlias + "<small> (" + element.Direzione + ")</small></th>");

							controllo_passaggi = 0;

							jQuery.each(element.PassaggiRT, function (i, passaggio) {
								++controllo_passaggi;
								if (controllo_passaggi < 5) {
									var td = jQuery("<td>").text(passaggio).append("<sup>*</sup>").appendTo(row).wrapInner("<i></i>");
								}
							});

							if (controllo_passaggi == 0) {
								jQuery.each(element.PassaggiPR, function (i, passaggio) {
									++controllo_passaggi;
									if (controllo_passaggi <= 5) {
										var td = jQuery("<td>").append(FormatDissPassagio(passaggio)).appendTo(row);
									}
								});
							}

							if (row.find("td").length == "1") {
								var td = jQuery("<td>").text(" ").appendTo(row);
							}
							if (row.find("td").length == "2") {
								var td = jQuery("<td>").text(" ").appendTo(row);
							}
							if (row.find("td").length == "3") {
								var td = jQuery("<td>").text(" ").appendTo(row);
							}
							if (row.find("td").length == "4") {
								var td = jQuery("<td>").text(" ").appendTo(row);
							}
						} else row.append("<th>Nessun risultato</th>");

						jQuery("#table_popup_1").append(row);
					});
				}
			);
			map.panTo(this.getLatLng()); //centratura del fumetto al click
		});

	var myIcon = L.icon({
		iconUrl: "/leaflet/images/ico3/bus_stop_b.png",
		className: "percorso1",
		iconAnchor: [12, 25],
	});
	L.marker([45.07056, 7.68136], {
		icon: myIcon,
	})
		.addTo(map)
		.bindPopup(
			'<div id="popupcontent_2"><p>Fermata: <strong>469 - BERTOLA</strong>. <br>Passaggi (* se previsione in tempo reale):</p><div class="loading">Caricamento dati <span class="glyphicon glyphicon-refresh glyphicon-refresh-animate"></span></div></div>',
			{
				minWidth: 420,
				maxHeight: 400,
			}
		)
		.on("click", function (e) {
			jQuery.getJSON(
				"/cms/index.php?option=com_gtt&task=palina.getTransitiOld&palina=469&bacino=U&realtime=true",
				{
					get_param: "value",
				},
				function (data) {
					jQuery(".loading").hide();
					jQuery("#popupcontent_2").append('<table id="table_popup_2" class="table table-condensed table-striped table-hover passaggi"></table>');
					jQuery.each(data, function (index, element) {
						var row = jQuery("<tr>");
						if (element.Linea != undefined) {
							row.append("<th>" + element.LineaAlias + "<small> (" + element.Direzione + ")</small></th>");

							controllo_passaggi = 0;

							jQuery.each(element.PassaggiRT, function (i, passaggio) {
								++controllo_passaggi;
								if (controllo_passaggi < 5) {
									var td = jQuery("<td>").text(passaggio).append("<sup>*</sup>").appendTo(row).wrapInner("<i></i>");
								}
							});

							if (controllo_passaggi == 0) {
								jQuery.each(element.PassaggiPR, function (i, passaggio) {
									++controllo_passaggi;
									if (controllo_passaggi <= 5) {
										var td = jQuery("<td>").append(FormatDissPassagio(passaggio)).appendTo(row);
									}
								});
							}

							if (row.find("td").length == "1") {
								var td = jQuery("<td>").text(" ").appendTo(row);
							}
							if (row.find("td").length == "2") {
								var td = jQuery("<td>").text(" ").appendTo(row);
							}
							if (row.find("td").length == "3") {
								var td = jQuery("<td>").text(" ").appendTo(row);
							}
							if (row.find("td").length == "4") {
								var td = jQuery("<td>").text(" ").appendTo(row);
							}
						} else row.append("<th>Nessun risultato</th>");

						jQuery("#table_popup_2").append(row);
					});
				}
			);
			map.panTo(this.getLatLng()); //centratura del fumetto al click
		});

	var myIcon = L.icon({
		iconUrl: "/leaflet/images/ico3/bus_stop_b.png",
		className: "percorso1",
		iconAnchor: [12, 25],
	});
	L.marker([45.07195, 7.68383], {
		icon: myIcon,
	})
		.addTo(map)
		.bindPopup(
			'<div id="popupcontent_3"><p>Fermata: <strong>245 - GARIBALDI</strong>. <br>Passaggi (* se previsione in tempo reale):</p><div class="loading">Caricamento dati <span class="glyphicon glyphicon-refresh glyphicon-refresh-animate"></span></div></div>',
			{
				minWidth: 420,
				maxHeight: 400,
			}
		)
		.on("click", function (e) {
			jQuery.getJSON(
				"/cms/index.php?option=com_gtt&task=palina.getTransitiOld&palina=245&bacino=U&realtime=true",
				{
					get_param: "value",
				},
				function (data) {
					jQuery(".loading").hide();
					jQuery("#popupcontent_3").append('<table id="table_popup_3" class="table table-condensed table-striped table-hover passaggi"></table>');
					jQuery.each(data, function (index, element) {
						var row = jQuery("<tr>");
						if (element.Linea != undefined) {
							row.append("<th>" + element.LineaAlias + "<small> (" + element.Direzione + ")</small></th>");

							controllo_passaggi = 0;

							jQuery.each(element.PassaggiRT, function (i, passaggio) {
								++controllo_passaggi;
								if (controllo_passaggi < 5) {
									var td = jQuery("<td>").text(passaggio).append("<sup>*</sup>").appendTo(row).wrapInner("<i></i>");
								}
							});

							if (controllo_passaggi == 0) {
								jQuery.each(element.PassaggiPR, function (i, passaggio) {
									++controllo_passaggi;
									if (controllo_passaggi <= 5) {
										var td = jQuery("<td>").append(FormatDissPassagio(passaggio)).appendTo(row);
									}
								});
							}

							if (row.find("td").length == "1") {
								var td = jQuery("<td>").text(" ").appendTo(row);
							}
							if (row.find("td").length == "2") {
								var td = jQuery("<td>").text(" ").appendTo(row);
							}
							if (row.find("td").length == "3") {
								var td = jQuery("<td>").text(" ").appendTo(row);
							}
							if (row.find("td").length == "4") {
								var td = jQuery("<td>").text(" ").appendTo(row);
							}
						} else row.append("<th>Nessun risultato</th>");

						jQuery("#table_popup_3").append(row);
					});
				}
			);
			map.panTo(this.getLatLng()); //centratura del fumetto al click
		});

	var myIcon = L.icon({
		iconUrl: "/leaflet/images/ico3/bus_stop_b.png",
		className: "percorso1",
		iconAnchor: [12, 25],
	});
	L.marker([45.07426, 7.68529], {
		icon: myIcon,
	})
		.addTo(map)
		.bindPopup(
			'<div id="popupcontent_4"><p>Fermata: <strong>243 - DUOMO - MUSEI REALI</strong>. <br>Passaggi (* se previsione in tempo reale):</p><div class="loading">Caricamento dati <span class="glyphicon glyphicon-refresh glyphicon-refresh-animate"></span></div></div>',
			{
				minWidth: 420,
				maxHeight: 400,
			}
		)
		.on("click", function (e) {
			jQuery.getJSON(
				"/cms/index.php?option=com_gtt&task=palina.getTransitiOld&palina=243&bacino=U&realtime=true",
				{
					get_param: "value",
				},
				function (data) {
					jQuery(".loading").hide();
					jQuery("#popupcontent_4").append('<table id="table_popup_4" class="table table-condensed table-striped table-hover passaggi"></table>');
					jQuery.each(data, function (index, element) {
						var row = jQuery("<tr>");
						if (element.Linea != undefined) {
							row.append("<th>" + element.LineaAlias + "<small> (" + element.Direzione + ")</small></th>");

							controllo_passaggi = 0;

							jQuery.each(element.PassaggiRT, function (i, passaggio) {
								++controllo_passaggi;
								if (controllo_passaggi < 5) {
									var td = jQuery("<td>").text(passaggio).append("<sup>*</sup>").appendTo(row).wrapInner("<i></i>");
								}
							});

							if (controllo_passaggi == 0) {
								jQuery.each(element.PassaggiPR, function (i, passaggio) {
									++controllo_passaggi;
									if (controllo_passaggi <= 5) {
										var td = jQuery("<td>").append(FormatDissPassagio(passaggio)).appendTo(row);
									}
								});
							}

							if (row.find("td").length == "1") {
								var td = jQuery("<td>").text(" ").appendTo(row);
							}
							if (row.find("td").length == "2") {
								var td = jQuery("<td>").text(" ").appendTo(row);
							}
							if (row.find("td").length == "3") {
								var td = jQuery("<td>").text(" ").appendTo(row);
							}
							if (row.find("td").length == "4") {
								var td = jQuery("<td>").text(" ").appendTo(row);
							}
						} else row.append("<th>Nessun risultato</th>");

						jQuery("#table_popup_4").append(row);
					});
				}
			);
			map.panTo(this.getLatLng()); //centratura del fumetto al click
		});

	var myIcon = L.icon({
		iconUrl: "/leaflet/images/ico3/bus_stop_b.png",
		className: "percorso1",
		iconAnchor: [12, 25],
	});
	L.marker([45.07743, 7.68411], {
		icon: myIcon,
	})
		.addTo(map)
		.bindPopup(
			'<div id="popupcontent_5"><p>Fermata: <strong>84 - PORTA PALAZZO NORD</strong>. <br>Passaggi (* se previsione in tempo reale):</p><div class="loading">Caricamento dati <span class="glyphicon glyphicon-refresh glyphicon-refresh-animate"></span></div></div>',
			{
				minWidth: 420,
				maxHeight: 400,
			}
		)
		.on("click", function (e) {
			jQuery.getJSON(
				"/cms/index.php?option=com_gtt&task=palina.getTransitiOld&palina=84&bacino=U&realtime=true",
				{
					get_param: "value",
				},
				function (data) {
					jQuery(".loading").hide();
					jQuery("#popupcontent_5").append('<table id="table_popup_5" class="table table-condensed table-striped table-hover passaggi"></table>');
					jQuery.each(data, function (index, element) {
						var row = jQuery("<tr>");
						if (element.Linea != undefined) {
							row.append("<th>" + element.LineaAlias + "<small> (" + element.Direzione + ")</small></th>");

							controllo_passaggi = 0;

							jQuery.each(element.PassaggiRT, function (i, passaggio) {
								++controllo_passaggi;
								if (controllo_passaggi < 5) {
									var td = jQuery("<td>").text(passaggio).append("<sup>*</sup>").appendTo(row).wrapInner("<i></i>");
								}
							});

							if (controllo_passaggi == 0) {
								jQuery.each(element.PassaggiPR, function (i, passaggio) {
									++controllo_passaggi;
									if (controllo_passaggi <= 5) {
										var td = jQuery("<td>").append(FormatDissPassagio(passaggio)).appendTo(row);
									}
								});
							}

							if (row.find("td").length == "1") {
								var td = jQuery("<td>").text(" ").appendTo(row);
							}
							if (row.find("td").length == "2") {
								var td = jQuery("<td>").text(" ").appendTo(row);
							}
							if (row.find("td").length == "3") {
								var td = jQuery("<td>").text(" ").appendTo(row);
							}
							if (row.find("td").length == "4") {
								var td = jQuery("<td>").text(" ").appendTo(row);
							}
						} else row.append("<th>Nessun risultato</th>");

						jQuery("#table_popup_5").append(row);
					});
				}
			);
			map.panTo(this.getLatLng()); //centratura del fumetto al click
		});

	var myIcon = L.icon({
		iconUrl: "/leaflet/images/ico3/bus_stop_b.png",
		className: "percorso1",
		iconAnchor: [12, 25],
	});
	L.marker([45.08013, 7.68585], {
		icon: myIcon,
	})
		.addTo(map)
		.bindPopup(
			'<div id="popupcontent_6"><p>Fermata: <strong>241 - BORGO DORA</strong>. <br>Passaggi (* se previsione in tempo reale):</p><div class="loading">Caricamento dati <span class="glyphicon glyphicon-refresh glyphicon-refresh-animate"></span></div></div>',
			{
				minWidth: 420,
				maxHeight: 400,
			}
		)
		.on("click", function (e) {
			jQuery.getJSON(
				"/cms/index.php?option=com_gtt&task=palina.getTransitiOld&palina=241&bacino=U&realtime=true",
				{
					get_param: "value",
				},
				function (data) {
					jQuery(".loading").hide();
					jQuery("#popupcontent_6").append('<table id="table_popup_6" class="table table-condensed table-striped table-hover passaggi"></table>');
					jQuery.each(data, function (index, element) {
						var row = jQuery("<tr>");
						if (element.Linea != undefined) {
							row.append("<th>" + element.LineaAlias + "<small> (" + element.Direzione + ")</small></th>");

							controllo_passaggi = 0;

							jQuery.each(element.PassaggiRT, function (i, passaggio) {
								++controllo_passaggi;
								if (controllo_passaggi < 5) {
									var td = jQuery("<td>").text(passaggio).append("<sup>*</sup>").appendTo(row).wrapInner("<i></i>");
								}
							});

							if (controllo_passaggi == 0) {
								jQuery.each(element.PassaggiPR, function (i, passaggio) {
									++controllo_passaggi;
									if (controllo_passaggi <= 5) {
										var td = jQuery("<td>").append(FormatDissPassagio(passaggio)).appendTo(row);
									}
								});
							}

							if (row.find("td").length == "1") {
								var td = jQuery("<td>").text(" ").appendTo(row);
							}
							if (row.find("td").length == "2") {
								var td = jQuery("<td>").text(" ").appendTo(row);
							}
							if (row.find("td").length == "3") {
								var td = jQuery("<td>").text(" ").appendTo(row);
							}
							if (row.find("td").length == "4") {
								var td = jQuery("<td>").text(" ").appendTo(row);
							}
						} else row.append("<th>Nessun risultato</th>");

						jQuery("#table_popup_6").append(row);
					});
				}
			);
			map.panTo(this.getLatLng()); //centratura del fumetto al click
		});

	var myIcon = L.icon({
		iconUrl: "/leaflet/images/ico3/bus_stop_b.png",
		className: "percorso1",
		iconAnchor: [12, 25],
	});
	L.marker([45.08233, 7.68756], {
		icon: myIcon,
	})
		.addTo(map)
		.bindPopup(
			'<div id="popupcontent_7"><p>Fermata: <strong>1217 - EMILIA</strong>. <br>Passaggi (* se previsione in tempo reale):</p><div class="loading">Caricamento dati <span class="glyphicon glyphicon-refresh glyphicon-refresh-animate"></span></div></div>',
			{
				minWidth: 420,
				maxHeight: 400,
			}
		)
		.on("click", function (e) {
			jQuery.getJSON(
				"/cms/index.php?option=com_gtt&task=palina.getTransitiOld&palina=1217&bacino=U&realtime=true",
				{
					get_param: "value",
				},
				function (data) {
					jQuery(".loading").hide();
					jQuery("#popupcontent_7").append('<table id="table_popup_7" class="table table-condensed table-striped table-hover passaggi"></table>');
					jQuery.each(data, function (index, element) {
						var row = jQuery("<tr>");
						if (element.Linea != undefined) {
							row.append("<th>" + element.LineaAlias + "<small> (" + element.Direzione + ")</small></th>");

							controllo_passaggi = 0;

							jQuery.each(element.PassaggiRT, function (i, passaggio) {
								++controllo_passaggi;
								if (controllo_passaggi < 5) {
									var td = jQuery("<td>").text(passaggio).append("<sup>*</sup>").appendTo(row).wrapInner("<i></i>");
								}
							});

							if (controllo_passaggi == 0) {
								jQuery.each(element.PassaggiPR, function (i, passaggio) {
									++controllo_passaggi;
									if (controllo_passaggi <= 5) {
										var td = jQuery("<td>").append(FormatDissPassagio(passaggio)).appendTo(row);
									}
								});
							}

							if (row.find("td").length == "1") {
								var td = jQuery("<td>").text(" ").appendTo(row);
							}
							if (row.find("td").length == "2") {
								var td = jQuery("<td>").text(" ").appendTo(row);
							}
							if (row.find("td").length == "3") {
								var td = jQuery("<td>").text(" ").appendTo(row);
							}
							if (row.find("td").length == "4") {
								var td = jQuery("<td>").text(" ").appendTo(row);
							}
						} else row.append("<th>Nessun risultato</th>");

						jQuery("#table_popup_7").append(row);
					});
				}
			);
			map.panTo(this.getLatLng()); //centratura del fumetto al click
		});

	var myIcon = L.icon({
		iconUrl: "/leaflet/images/ico3/bus_stop_b.png",
		className: "percorso1",
		iconAnchor: [12, 25],
	});
	L.marker([45.08451, 7.68621], {
		icon: myIcon,
	})
		.addTo(map)
		.bindPopup(
			'<div id="popupcontent_8"><p>Fermata: <strong>1215 - VII CIRCOSCRIZIONE</strong>. <br>Passaggi (* se previsione in tempo reale):</p><div class="loading">Caricamento dati <span class="glyphicon glyphicon-refresh glyphicon-refresh-animate"></span></div></div>',
			{
				minWidth: 420,
				maxHeight: 400,
			}
		)
		.on("click", function (e) {
			jQuery.getJSON(
				"/cms/index.php?option=com_gtt&task=palina.getTransitiOld&palina=1215&bacino=U&realtime=true",
				{
					get_param: "value",
				},
				function (data) {
					jQuery(".loading").hide();
					jQuery("#popupcontent_8").append('<table id="table_popup_8" class="table table-condensed table-striped table-hover passaggi"></table>');
					jQuery.each(data, function (index, element) {
						var row = jQuery("<tr>");
						if (element.Linea != undefined) {
							row.append("<th>" + element.LineaAlias + "<small> (" + element.Direzione + ")</small></th>");

							controllo_passaggi = 0;

							jQuery.each(element.PassaggiRT, function (i, passaggio) {
								++controllo_passaggi;
								if (controllo_passaggi < 5) {
									var td = jQuery("<td>").text(passaggio).append("<sup>*</sup>").appendTo(row).wrapInner("<i></i>");
								}
							});

							if (controllo_passaggi == 0) {
								jQuery.each(element.PassaggiPR, function (i, passaggio) {
									++controllo_passaggi;
									if (controllo_passaggi <= 5) {
										var td = jQuery("<td>").append(FormatDissPassagio(passaggio)).appendTo(row);
									}
								});
							}

							if (row.find("td").length == "1") {
								var td = jQuery("<td>").text(" ").appendTo(row);
							}
							if (row.find("td").length == "2") {
								var td = jQuery("<td>").text(" ").appendTo(row);
							}
							if (row.find("td").length == "3") {
								var td = jQuery("<td>").text(" ").appendTo(row);
							}
							if (row.find("td").length == "4") {
								var td = jQuery("<td>").text(" ").appendTo(row);
							}
						} else row.append("<th>Nessun risultato</th>");

						jQuery("#table_popup_8").append(row);
					});
				}
			);
			map.panTo(this.getLatLng()); //centratura del fumetto al click
		});

	var myIcon = L.icon({
		iconUrl: "/leaflet/images/ico3/bus_stop_b.png",
		className: "percorso1",
		iconAnchor: [12, 25],
	});
	L.marker([45.08854, 7.68818], {
		icon: myIcon,
	})
		.addTo(map)
		.bindPopup(
			'<div id="popupcontent_9"><p>Fermata: <strong>1211 - CRISPI SUD</strong>. <br>Passaggi (* se previsione in tempo reale):</p><div class="loading">Caricamento dati <span class="glyphicon glyphicon-refresh glyphicon-refresh-animate"></span></div></div>',
			{
				minWidth: 420,
				maxHeight: 400,
			}
		)
		.on("click", function (e) {
			jQuery.getJSON(
				"/cms/index.php?option=com_gtt&task=palina.getTransitiOld&palina=1211&bacino=U&realtime=true",
				{
					get_param: "value",
				},
				function (data) {
					jQuery(".loading").hide();
					jQuery("#popupcontent_9").append('<table id="table_popup_9" class="table table-condensed table-striped table-hover passaggi"></table>');
					jQuery.each(data, function (index, element) {
						var row = jQuery("<tr>");
						if (element.Linea != undefined) {
							row.append("<th>" + element.LineaAlias + "<small> (" + element.Direzione + ")</small></th>");

							controllo_passaggi = 0;

							jQuery.each(element.PassaggiRT, function (i, passaggio) {
								++controllo_passaggi;
								if (controllo_passaggi < 5) {
									var td = jQuery("<td>").text(passaggio).append("<sup>*</sup>").appendTo(row).wrapInner("<i></i>");
								}
							});

							if (controllo_passaggi == 0) {
								jQuery.each(element.PassaggiPR, function (i, passaggio) {
									++controllo_passaggi;
									if (controllo_passaggi <= 5) {
										var td = jQuery("<td>").append(FormatDissPassagio(passaggio)).appendTo(row);
									}
								});
							}

							if (row.find("td").length == "1") {
								var td = jQuery("<td>").text(" ").appendTo(row);
							}
							if (row.find("td").length == "2") {
								var td = jQuery("<td>").text(" ").appendTo(row);
							}
							if (row.find("td").length == "3") {
								var td = jQuery("<td>").text(" ").appendTo(row);
							}
							if (row.find("td").length == "4") {
								var td = jQuery("<td>").text(" ").appendTo(row);
							}
						} else row.append("<th>Nessun risultato</th>");

						jQuery("#table_popup_9").append(row);
					});
				}
			);
			map.panTo(this.getLatLng()); //centratura del fumetto al click
		});

	var myIcon = L.icon({
		iconUrl: "/leaflet/images/ico3/bus_stop_b.png",
		className: "percorso1",
		iconAnchor: [12, 25],
	});
	L.marker([45.08999, 7.68888], {
		icon: myIcon,
	})
		.addTo(map)
		.bindPopup(
			'<div id="popupcontent_10"><p>Fermata: <strong>1208 - CRISPI NORD</strong>. <br>Passaggi (* se previsione in tempo reale):</p><div class="loading">Caricamento dati <span class="glyphicon glyphicon-refresh glyphicon-refresh-animate"></span></div></div>',
			{
				minWidth: 420,
				maxHeight: 400,
			}
		)
		.on("click", function (e) {
			jQuery.getJSON(
				"/cms/index.php?option=com_gtt&task=palina.getTransitiOld&palina=1208&bacino=U&realtime=true",
				{
					get_param: "value",
				},
				function (data) {
					jQuery(".loading").hide();
					jQuery("#popupcontent_10").append('<table id="table_popup_10" class="table table-condensed table-striped table-hover passaggi"></table>');
					jQuery.each(data, function (index, element) {
						var row = jQuery("<tr>");
						if (element.Linea != undefined) {
							row.append("<th>" + element.LineaAlias + "<small> (" + element.Direzione + ")</small></th>");

							controllo_passaggi = 0;

							jQuery.each(element.PassaggiRT, function (i, passaggio) {
								++controllo_passaggi;
								if (controllo_passaggi < 5) {
									var td = jQuery("<td>").text(passaggio).append("<sup>*</sup>").appendTo(row).wrapInner("<i></i>");
								}
							});

							if (controllo_passaggi == 0) {
								jQuery.each(element.PassaggiPR, function (i, passaggio) {
									++controllo_passaggi;
									if (controllo_passaggi <= 5) {
										var td = jQuery("<td>").append(FormatDissPassagio(passaggio)).appendTo(row);
									}
								});
							}

							if (row.find("td").length == "1") {
								var td = jQuery("<td>").text(" ").appendTo(row);
							}
							if (row.find("td").length == "2") {
								var td = jQuery("<td>").text(" ").appendTo(row);
							}
							if (row.find("td").length == "3") {
								var td = jQuery("<td>").text(" ").appendTo(row);
							}
							if (row.find("td").length == "4") {
								var td = jQuery("<td>").text(" ").appendTo(row);
							}
						} else row.append("<th>Nessun risultato</th>");

						jQuery("#table_popup_10").append(row);
					});
				}
			);
			map.panTo(this.getLatLng()); //centratura del fumetto al click
		});

	var myIcon = L.icon({
		iconUrl: "/leaflet/images/ico3/bus_stop_b.png",
		className: "percorso1",
		iconAnchor: [12, 25],
	});
	L.marker([45.0933, 7.69047], {
		icon: myIcon,
	})
		.addTo(map)
		.bindPopup(
			'<div id="popupcontent_11"><p>Fermata: <strong>1206 - VALPRATO</strong>. <br>Passaggi (* se previsione in tempo reale):</p><div class="loading">Caricamento dati <span class="glyphicon glyphicon-refresh glyphicon-refresh-animate"></span></div></div>',
			{
				minWidth: 420,
				maxHeight: 400,
			}
		)
		.on("click", function (e) {
			jQuery.getJSON(
				"/cms/index.php?option=com_gtt&task=palina.getTransitiOld&palina=1206&bacino=U&realtime=true",
				{
					get_param: "value",
				},
				function (data) {
					jQuery(".loading").hide();
					jQuery("#popupcontent_11").append('<table id="table_popup_11" class="table table-condensed table-striped table-hover passaggi"></table>');
					jQuery.each(data, function (index, element) {
						var row = jQuery("<tr>");
						if (element.Linea != undefined) {
							row.append("<th>" + element.LineaAlias + "<small> (" + element.Direzione + ")</small></th>");

							controllo_passaggi = 0;

							jQuery.each(element.PassaggiRT, function (i, passaggio) {
								++controllo_passaggi;
								if (controllo_passaggi < 5) {
									var td = jQuery("<td>").text(passaggio).append("<sup>*</sup>").appendTo(row).wrapInner("<i></i>");
								}
							});

							if (controllo_passaggi == 0) {
								jQuery.each(element.PassaggiPR, function (i, passaggio) {
									++controllo_passaggi;
									if (controllo_passaggi <= 5) {
										var td = jQuery("<td>").append(FormatDissPassagio(passaggio)).appendTo(row);
									}
								});
							}

							if (row.find("td").length == "1") {
								var td = jQuery("<td>").text(" ").appendTo(row);
							}
							if (row.find("td").length == "2") {
								var td = jQuery("<td>").text(" ").appendTo(row);
							}
							if (row.find("td").length == "3") {
								var td = jQuery("<td>").text(" ").appendTo(row);
							}
							if (row.find("td").length == "4") {
								var td = jQuery("<td>").text(" ").appendTo(row);
							}
						} else row.append("<th>Nessun risultato</th>");

						jQuery("#table_popup_11").append(row);
					});
				}
			);
			map.panTo(this.getLatLng()); //centratura del fumetto al click
		});

	var myIcon = L.icon({
		iconUrl: "/leaflet/images/ico3/bus_stop_b.png",
		className: "percorso1",
		iconAnchor: [12, 25],
	});
	L.marker([45.09503, 7.69133], {
		icon: myIcon,
	})
		.addTo(map)
		.bindPopup(
			'<div id="popupcontent_12"><p>Fermata: <strong>1204 - LAURO ROSSI</strong>. <br>Passaggi (* se previsione in tempo reale):</p><div class="loading">Caricamento dati <span class="glyphicon glyphicon-refresh glyphicon-refresh-animate"></span></div></div>',
			{
				minWidth: 420,
				maxHeight: 400,
			}
		)
		.on("click", function (e) {
			jQuery.getJSON(
				"/cms/index.php?option=com_gtt&task=palina.getTransitiOld&palina=1204&bacino=U&realtime=true",
				{
					get_param: "value",
				},
				function (data) {
					jQuery(".loading").hide();
					jQuery("#popupcontent_12").append('<table id="table_popup_12" class="table table-condensed table-striped table-hover passaggi"></table>');
					jQuery.each(data, function (index, element) {
						var row = jQuery("<tr>");
						if (element.Linea != undefined) {
							row.append("<th>" + element.LineaAlias + "<small> (" + element.Direzione + ")</small></th>");

							controllo_passaggi = 0;

							jQuery.each(element.PassaggiRT, function (i, passaggio) {
								++controllo_passaggi;
								if (controllo_passaggi < 5) {
									var td = jQuery("<td>").text(passaggio).append("<sup>*</sup>").appendTo(row).wrapInner("<i></i>");
								}
							});

							if (controllo_passaggi == 0) {
								jQuery.each(element.PassaggiPR, function (i, passaggio) {
									++controllo_passaggi;
									if (controllo_passaggi <= 5) {
										var td = jQuery("<td>").append(FormatDissPassagio(passaggio)).appendTo(row);
									}
								});
							}

							if (row.find("td").length == "1") {
								var td = jQuery("<td>").text(" ").appendTo(row);
							}
							if (row.find("td").length == "2") {
								var td = jQuery("<td>").text(" ").appendTo(row);
							}
							if (row.find("td").length == "3") {
								var td = jQuery("<td>").text(" ").appendTo(row);
							}
							if (row.find("td").length == "4") {
								var td = jQuery("<td>").text(" ").appendTo(row);
							}
						} else row.append("<th>Nessun risultato</th>");

						jQuery("#table_popup_12").append(row);
					});
				}
			);
			map.panTo(this.getLatLng()); //centratura del fumetto al click
		});

	var myIcon = L.icon({
		iconUrl: "/leaflet/images/ico3/bus_stop_b.png",
		className: "percorso1",
		iconAnchor: [12, 25],
	});
	L.marker([45.09814, 7.69283], {
		icon: myIcon,
	})
		.addTo(map)
		.bindPopup(
			'<div id="popupcontent_13"><p>Fermata: <strong>1202 - RONDISSONE</strong>. <br>Passaggi (* se previsione in tempo reale):</p><div class="loading">Caricamento dati <span class="glyphicon glyphicon-refresh glyphicon-refresh-animate"></span></div></div>',
			{
				minWidth: 420,
				maxHeight: 400,
			}
		)
		.on("click", function (e) {
			jQuery.getJSON(
				"/cms/index.php?option=com_gtt&task=palina.getTransitiOld&palina=1202&bacino=U&realtime=true",
				{
					get_param: "value",
				},
				function (data) {
					jQuery(".loading").hide();
					jQuery("#popupcontent_13").append('<table id="table_popup_13" class="table table-condensed table-striped table-hover passaggi"></table>');
					jQuery.each(data, function (index, element) {
						var row = jQuery("<tr>");
						if (element.Linea != undefined) {
							row.append("<th>" + element.LineaAlias + "<small> (" + element.Direzione + ")</small></th>");

							controllo_passaggi = 0;

							jQuery.each(element.PassaggiRT, function (i, passaggio) {
								++controllo_passaggi;
								if (controllo_passaggi < 5) {
									var td = jQuery("<td>").text(passaggio).append("<sup>*</sup>").appendTo(row).wrapInner("<i></i>");
								}
							});

							if (controllo_passaggi == 0) {
								jQuery.each(element.PassaggiPR, function (i, passaggio) {
									++controllo_passaggi;
									if (controllo_passaggi <= 5) {
										var td = jQuery("<td>").append(FormatDissPassagio(passaggio)).appendTo(row);
									}
								});
							}

							if (row.find("td").length == "1") {
								var td = jQuery("<td>").text(" ").appendTo(row);
							}
							if (row.find("td").length == "2") {
								var td = jQuery("<td>").text(" ").appendTo(row);
							}
							if (row.find("td").length == "3") {
								var td = jQuery("<td>").text(" ").appendTo(row);
							}
							if (row.find("td").length == "4") {
								var td = jQuery("<td>").text(" ").appendTo(row);
							}
						} else row.append("<th>Nessun risultato</th>");

						jQuery("#table_popup_13").append(row);
					});
				}
			);
			map.panTo(this.getLatLng()); //centratura del fumetto al click
		});

	var myIcon = L.icon({
		iconUrl: "/leaflet/images/ico3/bus_stop_b.png",
		className: "percorso1",
		iconAnchor: [12, 25],
	});
	L.marker([45.10041, 7.69397], {
		icon: myIcon,
	})
		.addTo(map)
		.bindPopup(
			'<div id="popupcontent_14"><p>Fermata: <strong>1200 - VERCELLI N.168</strong>. <br>Passaggi (* se previsione in tempo reale):</p><div class="loading">Caricamento dati <span class="glyphicon glyphicon-refresh glyphicon-refresh-animate"></span></div></div>',
			{
				minWidth: 420,
				maxHeight: 400,
			}
		)
		.on("click", function (e) {
			jQuery.getJSON(
				"/cms/index.php?option=com_gtt&task=palina.getTransitiOld&palina=1200&bacino=U&realtime=true",
				{
					get_param: "value",
				},
				function (data) {
					jQuery(".loading").hide();
					jQuery("#popupcontent_14").append('<table id="table_popup_14" class="table table-condensed table-striped table-hover passaggi"></table>');
					jQuery.each(data, function (index, element) {
						var row = jQuery("<tr>");
						if (element.Linea != undefined) {
							row.append("<th>" + element.LineaAlias + "<small> (" + element.Direzione + ")</small></th>");

							controllo_passaggi = 0;

							jQuery.each(element.PassaggiRT, function (i, passaggio) {
								++controllo_passaggi;
								if (controllo_passaggi < 5) {
									var td = jQuery("<td>").text(passaggio).append("<sup>*</sup>").appendTo(row).wrapInner("<i></i>");
								}
							});

							if (controllo_passaggi == 0) {
								jQuery.each(element.PassaggiPR, function (i, passaggio) {
									++controllo_passaggi;
									if (controllo_passaggi <= 5) {
										var td = jQuery("<td>").append(FormatDissPassagio(passaggio)).appendTo(row);
									}
								});
							}

							if (row.find("td").length == "1") {
								var td = jQuery("<td>").text(" ").appendTo(row);
							}
							if (row.find("td").length == "2") {
								var td = jQuery("<td>").text(" ").appendTo(row);
							}
							if (row.find("td").length == "3") {
								var td = jQuery("<td>").text(" ").appendTo(row);
							}
							if (row.find("td").length == "4") {
								var td = jQuery("<td>").text(" ").appendTo(row);
							}
						} else row.append("<th>Nessun risultato</th>");

						jQuery("#table_popup_14").append(row);
					});
				}
			);
			map.panTo(this.getLatLng()); //centratura del fumetto al click
		});

	var myIcon = L.icon({
		iconUrl: "/leaflet/images/ico3/bus_stop_b.png",
		className: "percorso1",
		iconAnchor: [12, 25],
	});
	L.marker([45.10291, 7.69528], {
		icon: myIcon,
	})
		.addTo(map)
		.bindPopup(
			'<div id="popupcontent_15"><p>Fermata: <strong>1199 - REBAUDENGO SUD</strong>. <br>Passaggi (* se previsione in tempo reale):</p><div class="loading">Caricamento dati <span class="glyphicon glyphicon-refresh glyphicon-refresh-animate"></span></div></div>',
			{
				minWidth: 420,
				maxHeight: 400,
			}
		)
		.on("click", function (e) {
			jQuery.getJSON(
				"/cms/index.php?option=com_gtt&task=palina.getTransitiOld&palina=1199&bacino=U&realtime=true",
				{
					get_param: "value",
				},
				function (data) {
					jQuery(".loading").hide();
					jQuery("#popupcontent_15").append('<table id="table_popup_15" class="table table-condensed table-striped table-hover passaggi"></table>');
					jQuery.each(data, function (index, element) {
						var row = jQuery("<tr>");
						if (element.Linea != undefined) {
							row.append("<th>" + element.LineaAlias + "<small> (" + element.Direzione + ")</small></th>");

							controllo_passaggi = 0;

							jQuery.each(element.PassaggiRT, function (i, passaggio) {
								++controllo_passaggi;
								if (controllo_passaggi < 5) {
									var td = jQuery("<td>").text(passaggio).append("<sup>*</sup>").appendTo(row).wrapInner("<i></i>");
								}
							});

							if (controllo_passaggi == 0) {
								jQuery.each(element.PassaggiPR, function (i, passaggio) {
									++controllo_passaggi;
									if (controllo_passaggi <= 5) {
										var td = jQuery("<td>").append(FormatDissPassagio(passaggio)).appendTo(row);
									}
								});
							}

							if (row.find("td").length == "1") {
								var td = jQuery("<td>").text(" ").appendTo(row);
							}
							if (row.find("td").length == "2") {
								var td = jQuery("<td>").text(" ").appendTo(row);
							}
							if (row.find("td").length == "3") {
								var td = jQuery("<td>").text(" ").appendTo(row);
							}
							if (row.find("td").length == "4") {
								var td = jQuery("<td>").text(" ").appendTo(row);
							}
						} else row.append("<th>Nessun risultato</th>");

						jQuery("#table_popup_15").append(row);
					});
				}
			);
			map.panTo(this.getLatLng()); //centratura del fumetto al click
		});

	var myIcon = L.icon({
		iconUrl: "/leaflet/images/ico3/bus_stop_b.png",
		className: "percorso1",
		iconAnchor: [12, 25],
	});
	L.marker([45.10588, 7.69669], {
		icon: myIcon,
	})
		.addTo(map)
		.bindPopup(
			'<div id="popupcontent_16"><p>Fermata: <strong>1195 - OXILIA</strong>. <br>Passaggi (* se previsione in tempo reale):</p><div class="loading">Caricamento dati <span class="glyphicon glyphicon-refresh glyphicon-refresh-animate"></span></div></div>',
			{
				minWidth: 420,
				maxHeight: 400,
			}
		)
		.on("click", function (e) {
			jQuery.getJSON(
				"/cms/index.php?option=com_gtt&task=palina.getTransitiOld&palina=1195&bacino=U&realtime=true",
				{
					get_param: "value",
				},
				function (data) {
					jQuery(".loading").hide();
					jQuery("#popupcontent_16").append('<table id="table_popup_16" class="table table-condensed table-striped table-hover passaggi"></table>');
					jQuery.each(data, function (index, element) {
						var row = jQuery("<tr>");
						if (element.Linea != undefined) {
							row.append("<th>" + element.LineaAlias + "<small> (" + element.Direzione + ")</small></th>");

							controllo_passaggi = 0;

							jQuery.each(element.PassaggiRT, function (i, passaggio) {
								++controllo_passaggi;
								if (controllo_passaggi < 5) {
									var td = jQuery("<td>").text(passaggio).append("<sup>*</sup>").appendTo(row).wrapInner("<i></i>");
								}
							});

							if (controllo_passaggi == 0) {
								jQuery.each(element.PassaggiPR, function (i, passaggio) {
									++controllo_passaggi;
									if (controllo_passaggi <= 5) {
										var td = jQuery("<td>").append(FormatDissPassagio(passaggio)).appendTo(row);
									}
								});
							}

							if (row.find("td").length == "1") {
								var td = jQuery("<td>").text(" ").appendTo(row);
							}
							if (row.find("td").length == "2") {
								var td = jQuery("<td>").text(" ").appendTo(row);
							}
							if (row.find("td").length == "3") {
								var td = jQuery("<td>").text(" ").appendTo(row);
							}
							if (row.find("td").length == "4") {
								var td = jQuery("<td>").text(" ").appendTo(row);
							}
						} else row.append("<th>Nessun risultato</th>");

						jQuery("#table_popup_16").append(row);
					});
				}
			);
			map.panTo(this.getLatLng()); //centratura del fumetto al click
		});

	var myIcon = L.icon({
		iconUrl: "/leaflet/images/ico3/bus_stop_b.png",
		className: "percorso1",
		iconAnchor: [12, 25],
	});
	L.marker([45.10913, 7.69767], {
		icon: myIcon,
	})
		.addTo(map)
		.bindPopup(
			'<div id="popupcontent_17"><p>Fermata: <strong>1193 - CENA</strong>. <br>Passaggi (* se previsione in tempo reale):</p><div class="loading">Caricamento dati <span class="glyphicon glyphicon-refresh glyphicon-refresh-animate"></span></div></div>',
			{
				minWidth: 420,
				maxHeight: 400,
			}
		)
		.on("click", function (e) {
			jQuery.getJSON(
				"/cms/index.php?option=com_gtt&task=palina.getTransitiOld&palina=1193&bacino=U&realtime=true",
				{
					get_param: "value",
				},
				function (data) {
					jQuery(".loading").hide();
					jQuery("#popupcontent_17").append('<table id="table_popup_17" class="table table-condensed table-striped table-hover passaggi"></table>');
					jQuery.each(data, function (index, element) {
						var row = jQuery("<tr>");
						if (element.Linea != undefined) {
							row.append("<th>" + element.LineaAlias + "<small> (" + element.Direzione + ")</small></th>");

							controllo_passaggi = 0;

							jQuery.each(element.PassaggiRT, function (i, passaggio) {
								++controllo_passaggi;
								if (controllo_passaggi < 5) {
									var td = jQuery("<td>").text(passaggio).append("<sup>*</sup>").appendTo(row).wrapInner("<i></i>");
								}
							});

							if (controllo_passaggi == 0) {
								jQuery.each(element.PassaggiPR, function (i, passaggio) {
									++controllo_passaggi;
									if (controllo_passaggi <= 5) {
										var td = jQuery("<td>").append(FormatDissPassagio(passaggio)).appendTo(row);
									}
								});
							}

							if (row.find("td").length == "1") {
								var td = jQuery("<td>").text(" ").appendTo(row);
							}
							if (row.find("td").length == "2") {
								var td = jQuery("<td>").text(" ").appendTo(row);
							}
							if (row.find("td").length == "3") {
								var td = jQuery("<td>").text(" ").appendTo(row);
							}
							if (row.find("td").length == "4") {
								var td = jQuery("<td>").text(" ").appendTo(row);
							}
						} else row.append("<th>Nessun risultato</th>");

						jQuery("#table_popup_17").append(row);
					});
				}
			);
			map.panTo(this.getLatLng()); //centratura del fumetto al click
		});

	var myIcon = L.icon({
		iconUrl: "/leaflet/images/ico3/bus_stop_b.png",
		className: "percorso1",
		iconAnchor: [12, 25],
	});
	L.marker([45.1114, 7.6982], {
		icon: myIcon,
	})
		.addTo(map)
		.bindPopup(
			'<div id="popupcontent_18"><p>Fermata: <strong>1191 - BELGIOIOSO</strong>. <br>Passaggi (* se previsione in tempo reale):</p><div class="loading">Caricamento dati <span class="glyphicon glyphicon-refresh glyphicon-refresh-animate"></span></div></div>',
			{
				minWidth: 420,
				maxHeight: 400,
			}
		)
		.on("click", function (e) {
			jQuery.getJSON(
				"/cms/index.php?option=com_gtt&task=palina.getTransitiOld&palina=1191&bacino=U&realtime=true",
				{
					get_param: "value",
				},
				function (data) {
					jQuery(".loading").hide();
					jQuery("#popupcontent_18").append('<table id="table_popup_18" class="table table-condensed table-striped table-hover passaggi"></table>');
					jQuery.each(data, function (index, element) {
						var row = jQuery("<tr>");
						if (element.Linea != undefined) {
							row.append("<th>" + element.LineaAlias + "<small> (" + element.Direzione + ")</small></th>");

							controllo_passaggi = 0;

							jQuery.each(element.PassaggiRT, function (i, passaggio) {
								++controllo_passaggi;
								if (controllo_passaggi < 5) {
									var td = jQuery("<td>").text(passaggio).append("<sup>*</sup>").appendTo(row).wrapInner("<i></i>");
								}
							});

							if (controllo_passaggi == 0) {
								jQuery.each(element.PassaggiPR, function (i, passaggio) {
									++controllo_passaggi;
									if (controllo_passaggi <= 5) {
										var td = jQuery("<td>").append(FormatDissPassagio(passaggio)).appendTo(row);
									}
								});
							}

							if (row.find("td").length == "1") {
								var td = jQuery("<td>").text(" ").appendTo(row);
							}
							if (row.find("td").length == "2") {
								var td = jQuery("<td>").text(" ").appendTo(row);
							}
							if (row.find("td").length == "3") {
								var td = jQuery("<td>").text(" ").appendTo(row);
							}
							if (row.find("td").length == "4") {
								var td = jQuery("<td>").text(" ").appendTo(row);
							}
						} else row.append("<th>Nessun risultato</th>");

						jQuery("#table_popup_18").append(row);
					});
				}
			);
			map.panTo(this.getLatLng()); //centratura del fumetto al click
		});

	var myIcon = L.icon({
		iconUrl: "/leaflet/images/ico3/bus_stop_b.png",
		className: "percorso1",
		iconAnchor: [12, 25],
	});
	L.marker([45.11622, 7.70176], {
		icon: myIcon,
	})
		.addTo(map)
		.bindPopup(
			'<div id="popupcontent_19"><p>Fermata: <strong>1189 - ANTIOCA</strong>. <br>Passaggi (* se previsione in tempo reale):</p><div class="loading">Caricamento dati <span class="glyphicon glyphicon-refresh glyphicon-refresh-animate"></span></div></div>',
			{
				minWidth: 420,
				maxHeight: 400,
			}
		)
		.on("click", function (e) {
			jQuery.getJSON(
				"/cms/index.php?option=com_gtt&task=palina.getTransitiOld&palina=1189&bacino=U&realtime=true",
				{
					get_param: "value",
				},
				function (data) {
					jQuery(".loading").hide();
					jQuery("#popupcontent_19").append('<table id="table_popup_19" class="table table-condensed table-striped table-hover passaggi"></table>');
					jQuery.each(data, function (index, element) {
						var row = jQuery("<tr>");
						if (element.Linea != undefined) {
							row.append("<th>" + element.LineaAlias + "<small> (" + element.Direzione + ")</small></th>");

							controllo_passaggi = 0;

							jQuery.each(element.PassaggiRT, function (i, passaggio) {
								++controllo_passaggi;
								if (controllo_passaggi < 5) {
									var td = jQuery("<td>").text(passaggio).append("<sup>*</sup>").appendTo(row).wrapInner("<i></i>");
								}
							});

							if (controllo_passaggi == 0) {
								jQuery.each(element.PassaggiPR, function (i, passaggio) {
									++controllo_passaggi;
									if (controllo_passaggi <= 5) {
										var td = jQuery("<td>").append(FormatDissPassagio(passaggio)).appendTo(row);
									}
								});
							}

							if (row.find("td").length == "1") {
								var td = jQuery("<td>").text(" ").appendTo(row);
							}
							if (row.find("td").length == "2") {
								var td = jQuery("<td>").text(" ").appendTo(row);
							}
							if (row.find("td").length == "3") {
								var td = jQuery("<td>").text(" ").appendTo(row);
							}
							if (row.find("td").length == "4") {
								var td = jQuery("<td>").text(" ").appendTo(row);
							}
						} else row.append("<th>Nessun risultato</th>");

						jQuery("#table_popup_19").append(row);
					});
				}
			);
			map.panTo(this.getLatLng()); //centratura del fumetto al click
		});

	var myIcon = L.icon({
		iconUrl: "/leaflet/images/ico3/bus_stop_b.png",
		className: "percorso1",
		iconAnchor: [12, 25],
	});
	L.marker([45.11705, 7.70472], {
		icon: myIcon,
	})
		.addTo(map)
		.bindPopup(
			'<div id="popupcontent_20"><p>Fermata: <strong>1187 - IVREA</strong>. <br>Passaggi (* se previsione in tempo reale):</p><div class="loading">Caricamento dati <span class="glyphicon glyphicon-refresh glyphicon-refresh-animate"></span></div></div>',
			{
				minWidth: 420,
				maxHeight: 400,
			}
		)
		.on("click", function (e) {
			jQuery.getJSON(
				"/cms/index.php?option=com_gtt&task=palina.getTransitiOld&palina=1187&bacino=U&realtime=true",
				{
					get_param: "value",
				},
				function (data) {
					jQuery(".loading").hide();
					jQuery("#popupcontent_20").append('<table id="table_popup_20" class="table table-condensed table-striped table-hover passaggi"></table>');
					jQuery.each(data, function (index, element) {
						var row = jQuery("<tr>");
						if (element.Linea != undefined) {
							row.append("<th>" + element.LineaAlias + "<small> (" + element.Direzione + ")</small></th>");

							controllo_passaggi = 0;

							jQuery.each(element.PassaggiRT, function (i, passaggio) {
								++controllo_passaggi;
								if (controllo_passaggi < 5) {
									var td = jQuery("<td>").text(passaggio).append("<sup>*</sup>").appendTo(row).wrapInner("<i></i>");
								}
							});

							if (controllo_passaggi == 0) {
								jQuery.each(element.PassaggiPR, function (i, passaggio) {
									++controllo_passaggi;
									if (controllo_passaggi <= 5) {
										var td = jQuery("<td>").append(FormatDissPassagio(passaggio)).appendTo(row);
									}
								});
							}

							if (row.find("td").length == "1") {
								var td = jQuery("<td>").text(" ").appendTo(row);
							}
							if (row.find("td").length == "2") {
								var td = jQuery("<td>").text(" ").appendTo(row);
							}
							if (row.find("td").length == "3") {
								var td = jQuery("<td>").text(" ").appendTo(row);
							}
							if (row.find("td").length == "4") {
								var td = jQuery("<td>").text(" ").appendTo(row);
							}
						} else row.append("<th>Nessun risultato</th>");

						jQuery("#table_popup_20").append(row);
					});
				}
			);
			map.panTo(this.getLatLng()); //centratura del fumetto al click
		});

	var myIcon = L.icon({
		iconUrl: "/leaflet/images/ico3/bus_stop_b.png",
		className: "percorso1",
		iconAnchor: [12, 25],
	});
	L.marker([45.11826, 7.70875], {
		icon: myIcon,
	})
		.addTo(map)
		.bindPopup(
			'<div id="popupcontent_21"><p>Fermata: <strong>1330 - TEMPIA</strong>. <br>Passaggi (* se previsione in tempo reale):</p><div class="loading">Caricamento dati <span class="glyphicon glyphicon-refresh glyphicon-refresh-animate"></span></div></div>',
			{
				minWidth: 420,
				maxHeight: 400,
			}
		)
		.on("click", function (e) {
			jQuery.getJSON(
				"/cms/index.php?option=com_gtt&task=palina.getTransitiOld&palina=1330&bacino=U&realtime=true",
				{
					get_param: "value",
				},
				function (data) {
					jQuery(".loading").hide();
					jQuery("#popupcontent_21").append('<table id="table_popup_21" class="table table-condensed table-striped table-hover passaggi"></table>');
					jQuery.each(data, function (index, element) {
						var row = jQuery("<tr>");
						if (element.Linea != undefined) {
							row.append("<th>" + element.LineaAlias + "<small> (" + element.Direzione + ")</small></th>");

							controllo_passaggi = 0;

							jQuery.each(element.PassaggiRT, function (i, passaggio) {
								++controllo_passaggi;
								if (controllo_passaggi < 5) {
									var td = jQuery("<td>").text(passaggio).append("<sup>*</sup>").appendTo(row).wrapInner("<i></i>");
								}
							});

							if (controllo_passaggi == 0) {
								jQuery.each(element.PassaggiPR, function (i, passaggio) {
									++controllo_passaggi;
									if (controllo_passaggi <= 5) {
										var td = jQuery("<td>").append(FormatDissPassagio(passaggio)).appendTo(row);
									}
								});
							}

							if (row.find("td").length == "1") {
								var td = jQuery("<td>").text(" ").appendTo(row);
							}
							if (row.find("td").length == "2") {
								var td = jQuery("<td>").text(" ").appendTo(row);
							}
							if (row.find("td").length == "3") {
								var td = jQuery("<td>").text(" ").appendTo(row);
							}
							if (row.find("td").length == "4") {
								var td = jQuery("<td>").text(" ").appendTo(row);
							}
						} else row.append("<th>Nessun risultato</th>");

						jQuery("#table_popup_21").append(row);
					});
				}
			);
			map.panTo(this.getLatLng()); //centratura del fumetto al click
		});

	var myIcon = L.icon({
		iconUrl: "/leaflet/images/ico3/bus_stop_b.png",
		className: "percorso1",
		iconAnchor: [12, 25],
	});
	L.marker([45.11945, 7.71265], {
		icon: myIcon,
	})
		.addTo(map)
		.bindPopup(
			'<div id="popupcontent_22"><p>Fermata: <strong>1333 - CENTRO COMMERCIALE</strong>. <br>Passaggi (* se previsione in tempo reale):</p><div class="loading">Caricamento dati <span class="glyphicon glyphicon-refresh glyphicon-refresh-animate"></span></div></div>',
			{
				minWidth: 420,
				maxHeight: 400,
			}
		)
		.on("click", function (e) {
			jQuery.getJSON(
				"/cms/index.php?option=com_gtt&task=palina.getTransitiOld&palina=1333&bacino=U&realtime=true",
				{
					get_param: "value",
				},
				function (data) {
					jQuery(".loading").hide();
					jQuery("#popupcontent_22").append('<table id="table_popup_22" class="table table-condensed table-striped table-hover passaggi"></table>');
					jQuery.each(data, function (index, element) {
						var row = jQuery("<tr>");
						if (element.Linea != undefined) {
							row.append("<th>" + element.LineaAlias + "<small> (" + element.Direzione + ")</small></th>");

							controllo_passaggi = 0;

							jQuery.each(element.PassaggiRT, function (i, passaggio) {
								++controllo_passaggi;
								if (controllo_passaggi < 5) {
									var td = jQuery("<td>").text(passaggio).append("<sup>*</sup>").appendTo(row).wrapInner("<i></i>");
								}
							});

							if (controllo_passaggi == 0) {
								jQuery.each(element.PassaggiPR, function (i, passaggio) {
									++controllo_passaggi;
									if (controllo_passaggi <= 5) {
										var td = jQuery("<td>").append(FormatDissPassagio(passaggio)).appendTo(row);
									}
								});
							}

							if (row.find("td").length == "1") {
								var td = jQuery("<td>").text(" ").appendTo(row);
							}
							if (row.find("td").length == "2") {
								var td = jQuery("<td>").text(" ").appendTo(row);
							}
							if (row.find("td").length == "3") {
								var td = jQuery("<td>").text(" ").appendTo(row);
							}
							if (row.find("td").length == "4") {
								var td = jQuery("<td>").text(" ").appendTo(row);
							}
						} else row.append("<th>Nessun risultato</th>");

						jQuery("#table_popup_22").append(row);
					});
				}
			);
			map.panTo(this.getLatLng()); //centratura del fumetto al click
		});

	var myIcon = L.icon({
		iconUrl: "/leaflet/images/ico3/bus_stop_b.png",
		className: "percorso1",
		iconAnchor: [12, 25],
	});
	L.marker([45.12148, 7.71316], {
		icon: myIcon,
	})
		.addTo(map)
		.bindPopup(
			'<div id="popupcontent_23"><p>Fermata: <strong>3560 - STAZIONE STURA</strong>. <br>Passaggi (* se previsione in tempo reale):</p><div class="loading">Caricamento dati <span class="glyphicon glyphicon-refresh glyphicon-refresh-animate"></span></div></div>',
			{
				minWidth: 420,
				maxHeight: 400,
			}
		)
		.on("click", function (e) {
			jQuery.getJSON(
				"/cms/index.php?option=com_gtt&task=palina.getTransitiOld&palina=3560&bacino=U&realtime=true",
				{
					get_param: "value",
				},
				function (data) {
					jQuery(".loading").hide();
					jQuery("#popupcontent_23").append('<table id="table_popup_23" class="table table-condensed table-striped table-hover passaggi"></table>');
					jQuery.each(data, function (index, element) {
						var row = jQuery("<tr>");
						if (element.Linea != undefined) {
							row.append("<th>" + element.LineaAlias + "<small> (" + element.Direzione + ")</small></th>");

							controllo_passaggi = 0;

							jQuery.each(element.PassaggiRT, function (i, passaggio) {
								++controllo_passaggi;
								if (controllo_passaggi < 5) {
									var td = jQuery("<td>").text(passaggio).append("<sup>*</sup>").appendTo(row).wrapInner("<i></i>");
								}
							});

							if (controllo_passaggi == 0) {
								jQuery.each(element.PassaggiPR, function (i, passaggio) {
									++controllo_passaggi;
									if (controllo_passaggi <= 5) {
										var td = jQuery("<td>").append(FormatDissPassagio(passaggio)).appendTo(row);
									}
								});
							}

							if (row.find("td").length == "1") {
								var td = jQuery("<td>").text(" ").appendTo(row);
							}
							if (row.find("td").length == "2") {
								var td = jQuery("<td>").text(" ").appendTo(row);
							}
							if (row.find("td").length == "3") {
								var td = jQuery("<td>").text(" ").appendTo(row);
							}
							if (row.find("td").length == "4") {
								var td = jQuery("<td>").text(" ").appendTo(row);
							}
						} else row.append("<th>Nessun risultato</th>");

						jQuery("#table_popup_23").append(row);
					});
				}
			);
			map.panTo(this.getLatLng()); //centratura del fumetto al click
		});

	var myIcon = L.icon({
		iconUrl: "/leaflet/images/ico3/ico_rossa.png",
		className: "percorso1",
		iconAnchor: [12, 25],
	});
	L.marker([45.12011, 7.71079], {
		icon: myIcon,
	})
		.addTo(map)
		.bindPopup(
			'<div id="popupcontent_24"><p>Fermata: <strong>1362 - PARK STURA CAP.</strong>. <br>Passaggi (* se previsione in tempo reale):</p><div class="loading">Caricamento dati <span class="glyphicon glyphicon-refresh glyphicon-refresh-animate"></span></div></div>',
			{
				minWidth: 420,
				maxHeight: 400,
			}
		)
		.on("click", function (e) {
			jQuery.getJSON(
				"/cms/index.php?option=com_gtt&task=palina.getTransitiOld&palina=1362&bacino=U&realtime=true",
				{
					get_param: "value",
				},
				function (data) {
					jQuery(".loading").hide();
					jQuery("#popupcontent_24").append('<table id="table_popup_24" class="table table-condensed table-striped table-hover passaggi"></table>');
					jQuery.each(data, function (index, element) {
						var row = jQuery("<tr>");
						if (element.Linea != undefined) {
							row.append("<th>" + element.LineaAlias + "<small> (" + element.Direzione + ")</small></th>");

							controllo_passaggi = 0;

							jQuery.each(element.PassaggiRT, function (i, passaggio) {
								++controllo_passaggi;
								if (controllo_passaggi < 5) {
									var td = jQuery("<td>").text(passaggio).append("<sup>*</sup>").appendTo(row).wrapInner("<i></i>");
								}
							});

							if (controllo_passaggi == 0) {
								jQuery.each(element.PassaggiPR, function (i, passaggio) {
									++controllo_passaggi;
									if (controllo_passaggi <= 5) {
										var td = jQuery("<td>").append(FormatDissPassagio(passaggio)).appendTo(row);
									}
								});
							}

							if (row.find("td").length == "1") {
								var td = jQuery("<td>").text(" ").appendTo(row);
							}
							if (row.find("td").length == "2") {
								var td = jQuery("<td>").text(" ").appendTo(row);
							}
							if (row.find("td").length == "3") {
								var td = jQuery("<td>").text(" ").appendTo(row);
							}
							if (row.find("td").length == "4") {
								var td = jQuery("<td>").text(" ").appendTo(row);
							}
						} else row.append("<th>Nessun risultato</th>");

						jQuery("#table_popup_24").append(row);
					});
				}
			);
			map.panTo(this.getLatLng()); //centratura del fumetto al click
		});

	var firstpolyline = new L.Polyline(
		[
			new L.LatLng(45.07334, 7.66758),
			new L.LatLng(45.07308, 7.66738),
			new L.LatLng(45.07301, 7.66746),
			new L.LatLng(45.07301, 7.66762),
			new L.LatLng(45.07311, 7.6677),
			new L.LatLng(45.07321, 7.66761),
			new L.LatLng(45.07362, 7.66787),
			new L.LatLng(45.07356, 7.66808),
			new L.LatLng(45.07366, 7.66828),
			new L.LatLng(45.07283, 7.6705),
			new L.LatLng(45.07026, 7.67774),
			new L.LatLng(45.07066, 7.68272),
			new L.LatLng(45.07073, 7.68293),
			new L.LatLng(45.07324, 7.68463),
			new L.LatLng(45.07387, 7.68498),
			new L.LatLng(45.07576, 7.68622),
			new L.LatLng(45.07589, 7.68612),
			new L.LatLng(45.07672, 7.6836),
			new L.LatLng(45.08149, 7.6867),
			new L.LatLng(45.08162, 7.68695),
			new L.LatLng(45.08296, 7.6878),
			new L.LatLng(45.08365, 7.68566),
			new L.LatLng(45.08678, 7.68717),
			new L.LatLng(45.0885, 7.68811),
			new L.LatLng(45.08913, 7.6883),
			new L.LatLng(45.09087, 7.68924),
			new L.LatLng(45.102, 7.69459),
			new L.LatLng(45.10254, 7.69488),
			new L.LatLng(45.10264, 7.69507),
			new L.LatLng(45.10277, 7.69515),
			new L.LatLng(45.10609, 7.69672),
			new L.LatLng(45.10759, 7.69717),
			new L.LatLng(45.11479, 7.69904),
			new L.LatLng(45.11522, 7.69934),
			new L.LatLng(45.11544, 7.6996),
			new L.LatLng(45.11564, 7.69989),
			new L.LatLng(45.11591, 7.70055),
			new L.LatLng(45.11885, 7.71057),
			new L.LatLng(45.11891, 7.71095),
			new L.LatLng(45.11883, 7.71115),
			new L.LatLng(45.11886, 7.71148),
			new L.LatLng(45.11899, 7.71169),
			new L.LatLng(45.11915, 7.71172),
			new L.LatLng(45.11987, 7.71384),
			new L.LatLng(45.12108, 7.71313),
			new L.LatLng(45.12117, 7.71318),
			new L.LatLng(45.12124, 7.7131),
			new L.LatLng(45.12138, 7.71362),
			new L.LatLng(45.12147, 7.71363),
			new L.LatLng(45.12154, 7.71353),
			new L.LatLng(45.12143, 7.71313),
			new L.LatLng(45.12112, 7.71292),
			new L.LatLng(45.12089, 7.71215),
			new L.LatLng(45.12071, 7.71201),
			new L.LatLng(45.1207, 7.71183),
			new L.LatLng(45.1204, 7.71159),
			new L.LatLng(45.12023, 7.71122),
			new L.LatLng(45.12011, 7.71079),
		],
		{
			color: "#0055a4",
			className: "percorso1",
			opacity: 0.6,
			weight: 5,
			offset: 3,
		}
	);
	firstpolyline.addTo(map);

	map.fitBounds(firstpolyline.getBounds()); //centratura mappa sui vari livelli
	//gestisco attivazione o meno dei percorsi
	$(".percorso_check:not(:checked)").each(function () {
		var selezionato = $(this).attr("id");
		$("." + selezionato).hide();
	});

	$(".percorso_check").click(function () {
		var selezionato = $(this).attr("id");
		$("." + selezionato).toggle();
	});

	// indicazione della posizione dei bus in tempo reale

	var c_type1_bus_orange = L.AwesomeMarkers.icon({
		icon: "bus",
		prefix: "fas fa",
		markerColor: "orange",
		iconColor: "#FFFFFF", //any hex color (e.g., "#FFFFFF")
	});

	var c_type1_bus_green = L.AwesomeMarkers.icon({
		icon: "bus",
		prefix: "fas fa",
		markerColor: "green",
		iconColor: "#FFFFFF", //any hex color (e.g., "#FFFFFF")
	});

	var c_type1_tram_orange = L.AwesomeMarkers.icon({
		icon: "tram",
		prefix: "fas fa",
		markerColor: "orange",
		iconColor: "#FFFFFF", //any hex color (e.g., "#FFFFFF")
	});

	var c_type1_tram_green = L.AwesomeMarkers.icon({
		icon: "tram",
		prefix: "fas fa",
		markerColor: "green",
		iconColor: "#FFFFFF", //any hex color (e.g., "#FFFFFF")
	});

	var user_icon = L.AwesomeMarkers.icon({
		icon: "user",
		prefix: "fas fa",
		markerColor: "blue",
		iconColor: "#FFFFFF", //any hex color (e.g., "#FFFFFF")
	});

	var realTimeLayer = new L.layerGroup().addTo(map);

	var command = L.control({
		position: "topright",
	});
	command.onAdd = function (map) {
		var div = L.DomUtil.create("div", "command");
		div.innerHTML = '<div id="command"><p id="update_time" class="updaterTime"></p><div id="command" class="loader"></div></div>';
		return div;
	};

	command.addTo(map);

	//$.getJSON('https://percorsieorari.gtt.to.it/das_ws/das_ws.asmx/GetVeicoliPerLineaJson?linea=51', function(data) {
	$.getJSON("/cms/components/com_gtt/proxydas.php?serviceName=GetVeicoliPerLineaWsJson&linea=51", function (data) {
		$.each(data, function (mezzo) {
			mapUpdater(
				"" + data[mezzo].id,
				data[mezzo].lat,
				data[mezzo].lon,
				data[mezzo].tipo,
				data[mezzo].disabili,
				data[mezzo].direzione,
				data[mezzo].aggiornamento,
				data[mezzo].occupazione
			);
		});
		// getUserPosition(); // sui browser moderni funziona solo in contesto sicuro (https)
		updateInfoBox();
		window.setInterval(function () {
			//$.getJSON('https://percorsieorari.gtt.to.it/das_ws/das_ws.asmx/GetVeicoliPerLineaJson?linea=51', function(data) {
			jQuery.getJSON("/cms/components/com_gtt/proxydas.php?serviceName=GetVeicoliPerLineaWsJson&linea=51", function (data) {
				$.each(data, function (mezzo) {
					mapUpdater(
						"" + data[mezzo].id,
						data[mezzo].lat,
						data[mezzo].lon,
						data[mezzo].tipo,
						data[mezzo].disabili,
						data[mezzo].direzione,
						data[mezzo].aggiornamento,
						data[mezzo].occupazione
					);
				});
				updateInfoBox();
				// getUserPosition(); // sui browser moderni funziona solo in contesto sicuro (https)
			});
		}, 2000);
	});

	function getUserPosition() {
		if (navigator.geolocation) {
			console.log("entra");
			navigator.geolocation.getCurrentPosition(pinUserOnMap);
		} else {
			console.log("browser obsoleto");
		}
	}

	function pinUserOnMap(position) {
		console.log("chiama");
		mark = L.marker([position.coords.latitude, position.coords.longitude], {
			icon: user_icon,
		});
		mark.addTo(realTimeLayer);
	}

	function updateInfoBox() {
		var today = new Date();
		var time = ("0" + today.getHours()).slice(-2) + ":" + ("0" + today.getMinutes()).slice(-2) + ":" + ("0" + today.getSeconds()).slice(-2);
		$("#update_time").html("<i>" + time + "</i>");
	}

	var markersOnMap = new Array();

	function mapUpdater(id, lat, lon, tipo, disabili, direzione, aggiornamento, occupazione) {
		var mezzoIcon = L.icon({
			className: "mezzo" + id,
			iconAnchor: [9, 8],
			iconSize: [18, 18],
		});

		if (occupazione == 100) {
			mezzoIcon.options.iconUrl = "/leaflet/images/ico3/marker_bus_verde_occupato.png";
		} else {
			switch (tipo) {
				case "B":
					if (disabili) {
						mezzoIcon.options.iconUrl = "/leaflet/images/ico3/marker_bus_verde.png";
					} else {
						mezzoIcon.options.iconUrl = "/leaflet/images/ico3/marker_bus_giallo.png";
					}
					break;
				case "T":
					// console.log(tipo);
					if (disabili) {
						mezzoIcon.options.iconUrl = "/leaflet/images/ico3/marker_tram_verde.png";
					} else {
						mezzoIcon.options.iconUrl = "/leaflet/images/ico3/marker_tram_giallo.png";
					}
					break;
			}
		}

		if (id in markersOnMap) {
			$("#pUpdate-" + id).text(aggiornamento);
			markersOnMap[id].direction_marker.options.rotationAngle = direzione;
			//console.log(markersOnMap[id].options);
			markersOnMap[id].direction_marker.setLatLng([lat, lon]);
			markersOnMap[id].direction_marker.update();
			markersOnMap[id].mezzo_marker.setLatLng([lat, lon]);
			markersOnMap[id].mezzo_marker.setIcon(mezzoIcon);
			markersOnMap[id].mezzo_marker.update();
		} else {
			var popup_html = "Veicolo <b>" + id + "</b>";
			popup_html += "<br>";
			popup_html += "ultimo aggiornamento ricevuto " + '<p id="pUpdate-' + id + '">' + aggiornamento + "</p>";
			popup_html += "<br>";

			if (occupazione == 100) {
				popup_html +=
					'<p style="color:red"><b>Attenzione!</b> <img src="/leaflet/images/ico3/marker_bus_verde_occupato.png" class="" alt="" tabindex="0" style="border-radius: 50px; margin-bottom: 3px; margin-left: 5px; width: 18px; height: 18px; outline: none;"><br>Questo mezzo ha raggiunto la sua capacità massima.</p>';
			}

			if (disabili == true) {
				popup_html +=
					'<p style="color:rgb(3,67,131)"><b>Mezzo accessibile.</b> <img src="/leaflet/images/ico3/ico_disabil_g.png" class="" alt="" tabindex="0" style="border-radius: 50px; margin-bottom: 3px; margin-left: 5px; width: 18px; height: 18px; outline: none;"></p>';
			}

			popup_html += '<a data-id="' + id + '" href="#" class="link-segui-veicolo">Segui questo veicolo sulla mappa</a>';
			var directionIcon = L.icon({
				iconUrl: "/leaflet/images/ico3/marker_freccia.png",
				className: "direzione" + id,
				iconAnchor: [20, 24],
				iconSize: [40, 40],
			});

			direction = L.marker([lat, lon], {
				icon: directionIcon,
				rotationAngle: direzione,
			});

			mezzo = L.marker([lat, lon], {
				icon: mezzoIcon,
			}).bindPopup(popup_html);
			markersOnMap[id] = {
				direction_marker: direction,
				mezzo_marker: mezzo,
			};
			direction.addTo(realTimeLayer);
			mezzo.addTo(realTimeLayer);
		}
		var followId = $("#follow-number").text();
		if (followId != "") {
			var latLngs = [markersOnMap[followId].direction_marker.getLatLng()];
			var markerBounds = L.latLngBounds(latLngs);
			map.fitBounds(markerBounds);
		}
	}

	$("#map").on("click", ".link-segui-veicolo", function (e) {
		var id = $(this).attr("data-id");
		var followBox = L.control({
			position: "topright",
		});
		$(this).after("Stai seguendo questo veicolo");
		$(this).hide();
		followBox.onAdd = function (map) {
			var div = L.DomUtil.create("div", "follow-box");
			div.innerHTML = '<div id="follow-box" style="padding: 5px; background-color: black; color: chartreuse;">Stai seguendo il veicolo <p id="follow-number">' + id + "</p>";
			div.innerHTML += '<a href="#" id="link-stop-segui">Smetti di seguire</a></div>';
			return div;
		};
		followBox.addTo(map);
		return false;
	});

	$("#map").on("click", "#link-stop-segui", function () {
		console.log(map);
		$(".follow-box").remove();
		return false;
	});

	var popupcontent;
	var disservices_gtt = L.geoJson(null, {
		onEachFeature: function (feature, layer) {
			if (feature.properties && feature.properties.Linea) {
				popupcontent =
					"<pre>Il tratto evidenziato presenta un disservizio in corso \nche parte dalla fermata " +
					feature.properties.NomeInizio +
					" (palina: " +
					feature.properties.FermataInizio +
					") \nalla fermata " +
					feature.properties.NomeFine +
					" (palina: " +
					feature.properties.FermataFine +
					")</pre>";
				layer.bindPopup(popupcontent, {
					maxWidth: "auto",
				});
				layer.setStyle(DisservicesStyle());
			}
		},
	});

	map.addLayer(disservices_gtt);

	disservices_gtt.on("layeradd", function (e) {
		disservices_gtt.eachLayer(function (layer) {
			var popUp = layer._popup;
			layer.openPopup();
		});
	});

	function DisservicesStyle(feature) {
		return {
			weight: 40,
			opacity: 0.3,
			color: "yellow",
			stroke: "true",
		};
	}

	function updateDisserviesGeom(tolerance) {
		disservices_gtt.clearLayers();
		jQuery.getJSON(
			"/cms/components/com_gtt/proxydas.php?serviceName=GetDisserviziLineaGeoJson",
			{
				linea: "51",
			},
			function (data) {
				if (data == null || !data.features) {
					return;
				}
				if (data.features.length == 0) {
					return;
				}
				var modified = data;
				modified.features.forEach((feature) => {
					feature.geometry.coordinates.forEach((coordinate, index) => {
						feature.geometry.coordinates[index] = simplifyGeometry(coordinate, tolerance);
					});
				});
				disservices_gtt.addData(modified);
			}
		);
	}

	updateDisserviesGeom(0.0002);
});
