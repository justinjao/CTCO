class DotMatrix {
  /**
   * Class constructor with initial configuration
   * @param {Object}
   */

  constructor(_config, data) {
    this.config = {
      parentElement: _config.parentElement,
      containerWidth: 600,
      containerHeight: 300,
      tooltipPadding: 15,
      margin: {
        top: 15,
        right: 15,
        bottom: 15,
        left: 15,
      },
    };
    this.data = data;
    this.initVis();
  }

  initVis() {
    let vis = this;

    // Calculate inner chart size. Margin specifies the space around the actual chart.
    vis.config.width =
      vis.config.containerWidth -
      vis.config.margin.left -
      vis.config.margin.right;
    vis.config.height =
      vis.config.containerHeight -
      vis.config.margin.top -
      vis.config.margin.bottom;
    console.log(vis.config.parentElement);
    // Define size of SVG drawing area
    vis.svg = d3
      .select(vis.config.parentElement)
      .append("svg")
      .attr("id", "dot-matrix")
      .attr("width", vis.config.containerWidth)
      .attr("height", vis.config.containerHeight);

    vis.matrixArea = vis.svg.append("g");

    vis.matrixArea
      .append("rect")
      .attr("width", vis.config.width)
      .attr("height", vis.config.height)
      .attr("class", "matrix-area")
      .attr("x", vis.config.margin.left)
      .attr("y", vis.config.margin.top);

    vis.updateVis();
  }

  updateVis() {
    let vis = this;
    vis.renderVis();
  }

  renderVis() {
    const CIRCLE_RADIUS = 6;
    const CIRCLE_DIAM = 2 * CIRCLE_RADIUS;
    const CIRCLE_SPACING = 5;
    const ROW_UNIT = CIRCLE_DIAM + CIRCLE_SPACING;
    let vis = this;
    const dots = vis.matrixArea.selectAll(".dots").data(
      vis.data.sort((a, b) =>
        a.Self_Perception.localeCompare(b.Self_Perception)
      ),
      (d) => d.ID
    );
    console.log("vis data", vis.data);
    dots
      .enter()
      .append("circle")
      .attr("class", "dot")
      .attr(
        "cx",
        (d, i) =>
          (i % Math.floor(vis.config.width / ROW_UNIT)) * ROW_UNIT +
          vis.config.margin.left +
          CIRCLE_RADIUS
      ) // Adjust the positioning
      .attr("cy", (d, i) => {
        console.log("circle ", i);

        return (
          Math.floor(i / (vis.config.width / ROW_UNIT)) * ROW_UNIT +
          vis.config.margin.top +
          CIRCLE_RADIUS
        );
      })
      .attr("r", (d) => CIRCLE_RADIUS)
      .attr("fill", (d) => {
        const perception = d.Self_Perception;
        if (perception === "Male") {
          return "orange";
        } else if (perception === "Female") {
          return "blue";
        } else if (perception === "Nonbinary") {
          return "purple";
        } else {
          return "green";
        }
      });
  }
}
