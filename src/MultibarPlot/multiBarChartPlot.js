import { useEffect, useRef, useState } from "react"
import * as d3 from "d3";
import "./multibar.css"
import { svg } from "d3";

function MultiBarChartPlot(props) {

    const [colors, setColors] = useState(["#1f77b4", "#ff7f0e", "#2ca02c"])

    // Define the action to take on click
    function onCircleClick(i) {
        const colors = ["#1f77b4", "#ff7f0e", "#2ca02c"]
        let dummyColors = ["#d3d3d3", "#d3d3d3", "#d3d3d3"]
        dummyColors.splice(i-1,1,colors[i-1])
        setColors(dummyColors)
    }

    const createPlot = (dataset, id) => {
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
        
        const yRight = d3.scaleLinear()
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
            .attr("y", d => y(d.value))
            .attr("width", x1.bandwidth())
            .attr("height", d => height - y(d.value))
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
            });
        
        // Append Axes
        svg.append("g")
            .attr("class", "x axis")
            .attr("transform", `translate(0, ${height})`)
            .call(xAxis);
        
        svg.append("g")
            .attr("class", "y axis")
            .call(yAxis);
        
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
        svg.append("circle").attr("cx", 20).attr("cy", 0).attr("r", 6).style("fill", "#1f77b4").on("click", () => onCircleClick(1));
        svg.append("circle").attr("cx", 80).attr("cy", 0).attr("r", 6).style("fill", "#ff7f0e").on("click", () => onCircleClick(2));
        svg.append("circle").attr("cx", 140).attr("cy", 0).attr("r", 6).style("fill", "#2ca02c").on("click", () => onCircleClick(3));
        svg.append("circle").attr("cx", 200).attr("cy", 0).attr("r", 6).style("fill", "red").on("click", () => setColors(["#1f77b4", "#ff7f0e", "#2ca02c"]));;
        svg.append("text").attr("x", 30).attr("y", 0).text("Stage 1").style("font-size", "10px").attr("alignment-baseline", "middle");
        svg.append("text").attr("x", 90).attr("y", 0).text("Stage 2").style("font-size", "10px").attr("alignment-baseline", "middle");
        svg.append("text").attr("x", 150).attr("y", 0).text("Stage 3").style("font-size", "10px").attr("alignment-baseline", "middle");
        svg.append("text").attr("x", 210).attr("y", 0).text("Reset").style("font-size", "10px").attr("alignment-baseline", "middle");
        
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


    }

    useEffect(() => {
        if(props.dataset.length){
            var container = document.getElementById("multiBarChart0");
            var svgs = container.getElementsByTagName('svg');
            
            createPlot(props.dataset[0],"#"+"multiBarChart0")

            for (let index = 0; index < svgs.length; index++) {
                if(svgs.length-1 !== index){
                    container.removeChild(svgs[index]); 
                }
            }
        }
    }, [props.dataset,colors]);

  return <>
        <div className="col-12 p-4" id={"multiBarChart0"}></div>
     </>;
}

export default MultiBarChartPlot;
