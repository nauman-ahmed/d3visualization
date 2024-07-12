import { useEffect, useRef, useState } from "react"
import * as d3 from "d3";
import "./scatter.css"
import { svg } from "d3";

function ScatterPlot(props) {
    const colNameX = useRef(props.datasetX[0]?.col_name)
    const colNameY = useRef(props.datasetY[0]?.col_name)
    const height = useRef(null)

    const scatterClickHandler = (event,d,datasetX,datasetY) => {
        if(props.clickHandler){
            
            props.clickHandler(event,d,datasetX?.col_name,datasetY?.col_name)
        }
    }

    const createPlot = (datasetX, datasetY, id, duration= 4000) => {

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
            .attr("transform", `translate(${margin.left},${margin.top + height})`);
        if(colNameX.current !== datasetX?.col_name || colNameY.current !== datasetY?.col_name){
            xAxisGroup.transition().duration(duration).call(xAxis);
        }else{
            xAxisGroup.call(xAxis);
        }
        
        const yAxisGroup = svg.append("g")
            .attr("transform", `translate(${margin.left},${margin.top})`);
        
        if(colNameX.current !== datasetX?.col_name || colNameY.current !== datasetY?.col_name){
            yAxisGroup.transition().duration(duration).call(yAxis);
        }else{
            yAxisGroup.call(yAxis);
        }

        // Define the tooltip
        const tooltip = d3.select("body").append("div")
            .attr("class", "tooltip")
            .style("opacity", 0);
            
        const dots = chartGroup.selectAll(".dot")
            .data(points)
            .enter().append("circle")
            .attr("class", "dot")
            .attr("cx", d => x(d.x))
            .attr("cy", d => y(d.y))
            .attr("r", 5)
            .on("click",(event,d) => {
                tooltip.transition()
                    .style("opacity", 0);
                scatterClickHandler(event,d,datasetX,datasetY)
            })
            .style("fill", "#4285F4")
            .on("mouseover", function(event, d) {
                tooltip.transition()
                    .duration(200)
                    .style("opacity", .9);
                tooltip.html(`(${d.x}, ${d.y})`)
                    .style("left", (event.pageX + 10) + "px")
                    .style("top", (event.pageY - 28) + "px");
            })
            // Tooltip mouseout event handling
            .on("mouseout", function(event, d) {
                const tools = document.getElementsByClassName("tooltip")
                Object.keys(tools).forEach(key => {
                    tools[key].style.opacity = 0
                });
                tooltip.transition()
                    .duration(500)
                    .style("opacity", 0);
            });
        
        // CSS for tooltip
        d3.select("head").append("style").text(`
            .tooltip {
                position: absolute;
                text-align: center;
                width: auto;
                height: auto;
                padding: 5px;
                font: 12px sans-serif;
                background: lightsteelblue;
                border: 0px;
                border-radius: 8px;
                pointer-events: none;
            }
        `);
        
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
            .attr("y", height + 60)
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

        colNameX.current = datasetX?.col_name
        colNameY.current = datasetY?.col_name

    }

    useEffect(() => {
        if(props.datasetX.length){
            var container = document.getElementById("scatter0");
            var svgs = container.getElementsByTagName('svg');
            
            createPlot(props.datasetX[0], props.datasetY[0],"#"+"scatter0",props.duration)

            for (let index = 0; index < svgs.length; index++) {
                if(svgs.length-1 !== index){
                    container.removeChild(svgs[index]); 
                }
            }
        }
    }, [props.datasetX]);

  return <>
        <div className="col-12 p-4  col-sm-12" id={"scatter0"}></div>
     </>;
}

export default ScatterPlot;
