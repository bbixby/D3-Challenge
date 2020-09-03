// pull in a csv then format a dynamic svg chart with D3 javascript. here goes nothing!
//pull the csv data from raw GitHub
var url = 'https://raw.githubusercontent.com/bbixby/D3-challenge/master/D3_data_journalism/assets/data/data.csv'
//set the height and width of the SVG area
var svgWidth = 600;
var svgHeight = 600;

//set the margins
var margin = {
  top: 10,
  right: 10,
  bottom: 100,
  left: 100
};

//chart area less margins
var width = svgWidth - margin.left - margin.right;
var height = svgHeight - margin.top - margin.bottom;

// Create an SVG wrapper, append an SVG group that will hold our chart,
// and shift the latter by left and top margins.
var svg = d3.select("#scatter")
  .append("svg")
  .attr("width", svgWidth)
  .attr("height", svgHeight);

// Append an SVG group
var chartGroup = svg.append("g")
  .attr("transform", `translate(${margin.left}, ${margin.top})`);

// Initial Axes
var chosenXAxis = "poverty";
var chosenYAxis = "healthcare";

// function used for updating x-scale var upon click on axis label
function xScale(stateData, chosenXAxis) {
  // create x scales
  var xLinearScale = d3.scaleLinear()
    .domain([d3.min(stateData, d => d[chosenXAxis]) * 0.8,
    d3.max(stateData, d => d[chosenXAxis]) * 1.2])
    .range([0, width]);

  return xLinearScale;

}

//function used for updating y-scale var upon click on axis label
function yScale(stateData, chosenYAxis) {
  // createy scales
  var yLinearScale = d3.scaleLinear()
    .domain([d3.min(stateData, d => d[chosenYAxis]) * 0.8,
    d3.max(stateData, d => d[chosenYAxis]) * 1.2
    ]).range([height, 0]);
  
  return yLinearScale;
}

// function used for updating xAxis var upon click on axis label
function renderAxisX(newXScale, xAxis) {
  var bottomAxis = d3.axisBottom(newXScale);

  xAxis.transition()
    .duration(1000)
    .call(bottomAxis);

  return xAxis;
}

// function used for updating yAxis var upon click on y-axis label
function renderAxisY(newYScale, yAxis) {
  var leftAxis = d3.axisLeft(newYScale);

  yAxis.transition()
    .duration(1000)
    .call(leftAxis);
  
  return yAxis;
}


// function used for updating circles group with a transition to
// new circles
function renderCircles(circlesGroup, newXScale, chosenXAxis, newYScale, chosenYAxis) {

  circlesGroup.transition()
    .duration(1000)
    .attr("cx", d => newXScale(d[chosenXAxis]))
    .attr("cy", d => newYScale(d[chosenYAxis]));

  return circlesGroup;
}
//circle text labels
function renderLabels(labelsGroup, newXScale, chosenXAxis, newYScale, chosenYAxis) {
  labelsGroup.transition()
    .duration(1000)
    .attr("x", d => newXScale(d[chosenXAxis]))
    .attr("y", d => newYScale(d[chosenYAxis]));
  return labelsGroup;
}

// function used for updating circles group with new tooltip
function updateToolTip(chosenXAxis, chosenYAxis, circlesGroup) {
  //set toolTip xlabel based on selection
  var xlabel;

  if (chosenXAxis === "poverty") {
    xlabel = "Poverty%: ";
  }
  else if (chosenXAxis === "age") {
    xlabel = "Age: ";
  }
  else {
    xlabel = "Income: "
  };
  //set toolTip ylabel based on selection
  var ylabel;

  if (chosenYAxis === "healthcare") {
    ylabel = "Lacks Healthcare%: ";
  }
  else if (chosenYAxis === "obesity") {
    ylabel = "Obesity%: "
  }
  else {
    ylabel = "Smokes%: "
  };
  //style the toolTip
  var toolTip = d3.tip()
    .attr("class", "tooltip")
    .offset([80, -60])
    .style("background", "lightyellow")
    //toolTip data function: contains state | abbr, followed by x and ylabels and values
    .html(function(data) {
      return (`${data.state} | ${data.abbr}<br>${xlabel} ${data[chosenXAxis]}<br>${ylabel} ${data[chosenYAxis]}`);
    });
//call toolTip into circlesGroup
  circlesGroup.call(toolTip);

  //display toolTip data on mouseover; remove on mouseout
  circlesGroup.on("mouseover", function(data) {
    toolTip.show(data);
  })
    // onmouseout event
    .on("mouseout", function(data, index) {
      toolTip.hide(data);
    });

  return circlesGroup;
}

// Retrieve data from the raw GitHub CSV file and execute everything below
d3.csv(url).then(function(stateData) {

  // parse data
  stateData.forEach(data => {
    data.poverty = +data.poverty;
    data.age = +data.age;
    data.income = +data.income;
    data.healthcare = +data.healthcare;
    data.obesity = +data.obesity;
    data.smokes = +data.smokes;
  });

  // xLinearScale function above csv import
  var xLinearScale = xScale(stateData, chosenXAxis);

  // Create y scale function
  var yLinearScale = yScale(stateData, chosenYAxis);

  // Create initial axis functions
  var bottomAxis = d3.axisBottom(xLinearScale);
  var leftAxis = d3.axisLeft(yLinearScale);

  // append x axis
  var xAxis = chartGroup.append("g")
    .classed("x-axis", true)
    .attr("transform", `translate(0, ${height})`)
    .call(bottomAxis);

  // append y axis
  var yAxis = chartGroup.append("g")
    .classed("y-axis", true)
    .call(leftAxis);

  // append initial circles
  var circlesGroup = chartGroup.selectAll("circle")
    .data(stateData)
    .enter()
    .append("circle")
    .attr("cx", d => xLinearScale(d[chosenXAxis]))
    .attr("cy", d => yLinearScale(d[chosenYAxis]))
    .attr("r", 20)
    .attr("fill", "green")
    .attr("opacity", ".5");

  //append circle text labels
  var labelsGroup = chartGroup.selectAll(".stateText")
    .data(stateData)
    .enter()
    .append("text")
    .classed("stateText", true)
    .attr("x", d => xLinearScale(d[chosenXAxis]))
    .attr("y", d => yLinearScale(d[chosenYAxis]))
    .attr("dy", 3)
    .attr("font-size", "12px")
    .text(function (d) { return d.abbr });

  // Create group for three x-axis labels: poverty, age, and income
  var xlabelsGroup = chartGroup.append("g")
    .attr("transform", `translate(${width / 2}, ${height + 20})`);

  var povertyLabel = xlabelsGroup.append("text")
    .attr("x", 0)
    .attr("y", 20)
    .attr("value", "poverty") // value to grab for event listener
    .classed("active", true)
    .text("In Poverty (%)");

  var ageLabel = xlabelsGroup.append("text")
    .attr("x", 0)
    .attr("y", 40)
    .attr("value", "age") // value to grab for event listener
    .classed("inactive", true)
    .text("Age (Median)");
  
  var incomeLabel = xlabelsGroup.append("text")
    .attr("x", 0)
    .attr("y", 60)
    .attr("value", "income")
    .classed("inactive", true)
    .text("Household Income (Median)");

// Create group for three y-axis labels: healthcare, smokes, and obesity
  var ylabelsGroup = chartGroup.append("g")
    .attr("transform", `translate(${0-(margin.left/3)},${height/2})`)

  var healthcareLabel = ylabelsGroup.append("text")
    .attr("x", 0)
    .attr("y", 0 - 40)
    .attr("value", "healthcare") // value to grab for event listener
    .classed("active", true)
    .text("Lacks Healthcare (%)")
    .attr("transform", "rotate(-90)");

  var smokesLabel = ylabelsGroup.append("text")
    .attr("x", 0)
    .attr("y", 0 - 20)
    .attr("value", "smokes")
    .classed("inactive", true)
    .text("Smokes (%)")
    .attr("transform", "rotate(-90)");

  var obesityLabel = ylabelsGroup.append("text")
    .attr("x", 0)
    .attr("y", 0)
    .attr("value", "obesity")
    .classed("inactive", true)
    .text("Obesity (%)")
    .attr("transform", "rotate(-90)");

  // x axis labels event listener
  xlabelsGroup.selectAll("text")
    .on("click", function() {
      // get value of selection
      var value = d3.select(this).attr("value");
      if (value !== chosenXAxis) {

        // replaces chosenXAxis with value
        chosenXAxis = value;
//commented out debugging chosenXAxis console.log
//console.log(chosenXAxis);

        // functions here found above csv import
        // updates x scale for new data
        xLinearScale = xScale(stateData, chosenXAxis);

        // updates x axis with transition
        xAxis = renderAxisX(xLinearScale, xAxis);

        // updates circles with new x values
        circlesGroup = renderCircles(circlesGroup, xLinearScale, chosenXAxis, yLinearScale, chosenYAxis);
        //update circle text labels
        labelsGroup = renderLabels(labelsGroup, xLinearScale, chosenXAxis, yLinearScale, chosenYAxis);

        // updates tooltips with new info
        circlesGroup = updateToolTip(chosenXAxis, chosenYAxis, circlesGroup);

        // changes classes to change bold text in xaxis nav
        if (chosenXAxis === "poverty") {
          povertyLabel
            .classed("active", true)
            .classed("inactive", false);
          ageLabel
            .classed("active", false)
            .classed("inactive", true);
          incomeLabel
            .classed("active", false)
            .classed("inactive", true);
        }
        else if (chosenXAxis === "age") {
          povertyLabel
            .classed("active", false)
            .classed("inactive", true);
          ageLabel
            .classed("active", true)
            .classed("inactive", false);
          incomeLabel
            .classed("active", false)
            .classed("inactive", true);
        }
        else {
          povertyLabel
            .classed("active", false)
            .classed("inactive", true);
          ageLabel
            .classed("active", false)
            .classed("inactive", true);
          incomeLabel
            .classed("active", true)
            .classed("inactive", false);          
        }
      }
    });
  
  //y-axis event listener; same steps as commented above in xlabelsGroup
  ylabelsGroup.selectAll("text")
    .on("click", function () {
      var value = d3.select(this).attr("value");
      if (value !==chosenYAxis) {
        chosenYAxis = value;
  console.log(chosenYAxis);
        yLinearScale = yScale(stateData, chosenYAxis);
        yAxis = renderAxisY(yLinearScale, yAxis);
        circlesGroup = renderCircles(circlesGroup, xLinearScale, chosenXAxis, yLinearScale, chosenYAxis);
        labelsGroup = renderLabels(labelsGroup, xLinearScale, chosenXAxis, yLinearScale, chosenYAxis);
        circlesGroup = updateToolTip(chosenXAxis, chosenYAxis, circlesGroup);
        if (chosenYAxis === 'healthcare') {
          healthcareLabel
            .classed('active', true)
            .classed('inactive', false);
          smokesLabel
            .classed('active', false)
            .classed('inactive', true);
          obesityLabel
            .classed('active', false)
            .classed('inactive', true);
        }
        else if (chosenYAxis === 'smokes') {
          healthcareLabel
            .classed('active', false)
            .classed('inactive', true);
          smokesLabel
            .classed('active', true)
            .classed('inactive', false);
          obesityLabel
            .classed('active', false)
            .classed('inactive', true);
        }
        else {
          healthcareLabel
            .classed('active', false)
            .classed('inactive', true);
          smokesLabel
            .classed('active', false)
            .classed('inactive', true);
          obesityLabel
            .classed('active', true)
            .classed('inactive', false);
        }
      }
    });
  //update toolTip labels and data with this function
  updateToolTip(chosenXAxis, chosenYAxis, circlesGroup);

}).catch(function(error) {
  console.log(error);
});
