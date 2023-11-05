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
    this.activeSort = "gender";
    this.data = data;
    this.legendMapping = [
      {
        name: "gender",
        Male: "#fbb4ae",
        Female: "#b3cde3",
        Nonbinary: "#ccebc5",
        "None of the Above": "#decbe4",
      },
      {
        name: "age",
        "10-18": "#b3e2cd",
        "19-27": "#fdcdac",
        "28-36": "#cbd5e8",
        "37-45": "#f4cae4",
        "46-54": "#e6f5c9",
        "55-63": "#fff2ae",
        "64-72": "#f1e2cc",
        "73+": "#cccccc",
      },
      {
        name: "location",
        "Latin America and Caribbean": "#8dd3c7",
        "East Asia and Pacific": "#ffffb3",
        "Europe and Central Asia": "#bebada",
        "Middle East and North Africa": "#fb8072",
        "North America": "#80b1d3",
        "South Asia": "#fdb462",
        "Southeast Asia": "#b3de69",
        "Sub-Saharan Africa": "#fccde5",
      },
    ];
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

    vis.legendContainer = vis.svg
      .append("g")
      .attr("class", "dot-matrix-legend-container");
    vis.updateVis();
  }

  updateVis() {
    let vis = this;
    vis.activeLegend = vis.legendMapping.find((l) => l.name === vis.activeSort);
    if (vis.activeSort === "gender") {
      vis.data = vis.data.sort((a, b) =>
        a.Self_Perception.localeCompare(b.Self_Perception)
      );
    } else if (vis.activeSort === "location") {
      vis.data = vis.data.sort((a, b) => a.Location.localeCompare(b.Location));
    } else {
      vis.data = vis.data.sort((a, b) => a.Age.localeCompare(b.Age));
    }

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

    const dots = vis.matrixArea.selectAll(".dots").data(vis.data, (d) => d.ID);
    const dotsEnter = dots.enter().append("circle").attr("class", "dot");
    dots.exit().remove();
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
      .attr("fill", (d) => vis.renderBasedOnSort(d, vis.activeSort))
      .style("stroke", "black")
      .style("stroke-width", 0.5)
      .on("mouseover", (event, d) => {
        console.log("MOUSE OVER");
        d3
          .select("#tooltip")
          .style("display", "block")
          .style("left", event.pageX + vis.config.tooltipPadding + "px")
          .style("top", event.pageY + vis.config.tooltipPadding + "px").html(`
    
         <div><li>Age: ${d.Age}</li></div>
         <li>Gender: ${d.Self_Perception}</li>
         <li>Location: ${d.Location}</li>
           <li>University study: ${d.University_Study}</li>
           <li>Current Employment Status: ${d.Current_Employment_Status}</li>
           <li>Current Field of Work: ${d.Current_Field_of_Work}</li>
       `);
      })
      .on("mouseleave", () => {
        d3.select("#tooltip").style("display", "none");
        // Remove the outline when the mouse leaves
      });

    const legendItems = vis.legendContainer.selectAll(".legend-item").data(
      Object.keys(vis.activeLegend).filter((d) => d != "name"),
      (d) => d
    );
    legendItems.exit().remove();

    // Define the number of items per row
    const itemsPerRow = 2;

    // Calculate the width and height of each item based on DOT_UNIT
    const itemWidth = vis.config.width / itemsPerRow;
    const itemHeight = DOT_UNIT;

    const legendItemsEnter = legendItems
      .enter()
      .append("g")
      .attr("class", "legend-item")
      .attr("transform", (d, i) => {
        const x = (i % itemsPerRow) * itemWidth;
        const y = Math.floor(i / itemsPerRow) * itemHeight;
        return `translate(${x + vis.config.margin.left}, ${
          y + vis.config.height
        })`;
      });
    legendItemsEnter
      .merge(legendItems)
      .append("circle")
      .attr("r", CIRCLE_RADIUS)
      .attr("fill", (d) => vis.activeLegend[d])
      .style("stroke", "black")
      .style("stroke-width", 0.5);
    legendItemsEnter
      .merge(legendItems)
      .append("text")
      .text((d) => d)
      .attr("color", "black")
      .attr("x", DOT_UNIT)
      .attr("y", 5);
  }
  renderBasedOnSort(d, sort) {
    let vis = this;
    if (sort === "gender") {
      const perception = d.Self_Perception;
      return vis.activeLegend[perception];
    } else if (sort === "location") {
      const location = d.Location;
      return vis.activeLegend[location];
    } else {
      const age = d.Age;
      return vis.activeLegend[age];
    }
  }
}
