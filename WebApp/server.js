// Ryker Dial
// University of Alaska, Fairbanks
// EE 444: Embedded Systems Design
// Web app server for sensor data transmission.

// Date Created: March 24, 2016
// Last Modified: March 29, 2016

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

// This function is called upon establishing a connection with a client
io.sockets.on('connection', function (socket) {
	// Send verification message to client
	socket.emit('Connected to server', { data: 0 });

    // Start transmitting data to the client
    var interval = setInterval(function() {
        socket.emit('Sensor Data', {data: data_controller.sensor_data});
        //console.log(data_controller.sensor_data);
    }, data_controller.update_interval);
    
    // ***** Server commands section
    // Start writing sensor data to csv files.
	socket.on('Start Data Capture', function () {
	});
    
    // Stop writing sensor data to csv files
    socket.on('Stop Data Capture', function () {
	});
});


var serialport = require('serialport'); // include the library
var SerialPort = serialport.SerialPort; // make a local instance

var portName = process.argv[2]; // get port name from the command line
var sp = new SerialPort(portName, {
   	baudRate: 57600,
   	dataBits: 8,
   	parity: 'none',
   	stopBits: 1,
    flowControl: false
 });

sp.on('data', sendToClient);

var data_controller = {
    ID_size: 3, // Size in bytes of sensor data ID used to partition packet received over serial.
    part_size: 5, // Size in bytes of one data partition
    data_idx: 0, // location of parser extracting sensor data from packet received over serial.
    update_interval: 10, // How often the server sends sensor data to the client.
    numsensors: 2, // Number of sensors attached to the system. !!!REMEMBER TO CHANGE THIS TO 0 AFTER TESTING!!!
    sensor_data: {} // Holds sensor data.
};
// Number of sensor data bytes per partition. Must be some power of 2.
data_controller.data_bytes = data_controller.part_size - data_controller.ID_size;  

function sendToClient(data) {
    data_controller.data_idx = 0;
    //CO2_data = data.substring(3, 8); // CO2 conc. after digital filtering
    //CO2_data = parseInt(CO2_data)*10;
    for(i=0; i < 5; ++i) {
        parse_serial_data(data);
    }
}

function parse_serial_data(data) {
    var data_ID = "";
    for(j=data_controller.data_idx; j<data_controller.data_idx+data_controller.ID_size; ++j) {
        data_ID = data_ID.concat(String.fromCharCode(data[j]));
    }
   // console.log(String.fromCharCode(data[5]));
    //console.log(String.fromCharCode(data[6]));
   // console.log(String.fromCharCode(data[7]));

     switch(data_ID) {
        case "CO2":
            data_controller.sensor_data.CO2_data = 0; // clear old data
            for(j=0; j < data_controller.data_bytes; ++j) {
                data_controller.sensor_data.CO2_data += 
                    data[data_controller.data_idx+data_controller.ID_size+j]
                    << 8*(data_controller.data_bytes-(j+1));
            }
            break;
        case "FLO":
            data_controller.sensor_data.FLO_data = 0; // clear old data
            for(j=0; j < data_controller.data_bytes; ++j) {
                data_controller.sensor_data.FLO_data += 
                    data[data_controller.data_idx+data_controller.ID_size+j]
                    << 8*(data_controller.data_bytes-(j+1));
            }
            break;
        case "ACC":
            data_controller.sensor_data.ACC_data = 0; // clear old data
            for(j=0; j < data_controller.data_bytes; ++j) {
                data_controller.sensor_data.ACC_data += 
                    data[data_controller.data_idx+data_controller.ID_size+j]
                    << 8*(data_controller.data_bytes-(j+1));
                // Convert to signed number.
                if(data_controller.sensor_data.ACC_data > Math.pow(2,data_controller.data_bytes*8)/2 - 1) {
                    data_controller.sensor_data.ACC_data = data_controller.sensor_data.ACC_data - Math.pow(2,data_controller.data_bytes*8);
                }
            }
            //data_controller.sensor_data.ACC_data = data_controller.sensor_data.ACC_data;
            break;
        case "GYR":
            data_controller.sensor_data.GYR_data = 0; // clear old data
            for(j=0; j < data_controller.data_bytes; ++j) {
                data_controller.sensor_data.GYR_data += 
                    data[data_controller.data_idx+data_controller.ID_size+j]
                    << 8*(data_controller.data_bytes-(j+1));
                // Convert to signed number.
                if(data_controller.sensor_data.GYR_data > Math.pow(2,data_controller.data_bytes*8)/2 - 1) {
                    data_controller.sensor_data.GYR_data = data_controller.sensor_data.GYR_data - Math.pow(2,data_controller.data_bytes*8);
                }            
            }
            break;
        case "MAG":
            data_controller.sensor_data.MAG_data = 0; // clear old data
            for(j=0; j < data_controller.data_bytes; ++j) {
                data_controller.sensor_data.MAG_data += 
                    data[data_controller.data_idx+data_controller.ID_size+j]
                    << 8*(data_controller.data_bytes-(j+1));
                // Convert to signed number.
                if(data_controller.sensor_data.MAG_data > Math.pow(2,data_controller.data_bytes*8)/2 - 1) {
                    data_controller.sensor_data.MAG_data = data_controller.sensor_data.MAG_data - Math.pow(2,data_controller.data_bytes*8);
                }
            }
            break;
    }
    data_controller.data_idx += data_controller.part_size;
}

console.log( 'Server setup completed successfully.' );

