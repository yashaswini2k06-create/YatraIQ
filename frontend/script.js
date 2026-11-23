
// =============================================
// YatraIQ - SMART JOURNEY PREDICTION
// Complete Frontend Integration
// =============================================

const API_URL = "http://127.0.0.1:5000";

const HISTORY_KEY = "yatraiqHistory";

let predictionHistory = loadHistory();
let availableRoutes = [];

let predictionChart = null;
let historyChart = null;


// =============================================
// 1. SAFE LOCAL STORAGE
// =============================================

function loadHistory() {

    try {

        const saved = JSON.parse(
            localStorage.getItem(HISTORY_KEY) || "[]"
        );

        if (!Array.isArray(saved)) return [];

        return saved.map(item => {

            // Support records created by the old script
            const minutes = Number(item.prediction ?? item.predictionMinutes ?? 0);

            const seconds = Number(
                item.predictionSeconds ?? minutes * 60
            );

            return {
                ...item,
                timestamp: item.timestamp || new Date().toISOString(),
                predictionMinutes: minutes,
                predictionSeconds: seconds
            };

        }).filter(item =>
            Number.isFinite(item.predictionMinutes) &&
            Number.isFinite(item.predictionSeconds)
        );

    } catch (error) {

        console.error("Could not read prediction history:", error);

        return [];

    }

}


function saveHistory() {

    try {

        localStorage.setItem(
            HISTORY_KEY,
            JSON.stringify(predictionHistory)
        );

    } catch (error) {

        console.error("Could not save prediction history:", error);

        alert("Unable to save prediction history. Check browser storage.");

    }

}


// =============================================
// 2. PAGE NAVIGATION
// =============================================

const navigationLinks = document.querySelectorAll("[data-page]");
const pages = document.querySelectorAll(".page");


function showPage(targetPage) {

    pages.forEach(page => {
        page.classList.remove("active");
    });

    const selectedPage = document.getElementById(targetPage);

    if (!selectedPage) return;

    selectedPage.classList.add("active");

    navigationLinks.forEach(link => {
        link.classList.toggle(
            "active",
            link.dataset.page === targetPage
        );
    });

    // Refresh page information
    if (targetPage === "dashboard") {
        updateDashboard();
    }

    if (targetPage === "analytics") {
        updateAnalytics();
    }

    if (targetPage === "routes") {
        renderRoutes();
    }

}


navigationLinks.forEach(link => {

    link.addEventListener("click", function(event) {

        event.preventDefault();

        showPage(this.dataset.page);

    });

});


// =============================================
// 3. API REQUEST HELPER
// =============================================

async function apiRequest(endpoint, options = {}) {

    const response = await fetch(
        `${API_URL}${endpoint}`,
        {
            ...options,
            headers: {
                ...(options.headers || {}),
                ...(options.body ? {
                    "Content-Type": "application/json"
                } : {})
            }
        }
    );

    let data;

    try {

        data = await response.json();

    } catch {

        throw new Error("Invalid response received from Flask backend.");

    }

    if (!response.ok) {

        throw new Error(
            data.error || `Server error: ${response.status}`
        );

    }

    return data;

}


// =============================================
// 4. BACKEND HEALTH CHECK
// =============================================

async function checkBackend() {

    try {

        const data = await apiRequest("/health");

        if (data.status === "healthy") {

            console.log(
                "YatraIQ Backend Connected Successfully!"
            );

            console.log("ML Model:", data.model);

            return true;

        }

        throw new Error("Backend is not healthy.");

    } catch (error) {

        console.error(
            "YatraIQ Backend Connection Failed:",
            error.message
        );

        return false;

    }

}


// =============================================
// 5. LOAD ACTUAL DATASET ROUTES
// =============================================

async function loadRouteOptions() {

    try {

        const data = await apiRequest("/options");

        availableRoutes = data.routes || [];

        populateDirectionDropdown(data.allowed_values.direction || []);

        renderRoutes();

        console.log(
            "Dataset route information loaded:",
            availableRoutes.length
        );

        return true;

    } catch (error) {

        console.error(
            "Could not load route information:",
            error.message
        );

        return false;

    }

}


// =============================================
// 6. DROPDOWN HELPER
// =============================================

function populateDropdown(elementId, values, placeholder) {

    const dropdown = document.getElementById(elementId);

    if (!dropdown) return;

    dropdown.innerHTML = "";

    const defaultOption = document.createElement("option");

    defaultOption.value = "";
    defaultOption.textContent = placeholder;

    dropdown.appendChild(defaultOption);

    [...new Set(values)].forEach(value => {

        const option = document.createElement("option");

        option.value = value;
        option.textContent = value;

        dropdown.appendChild(option);

    });

}


// =============================================
// 7. DIRECTION DROPDOWN
// =============================================

function populateDirectionDropdown(values) {

    populateDropdown(
        "direction",
        values,
        "Select Direction"
    );

}


// =============================================
// 8. SEGMENT DROPDOWN
// =============================================

function populateSegmentDropdown() {

    const direction = Number(
        document.getElementById("direction").value
    );

    const segments = availableRoutes
        .filter(route => route.direction === direction)
        .map(route => route.segment);

    populateDropdown(
        "segment",
        segments,
        "Select Segment"
    );

    populateDropdown(
        "start_point",
        [],
        "Select Starting Point"
    );

    populateDropdown(
        "end_point",
        [],
        "Select Destination"
    );

}


// =============================================
// 9. STARTING POINT DROPDOWN
// =============================================

function populateStartPointDropdown() {

    const direction = Number(
        document.getElementById("direction").value
    );

    const segment = Number(
        document.getElementById("segment").value
    );

    const points = availableRoutes
        .filter(route =>
            route.direction === direction &&
            route.segment === segment
        )
        .map(route => route.start_point);

    populateDropdown(
        "start_point",
        points,
        "Select Starting Point"
    );

    populateDropdown(
        "end_point",
        [],
        "Select Destination"
    );

}


// =============================================
// 10. DESTINATION DROPDOWN
// =============================================

function populateDestinationDropdown() {

    const direction = Number(
        document.getElementById("direction").value
    );

    const segment = Number(
        document.getElementById("segment").value
    );

    const startPoint = Number(
        document.getElementById("start_point").value
    );

    const destinations = availableRoutes
        .filter(route =>
            route.direction === direction &&
            route.segment === segment &&
            route.start_point === startPoint
        )
        .map(route => route.end_point);

    populateDropdown(
        "end_point",
        destinations,
        "Select Destination"
    );

}


// =============================================
// 11. DROPDOWN EVENT LISTENERS
// =============================================

const directionInput = document.getElementById("direction");

const segmentInput = document.getElementById("segment");

const startPointInput = document.getElementById("start_point");


if (directionInput) {

    directionInput.addEventListener(
        "change",
        populateSegmentDropdown
    );

}


if (segmentInput) {

    segmentInput.addEventListener(
        "change",
        populateStartPointDropdown
    );

}


if (startPointInput) {

    startPointInput.addEventListener(
        "change",
        populateDestinationDropdown
    );

}


// =============================================
// 12. PREDICTION FORM
// =============================================

const predictionForm = document.getElementById("predictionForm");

const predictionResult = document.getElementById("predictionResult");

const loadingMessage = document.getElementById("loadingMessage");

const predictButton = document.getElementById("predictButton");


function showPredictionError(message) {

    predictionResult.style.display = "block";

    predictionResult.className = "prediction-result error";

    predictionResult.textContent = "";

    const heading = document.createElement("h3");

    heading.textContent = "Prediction Error";

    const paragraph = document.createElement("p");

    paragraph.textContent = message;

    predictionResult.appendChild(heading);
    predictionResult.appendChild(paragraph);

}


function showPredictionSuccess(seconds, minutes) {

    predictionResult.style.display = "block";

    predictionResult.className = "prediction-result success";

    predictionResult.innerHTML = `
        <h2>Prediction Successful!</h2>

        <h1>${minutes.toFixed(2)} Minutes</h1>

        <p>Predicted Journey Time</p>

        <h3>${seconds.toFixed(2)} Seconds</h3>
    `;

}


// =============================================
// 13. VALIDATE PREDICTION INPUTS
// =============================================

function validatePayload(payload) {

    const fields = [
        "direction",
        "segment",
        "start_point",
        "end_point",
        "day_of_week",
        "month",
        "departure_hour",
        "departure_minute"
    ];

    for (const field of fields) {

        if (!Number.isInteger(payload[field])) {

            return `${field} must contain a valid integer.`;

        }

    }

    if (![1, 2].includes(payload.direction)) {
        return "Invalid direction.";
    }

    if (payload.day_of_week < 0 || payload.day_of_week > 6) {
        return "Day of week must be between 0 and 6.";
    }

    if (![7, 8, 9].includes(payload.month)) {
        return "Month must be 7, 8 or 9.";
    }

    if (payload.departure_hour < 4 || payload.departure_hour > 22) {
        return "Departure hour must be between 4 and 22.";
    }

    if (payload.departure_minute < 0 || payload.departure_minute > 59) {
        return "Departure minute must be between 0 and 59.";
    }

    const validRoute = availableRoutes.some(route =>
        route.direction === payload.direction &&
        route.segment === payload.segment &&
        route.start_point === payload.start_point &&
        route.end_point === payload.end_point
    );

    if (!validRoute) {

        return "The selected route combination does not exist in the dataset.";

    }

    return null;

}


// =============================================
// 14. SUBMIT PREDICTION
// =============================================

if (predictionForm) {

    predictionForm.addEventListener("submit", async function(event) {

        event.preventDefault();

        if (!predictionForm.reportValidity()) return;

        const formData = new FormData(predictionForm);

        const payload = {

            direction: Number(formData.get("direction")),

            segment: Number(formData.get("segment")),

            start_point: Number(formData.get("start_point")),

            end_point: Number(formData.get("end_point")),

            day_of_week: Number(formData.get("day_of_week")),

            month: Number(formData.get("month")),

            departure_hour: Number(formData.get("departure_hour")),

            departure_minute: Number(formData.get("departure_minute"))

        };


        // Validate before calling backend

        const validationError = validatePayload(payload);

        if (validationError) {

            showPredictionError(validationError);

            return;

        }


        // Show loading indicator

        predictionResult.style.display = "none";

        loadingMessage.style.display = "block";

        if (predictButton) {

            predictButton.disabled = true;

            predictButton.innerHTML = `
                <i class="fas fa-spinner fa-spin"></i>
                Processing...
            `;

        }


        try {

            // Send prediction request to Flask

            const output = await apiRequest("/predict", {

                method: "POST",

                body: JSON.stringify(payload)

            });


            if (!output.success) {

                throw new Error(
                    output.error || "Prediction failed."
                );

            }


            const seconds = Number(output.predicted_time_seconds);

            const minutes = Number(output.predicted_time_minutes);


            if (
                !Number.isFinite(seconds) ||
                !Number.isFinite(minutes) ||
                seconds < 0 ||
                minutes < 0
            ) {

                throw new Error(
                    "The model returned an invalid journey time."
                );

            }


            // Display prediction result

            showPredictionSuccess(seconds, minutes);


            // Save prediction history

            const record = {

                timestamp: new Date().toISOString(),

                direction: payload.direction,

                segment: payload.segment,

                start: payload.start_point,

                destination: payload.end_point,

                day_of_week: payload.day_of_week,

                month: payload.month,

                departure_hour: payload.departure_hour,

                departure_minute: payload.departure_minute,

                predictionSeconds: seconds,

                predictionMinutes: minutes

            };


            predictionHistory.unshift(record);

            saveHistory();


            // Refresh all statistics and charts

            updateDashboard();

            updateAnalytics();


            console.log(
                "Prediction completed successfully:",
                record
            );


        } catch (error) {

            console.error("Prediction failed:", error);

            showPredictionError(error.message);


        } finally {

            loadingMessage.style.display = "none";

            if (predictButton) {

                predictButton.disabled = false;

                predictButton.innerHTML = `
                    Predict Journey Time
                    <i class="fas fa-arrow-right"></i>
                `;

            }

        }

    });

}


// =============================================
// 15. FORMAT DATE
// =============================================

function formatDate(timestamp) {

    const date = new Date(timestamp);

    if (Number.isNaN(date.getTime())) {
        return "Unknown date";
    }

    return date.toLocaleString();

}


// =============================================
// 16. UPDATE DASHBOARD
// =============================================

function updateDashboard() {

    const total = predictionHistory.length;


    const totalSeconds = predictionHistory.reduce(
        (sum, item) => sum + Number(item.predictionSeconds),
        0
    );


    const averageSeconds = total
        ? totalSeconds / total
        : 0;


    const averageMinutes = averageSeconds / 60;


    // Home statistics

    const homeTotal = document.getElementById("totalPredictions");

    const homeAverage = document.getElementById("averageTime");


    if (homeTotal) {
        homeTotal.textContent = total;
    }

    if (homeAverage) {
        homeAverage.textContent = averageMinutes.toFixed(2) + " min";
    }


    // Dashboard statistics

    const dashboardTotal = document.getElementById("dashboardTotal");

    const dashboardAverage = document.getElementById("dashboardAverage");


    if (dashboardTotal) {
        dashboardTotal.textContent = total;
    }

    if (dashboardAverage) {
        dashboardAverage.textContent = averageMinutes.toFixed(2) + " min";
    }


    // Analytics statistics

    const analyticsTotal = document.getElementById("analyticsTotal");

    const analyticsAverage = document.getElementById("analyticsAverage");


    if (analyticsTotal) {
        analyticsTotal.textContent = total;
    }

    if (analyticsAverage) {
        analyticsAverage.textContent = averageMinutes.toFixed(2) + " min";
    }


    updateHistory();

}


// =============================================
// 17. DISPLAY PREDICTION HISTORY
// =============================================

function updateHistory() {

    const historyTable = document.getElementById("historyTable");

    const emptyHistory = document.getElementById("emptyHistory");

    if (!historyTable) return;


    historyTable.innerHTML = "";


    if (emptyHistory) {

        emptyHistory.style.display =
            predictionHistory.length === 0 ? "block" : "none";

    }


    // Display the latest 10 records

    predictionHistory.slice(0, 10).forEach(item => {

        const row = document.createElement("tr");


        const values = [

            formatDate(item.timestamp),

            item.start,

            item.destination,

            `${Number(item.predictionMinutes).toFixed(2)} min`

        ];


        values.forEach(value => {

            const cell = document.createElement("td");

            cell.textContent = value;

            row.appendChild(cell);

        });


        historyTable.appendChild(row);

    });

}


// =============================================
// 18. ROUTES PAGE
// =============================================

function renderRoutes() {

    const routesTable = document.getElementById("routesTable");

    const emptyMessage = document.getElementById("routesEmptyMessage");

    if (!routesTable) return;


    const searchInput = document.getElementById("routeSearch");

    const searchTerm = searchInput
        ? searchInput.value.trim().toLowerCase()
        : "";


    const filteredRoutes = availableRoutes.filter(route => {

        const searchableText = [

            route.direction,
            route.segment,
            route.start_point,
            route.end_point

        ].join(" ").toLowerCase();


        return searchableText.includes(searchTerm);

    });


    routesTable.innerHTML = "";


    if (emptyMessage) {

        emptyMessage.style.display =
            filteredRoutes.length === 0 ? "block" : "none";

    }


    // Avoid rendering thousands of rows simultaneously

    filteredRoutes.slice(0, 100).forEach(route => {

        const row = document.createElement("tr");


        const values = [

            route.direction,

            route.segment,

            route.start_point,

            route.end_point

        ];


        values.forEach(value => {

            const cell = document.createElement("td");

            cell.textContent = value;

            row.appendChild(cell);

        });


        const actionCell = document.createElement("td");

        const button = document.createElement("button");

        button.type = "button";

        button.className = "primary-button";

        button.textContent = "Select";

        button.dataset.routeIndex = String(
            availableRoutes.indexOf(route)
        );


        actionCell.appendChild(button);

        row.appendChild(actionCell);

        routesTable.appendChild(row);

    });


    if (filteredRoutes.length > 100) {

        const row = document.createElement("tr");

        const cell = document.createElement("td");

        cell.colSpan = 5;

        cell.textContent =
            `Showing 100 of ${filteredRoutes.length} routes. Use search to find more.`;

        row.appendChild(cell);

        routesTable.appendChild(row);

    }

}


// =============================================
// 19. ROUTE SEARCH
// =============================================

const routeSearch = document.getElementById("routeSearch");


if (routeSearch) {

    routeSearch.addEventListener("input", renderRoutes);

}


// =============================================
// 20. SELECT ROUTE FROM ROUTES PAGE
// =============================================

const routesTable = document.getElementById("routesTable");


if (routesTable) {

    routesTable.addEventListener("click", function(event) {

        const button = event.target.closest("[data-route-index]");

        if (!button) return;


        const index = Number(button.dataset.routeIndex);

        const route = availableRoutes[index];

        if (!route) return;


        // Set direction

        document.getElementById("direction").value =
            String(route.direction);


        populateSegmentDropdown();


        // Set segment

        document.getElementById("segment").value =
            String(route.segment);


        populateStartPointDropdown();


        // Set starting point

        document.getElementById("start_point").value =
            String(route.start_point);


        populateDestinationDropdown();


        // Set destination

        document.getElementById("end_point").value =
            String(route.end_point);


        // Navigate to prediction

        showPage("prediction");

    });

}


// =============================================
// 21. ANALYTICS - PREDICTION CHART
// =============================================

function updateAnalytics() {

    updateDashboard();


    if (typeof Chart === "undefined") {

        console.error("Chart.js is not loaded.");

        return;

    }


    const predictionCanvas = document.getElementById("predictionChart");

    const historyCanvas = document.getElementById("historyChart");


    // Destroy old charts before recreating

    if (predictionChart) {

        predictionChart.destroy();

        predictionChart = null;

    }

    if (historyChart) {

        historyChart.destroy();

        historyChart = null;

    }


    // Prediction time chart

    if (predictionCanvas) {

        const recentRecords = predictionHistory
            .slice(0, 15)
            .reverse();


        predictionChart = new Chart(predictionCanvas, {

            type: "line",

            data: {

                labels: recentRecords.map((item, index) =>
                    `Prediction ${index + 1}`
                ),

                datasets: [{

                    label: "Journey Time (Minutes)",

                    data: recentRecords.map(item =>
                        Number(item.predictionMinutes)
                    ),

                    borderColor: "#38bdf8",

                    backgroundColor: "rgba(56, 189, 248, 0.15)",

                    borderWidth: 3,

                    fill: true,

                    tension: 0.35

                }]

            },

            options: {

                responsive: true,

                maintainAspectRatio: true,

                plugins: {

                    legend: {
                        display: true
                    }

                },

                scales: {

                    y: {

                        beginAtZero: true,

                        title: {
                            display: true,
                            text: "Minutes"
                        }

                    }

                }

            }

        });

    }


    // Route prediction frequency chart

    if (historyCanvas) {

        const routeCounts = {};


        predictionHistory.forEach(item => {

            const routeName = `${item.start} → ${item.destination}`;

            routeCounts[routeName] =
                (routeCounts[routeName] || 0) + 1;

        });


        const sortedRoutes = Object.entries(routeCounts)
            .sort((a, b) => b[1] - a[1])
            .slice(0, 10);


        historyChart = new Chart(historyCanvas, {

            type: "bar",

            data: {

                labels: sortedRoutes.map(item => item[0]),

                datasets: [{

                    label: "Number of Predictions",

                    data: sortedRoutes.map(item => item[1]),

                    backgroundColor: "#818cf8",

                    borderRadius: 6

                }]

            },

            options: {

                responsive: true,

                plugins: {

                    legend: {
                        display: true
                    }

                },

                scales: {

                    y: {

                        beginAtZero: true,

                        ticks: {
                            precision: 0
                        }

                    }

                }

            }

        });

    }

}


// =============================================
// 22. INITIALIZE APPLICATION
// =============================================

async function initializeApplication() {

    console.log("Initializing YatraIQ...");


    // Display saved statistics immediately

    updateDashboard();


    // Verify Flask backend

    const connected = await checkBackend();


    if (!connected) {

        console.warn(
            "Start the Flask backend to enable predictions and route loading."
        );

        return;

    }


    // Load real dataset route options

    await loadRouteOptions();


    // Initialize analytics

    updateAnalytics();


    console.log(
        "YatraIQ Frontend Loaded Successfully!"
    );

}


// Start application

initializeApplication();

