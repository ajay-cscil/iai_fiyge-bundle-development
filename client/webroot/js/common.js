/**
 * @author Tushar Takkar<ttakkar@primarymodules.com>
 */
var googleMapList = {};
var currentPositionMarkers = {};
function uuidv4() {
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
    var r = Math.random() * 16 | 0, v = c == 'x' ? r : (r & 0x3 | 0x8);
    return v.toString(16);
  });
}

function urlParam(url, param) {
    if (url.indexOf("?") != -1) {
        url = url.split('?')[1];
    }
    var params = url.split('&');
    for (var i = 0; i < params.length; i++) {
        if (params[i].indexOf(param + '=') != -1) {
            return params[i].replace(param + '=', '');
        }
    }
    return false;
}

function setChartProperties(options, k, v) {
    if (k.length > 0) {
        var key = k.shift();
        if (!$.isset(options[key])) {
            options[key] = (k.length > 0 ? {} : v);
        }
        setChartProperties(options[key], k, v);
    }
}
function getCategoryColumns(fields) {
    var categoryColumn = [];
    if (jQuery.isArray(fields)) {
        var length = fields.length;
        for (var i = 0; i < length; i++) {
            if (jQuery.isPlainObject(fields[i])) {
                jQuery.each(fields[i], function(k, v) {
                    if (jQuery.isPlainObject(v) && jQuery.isset(v['render_type']) && v['render_type'] == 'category') {
                        categoryColumn.push(k); //.split('.').slice(-2).join('.')
                    }
                }
                );

            }
        }

    }
    return categoryColumn;
}
var google_exportProperty = {};
function randomColors(total)
{
    var i = 360 / (total - 1); // distribute the colors evenly on the hue range
    var r = []; // hold the generated colors
    for (var x = 0; x < total; x++)
    {
        r.push(hsvToRgb(i * x, i * x, 100)); // you can also alternate the saturation and value for even more contrast between the colors
    }
    return r;
}
function hsvToRgb(h, s, v) {
    var r, g, b;

    var i = Math.floor(h * 6);
    var f = h * 6 - i;
    var p = v * (1 - s);
    var q = v * (1 - f * s);
    var t = v * (1 - (1 - f) * s);

    switch (i % 6) {
        case 0:
            r = v, g = t, b = p;
            break;
        case 1:
            r = q, g = v, b = p;
            break;
        case 2:
            r = p, g = v, b = t;
            break;
        case 3:
            r = p, g = q, b = v;
            break;
        case 4:
            r = t, g = p, b = v;
            break;
        case 5:
            r = v, g = p, b = q;
            break;
    }

    return [r * 255, g * 255, b * 255];
}
function randomHexColor() {
    var x, c = '#';
    var i = 3;
    while (i--) {
        x = (Math.random() * 256 | 0).toString(16).toUpperCase();
        c += (x.length < 2 ? '0' : '') + x;
    }
    return c;
}
function GetTrueCoords(evt, SVGRoot)
{
    // find the current zoom level and pan setting, and adjust the reported
    //    mouse position accordingly
    var newScale = SVGRoot.currentScale;
    var translation = SVGRoot.currentTranslate;
    coords = {};
    coords.x = (evt.clientX - translation.x) / newScale;
    coords.y = (evt.clientY - translation.y) / newScale;
    return coords;
}
function getAttributes(target) {
    var attributes = target.attributes;
    var attributesLength = attributes.length;
    var name = '';
    var value = '';
    var keys = [];
    var values = [];
    for (var k = 0; k < attributesLength; k++) {
        name = (attributes[k].name || attributes[k].nodeName);
        if (name.indexOf('property_') != -1) {
            if (name.indexOf('_value') != -1) {
                value = attributes[k].value || attributes[k].nodeValue;
                values.push(value);
            } else {
                value = attributes[k].value || attributes[k].nodeValue;
                keys.push(value);
            }
        }
    }
    var attributes = {};
    var keysLength = keys.length;
    for (var kl = 0; kl < keysLength; kl++) {
        attributes[keys[kl]] = values[kl];
    }
    return attributes;
}

/*
 *	@author	tushar takkar
 *	@todo
 *	@access public
 *	@param .
 *	@return
 *	@internal . This function is use to get list of all attributes of note as a javascript object.
 */
var attrs = function(target) {
    var attributes = {};
    var attrs = target.attributes;
    $.each(attrs, function(k, v) {
        if (v.nodeName.indexOf('on') == -1)
            attributes[v.nodeName] = v.nodeValue;

    });
    return attributes;
}

var uu = function() {
    var c = "89ab";
    var u = [];
    for (var i = 0; i < 36; i++) {
        u[i] = (Math.random() * 16 | 0).toString(16);
    }
    u[8] = u[13] = u[18] = u[23] = "-";
    u[14] = "4";
    u[19] = c.charAt((Math.random() * 4 | 0));
    return u.join("");
}
function log(message) {
    if (CONFIG.debug_js && typeof console != undefined) {
        console.log(message);
    }
}
$(document).ready(function() {
    $(document).on('click', '.map-marker', function(event) {
        var mapID = $(this).attr('map_id');
        var latitude = $(this).attr('latitude');
        var longitude = $(this).attr('longitude');
        if (typeof (googleMapList[mapID]) != 'undefined' && latitude != null && longitude != null) {
            googleMapList[mapID].panTo(new google.maps.LatLng(parseFloat(latitude), parseFloat(longitude)));
        }
        event.stopImmediatePropagation();
        event.stopPropagation();
        return false;
    });
});
function getColumnIndex(data) {
    var numberOfRows = data.getNumberOfRows();
    var numberOfColumns = data.getNumberOfColumns();
    var latitude = false;
    var longitude = false;
    var icon = false;
    var url = false;
    var info = false
    var geometricBoundary = false
    var boundaryProperties = false;
    var label = '';
    for (var rowIndex = 0; rowIndex < 1; rowIndex++) {
        for (var columnIndex = 1; columnIndex < numberOfColumns; columnIndex++) {
            label = data.getColumnLabel(columnIndex).toLowerCase();
            if (label.indexOf('latitude') != -1) {
                latitude = columnIndex;
            }
            if (label.indexOf('longitude') != -1) {
                longitude = columnIndex;
            }
            if (label.indexOf('icon') != -1) {
                icon = columnIndex;
            }
            if (label.indexOf('url') != -1) {
                url = columnIndex;
            }
            if (label.indexOf('infowindow') != -1) {
                info = columnIndex;
            }
            if (label.indexOf('geometric_boundary') != -1) {
                geometricBoundary = columnIndex;
            }
            if (label.indexOf('boundary_properties') != -1) {
                boundaryProperties = columnIndex;
            }
        }
    }
    return {
        'latitude': latitude,
        'longitude': longitude,
        'icon': icon,
        'url': url,
        'info': info,
        'geometricBoundary': geometricBoundary,
        'boundaryProperties': boundaryProperties,
        'numberOfRows': numberOfRows,
        'numberOfColumns': numberOfColumns
    }
}
function getMapMarkup(uuid, options, map, data, primaryKeys, infowindow, zoomToFitMarkers, showMarkerIndex, href) {
    var href = (typeof (href) != 'undefined' ? href : options['href'].split('?')[0].replace('/index', '/edit') + '/id:');
    var columnIndex = getColumnIndex(data);
    var latitude = columnIndex.latitude;
    var longitude = columnIndex.longitude;
    var icon = columnIndex.icon;
    var url = columnIndex.url;
    var info = columnIndex.info;
    var geometricBoundary = columnIndex.geometricBoundary;
    var boundaryProperties = columnIndex.boundaryProperties;
    var numberOfRows = columnIndex.numberOfRows;
    var numberOfColumns = columnIndex.numberOfColumns;
    var markers = '';
    if (zoomToFitMarkers === true) {
        var bounds = new google.maps.LatLngBounds();
    }
    if (latitude !== false && longitude !== false) {
        for (var rowIndex = 0; rowIndex < numberOfRows; rowIndex++) {
            var lat = data.getValue(rowIndex, latitude);
            var log = data.getValue(rowIndex, longitude);
            if (lat != "" && log != "" && (lat != 0 || log != 0)) {
                var mOptions = {
                    position: new google.maps.LatLng(lat, log),
                    map: map
                }
                if (zoomToFitMarkers === true) {
                    bounds.extend(mOptions["position"]);
                }
                mOptions["title"] = data.getValue(rowIndex, 0)
                if (showMarkerIndex) {
                    markers += '<li><a href="#" map_id="' + uuid + '" class="map-marker" latitude="' + lat + '"  longitude="' + log + '" >' + data.getValue(rowIndex, 0) + '</a></li>';
                }
                if (icon !== false) {
                    mOptions['icon'] = data.getValue(rowIndex, icon);
                }
                var marker = new google.maps.Marker(mOptions);
                if (info !== false) {
                    infoContent = data.getValue(rowIndex, info);
                } else {
                    infoContent = "<div>" + data.getValue(rowIndex, 0) + "</div>";
                }
                if (url !== false) {
                    clickURL = data.getValue(rowIndex, url);
                    if (clickURL != false) {
                        clickURL = CONFIG.base + clickURL;
                    }
                } else if (typeof (primaryKeys[rowIndex]) != 'undefined') {
                    clickURL = href + primaryKeys[rowIndex];
                }


                if ($.isset(options['is_mobile']) && options['is_mobile'] == 1) {
                    infoContent += 'For more details <a href="' + clickURL + '" data-ajax="false">click here</a>';
                } else {
                    infoContent += 'For more details <a href="' + clickURL + '" class="ajax-popup">click here</a>';
                }

                marker.set("info", infoContent);
                google.maps.event.addListener(marker, 'click', function() {
                    var info = this.get('info');
                    if (info != "") {
                        infowindow.setContent(info);
                        infowindow.open(this.getMap(), this);
                    }
                });
            }
            if (geometricBoundary !== false) {
                var boundary = data.getValue(rowIndex, geometricBoundary);
                var boundaryProp = null;
                if (boundary != "") {
                    try {
                        boundary = JSON.parse(boundary);
                        if ($.isArray(boundary)) {
                            var yyy = boundary.length;
                            for (var xxx = 0; xxx < yyy; xxx++) {
                                if (typeof (boundary[xxx][0]) != 'undefined' && typeof (boundary[xxx][1]) != 'undefined') {
                                    boundary[xxx] = new google.maps.LatLng(parseFloat(boundary[xxx][0]), parseFloat(boundary[xxx][1]));
                                }
                            }
                            if (boundaryProperties !== false) {
                                boundaryProp = data.getValue(rowIndex, boundaryProperties);
                                if (boundaryProp != false) {
                                    boundaryProp = JSON.parse(boundaryProp);
                                }
                            }
                            var prop = {
                                strokeColor: '#FF0000',
                                strokeOpacity: 0.8,
                                strokeWeight: 3,
                                fillColor: '#FAFAFA',
                                fillOpacity: 0.1
                            };
                            if ($.isPlainObject(boundaryProp)) {
                                prop = $.extend(prop, boundaryProp);
                            }
                            prop['paths'] = boundary;
                            var polygon = new google.maps.Polygon(prop);
                            polygon.setMap(map);
                        }
                    } catch (e) {
                        console.log(e.message + " for " + data.getValue(rowIndex, 0));
                    }
                }
            }

            if (zoomToFitMarkers === true) {
                map.fitBounds(bounds);
            }
        }
    }
    return markers;
}
function initChart(container) {
    var charts = $(container).find(".chart");
    var height = $(document).height();
    var minHeight = 0;
    charts.each(function() {
        minHeight = ((height / 100) * 70);
        minHeight = minHeight > 300 ? 300 : minHeight;
        $(this).parents(':first').css('min-height', minHeight + 'px');
    });
    if (charts.length > 0) {
        if (typeof (google) == 'undefined' || typeof (google['visualization']) == 'undefined' || typeof (google['visualization']['DataTable']) == 'undefined') {  // $.find('#jsapi').length ==0
            if (typeof $.showLoader != 'undefined') {
                $.showLoader(1);
            }
            charts.hide();
            var callAPI = false;
            if (typeof ($['charts_queue']) == 'undefined') {
                $['charts_queue'] = [];
                callAPI = true;
            }
            $['charts_queue'].push(container);
            if (callAPI) {
                $.ajax({
                    url: '//www.google.com/jsapi',
                    dataType: 'script',
                    cache: true,
                    success: function() {
                        google.load('visualization', '1', {
                            'packages': ['default', 'geochart', 'gauge', 'corechart', 'gantt'],
                            'callback': function() {
                                while ($['charts_queue'].length > 0) {
                                    var container = $['charts_queue'].shift();
                                    initChart(container);
                                }
                            }
                        });
                    }
                });
            }
            return;
        }
    } else {
        return;
    }
    


    charts.each(function() {
        //log("START RENDERING GRAPH");
        var chartObj = $(this);
        var defaults = {
            'is_mobile': false,
            'is3D': true,
            'visibleInLegend': true,
            'legend': {
                'position': 'in',
                'textStyle': {
                    'fontSize': 8
                }
            },
            'hAxis': {
                'slantedText': false
            },
            'chartArea': {
                width: "80%"
            }

        };
        //,
        //            'height':300
        // Set chart options
        var options = {};
        var list = [[], {}];
        if($(this).get(0).id){
            options['uuid']=$(this).get(0).id;
        }
        $.each(attrs($(this).get(0)), function(k, v) {
            list[0].push(k);
            list[1][k] = v;
        });
        var keys = list[0];
        $.each(keys.sort(), function(kk, k) {
            var v = list[1][k];
            var kl = k.replace('--', '.').split('-');
            if (kl.length > 1) {
                k = $.ccWords(kl.join(' '));
            } else {
                k = kl.join('');
            }
            if (k.indexOf('.') != -1) {
                setChartProperties(options, k.split('.'), v);
            } else {
                options[k] = v;
            }
        });
        var longitudeAttr = $(this).attr('longitude');
        if (longitudeAttr != null) {
            options['longitude'] = longitudeAttr;
        }

        options['track_current_position'] = $(this).attr('track_current_position');
        options['current_position_infowindow'] = $(this).attr('current_position_infowindow');


        if ($(this).is('[resolution]')) {
            options['resolution'] = $(this).attr('resolution');
        }
        if ($(this).is('[region]')) {
            options['region'] = $(this).attr('region');
        }

        var graphType = options['graph_type'];
        if (graphType == 'PieChart') {
            defaults['legend']['position'] = '';
        }
        options = $.extend(true, defaults, options);
        //log("RAW PROPERTIES:");
        //log(options);
        $.each(options, function(k, v) {
            if (typeof v == 'string' && (v.indexOf('[') != -1 || v.indexOf('{') != -1)) {
                try {

                    options[k] = JSON.parse(v);

                } catch (e) {
                    //log("POSSIBLE ERROR(In case invalid json):");
                    //log(e);
                    var xx = {}
                    xx[k] = v
                    //log(xx);

                }
            }
        });

        //log("PROCESSED PROPERTIES:");
        //log(options);


        if (typeof $.hideLoader != 'undefined')
            $.hideLoader(1);


        var mapUrl = '';
        if (graphType == 'GeoChart') {
            var query = options['query'];
            var mapSubtype = '';
            var pivotColumn = $(this).find('tr:eq(0)').find('th:eq(0)').attrs();
            if ($.isset(pivotColumn['column_name'])) {
                mapSubtype = pivotColumn['column_name'].split('.').pop();
            }
            query = parseJSON(decodeURIComponent(options['query']));
            if ($.isset(options['region']) && options['region'].indexOf('svg/') != -1) {
                mapUrl = jQuery.config['base'] + options['region'];
            } else {
                var string = JSON.stringify(query['where']);
                var result = string.match(/[\w\. ]*/gi);
                var length = result.length;
                var countryName = false;
                for (var ln = 0; ln < length; ln++) {
                    result[ln] = $.trim(result[ln]);
                    if (result[ln] != "") {
                        if (result[ln].indexOf('country_name') !== false) {
                            countryName = true;
                        }
                        if (countryName === true) {
                            countryName = result[ln];
                        }
                    }
                }
                if (typeof countryName == 'string') {
                    mapUrl = countryName + '_' + mapSubtype + '.svg';
                    mapUrl = mapUrl.replace(/ /g, '_');
                    mapUrl = mapUrl.toLowerCase();
                    mapUrl = jQuery.config['static_url'] + 'svg/' + mapUrl;
                }
            }
        }
        //console.log("Custom GEO graph URL:"+mapUrl);


        var title = options['title'];
        var expr = 'tr:gt(0)';
        var pointer = 0;
        var primaryKeys = [];
        do {
            var uuid = uu();
            if (graphType == 'PieChart') {
                pointer++;
            }
            // Create the data table.
            var data = new google.visualization.DataTable();
            var dataType = 'number';
            // set headers;
            var types = [];
            var columnName = '';
            var multiAxis = [];
            var isGoogleMap = (graphType == 'GoogleMap');
            if(graphType == 'GanttChart'){
                    var chartColumns=[];
                    var chartColumnRows=0;
                    chartColumns.push("id");
                    $(this)
                    .find('tr:eq(0)')
                    .find('th:eq(0),' + (pointer == 0 ? 'th:gt(' + pointer + ')' : 'th:eq(' + pointer + ')'))
                    .each(function(k, v) {
                        chartColumns.push($(this).text());
                    });
                    
                    var GanttChartColumns=[
                            ["string","Task ID", "id", false],
                            ["string", "Task Name", "name", false],
                            ["string", "Resource", "resource", false],
                            ["date", "Start", "start", false],
                            ["date", "End", "end", false],
                            ["number", "Duration", "duration", false],
                            ["number", "Progress", "progress", false],
                            ["string", "Dependencies", "dependencies", false]
                    ];
                    for(var i=0; i < GanttChartColumns.length; i++){
                        for(var j=0; j < chartColumns.length; j++){
                            if(chartColumns[j].toLowerCase().indexOf(GanttChartColumns[i][2]) !== -1 ){
                                GanttChartColumns[i][3]=j;
                                break;
                            }
                        }
                    }
                    jQuery.each(GanttChartColumns,function(k,GanttChartColumn){
                         data.addColumn(GanttChartColumn[0],GanttChartColumn[1]);
                    });
                          

                    $(this).find('tr:gt(0)').each(function() {
                        var row = [];
                        var i = 0;
                        var val = '';
                        row.push($(this).attr('primary_key'));
                        $(this).find('td:eq(0),' + (pointer == 0 ? 'td:gt(' + pointer + ')' : 'td:eq(' + pointer + ')')).each(function() {
                            val = $(this).text();
                            if (types[i] == 'number') {
                                val = parseFloat(val);
                            }
                            row.push(val);
                            i++;
                        });
                        var chartColumnRow=[];
                        jQuery.each(GanttChartColumns,function(k,GanttChartColumn){
                            if(GanttChartColumn[3] !== false){
                                if(GanttChartColumn[0] =="date"){
                                    var dateTime=row[GanttChartColumn[3]];
                                    if(dateTime!= ""){
                                        dateTime=dateTime.split(/[- :]/); 
                                        dateTime[1]--
                                        chartColumnRow.push(new Date(...dateTime));
                                    }else{
                                        chartColumnRow.push(null);
                                    }
                                }else if(GanttChartColumn[0] =="number"){
                                    chartColumnRow.push(parseInt(row[GanttChartColumn[3]]));
                                }else{
                                    chartColumnRow.push(row[GanttChartColumn[3]]);
                                }
                            }else{
                                chartColumnRow.push(null);
                            }
                        });
                        chartColumnRows++;
                        data.addRow(chartColumnRow);
                        primaryKeys.push($(this).attr('primary_key'));  
                    });
                    graphType = 'Gantt';
                    options['height']= (50* chartColumnRows) + 1000;
                    options['gantt']={
                                        criticalPathEnabled: true,
                                        criticalPathStyle: {
                                            stroke: '#e64a19',
                                            strokeWidth: 5
                                        }
                                    };
            }else{
                $(this)
                    .find('tr:eq(0)')
                    .find('th:eq(0),' + (pointer == 0 ? 'th:gt(' + pointer + ')' : 'th:eq(' + pointer + ')'))
                    .each(function(k, v) {
                        dataType = 'number';
                        if (isGoogleMap) {
                            dataType = 'string';
                        }
                        switch ($(this).attr('data_type')) {
                            case 'VAR_STRING':
                                dataType = 'string';
                        }
                        columnName = $(this).text();
                        if (graphType == 'BarChart') {
                            if (!$.isset(options['vAxis'])) {
                                options['vAxis'] = {};
                            }
                            if (!$.isset(options['vAxis']['title']) || $.isEmpty(options['vAxis']['title'])) {
                                options['vAxis']['title'] = columnName;
                            }
                        } else {
                            if (!$.isset(options['hAxis'])) {
                                options['hAxis'] = {};
                            }
                            if (!$.isset(options['hAxis']['title']) || $.isEmpty(options['hAxis']['title'])) {
                                options['hAxis']['title'] = columnName;
                            }
                        }
                        if (k > 0) {
                            multiAxis.push({
                                'title': columnName
                            });
                        }
                        types.push(dataType);
                        data.addColumn(dataType, columnName);
                    });

                    $(this).find('tr:gt(0)').each(function() {
                        var row = [];
                        var i = 0;
                        var val = '';
                        $(this).find('td:eq(0),' + (pointer == 0 ? 'td:gt(' + pointer + ')' : 'td:eq(' + pointer + ')')).each(function() {
                            if (isGoogleMap) {
                                val = $(this).html();
                            } else {
                                val = $(this).text();
                                if (types[i] == 'number') {
                                    val = parseFloat(val);
                                }
                            }

                            row.push(val);
                            i++;
                        });
                        data.addRow(row);
                        primaryKeys.push($(this).attr('primary_key'));
                    });



            }
            if (graphType == 'BarChart') {
                if (!$.isset(options['hAxis']) || $.isEmpty(options['hAxis'])) {
                    //options['hAxis']=multiAxis;
                }
            } else {
                if (!$.isset(options['vAxis']) || $.isEmpty(options['vAxis'])) {
                    //options['vAxis']=multiAxis;
                }
            }

            if ($.isset(options['is_mobile']) && options['is_mobile'] == 1 && !$.isset(options['title']) || options['title'] == '') {
                if ($.isset(options['header_title'])) {
                    options['title'] = options['header_title'];
                }
            }
            if (graphType == 'PieChart') {
                var tit = [];
                if ($.isset(title)) {
                    tit.push(title);
                }
                if ($.isset(columnName)) {
                    tit.push(columnName);
                }
                options['title'] = tit.join('/ ');
            } else {
                if (!$.isset(options['title'])) {
                    options['title'] = '';
                }
                if ($.isset(options['subtitle'])) {
                    if (!$.isEmpty(options['title'])) {
                        options['title'] += ' (' + options['subtitle'] + ')';
                    } else {
                        options['title'] += options['subtitle'];
                    }
                }
            }

            var colorAxis = '';
            if ($.isset(options['colorAxis']) && $.isset(options['colorAxis']['values'])) {
                colorAxis = options['colorAxis']['values'];
            }
            var ranges = [];
            for (var i = 10; i > 0; i--) {
                if ($.isset(options['range_' + i]) && $.isset(options['range_' + i + '_color'])) {
                    ranges.push([parseFloat(options['range_' + i]), options['range_' + i + '_color']]);
                }
            }
            if (ranges.length > 0) {
                ranges = ranges.sort(function(a, b) {
                    return b[0] - a[0];
                });
            }

            
            $(this).parents(':first').find('.graph-panel-container').remove();


            var chart = false;
            var drilldown = function(evt, showLastStage) {
                if (options['render_as'] == 'categorized') {
                    var query = options['query'];
                    if (typeof (showLastStage) == 'undefined') {
                        showLastStage = false;
                    }
                    var showLastStage = showLastStage || false;
                    query = parseJSON(decodeURIComponent(options['query']));
                    query['active_level'] = parseInt(options['active_level']);
                    //console.log(query);

                    var categoryColumns = getCategoryColumns(query['fields']);
                    var where = {};
                    if (showLastStage === true) {
                        query['active_level'] = categoryColumns.length;
                    } else {
                        if (jQuery.isset(categoryColumns[query['active_level']])) {
                            if (chart !== false) {
                                where[categoryColumns[query['active_level']]] = data.getValue(chart.getSelection()[0].row, 0);
                                chart.setSelection([0]);
                            } else {
                                where[categoryColumns[query['active_level']]] = evt.target.getAttribute('id');
                            }
                        }
                        query['active_level']++;
                    }
                    if (!jQuery.isset(categoryColumns[query['active_level']])) {
                        query['ui_helper'] = '';
                    }
                    if (typeof query['where'] == 'undefined') {
                        query['where'] = {};
                    }
                    if ($.isArray(query['where'])) {
                        query['where'].push(where);
                    } else {
                        query['where'] = $.extend(query['where'], where);
                    }
                    if (!jQuery.isset(query['where'])) {
                        query['where'] = {};
                    }
                    var href = options['href'];
                    href = href.replace('page=', 'old_page=');
                    href = href.split('q:')[0];
                    href = href.split('q=')[0];
                    href = href.replace('search_basic', 'sb').replace('search_advance', 'sa').replace('[search]', 'il');
                    href += href.indexOf('?') != -1 ? '' : '?';
                    href += "&drilldown=1";
                    $.get(href, {
                        "q": encodeURIComponent(JSON.stringify(query))
                    }, function(data) {
                        var params = {};
                        data = $(data);
                        if (data.is('[header_title]')) {
                            params['title'] = data.attr('header_title');
                        }
                        var width = $('body').width();
                        var popup_width = CONFIG.popup_width_percent || 80;
                        width = (width / 100) * popup_width;
                        params["width"] = width + "px";
                        var uuid = $.jsContainer(data, params);
                        initChart($('#' + uuid));
                    });
                } else {
                    var query = options['query'];
                    query = parseJSON(decodeURIComponent(options['query']));
                    var childListview = query['child_listview'] | false;
                    if (!jQuery.isEmpty(childListview)) {
                        var where = {};
                        if (jQuery.isset(query['group']) && jQuery.isArray(query['group']) && jQuery.isset(query['group'][0])) {
                            if (chart !== false) {
                                where[query['group'][0]] = data.getValue(chart.getSelection()[0].row, 0);
                                chart.setSelection([0]);
                            } else {
                                where[query['group'][0]] = evt.target.getAttribute('id');
                            }
                        }
                        var query = {};
                        query['where'] = where;
                        var href = options['href'];
                        href = href.replace('page=', 'old_page=');
                        href = href.split('q:')[0];
                        href = href.split('q=')[0];
                        href = href.replace('current_listview', 'cl').replace('search_basic', 'sb').replace('search_advance', 'sa').replace('[search]', 'il');
                        href += href.indexOf('?') != -1 ? '' : '?';
                        href += '&current_listview=' + childListview;
                        href += "&drilldown=1";
                        $.get(href, {
                            "q": encodeURIComponent(JSON.stringify(query))
                        }, function(data) {
                            data = $(data);
                            var params = {};
                            if (data.is('[header_title]')) {
                                params['title'] = data.attr('header_title');
                            }
                            var width = $('body').width();
                            var popup_width = CONFIG.popup_width_percent || 80;
                            width = (width / 100) * popup_width;
                            params["width"] = width + "px";
                            var uuid = $.jsContainer(data, params);
                            initChart($('#' + uuid));
                        });
                    }
                }
                return false;
            }
            var drilldownGantt = function(evt){
                var recordURL=options['url'].replace('/index','/edit?id='+data.getValue(chart.getSelection()[0].row, 0));
                jQuery.ajaxPopup($("<div>"),recordURL,jQuery('#'+options['uuid']));
                return false;
            }
            var zoomToFitMarkers = false;
            if (typeof (options['auto_zoom_to_fit_markers']) != 'undefined' && parseInt(options['auto_zoom_to_fit_markers']) == 1) {
                zoomToFitMarkers = true;
            }
            var showMarkerIndex = false;
            if (typeof (options['show_marker_index']) != 'undefined' && parseInt(options['show_marker_index']) == 1 && options['is_mobile'] == false) {
                showMarkerIndex = true;
            }
            var markerIndexID = uu();
            if (graphType == 'GoogleMap' && showMarkerIndex == true) {
                $(this).hide().before('<div  class="graph-panel-container" style="margin:5px;">\n\
    <table style="margin:0px;padding:0px;width:100%;"><tr style="margin:0px;padding:0px;">\n\
<td  class="no-mp" style="margin:0px;padding:0px;">\n\
<div id="' + uuid + '" class="graph-panel graph-' + graphType + '" ></div>\n\
</td>\n\
<td id="' + markerIndexID + '" style="margin:0px;padding:0px;width:200px;overflow:hide;"></td>\n\
</tr>\n\
</table>\n\
</div>').parents(':first').css('padding', 0);
            } else {
                $(this).hide().before('<div  class="graph-panel-container" style="margin:0px;' + (options['is_mobile'] == true ? 'min-height:300px;' : '') + '">\n\
    <div id="' + uuid + '" class="graph-panel graph-' + graphType + '" style="margin: 0px;padding: 0px; ' + (options['is_mobile'] == true ? 'min-height:300px;' : '') + '"></div>\n\
</div>').parents(':first').css('padding', 0);
            }
            if (graphType == 'GoogleMap') {
                var columnIndex = getColumnIndex(data);
                var latitude = columnIndex.latitude;
                var longitude = columnIndex.longitude;
                var icon = columnIndex.icon;
                var url = columnIndex.url;
                var info = columnIndex.info;
                var geometricBoundary = columnIndex.geometricBoundary;
                var boundaryProperties = columnIndex.boundaryProperties;
                var numberOfRows = columnIndex.numberOfRows;
                var numberOfColumns = columnIndex.numberOfColumns;
                var latLang = new google.maps.LatLng(-34.397, 150.644);

                if (typeof (options['latitude']) != 'undefined' && typeof (options['longitude']) != 'undefined') {
                    var latLang = new google.maps.LatLng(parseFloat(options['latitude']), parseFloat(options['longitude']));
                } else if (latitude !== false && longitude !== false) {
                    for (var rowIndex = 0; rowIndex < numberOfRows; rowIndex++) {
                        var lat = data.getValue(rowIndex, latitude);
                        var log = data.getValue(rowIndex, longitude);
                        if (lat != "" && log != "" && (lat != 0 || log != 0)) {
                            latLang = new google.maps.LatLng(lat, log);
                            break;
                        }
                    }
                }
                if (typeof (options['center']) == 'undefined') {
                    options['center'] = latLang;
                }
                if (typeof (options['zoom']) != 'undefined') {
                    options['zoom'] = parseInt(options['zoom']);
                } else {
                    options['zoom'] = 18;
                }
                options['mapTypeControlOptions'] = {
                    'style': google.maps.MapTypeControlStyle.DROPDOWN_MENU
                };
                if (typeof (options['panControl']) == 'undefined') {
                    options['panControl'] = true;
                }
                if (typeof (options['zoomControl']) == 'undefined') {
                    options['zoomControl'] = true;
                }
                if (typeof (options['mapTypeControl']) == 'undefined') {
                    options['mapTypeControl'] = true;
                }
                if (typeof (options['scaleControl']) == 'undefined') {
                    options['scaleControl'] = true;
                }
                if (typeof (options['streetViewControl']) == 'undefined') {
                    options['streetViewControl'] = true;
                }
                if (typeof (options['overviewMapControl']) == 'undefined') {
                    options['overviewMapControl'] = true;
                }
                var showCurrentPosition = false;
                if (typeof (options['track_current_position']) != 'undefined' && parseInt(options['track_current_position']) == 1 && navigator.geolocation) {
                    showCurrentPosition = true;
                }
                var markers = '';
                var map = new google.maps.Map($('#' + uuid).get(0), options);
                googleMapList[uuid] = map;
                var infowindow = new google.maps.InfoWindow();
                var infoContent = "";
                var clickURL = "";

                if (showCurrentPosition) {
                    currentPositionMarkers[uuid] = {
                        'options': options,
                        'marker': false
                    };
                    navigator.geolocation.watchPosition(function(position) {
                        var latLng = new google.maps.LatLng(position.coords.latitude, position.coords.longitude);
                        $.each(currentPositionMarkers, function(k, v) {
                            if (v.marker === false) {
                                currentPositionMarkers[k]['marker'] = new google.maps.Marker({
                                    position: latLng,
                                    map: googleMapList[k]
                                });
                                if (typeof (v.options['current_position_infowindow'])) {
                                    currentPositionMarkers[k]['marker'].set('info', v.options['current_position_infowindow']);
                                }
                                google.maps.event.addListener(currentPositionMarkers[k]['marker'], 'click', function() {
                                    var currentMarker = this;
                                    var geocoder = new google.maps.Geocoder();
                                    geocoder.geocode({
                                        'latLng': this.getPosition()
                                    }, function(results, status) {
                                        if (status == google.maps.GeocoderStatus.OK) {
                                            if (results[1]) {
                                                var info = currentMarker.get('info');
                                                if (typeof (info) == 'undefined' || info == "") {
                                                    info = " Your current position is \n\
                                                    <div>Address line : __ADDRESS_LINE__</div>\n\
                                                    <div>City : __CITY__</div>\n\
                                                    <div>State : __STATE__</div>\n\
                                                    <div>Country : __COUNTRY__</div>\n\
                                                    ";
                                                }
                                                var ac = results[1].address_components;
                                                $.getJSON(CONFIG.base + 'masters/countries/index.json', {
                                                    q: JSON.stringify({
                                                        'method': 'find',
                                                        'fields': ['country_name', 'id'],
                                                        'where': {
                                                            'countries.iso2': ac[3]['short_name']
                                                        }
                                                    })
                                                }, function(response) {
                                                    var countryID = country = '';
                                                    if (typeof (response['paginate']) != 'undefined' && typeof (response['paginate']['data']) != 'undefined' && typeof (response['paginate']['data'][0]) != 'undefined') {
                                                        countryID = response['paginate']['data'][0]['id'];
                                                        country = response['paginate']['data'][0]['country_name'];
                                                    }
                                                    info = info.replace(/__ADDRESS_LINE__/gi, ac[0]['long_name'])
                                                            .replace(/__CITY__/gi, ac[1]['long_name'])
                                                            .replace(/__STATE__/gi, ac[2]['short_name'])
                                                            .replace(/__COUNTRY_ID__/gi, countryID)
                                                            .replace(/__COUNTRY__/gi, country)
                                                            .replace(/__LATITUDE__/gi, currentMarker.get('latitude'))
                                                            .replace(/__LONGITUDE__/gi, currentMarker.get('longitude'))
                                                            .replace(/__LOCATION_TYPE__/gi, results[1].geometry.location_type)
                                                            .replace(/__GEOCODE_TYPE__/gi, results[1].types.join(', '))
                                                            .replace(/__GEOCODE_STATUS__/gi, google.maps.GeocoderStatus.OK)
                                                            .replace(/__BASE_URL__/gi, CONFIG.base);
                                                    var html = $('<div>' + info + '</div>');
                                                    if ($.isset(options['is_mobile']) && options['is_mobile'] == 1) {
                                                        html.find('a').attr('data-ajax', "false");
                                                    } else {
                                                        html.find('a').addClass('ajax-popup');
                                                    }
                                                    info = html.html();
                                                    infowindow.setContent(info);
                                                    infowindow.open(currentMarker.getMap(), currentMarker);
                                                });
                                            } else {
                                                alert('No results found');
                                            }
                                        } else {
                                            alert('Geocoder failed due to: ' + status);
                                        }
                                    });
                                });
                            } else {
                                v.marker.setPosition(latLang);
                            }
                            currentPositionMarkers[k]['marker'].set('latitude', position.coords.latitude);
                            currentPositionMarkers[k]['marker'].set('longitude', position.coords.longitude);
                            googleMapList[k].panTo(latLng);
                        });
                    });
                }
                markers = getMapMarkup(uuid, options, map, data, primaryKeys, infowindow, zoomToFitMarkers, showMarkerIndex);
                if (showMarkerIndex) {
                    $('#' + markerIndexID).html('<ol style="max-height:200px;overflow:auto;padding: 0px; margin: 0px;padding-left: 30px;">' + markers + '</ol>');
                }
                //options['data_source']='53a7ee53-0d9c-401a-948b-0a52ac1007cc';
                $.each(options, function(k, v) {
                    if (k.indexOf('data_source') != -1 && k.indexOf('__data_source') == -1 && v != 'listviews') {
                        $.getJSON(CONFIG.base + 'core/listviews/view.json', {
                            'id': v
                        }, function(response) {
                            if (typeof (response['data']) != 'undefined' && typeof (response['data']['listviews']) != 'undefiend') {
                                var controller = response['data']['listviews']['controller'];
                                var id = response['data']['listviews']['id'];
                                $.getJSON(CONFIG.base + controller + '/index.json', {
                                    'current_listview': id
                                }, function(response) {
                                    if (typeof (response['paginate']) != 'undefined' && typeof (response['paginate']['data']) != 'undefined' && typeof (response['paginate']['data'][0]) != 'undefined') {
                                        var records = response['paginate']['data'];
                                        var data = new google.visualization.DataTable();
                                        var columns = [];
                                        var idColumn = false;
                                        var rowLength = records.length;
                                        $.each(records[0], function(k, v) {
                                            columns.push(k);
                                            data.addColumn('string', k);
                                            if (k.indexOf('.id') != -1) {
                                                idColumn = k;
                                            }
                                        });
                                        var columnLength = columns.length;
                                        var primaryKeys = [];
                                        for (var yyy = 0; yyy < rowLength; yyy++) {
                                            var row = [];
                                            for (var xxx = 0; xxx < columnLength; xxx++) {
                                                row.push(records[yyy][columns[xxx]]);

                                            }
                                            if (idColumn !== false) {
                                                primaryKeys.push(records[yyy][idColumn]);
                                            }
                                            data.addRow(row);
                                        }
                                        markers = getMapMarkup(uuid, options, map, data, primaryKeys, infowindow, false, showMarkerIndex, CONFIG.base + response['paginate']['controller'] + '/view/id:');
                                        if (showMarkerIndex) {
                                            $('#' + markerIndexID).find('ol:first').append(markers);
                                        }
                                    }
                                });


                            }
                        });
                    }
                });


                setTimeout(function() {
                    $('#' + markerIndexID).find('ol').css('max-height', $('#' + markerIndexID).height() + 'px');
                }, 500);
                if (options['is_mobile'] == true) {
                    setTimeout(function() {
                        $('#' + uuid).removeAttr('style');
                    }, 500);
                }
            } else if (mapUrl != false) {
                //log("Custom GEO graph URL:"+mapUrl);
                $('#' + uuid).append('<iframe width="' + $('#' + uuid).width() + '" height="400px;" id="' + uuid + '-map" src="' + mapUrl + '" style="visibility: visible; overflow: hidden;"  scrolling="no" frameborder="0" marginheight="0" marginwidth="0" ></iframe>')
                document.getElementById(uuid + "-map").onload = function() {
                    //log("CUSTOM CALL START");
                    //log("DATA:");
                    //log(data);
                    //log("OPTIONS:");
                    //log(options);

                    var numberOfRows = data.getNumberOfRows();
                    var numberOfColumns = data.getNumberOfColumns();
                    // var rowColors=randomColors(numberOfRows);
                    var map_state;
                    var iframe = document.getElementById(uuid + "-map");
                    var innerDoc = iframe.contentDocument || iframe.contentWindow.document;
                    if (innerDoc.getElementsByTagName('svg').length > 0) {
                        var colorMap = {};
                        for (var rowIndex = 0; rowIndex < numberOfRows; rowIndex++) {
                            map_state = innerDoc.getElementById(data.getValue(rowIndex, 0));
                            if (map_state && typeof map_state.style.fill != null) {
                                for (var columnIndex = 1; columnIndex < numberOfColumns; columnIndex++) {
                                    map_state.setAttributeNS(null, 'property_' + columnIndex, data.getColumnLabel(columnIndex));
                                    map_state.setAttributeNS(null, 'property_' + columnIndex + '_value', data.getValue(rowIndex, columnIndex));
                                }
                                if ($.isset(colorAxis) && colorAxis == 'percentile') {
                                    var rate = data.getValue(rowIndex, 1);
                                    var color = '';
                                    var length = ranges.length;
                                    for (var kk = 0; kk < length; kk++) {
                                        if (rate > ranges[kk][0]) {
                                            color = ranges[kk][1];
                                            break;
                                        }
                                    }
                                } else if ($.isset(colorAxis) && colorAxis == 'identical') {
                                    var rate = data.getValue(rowIndex, 1);
                                    if (!$.isset(colorMap[rate])) {
                                        colorMap[rate] = randomHexColor();
                                    }
                                    var color = colorMap[rate];
                                } else {
                                    var color = randomHexColor();

                                }
                                map_state.setAttribute("style", map_state.getAttribute('style') + ";fill:" + color);
                                //map_state.style.fill = color;
                                var SVGRoot = innerDoc.getElementsByTagName('svg')[0];
                                var toolTip = document.createElementNS("http://www.w3.org/2000/svg", "g");
                                toolTip.setAttributeNS(null, "id", 'tooltip');
                                toolTip.setAttributeNS(null, "opacity", '0.8');
                                toolTip.setAttributeNS(null, "visibility", 'hidden');
                                toolTip.setAttributeNS(null, "pointer-events", 'none');
                                SVGRoot.appendChild(toolTip);


                                var tipBox = document.createElementNS("http://www.w3.org/2000/svg", "rect");
                                tipBox.setAttributeNS(null, "id", 'tipbox');
                                tipBox.setAttributeNS(null, "x", '0');
                                tipBox.setAttributeNS(null, "y", '5');
                                tipBox.setAttributeNS(null, "width", '88');
                                tipBox.setAttributeNS(null, "height", '20');
                                tipBox.setAttributeNS(null, "rx", '2');
                                tipBox.setAttributeNS(null, "ry", '2');
                                tipBox.setAttributeNS(null, "fill", 'white');
                                tipBox.setAttributeNS(null, "stroke", 'black');
                                toolTip.appendChild(tipBox);

                                var tipText = document.createElementNS("http://www.w3.org/2000/svg", "text");
                                tipText.setAttributeNS(null, "id", 'tiptext');
                                tipText.setAttributeNS(null, "x", '5');
                                tipText.setAttributeNS(null, "y", '20');
                                tipText.setAttributeNS(null, "font-family", 'Arial');
                                tipText.setAttributeNS(null, "font-size", '12');
                                toolTip.appendChild(tipText);


                                map_state.onmousemove = function(evt) {
                                    //evt.target.setAttributeNS(null, "stroke-width", '3');
                                    var mouseovertext = [];
                                    var attributes = getAttributes(evt.target);

                                    var TrueCoords = GetTrueCoords(evt, SVGRoot);
                                    if ($.isset(TrueCoords) && $.isset(TrueCoords.x)) {
                                        var tipScale = 1 / SVGRoot.currentScale;
                                        var textWidth = 0;
                                        var tspanWidth = 0;
                                        var boxHeight = 20;
                                        var toolTip = innerDoc.getElementById('tooltip');
                                        var tipBox = innerDoc.getElementById('tipbox');
                                        var tipText = innerDoc.getElementById('tiptext');


                                        tipBox.setAttributeNS(null, 'transform', 'scale(' + tipScale + ',' + tipScale + ')');
                                        tipText.setAttributeNS(null, 'transform', 'scale(' + tipScale + ',' + tipScale + ')');
                                        var xPos = TrueCoords.x + (10 * tipScale);
                                        var yPos = TrueCoords.y + (10 * tipScale);

                                        var tipTitle = document.createElementNS("http://www.w3.org/2000/svg", "tspan");
                                        tipTitle.setAttributeNS(null, "id", 'tipTitle');
                                        tipTitle.setAttributeNS(null, "x", '5');
                                        tipTitle.setAttributeNS(null, "font-weight", 'bold');
                                        tipTitle.setAttributeNS(null, 'visibility', 'visible');
                                        tipText.appendChild(tipTitle);
                                        tipText.textContent = evt.target.getAttribute('id');


                                        $.each(attributes, function(k, v) {
                                            var tipDesc = document.createElementNS("http://www.w3.org/2000/svg", "tspan");
                                            tipDesc.setAttributeNS(null, "class", 'tipDesc');
                                            tipDesc.setAttributeNS(null, "x", '5');
                                            tipDesc.setAttributeNS(null, "dy", '15');
                                            //tipDesc.setAttributeNS(null, "fill", 'blue');
                                            tipDesc.setAttributeNS(null, 'visibility', 'visible');
                                            tipText.appendChild(tipDesc);
                                            tipDesc.textContent = k + " : " + v;
                                        });




                                        var outline = tipText.getBBox();
                                        tipBox.setAttributeNS(null, 'width', Number(outline.width) + 10);
                                        tipBox.setAttributeNS(null, 'height', Number(outline.height) + 10);
                                        // update position
                                        if (SVGRoot.getAttributeNS(null, 'width') < (xPos + Number(outline.width) + 10)) {
                                            xPos -= Number(outline.width) + 10;
                                        }
                                        if (SVGRoot.getAttributeNS(null, 'height') < (yPos + Number(outline.height) + 10)) {
                                            yPos -= Number(outline.height) + 10;
                                        }

                                        toolTip.setAttributeNS(null, 'transform', 'translate(' + xPos + ',' + yPos + ')');
                                        toolTip.setAttributeNS(null, 'visibility', 'visible');

                                    }
                                }
                                map_state.onmouseout = function(evt) {
                                    innerDoc.getElementById('tooltip').setAttributeNS(null, 'visibility', 'hidden');
                                    var tspan = innerDoc.getElementsByTagName('tspan');
                                    var length = tspan.length;
                                    for (var i = 0; i < length; i++) {
                                        tspan[i].setAttributeNS(null, 'visibility', 'hidden');
                                    }
                                }
                                map_state.onclick = drilldown;


                            }
                        }
                    } else {
                        $('#' + uuid).remove();
                        //chartObj.show();
                        var html = chartObj.find('tbody').html();
                        var tr = chartObj.closest('.chart-container').parents(':first');
                        if (tr.is('tr')) {
                            if (options['render_as'] == 'categorized') {
                                var jscontainer = chartObj.closest('.js-container');
                                if (jscontainer.length > 0) {
                                    //     $('#'+jscontainer.attr('id')).dialog("destroy").remove();
                                    $('#' + jscontainer.attr('id')).find('.chart-container').append('<span valign="top">Server does not have geo map for area with url "' + mapUrl + '". Contact your system admin to install map for specified area.</span>');
                                }
                                drilldown({}, true);
                            } else {
                                var ptable = tr.closest('table').addClass('listview  ui-listview');
                                tr.replaceWith(html);
                                ptable.find('th').css({
                                    'height': '30px',
                                    'padding': '5px',
                                    'text-align': 'left'
                                });
                            }
                        } else {
                            chartObj.show();
                            chartObj.css({
                                'margin': '10px'
                            });
                            if (options['render_as'] == 'categorized') {
                                drilldown({}, true);
                            }
                        }



                        //innerDoc.getElementsByTagName('body')[0].innerHTML='<p style="text-align:center;margin:0px;">Count not find requested graph</p>';
                    }
                    //var dialog=$('#'+uuid).closest('.ui-dialog-content').attr('id');
                    //if(dialog!=''){
                    //    $("#"+dialog).dialog( "option", "position", "center" );
                    //}
                    //log("CUSTOM CALL END");
                    if (typeof (hideLoader) != 'undefined') {
                        hideLoader();
                    }
                }
                chart = false;
            } else {
                //log("GOOGLE CALL START");
                //log("DATA:");
                //log(data);
                //log("OPTIONS:");
                //log(options);
                chart = false;
                // Instantiate and draw our chart, passing in some options.
                if (typeof (google.visualization[graphType]) != 'undefined') {

                    chart = new google.visualization[graphType](document.getElementById(uuid));
                    chart.draw(data, options);
                }

                //log("GOOGLE CALL END");
                var dialog = $('#' + uuid).closest('.ui-dialog-content').attr('id');
                if (dialog != '') {
                    $("#" + dialog).dialog("option", "position", "center");
                }
            }
            if(graphType == 'Gantt'){
                google.visualization.events.addListener(chart, 'select',drilldownGantt);
            }else if (
                    chart !== false &&
                    (
                            (jQuery.isset(options['render_as']) && options['render_as'] == 'categorized')
                            ||
                            (jQuery.isset(options['child_listview']) && !jQuery.isEmpty(options['child_listview']))
                    )
            ) {
                google.visualization.events.addListener(chart, 'select', drilldown);
            }

        } while (graphType == 'PieChart' && $(this).find('tr:eq(0)>th:eq(' + (pointer + 1) + ')').length > 0);
    });
}


(function($) {

    var rotateLeft = function(lValue, iShiftBits) {
        return (lValue << iShiftBits) | (lValue >>> (32 - iShiftBits));
    }

    var addUnsigned = function(lX, lY) {
        var lX4, lY4, lX8, lY8, lResult;
        lX8 = (lX & 0x80000000);
        lY8 = (lY & 0x80000000);
        lX4 = (lX & 0x40000000);
        lY4 = (lY & 0x40000000);
        lResult = (lX & 0x3FFFFFFF) + (lY & 0x3FFFFFFF);
        if (lX4 & lY4)
            return (lResult ^ 0x80000000 ^ lX8 ^ lY8);
        if (lX4 | lY4) {
            if (lResult & 0x40000000)
                return (lResult ^ 0xC0000000 ^ lX8 ^ lY8);
            else
                return (lResult ^ 0x40000000 ^ lX8 ^ lY8);
        } else {
            return (lResult ^ lX8 ^ lY8);
        }
    }

    var F = function(x, y, z) {
        return (x & y) | ((~x) & z);
    }

    var G = function(x, y, z) {
        return (x & z) | (y & (~z));
    }

    var H = function(x, y, z) {
        return (x ^ y ^ z);
    }

    var I = function(x, y, z) {
        return (y ^ (x | (~z)));
    }

    var FF = function(a, b, c, d, x, s, ac) {
        a = addUnsigned(a, addUnsigned(addUnsigned(F(b, c, d), x), ac));
        return addUnsigned(rotateLeft(a, s), b);
    };

    var GG = function(a, b, c, d, x, s, ac) {
        a = addUnsigned(a, addUnsigned(addUnsigned(G(b, c, d), x), ac));
        return addUnsigned(rotateLeft(a, s), b);
    };

    var HH = function(a, b, c, d, x, s, ac) {
        a = addUnsigned(a, addUnsigned(addUnsigned(H(b, c, d), x), ac));
        return addUnsigned(rotateLeft(a, s), b);
    };

    var II = function(a, b, c, d, x, s, ac) {
        a = addUnsigned(a, addUnsigned(addUnsigned(I(b, c, d), x), ac));
        return addUnsigned(rotateLeft(a, s), b);
    };

    var convertToWordArray = function(string) {
        var lWordCount;
        var lMessageLength = string.length;
        var lNumberOfWordsTempOne = lMessageLength + 8;
        var lNumberOfWordsTempTwo = (lNumberOfWordsTempOne - (lNumberOfWordsTempOne % 64)) / 64;
        var lNumberOfWords = (lNumberOfWordsTempTwo + 1) * 16;
        var lWordArray = Array(lNumberOfWords - 1);
        var lBytePosition = 0;
        var lByteCount = 0;
        while (lByteCount < lMessageLength) {
            lWordCount = (lByteCount - (lByteCount % 4)) / 4;
            lBytePosition = (lByteCount % 4) * 8;
            lWordArray[lWordCount] = (lWordArray[lWordCount] | (string.charCodeAt(lByteCount) << lBytePosition));
            lByteCount++;
        }
        lWordCount = (lByteCount - (lByteCount % 4)) / 4;
        lBytePosition = (lByteCount % 4) * 8;
        lWordArray[lWordCount] = lWordArray[lWordCount] | (0x80 << lBytePosition);
        lWordArray[lNumberOfWords - 2] = lMessageLength << 3;
        lWordArray[lNumberOfWords - 1] = lMessageLength >>> 29;
        return lWordArray;
    };

    var wordToHex = function(lValue) {
        var WordToHexValue = "", WordToHexValueTemp = "", lByte, lCount;
        for (lCount = 0; lCount <= 3; lCount++) {
            lByte = (lValue >>> (lCount * 8)) & 255;
            WordToHexValueTemp = "0" + lByte.toString(16);
            WordToHexValue = WordToHexValue + WordToHexValueTemp.substr(WordToHexValueTemp.length - 2, 2);
        }
        return WordToHexValue;
    };

    var uTF8Encode = function(string) {
        string = string.replace(/\x0d\x0a/g, "\x0a");
        var output = "";
        for (var n = 0; n < string.length; n++) {
            var c = string.charCodeAt(n);
            if (c < 128) {
                output += String.fromCharCode(c);
            } else if ((c > 127) && (c < 2048)) {
                output += String.fromCharCode((c >> 6) | 192);
                output += String.fromCharCode((c & 63) | 128);
            } else {
                output += String.fromCharCode((c >> 12) | 224);
                output += String.fromCharCode(((c >> 6) & 63) | 128);
                output += String.fromCharCode((c & 63) | 128);
            }
        }
        return output;
    };

    $.extend({
        md5: function(string) {
            var x = Array();
            var k, AA, BB, CC, DD, a, b, c, d;
            var S11 = 7, S12 = 12, S13 = 17, S14 = 22;
            var S21 = 5, S22 = 9, S23 = 14, S24 = 20;
            var S31 = 4, S32 = 11, S33 = 16, S34 = 23;
            var S41 = 6, S42 = 10, S43 = 15, S44 = 21;
            string = uTF8Encode(string);
            x = convertToWordArray(string);
            a = 0x67452301;
            b = 0xEFCDAB89;
            c = 0x98BADCFE;
            d = 0x10325476;
            for (k = 0; k < x.length; k += 16) {
                AA = a;
                BB = b;
                CC = c;
                DD = d;
                a = FF(a, b, c, d, x[k + 0], S11, 0xD76AA478);
                d = FF(d, a, b, c, x[k + 1], S12, 0xE8C7B756);
                c = FF(c, d, a, b, x[k + 2], S13, 0x242070DB);
                b = FF(b, c, d, a, x[k + 3], S14, 0xC1BDCEEE);
                a = FF(a, b, c, d, x[k + 4], S11, 0xF57C0FAF);
                d = FF(d, a, b, c, x[k + 5], S12, 0x4787C62A);
                c = FF(c, d, a, b, x[k + 6], S13, 0xA8304613);
                b = FF(b, c, d, a, x[k + 7], S14, 0xFD469501);
                a = FF(a, b, c, d, x[k + 8], S11, 0x698098D8);
                d = FF(d, a, b, c, x[k + 9], S12, 0x8B44F7AF);
                c = FF(c, d, a, b, x[k + 10], S13, 0xFFFF5BB1);
                b = FF(b, c, d, a, x[k + 11], S14, 0x895CD7BE);
                a = FF(a, b, c, d, x[k + 12], S11, 0x6B901122);
                d = FF(d, a, b, c, x[k + 13], S12, 0xFD987193);
                c = FF(c, d, a, b, x[k + 14], S13, 0xA679438E);
                b = FF(b, c, d, a, x[k + 15], S14, 0x49B40821);
                a = GG(a, b, c, d, x[k + 1], S21, 0xF61E2562);
                d = GG(d, a, b, c, x[k + 6], S22, 0xC040B340);
                c = GG(c, d, a, b, x[k + 11], S23, 0x265E5A51);
                b = GG(b, c, d, a, x[k + 0], S24, 0xE9B6C7AA);
                a = GG(a, b, c, d, x[k + 5], S21, 0xD62F105D);
                d = GG(d, a, b, c, x[k + 10], S22, 0x2441453);
                c = GG(c, d, a, b, x[k + 15], S23, 0xD8A1E681);
                b = GG(b, c, d, a, x[k + 4], S24, 0xE7D3FBC8);
                a = GG(a, b, c, d, x[k + 9], S21, 0x21E1CDE6);
                d = GG(d, a, b, c, x[k + 14], S22, 0xC33707D6);
                c = GG(c, d, a, b, x[k + 3], S23, 0xF4D50D87);
                b = GG(b, c, d, a, x[k + 8], S24, 0x455A14ED);
                a = GG(a, b, c, d, x[k + 13], S21, 0xA9E3E905);
                d = GG(d, a, b, c, x[k + 2], S22, 0xFCEFA3F8);
                c = GG(c, d, a, b, x[k + 7], S23, 0x676F02D9);
                b = GG(b, c, d, a, x[k + 12], S24, 0x8D2A4C8A);
                a = HH(a, b, c, d, x[k + 5], S31, 0xFFFA3942);
                d = HH(d, a, b, c, x[k + 8], S32, 0x8771F681);
                c = HH(c, d, a, b, x[k + 11], S33, 0x6D9D6122);
                b = HH(b, c, d, a, x[k + 14], S34, 0xFDE5380C);
                a = HH(a, b, c, d, x[k + 1], S31, 0xA4BEEA44);
                d = HH(d, a, b, c, x[k + 4], S32, 0x4BDECFA9);
                c = HH(c, d, a, b, x[k + 7], S33, 0xF6BB4B60);
                b = HH(b, c, d, a, x[k + 10], S34, 0xBEBFBC70);
                a = HH(a, b, c, d, x[k + 13], S31, 0x289B7EC6);
                d = HH(d, a, b, c, x[k + 0], S32, 0xEAA127FA);
                c = HH(c, d, a, b, x[k + 3], S33, 0xD4EF3085);
                b = HH(b, c, d, a, x[k + 6], S34, 0x4881D05);
                a = HH(a, b, c, d, x[k + 9], S31, 0xD9D4D039);
                d = HH(d, a, b, c, x[k + 12], S32, 0xE6DB99E5);
                c = HH(c, d, a, b, x[k + 15], S33, 0x1FA27CF8);
                b = HH(b, c, d, a, x[k + 2], S34, 0xC4AC5665);
                a = II(a, b, c, d, x[k + 0], S41, 0xF4292244);
                d = II(d, a, b, c, x[k + 7], S42, 0x432AFF97);
                c = II(c, d, a, b, x[k + 14], S43, 0xAB9423A7);
                b = II(b, c, d, a, x[k + 5], S44, 0xFC93A039);
                a = II(a, b, c, d, x[k + 12], S41, 0x655B59C3);
                d = II(d, a, b, c, x[k + 3], S42, 0x8F0CCC92);
                c = II(c, d, a, b, x[k + 10], S43, 0xFFEFF47D);
                b = II(b, c, d, a, x[k + 1], S44, 0x85845DD1);
                a = II(a, b, c, d, x[k + 8], S41, 0x6FA87E4F);
                d = II(d, a, b, c, x[k + 15], S42, 0xFE2CE6E0);
                c = II(c, d, a, b, x[k + 6], S43, 0xA3014314);
                b = II(b, c, d, a, x[k + 13], S44, 0x4E0811A1);
                a = II(a, b, c, d, x[k + 4], S41, 0xF7537E82);
                d = II(d, a, b, c, x[k + 11], S42, 0xBD3AF235);
                c = II(c, d, a, b, x[k + 2], S43, 0x2AD7D2BB);
                b = II(b, c, d, a, x[k + 9], S44, 0xEB86D391);
                a = addUnsigned(a, AA);
                b = addUnsigned(b, BB);
                c = addUnsigned(c, CC);
                d = addUnsigned(d, DD);
            }
            var tempValue = wordToHex(a) + wordToHex(b) + wordToHex(c) + wordToHex(d);
            return tempValue.toLowerCase();
        }
    });
})(jQuery);


 jQuery(document).ready(function($){
    var time=300000;
    setInterval(function(){
         $.get(CONFIG['base']+'keep_alive_session_call',function(){
         console.log("Session Call");
         });
    },time);
 })

