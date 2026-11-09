// =====================================
// YatraIQ - SMART JOURNEY PREDICTION
// =====================================

const API_URL = "http://127.0.0.1:5000";

// =====================================
// 1. PAGE NAVIGATION
// =====================================

const navigationLinks = document.querySelectorAll("[data-page]");
const pages = document.querySelectorAll(".page");

navigationLinks.forEach(link => {

    link.addEventListener("click", function(event) {

        event.preventDefault();

        const targetPage = this.dataset.page;

        // Hide all pages
        pages.forEach(page => {
            page.classList.remove("active");
        });

        // Show selected page
        const selectedPage = document.getElementById(targetPage);

        if (selectedPage) {
            selectedPage.classList.add("active");
        }

        // Update active navigation
        navigationLinks.forEach(item => {
            item.classList.remove("active");
        });

        document.querySelectorAll(
            `[data-page="${targetPage}"]`
        ).forEach(item => {
            item.classList.add("active");
        });

    });

});


// =====================================
// 2. BACKEND HEALTH CHECK
// =====================================

async function checkBackend() {

    try {

        const response = await fetch(`${API_URL}/health`);

        const data = await response.json();

        console.log("YatraIQ Backend:", data);

        if (data.status === "healthy") {
            console.log("ML Model Connected Successfully!");
        }

    } catch (error) {

        console.error("Backend connection failed:", error);

    }

}

checkBackend();


// =====================================
// 3. PREDICTION HISTORY
// =====================================

let predictionHistory = JSON.parse(
    localStorage.getItem("yatraiqHistory") || "[]"
);


// =====================================
// 4. JOURNEY TIME PREDICTION
// =====================================

const predictionForm = document.getElementById("predictionForm");

if (predictionForm) {

    predictionForm.addEventListener("submit", async function(event) {

        event.preventDefault();

        const result = document.getElementById("predictionResult");

        result.style.display = "block";
        result.className = "prediction-result";

        result.innerHTML = "Predicting journey time...";

        // Collect form inputs
        const formData = new FormData(predictionForm);

        const payload = {

            direction: formData.get("direction"),

            segment: formData.get("segment"),

            start_point: formData.get("start_point"),

            end_point: formData.get("end_point"),

            day_of_week: Number(formData.get("day_of_week")),

            month: Number(formData.get("month")),

            departure_hour: Number(formData.get("departure_hour")),

            departure_minute: Number(formData.get("departure_minute"))

        };

        try {

            // Send data to Flask backend
            const response = await fetch(`${API_URL}/predict`, {

                method: "POST",

                headers: {
                    "Content-Type": "application/json"
                },

                body: JSON.stringify(payload)

            });

            const output = await response.json();

            if (!response.ok || !output.success) {

                throw new Error(
                    output.error || "Prediction failed"
                );

            }

            const minutes = output.predicted_time_minutes;

            // Display result
            result.className = "prediction-result success";

            result.innerHTML = `
                <h2>Prediction Successful!</h2>

                <h1>${minutes} Minutes</h1>

                <p>
                    Predicted Journey Time
                </p>

                <p>
                    ${output.predicted_time_seconds} Seconds
                </p>
            `;

            // Save history
            const record = {

                time: new Date().toLocaleString(),

                start: payload.start_point,

                destination: payload.end_point,

                prediction: minutes

            };

            predictionHistory.unshift(record);

            localStorage.setItem(
                "yatraiqHistory",
                JSON.stringify(predictionHistory)
            );

            updateDashboard();

        }

        catch (error) {

            result.className = "prediction-result error";

            result.innerHTML = `
                <h3>Prediction Error</h3>
                <p>${error.message}</p>
            `;

            console.error(error);

        }

    });

}


// =====================================
// 5. UPDATE DASHBOARD
// =====================================

function updateDashboard() {

    const total = predictionHistory.length;

    const totalElement = document.getElementById("totalPredictions");

    if (totalElement) {
        totalElement.textContent = total;
    }

    const averageElement = document.getElementById("averageTime");

    if (averageElement) {

        const average = total
            ? predictionHistory.reduce(
                (sum, item) => sum + Number(item.prediction), 0
            ) / total
            : 0;

        averageElement.textContent = average.toFixed(1) + " min";

    }

    updateHistory();

}


// =====================================
// 6. DISPLAY PREDICTION HISTORY
// =====================================

function updateHistory() {

    const historyTable = document.getElementById("historyTable");

    if (!historyTable) return;

    historyTable.innerHTML = "";

    predictionHistory.forEach(item => {

        const row = document.createElement("tr");

        const values = [
            item.time,
            item.start,
            item.destination,
            item.prediction + " min"
        ];

        values.forEach(value => {

            const cell = document.createElement("td");

            cell.textContent = value;

            row.appendChild(cell);

        });

        historyTable.appendChild(row);

    });

}


// =====================================
// 7. INITIALIZE DASHBOARD
// =====================================

updateDashboard();

console.log("YatraIQ Frontend Loaded Successfully!");
