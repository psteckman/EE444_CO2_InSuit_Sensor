// Ryker Dial
// University of Alaska, Fairbanks
// EE 444: Embedded Systems Design
// Web app client-side interface for sensor data transmission.

// Date Created: March 24, 2016
// Last Modified: March 25, 2016

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
    
    var CO2_data = 0;
    socket.on('Sensor Data', function (data) {
        CO2_data = data.data.CO2_data;
		FLO_data = data.data.FLO_data;
        //console.log(data.data.CO2_data);
    });

    // Plot Sensor data in real time
    window.onload = function () {

        var dps = [{}]; // data points

        var chart = new CanvasJS.Chart("chartContainer",{
            title :{
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
                dataPoints : dps
            }]
        });

        chart.render();
        var updateInterval = 50; // 20 times a second
        var numMeas = 0;
        var xVal = 0; 

        var updateChart = function () {
            dps.push({x: xVal,y: CO2_data});
            ++numMeas;
            xVal = numMeas*updateInterval/1000.;
            if (dps.length >  100 ) { // 100 meas. is 5 sec
                dps.shift();                
            }

            chart.render();      
        };

        // update chart after specified time interval
        setInterval(function(){updateChart()}, updateInterval); 
		
		
        var dps1 = [{}]; // data points

        var chart1 = new CanvasJS.Chart("chartContainer1",{
            title :{
                text: "FLOW Sensor Data"
            },
            axisX: {                        
                title: "Time (s)"
            },
            axisY: {                        
                title: "Concentration (ppm)"
            },
            data: [{
                type: "line",
                dataPoints : dps1
            }]
        });

        chart1.render();
        var updateInterval1 = 50; // 20 times a second
        var numMeas1 = 0;
        var xVal1 = 0; 

        var updateChart1 = function () {
            dps1.push({x: xVal,y: FLO_data});
            ++numMeas1;
            xVal1 = numMeas1*updateInterval1/1000.;
            if (dps1.length >  100 ) { // 100 meas. is 5 sec
                dps1.shift();                
            }

            chart1.render();      
        };

        // update chart after specified time interval
        setInterval(function(){updateChart1()}, updateInterval); 			
    }
	
	// When a sensor is selected from the "Add Sensor" dropdown menu, the
	//     corresponding function from below is called to send the command
	//     to the server.
	ACC_add = function() {
		console.log("Adding accelerometer")
		socket.emit('Configure', {command: ACC_add});
	}
	CO2_add = function() {
		console.log("Adding CO2 sensor")
		socket.emit('Configure', {command: CO2_add});
	}
	FLO_add = function() {
		console.log("Adding flow rate sensor")
		socket.emit('Configure', {command: FLO_add});
	}
	GYR_add = function() {
		console.log("Adding gyroscope")
		socket.emit('Configure', {command: GYR_add});
	}
	MAG_add = function() {
		console.log("Adding magnetometer")
		socket.emit('Configure', {command: MAG_add});
	}
	
	// When a sensor is selected from the "Remove Sensor" dropdown menu, the
	//     corresponding function from below is called to send the command
	//     to the server.
	ACC_remove = function() {
		console.log("Removing accelerometer")
		socket.emit('Configure', {command: ACC_remove});
	}
	CO2_remove = function() {
		console.log("Removing CO2 sensor")
		socket.emit('Configure', {command: CO2_remove});
	}
	FLO_remove = function() {
		console.log("Removing flow rate sensor")
		socket.emit('Configure', {command: FLO_remove});
	}
	GYR_remove = function() {
		console.log("Removing gyroscope")
		socket.emit('Configure', {command: GYR_remove});
	}
	MAG_remove = function() {
		console.log("Removing magnetometer")
		socket.emit('Configure', {command: MAG_remove});
	}
	
	// Tell the server to start saving sensor data to csv
	data_capture_start = function() {
		console.log("Start Data Capture")
		socket.emit('Start Data Capture', {command: data_capture_start});
	}

	// Tell the server to stop saving sensor data to csv	
	data_capture_stop = function() {
		console.log("Start Data Capture")
		socket.emit('Start Data Capture', {command: data_capture_stop});
	}
});