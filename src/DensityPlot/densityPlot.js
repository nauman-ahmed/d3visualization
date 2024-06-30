import { useEffect, useRef, useState } from "react"
import * as d3 from "d3";
import "./density.css"
import { svg } from "d3";

function DensityPlot(props) {

    // Kernel Density Estimation function
    function kernelDensityEstimator(kernel, X) {
        return function(V) {
            return X.map(x => [x, d3.mean(V, v => kernel(x - v))]);
        };
    }

    // Epanechnikov kernel
    function kernelEpanechnikov(k) {
        return function(v) {
            return Math.abs(v /= k) <= 1 ? 0.75 * (1 - v * v) / k : 0;
        };
    }

    const createPlot = (dataset, id) => {
        const width = 500, height = 300, margin = { top: 10, right: 30, bottom: 30, left: 50 };
            
        const datasets = dataset.datasets
        const colors = ["#69b3a2", "#404080", "#ff6600"];

        const svg = d3.select(id).append("svg")
            .attr("width", width)
            .attr("height", height)
            .append("g")
            .attr("transform", `translate(${margin.left},${margin.top})`);

        const x = d3.scaleLinear()
            .domain([0, dataset.maxNumber])  // Adjust domain to accommodate all data
            .range([0, width - margin.left - margin.right]);

        svg.append("g")
            .attr("transform", `translate(0,${height - margin.top - margin.bottom})`)
            .call(d3.axisBottom(x));

        const kde = kernelDensityEstimator(kernelEpanechnikov(7), x.ticks(10));
        const allDensity = datasets.map((data, i) => ({
            density: kde(data.map(d => d)),
            color: colors[i]
        }));
        
        // const max_num = d3.max(allDensity.map(d => d3.max(d.density, d => d[1])))*d3.max(allDensity.map(d => d3.max(d.density, d => d[1])))
        const y = d3.scaleLinear()
            .domain([d3.min(allDensity.map(d => d3.min(d.density, d => d[1]))), d3.max(allDensity.map(d => d3.max(d.density, d => d[1])))])
            .range([height - margin.top - margin.bottom, 0]);
        
        svg.append("g")
            .call(d3.axisLeft(y));

        allDensity.forEach(d => {
            svg.append("path")
                .datum(d.density)
                .attr("fill", d.color)
                .attr("opacity", ".6")
                .attr("stroke", "#000")
                .attr("stroke-width", 1)
                .attr("stroke-linejoin", "round")
                .attr("d", d3.line()
                    .curve(d3.curveBasis)
                    .x(d => x(d[0]))
                    .y(d => y(d[1]))
                )
        });

        svg.append("text")
            .attr("x", width / 2)
            .attr("y", 10)
            .attr("text-anchor", "middle")
            .style("font-size", "16px")
            .style("font-family", "Arial, sans-serif")
            .style("font-weight", "bold")  // Make the font bold
            .style("fill", "black")  // Set the text color
            .text(dataset.col_name);

        // Handmade legend
        svg.append("circle").attr("cx",270).attr("cy",30).attr("r", 6).style("fill", "#69b3a2")
        svg.append("circle").attr("cx",270).attr("cy",60).attr("r", 6).style("fill", "#404080")
        svg.append("circle").attr("cx",270).attr("cy",90).attr("r", 6).style("fill", "#ff6600")
        svg.append("text").attr("x", 290).attr("y", 30).text("Stage 1").style("font-size", "15px").attr("alignment-baseline","middle")
        svg.append("text").attr("x", 290).attr("y", 60).text("Stage 2").style("font-size", "15px").attr("alignment-baseline","middle")
        svg.append("text").attr("x", 290).attr("y", 90).text("Stage 3").style("font-size", "15px").attr("alignment-baseline","middle")

    }

    useEffect(() => {
        if(props.dataset.length){
            var container = document.getElementById("densityPlot0");
            var svgs = container.getElementsByTagName('svg');
            
            createPlot(props.dataset[0],"#"+"densityPlot0")

            for (let index = 0; index < svgs.length; index++) {
                if(svgs.length-1 !== index){
                    container.removeChild(svgs[index]); 
                }
            }
        }
    }, [props.dataset]);

  return <>
        <div className="col-12 p-4" id={"densityPlot0"}></div>
     </>;
}

export default DensityPlot;
