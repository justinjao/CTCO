class TreeMap {
  /**
   * Class constructor with initial configuration
   * @param {Object}
   */

  constructor(_config, data, filterDispatch) {
    this.config = {
      parentElement: _config.parentElement,
      containerWidth: 584,
      containerHeight: 500,
      tooltipPadding: 15,
      margin: {
        top: 0,
        right: 0,
        bottom: 30,
        left: 50,
      },
    };
    this.data = data;
    this.dispatch = filterDispatch;
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

    vis.tileWidth = vis.config.width / 2.514;
    // Define size of SVG drawing area
    vis.svg = d3
      .select(vis.config.parentElement)
      .append("svg")
      .attr("id", "treemap")
      .attr("width", vis.config.containerWidth)
      .attr("height", vis.config.containerHeight);

    vis.treeArea = vis.svg.append("g");

    // Calculate the x and y coordinates to center treeArea
    const xCenter =
      (vis.config.containerWidth -
        vis.config.margin.left -
        vis.config.margin.right -
        vis.config.width) /
      2;
    const yCenter =
      (vis.config.containerHeight -
        vis.config.margin.top -
        vis.config.margin.bottom -
        vis.config.height) /
      2;

    vis.treeArea
      .append("rect")
      .attr("width", vis.config.width)
      .attr("height", vis.config.height)
      .attr("class", "tree-area")
      .attr("x", vis.config.margin.left + xCenter)
      .attr("y", vis.config.margin.top + yCenter)
      .style("fill", "white");

    // used D3 rollups to find count of each
    vis.treeDims = [
      ["To succeed in current career", 187, "#bebada"],
      ["To start your first career", 500, "#8dd3c7"],
      ["To change careers", 766, "#fccde5"],
      ["To start a business or to freelance", 238, "#b3cde3"],
      ["As a hobby", 280, "#ccebc5"],
      ["To create art or entertainment", 29, "#fed9a6"],
      ["To meet school requirements", 24, "#f3e5ab"],
    ];

    // Sort the treeDims array by the size (the second element of each sub-array) in descending order
    vis.treeDims.sort((a, b) => b[1] - a[1]);

    // Create an SVG group element for the treemap
    vis.treemapGroup = vis.treeArea.append("g").attr("class", "tree-map-group");

    // Define the desired x and y coordinates for the treeGroup within the treeArea
    const treeGroupX = 50; // Adjust as needed
    const treeGroupY = 0; // Adjust as needed

    // Translate the treeGroup to the desired position
    vis.treemapGroup.attr(
      "transform",
      `translate(${treeGroupX}, ${treeGroupY})`
    );

    // Initialize the treemap layout
    const treemap = d3.treemap().size([vis.config.width, vis.config.height]);

    // Convert the treeDims array into hierarchical data
    vis.hierarchy = d3.hierarchy({
      children: vis.treeDims.map((d, i) => ({ ...d, id: i })),
    });

    // Compute the treemap layout
    vis.hierarchy.sum((d) => d[1] + 50);
    treemap(vis.hierarchy);

    vis.updateVis();
  }

  updateVis() {
    let vis = this;
    const rolledUpData = d3.rollups(
      vis.data,
      (v) => v.length,
      (d) => d.Top_Reason
    );
    vis.renderVis();
  }

  renderVis() {
    let vis = this;

    const rectangleGroups = vis.treemapGroup
      .selectAll(".tree-node-group")
      .data(vis.hierarchy.leaves(), (d) => d.data[0]);
    const newRectangleGroups = rectangleGroups
      .enter()
      .append("g")
      .attr("class", "tree-node-group");
    rectangleGroups.exit().remove();

    newRectangleGroups.merge(rectangleGroups).on("click", function (e, d) {
      if (vis.selectedReason !== d.data[0]) {
        vis.selectedReason = d.data[0];
      } else {
        vis.selectedReason = undefined;
      }

      vis.dispatch.call("ReasonChanged", e, vis.selectedReason);
      vis.renderVis();
    });

    const rectangles = newRectangleGroups
      .merge(rectangleGroups)
      .selectAll(".tree-node")
      .data(
        (d) => d,
        (d) => d.data[0]
      );

    const newRectangles = rectangles
      .enter()
      .append("rect")
      .attr("class", "tree-node")
      .attr("width", (d) => d.x1 - d.x0 - 5)
      .attr("height", (d) => d.y1 - d.y0 - 5)
      .attr("fill", (d) => d.data[2])
      .attr("x", (d) => d.x0)
      .attr("y", (d) => d.y0);

    // Add black outline when hovering over the tree rectangles
    rectangles
      .merge(newRectangles)
      .on("mouseover", function () {
        d3.select(this).attr("stroke", "black").attr("stroke-width", 2);
      })
      .on("mouseout", function () {
        d3.select(this).attr("stroke", "none"); // Remove the outline on mouseout
      })
      .style("stroke", (d) =>
        d.data[0] === vis.selectedReason ? "black" : "transparent"
      )
      .style("opacity", (d) =>
        d.data[0] === vis.selectedReason || !vis.selectedReason ? 1 : 0.5
      )
      .style("cursor", "pointer");

    // Add labels to the rectangles
    newRectangleGroups
      .merge(rectangleGroups)
      .selectAll(".tree-label")
      .data(
        (d) => d,
        (d) => d.data[0]
      )
      .enter()
      .append("text")
      .attr("class", "tree-label")
      .text((d) => d.data[0])
      .attr("x", (d) => (d.x0 + d.x1 - 5) / 2)
      .attr("y", (d) => (d.y0 + d.y1 - 5) / 2)
      .style("font-size", "11.5px")
      .style("fill", "black")
      .style("cursor", "pointer")
      .style("text-anchor", "middle")
      .style("dominant-baseline", "middle")
      .call(vis.wrap, 80);
  }

  // Text wrapping function with ChatGPT's assistance
  wrap(text, width) {
    text.each(function () {
      var text = d3.select(this),
        words = text.text().split(/\s+/).reverse(),
        word,
        line = [],
        lineNumber = 0,
        lineHeight = 1.1,
        x = text.attr("x"),
        y = text.attr("y"),
        dy = 0,
        tspan = text
          .text(null)
          .append("tspan")
          .attr("x", x)
          .attr("y", y)
          .attr("dy", dy + "em");

      while ((word = words.pop())) {
        line.push(word);
        tspan.text(line.join(" "));
        if (tspan.node().getComputedTextLength() > width) {
          line.pop();
          tspan.text(line.join(" "));
          line = [word];
          tspan = text
            .append("tspan")
            .attr("x", x)
            .attr("y", y)
            .attr("dy", ++lineNumber * lineHeight + dy + "em")
            .text(word);
        }
      }
    });
  }
}
