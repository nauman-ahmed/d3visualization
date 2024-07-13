import { useEffect, useRef, useState } from "react"
import * as d3 from "d3";
import "./density.css"
import { CardColumns } from "reactstrap";

function DensityPlot(props) {

    const colName = useRef(null)

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
        var container = document.getElementById("densityPlot0");
        var svgs = container.getElementsByTagName('svg');
        if(i == 4){
            createPlot(props.dataset[0],"#"+"densityPlot0",["#1f77b4", "#ff7f0e", "#2ca02c"])
        }else{
            createPlot(props.dataset[0],"#"+"densityPlot0",dummyColors)
        }
        for (let index = 0; index < svgs.length; index++) {
            if(svgs.length-1 !== index){
                container.removeChild(svgs[index]); 
            }
        }
    }

    const createPlot = (dataset, id, colors = ["#1f77b4", "#ff7f0e", "#2ca02c"] ) => {
        const width = props.isMobileView ? 280  :  400, height = props.isMobileView ? 200 : 300, margin = { top: 40, right: 0, bottom: 70, left: 40 };
        console.log("DATASET",dataset)
        const svg = d3.select(id).append("svg")
            .attr("width", width + margin.left + margin.right)
            .attr("height", height + margin.top + margin.bottom)
            .style("background-color", "white")
            .append("g")
            .attr("transform", `translate(${margin.left},${margin.top})`);

        // Create a clip path to prevent content from going out of bounds
        svg.append("defs").append("clipPath")
            .attr("id", "clip")
            .append("rect")
            .attr("width", width)
            .attr("height", height);

        // Sample data for three stages of liver cirrhosis
        const stage1 = dataset.datasets[0];
        const stage2 = dataset.datasets[1];
        const stage3 = dataset.datasets[2];

        // Combine the data
        const data = [
            { key: "Stage 1", values: stage1 },
            { key: "Stage 2", values: stage2 },
            { key: "Stage 3", values: stage3 }
        ];

        // Set the ranges
        const x = d3.scaleLinear()
            .domain([-10, dataset.maxNumber + 10])
            .range([0, width]);
        
        const y = d3.scaleLinear()
            .range([height, 0]);

        // Set the parameters for the kernel density estimator
        const kde = kernelDensityEstimator(kernelEpanechnikov(7), x.ticks(40));

        // Define the colors for each stage
        const color = d3.scaleOrdinal()
            .domain(["Stage 1", "Stage 2", "Stage 3"])
            .range(colors);

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

        // Add a transparent rectangle to capture zoom events
        svg.append("rect")
            .attr("width", width)
            .attr("height", height)
            .style("fill", "none")
            .style("pointer-events", "all");

        // Calculate density once and store it
        const densities = data.map(stage => {
            const density = kde(stage.values);
            return { key: stage.key, density: density };
        });

        // Add the density plot for each stage
        const densityPaths = densities.map(stage => {
            y.domain([0, d3.max(stage.density, d => d[1])]);

            return svg.append("path")
                .datum(stage.density)
                .attr("class", "density-path")
                .attr("fill", color(stage.key))
                .attr("opacity", "0.4")
                .attr("stroke", "none")
                .attr("clip-path", "url(#clip)")
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
        const xAxis = svg.append("g")
            .attr("class", "x axis")
            .attr("transform", `translate(0,${height})`);

        if(colName.current !== dataset.col_name){
            xAxis.transition().duration(1000).call(d3.axisBottom(x));
        }else{
            xAxis.call(d3.axisBottom(x));
        }

        // Add the Y Axis
        const yAxis = svg.append("g")
            .attr("class", "y axis");

        if(colName.current !== dataset.col_name){
            yAxis.transition().duration(1000).call(d3.axisLeft(y));
        }else{
            yAxis.call(d3.axisLeft(y));
        }
    
        // Handmade legend
        const circle1 = svg.append("circle").attr("cx", 30).attr("cy", -10).attr("r", 6).style("fill", "#1f77b4").style("opacity", 0).on("click", () => onCircleClick(1));
        const circle2 = svg.append("circle").attr("cx", 100).attr("cy", -10).attr("r", 6).style("fill", "#ff7f0e").style("opacity", 0).on("click", () => onCircleClick(2));
        const circle3 = svg.append("circle").attr("cx", 170).attr("cy", -10).attr("r", 6).style("fill", "#2ca02c").style("opacity", 0).on("click", () => onCircleClick(3));
        const circle4 = svg.append("circle").attr("cx", 240).attr("cy", -10).attr("r", 6).style("fill", "red").style("opacity", 0).on("click", () => onCircleClick(4));;
        const text1 = svg.append("text").attr("x", 40).attr("y", -10).text("Stage 1").style("font-size", "10px").style("opacity", 0).attr("alignment-baseline", "middle");
        const text2 = svg.append("text").attr("x", 110).attr("y", -10).text("Stage 2").style("font-size", "10px").style("opacity", 0).attr("alignment-baseline", "middle");
        const text3 = svg.append("text").attr("x", 180).attr("y", -10).text("Stage 3").style("font-size", "10px").style("opacity", 0).attr("alignment-baseline", "middle");
        const text4 = svg.append("text").attr("x", 250).attr("y", -10).text("Reset").style("font-size", "10px").style("opacity", 0).attr("alignment-baseline", "middle");

        if(colName.current !== dataset.col_name){
            circle1.transition().duration(300).style("opacity", 1);
            circle2.transition().duration(600).style("opacity", 1);
            circle3.transition().duration(700).style("opacity", 1);
            circle4.transition().duration(800).style("opacity", 1);
    
            text1.transition().duration(300).style("opacity", 1);
            text2.transition().duration(600).style("opacity", 1);
            text3.transition().duration(700).style("opacity", 1);
            text4.transition().duration(800).style("opacity", 1);
    
        }else{
            circle1.style("opacity", 1);
            circle2.style("opacity", 1);
            circle3.style("opacity", 1);
            circle4.style("opacity", 1);
    
            text1.style("opacity", 1);
            text2.style("opacity", 1);
            text3.style("opacity", 1);
            text4.style("opacity", 1);
    
        }
        
        svg.append("text")
            .attr("x", width / 2)
            .attr("y", height + 50)
            .attr("text-anchor", "middle")
            .style("font-size", "16px")
            .style("font-family", "Arial, sans-serif")
            .style("font-weight", "bold")
            .style("fill", "black")
            .text(dataset.col_name);

        // Add zoom functionality
        const zoom = d3.zoom()
            .scaleExtent([1, 10])
            .translateExtent([[-margin.left, -margin.top], [width + margin.right, height + margin.bottom]])
            .extent([[0, 0], [width, height]])
            .on("zoom", zoomed);

        svg.call(zoom);

        function zoomed(event) {
            const transform = event.transform;
            const newX = transform.rescaleX(x);
            const newY = transform.rescaleY(y);

            // Update axes
            xAxis.call(d3.axisBottom(newX));
            yAxis.call(d3.axisLeft(newY));

            // Update density paths without recalculating density
            densityPaths.forEach((path, i) => {
                path.attr("d", d3.area()
                    .curve(d3.curveBasis)
                    .x(d => newX(d[0]))
                    .y1(d => newY(d[1]))
                    .y0(newY(0)));
            });

            // Update tooltip to reflect the transformed scales
            svg.selectAll(".density-path")
                .on("mouseover", (event, d) => {
                    const [mouseX, mouseY] = d3.pointer(event);
                    const xValue = newX.invert(mouseX);
                    const yValue = newY.invert(mouseY);
                    tooltip.transition()
                        .duration(200)
                        .style("opacity", .9);
                    tooltip.html(`X: ${xValue.toFixed(2)}<br/>Y: ${yValue.toFixed(4)}`)
                        .style("left", (event.pageX + 5) + "px")
                        .style("top", (event.pageY - 28) + "px");
                })
                .on("mousemove", (event, d) => {
                    const [mouseX, mouseY] = d3.pointer(event);
                    const xValue = newX.invert(mouseX);
                    const yValue = newY.invert(mouseY);
                    tooltip.html(`X: ${xValue.toFixed(2)}<br/>Y: ${yValue.toFixed(4)}`)
                        .style("left", (event.pageX + 5) + "px")
                        .style("top", (event.pageY - 28) + "px");
                });
        }
        colName.current = dataset.col_name
    };  

    useEffect(() => {
        if(colName.current !== props.dataset[0].col_name){
            var container = document.getElementById("densityPlot0");
            var svgs = container.getElementsByTagName('svg');
            createPlot(props.dataset[0],"#"+"densityPlot0",["#1f77b4", "#ff7f0e", "#2ca02c"])
            for (let index = 0; index < svgs.length; index++) {
                if(svgs.length-1 !== index){
                    container.removeChild(svgs[index]); 
                }
            }
        }
    }, [props.dataset]);

  return <>
        <div className="col-lg-12 d-flex justify-content-center" id={"densityPlot0"}></div>
     </>;
}

export default DensityPlot;
