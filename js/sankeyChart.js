class SankeyChart {
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
            .attr("id", "dot-matrix")
            .attr("width", vis.config.containerWidth)
            .attr("height", vis.config.containerHeight);

        // Constructs and configures a Sankey generator.
        const sankey = d3.sankey()
            .nodeId(d => d.index)
            .nodeAlign(d3.sankeyLeft)
            .nodeWidth(15)
            .nodePadding(10)
            .extent([[1, 5], [vis.config.containerWidth - 1, vis.config.containerHeight - 5]]);

        console.log("SANKEY")
        console.log(vis.data)

        // Applies it to the data. We make a copy of the nodes and links objects
        // so as to avoid mutating the original.
        const { nodes, links } = sankey({
            nodes: vis.data.nodes.map(d => Object.assign({}, d)),
            links: vis.data.links.map(d => Object.assign({}, d))
        });

        // const { nodes, links } = sankey(vis.data)

        console.log(nodes)
        console.log("LINKS")
        console.log(links)

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
            .attr("fill", "#FFFFE0,")
            .attr("stroke-opacity", 0.5)
            .selectAll()
            .data(links)
            .join("g")
            .style("mix-blend-mode", "multiply");

        link.append("path")
            .attr("d", d3.sankeyLinkHorizontal())
            .attr("stroke", "static")
            .attr("stroke-width", d => Math.max(1, d.width));

        // Adds labels on the nodes.
        vis.svg.append("g")
            .selectAll()
            .data(nodes)
            .join("text")
            .attr("x", d => d.x0 < vis.containerWidth / 2 ? d.x1 + 6 : d.x0 - 6)
            .attr("y", d => (d.y1 + d.y0) / 2)
            .attr("dy", "0.35em")
            .attr("text-anchor", d => d.x0 < vis.containerWidth / 2 ? "start" : "end")
            .text(d => d.name);

    }

    renderVis() {


    }



}