// Ryker Dial
// University of Alaska, Fairbanks
// EE 444: Embedded Systems Design
// Web app server for sensor data transmission.

// Date Created: March 24, 2016
// Last Modified: March 25, 2016

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
        socket.emit('CO2 Data', {data: CO2_data});
    }, 50);
    
    // ***** This section will later be used for the server to interpret client commands.
    // *****     the commented out section is an example.
	// When I've received 'robot command' message from this connection...
	/*socket.on('robot command', function (data) {
	    console.log(data);
	    var command = data.command;
	});*/
});


var serialport = require('serialport'); // include the library
var SerialPort = serialport.SerialPort; // make a local instance

var portName = process.argv[2]; // get port name from the command line
var sp = new SerialPort(portName, {
   	baudRate: 9600,
   	dataBits: 8,
   	parity: 'none',
   	stopBits: 1,
   	flowControl: false,
   	// Each data packet is terminated with a return and newline
   	parser: serialport.parsers.readline("\n")
 });

sp.on('data', sendToClient);
var CO2_data = 0;

function sendToClient(data) {
    CO2_data = data.substring(3, 8); // CO2 conc. after digital filtering
    CO2_data = parseInt(CO2_data)*10;
	console.log(CO2_data);
}

console.log( 'Server setup completed successfully.' );

