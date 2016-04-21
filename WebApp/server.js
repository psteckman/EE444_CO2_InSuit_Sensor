// server.js. Node server for data capture and charting web app.
// Copyright (C) Ryker Dial 2016
// University of Alaska, Fairbanks; EE444: Embedded Systems Design
// Email Contact: rldial@alaska.edu
// Date Created: March 24, 2016
// Last Modified: April 19, 2016


// *************************** LICENSE ************************************* 
// This program is free software: you can redistribute it and/or modify
// it under the terms of the GNU General Public License as published by
// the Free Software Foundation, either version 3 of the License, or
// (at your option) any later version.

// This program is distributed in the hope that it will be useful,
// but WITHOUT ANY WARRANTY; without even the implied warranty of
// MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
// GNU General Public License for more details.

// You should have received a copy of the GNU General Public License
// along with this program.  If not, see <http://www.gnu.org/licenses/>.
// *************************************************************************


// ******************************* Info & Instructions for Modification ****************************************************************
// This server parses data received over the serial port(s) at a frequency of 100 Hz, and sends the
//     data to any connected clients at a frequency of 20 Hz. Upon command from a client, it also
//     starts saving the data to a JSON file at 100 Hz; this can be toggled on and off. 
// The received serial data packets can contain data from any number of sensors (as long as the baud rate can support it).
//     Each sensor "partition" must begin with 1 byte specifying the sensor module number and one byte specifying the sensor ID,
//     and end with CR LF, with the sensor data in between. 
//     The following is an example packet (brackets are for illustrative purposes and are not a part of the packet):
// 
//         [CRLF][1][1][4][8][15][CRLF][1][2][16][CRLF][3][3][23][CRLF][3][2][42][CRLF]
//
//     This packet contains data for four sensors. The first sensor has a module number of 1 and an ID of 1, so it is an
//     accelerometer attached to sensor module 1. It has twelve bytes of data, four bytes per axis; the x-axis data has a value
//     of 4, the y-axis a value of 8, and the z-axis a value of 15. The second sensor is a CO2 sensor attached to sensor
//     module 1, with two bytes of data with a value of 16. The third sensor is a FLO sensor attached to sensor module 3, 
//     and the fourth sensor is CO2 sensor attached to sensor module 3.

// To add new sensors for data capture, do the following:
//     1. Add the unique 3-digit identifier for the sensor to the sensor_IDs array below. Note,
//            the ID's index in the array must correspond to the 1-byte ID of the sensor.
//     2. Add the unique 3-digit identifier for the sensor to the sensor_data object below.
//     3. Add multiplier for the data to sensor_data_multipliers. Use 1 if no multiplier.
//     4. Add a case to the switch statement in parse_serial_packet to parse the data. For a sensor
//            with one or three datasets, just stack the label ontop of the appropriate existing
//            label.
//     5. If you want to chart the data, make sure to make the appropriate changes to interface.js
//     6. Make sure the serial packets use the format specified above.
// ************************************************************************************************************************************

// Initialize express and server
var express = require('express'),
	app = express(),
	server = require('http').createServer(app),
	io = require('socket.io').listen(server);
server.listen(8081);

// Set '/public' as the static folder. Any files there will be directly sent to the viewer
app.use(express.static(__dirname + '/public'));

// Set index.html as the base file
app.get('/', function (req, res) {
  	res.sendfile(__dirname + '/index.html');
});

// IDs for sensors
var sensor_IDs = [
    //"",    // Don't use index 0
    "",    // Don't use index 0
    "ACC", // Accelerometer
    "CO2", // CO2 Sensor
    "FLO", // Flow Rate Sensor
    "FLX", // Flex Sensor
    "HUM", // Humidity Sensor
    "PSR", // Pressure Sensor
    "TCH", // Touch Sensor
    "TMP"  // Temperature Sensor
];

var sensor_data_multipliers = {
    ACC: 1/10,  // Received data is milli-G's*10
    CO2: 100,   // Received data multiplier depends upon sensor measurement range (adjust according to what sensor you use):
                //     0-5% => ppm
                //     0-20% => ppm/10
                //     0-100% => ppm/100
    FLO: 1,
    FLX: 1, 
    HUM: 1, 
    PSR: 1, 
    TCH: 1,
    TMP: 1/10   // Received data is Celsius*10
};

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
};

// ***** Setup JSON file writing for sensor data capture. *****
var jsonfile = require('jsonfile');
var file = 'sensor_data/sensor_data.json';

var Server_Start_Timestamp = "Session Started " + Date();

// Write timestamp to file, clearing data from previous session
jsonfile.writeFile(file, Server_Start_Timestamp, {flag: "w"}, function (err) {
    if(!(err == null)) console.error(err);
});

var data_capture_timer = false; // Stores reference to data capture timer so it can be toggled at will
var millis_begin; // Stores the number of milliseconds since 01/01/1970. Set at start of data capture to calculate relative time passage.


// ********** Websocket Setup Section **********

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
        if(!data_capture_timer) {
            console.log("Start Data Capture");
            var d = new Date();
            var millis_begin = d.getTime();
            var Begin_Record_Timestamp = "Started Data Capture " + Date();
            jsonfile.writeFile(file, Begin_Record_Timestamp, {flag: "a"}, function (err) {
                if(!(err === null)) console.error(err)
            });
            d = null; // Clean up
            data_capture_timer = setInterval( function() {
                var d = new Date();
                var time_curr = d.getTime() - millis_begin; // Calculate time in millis since start of capture
                d = null; // Clean up
                jsonfile.writeFile(file, {data: sensor_data, time: time_curr}, {flag: "a"}, function (err) {
                   if(!(err === null)) console.error(err);
                });
            }, 10);
        }
        else console.log("Error: Data Capture Already in Progress!");
	});
    
    // Stop writing sensor data to JSON file.
    socket.on('Stop Data Capture', function () {
		console.log("Stop Data Capture");
        var End_Record_Timestamp = "Ended Data Capture " + Date();
            jsonfile.writeFile(file, End_Record_Timestamp, {flag: "a"}, function (err) {
                console.error(err)
            });
        clearInterval(data_capture_timer);
        data_capture_timer = false; // New data capture can only begin if this is false
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

// Open serial ports specified on the command line
for(var i=0; i < serial_ports.port_names.length; ++i) {
    serial_ports.ports.push(
        new SerialPort(serial_ports.port_names[i], {
            baudRate: 921600,
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

// Open serial ports auto detected
serialport.list(function (err, ports) {
    ports.forEach(function(port) {
        
        if( doesExist(port.manufacturer) && ( port.manufacturer.match(/arduino/i) || port.manufacturer.match("Silicon_Labs") ) {
            console.log(port.manufacturer);
            serial_ports.ports.push(
                new SerialPort(port.comName, {
                    baudRate: 921600,
                    dataBits: 8,
                    parity: 'odd',
                    stopBits: 2,
                    flowControl: false, // RTSCTS,
                    parser: serialport.parsers.raw
            }));
            serial_ports.ports[serial_ports.ports.length-1].on('open', function () {
                console.log("Serial Port Open");
            });
            serial_ports.ports[serial_ports.ports.length-1].on('data', function(data) {
                parse_serial_packet(data);
            });
            serial_ports.ports[serial_ports.ports.length-1].on('error', function(err) {
                console.log(err);
            });
        }
  });
});
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
   // if( !doesExist(data[data_idx]) || !doesExist(data[data_idx+1]) || !doesExist(sensor_IDs[data[data_idx+1]]) ) {console.log("Does not exist"); return; }
    if( data[data_idx] != '\r'.charCodeAt(0) || data[data_idx + 1] != '\n'.charCodeAt(0) ) return; // {console.log("Missing Delimiters"); return; }; // Missing delimiters
    data_idx += 2;
    parse_exit: // breaking to this label will exit parse_serial_packet
    while(true) {
        // Exit if 
        if( !doesExist(data[data_idx]) || !doesExist(data[data_idx+1]) || !doesExist(sensor_IDs[data[data_idx+1]]) ) break parse_exit;
        
        var sensor_num = data[data_idx].toString();
        // Extract the data partition's ID from the received serial data packet
        var sensor_ID = sensor_IDs[data[data_idx+1]];
        switch(sensor_ID) {
            
            // Sensors with only one 8-bit unsigned integer of data.
            case "HUM":
                if( !doesExist(data[data_idx+3]) || !doesExist(data[data_idx+4]) ) break parse_exit; // Serial buffer out of bounds
                if( data[data_idx+3] != '\r'.charCodeAt(0) || data[data_idx + 4] != '\n'.charCodeAt(0) ) break parse_exit; // Missing delimiters
                sensor_data[sensor_ID][sensor_num] = data[data_idx+2]
                data_idx += 5;
                break;

            // Sensors with only one 16-bit unsigned integer of data.
            case "CO2":
            case "FLO":
            case "FLX":
            case "TCH":
            case "TMP":
                if( !doesExist(data[data_idx+4]) || !doesExist(data[data_idx+5]) ) break parse_exit; // Serial buffer out of bounds
                if( data[data_idx+4] != '\r'.charCodeAt(0) || data[data_idx + 5] != '\n'.charCodeAt(0) ) break parse_exit; // Missing delimiters
                sensor_data[sensor_ID][sensor_num] = 0; // Clear old data
                for( var i=data_idx+2; i < data_idx+4; ++i) {
                    sensor_data[sensor_ID][sensor_num] += data[i] << 8*(3+data_idx-i);
                }
                sensor_data[sensor_ID][sensor_num] = sensor_data[sensor_ID][sensor_num]*sensor_data_multipliers[sensor_ID]; // Apply Multiplier
                data_idx += 6;
                break;
                
            // Sensors with only one 32-bit unsigned integer of data.
            case "PSR":
                if( !doesExist(data[data_idx+6]) || !doesExist(data[data_idx+7]) ) break parse_exit; // Serial buffer out of bounds
                if( data[data_idx+6] != '\r'.charCodeAt(0) || data[data_idx + 7] != '\n'.charCodeAt(0) ) break parse_exit; // Missing delimiters
                sensor_data[sensor_ID][sensor_num] = 0; // Clear old data
                for( var i=data_idx+2; i < data_idx+6; ++i) {
                    sensor_data[sensor_ID][sensor_num] += data[i] << 8*(4+data_idx-i);
                }
                data_idx += 8;
                break;   
                
            // Sensors with three 32-bit integers of data.
            case "ACC":
                if( !doesExist(data[data_idx+14]) || !doesExist(data[data_idx+15]) ) break parse_exit; // Serial buffer out of bounds
                if( data[data_idx+14] != '\r'.charCodeAt(0) || data[data_idx + 15] != '\n'.charCodeAt(0) ) break parse_exit; // Missing delimiters
                sensor_data[sensor_ID][sensor_num] = {x:0, y: 0, z:0};

                var j = 3;
                for( var i = data_idx + 2; i < data_idx + 6; ++i ) {
                    sensor_data[sensor_ID][sensor_num].x += data[i] << 8*j--;
                }
                j=3;
                for( var i = data_idx + 6; i < data_idx + 10; ++i ) {
                    sensor_data[sensor_ID][sensor_num].y += data[i] << 8*j--;
                }
                j=3;
                for( var i = data_idx + 10; i < data_idx + 14; ++i ) {
                    sensor_data[sensor_ID][sensor_num].z += data[i] << 8*j--;
                }

                 switch(sensor_ID) {
                    case "ACC":
                        for(var i=0; i < 3; ++i) {
                            // Received data is signed
                            if(sensor_data[sensor_ID][sensor_num][String.fromCharCode(120+i)] > Math.pow(2,4*8)/2 - 1) {
                                 sensor_data[sensor_ID][sensor_num][String.fromCharCode(120+i)] = 
                                    sensor_data[sensor_ID][sensor_num][String.fromCharCode(120+i)] - Math.pow(2,4*8);
                            }
                            // Apply multiplier
                            sensor_data[sensor_ID][sensor_num][String.fromCharCode(120+i)] = 
                                sensor_data[sensor_ID][sensor_num][String.fromCharCode(120+i)]*sensor_data_multipliers[sensor_ID];
                        }
                        break;
                    default:
                        break;
                }
                data_idx += 16;
                break;
            // Sensor unrecognized, or at end of input
            default:
                break parse_exit;
        }
    }
    console.log(sensor_data);
};
// ********** End Serial Data Parser Section **********
