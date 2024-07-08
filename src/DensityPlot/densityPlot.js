import { useEffect, useRef, useState } from "react"
import * as d3 from "d3";
import "./density.css"

function DensityPlot(props) {

    const [colors, setColors] = useState(["#1f77b4", "#ff7f0e", "#2ca02c"])

    // Kernel Density Estimator functions
    function kernelDensityEstimator(kernel, X) {
        return function(V) {
            return X.map(function(x) {
                const x1 = d3.mean(V, function(v) { return kernel(x - v); });
                return [x, x1];
            });
        };
    }

    function kernelEpanechnikov(k) {
        return function(v) {
            v /= k;
            return Math.abs(v) <= 1 ? 0.75 * (1 - v * v) / k : 0;
        };
    }

    // Define the action to take on click
    function onCircleClick(i) {
        const colors = ["#1f77b4", "#ff7f0e", "#2ca02c"];
        let dummyColors = ["#d3d3d3", "#d3d3d3", "#d3d3d3"];
        dummyColors.splice(i - 1, 1, colors[i - 1]);
        setColors(dummyColors);
    }

    const createPlot = (dataset, id) => {
        const width = 500, height = 300, margin = { top: 50, right: 100, bottom: 70, left: 50 };

        const datasets = dataset.datasets;

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

        // Create tooltip div
        const tooltip = d3.select("body").append("div")
            .attr("class", "tooltip")
            .style("opacity", 0);

        const x = d3.scaleLinear()
            .domain([0, dataset.maxNumber])  // Adjust domain to accommodate all data
            .range([0, width - margin.left - margin.right]);

        const xAxisGroup = svg.append("g")
            .attr("transform", `translate(${margin.left},${height - margin.bottom})`)
            .call(d3.axisBottom(x));

        // Add label for the x-axis
        xAxisGroup.append("text")
            .attr("x", 80)
            .attr("y", 40)  // Adjusted y value to avoid overlap with the axis
            .style("text-anchor", "middle")
            .text("Your X-axis Label");

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
            .attr("opacity", ".4")
            .attr("stroke", "#000")
            .attr("stroke-width", 1)
            .attr("stroke-linejoin", "round")
            .attr("d", d => line(d.density))
            .on("mouseover", function(event, d) {
                tooltip.transition()
                    .duration(200)
                    .style("opacity", .9);
                tooltip.html(`Density: ${d3.max(d.density, d => d[1]).toFixed(5)}`)
                    .style("left", (event.pageX + 5) + "px")
                    .style("top", (event.pageY - 28) + "px");
            })
            .on("mouseout", function(d) {
                tooltip.transition()
                    .duration(500)
                    .style("opacity", 0);
            });

        svg.append("text")
            .attr("x", width / 2)
            .attr("y", height - 10)
            .attr("text-anchor", "middle")
            .style("font-size", "16px")
            .style("font-family", "Arial, sans-serif")
            .style("font-weight", "bold")
            .style("fill", "black")
            .text(dataset.col_name);

        // Handmade legend
        svg.append("circle").attr("cx", 70).attr("cy", 10).attr("r", 6).style("fill", "#1f77b4").on("click", () => onCircleClick(1));
        svg.append("circle").attr("cx", 140).attr("cy", 10).attr("r", 6).style("fill", "#ff7f0e").on("click", () => onCircleClick(2));
        svg.append("circle").attr("cx", 210).attr("cy", 10).attr("r", 6).style("fill", "#2ca02c").on("click", () => onCircleClick(3));
        svg.append("circle").attr("cx", 280).attr("cy", 10).attr("r", 6).style("fill", "red").on("click", () => setColors(["#1f77b4", "#ff7f0e", "#2ca02c"]));
        svg.append("text").attr("x", 80).attr("y", 10).text("Stage 1").style("font-size", "10px").attr("alignment-baseline", "middle");
        svg.append("text").attr("x", 150).attr("y", 10).text("Stage 2").style("font-size", "10px").attr("alignment-baseline", "middle");
        svg.append("text").attr("x", 220).attr("y", 10).text("Stage 3").style("font-size", "10px").attr("alignment-baseline", "middle");
        svg.append("text").attr("x", 290).attr("y", 10).text("Reset").style("font-size", "10px").attr("alignment-baseline", "middle");

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

        // Add CSS for tooltip
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
        console.log("DATASET",datasets,allDensity)
    };  


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
    }, [props.dataset,colors]);

  return <>
        <div className="col-12 p-4" id={"densityPlot0"}></div>
     </>;
}

export default DensityPlot;
