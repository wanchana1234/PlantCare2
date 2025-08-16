
=== Arduino ===
1) npm i serialport @serialport/parser-readline
2) Upload arduino_moisture_serial.ino
3) Set port if needed: Windows $env:ARDUINO_PORT="COM8" ; macOS/Linux ARDUINO_PORT=/dev/ttyACM0
4) npm start
5) Check http://localhost:3000/api/ports
