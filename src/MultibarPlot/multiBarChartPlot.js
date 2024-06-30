import { useEffect, useRef, useState } from "react"
import * as d3 from "d3";
import "./multibar.css"
import { svg } from "d3";

function MultiBarChartPlot(props) {

    const createPlot = (dataset, id) => {
        const data = dataset.datasets;

        const svgWidth = 500;
        const svgHeight = 300;

        const margin = { top: 20, right: 20, bottom: 30, left: 40 };
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

        const xAxis = d3.axisBottom(x0);
        const yAxis = d3.axisLeft(y);

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

        const legend = svg.append("g")
        .attr("font-family", "sans-serif")
        .attr("font-size", 10)
        .attr("text-anchor", "end")
        .selectAll("g")
        .data(['categoryA', 'categoryB', 'categoryC'].reverse())
        .enter().append("g")
        .attr("transform", (d, i) => `translate(0,${i * 20})`);

        legend.append("rect")
        .attr("x", width - 19)
        .attr("width", 19)
        .attr("height", 19)
        .attr("fill", d => {
            if (d === 'categoryA') return "#1f77b4";
            else if (d === 'categoryB') return "#ff7f0e";
            else return "#2ca02c";
        });

        legend.append("text")
        .attr("x", width - 24)
        .attr("y", 9.5)
        .attr("dy", "0.32em")
        .text(d => d);

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
