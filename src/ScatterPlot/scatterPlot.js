import { useEffect, useRef, useState } from "react"
import * as d3 from "d3";
import "./scatter.css"
import { svg } from "d3";

function ScatterPlot(props) {

    const createPlot = (datasetX, datasetY, id) => {
        const data = [
            { x: datasetX.datasets, y: datasetY.datasets }
        ];
        
        // Flatten the data structure for easier processing with D3
        const points = data.reduce((acc, val) => {
            val.x.forEach((x, i) => {
                acc.push({ x: x, y: val.y[i] });
            });
            return acc;
        }, []);
        
        const svgWidth = 500;
        const svgHeight = 300;
        
        const margin = { top: 20, right: 20, bottom: 70, left: 80 };
        const width = svgWidth - margin.left - margin.right;
        const height = svgHeight - margin.top - margin.bottom;
        
        const svg = d3.select("#scatter0").append("svg")
            .attr("width", svgWidth)
            .attr("height", svgHeight);
        
        // Create a clip path to prevent dots from overflowing
        svg.append("defs").append("clipPath")
            .attr("id", "clip")
            .append("rect")
            .attr("width", width)
            .attr("height", height);
        
        // Create chart group with the clip path
        const chartGroup = svg.append("g")
            .attr("transform", `translate(${margin.left},${margin.top})`)
            .attr("clip-path", "url(#clip)");
        
        const x = d3.scaleLinear()
            .domain([0, d3.max(points, d => d.x) * 1.15])
            .range([0, width]);
        
        const y = d3.scaleLinear()
            .domain([0, d3.max(points, d => d.y) * 1.15])
            .range([height, 0]);
        
        const xAxis = d3.axisBottom(x);
        const yAxis = d3.axisLeft(y);
        
        const xAxisGroup = svg.append("g")
            .attr("transform", `translate(${margin.left},${margin.top + height})`)
            .call(xAxis);
        
        const yAxisGroup = svg.append("g")
            .attr("transform", `translate(${margin.left},${margin.top})`)
            .call(yAxis);
        
        const dots = chartGroup.selectAll(".dot")
            .data(points)
            .enter().append("circle")
            .attr("class", "dot")
            .attr("cx", d => x(d.x))
            .attr("cy", d => y(d.y))
            .attr("r", 5)
            .style("fill", "#4285F4");
        
        // Optional: Adding labels to each data point
        const labels = chartGroup.selectAll(".text")
            .data(points)
            .enter().append("text")
            .attr("x", d => x(d.x))
            .attr("y", d => y(d.y) - 10)
            // .text(d => `(${d.x}, ${d.y})`)
            .attr("text-anchor", "middle")
            .style("font-size", "12px")
            .style("fill", "black");
        
        svg.append("text")
            .attr("x", (width / 2) + margin.left)
            .attr("y", height + 70)
            .attr("text-anchor", "middle")
            .style("font-size", "16px")
            .style("font-family", "Arial, sans-serif")
            .style("font-weight", "bold")
            .style("fill", "black")
            .text(datasetX.col_name);

        svg.append("text")
            .attr("x", 0)
            .attr("y", 120)
            .attr("transform", "rotate(-90," + 20 + "," + (height / 2) + ")")  // Rotate around its current position
            .attr("text-anchor", "middle")
            .style("font-size", "16px")
            .style("font-family", "Arial, sans-serif")
            .style("font-weight", "bold")
            .style("fill", "black")
            .text(datasetY.col_name);
        

        // Define the zoom behavior
        const zoom = d3.zoom()
            .scaleExtent([1, 100])  // Set the zoom scale extent
            .extent([[margin.left, margin.top], [width + margin.left, height + margin.top]])
            .on("zoom", zoomed);
        
        // Attach the zoom behavior to the SVG
        svg.call(zoom);
        
        function zoomed(event) {
            // Create new scales based on the event transform
            const newX = event.transform.rescaleX(x);
            const newY = event.transform.rescaleY(y);
        
            // Update the axes
            xAxisGroup.call(xAxis.scale(newX));
            yAxisGroup.call(yAxis.scale(newY));
        
            // Update the dots
            dots.attr("cx", d => newX(d.x))
                .attr("cy", d => newY(d.y));
        
            // Update the labels (if using)
            labels.attr("x", d => newX(d.x))
                .attr("y", d => newY(d.y) - 10);
        }

    }

    useEffect(() => {
        if(props.datasetX.length){
            var container = document.getElementById("scatter0");
            var svgs = container.getElementsByTagName('svg');
            
            createPlot(props.datasetX[0], props.datasetY[0],"#"+"scatter0")

            for (let index = 0; index < svgs.length; index++) {
                if(svgs.length-1 !== index){
                    container.removeChild(svgs[index]); 
                }
            }
        }
    }, [props.datasetX]);

  return <>
        <div className="col-12 p-4" id={"scatter0"}></div>
     </>;
}

export default ScatterPlot;
