// Ryker Dial
// University of Alaska, Fairbanks
// EE 444: Embedded Systems Design
// Web app server for sensor data transmission.

// Date Created: March 24, 2016
// Last Modified: April 7, 2016

// Sources:
//     http://blog.derivatived.com/posts/Control-Your-Robot-With-Node.js-Raspberry-PI-and-Arduino/ 
//     https://itp.nyu.edu/physcomp/labs/labs-serial-communication/lab-serial-communication-with-node-js/
//     https://nodesource.com/blog/understanding-socketio/

// Initialize express and server
var express = require('express'),
	app = express(),
	server = require('http').createServer(app),
	io = require('socket.io').listen(server);
server.listen(8080);

// Set '/public' as the static folder. Any files there will be directly sent to the viewer
app.use(express.static(__dirname + '/public'));

// Set index.html as the base file
app.get('/', function (req, res) {
  	res.sendfile(__dirname + '/index.html');
});

// IDs for sensors
var sensor_IDs = [
    "ACC", // Accelerometer
    "CO2", // CO2 Sensor
    "FLO", // Flow Rate Sensor
    "FLX", // Flex Sensor
    "HUM", // Humidity Sensor
    "PSR", // Pressure Sensor
    "TCH", // Touch Sensor
    "TMP"  // Temperature Sensor
]

// // Setup saving data to csv.
// const fs = require('fs');
// var csv = require('ya-csv');

// // // Streams and writers for various sensors. Streams not opened until client specifies
// // //     that they are attached.
// var CO2_csv_stream;
// var CO2_csv_writer;

// // // var FLO_csv_stream;
// // // var FLO_csv_writer;

// var CO2_data = 0;

// // // // 
// CO2_csv_stream = fs.createWriteStream (
	// './sensor_data/CO2_concentration.csv', 
	// {
		// flags: 'a', // append data to existing file	
		// autoClose: true // File stream closes when error occurs or program ends
	// }
// );
// CO2_csv_writer = csv.createCsvStreamWriter(CO2_csv_stream);

    // var interval2 = setInterval(function() {
		// var time = data_controller.numintervals++*data_controller.update_interval/1000;
		// CO2_csv_writer.writeRecord([
			// time,
			// CO2_data
		// ]);
    // },10);
    // Start transmitting data to the client
    // var interval = setInterval(function() {
        // socket.emit('Sensor Data', {data: data_controller.sensor_data});
        // //console.log(data_controller.sensor_data);
        // data_controller.sensor_data = [];
        // //console.log(data_controller.sensor_data);
		// var time = data_controller.numintervals++*data_controller.update_interval/1000;
		// CO2_csv_writer.writeRecord([
			// time,
			// CO2_data
		// ]);
		// // FLO_csv_writer.writeRecord([
			// // time,
			// // data_controller.sensor_data.FLO_data
		// // ]);
    // }, 10);
// FLO_csv_stream = fs.createWriteStream (
	// './sensor_data/flow_rate.csv', 
	// {
		// flags: 'a', // append data to existing file	
		// autoClose: true // File stream closes when error occurs or program ends
	// }
// );
// FLO_csv_writer = csv.createCsvStreamWriter(FLO_csv_stream);

// CO2_csv_writer.writeRecord(['Time (s)', 'CO2 Concentration (ppm)']);
// FLO_csv_writer.writeRecord(['Time (s)', 'Flow Rate']);

// This function is called upon establishing a connection with a client
io.sockets.on('connection', function (socket) {
	// Send verification message to client
	socket.emit('Connected to server', { data: 0 });
    
    // Transmit data to client once every 50 milliseconds
    var sendToWeb_timer = setInterval( function() {
        socket.emit('Sensor Data', {data: data_controller.sensor_data});
        //console.log(data_controller.sensor_data);
    }, 50);
    
    // ***** Server commands *****
    // Start writing sensor data to csv files.
	socket.on('Start Data Capture', function () {
		console.log("Start Data Capture");
	});
    
    // Stop writing sensor data to csv files
    socket.on('Stop Data Capture', function () {
		console.log("Stop Data Capture");
	});
});

// Set up the serial connection. 
var serialport = require('serialport'); // include the library
var SerialPort = serialport.SerialPort; // make a local instance

var serial_ports = {
    port_names: [],
    ports: []
};

// Get serial port names from command line
for(var i = 2; i < process.argv.length; ++i) {
    serial_ports.port_names.push(process.argv[i]);
}

for(var i=0; i < serial_ports.port_names.length; ++i) {
    serial_ports.ports.push(
        new SerialPort(serial_ports.port_names[i], {
            baudRate: 460800,
            dataBits: 8,
            parity: 'none',
            stopBits: 1,
            flowControl: false, // RTSCTS,
    }));
    serial_ports.ports[i].on('open', function () {
        console.log("Serial Port Open");
    });
    serial_ports.ports[i].on('data', parse_serial_packet);
         
}

// Stores control information for incoming and outgoing data streams
var data_controller = {
	numintervals: 0, // Keeps track of number of transmissions for timing purposes
    // Holds sensor data.
    sensor_data: {
        ACC: {}, 
        CO2: {}, 
        FLO: {}, 
        FLX: {}, 
        HUM: {}, 
        PSR: {}, 
        TCH: {},
        TMP: {}
    }
    // How many bytes of data per sensor
};

// Identifies the next partition of data in the serial packet and converts it to JSON
function parse_serial_packet(data) {
    // Extract the data partition's ID from the received serial data packet
    var data_idx=0; // location of parser in data stream
    parse_exit: // breaking to this label will exit parse_serial_packet
    while(true) {
        var sensor_num = data[data_idx];
        var sensor_ID = sensor_IDs[data[data_idx+1]];
        switch(sensor_ID) {
            // Sensors with only one 16-bit integer of data.
            case "CO2":
            case "FLO":
            case "FLX":
            case "HUM":
            case "PSR":
            case "TCH":
            case "TMP":
                if( data[data_idx+4] != '\r'.charCodeAt(0) || data[data_idx + 5] != '\n'.charCodeAt(0) ) break parse_exit; // Missing delimiters
                data_controller.sensor_data[sensor_ID][sensor_num] = 0; // Clear old data
                for( var i=data_idx+2; i < data_idx+4; ++i) {
                    data_controller.sensor_data[sensor_ID][sensor_num] += data[i] << 8*(3+data_idx-i);
                }
                data_idx += 6;
                break;
            // Sensors with three 16-bit integers of data.
            case "ACC":
                if( data[data_idx+8] != '\r'.charCodeAt(0) || data[data_idx + 9] != '\n'.charCodeAt(0) ) break parse_exit; // Missing delimiters
                data_controller.sensor_data[sensor_ID][sensor_num] = {x:0, y: 0, z:0};
                for(var i=1; i <= 3; ++i) {
                    for( var j=data_idx+2*i; j < data_idx+2*(i+1); ++j) {
                        data_controller.sensor_data[sensor_ID][sensor_num][String.fromCharCode(120+i-1)] += data[j] << 8*(3+data_idx-j+2*(i-1));
                    }
                }
                data_idx += 10;
                break;
            default:
                break parse_exit;
        }
    }
}