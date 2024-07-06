import { useEffect, useRef, useState } from "react"
import * as d3 from "d3";
import "./multibar.css"
import { svg } from "d3";

function MultiBarChartPlot(props) {

    const createPlot = (dataset, id) => {
        const data = dataset.datasets;

        const svgWidth = 500;
        const svgHeight = 300;

        const margin = { top: 20, right: 200, bottom: 30, left: 40 };
        const width = svgWidth - margin.left - margin.right;
        const height = svgHeight - margin.top - margin.bottom;

        const svg = d3.select(id).append("svg")
            .attr("width", svgWidth)
            .attr("height", svgHeight)
            .append("g")
            .attr("transform", `translate(${margin.left},${margin.top})`);

        const x0 = d3.scaleBand()
            .domain(data.map(d => d.group))
            .rangeRound([0, width])
            .paddingInner(0.1);

        const x1 = d3.scaleBand()
            .domain(['categoryA', 'categoryB', 'categoryC'])
            .rangeRound([0, x0.bandwidth()])
            .padding(0.05);

        const y = d3.scaleLinear()
            .domain([0, d3.max(data, d => d3.max([d.categoryA, d.categoryB, d.categoryC]))])
            .nice()
            .rangeRound([height, 0]);

        const yRight = d3.scaleLinear()
            .domain([0, d3.max(data, d => d3.max([d.categoryA, d.categoryB, d.categoryC]))])
            .nice()
            .rangeRound([height, 0]);

        const xAxis = d3.axisBottom(x0);
        const yAxis = d3.axisLeft(y);
        const yAxisRight = d3.axisRight(yRight);

        svg.append("g")
            .selectAll("g")
            .data(data)
            .enter().append("g")
            .attr("transform", d => `translate(${x0(d.group)},0)`)
            .selectAll("rect")
            .data(d => [
                { key: 'categoryA', value: d.categoryA },
                { key: 'categoryB', value: d.categoryB },
                { key: 'categoryC', value: d.categoryC }
            ])
            .enter().append("rect")
            .attr("x", d => x1(d.key))
            .attr("y", d => y(d.value))
            .attr("width", x1.bandwidth())
            .attr("height", d => height - y(d.value))
            .attr("fill", d => {
                if (d.key === 'categoryA') return "#1f77b4";
                else if (d.key === 'categoryB') return "#ff7f0e";
                else return "#2ca02c";
            });

        // Append Axes
        svg.append("g")
            .attr("class", "x axis")
            .attr("transform", `translate(0, ${height})`)
            .call(xAxis);

        svg.append("g")
            .attr("class", "y axis")
            .call(yAxis);

        svg.append("g")
            .attr("class", "y axis right")
            .attr("transform", `translate(${width}, 0)`)
            .call(yAxisRight);

        // Handmade legend
        svg.append("circle").attr("cx", 40).attr("cy", 0).attr("r", 6).style("fill", "#1f77b4");
        svg.append("circle").attr("cx", 110).attr("cy", 0).attr("r", 6).style("fill", "#ff7f0e");
        svg.append("circle").attr("cx", 180).attr("cy", 0).attr("r", 6).style("fill", "#2ca02c");
        svg.append("text").attr("x", 50).attr("y", 0).text("Stage 1").style("font-size", "10px").attr("alignment-baseline", "middle");
        svg.append("text").attr("x", 120).attr("y", 0).text("Stage 2").style("font-size", "10px").attr("alignment-baseline", "middle");
        svg.append("text").attr("x", 190).attr("y", 0).text("Stage 3").style("font-size", "10px").attr("alignment-baseline", "middle");


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
    }, [props.dataset]);

  return <>
        <div className="col-12 p-4" id={"multiBarChart0"}></div>
     </>;
}

export default MultiBarChartPlot;
