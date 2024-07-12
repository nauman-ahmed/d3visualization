import { useEffect, useRef, useState } from "react"
import * as d3 from "d3";
import "./multibar.css"
import { svg } from "d3";

function MultiBarChartPlot(props) {

    const colName = useRef(null)

    // Define the action to take on click
    function onCircleClick(i) {
        const colors = ["#1f77b4", "#ff7f0e", "#2ca02c"];
        let dummyColors = ["#d3d3d3", "#d3d3d3", "#d3d3d3"];
        dummyColors.splice(i - 1, 1, colors[i - 1]);
        var container = document.getElementById("multiBarChart0");
        var svgs = container.getElementsByTagName('svg');
        if(i == 4){
            createPlot(props.dataset[0],"#"+"multiBarChart0",["#1f77b4", "#ff7f0e", "#2ca02c"])
        }else{
            createPlot(props.dataset[0],"#"+"multiBarChart0",dummyColors)
        }
        for (let index = 0; index < svgs.length; index++) {
            if(svgs.length-1 !== index){
                container.removeChild(svgs[index]); 
            }
        }
    }

    const createPlot = (dataset, id, colors = ["#1f77b4", "#ff7f0e", "#2ca02c"],animation = 0 ) => {
        const data = dataset.datasets;

        const svgWidth = 500;
        const svgHeight = 300;
        
        const margin = { top: 40, right: 200, bottom: 70, left: 40 };
        const width = svgWidth - margin.left - margin.right;
        const height = svgHeight - margin.top - margin.bottom;
        
        const svg = d3.select(id).append("svg")
            .attr("width", svgWidth)
            .attr("height", svgHeight)
            .append("g")
            .attr("transform", `translate(${margin.left},${margin.top})`);
        
        // Create tooltip div
        const tooltip = d3.select("body").append("div")
            .attr("class", "tooltip")
            .style("opacity", 0);
        
        const x0 = d3.scaleBand()
            .domain(data.map(d => d.group))
            .rangeRound([0, width])
            .paddingInner(0.1);
        
        const x1 = d3.scaleBand()
            .domain(['Stage1', 'Stage2', 'Stage3'])
            .rangeRound([0, x0.bandwidth()])
            .padding(0.05);
        
        const y = d3.scaleLinear()
            .domain([0, d3.max(data, d => d3.max([d.Stage1, d.Stage2, d.Stage3]))])
            .nice()
            .rangeRound([height, 0]);
        
        
        const xAxis = d3.axisBottom(x0);
        const yAxis = d3.axisLeft(y);
        
        svg.append("g")
    .selectAll("g")
    .data(data)
    .enter().append("g")
    .attr("transform", d => `translate(${x0(d.group)},0)`)
    .selectAll("rect")
    .data(d => [
        { key: 'Stage1', value: d.Stage1 },
        { key: 'Stage2', value: d.Stage2 },
        { key: 'Stage3', value: d.Stage3 }
    ])
    .enter().append("rect")
    .attr("x", d => x1(d.key))
    .attr("y", height)  // Initial y position at the bottom of the chart
    .attr("width", x1.bandwidth())
    .attr("height", 0) // Initial height is 0
    .attr("fill", d => {
        if (d.key === 'Stage1') return colors[0];
        else if (d.key === 'Stage2') return colors[1];
        else return colors[2];
    })
    .on("mouseover", function(event, d) {
        tooltip.transition()
            .duration(200)
            .style("opacity", .9);
        tooltip.html(`Category: ${d.key}<br>Value: ${d.value}`)
            .style("left", (event.pageX + 5) + "px")
            .style("top", (event.pageY - 28) + "px");
    })
    .on("mouseout", function(d) {
        tooltip.transition()
            .duration(500)
            .style("opacity", 0);
    })
    .transition()  // Add a transition for the bars
    .duration(animation)
    .attr("y", d => y(d.value))
    .attr("height", d => height - y(d.value));

        
        if(colName.current !== dataset.col_name){
            svg.append("g")
            .attr("class", "x axis")
            .attr("transform", `translate(0, ${height})`)
            .transition().duration(1000)
            .call(xAxis);

            svg.append("g")
            .attr("class", "y axis")
            .transition().duration(1000)
            .call(yAxis);

        }else{
            svg.append("g")
            .attr("class", "x axis")
            .attr("transform", `translate(0, ${height})`)
            .call(xAxis);

            svg.append("g")
            .attr("class", "y axis")
            .call(yAxis);
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
        
        // Handmade legend
        const circle1 = svg.append("circle").attr("cx", 50).attr("cy", -10).attr("r", 6).style("fill", "#1f77b4").style("opacity", 0).on("click", () => onCircleClick(1));
        const circle2 = svg.append("circle").attr("cx", 120).attr("cy", -10).attr("r", 6).style("fill", "#ff7f0e").style("opacity", 0).on("click", () => onCircleClick(2));
        const circle3 = svg.append("circle").attr("cx", 190).attr("cy", -10).attr("r", 6).style("fill", "#2ca02c").style("opacity", 0).on("click", () => onCircleClick(3));
        const circle4 = svg.append("circle").attr("cx", 260).attr("cy", -10).attr("r", 6).style("fill", "red").style("opacity", 0).on("click", () => onCircleClick(4));;
        const text1 = svg.append("text").attr("x", 60).attr("y", -10).text("Stage 1").style("font-size", "10px").style("opacity", 0).attr("alignment-baseline", "middle");
        const text2 = svg.append("text").attr("x", 130).attr("y", -10).text("Stage 2").style("font-size", "10px").style("opacity", 0).attr("alignment-baseline", "middle");
        const text3 = svg.append("text").attr("x", 200).attr("y", -10).text("Stage 3").style("font-size", "10px").style("opacity", 0).attr("alignment-baseline", "middle");
        const text4 = svg.append("text").attr("x", 270).attr("y", -10).text("Reset").style("font-size", "10px").style("opacity", 0).attr("alignment-baseline", "middle");

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
                cursor: pointer;
            }
        `);
        
        colName.current = dataset.col_name

    }

    useEffect(() => {
        if(colName.current !== props.dataset[0].col_name){
            var container = document.getElementById("multiBarChart0");
            var svgs = container.getElementsByTagName('svg');
            createPlot(props.dataset[0],"#"+"multiBarChart0", ["#1f77b4", "#ff7f0e", "#2ca02c"],1000)
            

            for (let index = 0; index < svgs.length; index++) {
                if(svgs.length-1 !== index){
                    container.removeChild(svgs[index]); 
                }
            }
        }
    }, [props.dataset]);

  return <>
        <div className="col-12 p-4" id={"multiBarChart0"}></div>
     </>;
}

export default MultiBarChartPlot;
