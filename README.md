# Cracking the Coding Odyssey

A data visualization project to explore the 2021 FreeCodeCamp New Programmers Dataset. We visualize how people are learning to code, and what their aspirations are.

### External References

- Sankey Diagram chart based on: https://observablehq.com/@d3/sankey/2?intent=fork
- ChatGPT was used for:
  - Data transformations for frequencies in `sankeyChart.js`
  - CostOfLearningBins generation in `main.js`
  - sorting of CostOfLearningBins in `sankeyChart.js`
  - Countless debugging sessions
  - Layout of legend items for dot matrix
  - Mapping university studies to broader categories for dot matrix
  - Text wrapping function for the treemap
- Node/link generation was taken from: http://www.d3noob.org/2013/02/formatting-data-for-sankey-diagrams-in.html (under "From a CSV with 'source', 'target' and 'value' info only" section)
- Used https://medium.com/free-code-camp/a-gentle-introduction-to-d3-how-to-build-a-reusable-bubble-chart-9106dc4f6c46 to learn how bubble charts are built and https://www.d3indepth.com/force-layout/ to understand how the points can be forced to a certain X and Y position.
- Combined bar-line chart based on: https://observablehq.com/@d3/bar-line-chart
- D3 hierarchy: https://observablehq.com/@d3/d3-hierarchy
