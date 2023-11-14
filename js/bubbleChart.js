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
      vis.svg = d3.select(vis.config.parentElement)
        .append('svg')
        .attr('id', 'bubble-chart')
        .attr('width', vis.config.containerWidth)
        .attr('height', vis.config.containerHeight);

      // SVG group that contains the chart (adjusted to margins)
      vis.chartArea = vis.svg.append('g')
        .attr('class', "bubble-area")
        .attr('transform', `translate(${vis.config.margin.left},${vis.config.margin.top})`);

      // Initialize radius scale of circles
      vis.radiusScale = d3.scaleSqrt()
        .range([5, 50]);
      
      // Initialize categorical color scale
      const legendData = ['Helpful_Online_Resources','Helpful_Podcasts','Helpful_YouTube_Channels', 'Helpful_In_Person_Events'];
      vis.colorScale = d3.scaleOrdinal()
        .range(['#e5d8bd', '#fed9a6', '#f3e5ab', '#ccebc5'])
        .domain(legendData);

      // Initialize legend
      vis.legendArea = vis.svg
        .append('g')
        .attr('class', 'legendArea')
        .attr('transform', `translate(16,0)`);
      
      vis.legend = vis.legendArea
        .selectAll(".legend")
        .data(legendData)
        .enter()
        .append('g')
        .attr('class', 'legend')
        .attr("transform", (d, i) => `translate(0,${i * 20})`);

      vis.legend
        .append("rect")
        .attr("width", 18)
        .attr("height", 18)
        .style("fill", d => vis.colorScale(d));
      
      vis.legend
        .append("text")
        .attr("x", 40)
        .attr("y", 9)
        .style("text-anchor", "start")
        .text(d => d.replace(/_/g, ' '));

      vis.updateVis();
    }
  
    updateVis() {
      let vis = this;

      // Data processing: split each str, check if in keyword list, record its counts
      
      vis.transformedData = [];

      vis.keywords = [
        {"Helpful_Online_Resources": [
        'freeCodeCamp', 'Mozilla Developer Network (MDN)', 'EdX', 'Codecademy', 'Udemy',
        'Code Wars', 'Front End Masters', 'Lynda.com', 'CSS Tricks', 'Coursera', 'Khan Academy',
        'Pluralsight', 'HackerRank', 'Stack Overflow', 'W3Schools']
        }, 
        {"Helpful_Podcasts": [
          'Code Newbie Podcast', 'Darknet Diaries', 'Syntax.fm', 'Learn To Code With Me', 
          'Talk Python to Me', 'Cyberwire Daily', 'The Changelog', 'Indie Hackers', 'Developer Tea',
          'JS PARTY', 'Ladybug Podcast', 'Software Engineering Daily', 'Practical AI']
        }, 
        {"Helpful_YouTube_Channels": [
        'Ben Awad', 'Code with Ania Kubów', 'CodeStacker', 'Coding Train',
        'Dev Ed', 'freeCodeCamp', 'Google Developers', 'James Q Quick',
        'Kevin Powell', 'The Net Ninja', 'Traversy Media', 'CS Dojo',
        'Programming With Mosh', 'Fireship', 'Coding Addict', 'DesignCourse']
        },
        {"Helpful_In_Person_Events": [
          'workshops', 'hackathons', 'freeCodeCamp study groups', 
          'conferences', 'weekend bootcamps', 'Women Who Code', 'Meetup.com events', 'school']
        }
      ];
      
      // If item in keyword list, group it and increase count
      vis.keywords.forEach((keywordDict) => {
        let keyRes = {};
        const key = Object.keys(keywordDict)[0]
        let keywordList = keywordDict[key]
        vis.data.forEach((d) => {
          const increaseCnt =  function(item) {
            if (keywordList.includes(item)){
              if (keyRes[item]){
                keyRes[item] += 1;
              } else {
                keyRes[item] = 1;
              }
            }
          }
          // Cater Helpful_In_Person_Events' difference in format
          if (key !== "Helpful_In_Person_Events"){
            d[key].forEach((item) => {
              increaseCnt(item);
            })
          } else {
            increaseCnt(d[key]);
          }
        });
        // Convert result so each item is its own object
        const keyResObj = Object.entries(keyRes).map(([name, count]) => ({
          category: key,
          name: name,
          count: count
        }));
        // Concat all item objects to the result array
        vis.transformedData = [...vis.transformedData, ...keyResObj];
      })

      // Sort objects by descending order (highest count -> lowest count)
      vis.transformedData = vis.transformedData.sort((a,b) => b.count - a.count);

      // Assign radius to each data point based on its count
      vis.radiusScale.domain([0, vis.transformedData[0].count]);

      vis.transformedData.forEach(function (d) {
        d.radius = vis.radiusScale(d.count);
      });

      vis.renderVis();
    }
  
    renderVis() {
      let vis = this;

      // Force simulations to make circle data points repel but close to each other
      let simulation = d3.forceSimulation(vis.transformedData)
        .force("charge", d3.forceManyBody().strength([-30]))
        .force("x", d3.forceX(vis.config.width / 2).strength(0.05))
        .force("y", d3.forceY(vis.config.height / 2).strength(0.05))
        .force("collide", d3.forceCollide().radius(function (d) { return d.radius + 2; }));
      
      // Rendering the circle data points
      const circle = vis.chartArea
        .selectAll(".circle")
        .data(vis.transformedData)
        .join('circle')
        .attr('class', 'circle')
        .attr('r', d => d.radius)
        .attr('fill', d => vis.colorScale(d.category));
      
      // Using simulation, generate each circle data point's x and y pos
      simulation.on("tick", function () {
        circle
          .attr("cx", d => d.x)
          .attr("cy", d => d.y);
      });
    
    }

}
  