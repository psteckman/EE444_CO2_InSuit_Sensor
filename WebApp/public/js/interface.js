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
        // Send out a message to the server
        socket.emit('Client connected', { data: 0 });
    });
    
    // ********** Begin Received Data Processing Section **********
    // Holds received sensor data. 
    var sensor_data = {
        ACC: {}, // Accelerometers
        CO2: {}, // CO2 Sensors
        FLO: {}, // Flow Rate Sensors
        PSR: {}, // Pressure Sensors
        TMP: {} // Temperature Sensors
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
                case "PSR":
                    sensor_data.PSR[item.sensorMod_num] = item.data;
                    break
                case "TMP":
                    sensor_data.TMP[item.sensorMod_num] = item.data;
                    break;
                default:
                    break;
            }
       });
    });
    // ********** End Received Data Processing Section **********
    
    
    //********* Begin Chart Control Section **********
    
    // Data structure to store chart control information.
    var chart_controller = {
        // To add a new type of sensor chart, first add it here.
        ACC: {},
        CO2: {},
        FLO: {},
        PSR: {},
        TMP: {}
    };

    //Populate empty sensor chart control objects with needed objects
    for (var prop in chart_controller) {
        if (!chart_controller.hasOwnProperty(prop))
            continue;
        chart_controller[prop] = {
            numMeas: {},
            xVal: {},
            data_points: {},
            chart: {},
            updateChart: {},
            update_timer: {}
        }
    }

    chart_controller.update_interval = 50; // How often to update the chart
    chart_controller.num_seconds = 3; // Number of seconds of data charted at once

    // Global options for charts.
    chart_controller.chart_options = {
        animation: true,
        pointDot: false,
        scaleShowHorizontalLines: false,
        scaleShowVerticalLines: false,
        showTooltips: false
    }

    // ***** Chart Initialization functions *****
    // To create the chart initialization function for a sensor with only one dataset, call the function
    //     single_dataset_chart_factory, with parameters for the ID, the sensor module number, and a header
    //     to describe the data. Examples are below.
    chart_controller.ACC.chart_init = function() {
        
    }
    chart_controller.CO2.chart_init = function(sensorMod_num) {
        single_dataset_chart_factory("CO2", sensorMod_num, "Concentration (ppm) vs. Time (s)");
    }
    chart_controller.FLO.chart_init = function(sensorMod_num) {
        single_dataset_chart_factory("FLO", sensorMod_num, "Flow Rate (lpm) vs. Time (s)");
    }
    chart_controller.PSR.chart_init = function(sensorMod_num) {
        single_dataset_chart_factory("PSR", sensorMod_num, "Pressure (Pa) vs. Time (s)");
    }
    chart_controller.TMP.chart_init = function(sensorMod_num) {
        single_dataset_chart_factory("TMP", sensorMod_num, "Temperature (C) vs. Time (s)");
    }

    // When sensor_add is called, it creates charts for ALL detected sensors of chosen type.
    //     You can remove these individually using sensor_remove.
    sensor_add = function(ID) {
        if( sensor_data[ID] ) {
            for (var prop in sensor_data[ID]) {
                if (!sensor_data[ID].hasOwnProperty(prop)) continue; // check if prop is not a direct prop
                
                // If chart not there, create it
                if( $('#' + ID + "_chartContainer" + prop).length == 0) chart_controller[ID].chart_init(prop);
            }
        }
    }

    // Remove specified sensor, if it exists
    sensor_remove = function(ID, sensorMod_num) {
        if( $( '#' + ID + "_chartContainer" + sensorMod_num).length > 0) { // If the chart exists, remove it
            console.log("Removing "+ ID + " " + sensorMod_num);
            clearInterval(chart_controller[ID].update_timer[sensorMod_num]); // Stop update timer for chart
            chart_controller[ID].chart[sensorMod_num].destroy(); // Clean up chart
            $('#' + ID + "_container" + sensorMod_num).remove();
            $('#' + ID + "_remove" + sensorMod_num).remove();
        } 
    }
    
    // Helper function for chart initialization function
    // Makes initialization functions
    var single_dataset_chart_factory = function(ID, sensorMod_num, header) {
        
       // Create container for chart
        var chart_div = document.createElement("div");
        var chart_div_id = ID + "_container" + sensorMod_num;
        chart_div.setAttribute("id", chart_div_id);
        chart_div.setAttribute("class", "panel panel-default");
        $( "#chartContainer" ).append(chart_div);
         
        var chart_header = document.createElement("div");
        chart_header.setAttribute("class", "panel-heading");
        chart_header.innerHTML = 
            ID + " Sensor Data, Sensor Module " + sensorMod_num + ": " + header;
        $( '#' + chart_div_id ).append(chart_header);
        
        
        var canvas = document.createElement("canvas");
        canvas_id = ID + "_chartContainer" + sensorMod_num;
        canvas.setAttribute("id", canvas_id);
        canvas.setAttribute("width", "700");
        canvas.setAttribute("height", "300");
        $( '#' + chart_div_id ).append(canvas);
        // **********
        
        // Create removal button
        var remove_li = document.createElement("li");
        var remove_li_id = ID + "_remove" + sensorMod_num;
        remove_li.setAttribute("id", remove_li_id);
        $( "#remove_menu" ).append(remove_li);
        var remove_a = document.createElement("a");
        remove_a.setAttribute("onclick", "sensor_remove('" + ID + "', " + sensorMod_num + ")");
        remove_a.setAttribute("href", "#");
        remove_a.innerHTML = ID + " " + sensorMod_num;
        $( "#" + remove_li_id ).append(remove_a);
        
        chart_controller[ID].numMeas[sensorMod_num] = 0;
        chart_controller[ID].xVal[sensorMod_num] = 0;
        chart_controller[ID].data_points[sensorMod_num] = {
            labels: [0],
            datasets: [{
                strokeColor: "#00BFFF",
                fillColor: "rgba(0,0,0,0)",
                data: []  
            }]
        }
        
        chart_controller[ID].chart[sensorMod_num] = new Chart(
            document.getElementById(ID + '_chartContainer' + sensorMod_num).getContext('2d')).Line(chart_controller[ID].data_points[sensorMod_num], 
            chart_controller.chart_options
        );
        
        chart_controller[ID].updateChart[sensorMod_num] = function () {
            chart_controller[ID].data_points[sensorMod_num].datasets[0].data.push(sensor_data[ID][sensorMod_num]);
            ++chart_controller[ID].numMeas[sensorMod_num];
            chart_controller[ID].chart[sensorMod_num].addData(
                [chart_controller[ID].data_points[sensorMod_num].datasets[0].data[chart_controller[ID].data_points[sensorMod_num].datasets[0].data.length-1]], ""
            );           
            if(chart_controller[ID].data_points[sensorMod_num].datasets[0].data.length > chart_controller.num_seconds*(1000/(chart_controller.update_interval)) ) { // 2.5 seconds
                chart_controller[ID].data_points[sensorMod_num].datasets[0].data.shift(); // shift data array so it doesn't grow boundlessly.
                chart_controller[ID].chart[sensorMod_num].removeData(); // pop data points off the left of the chart
            }
        }
        // update chart after specified time interval
        chart_controller[ID].update_timer[sensorMod_num] = setInterval(function(){chart_controller[ID].updateChart[sensorMod_num]()}, chart_controller.update_interval);
    }
    // ********** End Chart Control Section **********
    
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