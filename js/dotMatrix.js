const AGGREGATED_CATEGORY_LOOKUP = {
  Science: [
    "A social science (e.g., sociology, psychology, political science, economics)",
    "A natural science (e.g., biology, chemistry, physics)",
    "A health science (e.g., nursing, pharmacy, radiology)",
    "Environmental science (e.g., earth sciences, sustainability)",
  ],
  Humanities: [
    "A humanities discipline (e.g., literature, history, philosophy)",
    "Education",
  ],
  "Information Technology": [
    "Information systems, information technology, or system administration",
    "Computer science, computer engineering, software engineering or data science",
  ],
  Math: ["Mathematics or statistics"],
  Arts: [
    "Fine arts or performing arts (e.g., graphic design, music, studio, art)",
  ],
  Business: ["A business discipline (e.g., accounting, finance, marketing)"],
  Engineering: [
    "Another engineering discipline (e.g., civil, electrical, mechanical)",
  ],
  Other: ["I didn't attend a university", "Undecided or no major"],
};

const MAX_BIG_SIZE = 768;

class DotMatrix {
  /**
   * Class constructor with initial configuration
   * @param {Object}
   */

  constructor(_config, data, careerDispatch) {
    this.config = {
      parentElement: _config.parentElement,
      containerWidth: 650,
      containerHeight: 600,
      tooltipPadding: 15,
      margin: {
        top: 50,
        right: 50,
        bottom: 50,
        left: 50,
      },
    };
    this.activeSort = "gender";
    this.data = data;
    this.careerDispatch = careerDispatch;
    this.legendMapping = [
      {
        name: "gender",
        Male: "#fbb4ae",
        Female: "#b3cde3",
        Nonbinary: "#ccebc5",
        "None of the Above": "#decbe4",
      },
      {
        name: "age",
        "10-18": "#b3e2cd",
        "19-27": "#fdcdac",
        "28-36": "#cbd5e8",
        "37-45": "#f4cae4",
        "46-54": "#e6f5c9",
        "55-63": "#f3e5ab",
        "64-72": "#f1e2cc",
        "73+": "#cccccc",
      },
      {
        name: "location",
        "Latin America and Caribbean":
          LOCATION_COLOURS["Latin America and Caribbean"],
        "East Asia and Pacific": LOCATION_COLOURS["East Asia and Pacific"],
        "Europe and Central Asia": LOCATION_COLOURS["Europe and Central Asia"],
        "Middle East and North Africa":
          LOCATION_COLOURS["Middle East and North Africa"],
        "North America": LOCATION_COLOURS["North America"],
        "South Asia": LOCATION_COLOURS["South Asia"],
        "Southeast Asia": LOCATION_COLOURS["Southeast Asia"],
        "Sub-Saharan Africa": LOCATION_COLOURS["Sub-Saharan Africa"],
      },
      {
        name: "university-study",
        Science: "#8dd3c7",
        Humanities: "#f3e5ab",
        "Information Technology": "#bebada",
        Math: "#fb8072",
        Arts: "#80b1d3",
        Business: "#fdb462",
        Engineering: "#b3de69",
        Other: "#fccde5",
      },
    ];
    this.initVis();
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

    vis.matrixArea = vis.svg.append("g");

    vis.matrixArea
      .append("rect")
      .attr("width", vis.config.width)
      .attr("height", vis.config.height)
      .attr("class", "matrix-area")
      .attr("x", vis.config.margin.left)
      .attr("y", vis.config.margin.top);

    vis.legendContainer = vis.svg
      .append("g")
      .attr("class", "dot-matrix-legend-container");

    vis.careerDispatch.on("CareerChanged.Matrix", function (c, e) {
      vis.selectedCareer = c;
      vis.renderVis();
    });
    vis.updateVis();
  }

  updateVis() {
    console.log("UPDATING", this.data);
    let vis = this;
    vis.activeLegend = vis.legendMapping.find((l) => l.name === vis.activeSort);
    if (vis.activeSort === "gender") {
      vis.data = vis.data.sort((a, b) =>
        a.Self_Perception.localeCompare(b.Self_Perception)
      );
    } else if (vis.activeSort === "location") {
      vis.data = vis.data.sort((a, b) => a.Location.localeCompare(b.Location));
    } else if (vis.activeSort === "university-study") {
      vis.data = vis.data.sort((a, b) =>
        vis.findAggregateName(a).localeCompare(vis.findAggregateName(b))
      );
    } else {
      vis.data = vis.data.sort((a, b) => a.Age.localeCompare(b.Age));
    }

    vis.renderVis();
  }

  renderVis() {
    const university_mapping = {
      "Information systems, information technology, or system administration":
        "IT/Systems",
      "Computer science, computer engineering, software engineering or data science":
        "Computer Science/Data Science",
      "Fine arts or performing arts (e.g., graphic design, music, studio, art)":
        "Fine/Performing Arts",
      "A social science (e.g., sociology, psychology, political science, economics)":
        "Social Science",
      "Another engineering discipline (e.g., civil, electrical, mechanical)":
        "Other Engineering",
      "A natural science (e.g., biology, chemistry, physics)":
        "Natural Science",
      "Undecided or no major": "Undecided/No Major",
      "I didn't attend a university": "No University Attendance",
      "A business discipline (e.g., accounting, finance, marketing)":
        "Business",
      "A health science (e.g., nursing, pharmacy, radiology)": "Health Science",
      "A humanities discipline (e.g., literature, history, philosophy)":
        "Humanities",
      "Environmental science (e.g., earth sciences, sustainability)":
        "Environmental Science",
      "Mathematics or statistics": "Math/Statistics",
    };

    let vis = this;
    const CIRCLE_RADIUS = vis.data.length < MAX_BIG_SIZE ? 6 : 4;
    const CIRCLE_DIAM = 2 * CIRCLE_RADIUS;
    const CIRCLE_SPACING = vis.data.length < MAX_BIG_SIZE ? 5 : 2;
    const DOT_UNIT = CIRCLE_DIAM + CIRCLE_SPACING;
    const DOTS_PER_ROW = Math.floor(vis.config.width / DOT_UNIT);
    const ROW_OFFSET = vis.config.margin.left + CIRCLE_RADIUS;

    const dots = vis.matrixArea.selectAll(".dot").data(vis.data, (d) => d.ID);
    dots.exit().remove();
    const dotsEnter = dots
      .enter()
      .append("circle")
      .attr("class", (d, i) => `dot d-${i}`);
    let lastDotYPos = 0;
    dotsEnter
      .merge(dots)
      .attr("cx", (d, i) => (i % DOTS_PER_ROW) * DOT_UNIT + ROW_OFFSET)
      .attr("cy", (d, i) => {
        lastDotYPos =
          Math.floor(i / DOTS_PER_ROW) * DOT_UNIT +
          vis.config.margin.top +
          CIRCLE_RADIUS;
        return lastDotYPos;
      })
      .attr("r", (d) => CIRCLE_RADIUS)
      .attr("fill", (d) => vis.renderBasedOnSort(d, vis.activeSort))
      .style("opacity", (d) =>
        vis.selectedCareer && d.Interested_Careers !== vis.selectedCareer
          ? "0.4"
          : "1"
      )
      .style("stroke", "black")
      .style("stroke-width", (d) =>
        d.Interested_Careers === vis.selectedCareer ? 1.5 : 0.5
      )
      .on("mouseover", (event, d) => {
        d3
          .select("#tooltip")
          .style("display", "block")
          .style("left", event.pageX + vis.config.tooltipPadding + "px")
          .style("top", event.pageY + vis.config.tooltipPadding + "px").html(`
    
         <div><li>Age: ${d.Age}</li></div>
         <li>Gender: ${d.Self_Perception}</li>
         <li>Location: ${d.Location}</li>
           <li>University study: ${d.University_Study}</li>
           <li>Current Employment Status: ${d.Current_Employment_Status}</li>
           <li>Current Field of Work: ${d.Current_Field_of_Work}</li>
           <li>Career Aspirations: ${d.Interested_Careers}</li>
       `);
      })
      .on("mouseleave", () => {
        d3.select("#tooltip").style("display", "none");
        // Remove the outline when the mouse leaves
      })
      .on("click", (e, d) => {
        console.log("I clicked", d.Interested_Careers);

        let newCareer = undefined;
        if (vis.selectedCareer !== d.Interested_Careers) {
          newCareer = d.Interested_Careers;
        }
        vis.careerDispatch.call("CareerChanged", e, newCareer);
      });

    const legendItems = vis.legendContainer.selectAll(".legend-item").data(
      Object.keys(vis.activeLegend).filter((d) => d != "name"),
      (d) => d
    );
    legendItems.exit().remove();

    // Define the number of items per row
    const itemsPerRow = 2;

    // Calculate the width and height of each item based on DOT_UNIT
    const itemWidth = vis.config.width / itemsPerRow;
    const itemHeight = 17;

    const legendItemsEnter = legendItems
      .enter()
      .append("g")
      .attr("class", "legend-item");

    legendItemsEnter.merge(legendItems).attr("transform", (d, i) => {
      const x = (i % itemsPerRow) * itemWidth;
      const y = Math.floor(i / itemsPerRow) * itemHeight;
      return `translate(${x + vis.config.margin.left}, ${
        y +
        Math.max(
          lastDotYPos + 50,
          vis.config.height - vis.config.margin.bottom - 80
        )
      })`;
    });
    legendItemsEnter
      .append("circle")
      .attr("r", 6)
      .attr("fill", (d) => vis.activeLegend[d])
      .style("stroke", "black")
      .style("stroke-width", 0.5);
    legendItemsEnter

      .append("text")
      .text((d) => d)
      .attr("color", "black")
      .attr("x", DOT_UNIT)
      .attr("y", 5);
  }

  renderBasedOnSort(d, sort) {
    let vis = this;
    if (sort === "gender") {
      const perception = d.Self_Perception;
      return vis.activeLegend[perception];
    } else if (sort === "location") {
      const location = d.Location;
      return vis.activeLegend[location];
    } else if (sort === "university-study") {
      return vis.activeLegend[vis.findAggregateName(d)];
    } else {
      const age = d.Age;
      return vis.activeLegend[age];
    }
  }
  findAggregateName(d) {
    let vis = this;

    const names = Object.keys(AGGREGATED_CATEGORY_LOOKUP);
    for (let i = 0; i < names.length; i++) {
      if (AGGREGATED_CATEGORY_LOOKUP[names[i]].includes(d.University_Study)) {
        return names[i];
      }
    }
    return "invalid";
  }
}
