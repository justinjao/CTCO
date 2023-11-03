class DotMatrix {
  /**
   * Class constructor with initial configuration
   * @param {Object}
   */

  constructor(_config, data) {
    this.config = {
      parentElement: _config.parentElement,
      containerWidth: 1000,
      containerHeight: 380,
      tooltipPadding: 15,
      margin: {
        top: 15,
        right: 15,
        bottom: 20,
        left: 25,
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

    vis.updateVis();
  }

  updateVis() {
    let vis = this;
    vis.renderVis();
  }

  renderVis() {
    let vis = this;

    vis.xAxisG.call(vis.xAxis).call((g) => g.select(".domain").remove());
    vis.yAxisG.call(vis.yAxis).call((g) => g.select(".domain").remove());
  }
}
