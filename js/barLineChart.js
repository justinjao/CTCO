class BarLineChart {
  constructor(_config, _data) {
    this.config = {
      parentElement: _config.parentElement,
      containerWidth: 500,
      containerHeight: 500,
      tooltipPadding: 15,
      margin: {
        top: 50,
        right: 50,
        bottom: 50,
        left: 50,
      },
    };
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
    vis.xScale = d3.scaleBand().range([0, vis.width]).padding(0.1);
    vis.yScaleLeft = d3.scaleLinear().range([vis.height, 0]);
    vis.yScaleRight = d3.scaleBand().range([vis.height, 0]);

    // Initialize axes
    vis.xAxis = d3.axisBottom(vis.xScale);
    vis.yAxisLeft = d3.axisLeft(vis.yScaleLeft);
    vis.yAxisRight = d3.axisRight(vis.yScaleRight);

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
    vis.yAxisLeftG = vis.chart.append("g").attr("class", "axis");

    // Append y-axis right group
    vis.yAxisRightG = vis.chart
      .append("g")
      .attr("class", "axis")
      .attr("transform", `translate(${vis.width + 5}, 0)`);

    // TODO: Append titles

    vis.updateVis();
  }

  updateVis() {
    let vis = this;

    const aggregatedData = d3.rollups(
      vis.data,
      (v) => v,
      (d) => d.Interested_Careers
    );
    const careerCountMap = [];
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

      careerCountMap.push([career, data.length]);
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

    // Specificy accessor functions
    vis.xValue = (d) => d.key;
    vis.yValueLeft = (d) => d.value.length;
    vis.yValueRight = (d) => d.value;

    // Set the scale input domains
    vis.xScale.domain(vis.aggregatedData.map(vis.xValue));
    vis.yScaleLeft.domain([0, d3.max(vis.aggregatedData, vis.yValueLeft)]);
    vis.yScaleRight.domain(vis.careerSalaryMap.map(vis.yValueRight));

    vis.renderVis();
  }

  renderVis() {
    let vis = this;

    console.log(vis.careerSalaryMap);

    // Add rectangles
    const bars = vis.chart
      .selectAll(".bar")
      .data(vis.aggregatedData)
      .join("rect")
      .attr("class", "bar")
      .attr("x", (d) => vis.xScale(vis.xValue(d)))
      .attr("width", vis.xScale.bandwidth())
      .attr("height", (d) => vis.height - vis.yScaleLeft(vis.yValueLeft(d)))
      .attr("y", (d) => vis.yScaleLeft(vis.yValueLeft(d)));

    const line = d3
      .line()
      .x((d) => vis.xScale(vis.xValue(d)) + vis.xScale.bandwidth() / 2)
      .y((d) => vis.yScaleRight(vis.yValueRight(d)));

    const lines = vis.chart
      .append("path")
      .attr("fill", "none")
      .attr("stroke", "currentColor")
      .attr("stroke-miterlimit", 1)
      .attr("stroke-width", 3)
      .attr("d", line(vis.careerSalaryMap));

    // Update axes
    vis.xAxisG.call(vis.xAxis);
    vis.yAxisLeftG.call(vis.yAxisLeft);
    vis.yAxisRightG.call(vis.yAxisRight);
  }
}
