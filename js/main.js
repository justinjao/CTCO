/**
 * Load data from CSV file asynchronously and render charts
 */
d3.csv("data/2021CoderFiltered.csv").then((data) => {
  data.forEach((d) => {
    // preprocess data
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

  /**
   * Input field event listener
   */

  d3.select("#dot-matrix-sorting").on("change", function (event) {
    // Get selected demographic
    dotMatrix.activeSort = event.target.value;
    dotMatrix.updateVis();
  });
});
