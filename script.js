// ================== COMBINED DATA LOGGING ==================
// Each entry: { serial, date, time, temperature, humidity, light }
let combinedLog = [];
let nextSerial = 1;

function updateLogCounter() {
    const logCounter = document.getElementById('logCount');
    if (logCounter) {
        logCounter.innerText = `📋 ${combinedLog.length} records stored`;
    }
}

// Function to take a snapshot of current sensor values and store it
function takeSnapshot() {
    const tempElement = document.getElementById('temp');
    const humElement = document.getElementById('hum');
    const lightElement = document.getElementById('light');

    if (!tempElement || !humElement || !lightElement) return;

    const temp = tempElement.innerText;
    const hum = humElement.innerText;
    const light = lightElement.innerText;

    const now = new Date();
    const date = now.toISOString().split('T')[0];      // YYYY-MM-DD
    const time = now.toTimeString().split(' ')[0];    // HH:MM:SS

    combinedLog.push({
        serial: nextSerial++,
        date: date,
        time: time,
        temperature: temp,
        humidity: hum,
        light: light
    });

    updateLogCounter();
    console.log(`Snapshot saved: #${nextSerial - 1} at ${date} ${time}`);
}

// Set snapshot interval (every 60 seconds = 60000 ms)
const SNAPSHOT_INTERVAL = 60000; // 60 seconds
setInterval(takeSnapshot, SNAPSHOT_INTERVAL);

// Take an initial snapshot as soon as the page loads
takeSnapshot();

// ================== MQTT SETUP (real-time display only) ==================
const client = mqtt.connect('wss://broker.hivemq.com:8884/mqtt');

client.on('connect', function () {
    console.log("✅ Connected to MQTT broker");
    client.subscribe('greenhouse/temperature');
    client.subscribe('greenhouse/humidity');
    client.subscribe('greenhouse/light');
    console.log("📡 Subscribed to greenhouse topics");
});

client.on('message', function (topic, message) {
    let msg = message.toString();
    console.log(`📨 ${topic} : ${msg}`);

    // Update live display only
    if (topic === "greenhouse/temperature") {
        document.getElementById("temp").innerHTML = msg;
    } else if (topic === "greenhouse/humidity") {
        document.getElementById("hum").innerHTML = msg;
    } else if (topic === "greenhouse/light") {
        document.getElementById("light").innerHTML = msg;
    }
});

// ================== CSV DOWNLOAD ==================
function downloadCSV() {
    if (combinedLog.length === 0) {
        alert("No records to download yet.");
        return;
    }

    const headers = ['Serial No.', 'Date', 'Time', 'Temperature (°C)', 'Humidity (%)', 'Light (lx)'];
    const rows = combinedLog.map(entry => [
        entry.serial,
        entry.date,
        entry.time,
        entry.temperature,
        entry.humidity,
        entry.light
    ]);

    let csvContent = headers.join(',') + '\n';
    rows.forEach(row => {
        const escapedRow = row.map(cell => {
            if (typeof cell === 'string' && (cell.includes(',') || cell.includes('"'))) {
                return `"${cell.replace(/"/g, '""')}"`;
            }
            return cell;
        }).join(',');
        csvContent += escapedRow + '\n';
    });

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    link.setAttribute('href', url);
    link.setAttribute('download', 'greenhouse_combined_data.csv');
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
}

const downloadBtn = document.getElementById('downloadBtn');
if (downloadBtn) {
    downloadBtn.addEventListener('click', downloadCSV);
}
updateLogCounter();
