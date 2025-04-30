document.addEventListener("DOMContentLoaded", function () {
    const addTripBtn = document.querySelector(".add-trip-btn");
    const tripFormContainer = document.getElementById("trip-form-container");
    const closeTripFormBtn = document.getElementById("close-form");
    const tripForm = document.getElementById("trip-form");
    const tripTableBody = document.getElementById("trip-table-body");

    const addExpenseBtn = document.querySelector(".add-expense-btn");
    const expenseFormContainer = document.getElementById("expense-form-container");
    const closeExpenseFormBtn = document.getElementById("close-expense-form");
    const expenseForm = document.getElementById("expense-form");
    const expenseList = document.getElementById("expense-list");
    const warningDiv = document.getElementById("budget-warning");

    const divisionSelect = document.getElementById("division-select");
    const tripSelectContainer = document.createElement("div");
    tripSelectContainer.classList.add("hidden", "scale-up"); // Hidden by default
    tripSelectContainer.innerHTML = `
        <label for="trip-select">Select a Trip:</label>
        <select id="trip-select"></select>
    `;
    document.getElementById("division-select-container").appendChild(tripSelectContainer);

    let trips = JSON.parse(localStorage.getItem("trips")) || [];
    let expenses = JSON.parse(localStorage.getItem("expenses")) || [];

    function toggleForm(container, show) {
        if (show) {
            container.classList.add("show");
            container.classList.remove("hidden");
        } else {
            container.classList.remove("show");
            setTimeout(() => container.classList.add("hidden"), 300);
        }
    }

    // Open Add Trip Form
    addTripBtn.addEventListener("click", () => toggleForm(tripFormContainer, true));
    closeTripFormBtn.addEventListener("click", () => toggleForm(tripFormContainer, false));

    // Open Add Expense Form
    addExpenseBtn.addEventListener("click", function () {
        if (trips.length === 0) {
            alert("No trips found! Please add a trip first.");
            return;
        }
        toggleForm(expenseFormContainer, true);
    });

    // Close Expense Form
    closeExpenseFormBtn.addEventListener("click", () => {
        toggleForm(expenseFormContainer, false);
        tripSelectContainer.classList.add("hidden");
    });

    // Handle Automatic and Manual Division Selection
    divisionSelect.addEventListener("change", function () {
        if (divisionSelect.value === "auto") {
            if (trips.length > 1) {
                tripSelectContainer.classList.remove("hidden");
                tripSelectContainer.classList.add("scale-up");
                populateTripDropdown();
            } else {
                autoDivideExpense(0);
            }
        } else if (divisionSelect.value === "manual") {
            toggleForm(expenseFormContainer, true);
            tripSelectContainer.classList.add("hidden");
        }
    });

    function populateTripDropdown() {
        const tripSelect = document.getElementById("trip-select");
        tripSelect.innerHTML = trips
            .map((trip, index) => `<option value="${index}">${trip.name}</option>`)
            .join("");

        if (tripSelect.options.length > 0) {
            tripSelect.selectedIndex = 0; // Select the first trip by default
            tripSelect.dispatchEvent(new Event("change")); // Trigger event
        }
    }

    // Handle trip selection
    document.addEventListener("change", function (event) {
        if (event.target.id === "trip-select") {
            const selectedTripIndex = event.target.value;
            autoDivideExpense(selectedTripIndex);
            toggleForm(expenseFormContainer, false);
            tripSelectContainer.classList.add("hidden");
        }
    });

    function autoDivideExpense(tripIndex) {
        const selectedTrip = trips[tripIndex];
        const budget = selectedTrip.budget;

        const transport = (budget * 0.4).toFixed(2);
        const accommodation = (budget * 0.35).toFixed(2);
        const food = (budget * 0.25).toFixed(2);

        expenses.push(
            { category: "Transportation", amount: transport, date: new Date().toISOString().split("T")[0] },
            { category: "Accommodation", amount: accommodation, date: new Date().toISOString().split("T")[0] },
            { category: "Food", amount: food, date: new Date().toISOString().split("T")[0] }
        );

        selectedTrip.budget -= (parseFloat(transport) + parseFloat(accommodation) + parseFloat(food));
        localStorage.setItem("trips", JSON.stringify(trips));
        localStorage.setItem("expenses", JSON.stringify(expenses));

        renderTrips();
        renderExpenses();
    }

    // Handle Add Trip
    tripForm.addEventListener("submit", function (event) {
        event.preventDefault();
        const trip = {
            name: document.getElementById("trip-name").value,
            location: document.getElementById("location").value,
            startDate: document.getElementById("start-date").value,
            endDate: document.getElementById("end-date").value,
            budget: parseFloat(document.getElementById("budget").value),
            spent: 0
        };
        trips.push(trip);
        localStorage.setItem("trips", JSON.stringify(trips));
        renderTrips();
        tripForm.reset();
        toggleForm(tripFormContainer, false);
    });

    // Handle Add Expense
    expenseForm.addEventListener("submit", function (event) {
        event.preventDefault();
        const amount = parseFloat(document.getElementById("expense-amount").value);
        const selectedTrip = trips[0]; // Defaulting to the first trip

        if (amount > selectedTrip.budget) {
            showWarning("The amount is too much for the remaining budget.");
            return;
        }

        selectedTrip.budget -= amount;
        localStorage.setItem("trips", JSON.stringify(trips));

        const expense = {
            category: document.getElementById("expense-category").value,
            amount: amount,
            date: document.getElementById("expense-date").value
        };

        expenses.push(expense);
        localStorage.setItem("expenses", JSON.stringify(expenses));
        renderTrips();
        renderExpenses();
        expenseForm.reset();
        toggleForm(expenseFormContainer, false);
    });

    // Render Trips
    function renderTrips() {
        tripTableBody.innerHTML = "";
        trips.forEach((trip, index) => {
            const row = document.createElement("tr");
            row.innerHTML = `
                <td>${trip.name}</td>
                <td>${trip.location}</td>
                <td>${trip.startDate}</td>
                <td>${trip.endDate}</td>
                <td>₹${trip.budget}</td>
                <td><button class="delete-btn" onclick="deleteTrip(${index})">❌</button></td>
            `;
            tripTableBody.appendChild(row);
        });
    }

    // Render Expenses
    function renderExpenses() {
        expenseList.innerHTML = "";
        expenses.forEach((expense, index) => {
            const row = document.createElement("tr");
            row.innerHTML = `
                <td>${expense.category}</td>
                <td>₹${expense.amount}</td>
                <td>${expense.date}</td>
                <td><button class="delete-btn" onclick="deleteExpense(${index})">❌</button></td>
            `;
            expenseList.appendChild(row);
        });
    }

    // Show Budget Warning
    function showWarning(message) {
        warningDiv.innerText = message;
        warningDiv.classList.remove("hidden");
    }

    window.deleteTrip = function (index) {
        trips.splice(index, 1);
        localStorage.setItem("trips", JSON.stringify(trips));
        renderTrips();
    };

    window.deleteExpense = function (index) {
        expenses.splice(index, 1);
        localStorage.setItem("expenses", JSON.stringify(expenses));
        renderExpenses();
    };

    renderTrips();
    renderExpenses();
});
