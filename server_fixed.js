
// === Mock Arduino Serial if not connected ===
let useMock = false;
let SerialPort;
try {
  SerialPort = require('serialport');
} catch (err) {
  console.log('SerialPort not installed, using mock mode');
  useMock = true;
}

let arduino;
if (!useMock) {
  try {
    arduino = new SerialPort({ path: 'COM8', baudRate: 9600 });
  } catch (err) {
    console.log('Arduino not found, fallback to mock mode');
    useMock = true;
  }
}

if (useMock) {
  arduino = { on: ()=>{}, write: ()=>{}, read: ()=>{} };
  console.log('Running in MOCK mode, Arduino not required');
}

const express = require('express');
const path = require('path');
const fs = require('fs');

const app = express();
const PORT = 3000;

// --------- Serve static files ---------
app.use(express.static(__dirname));
app.use(express.json());

// --------- Optional Arduino Setup ---------
let arduinoConnected = false;
let SerialPort;
try {
    SerialPort = require('serialport');
} catch (err) {
    console.log("SerialPort module not available, running without Arduino.");
}

// Fallback if Arduino not connected
if (SerialPort) {
    try {
        const port = new SerialPort.SerialPort({ path: 'COM8', baudRate: 9600 });
        arduinoConnected = true;
        console.log('Arduino connected on COM8');
        
        port.on('data', (data) => {
            console.log('Data from Arduino:', data.toString());
        });
        
        port.on('error', (err) => {
            console.error('Arduino error:', err.message);
        });

    } catch (err) {
        console.log('No Arduino detected. Running server without Arduino.');
    }
}

// --------- Routes to verify all pages ---------
const pages = [
    'index.html','dashboard.html','plants.html','profile.html',
    'signup.html','forgot.html','settings.html','about.html',
    'weather.html','setting.html','basil.html','chili.html',
    'select-plant.html','select-plant-advanced.html','select-plant-full.html'
];

pages.forEach(page => {
    app.get('/' + page, (req, res) => {
        res.sendFile(path.join(__dirname, page));
    });
});

// Default route
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'index.html'));
});

// --------- Start Server ---------
app.listen(PORT, () => {
    console.log(`Server running at http://localhost:${PORT}`);
    if (!arduinoConnected) {
        console.log('⚠ Running without Arduino. All web pages still accessible.');
    }
});

// --- Added basic login and signup routes ---
const USERS_FILE = __dirname + '/users.json';

app.post('/login', express.json(), (req, res) => {
  const { username, password } = req.body;
  try {
    const users = JSON.parse(fs.readFileSync(USERS_FILE));
    const user = users.find(u => u.username === username && u.password === password);
    if (user) return res.json({ success: true });
    else return res.json({ success: false, message: "Invalid credentials" });
  } catch (err) {
    return res.json({ success: false, message: "Server error" });
  }
});

app.post('/signup', (req, res) => {
  const { username, password } = req.body;
  let users = [];
  try {
    users = JSON.parse(fs.readFileSync('users.json'));
  } catch (e) {
    users = [];
  }
  if (!Array.isArray(users)) users = [];

  const userExists = users.some(u => u.username === username);
  if (userExists) {
    return res.json({ success: false, message: "User exists" });
  }

  users.push({ username, password });
  fs.writeFileSync('users.json', JSON.stringify(users, null, 2));
  res.json({ success: true, message: "Signup successful" });
});
    users.push({ username, password });
    fs.writeFileSync(USERS_FILE, JSON.stringify(users, null, 2));
    return res.json({ success: true });
  } catch (err) {
    return res.json({ success: false, message: "Server error" });