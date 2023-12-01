class DotMatrix {
  /**
   * Class constructor with initial configuration
   * @param {Object}
   */

  constructor(_config, data, careerDispatch) {
    this.config = {
      parentElement: _config.parentElement,
      containerWidth: 650,
      containerHeight: 600,
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
    this.careerDispatch = careerDispatch;
    this.legendMapping = DOT_MATRIX_LEGEND_MAPPING;
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

    vis.careerDispatch.on("CareerChanged.Matrix", function (c, e) {
      vis.selectedCareer = c;
      vis.renderVis();
    });
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
    } else if (vis.activeSort === "university-study") {
      vis.data = vis.data.sort((a, b) =>
        vis.findAggregateName(a).localeCompare(vis.findAggregateName(b))
      );
    } else {
      vis.data = vis.data.sort((a, b) => a.Age.localeCompare(b.Age));
    }

    vis.renderVis();
  }

  renderVis() {
    let vis = this;
    const CIRCLE_RADIUS = vis.data.length < MAX_BIG_SIZE ? 6 : 4;
    const CIRCLE_DIAM = 2 * CIRCLE_RADIUS;
    const CIRCLE_SPACING = vis.data.length < MAX_BIG_SIZE ? 5 : 2;
    const DOT_UNIT = CIRCLE_DIAM + CIRCLE_SPACING;
    const DOTS_PER_ROW = Math.floor(vis.config.width / DOT_UNIT);
    const ROW_OFFSET = vis.config.margin.left + CIRCLE_RADIUS;

    const dots = vis.matrixArea.selectAll(".dot").data(vis.data, (d) => d.ID);
    dots.exit().remove();
    const dotsEnter = dots
      .enter()
      .append("circle")
      .attr("class", (d, i) => `dot d-${i}`);
    let lastDotYPos = 0;
    dotsEnter
      .merge(dots)
      .attr("r", (d) => CIRCLE_RADIUS)
      .attr("fill", (d) => vis.renderBasedOnSort(d, vis.activeSort))

      .style("stroke", "black")
      .style("stroke-width", (d) =>
        d.Interested_Careers === vis.selectedCareer ? 1.5 : 0.5
      )
      .on("mouseover", (event, d) => {
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
           <li>Career Aspirations: ${d.Interested_Careers}</li>
       `);
      })
      .on("mouseleave", () => {
        d3.select("#tooltip").style("display", "none");
        // Remove the outline when the mouse leaves
      })
      .on("click", (e, d) => {
        let newCareer = undefined;
        if (vis.selectedCareer !== d.Interested_Careers) {
          newCareer = d.Interested_Careers;
        }
        vis.careerDispatch.call("CareerChanged", e, newCareer);
      })
      .style("opacity", (d) =>
        vis.selectedCareer && d.Interested_Careers !== vis.selectedCareer
          ? 0.5
          : 1
      );

    if (vis.data.length < MAX_BIG_SIZE) {
      dotsEnter
        .merge(dots)
        .transition()
        .duration(500)
        .attr("cx", (d, i) => (i % DOTS_PER_ROW) * DOT_UNIT + ROW_OFFSET)
        .attr("cy", (d, i) => {
          lastDotYPos =
            Math.floor(i / DOTS_PER_ROW) * DOT_UNIT +
            vis.config.margin.top +
            CIRCLE_RADIUS;
          return lastDotYPos;
        });
    } else {
      dotsEnter
        .merge(dots)
        .attr("cx", (d, i) => (i % DOTS_PER_ROW) * DOT_UNIT + ROW_OFFSET)
        .attr("cy", (d, i) => {
          lastDotYPos =
            Math.floor(i / DOTS_PER_ROW) * DOT_UNIT +
            vis.config.margin.top +
            CIRCLE_RADIUS;
          return lastDotYPos;
        });
    }

    const legendItems = vis.legendContainer.selectAll(".legend-item").data(
      Object.keys(vis.activeLegend).filter((d) => d != "name"),
      (d) => d
    );
    legendItems.exit().remove();

    // Define the number of items per row
    const itemsPerRow = 2;

    // Calculate the width and height of each item based on DOT_UNIT
    const itemWidth = vis.config.width / itemsPerRow;
    const itemHeight = 17;

    const legendItemsEnter = legendItems
      .enter()
      .append("g")
      .attr("class", "legend-item");

    legendItemsEnter.merge(legendItems).attr("transform", (d, i) => {
      const x = (i % itemsPerRow) * itemWidth;
      const y = Math.floor(i / itemsPerRow) * itemHeight;
      return `translate(${x + vis.config.margin.left}, ${
        y +
        Math.max(
          lastDotYPos + 50,
          vis.config.height - vis.config.margin.bottom - 80
        )
      })`;
    });
    legendItemsEnter
      .append("circle")
      .attr("r", 6)
      .attr("fill", (d) => vis.activeLegend[d])
      .style("stroke", "black")
      .style("stroke-width", 0.5);

    legendItemsEnter
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
    } else if (sort === "university-study") {
      return vis.activeLegend[vis.findAggregateName(d)];
    } else {
      const age = d.Age;
      return vis.activeLegend[age];
    }
  }
  findAggregateName(d) {
    let vis = this;

    const names = Object.keys(AGGREGATED_CATEGORY_LOOKUP);
    for (let i = 0; i < names.length; i++) {
      if (AGGREGATED_CATEGORY_LOOKUP[names[i]].includes(d.University_Study)) {
        return names[i];
      }
    }
    return "invalid";
  }
}
