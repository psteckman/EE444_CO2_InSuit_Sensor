# Sensor Data Visualization & Acquisition User Interface
This user interface allows multiple users to view real time charts of two dimensional sensor data concurrently from 
multiple devices on a local network. It also allows users to toggle storing the received data to server-side storage. 
COM devices connected to the server send sensor data to the server over serial communications links in specially 
formatted packets. The server then parses these packets, extracting the sensor data. This data is transmitted to 
connected clients at a frequency of 20 Hz, and if data capture is on this data is also saved to server-side storage at 
a frequency of 100 Hz.  

The server receives sensor data from COM devices over USB connections operating at 921600 baud rate, utilizing odd 
parity and two stop bits. The sensor data is received in specially formatted packets. These packets can contain data 
from any number of sensors (as long as the baud rate can support it), and must start with CR LF. Each sensor "partition" 
must begin with 1 byte specifying the sensor module number and one byte specifying the sensor type, and end with CR LF, 
with the sensor data in between. The following is an example packet (brackets are for illustrative purposes and are not 
a part of the packet):  

    [CRLF][1][1][4][8][15][CRLF][1][2][16][CRLF][3][3][23][CRLF][3][2][42][CRLF]  
   
This packet contains data for four sensors. The first sensor has a module number of 1 and a type of 1, so it is an 
accelerometer attached to sensor module 1. It has twelve bytes of data, four bytes per axis; the x-axis data has a 
value of 4, the y-axis a value of 8, and the z-axis a value of 15. The second sensor is a CO2 sensor attached to sensor 
module 1, with two bytes of data with a value of 16. The third sensor is a FLO sensor attached to sensor module 3, and 
the fourth sensor is CO2 sensor attached to sensor module 3.

The server checks for corrupted or otherwise incorrect data by checking for the CR LF header and delimiters. The parser 
checks for these delimiters on a sensor-by-sensor basis. As soon as it detects missing delimiters, the server throws out 
the rest of the packet, though the sensor data that had the correct delimiters is still saved. Additionally, even when 
data capture is not occurring, the server saves the last reported value for each sensor. This means that not receiving 
data for a sensor does not cause any errors with the server or user interface: the server will simply use the last 
known value of the sensor data when saving the data and when transmitting the data to clients.  

For currently unknown reasons, the server has strange performance issues when running at 100 Hz on Windows that are not 
present in Linux. Specifically, in Windows if no users are connected to the web interface the server will stutter and 
not handle data properly. Thus, it is recommended that the server be installed on a Raspberry Pi or some other Linux 
device for optimal performance. 
 
## Installation:
1. Download the Node.js Linux binaries that are appropriate for your Linux distribution at <https://nodejs.org/en/>.  
* For a Raspberry Pi 2, these are the ARM7 binaries.  
* For 64-bit Ubuntu, these are the x86 64-bit binaries.  
2. Using the console, navigate to the directory with the downloaded binaries. Unpack the binaries, then copy them to 
the */usr/local* directory.
* 
* If the commands *node -v* and *npm -v* return version numbers, then the binaries have been installed correctly.  
3. Download the WebApp folder from this repository.
4. Using the console, navigate to the WebApp folder.
5. The server requires certain modules to run. Install them by executing the command *npm install express serialport 
socket.io jsonfile.*  

## Starting up the Server
1. Determine the IP address of the server by opening up a console on the server and executing the command *hostname -I*  
2. Using the console, navigate to the WebApp folder.
3. Executing the command *node list_serial.js* will list the detected serial devices connected to the server. If the 
COM device you have connected the server does not use the Silicon Labs' μUSB-MB5 UART-to-USB converter or is not an 
Arduino, then execute the list_serial.js program and make note of the port name of the device.
4. Execute the command *node server.js <i>portname</i>*, where <i>portname</i> is the port name recorded in step 3. If 
your COM device uses the Silicon Labs' μUSB-MB5 UART-to-USB converter or is an Arduino, then the server will 
automatically connect to it, making specifying the port name optional.
* Note, the server can connect to multiple COM devices at once. The auto-detect feature will connect to all 
auto-detected devices. You can also specify multiple COM device names manually by specifying a space-separated list of 
port names when starting up the server (e.g "node server.js portname1 portname2 portname3 ...")

## Using the interface
1. On a device that is on the same network as the server, open up a web browser and open up port 8081 of the IP of the 
server.  
* E.g. if server has IP 192.168.1.24, then go to the URL 192.168.1.24:8081.
* If you want to chart the data of several sensors at once, it is recommended that you use a 64-bit browser, as the 
rapid updating the charts can be graphically intensive.
2. Once you have connected to the user interface, the server presents you with several buttons:  
* The <i>Add Sensor</i> button is a dropdown menu that lists all configured sensor types. When you select a type of 
sensor from this dropdown menu, the server creates charts for <i>all</i> detected sensors of the chosen type.
* The <i>Remove Sensor</i> button is a dropdown menu that allows you to remove charts from the user interface 
individually. This menu will initially be empty: it is updated each time you create chart(s).  
* The <i>Start Data Capture</i> and <i>Stop Data Capture</i> buttons toggle saving received sensor data to the server's 
storage. When this is toggled on, the web server creates a new JSON file in the "sensor_data" folder; these files are 
named using the ISO 8061 standard for timestamps. The server then saves <i>all</i> of the sensor data it receives to 
this JSON file at about a frequency of 100 Hz (there is usually a millisecond or two of variation in the length of time 
between saves. Along with the data from the sensors, the server saves the time in milliseconds since the data capture 
started.  
* The <i>Chart Update Frequency</i> button is a dropdown menu that allows you to change how frequently the charts on 
the user interface update. Currently, there are two options: 10 Hz and 20 Hz. This is set to 10 Hz by default, and 10 
Hz is better for slower devices like phones, whearas 20 Hz has better resolution.  

## Adding New Sensors to the User Interface
To add new sensors to the user interface, two files have to be modified: <i>server.js</i> and <i>interface.js</i> (in 
the public/js folder). The first sections of these files contain instructions for modification. Also be sure that any 
COM devices connected the server incorporate the new sensor(s) into their packets.
 