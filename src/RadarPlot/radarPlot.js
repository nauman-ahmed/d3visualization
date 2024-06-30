import { useEffect, useRef, useState } from "react"
import * as d3 from "d3";
import "./radar.css"
import { svg } from "d3";

function RadarPlot(props) {

    const createPlot = (dataset, id) => {
        console.log("DATASET",dataset)
        const dataSets = dataset

        // Find the max value for each axis to normalize data accordingly
        let axisMaxValues = {};
        dataSets.flat().forEach(d => {
            if (!axisMaxValues[d.axis] || d.value > axisMaxValues[d.axis]) {
            axisMaxValues[d.axis] = d.value;
            }
        });

        // Normalize each dataset based on these max values
        dataSets.forEach((dataset,index) => {
            dataset.forEach(data => {
            data.normalizedValue = data.value / axisMaxValues[data.axis];
            });
        });

        // Collect all values for each axis
        let axisValues = {};
        dataSets.flat().forEach(item => {
            if (!axisValues[item.axis]) {
                axisValues[item.axis] = [];
            }
            axisValues[item.axis].push(item.value);
        });

        // Define bin ranges and categorize values
        let binsCount = 5;  // Number of bins for each axis
        let binnedData = {};

        for (let axis in axisValues) {
            let values = axisValues[axis];
            let minVal = Math.min(...values);
            let maxVal = Math.max(...values);
            let range = maxVal - minVal;
            let binSize = range / binsCount;

            let bins = [];
            for (let i = 0; i <= binsCount; i++) {
                bins.push(minVal + i * binSize);
            }

            // Categorize each value into bins
            binnedData[axis] = bins
        }


        const colors = ["#4285F4", "#34A853", "pink"]; // Colors for the datasets
        const labels = ["Stage 1", "Stage 2", "Stage 3"]; // Labels for the datasets

        const width = 300,
                height = 300,
                margin = { top: 100, right: 160, bottom: 100, left: 160 },
                radius = Math.min(width, height) / 2,
                levels = 5; // Number of concentric circles
        const numTicks = 5; // Number of ticks per axis

        const svg = d3.select(id).append("svg")
            .attr("width", width + margin.left + margin.right)
            .attr("height", height + margin.top + margin.bottom)
            .append("g")
            .attr("transform", `translate(${width / 2 + margin.left}, ${height / 2 + margin.top})`);

        const rScale = d3.scaleLinear()
            .domain([0, 1])
            .range([0, radius]);

        // Draw circular grid lines
        for (let level = 0; level < levels; level++) {
            const factor = radius * ((level + 1) / levels);
            svg.append("circle")
            .attr("cx", 0)
            .attr("cy", 0)
            .attr("r", factor)
            .style("fill", "none")
            .style("stroke", "black")
            .style("stroke-width", "0.5px")
            .style("stroke-dasharray", "2,2");
        }

        const angleSlice = Math.PI * 2 / dataSets[0].length;

        // Draw axis lines and add axis ticks
        dataSets[0].forEach((d, i) => {
            const axis = svg.append("g");

            // Axis line
            axis.append("line")
            .attr("x1", 0)
            .attr("y1", 0)
            .attr("x2", rScale(1) * Math.cos(angleSlice * i - Math.PI/2))
            .attr("y2", rScale(1) * Math.sin(angleSlice * i - Math.PI/2))
            .style("stroke", "grey")
            .style("stroke-width", "1px");

            // Axis ticks
            for (let j = 0; j <= binsCount ; j++) {
                const tickValue = j / numTicks;
                const tickText = binnedData[d.axis][j];
                const x = rScale(tickValue) * Math.cos(angleSlice * i - Math.PI/2);
                const y = rScale(tickValue) * Math.sin(angleSlice * i - Math.PI/2);

                // Tick labels (optional)
                if (j > 1) { // Skip the center label

                    axis.append("line")
                    .attr("x1", x)
                    .attr("y1", y)
                    .attr("x2", x + 5 * Math.cos(angleSlice * i - Math.PI/2 + Math.PI / 2))
                    .attr("y2", y + 5 * Math.sin(angleSlice * i - Math.PI/2 + Math.PI / 2))
                    .style("stroke", "black")
                    .style("stroke-width", "2px");
                    // Tick marks
                    axis.append("text")
                    .attr("x", x + 10 * Math.cos(angleSlice * i - Math.PI/2 + Math.PI / 2))
                    .attr("y", y + 10 * Math.sin(angleSlice * i - Math.PI/2 + Math.PI / 2))
                    .text(tickValue.toFixed(2)) // Control decimal places as needed
                    .attr("text-anchor", "top")
                    .style("font-size", "10px");
                }
            }
        });
        
        dataSets.forEach((data, index) => {
            const radarLine = d3.radialLine()
                .curve(d3.curveLinearClosed)
                .radius(d => {
                    return rScale(d.normalizedValue)
                })
                .angle((d, i) => i * angleSlice);
            
            // Append radar area
            svg.append("path")
            .datum(data)
            .attr("d", radarLine)
            .style("stroke", colors[index])
            .style("fill", colors[index])
            .style("fill-opacity", 0.1);

            // Add circles for each vertex
            svg.selectAll(".radarCircle" + index)
            .data(data)
            .enter()
            .append("circle")
            .attr("class", "radarCircle")
            .attr("r", 4)
            .attr("cx", d => rScale(d.normalizedValue) * Math.cos(angleSlice * data.indexOf(d) - Math.PI/2))
            .attr("cy", d => rScale(d.normalizedValue) * Math.sin(angleSlice * data.indexOf(d) - Math.PI/2))
            .style("fill", colors[index])
            .style("fill-opacity", 0.7);
        });

        // Add one label for each angle
        svg.selectAll(".radarLabel")
            .data(dataSets[0])
            .enter().append("text")
            .attr("class", "radarLabel")
            .attr("x", (d, i) => rScale(1.2) * Math.cos(angleSlice * i - Math.PI/2))
            .attr("y", (d, i) => rScale(1.1) * Math.sin(angleSlice * i - Math.PI/2))
            .text(d => d.axis)
            .style("font-size", "12px")
            .attr("text-anchor", "middle");

        // Adding a legend to the radar chart
        const legend = svg.append("g")
            .attr("class", "legend")
            .attr("transform", `translate(${-width / 2 + 20}, ${-height / 2 + 20})`) // Position top-left corner
            .selectAll("g")
            .data(labels)
            .enter().append("g")
            .attr("transform", (d, i) => `translate(0, ${i * 20})`); // Vertical alignment of legend items

        legend.append("rect")
            .attr("x", width)
            .attr("y", 0)
            .attr("width", 18)
            .attr("height", 18)
            .style("fill", (d, i) => colors[i]);

        legend.append("text")
            .attr("x", width + 30)
            .attr("y", 9)
            .attr("dy", ".35em")
            .text(d => d)
            .style("font-size", "12px")
            .style("text-anchor", "start");

    }

    useEffect(() => {
        if(props.dataset.length){
            var container = document.getElementById("radar0");
            var svgs = container.getElementsByTagName('svg');
            
            createPlot(props.dataset, "#"+"radar0")

            for (let index = 0; index < svgs.length; index++) {
                if(svgs.length-1 !== index){
                    container.removeChild(svgs[index]); 
                }
            }
        }
    }, [props.dataset]);

  return <>
        <div className="col-12 p-4" id={"radar0"}></div>
     </>;
}

export default RadarPlot;
