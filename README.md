# EE444 In-Suit CO2 Sensor Project
This repository is for the University of Alaska Fairbanks' Embedded Systems Design class. 
Particularly, it is for the In-suit CO2 Sensor NASA Wearable Technologies Project. 
Funding for the project is provided by the Alaska Space Grant Program.

## Web App
1. Install Node.js LTS version: <https://nodejs.org/en/>
2. Open *Node.js command prompt* application
3. In the command window, navigate to the WebApp folder by executing the command 
*cd path_to_WebApp.* For example, if the path to the web app was *C:\EE444_CO2_Insuit_Sensor\WebApp\*, 
then the command would be  
`cd C:\EE444_CO2_Insuit_Sensor\WebApp\`.
4. Install the required Node.js modules by typing and executing the following command:  
`npm install express serialport socket.io`
5. Get a list of the current devices by executing the command `node list_serial.js`
6. A list of COM devices will appear. Note the one that is identified as the bluetooth module.
7. Execute the command `node server.js COMX`, replacing X with the COM #
identified in step 6.
8. Open up Google Chrome or Firefox and go to the address <http://localhost:8080>. The web app will appear!

Extra:
* Once the web app is up and running, any computer on the network can connect to it. To do this, press
<kbd>WinKey</kbd> + <kbd>r</kbd>, input *cmd*, then press <kbd>Enter</kbd>. A command window will open. 
Execute the command `ipconfig` and take note of your IP address. Then, to access the web app on another 
computer, simply open Google Chrome or Firefox and go to the address *http://yourIP:8080*.
 
