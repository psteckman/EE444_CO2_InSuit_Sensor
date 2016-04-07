// Ryker Dial
// University of Alaska, Fairbanks
// EE 444: Embedded Systems Design
// Web app client-side interface for sensor data transmission.

// Date Created: March 24, 2016
// Last Modified: April 6, 2016

$(document).ready(function() {
    // Connect to the node.js server. Gets server's local IP.
    // Only works when client and server are on the same network.
    var ip = location.host;
    var socket = io.connect(ip); // Connects to server
    
    // Upon establishing a connection to the socket.io server...
    socket.on('Connected to server', function (data) {
        //console.log(data);
        // Send out a message to the server
        socket.emit('Client connected', { data: 0 });
    });
    
    var sensor_data = {
        // Objects to hold collection of sensor values.
        ACC: {},
        CO2: {},
        FLO: {}
    };
    socket.on('Sensor Data', function (data) {
        // console.log(data.data);
        // Iterate through the received data and update affected sensors
        data.data.forEach( function(item) {
            switch(item.ID) {
                case "ACC":
                    sensor_data.ACC[item.sensorMod_num] = item.data;
                    break;
                case "CO2":
                    sensor_data.CO2[item.sensorMod_num] = item.data;
                    break;
                case "FLO":
                    sensor_data.FLO[item.sensorMod_num] = item.data;
                    break;
                default:
                    break;
            }
       });
       
                // for (var prop in sensor_data.CO2) {
                    // if (!sensor_data.CO2.hasOwnProperty(prop)) {
                    // //The current property is not a direct property of p
                    // continue;
                    // }
                    // // chart_controller.CO2.chart_init(sensor_data.CO2[prop].sensorMod_num);
                    // console.log("prop" + prop);
                    // console.log(sensor_data.CO2[prop]);
                // }
        // for (var prop in data.data) {
            // if (!data.data.hasOwnProperty(prop)) {
            // //The current property is not a direct property of p
            // continue;
            // }
             // switch(prop) {
                // case "ACC":
                    // sensor_data.ACC = data.data.ACC;
                    // break;
                // case "CO2":
                    // sensor_data.CO2 = data.data.CO2;
                    // break;
                // case "FLO":
                    // sensor_data.FLO = data.data.FLO;
                    // break; 
                // case "GYR":
                    // sensor_data.GYR = data.data.GYR;
                    // break;
                // case "MAG":
                    // sensor_data.MAG = data.data.MAG;
                    // break; 
             // }            
        // }
    });
    
    // Data structure to store chart control information.
    var chart_controller = {
        update_interval: 50,
        num_seconds: 3, // Number of seconds of data charted at once
      
        ACC: {},
        CO2: {
            numMeas: {},
            xVal: {},
            data_points: {},
            chart: {},
            updateChart: {},
            update_timer: {}
        },
        FLO: {
            numMeas: {},
            xVal: {},
            data_points: {},
            chart: {},
            updateChart: {},
            update_timer: {}
        }
    };
 
    chart_controller.ACC.chart_init = function() {
        // $( "#chartContainer" ).append(             
            // "<div id='ACC_chartContainer' style='height: 300px; width: 75%;'></div>"
        // )
        
        // chart_controller.ACC.numMeas = 0;
        // chart_controller.ACC.tVal = 0;
        // chart_controller.ACC.data_points = {x:[{}], y:[{}], z:[{}]};

        
        // chart_controller.ACC.chart = new CanvasJS.Chart("ACC_chartContainer", {
            // title: {
                // text: "Accelerometer Sensor Data"
            // },
            // toolTip: {
                // shared: true
            // },
			// legend: {
				// verticalAlign: "top",
				// horizontalAlign: "center",
                                // fontSize: 14,
				// fontWeight: "bold",
				// fontFamily: "calibri",
				// fontColor: "dimGrey"
			// },
            // axisX: {
                // title: "Time (s)"
            // },
            // axisY: {
                // title: "Concentration (ppm)"
            // },
            // data: [{
                // // Accelerometer x-axis data
                // type: "line",
                // dataPoints: chart_controller.ACC.data_points.x,
                // showInLegend: true,
                // name: "x-axis"
            // },
            // {
                // // Accelerometer y-axis data
                // type: "line",
                // dataPoints: chart_controller.ACC.data_points.y,
                // showInLegend: true,
                // name: "y-axis"
            // },
            // {
                // // Accelerometer z-axis data
                // type: "line",
                // dataPoints: chart_controller.ACC.data_points.z,
                // showInLegend: true,
                // name: "z-axis"
            // }]
        // });
                    
        // chart_controller.ACC.updateChart = function() {
            // chart_controller.ACC.data_points.x.push({
                // x: chart_controller.ACC.tVal, 
                // y: sensor_data.ACC.x
            // });
            // chart_controller.ACC.data_points.y.push({
                // x: chart_controller.ACC.tVal, 
                // y: sensor_data.ACC.y
            // });
            // chart_controller.ACC.data_points.z.push({
                // x: chart_controller.ACC.tVal, 
                // y: sensor_data.ACC.z
            // });
            // ++chart_controller.ACC.numMeas;
            // chart_controller.ACC.tVal = chart_controller.ACC.numMeas*chart_controller.update_interval/1000.;
            // if(chart_controller.ACC.data_points.x.length > 100 ) { // 100 meas. is 5 seconds worth
               // chart_controller.ACC.data_points.x.shift(); 
               // chart_controller.ACC.data_points.y.shift(); 
               // chart_controller.ACC.data_points.z.shift(); 
            // }
            // chart_controller.ACC.chart.render();
        // }
        
        // // update chart after specified time interval
        // chart_controller.ACC.update_timer = setInterval(function(){chart_controller.ACC.updateChart()}, chart_controller.update_interval); 
    }
    
    chart_controller.CO2.chart_init = function(sensorMod_num) {
        
        // Create container for chart
        var chart_div = document.createElement("div");
        var chart_div_id = "CO2_container" + sensorMod_num;
        chart_div.setAttribute("id", chart_div_id);
        chart_div.setAttribute("class", "panel panel-default");
        $( "#chartContainer" ).append(chart_div);
         
        var chart_header = document.createElement("div");
        chart_header.setAttribute("class", "panel-heading");
        chart_header.innerHTML = 
            "CO2 Sensor Data, Sensor Module " 
            + sensorMod_num 
            + ": Concentration (ppm) vs. Time (s)";
        $( '#' + chart_div_id ).append(chart_header);
        
        
        var canvas = document.createElement("canvas");
        canvas_id = "CO2_chartContainer" + sensorMod_num;
        canvas.setAttribute("id", canvas_id);
        canvas.setAttribute("width", "700");
        canvas.setAttribute("height", "300");
        $( '#' + chart_div_id ).append(canvas);
        // **********
        
        // Create removal button
        var remove_li = document.createElement("li");
        var remove_li_id = "CO2_remove" + sensorMod_num;
        remove_li.setAttribute("id", remove_li_id);
        $( "#remove_menu" ).append(remove_li);
        var remove_a = document.createElement("a");
        remove_a.setAttribute("onclick", 
            "sensor_remove('CO2', "
            + sensorMod_num 
            + ")"
        );
        remove_a.setAttribute("href", "#");
        remove_a.innerHTML = "CO2 " + sensorMod_num;
        $( "#" + remove_li_id ).append(remove_a);
        // **********
        
        chart_controller.CO2.numMeas[sensorMod_num] = 0;
        chart_controller.CO2.xVal[sensorMod_num] = 0;
        chart_controller.CO2.data_points[sensorMod_num] = {
            labels: [0],
            datasets: [{
             strokeColor: "#00BFFF",
             fillColor: "rgba(0,0,0,0)",
           //  pointColor: "rgba(0,0,0,0)",
             
             // showScale: false,
             // scaleOverrideL true
             //scaleShowLabels: false,
             
             //pointStrokeColor: "#fff",
            data: []  
            }]
        }
        
        //chart_controller.CO2.ctx = document.getElementById('CO2_chartContainer' + sensorMod_num).getContext('2d');
        chart_controller.CO2.chart[sensorMod_num] = new Chart(
            document.getElementById('CO2_chartContainer' + sensorMod_num).getContext('2d')).Line(chart_controller.CO2.data_points[sensorMod_num], {
                animation: true,
                pointDot: false,
                scaleShowHorizontalLines: false,
                scaleShowVerticalLines: false,
                showTooltips: false
        });
        
        chart_controller.CO2.updateChart[sensorMod_num] = function () {
            chart_controller.CO2.data_points[sensorMod_num].datasets[0].data.push(sensor_data.CO2[sensorMod_num]);
            ++chart_controller.CO2.numMeas[sensorMod_num];
            chart_controller.CO2.chart[sensorMod_num].addData(
                [chart_controller.CO2.data_points[sensorMod_num].datasets[0].data[chart_controller.CO2.data_points[sensorMod_num].datasets[0].data.length-1]
                ],
                ""
                // Only print labels every second
                //(chart_controller.CO2.numMeas[sensorMod_num])%(500/(chart_controller.update_interval)) == 0 ? (chart_controller.CO2.numMeas[sensorMod_num]*chart_controller.update_interval/1000.) : ""
                //((++chart_controller.CO2.numMeas)*chart_controller.update_interval/1000.)
            );           
            if(chart_controller.CO2.data_points[sensorMod_num].datasets[0].data.length > chart_controller.num_seconds*(1000/(chart_controller.update_interval)) ) { // 2.5 seconds
                chart_controller.CO2.data_points[sensorMod_num].datasets[0].data.shift(); // shift data array so it doesn't grow boundlessly.
                chart_controller.CO2.chart[sensorMod_num].removeData();
            }
        }
        // update chart after specified time interval
        chart_controller.CO2.update_timer[sensorMod_num] = setInterval(function(){chart_controller.CO2.updateChart[sensorMod_num]()}, chart_controller.update_interval);
    }
 
    chart_controller.FLO.chart_init = function(sensorMod_num) {
        
        // Create container for chart
        var chart_div = document.createElement("div");
        var chart_div_id = "FLO_container" + sensorMod_num;
        chart_div.setAttribute("id", chart_div_id);
        chart_div.setAttribute("class", "panel panel-default");
        $( "#chartContainer" ).append(chart_div);
         
        var chart_header = document.createElement("div");
        chart_header.setAttribute("class", "panel-heading");
        chart_header.innerHTML = 
            "FLO Sensor Data, Sensor Module " 
            + sensorMod_num 
            + ": Concentration (ppm) vs. Time (s)";
        $( '#' + chart_div_id ).append(chart_header);
        
        
        var canvas = document.createElement("canvas");
        canvas_id = "FLO_chartContainer" + sensorMod_num;
        canvas.setAttribute("id", canvas_id);
        canvas.setAttribute("width", "700");
        canvas.setAttribute("height", "300");
        $( '#' + chart_div_id ).append(canvas);
        // **********
        
        // Create removal button
        var remove_li = document.createElement("li");
        var remove_li_id = "FLO_remove" + sensorMod_num;
        remove_li.setAttribute("id", remove_li_id);
        $( "#remove_menu" ).append(remove_li);
        var remove_a = document.createElement("a");
        remove_a.setAttribute("onclick", 
            "sensor_remove('FLO', "
            + sensorMod_num 
            + ")"
        );
        remove_a.setAttribute("href", "#");
        remove_a.innerHTML = "FLO " + sensorMod_num;
        $( "#" + remove_li_id ).append(remove_a);
        // **********
        
        chart_controller.FLO.numMeas[sensorMod_num] = 0;
        chart_controller.FLO.xVal[sensorMod_num] = 0;
        chart_controller.FLO.data_points[sensorMod_num] = {
            labels: [0],
            datasets: [{
             strokeColor: "#00BFFF",
             fillColor: "rgba(0,0,0,0)",
           //  pointColor: "rgba(0,0,0,0)",
             
             // showScale: false,
             // scaleOverrideL true
             //scaleShowLabels: false,
             
             //pointStrokeColor: "#fff",
            data: []  
            }]
        }
        
        //chart_controller.FLO.ctx = document.getElementById('FLO_chartContainer' + sensorMod_num).getContext('2d');
        chart_controller.FLO.chart[sensorMod_num] = new Chart(
            document.getElementById('FLO_chartContainer' + sensorMod_num).getContext('2d')).Line(chart_controller.FLO.data_points[sensorMod_num], {
                animation: true,
                pointDot: false,
                scaleShowHorizontalLines: false,
                scaleShowVerticalLines: false,
                showTooltips: false
        });
        
        chart_controller.FLO.updateChart[sensorMod_num] = function () {
            chart_controller.FLO.data_points[sensorMod_num].datasets[0].data.push(sensor_data.FLO[sensorMod_num]);
            ++chart_controller.FLO.numMeas[sensorMod_num];
            chart_controller.FLO.chart[sensorMod_num].addData(
                [chart_controller.FLO.data_points[sensorMod_num].datasets[0].data[chart_controller.FLO.data_points[sensorMod_num].datasets[0].data.length-1]
                ],
                ""
                // Only print labels every second
                //(chart_controller.FLO.numMeas[sensorMod_num])%(1000/(chart_controller.update_interval)) == 0 ? (chart_controller.FLO.numMeas[sensorMod_num]*chart_controller.update_interval/1000.) : ""
                //((++chart_controller.FLO.numMeas)*chart_controller.update_interval/1000.)
            );           
            if(chart_controller.FLO.data_points[sensorMod_num].datasets[0].data.length > chart_controller.num_seconds*(1000/(chart_controller.update_interval)) ) { // 100 meas. is 5 seconds worth
                chart_controller.FLO.data_points[sensorMod_num].datasets[0].data.shift(); // shift data array so it doesn't grow boundlessly.
                chart_controller.FLO.chart[sensorMod_num].removeData();
            }
        }
        // update chart after specified time interval
        chart_controller.FLO.update_timer[sensorMod_num] = setInterval(function(){chart_controller.FLO.updateChart[sensorMod_num]()}, chart_controller.update_interval);
    }
    
    sensor_add = function(sensor_ID) {
        switch(sensor_ID) {
            case "ACC":
                if( $("#ACC_chartContainer").length == 0) { // If the chart does not exist, create it.
                    console.log("Adding accelerometer");
                    socket.emit('Add Sensor', {command: "ACC_add"});
                    chart_controller.ACC.chart_init();
                }
                break;
            case "CO2":
                for (var prop in sensor_data.CO2) {
                    if (!sensor_data.CO2.hasOwnProperty(prop)) {
                        //The current property is not a direct property of p
                        continue;
                    }
                    if( $("#CO2_chartContainer" + prop).length == 0) 
                        chart_controller.CO2.chart_init(prop);
                }
                break;
            case "FLO":
                for (var prop in sensor_data.FLO) {
                    if (!sensor_data.FLO.hasOwnProperty(prop)) {
                        //The current property is not a direct property of p
                        continue;
                    }
                    if( $("#FLO_chartContainer" + prop).length == 0) 
                        chart_controller.FLO.chart_init(prop);
                }
                break;
            case "GYR":
                // if( $("#GYR_chartContainer").length == 0) { // If the chart does not exist, create it.
                    // console.log("Adding gyroscope");
                    // socket.emit('Add Sensor', {command: "GYR_add"});
                    // chart_controller.GYR.chart_init();
                // }
                break;
            case "MAG":
                // if( $("#MAG_chartContainer").length == 0) { // If the chart does not exist, create it.
                    // console.log("Adding magnetometer");
                    // socket.emit('Add Sensor', {command: "MAG_add"});
                    // chart_controller.MAG.chart_init();
                // }
                break;
            default:
                break;     
        }
    }
    
    sensor_remove = function(sensor_ID, sensorMod_num) {
        switch(sensor_ID) {
            case "ACC":
                if( $("#ACC_chartContainer").length > 0) { // If the chart exists, remove it
                    console.log("Removing accelerometer");
                    socket.emit('Remove Sensor', {command: "ACC_remove"});
                    $("#ACC_chartContainer").remove();
                }    
                break;
            case "CO2":
                if( $("#CO2_chartContainer" + sensorMod_num).length > 0) { // If the chart exists, remove it
                    console.log("Removing CO2 sensor" + sensorMod_num);
                    //socket.emit('Remove Sensor', {command: "CO2_remove"});
                    clearInterval(chart_controller.CO2.update_timer[sensorMod_num]); // Stop update timer for chart
                    chart_controller.CO2.chart[sensorMod_num].destroy(); // Clean up chart
                    $("#CO2_container" + sensorMod_num).remove();
                    $("#CO2_remove" + sensorMod_num).remove();
                }                
                break;
            case "FLO":
                if( $("#FLO_chartContainer" + sensorMod_num).length > 0) { // If the chart exists, remove it
                    console.log("Removing FLO sensor" + sensorMod_num);
                    //socket.emit('Remove Sensor', {command: "FLO_remove"});
                    clearInterval(chart_controller.FLO.update_timer[sensorMod_num]); // Stop update timer for chart
                    chart_controller.FLO.chart[sensorMod_num].destroy(); // Clean up chart
                    $("#FLO_container" + sensorMod_num).remove();
                    $("#FLO_remove" + sensorMod_num).remove();
                }                
                break   
                break;
            case "GYR":
                // if( $("#GYR_chartContainer").length > 0) { // If the chart exists, remove it
                    // console.log("Removing gyroscope");
                    // socket.emit('Remove Sensor', {command: "GYR_remove"});
                    // $("#GYR_chartContainer").remove();
                // }    
                break;
            case "MAG":
                // if( $("#CO2_chartContainer").length > 0) { // If the chart exists, remove it
                    // console.log("Removing magnetometer");
                    // socket.emit('Remove Sensor', {command: "MAG_remove"});
                    // $("#MAG_chartContainer").remove();
                // }    
                break;
            default:
                break; 
        }
    }
    
	// Tell the server to start saving sensor data to csv
	data_capture_start = function() {
		console.log("Start Data Capture")
		socket.emit('Start Data Capture', {command: data_capture_start});
	}

	// Tell the server to stop saving sensor data to csv	
	data_capture_stop = function() {
		console.log("Stop Data Capture")
		socket.emit('Stop Data Capture', {command: data_capture_stop});
	}
});