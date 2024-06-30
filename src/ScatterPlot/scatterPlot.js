import { useEffect, useRef, useState } from "react"
import * as d3 from "d3";
import "./scatter.css"
import { svg } from "d3";

function ScatterPlot(props) {

    const createPlot = (datasetX, datasetY, id) => {
        const data = [
            { x: datasetX.datasets, y: datasetY.datasets }
          ];
        
        console.log(data)
        // Flatten the data structure for easier processing with D3
        const points = data.reduce((acc, val) => {
        val.x.forEach((x, i) => {
            acc.push({ x: x, y: val.y[i] });
        });
        return acc;
        }, []);
    
        const svgWidth = 500;
        const svgHeight = 300;
    
        const margin = { top: 20, right: 20, bottom: 30, left: 40 };
        const width = svgWidth - margin.left - margin.right;
        const height = svgHeight - margin.top - margin.bottom;
    
        const svg = d3.select("#scatter0").append("svg")
        .attr("width", svgWidth)
        .attr("height", svgHeight)
        .append("g")
        .attr("transform", `translate(${margin.left},${margin.top})`);
    
        const x = d3.scaleLinear()
        .domain([0, d3.max(points, d => d.x)*1.15])
        .range([0, width]);
        
        const y = d3.scaleLinear()
        .domain([0, d3.max(points, d => d.y)*1.15])
        .range([height, 0]);
    
        svg.append("g")
        .attr("transform", `translate(0,${height})`)
        .call(d3.axisBottom(x));
    
        svg.append("g")
        .call(d3.axisLeft(y));
    
        svg.selectAll(".dot")
        .data(points)
        .enter().append("circle")
        .attr("class", "dot")
        .attr("cx", d => x(d.x))
        .attr("cy", d => y(d.y))
        .attr("r", 5)
        .style("fill", "#4285F4");
    
        // Optional: Adding labels to each data point
        svg.selectAll(".text")
        .data(points)
        .enter().append("text")
        .attr("x", d => x(d.x))
        .attr("y", d => y(d.y) - 10)
        // .text(d => `(${d.x}, ${d.y})`)
        .attr("text-anchor", "middle")
        .style("font-size", "12px")
        .style("fill", "black");

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
