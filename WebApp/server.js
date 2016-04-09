// Ryker Dial
// University of Alaska, Fairbanks
// EE 444: Embedded Systems Design
// Web app server for sensor data transmission.

// Date Created: March 24, 2016
// Last Modified: April 9, 2016

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
    "",    // Don't use index 0
    "ACC", // Accelerometer
    "CO2", // CO2 Sensor
    "FLO", // Flow Rate Sensor
    "FLX", // Flex Sensor
    "HUM", // Humidity Sensor
    "PSR", // Pressure Sensor
    "TCH", // Touch Sensor
    "TMP"  // Temperature Sensor
]

// Stores sensor data
var sensor_data = {
    ACC: {}, 
    CO2: {}, 
    FLO: {}, 
    FLX: {}, 
    HUM: {}, 
    PSR: {}, 
    TCH: {},
    TMP: {}
}
var jsonfile = require('jsonfile');
var file = 'sensor_data/data.json';

var Server_Start_Timestamp = "Session Started " + Date();

// Write timestamp to file, clearing data from previous session
jsonfile.writeFile(file, Server_Start_Timestamp, {flag: "w"}, function (err) {
    console.error(err);
});

var data_capture_timer; // Stores reference to data capture timer so it can be toggled at will
var millis_begin; // Stores the number of milliseconds since 01/01/1970. Set at start of data capture to calculate relative time passage.

// This function is called upon establishing a connection with a client
io.sockets.on('connection', function (socket) {
	// Send verification message to client
	socket.emit('Connected to server', { data: 0 });
    
    // Transmit data to client once every 50 milliseconds
    var sendToWeb_timer = setInterval( function() {
        socket.emit('Sensor Data', {data: sensor_data});
    }, 50);
    
    socket.on("error", function(message) {
        console.log( "error in transport: " + message);
    });
    
    // ***** Begin Server Commands Section *****
    
    // Start writing sensor data to JSON file.
	socket.on('Start Data Capture', function () {
		console.log("Start Data Capture");
        var d = new Date();
        var millis_begin = d.getTime();
        var Begin_Record_Timestamp = "Started Data Capture " + Date();
        jsonfile.writeFile(file, Begin_Record_Timestamp, {flag: "a"}, function (err) {
            console.error(err)
        });
        d = null; // Clean up
        data_capture_timer = setInterval( function() {
            var d = new Date();
            var time_curr = d.getTime() - millis_begin; // Calculate time in millis since start of capture
            d = null; // Clean up
            jsonfile.writeFile(file, {data: sensor_data, time: time_curr}, {flag: "a"}, function (err) {
                console.error(err)
            });
        }, 10);
	});
    
    // Stop writing sensor data to JSON file.
    socket.on('Stop Data Capture', function () {
		console.log("Stop Data Capture");
        var End_Record_Timestamp = "Ended Data Capture " + Date();
            jsonfile.writeFile(file, End_Record_Timestamp, {flag: "a"}, function (err) {
                console.error(err)
            });
        clearInterval(data_capture_timer);
	});
    // ***** End Server Commands Section *****
});


// ********** Begin Setup of Serial Connections **********

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

// Open serial ports
for(var i=0; i < serial_ports.port_names.length; ++i) {
    serial_ports.ports.push(
        new SerialPort(serial_ports.port_names[i], {
            baudRate: 460800,
            dataBits: 8,
            parity: 'odd',
            stopBits: 2,
            flowControl: false, // RTSCTS,
            parser: serialport.parsers.raw
    }));
    serial_ports.ports[i].on('open', function () {
        console.log("Serial Port Open");
    });
    serial_ports.ports[i].on('data', function(data) {
        parse_serial_packet(data);
    });   
}
// ********** End Setup of Serial Connections **********


// ********** Begin Serial Data Parser Section **********

// Helper function for parse_serial_packet. Returns false if the passed variable is
//     undefined or null.
var doesExist = function (variable) {
    if( typeof variable === "undefined" || variable === null) return false;
    return true;
};

// Identifies the next partition of data in the serial packet and converts it to JSON
var parse_serial_packet = function (data) {
    
    var data_idx=0; // location of parser in data stream
    parse_exit: // breaking to this label will exit parse_serial_packet
    while(true) {
        // Exit if 
        if( !doesExist(data[data_idx]) || !doesExist(data[data_idx+1]) || !doesExist(sensor_IDs[data[data_idx+1]]) ) break parse_exit;
        
        var sensor_num = data[data_idx].toString();
        // Extract the data partition's ID from the received serial data packet
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
                if( !doesExist(data[data_idx+4]) || !doesExist(data[data_idx+5]) ) break parse_exit; // Serial buffer out of bounds
                if( data[data_idx+4] != '\r'.charCodeAt(0) || data[data_idx + 5] != '\n'.charCodeAt(0) ) break parse_exit; // Missing delimiters
                sensor_data[sensor_ID][sensor_num] = 0; // Clear old data
                for( var i=data_idx+2; i < data_idx+4; ++i) {
                    sensor_data[sensor_ID][sensor_num] += data[i] << 8*(3+data_idx-i);
                }
                data_idx += 6;
                break;
                
            // Sensors with three 16-bit integers of data.
            case "ACC":
                if( !doesExist(data[data_idx+8]) || !doesExist(data[data_idx+9]) ) break parse_exit; // Serial buffer out of bounds
                if( data[data_idx+8] != '\r'.charCodeAt(0) || data[data_idx + 9] != '\n'.charCodeAt(0) ) break parse_exit; // Missing delimiters
                sensor_data[sensor_ID][sensor_num] = {x:0, y: 0, z:0};
                for(var i=1; i <= 3; ++i) {
                    for( var j=data_idx+2*i; j < data_idx+2*(i+1); ++j) {
                        sensor_data[sensor_ID][sensor_num][String.fromCharCode(120+i-1)] += data[j] << 8*(3+data_idx-j+2*(i-1));
                    }
                }
                data_idx += 10;
                break;
            // Sensor unrecognized, or at end of input
            default:
                break parse_exit;
        }
    }
    console.log(sensor_data);
};
// ********** End Serial Data Parser Section **********