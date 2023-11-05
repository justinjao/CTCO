class DotMatrix {
  /**
   * Class constructor with initial configuration
   * @param {Object}
   */

  constructor(_config, data) {
    this.config = {
      parentElement: _config.parentElement,
      containerWidth: 800,
      containerHeight: 500,
      tooltipPadding: 15,
      margin: {
        top: 50,
        right: 50,
        bottom: 50,
        left: 50,
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

    vis.yAxisTitle = vis.matrixArea
      .append("text")
      .attr("class", "axis-title")
      .attr("x", 10)
      .attr("y", 10)
      .attr("dy", ".95em")
      .text("Demographics");

    vis.updateVis();
  }

  updateVis() {
    let vis = this;
    vis.renderVis();
  }

  renderVis() {
    let vis = this;
    const CIRCLE_RADIUS = 6;
    const CIRCLE_DIAM = 2 * CIRCLE_RADIUS;
    const CIRCLE_SPACING = 5;
    const DOT_UNIT = CIRCLE_DIAM + CIRCLE_SPACING;
    const DOTS_PER_ROW = Math.floor(vis.config.width / DOT_UNIT);
    const ROW_OFFSET = vis.config.margin.left + CIRCLE_RADIUS;

    const dots = vis.matrixArea.selectAll(".dots").data(
      vis.data.sort((a, b) =>
        a.Self_Perception.localeCompare(b.Self_Perception)
      ),
      (d) => d.ID
    );
    const dotsEnter = dots.enter().append("circle").attr("class", "dot");

    dotsEnter
      .merge(dots)
      .attr("cx", (d, i) => (i % DOTS_PER_ROW) * DOT_UNIT + ROW_OFFSET) // Adjust the positioning
      .attr("cy", (d, i) => {
        return (
          Math.floor(i / DOTS_PER_ROW) * DOT_UNIT +
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
      })
      .on("mouseover", (event, d) => {
        console.log("MOUSE OVER");
        d3
          .select("#tooltip")
          .style("display", "block")
          .style("left", event.pageX + vis.config.tooltipPadding + "px")
          .style("top", event.pageY + vis.config.tooltipPadding + "px").html(`
         <div class="tooltip-title">${d.ID}</div>
         <div><i>${d.Age}</i></div>
           <li>University study: ${d.University_Study}</li>
       `);
      })
      .on("mouseleave", () => {
        d3.select("#tooltip").style("display", "none");
        // Remove the outline when the mouse leaves
      });
  }
}
