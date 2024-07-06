import { useEffect, useRef, useState } from "react"
import * as d3 from "d3";
import "./density.css"
import { svg } from "d3";

function DensityPlot(props) {

    // Kernel Density Estimator functions
    function kernelDensityEstimator(kernel, X) {
        return function(V) {
            return X.map(function(x) {
                return [x, d3.mean(V, function(v) { return kernel(x - v); })];
            });
        };
    }

    function kernelEpanechnikov(k) {
        return function(v) {
            return Math.abs(v /= k) <= 1 ? 0.75 * (1 - v * v) / k : 0;
        };
    }

    const createPlot = (dataset, id) => {
        const width = 500, height = 300, margin = { top: 10, right: 30, bottom: 30, left: 50 };

        const datasets = dataset.datasets;
        const colors = ["#69b3a2", "#404080", "#ff6600"];

        const svg = d3.select(id).append("svg")
            .attr("width", width)
            .attr("height", height)
            .append("g")
            .attr("transform", `translate(${margin.left},${margin.top})`);

        const x = d3.scaleLinear()
            .domain([0, dataset.maxNumber])  // Adjust domain to accommodate all data
            .range([0, width - margin.left - margin.right]);

        const xAxis = svg.append("g")
            .attr("transform", `translate(0,${height - margin.top - margin.bottom})`)
            .call(d3.axisBottom(x));

        const kde = kernelDensityEstimator(kernelEpanechnikov(7), x.ticks(10));
        const allDensity = datasets.map((data, i) => ({
            density: kde(data.map(d => d)),
            color: colors[i]
        }));

        const y = d3.scaleLinear()
            .domain([0, d3.max(allDensity.map(d => d3.max(d.density, d => d[1])))])
            .range([height - margin.top - margin.bottom, 0]);

        const yAxis = svg.append("g")
            .call(d3.axisLeft(y));

        const line = d3.line()
            .curve(d3.curveBasis)
            .x(d => x(d[0]))
            .y(d => y(d[1]));

        const paths = svg.selectAll("path")
            .data(allDensity)
            .enter().append("path")
            .attr("fill", d => d.color)
            .attr("opacity", ".6")
            .attr("stroke", "#000")
            .attr("stroke-width", 1)
            .attr("stroke-linejoin", "round")
            .attr("d", d => line(d.density));

        svg.append("text")
            .attr("x", width / 2)
            .attr("y", 10)
            .attr("text-anchor", "middle")
            .style("font-size", "16px")
            .style("font-family", "Arial, sans-serif")
            .style("font-weight", "bold")
            .style("fill", "black")
            .text(dataset.col_name);

        // Handmade legend
        svg.append("circle").attr("cx", width - 75).attr("cy", 10).attr("r", 6).style("fill", "#69b3a2");
        svg.append("circle").attr("cx", width - 75).attr("cy", 30).attr("r", 6).style("fill", "#404080");
        svg.append("circle").attr("cx", width - 75).attr("cy", 50).attr("r", 6).style("fill", "#ff6600");
        svg.append("text").attr("x", width - 100).attr("y", 10).text("Stage 1").style("font-size", "15px").attr("alignment-baseline", "middle");
        svg.append("text").attr("x", width - 100).attr("y", 30).text("Stage 2").style("font-size", "15px").attr("alignment-baseline", "middle");
        svg.append("text").attr("x", width - 100).attr("y", 50).text("Stage 3").style("font-size", "15px").attr("alignment-baseline", "middle");

        // Define the zoom behavior
        const zoom = d3.zoom()
            .scaleExtent([1, 10])  // Set the zoom scale extent
            .translateExtent([[0, 0], [width, height]])  // Set the translate extent
            .extent([[0, 0], [width, height]])
            .on("zoom", zoomed);

        // Attach the zoom behavior to the SVG
        svg.call(zoom);

        function zoomed(event) {
            // Create new scales based on the event transform
            const newX = event.transform.rescaleX(x);
            const newY = event.transform.rescaleY(y);

            // Update the axes
            xAxis.call(d3.axisBottom(newX));
            yAxis.call(d3.axisLeft(newY));

            // Update the paths
            paths.attr("d", d => {
                return d3.line()
                    .curve(d3.curveBasis)
                    .x(d => newX(d[0]))
                    .y(d => newY(d[1]))(d.density);
            });
        }

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
