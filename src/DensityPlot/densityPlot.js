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
        const width = 500, height = 300, margin = { top: 40, right: 200, bottom: 70, left: 40 };

        const svg = d3.select(id).append("svg")
            .attr("width", width + margin.left + margin.right)
            .attr("height", height + margin.top + margin.bottom)
            .style("background-color", "white") // Set the background color to white
            .append("g")
            .attr("transform", `translate(${margin.left},${margin.top})`);

            // Sample data for three stages of liver cirrhosis
        const stage1 = dataset.datasets[0] 
        const stage2 = dataset.datasets[1]
        const stage3 = dataset.datasets[2]

        // Combine the data
        const data = [
            { key: "Stage 1", values: stage1 },
            { key: "Stage 2", values: stage2 },
            { key: "Stage 3", values: stage3 }
        ];

        // Set the ranges
        const x = d3.scaleLinear()
            .domain([-10, dataset.maxNumber+10])
            .range([0, width]);

        const y = d3.scaleLinear()
            .range([height, 0]);

        // Set the parameters for the kernel density estimator
        const kde = kernelDensityEstimator(kernelEpanechnikov(7), x.ticks(40));

        // Define the colors for each stage
        const color = d3.scaleOrdinal()
            .domain(["Stage 1", "Stage 2", "Stage 3"])
            .range(["#1f77b4", "#ff7f0e", "#2ca02c"]);

        // Create a tooltip element
        const tooltip = d3.select("body").append("div")
            .attr("class", "tooltip")
            .style("opacity", 0)
            .style("position", "absolute")
            .style("background-color", "white")
            .style("border", "solid")
            .style("border-width", "1px")
            .style("border-radius", "5px")
            .style("padding", "10px");

        // Add the density plot for each stage
        data.forEach(stage => {
            const density = kde(stage.values);
            y.domain([0, d3.max(density, d => d[1])]);

            svg.append("path")
                .datum(density)
                .attr("fill", color(stage.key))
                .attr("opacity", "0.4")
                .attr("stroke", "none")
                .attr("d", d3.area()
                    .curve(d3.curveBasis)
                    .x(d => x(d[0]))
                    .y1(d => y(d[1]))
                    .y0(y(0)))
                .on("mouseover", (event, d) => {
                    const [mouseX, mouseY] = d3.pointer(event);
                    const xValue = x.invert(mouseX);
                    const yValue = y.invert(mouseY);
                    tooltip.transition()
                        .duration(200)
                        .style("opacity", .9);
                    tooltip.html(`Stage: ${stage.key}<br/>X: ${xValue.toFixed(2)}<br/>Y: ${yValue.toFixed(4)}`)
                        .style("left", (event.pageX + 5) + "px")
                        .style("top", (event.pageY - 28) + "px");
                })
                .on("mousemove", (event, d) => {
                    const [mouseX, mouseY] = d3.pointer(event);
                    const xValue = x.invert(mouseX);
                    const yValue = y.invert(mouseY);
                    tooltip.html(`Stage: ${stage.key}<br/>X: ${xValue.toFixed(2)}<br/>Y: ${yValue.toFixed(4)}`)
                        .style("left", (event.pageX + 5) + "px")
                        .style("top", (event.pageY - 28) + "px");
                })
                .on("mouseout", (d) => {
                    tooltip.transition()
                        .duration(500)
                        .style("opacity", 0);
                });
        });

        // Add the X Axis
        svg.append("g")
            .attr("class", "x axis")
            .attr("transform", `translate(0,${height})`)
            .call(d3.axisBottom(x));

        // Add the Y Axis
        svg.append("g")
            .attr("class", "y axis")
            .call(d3.axisLeft(y));

        // Add legend
        const legend = svg.selectAll(".legend")
            .data(color.domain())
            .enter().append("g")
            .attr("class", "legend")
            .attr("transform", (d, i) => `translate(0,${i * 20})`);

        legend.append("rect")
            .attr("x", width - 18)
            .attr("width", 18)
            .attr("height", 18)
            .style("fill", color);

        legend.append("text")
            .attr("x", width - 24)
            .attr("y", 9)
            .attr("dy", ".35em")
            .style("text-anchor", "end")
            .text(d => d);

            
        
       
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
