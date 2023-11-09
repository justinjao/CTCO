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
        top: 50,
        right: 50,
        bottom: 50,
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
      .attr("y", vis.config.margin.top + yCenter);

    vis.treeDims = [
      ["To succeed in current career", 159.2, { x: 0, y: 0 }, "#cccccc"],
      ["To start your first career", 105.26, { x: 0, y: 63.49 }, "#b3cde3"],
      ["To change careers", 225.3, { x: 0, y: 168.75 }, "#ccebc5"],
      [
        "To start a business or to freelance",
        80.0,
        { x: 0, y: 394.05 },
        "#decbe4",
      ],
      ["As a hobby", 59.84, { x: 168.75, y: 0 }, "#fed9a6"],
      [
        "To create art or entertainment",
        24.49,
        { x: 168.75, y: 59.84 },
        "#ffffcc",
      ],
      [
        "To meet school requirements",
        21.74,
        { x: 168.75, y: 84.33 },
        "#e5d8bd",
      ],
    ];

    vis.updateVis();
  }

  updateVis() {
    let vis = this;
    const rolledUpData = d3.rollups(
      vis.data,
      (v) => v.length,
      (d) => d.Top_Reason
    );
    console.log("rolled up data", rolledUpData);
    console.log("sum of data", vis.data.length);
    const percentageAgg = rolledUpData.map((d) => [
      d[0],
      d[1] / vis.data.length,
    ]);
    console.log(percentageAgg, vis.config.height * vis.config.width);
    // console.log(
    //   "percentage of areas",
    //   percentageAgg.map((d) => [
    //     d[0],
    //     (d[1] * (vis.config.height * vis.config.width)) / vis.tileWidth,
    //   ])
    // );
    vis.renderVis();
  }

  renderVis() {
    let vis = this;

    // Sort the treeDims array by the size (the second element of each sub-array) in descending order
    vis.treeDims.sort((a, b) => b[1] - a[1]);

    // Create an SVG group element for the treemap
    const treemapGroup = vis.treeArea.append("g");

    // Define the desired x and y coordinates for the treeGroup within the treeArea
    const treeGroupX = 50; // Adjust as needed
    const treeGroupY = 50; // Adjust as needed

    // Translate the treeGroup to the desired position
    treemapGroup.attr("transform", `translate(${treeGroupX}, ${treeGroupY})`);

    // Initialize the treemap layout
    const treemap = d3.treemap().size([vis.config.width, vis.config.height]);

    // Convert the treeDims array into hierarchical data
    const hierarchy = d3.hierarchy({
      children: vis.treeDims.map((d, i) => ({ ...d, id: i })),
    });

    // Compute the treemap layout
    hierarchy.sum((d) => d[1]);
    treemap(hierarchy);

    const rectangles = treemapGroup
      .selectAll(".tree-nodes")
      .data(hierarchy.leaves())
      .enter()
      .append("rect")
      .attr("width", (d) => d.x1 - d.x0)
      .attr("height", (d) => d.y1 - d.y0)
      .attr("fill", (d) => d.data[3])
      .attr("x", (d) => d.x0)
      .attr("y", (d) => d.y0);

    // Add black outline when hovering over the tree rectangles
    rectangles
      .on("mouseover", function () {
        d3.select(this).attr("stroke", "black").attr("stroke-width", 2);
      })
      .on("mouseout", function () {
        d3.select(this).attr("stroke", "none"); // Remove the outline on mouseout
      })
      .on("click", function (e, d) {
        console.log("dispatch ", vis);
        vis.dispatch.call("ReasonChanged", e, d.data);
      });

    // Add labels to the rectangles
    treemapGroup
      .selectAll(".tree-label")
      .data(hierarchy.leaves())
      .enter()
      .append("text")
      .attr("class", "tree-label")
      .text((d) => d.data[0])
      .attr("x", (d) => (d.x0 + d.x1) / 2)
      .attr("y", (d) => (d.y0 + d.y1) / 2)
      .style("font-size", "12px")
      .style("fill", "black")
      .style("text-anchor", "middle")
      .style("dominant-baseline", "middle")
      .call(vis.wrap, 95);
  }

  // TODO: add selection state

  // Text wrapping function
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

//   renderVis() {
//     let vis = this;
//     const nodes = vis.treeArea.selectAll(".tree-nodes").data(vis.treeDims);
//     nodes
//       .enter()
//       .append("rect")
//       .attr("width", (d) => d[1])
//       .attr("height", (d) => d[1])
//       .attr("fill", (d) => d[3])
//       .attr("x", (d) => vis.config.margin.left + d[2].x)
//       .attr("y", (d) => vis.config.margin.top + d[2].y);
//   }
// }
