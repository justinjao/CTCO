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

        //set up graph, nodes and links for sankey
        this.graph = { "nodes": [], "links": [] };
        this.nodes = [];
        this.links = [];

        this.initVis()
    }

    initVis() {

        let vis = this;

        // LAYOUT AND DESIGN:
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

        // DATA WRANGLING:
        let data = vis.data
        var groupedData = d3.group(data, d => d.Top_Reason, d => d.CostOfLearningBins)
        var frequencyArray = [];

        // Iterate over the grouped data and populate the object
        groupedData.forEach((subGroup, key1) => {
            subGroup.forEach((value, key2) => {
                var combination = `${key1} - ${key2}`;
                var frequency = value.length;

                // Create an entry in the object
                frequencyArray.push({
                    source: key1,
                    target: key2,
                    value: frequency
                });
            });
        });

        let graph = vis.graph;
        frequencyArray.forEach(function (d) {
            graph.nodes.push({ "name": d.source });
            graph.nodes.push({ "name": d.target });
            graph.links.push({
                "source": d.source,
                "target": d.target,
                "value": +d.value
            });
        });

        graph.nodes = Array.from(d3.group(graph.nodes, (d) => d.name).keys()).filter(v => v)

        // loop through each link replacing the text with its index from node
        graph.links.forEach(function (d, i) {
            graph.links[i].source = graph.nodes.indexOf(graph.links[i].source);
            graph.links[i].target = graph.nodes.indexOf(graph.links[i].target);
        });

        //loop through each nodes to make nodes an array of objects rather than an array of strings 
        graph.nodes.forEach(function (d, i) {
            graph.nodes[i] = { "name": d };
        });

        // Constructs and configures a Sankey generator.
        const sankey = d3.sankey()
            .nodeId(d => d.index)
            .nodeAlign(d3.sankeyLeft)
            .nodeWidth(15)
            .nodePadding(15)
            .extent([[1, 5], [vis.config.width - 1, vis.config.height - 5]]);

        // Applies it to the data. We make a copy of the nodes and links objects
        const { nodes, links } = sankey({
            nodes: graph.nodes.map(d => Object.assign({}, d)),
            links: graph.links.map(d => Object.assign({}, d))
        });

        vis.nodes = nodes;
        vis.links = links;

        vis.renderVis();

    }

    renderVis() {
        let vis = this;
        // Defines a color scale.
        const color = d3.scaleOrdinal(d3.schemeSet3);

        // Creates the rects that represent the nodes.
        const rect = vis.svg.append("g")
            .attr("stroke", "#000")
            .selectAll()
            .data(vis.nodes)
            .join("rect")
            .attr("x", d => d.x0)
            .attr("y", d => d.y0)
            .attr("height", d => d.y1 - d.y0)
            .attr("width", d => d.x1 - d.x0)
            .attr("fill", "#0000FF")
            .attr("fill", d => color(d.name));

        // const gradient = link.append("linearGradient")
        //     .attr("id", d => (d.uid = DOM.uid("link")).id)
        //     .attr("gradientUnits", "userSpaceOnUse")
        //     .attr("x1", d => d.source.x1)
        //     .attr("x2", d => d.target.x0);
        // gradient.append("stop")
        //     .attr("offset", "0%")
        //     .attr("stop-color", d => color(d.source.name));
        // gradient.append("stop")
        //     .attr("offset", "100%")
        //     .attr("stop-color", d => color(d.target.name));


        // Creates the paths that represent the links.
        const link = vis.svg.append("g")
            .attr("fill", "none") // TODO: colour must match treeMap
            .attr("stroke-opacity", 0.5)
            .selectAll()
            .data(vis.links)
            .join("g")
            .style("mix-blend-mode", "multiply");

        link.append("path")
            .attr('fill', 'none')
            .attr("d", d3.sankeyLinkHorizontal())
            .attr("stroke", d => color(d.source.name))
            .attr("stroke-width", d => Math.max(1, d.width));

        // Adds labels on the nodes.
        vis.svg.append("g")
            .selectAll()
            .data(vis.nodes)
            .join("text")
            .attr("x", d => d.x0 < vis.config.width / 2 ? d.x1 + 6 : d.x0 - 6)
            .attr("y", d => (d.y1 + d.y0) / 2)
            .attr("dy", "0.35em")
            .attr("text-anchor", d => d.x0 < vis.config.width / 2 ? "start" : "end")
            .text(d => d.name);
    }

}