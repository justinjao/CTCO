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

      vis.chartArea = vis.svg.append('g')
        .attr('class', "bubble-area")
        .attr('transform', `translate(${vis.config.margin.left + xCenter},${vis.config.margin.top + yCenter})`);

      // Define scales
      vis.radiusScale = d3.scaleSqrt()
        .range([5, 50]);

      vis.updateVis();
    }
  
    updateVis() {
      let vis = this;

      // data processing: split each st in keyword list to their 
      // individual items and counts
      
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
      
      // count of each item in each category
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
          if (key !== "Helpful_In_Person_Events"){
            d[key].forEach((item) => {
              increaseCnt(item);
            })
          } else {
            increaseCnt(d[key]);
          }
        });
        const keyResObj = Object.entries(keyRes).map(([name, count]) => ({
          category: key,
          name: name,
          count: count
        }));
        vis.transformedData = [...vis.transformedData, ...keyResObj];
      })

      vis.transformedData = vis.transformedData.sort((a,b) => b.count - a.count);

      vis.radiusScale.domain([0, vis.transformedData[0].count]);

      vis.transformedData.forEach(function (d) {
        d.radius = vis.radiusScale(d.count);
      });

      vis.renderVis();
    }
  
    renderVis() {
      let vis = this;

      // force simulations to make nodes repel but close to each other
      let simulation = d3.forceSimulation(vis.transformedData)
        .force("charge", d3.forceManyBody().strength([-40]))
        .force("x", d3.forceX(vis.config.width / 2).strength(0.05))
        .force("y", d3.forceY(vis.config.height / 2).strength(0.05))
        .force("collide", d3.forceCollide().radius(function (d) { return d.radius + 2; }));

      const circle = vis.chartArea.selectAll(".circle")
        .data(vis.transformedData);

      const circlesEnter = circle
        .enter()
        .append('circle')
        .attr('class', 'circle');
        
      simulation.on("tick", function () {
        circlesEnter
          .attr("cx", d => d.x)
          .attr("cy", d => d.y);
      });
      
      const circlesMerge = circlesEnter.merge(circle)
        .attr('r', d => d.radius)
        .attr('fill', '#aeaeca');
      
      circle.exit().remove()
    
    }

}
  