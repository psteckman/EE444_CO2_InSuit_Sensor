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
        var updateInterval1 = 10; // 20 times a second
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
});



// ***** Examples of how to send commands to the serverS
   /* // These buttons control the movement of the robot
    $('#robot_forward').mousedown(function () {
        console.log("Button Pressed");
        socket.emit('robot command', { command: 'forward' });
    }).mouseup(function () {
        console.log("Button Released");
        socket.emit('robot command', { command: 'stop' });        
    });
    $('#robot_left').click(function () {
        console.log("Button Clicked");
        socket.emit('robot command', { command: 'left' });
    });
    $('#robot_center').click(function () {
        console.log("Button Clicked");
        socket.emit('robot command', { command: 'center' });
    });
    $('#robot_stop').click(function () {
        console.log("Button Clicked");
        socket.emit('robot command', { command: 'stop' });
    });
    $('#robot_right').click(function () {
        console.log("Button Clicked");
        socket.emit('robot command', { command: 'right' });
    });
    $('#robot_backward').mousedown(function () {
        console.log("Button Pressed");
        socket.emit('robot command', { command: 'backward' });
    }).mouseup(function () {
        socket.emit('robot command', { command: 'stop' });
    });

    //var robot_drive_power;
    $(function() {
        $( "#drive_power_slider" ).slider({
            range: "min",
            value: 10,
            min: 0,
            max: 22,
            slide: function( event, ui ) {
                $( "#drive_power" ).val( ui.value );
            }
        });
        $( "#drive_power" ).val( $( "#drive_power_slider" ).slider( "value" ) );
    });

    $('#set_drive_power').click(function () {
        console.log("Button Clicked");
        var robot_drive_power = $( "#drive_power_slider" ).slider( "value" );

        // For a Sabertooth motor controller using simplified serial,
        // each motor has 7 bits of resolution, giving both its
        // forward and backward movement a range of 63.
        socket.emit('robot command', { 
            command: 'set_power', 
            power: robot_drive_power 
        });
    });


    // Control LED Color
    $(".basic").spectrum({
        color: "#000",
        change: function (color) {
            socket.emit('robot command', { 
                command: 'LED', 
                red: color._r, 
                green: color._g,
                blue: color._b
            });
        }
    });
    $('#off').click(function () {
    	console.log("Button Clicked");
        socket.emit('robot command', { 
            command: 'LED', 
            red: 0, 
            green: 0,
            blue: 0
        });
    });*/

