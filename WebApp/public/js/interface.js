// Ryker Dial
// University of Alaska, Fairbanks
// EE 444: Embedded Systems Design
// Web app client-side interface for sensor data transmission.

// Date Created: March 24, 2016
// Last Modified: April 7, 2016

// To add new sensors to the charting interface, there a two things you must do:
//     1. Add the sensor to the sensor_data object. Follow the examples, use a 
//            unique three digit sensor identifier.
//     2. Create the chart initialization function in the chart initialization
//            functions section further down. There are factory functions for sensors
//            with one or three datasets; those with a different number of datasets
//            will require you to write your own. Look at the factory functions for
//            examples.


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
        FLX: {}, // Flex Sensors
        HUM: {}, // Humidity Sensors
        PSR: {}, // Pressure Sensors
        TCH: {}, // Touch Sensors
        TMP: {}  // Temperature Sensors
    };
    socket.on('Sensor Data', function (data) {
        for (var prop in data.data) {
            if (!data.data.hasOwnProperty(prop))
                continue;
            for (var prop1 in prop) {
                if (!prop.hasOwnProperty(prop1))
                continue;
                if(data.data[prop][++prop1]) // If the sensor has data, update sensor_data
                    sensor_data[prop][prop1] = data.data[prop][prop1];
            }
        }
        console.log(sensor_data);
    });
    // ********** End Received Data Processing Section **********
    
    //********* Begin Chart Control Section **********
    
    // Data structure to store chart control information.
    var chart_controller = {};

    // Get list of configured sensors from sensor_data and make complimentary list of
    //     chart controller objects.
    for (var prop in sensor_data) {
        if (!sensor_data.hasOwnProperty(prop))
            continue;
        chart_controller[prop] = {}
    }
    
    //Populate empty sensor chart control objects with needed objects, and create entry for sensor in add_menu
    for (var prop in chart_controller) {
        if (!chart_controller.hasOwnProperty(prop))
            continue;
        
        // Create add button
        var add_li = document.createElement("li");
        var add_li_id = prop + "_add";
        add_li.setAttribute("id", add_li_id);
        $( "#add_menu" ).append(add_li);
        var add_a = document.createElement("a");
        add_a.setAttribute("onclick", "sensor_add('" + prop + "')");
        add_a.setAttribute("href", "#");
        add_a.innerHTML = prop
        $( "#" + add_li_id ).append(add_a);
        
        chart_controller[prop] = {
            numMeas: {},
            tVal: {},
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
        animation: false,
        animationSteps: 20,
        pointDot: false,
        scaleShowHorizontalLines: false,
        scaleShowVerticalLines: false,
        showTooltips: false,
        legendTemplate : "<ul class=\"<%=name.toLowerCase()%>-legend\"><% for (var i=0; i<datasets.length; i++){%><span style=\"display:inline; padding-left:20px\"></span><span style=\"display:inline-block; height: 16px; width:16px; background-color:<%=datasets[i].strokeColor%>\"></span><span style=\"display:inline; padding-left:5px;\"><%if(datasets[i].label){%><%=datasets[i].label%><%}%><%}%></span></ul>"

    }

    // ***** Begin Chart Initialization Functions *****
    // To create the chart initialization function for a sensor with only one dataset, call the function
    //     single_dataset_chart_factory, with parameters for the ID, the sensor module number, and a header
    //     to describe the data. Examples are below.
    chart_controller.ACC.chart_init = function(sensorMod_num) {
        triple_dataset_chart_factory("ACC", sensorMod_num, "XYZ Force Components (m/s^2) vs. Time (s)");
    }
    chart_controller.CO2.chart_init = function(sensorMod_num) {
        single_dataset_chart_factory("CO2", sensorMod_num, "Concentration (ppm) vs. Time (s)");
    }
    chart_controller.FLO.chart_init = function(sensorMod_num) {
        single_dataset_chart_factory("FLO", sensorMod_num, "Flow Rate (lpm) vs. Time (s)");
    }
    chart_controller.FLX.chart_init = function(sensorMod_num) {
        single_dataset_chart_factory("FLX", sensorMod_num, "Flex () vs. Time (s)");
    }
    chart_controller.HUM.chart_init = function(sensorMod_num) {
        single_dataset_chart_factory("HUM", sensorMod_num, "Humidity (%) vs. Time (s)");
    }
    chart_controller.PSR.chart_init = function(sensorMod_num) {
        single_dataset_chart_factory("PSR", sensorMod_num, "Pressure (mbar) vs. Time (s)");
    }
    chart_controller.TCH.chart_init = function(sensorMod_num) {
        single_dataset_chart_factory("TCH", sensorMod_num, "Touch () vs. Time (s)");
    }
    chart_controller.TMP.chart_init = function(sensorMod_num) {
        single_dataset_chart_factory("TMP", sensorMod_num, "Temperature (C) vs. Time (s)");
    }
    // ***** End Chart Initialization Functions *****

    // When sensor_add is called, it creates charts for ALL detected sensors of chosen type.
    //     You can remove these individually using sensor_remove.
    sensor_add = function(ID) {
        if( sensor_data[ID] ) { // If sensor exists
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
    
    // Makes initialization functions for sensors with only one dataset
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
            ID + " Data, Sensor Module " + sensorMod_num + ": " + header;
        $( '#' + chart_div_id ).append(chart_header);
        
        
        var canvas = document.createElement("canvas");
        canvas_id = ID + "_chartContainer" + sensorMod_num;
        canvas.setAttribute("id", canvas_id);
        canvas.width = 700;
        canvas.height = 300;
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
        chart_controller[ID].tVal[sensorMod_num] = 0;
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
                [chart_controller[ID].data_points[sensorMod_num].datasets[0].data[chart_controller[ID].data_points[sensorMod_num].datasets[0].data.length-1]], //""
                    (chart_controller[ID].numMeas[sensorMod_num])%(1000/(chart_controller.update_interval)) == 0 ? (chart_controller[ID].numMeas[sensorMod_num]*chart_controller.update_interval/1000.) : ""
            );           
            if(chart_controller[ID].data_points[sensorMod_num].datasets[0].data.length > chart_controller.num_seconds*(1000/(chart_controller.update_interval)) ) { // 2.5 seconds
                chart_controller[ID].data_points[sensorMod_num].datasets[0].data.shift(); // shift data array so it doesn't grow boundlessly.
                chart_controller[ID].chart[sensorMod_num].removeData(); // pop data points off the left of the chart
            }
        }
        // update chart after specified time interval
        chart_controller[ID].update_timer[sensorMod_num] = setInterval(function(){chart_controller[ID].updateChart[sensorMod_num]()}, chart_controller.update_interval);
    }
    
    // Makes initialization functions for sensors with three datasets. Assumes first dataset is x,
    //     second dataset is y, and third dataset is z.
    var triple_dataset_chart_factory = function(ID, sensorMod_num, header) {
        
       // Create container for chart
        var chart_div = document.createElement("div");
        var chart_div_id = ID + "_container" + sensorMod_num;
        chart_div.setAttribute("id", chart_div_id);
        chart_div.setAttribute("class", "panel panel-default");
        $( "#chartContainer" ).append(chart_div);
         
        var chart_header = document.createElement("div");
        chart_header.setAttribute("class", "panel-heading");
        chart_header.innerHTML = 
            ID + " Data, Sensor Module " + sensorMod_num + ": " + header;
        $( '#' + chart_div_id ).append(chart_header);
        
        
        var canvas = document.createElement("canvas");
        canvas_id = ID + "_chartContainer" + sensorMod_num;
        canvas.setAttribute("id", canvas_id);
        canvas.width = 700;
        canvas.height = 300;
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
        chart_controller[ID].tVal[sensorMod_num] = 0;
        chart_controller[ID].data_points[sensorMod_num] = {
            labels: [0],
            datasets: [{
                label: "x-axis",
                strokeColor: "#00BFFF",
                fillColor: "rgba(0,0,0,0)",
                data: []
            },
            {
                label: "y-axis",
                strokeColor: "#B22222",
                fillColor: "rgba(0,0,0,0)",
                data: []
            },
            {
                label: "z-axis",
                strokeColor: "#78AB46",
                fillColor: "rgba(0,0,0,0)",
                data: []
            }]
        }
        
        chart_controller[ID].chart[sensorMod_num] = new Chart(
            document.getElementById(ID + '_chartContainer' + sensorMod_num).getContext('2d')).Line(chart_controller[ID].data_points[sensorMod_num], 
            chart_controller.chart_options
        );
        
        var legend = chart_controller[ID].chart[sensorMod_num].generateLegend();
        $( '#' + chart_div_id ).append(legend);
        
        chart_controller[ID].updateChart[sensorMod_num] = function () {
            chart_controller[ID].data_points[sensorMod_num].datasets[0].data.push(sensor_data[ID][sensorMod_num].x);
            chart_controller[ID].data_points[sensorMod_num].datasets[1].data.push(sensor_data[ID][sensorMod_num].y);
            chart_controller[ID].data_points[sensorMod_num].datasets[2].data.push(sensor_data[ID][sensorMod_num].z);
            ++chart_controller[ID].numMeas[sensorMod_num];
            chart_controller[ID].chart[sensorMod_num].addData(
                [
                    chart_controller[ID].data_points[sensorMod_num].datasets[0].data[chart_controller[ID].data_points[sensorMod_num].datasets[0].data.length-1],
                    chart_controller[ID].data_points[sensorMod_num].datasets[1].data[chart_controller[ID].data_points[sensorMod_num].datasets[1].data.length-1],
                    chart_controller[ID].data_points[sensorMod_num].datasets[2].data[chart_controller[ID].data_points[sensorMod_num].datasets[2].data.length-1]
                ], 
                //""
                (chart_controller[ID].numMeas[sensorMod_num])%(1000/(chart_controller.update_interval)) == 0 ? (chart_controller[ID].numMeas[sensorMod_num]*chart_controller.update_interval/1000.) : ""
            )
           
            if(chart_controller[ID].data_points[sensorMod_num].datasets[0].data.length > chart_controller.num_seconds*(1000/(chart_controller.update_interval)) ) {
                chart_controller[ID].data_points[sensorMod_num].datasets[0].data.shift(); // shift data array so it doesn't grow boundlessly.
                chart_controller[ID].data_points[sensorMod_num].datasets[1].data.shift();
                chart_controller[ID].data_points[sensorMod_num].datasets[2].data.shift();
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