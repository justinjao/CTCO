class BubbleChart {
    /**
     * Class constructor with initial configuration
     * @param {Object}
     */
  
    constructor(_config, data) {
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
      this.initVis();
    }
  
    initVis() {
        
        let vis = this;

        // Calculate inner chart size. Margin specifies the space around the actual chart.
        vis.config.width = vis.config.containerWidth - vis.config.margin.left - vis.config.margin.right;
        vis.config.height = vis.config.containerHeight - vis.config.margin.top - vis.config.margin.bottom;

        // Define size of SVG drawing area
        vis.svg = d3.select(vis.config.parentElement).append('svg')
        .attr('id', 'bubble-chart')
        .attr('width', vis.config.containerWidth)
        .attr('height', vis.config.containerHeight);
  
      vis.chartArea = vis.svg.append("g");
  
      // Calculate the x and y coordinates to center chartArea
      const xCenter =
        (vis.config.containerWidth -
          vis.config.margin.left -
          vis.config.margin.right -
          vis.config.width) / 2;
      const yCenter =
        (vis.config.containerHeight -
          vis.config.margin.top -
          vis.config.margin.bottom -
          vis.config.height) / 2;

      vis.chartArea
        .append("rect")
        .attr("width", vis.config.width)
        .attr("height", vis.config.height)
        .attr("class", "bubble-area")
        .attr("x", vis.config.margin.left + xCenter)
        .attr("y", vis.config.margin.top + yCenter);
  
      vis.updateVis();
    }
  
    updateVis() {
      let vis = this;

      vis.renderVis();
    }
  
    renderVis() {
      let vis = this;
    }
}
  