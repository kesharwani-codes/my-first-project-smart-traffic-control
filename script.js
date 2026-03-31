// SMART TRAFFIC AI WITH AMBULANCE PRIORITY

let chart;
let history = [];

// Logout
window.logout = () => {
    localStorage.removeItem("user");
    window.location.href = "login.html";
};

// Scroll to simulation
window.scrollSim = () => {
    document.getElementById("sim").scrollIntoView({ 
        behavior: "smooth", 
        block: "start" 
    });
};

// Get vehicle values
function getVehicles() {
    return {
        r1: parseInt(document.getElementById("r1").value) || 0,
        r2: parseInt(document.getElementById("r2").value) || 0,
        r3: parseInt(document.getElementById("r3").value) || 0,
        r4: parseInt(document.getElementById("r4").value) || 0
    };
}

// Check ambulance mode
function isAmbulanceActive() {
    return document.getElementById("ambMode").checked;
}

function getAmbulanceRoad() {
    return parseInt(document.getElementById("ambRoad").value);
}

// AI Decision Algorithm with Ambulance Priority
function getAIDecision(vehicles) {
    let ambulance = isAmbulanceActive();
    let ambRoadId = getAmbulanceRoad();
    
    let roads = [
        { id: 1, name: "Road 1", count: vehicles.r1, color: "#4caf50" },
        { id: 2, name: "Road 2", count: vehicles.r2, color: "#2196f3" },
        { id: 3, name: "Road 3", count: vehicles.r3, color: "#ff9800" },
        { id: 4, name: "Road 4", count: vehicles.r4, color: "#9c27b0" }
    ];
    
    let selected = roads[0];
    let message = "";
    
    // AMBULANCE PRIORITY - HIGHEST
    if (ambulance) {
        let ambRoadObj = roads.find(r => r.id === ambRoadId);
        if (ambRoadObj) {
            selected = ambRoadObj;
            message = `🚑 EMERGENCY! Ambulance on ${selected.name} - PRIORITY GREEN LIGHT`;
        }
    } else {
        // Normal AI: Find road with maximum vehicles
        for (let road of roads) {
            if (road.count > selected.count) {
                selected = road;
            }
        }
        
        // Generate message based on traffic
        if (selected.count === 0) {
            message = "✨ No traffic detected - All roads clear";
        } else if (selected.count > 30) {
            message = "🚨 HEAVY CONGESTION! Priority given to busy road";
        } else if (selected.count > 20) {
            message = "⚠️ Moderate traffic - Optimizing signal timing";
        } else if (selected.count > 10) {
            message = "✅ Normal traffic flow - Smooth operation";
        } else {
            message = "✅ Light traffic - Efficient movement";
        }
    }
    
    return { road: selected, message };
}

// Update traffic signal light
function updateSignal(roadName, color) {
    const light = document.querySelector(".light");
    const text = document.getElementById("sigName");
    
    light.style.background = color;
    light.style.boxShadow = `0 0 12px ${color}`;
    
    // Short name for display
    let shortName = roadName === "Road 1" ? "R1" : 
                    roadName === "Road 2" ? "R2" : 
                    roadName === "Road 3" ? "R3" : "R4";
    text.textContent = shortName;
}

// Show/hide ambulance alert
function updateAmbulanceAlert(show, roadId) {
    const alertDiv = document.getElementById("ambAlert");
    if (show) {
        alertDiv.style.display = "block";
        alertDiv.innerHTML = `🚑 AMBULANCE → R${roadId}`;
    } else {
        alertDiv.style.display = "none";
    }
}

// Update all UI components
function updateUI(decision, vehicles) {
    const total = vehicles.r1 + vehicles.r2 + vehicles.r3 + vehicles.r4;
    
    // Update stats
    document.getElementById("totalVeh").textContent = total;
    document.getElementById("aiDecision").textContent = decision.road.name;
    
    let shortActive = decision.road.name === "Road 1" ? "R1" : 
                      decision.road.name === "Road 2" ? "R2" : 
                      decision.road.name === "Road 3" ? "R3" : "R4";
    document.getElementById("activeRoad").textContent = shortActive;
    
    // Update message
    const msgDiv = document.getElementById("aiMsg");
    msgDiv.innerHTML = `🤖 ${decision.message}<br>🟢 GREEN SIGNAL: ${decision.road.name} (${decision.road.count} vehicles)`;
    
    // Update signal light
    updateSignal(decision.road.name, decision.road.color);
    
    // Update ambulance alert
    updateAmbulanceAlert(isAmbulanceActive(), decision.road.id);
    
    // Flash effect for ambulance mode
    if (isAmbulanceActive()) {
        const signalBox = document.getElementById("signalBox");
        signalBox.style.transform = "scale(1.05)";
        setTimeout(() => {
            signalBox.style.transform = "scale(1)";
        }, 200);
    }
    
    // Save to history for chart
    history.push(decision.road.name);
    if (history.length > 6) history.shift();
    
    updateChart();
    
    // Adjust car animation speed based on traffic density
    let speed = Math.max(4, 10 - Math.floor(total / 25));
    document.querySelectorAll(".car").forEach(car => {
        car.style.animationDuration = `${speed}s`;
    });
}

// Update chart with decision history
function updateChart() {
    if (!chart) return;
    
    const counts = [0, 0, 0, 0];
    history.forEach(decision => {
        if (decision === "Road 1") counts[0]++;
        else if (decision === "Road 2") counts[1]++;
        else if (decision === "Road 3") counts[2]++;
        else if (decision === "Road 4") counts[3]++;
    });
    
    chart.data.datasets[0].data = counts;
    chart.update();
}

// Initialize Chart.js
function initChart() {
    const ctx = document.getElementById("trafficChart").getContext("2d");
    chart = new Chart(ctx, {
        type: "bar",
        data: {
            labels: ["Road 1", "Road 2", "Road 3", "Road 4"],
            datasets: [{
                label: "Green Signal Allocations (Last 6)",
                data: [0, 0, 0, 0],
                backgroundColor: ["#4caf50", "#2196f3", "#ff9800", "#9c27b0"],
                borderRadius: 8,
                barPercentage: 0.65,
                categoryPercentage: 0.8
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: true,
            plugins: {
                legend: {
                    position: "top",
                    labels: {
                        font: { size: 11, weight: "bold" },
                        boxWidth: 10
                    }
                },
                tooltip: {
                    backgroundColor: "#1a2634",
                    titleColor: "#fff",
                    bodyColor: "#ddd",
                    fontSize: 11
                }
            },
            scales: {
                y: {
                    beginAtZero: true,
                    ticks: { stepSize: 1, font: { size: 10 } },
                    title: { display: true, text: "Frequency", font: { size: 10 } }
                },
                x: {
                    ticks: { font: { size: 10, weight: "bold" } }
                }
            }
        }
    });
}

// Main AI function
window.runAI = () => {
    const vehicles = getVehicles();
    const decision = getAIDecision(vehicles);
    updateUI(decision, vehicles);
    
    // Save to localStorage for history tracking
    const logData = {
        timestamp: new Date().toLocaleTimeString(),
        vehicles: vehicles,
        decision: decision.road.name,
        ambulance: isAmbulanceActive()
    };
    
    let historyLog = JSON.parse(localStorage.getItem("traffic_logs") || "[]");
    historyLog.unshift(logData);
    if (historyLog.length > 10) historyLog.pop();
    localStorage.setItem("traffic_logs", JSON.stringify(historyLog));
};

// Auto-refresh AI every 12 seconds for real-time feel
let autoInterval = setInterval(() => {
    if (document.hasFocus()) {
        window.runAI();
    }
}, 12000);

// Event listeners
document.addEventListener("DOMContentLoaded", () => {
    initChart();
    window.runAI();
    
    // Enter key support on inputs
    const inputs = ["r1", "r2", "r3", "r4"];
    inputs.forEach(id => {
        document.getElementById(id).addEventListener("keypress", (e) => {
            if (e.key === "Enter") window.runAI();
        });
    });
    
    // Ambulance mode changes
    document.getElementById("ambMode").addEventListener("change", () => window.runAI());
    document.getElementById("ambRoad").addEventListener("change", () => window.runAI());
});

// Cleanup interval on page unload
window.addEventListener("beforeunload", () => {
    if (autoInterval) clearInterval(autoInterval);
});