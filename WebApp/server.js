// Basic framework for setting up express and web sockets from 
//http://blog.derivatived.com/posts/Control-Your-Robot-With-Node.js-Raspberry-PI-and-Arduino/
// Modified by Ryker Dial May 2015
// Source: https://itp.nyu.edu/physcomp/labs/labs-serial-communication/lab-serial-communication-with-node-js/

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

// When someone has connected to me...
io.sockets.on('connection', function (socket) {
	// Send out a message (only to the one who connected)
	//socket.emit('Connected to server', { data: CO2_data });

    var interval = setInterval(function() {
        socket.emit('CO2 Data', {data: CO2_data});
    }, 25);
	// When I've received 'robot command' message from this connection...
	/*socket.on('robot command', function (data) {
	    console.log(data);
	    var command = data.command;
	});*/
});
// https://nodesource.com/blog/understanding-socketio/

var serialport = require('serialport'); // include the library
var SerialPort = serialport.SerialPort; // make a local instance

var portName = process.argv[2]; // get port name from the command line:
var sp = new SerialPort(portName, {
   	baudRate: 9600,
   	dataBits: 8,
   	parity: 'none',
   	stopBits: 1,
   	flowControl: false,
   	// CO2 sensor terminates each data packet with a return and newline
   	parser: serialport.parsers.readline("\n")
 });

sp.on('data', sendToClient);
var CO2_data = 0;

function sendToClient(data) {
    CO2_data = data.substring(3, 8);
    CO2_data = parseInt(CO2_data)*10;
	console.log(CO2_data);
}

console.log( 'All good' );

