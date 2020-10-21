
// === === CHART INIT === ===

// === Global Variables ===
let dataset;
let type = d3.select("#group-by").node().value;
let sortTopDown = true;

// === Margin Convention ===
const margin = {top: 50, right: 50, bottom: 50, left: 50}
const width = 650 - margin.left - margin.right,
      height = 500 - margin.top - margin.bottom;

// === SVG ===
const svg = d3.select(".chart").append("svg")
    .attr("width", width + margin.left + margin.right)
    .attr("height", height + margin.top + margin.bottom)
    .append("g")
    .attr("transform", "translate(" + margin.left + "," + margin.top + ")");

// === Scales  ===
const xScale = d3.scaleBand()
    .rangeRound([0, width])
    .paddingInner(0.1);

const yScale = d3.scaleLinear()
    .rangeRound([0, height]);

// === Axes ===
const xAxis = d3.axisBottom();
const yAxis = d3.axisLeft();

// === Axes Containers ===
const yAxisSVG = svg.append("g")
                    .attr("class", "axis y-axis")

const xAxisSVG = svg.append("g")
                    .attr("class", "axis x-axis")
                    .attr("transform", `translate(0, ${height})`)

const yAxisTitle = svg.append("text")
                        .attr("class", "axis y-title")
	                    .attr("x", -20)
                        .attr("y", -10)
    
// === === CHART UPDATE FUNCTION === ===
function update(data, type) {

    console.log('called update')

    // update the global dataset
    dataset = data;

    // sort high to low (left to right)
    if(sortTopDown) {
        data = data.sort((a, b) => a[type] < b[type] ? 1 : a[type] > b[type] ? -1 : 0)
    }
    else {
        data = data.sort((a, b) => a[type] < b[type] ? -1 : a[type] > b[type] ? 1 : 0)
    }
    
    // === Update Scales & Axes === 
    xScale.domain(data.map(d => d.company));  
    yScale.domain([d3.max(data.map(d => d[type])), 0]); // added zero baseline
        
    xAxis.scale(xScale);
    yAxis.scale(yScale);

    // === Draw Axes Using Updated Scales ===
    xAxisSVG.transition()
            .duration(1000)
            .call(xAxis);

    yAxisSVG.transition()
            .duration(1000)
            .call(yAxis);

    // === Update Axes Title ===
    yAxisTitle.text(type);

    // === Draw Rects ===
    const bars = svg.selectAll(".bar")
                    .data(data, d => d.company); // key function

    // === Implement Enter-Update-Exit ===

    bars.enter()
            .append("rect")
            .attr("class", "bar")
            .attr("x", d => xScale(d.company))
            .attr("y", d => yScale(d[type]))
            .attr("width", xScale.bandwidth())
            .attr("height", d => height - yScale(d[type]))
        .merge(bars)    // update
            .transition()
            .duration(1000)
            .attr("x", d => xScale(d.company))
            .attr("y", d => yScale(d[type]))
            .attr("width", xScale.bandwidth())
            .attr("height", d => height - yScale(d[type]))
            
    bars.exit()
        .transition()
        .duration(500)
        .attr("x", width)
        .remove();    
        
}

// === === CHART UPDATES === ===
d3.csv('coffee-house-chains.csv', d3.autoType)
    .then(data => {
        update(data, type);
    });

// === Handling the type change ===
document.getElementById("group-by")
        .addEventListener("change", event => {
            type = event.target.value; // update the type!
            update(dataset, type);
        });

// === Handling the sorting direction change ===
document.getElementById("sort-button")
    .addEventListener("click", event => {
        sortTopDown = !sortTopDown; // invert sort direction
        update(dataset, type);
    });

