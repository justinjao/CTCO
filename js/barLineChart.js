class BarLineChart {
  constructor(_config, _data, careerDispatch) {
    this.config = {
      parentElement: _config.parentElement,
      containerWidth: 750,
      containerHeight: 500,
      tooltipPadding: 15,
      margin: {
        top: 50,
        right: 150,
        bottom: 210,
        left: 50,
      },
    };
    this.careerDispatch = careerDispatch;
    this.data = _data;
    this.initVis();
  }

  initVis() {
    let vis = this;

    // Calculate inner chart size. Margin specifies the space around the actual chart.
    vis.width =
      vis.config.containerWidth -
      vis.config.margin.left -
      vis.config.margin.right;

    vis.height =
      vis.config.containerHeight -
      vis.config.margin.top -
      vis.config.margin.bottom;

    // Initialize scales
    vis.xScale = d3.scaleBand().range([0, vis.width]).padding(0.15);
    vis.yScaleLeft = d3.scaleLinear().range([vis.height, 0]);
    vis.yScaleRight = d3.scaleBand().range([vis.height + 10.5, 10.5]);

    // Initialize axes
    vis.xAxis = d3.axisBottom(vis.xScale).tickSizeOuter(0);
    vis.yAxisLeft = d3.axisLeft(vis.yScaleLeft).tickSizeOuter(0);
    vis.yAxisRight = d3.axisRight(vis.yScaleRight).tickSizeOuter(0);

    // Define size of SVG drawing area
    vis.svg = d3
      .select(vis.config.parentElement)
      .attr("width", vis.config.containerWidth)
      .attr("height", vis.config.containerHeight);

    // SVG Group containing the actual chart; D3 margin convention
    vis.chart = vis.svg
      .append("g")
      .attr(
        "transform",
        `translate(${vis.config.margin.left}, ${vis.config.margin.top})`
      );

    // Append empty x-axis group and move it to the bottom of the chart
    vis.xAxisG = vis.chart
      .append("g")
      .attr("class", "axis x-axis")
      .attr("transform", `translate(0, ${vis.height})`);

    // Append y-axis left group
    vis.yAxisLeftG = vis.chart.append("g").attr("class", "axis y-axis-left").attr("transform", "translate(0.5, 0)");

    // Append y-axis right group
    vis.yAxisRightG = vis.chart
      .append("g")
      .attr("class", "axis y-axis-right")
      .attr("transform", `translate(${vis.width}, 0)`);

    // Append titles
    vis.chart
      .append("text")
      .attr("class", "axis-title axis-title-left")
      .attr("y", -10)
      .attr("x", 100)
      .attr("dy", ".71em")
      .style("text-anchor", "end")
      .text("↑ Number of People");

    vis.chart
      .append("text")
      .attr("class", "axis-title axis-title-right")
      .attr("y", -10)
      .attr("x", vis.width + 115)
      .attr("dy", ".71em")
      .style("text-anchor", "end")
      .text("↑ Expected Salary");

    // tendy addition: career dispatch
    vis.careerDispatch.on("CareerChanged.Bar", (c) => {
      console.log("Bar chart", c);
      vis.selectedCareer = c;
      vis.renderVis();
    });

    vis.updateVis();
  }

  updateVis() {
    let vis = this;

    const aggregatedData = d3.rollups(
      vis.data,
      (v) => v,
      (d) => d.Interested_Careers
    );

    const careerSalaryMap = [];

    for (const [career, data] of aggregatedData) {
      const salaryMap = d3.rollup(
        data,
        (v) => v.length,
        (d) => d.Expected_Salary
      );
      const salaryObject = Object.fromEntries(salaryMap);
      const salaryKey = Object.keys(salaryObject).reduce(
        (maxSalaryKey, currSalaryKey) => {
          return salaryObject[currSalaryKey] > salaryObject[maxSalaryKey]
            ? currSalaryKey
            : maxSalaryKey;
        },
        Object.keys(salaryObject)[0]
      );
      careerSalaryMap.push([career, salaryKey]);
    }

    vis.aggregatedData = Array.from(aggregatedData, ([key, value]) => ({
      key,
      value,
    }));

    vis.careerSalaryMap = Array.from(careerSalaryMap, ([key, value]) => ({
      key,
      value,
    }));

    // Specify accessor functions
    vis.xValue = (d) => d.key;
    vis.yValueLeft = (d) => d.value.length;
    vis.yValueRight = (d) => d.value;

    // Set the scale input domains
    vis.xScale.domain(vis.aggregatedData.map(vis.xValue));
    vis.yScaleLeft.domain([0, d3.max(vis.aggregatedData, vis.yValueLeft)]);
    vis.yScaleRight.domain([
      "$0 to $4,999",
      "$5,000 to $9,999",
      "$10,000 to $20,999",
      "$20,000 to $29,999",
      "$30,000 to $49,999",
      "$50,000 to $74,999",
      "$75,000 to $99,999",
      "$100,000 to $124,999",
      "$125,000 to $159,999",
      "$160,000 to $199,999",
      "$200,000 to $249,999",
      "$250,000 or over",
    ]);

    vis.renderVis();
  }

  renderVis() {
    let vis = this;

    // Add rectangles
    const bars = vis.chart
      .selectAll(".bar")
      .data(vis.aggregatedData)
      .join("rect")
      .attr("class", "bar")
      .attr("x", (d) => vis.xScale(vis.xValue(d)))
      .attr("width", vis.xScale.bandwidth())
      .attr("height", (d) => vis.height - vis.yScaleLeft(vis.yValueLeft(d)))
      .attr("y", (d) => vis.yScaleLeft(vis.yValueLeft(d)))

      // tendy addition: career dispatch
      .attr("stroke", (d) =>
        d.key === vis.selectedCareer ? "pink" : undefined
      )
      .attr("stroke-width", 5)
      .on("click", (e, d) => {
        console.log("bar clicked", d);
        let newCareer = undefined;
        if (d.key !== vis.selectedCareer) {
          newCareer = d.key;
        }
        console.log("new career", newCareer);
        vis.careerDispatch.call("CareerChanged", e, newCareer);
      });

    // Line generator
    const line = d3
      .line()
      .x((d) => vis.xScale(vis.xValue(d)) + vis.xScale.bandwidth() / 2)
      .y((d) => vis.yScaleRight(vis.yValueRight(d)) - 10.5);

    // Add lines
    const lines = vis.chart
      .append("path")
      .attr("fill", "none")
      .attr("stroke", "currentColor")
      .attr("stroke-miterlimit", 1)
      .attr("stroke-width", 2)
      .attr("d", line(vis.careerSalaryMap));

    // Update axes
    vis.xAxisG
      .call(vis.xAxis)
      .selectAll("text")
      .attr("transform", "rotate(-45) translate(-10, 0)")
      .style("text-anchor", "end");
    vis.yAxisLeftG
      .call(vis.yAxisLeft)
      .call((g) => g.select(".domain").remove());
    vis.yAxisRightG
      .call(vis.yAxisRight)
      .call((g) => g.select(".domain").remove());
  }
}
