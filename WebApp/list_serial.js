// list serial ports:
var serialport = require('serialport'); // include the library
var SerialPort = serialport.SerialPort; // make a local instance

serialport.list(function (err, ports) {
  console.log("\nSerial Ports:");
  ports.forEach(function(port) {
    console.log('\n' + port.comName);
    console.log(port.pnpId);
    console.log(port.manufacturer);
  });
});