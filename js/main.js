/**
 * Load data from CSV file asynchronously and render charts
 */
d3.csv("data/2021CoderFiltered.csv").then((data) => {
  // data.forEach((d) => {
  //   // preprocess data

  // });

  // Define bins and labels
  let bins = [0, 1, 100, 500, 1000, 10000, 100000];
  let labels = ['0', '1-100', '100-500', '500-1000', '1000-10000', '>10000'];

  // Create a new property 'CostOfLearningBins' in each object based on the binning logic
  data.forEach(item => {
    item.CostOfLearningBins = labels.find((label, index) => {
      return (
        index < bins.length - 1 &&
        item['Money_Spent_on_Learning'] >= bins[index] &&
        item['Money_Spent_on_Learning'] < bins[index + 1]
      );
    });
  });

  var groupedData = d3.group(data, d => d.Location, d => d.CostOfLearningBins)

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

  //set up graph in same style as original example but empty
  graph = { "nodes": [], "links": [] };


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

  const filterDispatch = d3.dispatch("ReasonChanged");
  // default
  const filteredData = data.filter(
    (d) => d.Top_Reason === "To start your first career"
  );
  const dotMatrix = new DotMatrix(
    {
      parentElement: "#matrix",
    },
    filteredData
  );

  const treeMap = new TreeMap(
    {
      parentElement: "#treemap-vis",
    },
    data,
    filterDispatch
  );

  filterDispatch.on("ReasonChanged", function (f, e) {
    console.log("FILTER CHANGED ", f[0]);
    const newFilteredData = data.filter((d) => d.Top_Reason === f[0]);
    console.log("data filtered ", newFilteredData);
    dotMatrix.data = newFilteredData;
    dotMatrix.updateVis();
  });

  const bubbleChart = new BubbleChart({
    parentElement: "#bubble-chart",
  }, filteredData
  );

  const barLineChart = new BarLineChart({
    parentElement: "#bar-line-chart",
  }, filteredData
  );

  const sankeyChart = new SankeyChart({
    parentElement: "#sankey-chart",
  }, graph
  );
  /**
   * Input field event listener
   */

  d3.select("#dot-matrix-sorting").on("change", function (event) {
    // Get selected demographic
    dotMatrix.activeSort = event.target.value;
    dotMatrix.updateVis();
  });
});
