/**
 * Load data from CSV file asynchronously and render charts
 */
d3.csv("data/2021CoderFiltered.csv").then((data) => {
  data.forEach((d) => {
    // preprocess data
  });
  console.log("data", data);
  // temporary, to be updated
  const filteredData = data.filter(
    (d) => d.Top_Reason === "To start your first career"
  );
  console.log("filtered data", filteredData);
  const dotMatrix = new DotMatrix(
    {
      parentElement: "#matrix",
    },
    filteredData
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
