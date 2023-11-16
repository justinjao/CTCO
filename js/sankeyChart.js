class SankeyChart {
    /**
     * Class constructor with initial configuration
     * @param {Object}
     */

    constructor(_config, data) {
        this.config = {
            parentElement: _config.parentElement,
            containerWidth: 928,
            containerHeight: 600,
            tooltipPadding: 15,
            margin: {
                top: 50,
                right: 50,
                bottom: 50,
                left: 50,
            },
        };
        this.data = data;
        console.log("GRAPH")
        console.log(data)
        this.initVis()
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
            .attr("id", "sankey")
            .attr("width", vis.config.width)
            .attr("height", vis.config.height);

        // Constructs and configures a Sankey generator.
        const sankey = d3.sankey()
            .nodeId(d => d.index)
            .nodeAlign(d3.sankeyLeft)
            .nodeWidth(15)
            .nodePadding(15)
            .extent([[1, 5], [vis.config.width - 1, vis.config.height - 5]]);

        // Applies it to the data. We make a copy of the nodes and links objects
        const { nodes, links } = sankey({
            nodes: vis.data.nodes.map(d => Object.assign({}, d)),
            links: vis.data.links.map(d => Object.assign({}, d))
        });


        // Defines a color scale.
        const color = d3.scaleOrdinal(d3.schemeCategory10);

        // Creates the rects that represent the nodes.
        const rect = vis.svg.append("g")
            .attr("stroke", "#000")
            .selectAll()
            .data(nodes)
            .join("rect")
            .attr("x", d => d.x0)
            .attr("y", d => d.y0)
            .attr("height", d => d.y1 - d.y0)
            .attr("width", d => d.x1 - d.x0)
            .attr("fill", "#0000FF")
        // .attr("fill", d => color(d.category));


        // Creates the paths that represent the links.
        const link = vis.svg.append("g")
            .attr("fill", "#cf4036") // doing red for now for easier debugging
            .attr("stroke-opacity", 0.5)
            .selectAll()
            .data(links)
            .join("g")
            .style("mix-blend-mode", "multiply");

        link.append("path")
            .attr('fill', 'none')
            .attr("d", d3.sankeyLinkHorizontal())
            .attr("stroke", "#cf4036")
            .attr("stroke-width", d => Math.max(1, d.width));

        // Adds labels on the nodes.
        vis.svg.append("g")
            .selectAll()
            .data(nodes)
            .join("text")
            .attr("x", d => d.x0 < vis.config.width / 2 ? d.x1 + 6 : d.x0 - 6)
            .attr("y", d => (d.y1 + d.y0) / 2)
            .attr("dy", "0.35em")
            .attr("text-anchor", d => d.x0 < vis.config.width / 2 ? "start" : "end")
            .text(d => d.name);

        vis.renderVis();

    }

    renderVis() {


    }



}