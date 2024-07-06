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
        const width = 500, height = 300, margin = { top: 50, right: 100, bottom: 30, left: 50 };

        const datasets = dataset.datasets;
        const colors = ["#1f77b4", "#ff7f0e", "#2ca02c"];
        console.log("DATASET",dataset.datasets)
        const svg = d3.select(id).append("svg")
            .attr("width", width)
            .attr("height", height);

        // Create a clip path to prevent elements from overflowing
        svg.append("defs").append("clipPath")
            .attr("id", "clip")
            .append("rect")
            .attr("width", width - margin.left - margin.right)
            .attr("height", height - margin.top - margin.bottom)
            .attr("x", 0)
            .attr("y", 0);

        const chartArea = svg.append("g")
            .attr("transform", `translate(${margin.left},${margin.top})`)
            .attr("clip-path", "url(#clip)");

        const x = d3.scaleLinear()
            .domain([0, dataset.maxNumber])  // Adjust domain to accommodate all data
            .range([0, width - margin.left - margin.right]);

        const xAxisGroup = svg.append("g")
            .attr("transform", `translate(${margin.left},${height - margin.bottom})`)
            .call(d3.axisBottom(x));

        const kde = kernelDensityEstimator(kernelEpanechnikov(7), x.ticks(40));
        const allDensity = datasets.map((data, i) => ({
            density: kde(data.map(d => d)),
            color: colors[i]
        }));

        const y = d3.scaleLinear()
            .domain([0, d3.max(allDensity.map(d => d3.max(d.density, d => d[1])))])
            .range([height - margin.top - margin.bottom, 0]);

        const yAxisGroup = svg.append("g")
            .attr("transform", `translate(${margin.left},${margin.top})`)
            .call(d3.axisLeft(y));

        const line = d3.line()
            .curve(d3.curveBasis)
            .x(d => x(d[0]))
            .y(d => y(d[1]));

        const paths = chartArea.selectAll("path")
            .data(allDensity)
            .enter().append("path")
            .attr("fill", d => d.color)
            .attr("opacity", ".6")
            .attr("stroke", "#000")
            .attr("stroke-width", 1)
            .attr("stroke-linejoin", "round")
            .attr("d", d => line(d.density));

        // svg.append("text")
        //     .attr("x", width / 2)
        //     .attr("y", margin.top )
        //     .attr("text-anchor", "middle")
        //     .style("font-size", "16px")
        //     .style("font-family", "Arial, sans-serif")
        //     .style("font-weight", "bold")
        //     .style("fill", "black")
        //     .text(dataset.col_name);

        // Handmade legend
        svg.append("circle").attr("cx", 40).attr("cy", 10).attr("r", 6).style("fill", "#1f77b4");
        svg.append("circle").attr("cx", 110).attr("cy", 10).attr("r", 6).style("fill", "#ff7f0e");
        svg.append("circle").attr("cx", 180).attr("cy", 10).attr("r", 6).style("fill", "#2ca02c");
        svg.append("text").attr("x", 50).attr("y", 10).text("Stage 1").style("font-size", "10px").attr("alignment-baseline", "middle");
        svg.append("text").attr("x", 120).attr("y", 10).text("Stage 2").style("font-size", "10px").attr("alignment-baseline", "middle");
        svg.append("text").attr("x", 190).attr("y", 10).text("Stage 3").style("font-size", "10px").attr("alignment-baseline", "middle");

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
            xAxisGroup.call(d3.axisBottom(newX));
            yAxisGroup.call(d3.axisLeft(newY));

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
