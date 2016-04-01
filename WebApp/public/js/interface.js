// Ryker Dial
// University of Alaska, Fairbanks
// EE 444: Embedded Systems Design
// Web app client-side interface for sensor data transmission.

// Date Created: March 24, 2016
// Last Modified: April 1, 2016

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
    
    var sensor_data = {};
    socket.on('Sensor Data', function (data) {
        for (var prop in data.data) {
            if (!data.data.hasOwnProperty(prop)) {
            //The current property is not a direct property of p
            continue;
            }
             switch(prop) {
                case "ACC_data":
                    sensor_data.ACC_data = data.data.ACC_data;
                    break;
                case "CO2_data":
                    sensor_data.CO2_data = data.data.CO2_data;
                    break;
                case "FLO_data":
                    sensor_data.FLO_data = data.data.FLO_data;
                    break; 
                case "GYR_data":
                    sensor_data.GYR_data = data.data.GYR_data;
                    break;
                case "MAG_data":
                    sensor_data.GYR_data = data.data.MAG_data;
                    break; 
             }            
        }
    });
    
    // Data structure to store chart control information.
    var chart_controller = {update_interval: 50};
    
    // chart_controller.ACC = {};
    // chart_controller.ACC.numMeas = 0;
    // chart_controller.ACC.xVal = 0;
    // chart_controller.ACC.data_points = [{}];
    
    chart_controller.CO2 = {};
    chart_controller.CO2.numMeas = 0;
    chart_controller.CO2.xVal = 0;
    chart_controller.CO2.data_points = [{}];
    
    chart_controller.FLO = {};
    chart_controller.FLO.numMeas = 0;
    chart_controller.FLO.xVal = 0;
    chart_controller.FLO.data_points = [{}];

    // chart_controller.GYR = {};
    // chart_controller.GYR.numMeas = 0;
    // chart_controller.GYR.xVal = 0;
    // chart_controller.GYR.data_points = [{}];

    // chart_controller.MAG = {};
    // chart_controller.MAG.numMeas = 0;
    // chart_controller.MAG.xVal = 0;
    // chart_controller.MAG.data_points = [{}];    
    
    chart_controller.CO2.chart_init = function() {
        $( "#chartContainer" ).append(             
            "<div id='CO2_chartContainer' style='height: 300px; width: 75%;'></div>"
        )
        chart_controller.CO2.chart = new CanvasJS.Chart("CO2_chartContainer", {
                    title: {
                        text: "CO2 Sensor Data"
                    },
                    axisX: {
                        title: "Time (s)"
                    },
                    axisY: {
                        title: "Concentration (ppm)"
                    },
                    data: [{
                        type: "line",
                        dataPoints: chart_controller.CO2.data_points
                    }]
                });
                    
                chart_controller.CO2.updateChart = function() {
                    chart_controller.CO2.data_points.push({x: chart_controller.CO2.xVal, y: sensor_data.CO2_data});
                    ++chart_controller.CO2.numMeas;
                    chart_controller.CO2.xVal = chart_controller.CO2.numMeas*chart_controller.update_interval/1000.;
                    if(chart_controller.CO2.data_points.length > 100 ) { // 100 meas. is 5 seconds worth
                       chart_controller.CO2.data_points.shift(); 
                    }
                    chart_controller.CO2.chart.render()
                }
                
                // update chart after specified time interval
                setInterval(function(){chart_controller.CO2.updateChart()}, chart_controller.update_interval); 
    }
    
    chart_controller.FLO.chart_init = function() {
        $( "#chartContainer" ).append(             
            "<div id='FLO_chartContainer' style='height: 300px; width: 75%;'></div>"
        )
        chart_controller.FLO.chart = new CanvasJS.Chart("FLO_chartContainer", {
                    title: {
                        text: "Flow Rate Sensor Data"
                    },
                    axisX: {
                        title: "Time (s)"
                    },
                    axisY: {
                        title: "Flow Rate (LPM)"
                    },
                    data: [{
                        type: "line",
                        dataPoints: chart_controller.FLO.data_points
                    }]
                });
                    
                chart_controller.FLO.updateChart = function() {
                    chart_controller.FLO.data_points.push({x: chart_controller.FLO.xVal, y: sensor_data.FLO_data});
                    ++chart_controller.FLO.numMeas;
                    chart_controller.FLO.xVal = chart_controller.FLO.numMeas*chart_controller.update_interval/1000.;
                    if(chart_controller.FLO.data_points.length > 100 ) { // 100 meas. is 5 seconds worth
                       chart_controller.FLO.data_points.shift(); 
                    }
                    chart_controller.FLO.chart.render()
                }
                
                // update chart after specified time interval
                setInterval(function(){chart_controller.FLO.updateChart()}, chart_controller.update_interval); 
    }
    
    sensor_add = function(sensor_ID) {
        switch(sensor_ID) {
            case "ACC":
                // if( $("#ACC_chartContainer").length == 0) { // If the chart does not exist, create it.
                    // console.log("Adding accelerometer");
                    // socket.emit('Configure', {command: "ACC_add"});
                    // chart_controller.ACC.chart_init();
                // }
                break;
            case "CO2":
                if( $("#CO2_chartContainer").length == 0) { // If the chart does not exist, create it.
                    console.log("Adding CO2 sensor");
                    socket.emit('Configure', {command: "CO2_add"});
                    chart_controller.CO2.chart_init();
                }
                break;
            case "FLO":
                if( $("#FLO_chartContainer").length == 0) { // If the chart does not exist, create it.
                    console.log("Adding flow rate sensor");
                    socket.emit('Configure', {command: "FLO_add"});
                    chart_controller.FLO.chart_init();
                }
                break;
            case "GYR":
                // if( $("#GYR_chartContainer").length == 0) { // If the chart does not exist, create it.
                    // console.log("Adding gyroscope");
                    // socket.emit('Configure', {command: "GYR_add"});
                    // chart_controller.GYR.chart_init();
                // }
                break;
            case "MAG":
                // if( $("#MAG_chartContainer").length == 0) { // If the chart does not exist, create it.
                    // console.log("Adding magnetometer");
                    // socket.emit('Configure', {command: "MAG_add"});
                    // chart_controller.MAG.chart_init();
                // }
                break;
            default:
                break;     
        }
    }
    
    sensor_remove = function(sensor_ID) {
        switch(sensor_ID) {
            case "ACC":
                // if( $("#ACC_chartContainer").length > 0) { // If the chart exists, remove it
                    // console.log("Removing accelerometer");
                    // socket.emit('Configure', {command: "ACC_remove"});
                    // $("#ACC_chartContainer").remove();
                // }    
                break;
            case "CO2":
                if( $("#CO2_chartContainer").length > 0) { // If the chart exists, remove it
                    console.log("Removing CO2 sensor");
                    socket.emit('Configure', {command: "CO2_remove"});
                    $("#CO2_chartContainer").remove();
                }                
                break;
            case "FLO":
                if( $("#FLO_chartContainer").length > 0) { // If the chart exists, remove it
                    console.log("Removing flow rate sensor");
                    socket.emit('Configure', {command: "FLO_remove"});
                    $("#FLO_chartContainer").remove();
                }    
                break;
            case "GYR":
                // if( $("#GYR_chartContainer").length > 0) { // If the chart exists, remove it
                    // console.log("Removing gyroscope");
                    // socket.emit('Configure', {command: "GYR_remove"});
                    // $("#GYR_chartContainer").remove();
                // }    
                break;
            case "MAG":
                // if( $("#CO2_chartContainer").length > 0) { // If the chart exists, remove it
                    // console.log("Removing magnetometer");
                    // socket.emit('Configure', {command: "MAG_remove"});
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