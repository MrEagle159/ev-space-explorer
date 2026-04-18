// ================= DATA =================
var data = [];

// ================= START =================
window.onload = function () {
    loadData();
};

// ================= LOAD DATA =================
function loadData() {
    fetch("data.json")
        .then(function (res) {
            return res.json();
        })
        .then(function (result) {
            data = result;

            showPage("home");
            addBrands();
            addCars();
            showTable(data);       
            makeCharts();  
            updateSliders();   
        });
}

// ================= PAGE SWITCH =================
function showPage(id) {
    var pages = document.getElementsByClassName("page");
    var mainHeading = document.getElementById("mainHeading");

    for (var i = 0; i < pages.length; i++) {
        pages[i].style.display = "none";
    }

    document.getElementById(id).style.display = "block";

    if (mainHeading) {
        var hideHeadingPages = ["charts", "predict", "compare"];
        mainHeading.style.display = hideHeadingPages.indexOf(id) !== -1 ? "none" : "block";
    }
}

// ================= BRAND DROPDOWN =================
function addBrands() {
    var select = document.getElementById("brandFilter");

    // Default option
    select.innerHTML = "<option value=''>All Brands</option>";

    var used = [];

    for (var i = 0; i < data.length; i++) {
        var brand = data[i].brand;

        if (used.indexOf(brand) == -1) {
            used.push(brand);

            var option = document.createElement("option");
            option.value = brand;
            option.textContent = brand;

            select.appendChild(option);
        }
    }
}

// ================= SEARCH + FILTER =================
function filterData() {
    var brand = document.getElementById("brandFilter").value;
    var search = document.getElementById("searchModel").value.toLowerCase();

    var result = [];

    for (var i = 0; i < data.length; i++) {
        var car = data[i];

        // BRAND CHECK
        if (brand !== "" && car.brand !== brand) {
            continue;
        }

        // SEARCH CHECK
        var model = car.model.toLowerCase();
        if (search !== "" && model.indexOf(search) === -1) {
            continue;
        }

        result.push(car);
    }

    showTable(result);
}

// ================= TABLE =================
function showTable(list) {
    var table = document.getElementById("table");

    if (list.length === 0) {
        table.innerHTML = "<tr><td>No Data Found</td></tr>";
        return;
    }

    var keys = Object.keys(list[0]);

    var html = "<tr>";

    // HEADER
    for (var i = 0; i < keys.length; i++) {
        html += "<th>" + keys[i] + "</th>";
    }
    html += "</tr>";

    // ROWS
    for (var i = 0; i < list.length; i++) {
        html += "<tr>";

        for (var j = 0; j < keys.length; j++) {
            html += "<td>" + list[i][keys[j]] + "</td>";
        }

        html += "</tr>";
    }

    table.innerHTML = html;
}
// ================= CHARTS =================
function makeCharts() {

    // ================= SCATTER =================
    var x = [];
    var y = [];
    var text = [];

    for (var i = 0; i < data.length; i++) {
        x.push(data[i].top_speed_kmh);
        y.push(data[i].range_km);
        text.push(data[i].model);
    }

    var scatter = {
        x: x,
        y: y,
        text: text,
        mode: "markers",
        type: "scatter",

        marker: {
            size: 12,
            color: y,                 // color based on range
            colorscale: "Rainbow",    // 🌈 colorful
            showscale: true
        }
    };

    Plotly.newPlot("scatter", [scatter], {
    title: "Speed vs Range",
    width: 940,     
        height: 500,
    paper_bgcolor: "black",
    plot_bgcolor: "black",

    font: { color: "white" },

    xaxis: {
        title: "Top Speed",
        gridcolor: "#444"          
    },

    yaxis: {
        title: "Range",
        gridcolor: "#444"
    }
});

    // ================= BAR =================
    var brands = [];
    var sums = [];
    var counts = [];

    for (var i = 0; i < data.length; i++) {

        var b = data[i].brand;
        var index = brands.indexOf(b);

        if (index == -1) {
            brands.push(b);
            sums.push(data[i].range_km);
            counts.push(1);
        } else {
            sums[index] += data[i].range_km;
            counts[index] += 1;
        }
    }

    var avg = [];

    for (var i = 0; i < brands.length; i++) {
        avg.push(sums[i] / counts[i]);
    }

    var bar = {
        x: brands,
        y: avg,
        type: "bar",

        marker: {
            color: "#00ff9f"   
        }
    };

    Plotly.newPlot("bar", [bar], {
        title: "Average Range by Brand",
        width: 940,     
        height: 500, 
        paper_bgcolor: "black",   // 🔥 background
        plot_bgcolor: "black",
        font: { color: "white" }
    });
}

// ================= COMPARE =================
function addCars() {

    var c1 = document.getElementById("car1");
    var c2 = document.getElementById("car2");
    var table = document.getElementById("compareTable");

    c1.innerHTML = "";
    c2.innerHTML = "";

    c1.add(new Option("Select first model", ""));
    c2.add(new Option("Select second model", ""));

    for (var i = 0; i < data.length; i++) {

        var name = data[i].model;

        c1.add(new Option(name, name));
        c2.add(new Option(name, name));
    }

    c1.onchange = compareCars;
    c2.onchange = compareCars;
    table.innerHTML = "";
}

function compareCars() {

    var name1 = document.getElementById("car1").value;
    var name2 = document.getElementById("car2").value;

    var ev1 = null;
    var ev2 = null;

    for (var i = 0; i < data.length; i++) {
        if (data[i].model == name1) ev1 = data[i];
        if (data[i].model == name2) ev2 = data[i];
    }

    if (!ev1 || !ev2) {
        document.getElementById("compareTable").innerHTML = "";
        return;
    }

    var table = document.getElementById("compareTable");

    var keys = Object.keys(ev1);

    var html = "<tr><th>Feature</th><th>" + name1 + "</th><th>" + name2 + "</th></tr>";

    for (var i = 0; i < keys.length; i++) {
        html += "<tr>";
        html += "<td>" + keys[i] + "</td>";
        html += "<td>" + ev1[keys[i]] + "</td>";
        html += "<td>" + ev2[keys[i]] + "</td>";
        html += "</tr>";
    }

    table.innerHTML = html;
}

// ================= PREDICT =================
function predictRange() {

    var battery = Number(document.getElementById("battery").value);
    var efficiency = Number(document.getElementById("efficiency").value);
    var speed = Number(document.getElementById("topSpeed").value);
    var acc = Number(document.getElementById("acceleration").value);

    var range = (battery * 1000 / efficiency) - (speed * 0.2) - (acc * 2);

    if (range < 50) {
        range = 50;
    }

    document.getElementById("result").innerHTML =
        "🔋 Estimated Range: <b>" + range.toFixed(2) + " km</b>";
}

// ================= SLIDERS =================
function updateSliders() {
    var sliders = document.querySelectorAll("input[type=range]");

    for (var i = 0; i < sliders.length; i++) {
        sliders[i].oninput = function () {
            document.getElementById(this.id + "Val").innerText = this.value;
        };
    }
}

// ================= CHATBOT =================
function ask() {

    var q = document.getElementById("question").value.toLowerCase();
    var answer = "";

    if (q.indexOf("average range") != -1) {

        var sum = 0;

        for (var i = 0; i < data.length; i++) {
            sum += data[i].range_km;
        }

        var avg = sum / data.length;
        answer = "The average EV range is " + avg.toFixed(2) + " km.";
    }

    else if (q.indexOf("fastest") != -1) {

        var fastest = data[0];

        for (var i = 1; i < data.length; i++) {
            if (data[i].top_speed_kmh > fastest.top_speed_kmh) {
                fastest = data[i];
            }
        }

        answer = "The fastest EV is " + fastest.model + " with a top speed of " + fastest.top_speed_kmh + " km/h.";
    }

    else if (q.indexOf("best range") != -1 || q.indexOf("highest range") != -1 || q.indexOf("longest range") != -1) {

        var bestRange = data[0];

        for (var i = 1; i < data.length; i++) {
            if (data[i].range_km > bestRange.range_km) {
                bestRange = data[i];
            }
        }

        answer = bestRange.model + " has the highest range at " + bestRange.range_km + " km.";
    }

    else if (q.indexOf("how many ev") != -1 || q.indexOf("total ev") != -1 || q.indexOf("number of cars") != -1) {
        answer = "This project currently contains " + data.length + " EV records.";
    }

    else if (q.indexOf("average battery") != -1) {

        var batterySum = 0;

        for (var i = 0; i < data.length; i++) {
            batterySum += data[i].battery_capacity_kwh;
        }

        answer = "The average battery capacity is " + (batterySum / data.length).toFixed(2) + " kWh.";
    }

    else if (q.indexOf("average speed") != -1 || q.indexOf("average top speed") != -1) {

        var speedSum = 0;

        for (var i = 0; i < data.length; i++) {
            speedSum += data[i].top_speed_kmh;
        }

        answer = "The average top speed is " + (speedSum / data.length).toFixed(2) + " km/h.";
    }

    else if (q.indexOf("how many brands") != -1 || q.indexOf("total brands") != -1) {

        var brands = [];

        for (var i = 0; i < data.length; i++) {
            if (brands.indexOf(data[i].brand) === -1) {
                brands.push(data[i].brand);
            }
        }

        answer = "There are " + brands.length + " EV brands in this dataset.";
    }

    else if (q.indexOf("compare") != -1) {
        answer = "Go to the Compare page, choose two EV models, and the table will show their specifications side by side.";
    }

    else if (q.indexOf("predict") != -1 || q.indexOf("prediction") != -1) {
        answer = "On the Predict Range page, adjust battery, efficiency, top speed, and acceleration to estimate EV range.";
    }

    else if (q.indexOf("charts") != -1 || q.indexOf("visualization") != -1 || q.indexOf("graph") != -1) {
        answer = "The Charts page includes a scatter plot for speed vs range and a bar chart for average range by brand.";
    }

    else if (q.indexOf("explore") != -1 || q.indexOf("table") != -1) {
        answer = "The Explore page lets you search EV models, filter by brand, and browse all specifications in a table.";
    }

    else if (q.indexOf("help") != -1 || q.indexOf("what can i ask") != -1) {
        answer = "You can ask about average range, fastest EV, best range, average battery, average speed, total EVs, total brands, charts, compare, explore, or prediction.";
    }

    else {
        answer = "Try asking about average range, fastest EV, best range, average battery, total EVs, brands, charts, compare, or prediction.";
    }

    document.getElementById("answer").innerText = answer;
}

// ================= START =================
window.onload = loadData;
