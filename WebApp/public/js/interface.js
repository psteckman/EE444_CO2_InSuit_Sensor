// Ryker Dial
// University of Alaska, Fairbanks
// EE 444: Embedded Systems Design
// Web app client-side interface for sensor data transmission.

// Date Created: March 24, 2016
// Last Modified: April 2, 2016

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
                case "ACC":
                    sensor_data.ACC = data.data.ACC;
                    break;
                case "CO2":
                    sensor_data.CO2 = data.data.CO2;
                    break;
                case "FLO":
                    sensor_data.FLO = data.data.FLO;
                    break; 
                case "GYR":
                    sensor_data.GYR = data.data.GYR;
                    break;
                case "MAG":
                    sensor_data.MAG = data.data.MAG;
                    break; 
             }            
        }
    });
    
    // Data structure to store chart control information.
    var chart_controller = {
        update_interval: 50,
      
        ACC: {},
        CO2: {},
        FLO: {}
    };
 
    chart_controller.ACC.chart_init = function() {
        $( "#chartContainer" ).append(             
            "<div id='ACC_chartContainer' style='height: 300px; width: 75%;'></div>"
        )
        
        chart_controller.ACC.numMeas = 0;
        chart_controller.ACC.tVal = 0;
        chart_controller.ACC.data_points = {x:[{}], y:[{}], z:[{}]};

        
        chart_controller.ACC.chart = new CanvasJS.Chart("ACC_chartContainer", {
            title: {
                text: "Accelerometer Sensor Data"
            },
            toolTip: {
                shared: true
            },
			legend: {
				verticalAlign: "top",
				horizontalAlign: "center",
                                fontSize: 14,
				fontWeight: "bold",
				fontFamily: "calibri",
				fontColor: "dimGrey"
			},
            axisX: {
                title: "Time (s)"
            },
            axisY: {
                title: "Concentration (ppm)"
            },
            data: [{
                // Accelerometer x-axis data
                type: "line",
                dataPoints: chart_controller.ACC.data_points.x,
                showInLegend: true,
                name: "x-axis"
            },
            {
                // Accelerometer y-axis data
                type: "line",
                dataPoints: chart_controller.ACC.data_points.y,
                showInLegend: true,
                name: "y-axis"
            },
            {
                // Accelerometer z-axis data
                type: "line",
                dataPoints: chart_controller.ACC.data_points.z,
                showInLegend: true,
                name: "z-axis"
            }]
        });
                    
        chart_controller.ACC.updateChart = function() {
            chart_controller.ACC.data_points.x.push({
                x: chart_controller.ACC.tVal, 
                y: sensor_data.ACC.x
            });
            chart_controller.ACC.data_points.y.push({
                x: chart_controller.ACC.tVal, 
                y: sensor_data.ACC.y
            });
            chart_controller.ACC.data_points.z.push({
                x: chart_controller.ACC.tVal, 
                y: sensor_data.ACC.z
            });
            ++chart_controller.ACC.numMeas;
            chart_controller.ACC.tVal = chart_controller.ACC.numMeas*chart_controller.update_interval/1000.;
            if(chart_controller.ACC.data_points.x.length > 100 ) { // 100 meas. is 5 seconds worth
               chart_controller.ACC.data_points.x.shift(); 
               chart_controller.ACC.data_points.y.shift(); 
               chart_controller.ACC.data_points.z.shift(); 
            }
            chart_controller.ACC.chart.render();
        }
        
        // update chart after specified time interval
        chart_controller.ACC.update_timer = setInterval(function(){chart_controller.ACC.updateChart()}, chart_controller.update_interval); 
    }
    
    chart_controller.CO2.chart_init = function() {
        $( "#chartContainer" ).append(             
            "<div id='CO2_chartContainer' style='height: 300px; width: 75%;'></div>"
        )
        
        chart_controller.CO2.numMeas = 0;
        chart_controller.CO2.xVal = 0;
        chart_controller.CO2.data_points = [{}];
        
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
            chart_controller.CO2.data_points.push({x: chart_controller.CO2.xVal, y: sensor_data.CO2});
            ++chart_controller.CO2.numMeas;
            chart_controller.CO2.xVal = chart_controller.CO2.numMeas*chart_controller.update_interval/1000.;
            if(chart_controller.CO2.data_points.length > 100 ) { // 100 meas. is 5 seconds worth
               chart_controller.CO2.data_points.shift(); 
            }
            chart_controller.CO2.chart.render()
        }
        
        // update chart after specified time interval
        chart_controller.CO2.update_timer = setInterval(function(){chart_controller.CO2.updateChart()}, chart_controller.update_interval);
    }
 
    chart_controller.FLO.chart_init = function() {
        $( "#chartContainer" ).append(             
            "<div id='FLO_chartContainer' style='height: 300px; width: 75%;'></div>"
        )
        
        chart_controller.FLO.numMeas = 0;
        chart_controller.FLO.xVal = 0;
        chart_controller.FLO.data_points = [{}];
        
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
            chart_controller.FLO.data_points.push({x: chart_controller.FLO.xVal, y: sensor_data.FLO});
            ++chart_controller.FLO.numMeas;
            chart_controller.FLO.xVal = chart_controller.FLO.numMeas*chart_controller.update_interval/1000.;
            if(chart_controller.FLO.data_points.length > 100 ) { // 100 meas. is 5 seconds worth
               chart_controller.FLO.data_points.shift(); 
            }
            chart_controller.FLO.chart.render()
        }
        
        // update chart after specified time interval
        chart_controller.FLO.update_timer = setInterval(function(){chart_controller.FLO.updateChart()}, chart_controller.update_interval);
    }
    // chart_controller.ACC = {};
    // chart_controller.ACC.numMeas = 0;
    // chart_controller.ACC.xVal = 0;
    // chart_controller.ACC.data_points = [{}];
    
    
    

    // chart_controller.GYR = {};
    // chart_controller.GYR.numMeas = 0;
    // chart_controller.GYR.xVal = 0;
    // chart_controller.GYR.data_points = [{}];

    // chart_controller.MAG = {};
    // chart_controller.MAG.numMeas = 0;
    // chart_controller.MAG.xVal = 0;
    // chart_controller.MAG.data_points = [{}];    
    
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
                if( $("#CO2_chartContainer").length == 0) { // If the chart does not exist, create it.
                    console.log("Adding CO2 sensor");
                    socket.emit('Add Sensor', {command: "CO2_add"});
                    chart_controller.CO2.chart_init();
                }
                break;
            case "FLO":
                if( $("#FLO_chartContainer").length == 0) { // If the chart does not exist, create it.
                    console.log("Adding flow rate sensor");
                    socket.emit('Add Sensor', {command: "FLO_add"});
                    chart_controller.FLO.chart_init();
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
    
    sensor_remove = function(sensor_ID) {
        switch(sensor_ID) {
            case "ACC":
                if( $("#ACC_chartContainer").length > 0) { // If the chart exists, remove it
                    console.log("Removing accelerometer");
                    socket.emit('Remove Sensor', {command: "ACC_remove"});
                    $("#ACC_chartContainer").remove();
                }    
                break;
            case "CO2":
                if( $("#CO2_chartContainer").length > 0) { // If the chart exists, remove it
                    console.log("Removing CO2 sensor");
                    socket.emit('Remove Sensor', {command: "CO2_remove"});
                    clearInterval(chart_controller.CO2.update_timer); // Stop update timer for chart
                    $("#CO2_chartContainer").remove();
                }                
                break;
            case "FLO":
                if( $("#FLO_chartContainer").length > 0) { // If the chart exists, remove it
                    console.log("Removing flow rate sensor");
                    socket.emit('Remove Sensor', {command: "FLO_remove"});
                    clearInterval(chart_controller.FLO.update_timer);
                    $("#FLO_chartContainer").remove();
                }    
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