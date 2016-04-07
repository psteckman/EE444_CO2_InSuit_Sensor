// Ryker Dial
// University of Alaska, Fairbanks
// EE 444: Embedded Systems Design
// Web app server for sensor data transmission.

// Date Created: March 24, 2016
// Last Modified: April 6, 2016

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

// // Setup saving data to csv.
// const fs = require('fs');
// var csv = require('ya-csv');

// // Streams and writers for various sensors. Streams not opened until client specifies
// //     that they are attached.
// var CO2_csv_stream;
// var CO2_csv_writer;

// var FLO_csv_stream;
// var FLO_csv_writer;

// // 
// CO2_csv_stream = fs.createWriteStream (
	// './sensor_data/CO2_concentration.csv', 
	// {
		// flags: 'a', // append data to existing file	
		// autoClose: true // File stream closes when error occurs or program ends
	// }
// );
// CO2_csv_writer = csv.createCsvStreamWriter(CO2_csv_stream);

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

    // Start transmitting data to the client
    var interval = setInterval(function() {
        socket.emit('Sensor Data', {data: data_controller.sensor_data});
        //console.log(data_controller.sensor_data);
		var time = data_controller.numintervals++*data_controller.update_interval/1000;
		// CO2_csv_writer.writeRecord([
			// time,
			// data_controller.sensor_data.CO2_data
		// ]);
		// FLO_csv_writer.writeRecord([
			// time,
			// data_controller.sensor_data.FLO_data
		// ]);
    }, data_controller.update_interval);
    
    // ***** Server commands section
    
    // // Add sensors
    // socket.on('Add Sensor', function (data) {
        // switch(data.command) {
            // case "ACC_add":
            
                // break;
            // case "CO2_add":
            
                // break;
            // case "FLO_add":
            
                // break;
            // case "GYR_add":
            
                // break;
            // case "MAG_add":
            
                // break;
            // default:
                // break;
        // }
    // });
    
    // // Remove sensors
    // socket.on('Remove Sensor', function (data) {
        // switch(data.command) {
            // case "ACC_remove":
            
                // break;
            // case "CO2_remove":
            
                // break;
            // case "FLO_remove":
            
                // break;
            // case "GYR_remove":
            
                // break;
            // case "MAG_remove":
            
                // break;
            // default:
                // break;
        // }
    // });
    
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
for(i = 2; i < process.argv.length; ++i) {
    serial_ports.port_names.push(process.argv[i]);
}

for(i=0; i < serial_ports.port_names.length; ++i) {
    serial_ports.ports.push(
        new SerialPort(serial_ports.port_names[i], {
            baudRate: 115200,
            dataBits: 8,
            parity: 'none',
            stopBits: 1,
            flowControl: false
    }));
    serial_ports.ports[i].on('data', prepareClientPacket);
         
}

// Stores control information for incoming and outgoing data streams
var data_controller = {
    ID_size: 4, // Size in bytes of sensor data ID used to partition packet received over serial.
                //     1 byte number to identify sensor module and 3 character code to ID sensor type
    int_size: 2, // Sensors report data values as 16-bit integers (2 bytes)
    data_idx: 0, // location of parser extracting sensor data from packet received over serial.
    update_interval: 50, // How often the server sends sensor data to the client.
	numintervals: 0, // Keeps track of number of transmissions for timing purposes
    // Holds sensor data.
    sensor_data: [],
    // sensor_data: {
        // ACC: {x:0, y:0, z:0},
        // CO2: 0,
        // FLO: 0,
        // //GYR: {},
        // MAG: {x:0, y:0, z:0}
    // },
    // How many bytes of data per sensor
    data_bytes: {
        ACC: 6,
        CO2: 2,
        FLO: 2,
        //GYR: 6,
        MAG: 6
    }
};

// // Number of sensor data bytes per partition. Must be some power of 2.
// data_controller.data_bytes = data_controller.part_size - data_controller.ID_size;  

// Parses the received serial packet to JSON so it may be sent to the Client
function prepareClientPacket(data) {
    // calculate checksum here
    
    // JavaScript has no pass-by-reference, so wrap data index in object to emulate p-b-r
    var container = {};
    container.data_idx = 0; // Keeps track of current location in serial data stream

    data_controller.sensor_data = []; // clear old sensor data
    
   while(data[container.data_idx]) {
        parse_serial_data(data, container);
   }
}

// Identifies the next partition of data in the serial packet and converts it to JSON
function parse_serial_data(data, container) {
    // Extract the data partition's ID from the received serial data packet
    
   // var data_sensorMod_num = data[container.data_idx];
    var data_ID = "";
    for(j=container.data_idx+1; j<container.data_idx+data_controller.ID_size; ++j) {
        data_ID = data_ID.concat(String.fromCharCode(data[j]));
    }
    
    data_controller.sensor_data.push({
        sensorMod_num: data[container.data_idx],
        ID: data_ID,
        data: 0
    });

     switch(data_ID) {
         
        // Three-axis accelerometer. Data packet consists of three 16-bit integers. 
        case "ACC":
            data_controller.sensor_data[data_controller.sensor_data.length-1].data = {x: 0, y:0, z:0};
            // Read in x-axis data from packet.
            for(j=0; j < data_controller.int_size; ++j) {
                data_controller.sensor_data[data_controller.sensor_data.length-1].data.x += 
                    data[container.data_idx+data_controller.ID_size+j]
                    << 8*(data_controller.int_size-(j+1));
            }
            // Convert to signed number.
            if(data_controller.sensor_data[data_controller.sensor_data.length-1].data.x > Math.pow(2,data_controller.int_size*8)/2 - 1) {
                data_controller.sensor_data[data_controller.sensor_data.length-1].data.x = 
                    data_controller.sensor_data[data_controller.sensor_data.length-1].data.x - 
                    Math.pow(2,data_controller.int_size*8);
            }
            container.data_idx += data_controller.int_size; // Goto next int
            
            // Read in y-axis data from packet.
            for(j=0; j < data_controller.int_size; ++j) {
                data_controller.sensor_data[data_controller.sensor_data.length-1].data.y += 
                    data[container.data_idx+data_controller.ID_size+j]
                    << 8*(data_controller.int_size-(j+1));
            }
            // Convert to signed number.
            if(data_controller.sensor_data[data_controller.sensor_data.length-1].data.y > Math.pow(2,data_controller.int_size*8)/2 - 1) {
                data_controller.sensor_data[data_controller.sensor_data.length-1].data.y = 
                    data_controller.sensor_data[data_controller.sensor_data.length-1].data.y - 
                    Math.pow(2,data_controller.int_size*8);
            }
            container.data_idx += data_controller.int_size;
            
            // Read in z-axis data from packet.
            for(j=0; j < data_controller.int_size; ++j) {
                data_controller.sensor_data[data_controller.sensor_data.length-1].data.z += 
                    data[container.data_idx+data_controller.ID_size+j]
                    << 8*(data_controller.int_size-(j+1));
            }
            // Convert to signed number.
            if(data_controller.sensor_data[data_controller.sensor_data.length-1].data.z > Math.pow(2,data_controller.int_size*8)/2 - 1) {
                data_controller.sensor_data[data_controller.sensor_data.length-1].data.z = 
                    data_controller.sensor_data[data_controller.sensor_data.length-1].data.z - 
                    Math.pow(2,data_controller.int_size*8);
            }
            container.data_idx += data_controller.int_size;
            container.data_idx += data_controller.ID_size; // Move packet index to start of next partition.
            break;
            
        // SprintIR 0-20% CO2 sensor. Reports a single 16-bit integer that represents the CO2 concentration in ppm/10.
        case "CO2":
            for(j=0; j < data_controller.int_size; ++j) {
                data_controller.sensor_data[data_controller.sensor_data.length-1].data += 
                    data[container.data_idx+data_controller.ID_size+j]
                    << 8*(data_controller.int_size-(j+1));
            }
            data_controller.sensor_data[data_controller.sensor_data.length-1].data *= 10; // Convert ppm/10 to ppm
            container.data_idx += data_controller.data_bytes.CO2 + data_controller.ID_size; // Move packet index to start of next partition.          
            break;
            
        // Flow rate sensor
        case "FLO":
            for(j=0; j < data_controller.int_size; ++j) {
                data_controller.sensor_data[data_controller.sensor_data.length-1].data += 
                    data[container.data_idx+data_controller.ID_size+j]
                    << 8*(data_controller.int_size-(j+1));
            }
            container.data_idx += data_controller.data_bytes.FLO + data_controller.ID_size; // Move packet index to start of next partition.
            break;
        // // case "GYR":
            // // data_controller.sensor_data.GYR_data = 0; // clear old data
            // // for(j=0; j < data_controller.data_bytes; ++j) {
                // // data_controller.sensor_data.GYR_data += 
                    // // data[container.data_idx+data_controller.ID_size+j]
                    // // << 8*(data_controller.data_bytes-(j+1));
                // // // Convert to signed number.
                // // if(data_controller.sensor_data.GYR_data > Math.pow(2,data_controller.data_bytes*8)/2 - 1) {
                    // // data_controller.sensor_data.GYR_data = data_controller.sensor_data.GYR_data - Math.pow(2,data_controller.data_bytes*8);
                // // }            
            // // }
            // // break;
            
        // // Three-axis magnetometer. Data packet consists of three 16-bit integers.  
        // case "MAG":
            // data_controller.sensor_data.MAG = {x: 0, y:0, z:0}; // Clear old data
            // // Read in x-axis data from packet.
            // for(j=0; j < data_controller.int_size; ++j) {
                // data_controller.sensor_data.MAG.x += 
                    // data[container.data_idx+data_controller.ID_size+j]
                    // << 8*(data_controller.int_size-(j+1));
                // // Convert to signed number.
                // if(data_controller.sensor_data.MAG.x > Math.pow(2,data_controller.int_size*8)/2 - 1) {
                    // data_controller.sensor_data.MAG.x = data_controller.sensor_data.MAG.x - Math.pow(2,data_controller.int_size*8);
                // }
            // }
            // // Read in y-axis data from packet.
            // for(j=0; j < data_controller.int_size; ++j) {
                // data_controller.sensor_data.MAG.y += 
                    // data[container.data_idx+data_controller.ID_size+j]
                    // << 8*(data_controller.int_size-(j+1));
                // // Convert to signed number.
                // if(data_controller.sensor_data.MAG.y > Math.pow(2,data_controller.int_size*8)/2 - 1) {
                    // data_controller.sensor_data.MAG.y = data_controller.sensor_data.MAG.y - Math.pow(2,data_controller.int_size*8);
                // }
            // }
            // // Read in z-axis data from packet.
            // for(j=0; j < data_controller.int_size; ++j) {
                // data_controller.sensor_data.MAG.z += 
                    // data[container.data_idx+data_controller.ID_size+j]
                    // << 8*(data_controller.int_size-(j+1));
                // // Convert to signed number.
                // if(data_controller.sensor_data.MAG.z > Math.pow(2,data_controller.int_size*8)/2 - 1) {
                    // data_controller.sensor_data.MAG.z = data_controller.sensor_data.MAG.z - Math.pow(2,data_controller.int_size*8);
                // }
            // }
            // container.data_idx += data_controller.data_bytes.MAG + data_controller.ID_size; // Move packet index to start of next partition.
            // break;
        default:
            data_controller.sensor_data.pop(); // Remove added element
            ++container.data_idx;
            break;
    }
    //data_controller.container.data_idx += data_controller.part_size;
}

console.log( 'Server setup completed successfully.' );

