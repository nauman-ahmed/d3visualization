import { useEffect, useRef, useState } from "react"
import * as d3 from "d3";
import "./radar.css"
import { svg } from "d3";

function RadarPlot(props) {
    
    const [colors, setColors] = useState(["#4285F4", "#34A853", "pink","yellow","red"])

    // Define the action to take on click
    function onCircleClick(i) {
        const colors = ["#4285F4", "#34A853", "pink","yellow","red"]
        let dummyColors = ["#d3d3d3", "#d3d3d3", "#d3d3d3"]
        dummyColors.splice(i-1,1,colors[i-1])
        setColors(dummyColors)
        // You can expand this function to do more things, like updating other parts of your visualization
    }


    const createPlot = (dataset, id) => {
        const dataSets = dataset
        // Find the max value for each axis to normalize data accordingly
        let axisMaxValues = {};
        dataSets.flat().forEach(d => {
            if (!axisMaxValues[d.axis] || d.value > axisMaxValues[d.axis]) {
            axisMaxValues[d.axis] = d.value;
            }
        });

        // Normalize each dataset based on these max values
        dataSets.forEach((dataset,index) => {
            dataset.forEach(data => {
            data.normalizedValue = data.value / axisMaxValues[data.axis];
            });
        });

        // Collect all values for each axis
        let axisValues = {};
        dataSets.flat().forEach(item => {
            if (!axisValues[item.axis]) {
                axisValues[item.axis] = [];
            }
            axisValues[item.axis].push(item.value);
        });

        // Define bin ranges and categorize values
        let binsCount = 5;  // Number of bins for each axis
        let binnedData = {};

        for (let axis in axisValues) {
            let values = axisValues[axis];
            let minVal = Math.min(...values);
            let maxVal = Math.max(...values);
            let range = maxVal - minVal;
            let binSize = range / binsCount;

            let bins = [];
            for (let i = 0; i <= binsCount; i++) {
                bins.push(minVal + i * binSize);
            }

            // Categorize each value into bins
            binnedData[axis] = bins
        }


        const width = props.isMobileView ? 250 : 250,
                height = props.isMobileView ? 250 : 250,
                margin = props.selectedPoints && props.isMobileView ? { top: 100, right: 60, bottom: 180, left: 60 } : { top: 100, right: 60, bottom: 100, left: 60 },
                radius = Math.min(width, height) / 2,
                levels = 5; // Number of concentric circles
        const numTicks = 5; // Number of ticks per axis

        const svg = d3.select(id).append("svg")
            .attr("width", width + margin.left + margin.right)
            .attr("height", height + margin.top + margin.bottom)
            .append("g")
            .attr("transform", `translate(${width / 2 + margin.left}, ${height / 2 + margin.top})`);

        const rScale = d3.scaleLinear()
            .domain([0, 1])
            .range([0, radius]);

        // Draw circular grid lines
        for (let level = 0; level < levels; level++) {
            const factor = radius * ((level + 1) / levels);
            svg.append("circle")
            .attr("cx", 0)
            .attr("cy", 0)
            .attr("r", factor)
            .style("fill", "none")
            .style("stroke", "black")
            .style("stroke-width", "0.5px")
            .style("stroke-dasharray", "2,2");
        }

        const angleSlice = Math.PI * 2 / dataSets[0].length;

        // Draw axis lines and add axis ticks
        dataSets[0].forEach((d, i) => {
            const axis = svg.append("g");

            // Axis line
            axis.append("line")
            .attr("x1", 0)
            .attr("y1", 0)
            .attr("x2", rScale(1) * Math.cos(angleSlice * i - Math.PI/2))
            .attr("y2", rScale(1) * Math.sin(angleSlice * i - Math.PI/2))
            .style("stroke", "grey")
            .style("stroke-width", "1px");

            // Axis ticks
            for (let j = 0; j <= binsCount ; j++) {
                const tickValue = j / numTicks;
                const tickText = binnedData[d.axis][j];
                const x = rScale(tickValue) * Math.cos(angleSlice * i - Math.PI/2);
                const y = rScale(tickValue) * Math.sin(angleSlice * i - Math.PI/2);

                // Tick labels (optional)
                if (j > 1) { // Skip the center label

                    // axis.append("line")
                    // .attr("x1", x)
                    // .attr("y1", y)
                    // .attr("x2", x + 5 * Math.cos(angleSlice * i - Math.PI/2 + Math.PI / 2))
                    // .attr("y2", y + 5 * Math.sin(angleSlice * i - Math.PI/2 + Math.PI / 2))
                    // .style("stroke", "black")
                    // .style("stroke-width", "2px");
                    // Tick marks
                    axis.append("text")
                    .attr("x", x + 10 * Math.cos(angleSlice * i - Math.PI/2 + Math.PI / 2))
                    .attr("y", y + 10 * Math.sin(angleSlice * i - Math.PI/2 + Math.PI / 2))
                    .text(tickValue.toFixed(1)) // Control decimal places as needed
                    // .text(tickText) // Control decimal places as needed
                    .attr("text-anchor", "middle")
                    .style("font-size", "8px");
                }
            }
        });
        
        dataSets.forEach((data, index) => {
            const radarLine = d3.radialLine()
                .curve(d3.curveLinearClosed)
                .radius(d => {
                    return rScale(d.normalizedValue)
                })
                .angle((d, i) => i * angleSlice);
            
            // Append radar area
            svg.append("path")
            .datum(data)
            .attr("d", radarLine)
            .style("stroke", colors[index])
            .style("fill", colors[index])
            .style("fill-opacity", 0.1);

            // Add circles for each vertex
            svg.selectAll(".radarCircle" + index)
            .data(data)
            .enter()
            .append("circle")
            .attr("class", "radarCircle")
            .attr("r", 4)
            .attr("cx", d => rScale(d.normalizedValue) * Math.cos(angleSlice * data.indexOf(d) - Math.PI/2))
            .attr("cy", d => rScale(d.normalizedValue) * Math.sin(angleSlice * data.indexOf(d) - Math.PI/2))
            .style("fill", colors[index])
            .style("fill-opacity", 0.7);
        });

        // Add one label for each angle
        svg.selectAll(".radarLabel")
            .data(dataSets[0])
            .enter().append("text")
            .attr("class", "radarLabel")
            .attr("x", (d, i) => rScale(1.2) * Math.cos(angleSlice * i - Math.PI/2))
            .attr("y", (d, i) => rScale(1.1) * Math.sin(angleSlice * i - Math.PI/2))
            .text(d => d.axis)
            .style("font-size", "12px")
            .attr("text-anchor", "middle")
            .on("click",(d, i) => props.selectedVariable ? props.selectedVariable(d, i) : null);

        if(props.selectedPoints){

            for (let index = 0; index < props.selectedPoints.length; index++) {
                if(props.isMobileView){
                    if(index == 0){
                        svg.append("circle").attr("cx", -(width/2) - 0).attr("cy", ((height/2)+40)).attr("r", 6).style("fill", colors[index]).on("click", () => props.filterOptions(props.selectedPoints[index]));
                        svg.append("text").attr("x", -(width/2) + 10).attr("y", ((height/2)+40)).text(props.selectedPoints[index]).style("font-size", "10px").attr("alignment-baseline", "middle");
                    }
                    else if(index == 1){
                        svg.append("circle").attr("cx",-((width/2) - 0)).attr("cy", ((height/2)+60)).attr("r", 6).style("fill", colors[index]).on("click", () => props.filterOptions(props.selectedPoints[index]));
                        svg.append("text").attr("x", -((width/2) - 10) + 10).attr("y", ((height/2)+60)).text(props.selectedPoints[index]).style("font-size", "10px").attr("alignment-baseline", "middle");
                    }
                    else if(index == 2){
                        svg.append("circle").attr("cx", -((width/2)-0)).attr("cy", ((height/2)+80)).attr("r", 6).style("fill", colors[index]).on("click", () => props.filterOptions(props.selectedPoints[index]));
                        svg.append("text").attr("x", -((width/2)-0) + 10).attr("y", ((height/2)+80)).text(props.selectedPoints[index]).style("font-size", "10px").attr("alignment-baseline", "middle");
                    }
                    else if(index == 3){
                        svg.append("circle").attr("cx", -((width/2) - 0)).attr("cy", ((height/2)+100)).attr("r", 6).style("fill", colors[index]).on("click", () => props.filterOptions(props.selectedPoints[index]));
                        svg.append("text").attr("x", -((width/2) - 10) + 10).attr("y", ((height/2)+100)).text(props.selectedPoints[index]).style("font-size", "10px").attr("alignment-baseline", "middle");
                    }
                    else if(index == 4){
                        svg.append("circle").attr("cx", -((width/2)-0)).attr("cy", ((height/2)+120)).attr("r", 6).style("fill", colors[index]).on("click", () => props.filterOptions(props.selectedPoints[index]));
                        svg.append("text").attr("x", -((width/2)-0) + 10).attr("y", ((height/2)+120)).text(props.selectedPoints[index]).style("font-size", "10px").attr("alignment-baseline", "middle");
                    }
                }else{
                    if(index == 0){
                        svg.append("circle").attr("cx", -(width/2) - 0).attr("cy", ((height/2)+40)).attr("r", 6).style("fill", colors[index]).on("click", () => props.filterOptions(props.selectedPoints[index]));
                        svg.append("text").attr("x", -(width/2) + 10).attr("y", ((height/2)+40)).text(props.selectedPoints[index]).style("font-size", "10px").attr("alignment-baseline", "middle");
                    }
                    else if(index == 1){
                        svg.append("circle").attr("cx",-((width/2) - 200)).attr("cy", ((height/2)+40)).attr("r", 6).style("fill", colors[index]).on("click", () => props.filterOptions(props.selectedPoints[index]));
                        svg.append("text").attr("x", -((width/2) - 210) + 10).attr("y", ((height/2)+40)).text(props.selectedPoints[index]).style("font-size", "10px").attr("alignment-baseline", "middle");
                    }
                    else if(index == 2){
                        svg.append("circle").attr("cx", -((width/2)-0)).attr("cy", ((height/2)+60)).attr("r", 6).style("fill", colors[index]).on("click", () => props.filterOptions(props.selectedPoints[index]));
                        svg.append("text").attr("x", -((width/2)-0) + 10).attr("y", ((height/2)+60)).text(props.selectedPoints[index]).style("font-size", "10px").attr("alignment-baseline", "middle");
                    }
                    else if(index == 3){
                        svg.append("circle").attr("cx", -((width/2) - 200)).attr("cy", ((height/2)+60)).attr("r", 6).style("fill", colors[index]).on("click", () => props.filterOptions(props.selectedPoints[index]));
                        svg.append("text").attr("x", -((width/2) - 210) + 10).attr("y", ((height/2)+60)).text(props.selectedPoints[index]).style("font-size", "10px").attr("alignment-baseline", "middle");
                    }
                    else if(index == 4){
                        svg.append("circle").attr("cx", -((width/2)-0)).attr("cy", ((height/2)+80)).attr("r", 6).style("fill", colors[index]).on("click", () => props.filterOptions(props.selectedPoints[index]));
                        svg.append("text").attr("x", -((width/2)-0) + 10).attr("y", ((height/2)+80)).text(props.selectedPoints[index]).style("font-size", "10px").attr("alignment-baseline", "middle");
                    }
                }
            }
        }else{
            // Handmade legend
            const circle1 = svg.append("circle").attr("cx", -((width/2)-0)).attr("cy", -((height/2)+50)).attr("r", 6).style("fill", "#4285F4").style("opacity", 0).on("click", () => onCircleClick(1));
            const circle2 = svg.append("circle").attr("cx", -((width/2)-80)).attr("cy", -((height/2)+50)).attr("r", 6).style("fill", "#34A853").style("opacity", 0).on("click", () => onCircleClick(2));
            const circle3 = svg.append("circle").attr("cx", -((width/2)-160)).attr("cy", -((height/2)+50)).attr("r", 6).style("fill", "pink").style("opacity", 0).on("click", () => onCircleClick(3));
            const circle4 = svg.append("circle").attr("cx", -((width/2)-240)).attr("cy", -((height/2)+50)).attr("r", 6).style("fill", "red").style("opacity", 0).on("click", () => setColors(["#4285F4", "#34A853", "pink"]));;
            const text1 = svg.append("text").attr("x", -((width/2)-10)).attr("y", -((height/2)+50)).text("Stage 1").style("font-size", "10px").style("opacity", 0).attr("alignment-baseline", "middle");
            const text2 = svg.append("text").attr("x", -((width/2)-90)).attr("y", -((height/2)+50)).text("Stage 2").style("font-size", "10px").style("opacity", 0).attr("alignment-baseline", "middle");
            const text3 = svg.append("text").attr("x", -((width/2)-170)).attr("y", -((height/2)+50)).text("Stage 3").style("font-size", "10px").style("opacity", 0).attr("alignment-baseline", "middle");
            const text4 = svg.append("text").attr("x", -((width/2)-250)).attr("y", -((height/2)+50)).text("Reset").style("font-size", "10px").style("opacity", 0).attr("alignment-baseline", "middle");

            circle1.style("opacity", 1);
            circle2.style("opacity", 1);
            circle3.style("opacity", 1);
            circle4.style("opacity", 1);

            text1.style("opacity", 1);
            text2.style("opacity", 1);
            text3.style("opacity", 1);
            text4.style("opacity", 1);
            
        }


    }

    useEffect(() => {
        if(props.dataset.length){
            var container = document.getElementById("radar0");
            var svgs = container.getElementsByTagName('svg');
            
            createPlot(props.dataset, "#"+"radar0")

            for (let index = 0; index < svgs.length; index++) {
                if(svgs.length-1 !== index){
                    container.removeChild(svgs[index]); 
                }
            }
        }
    }, [props.dataset,colors]);

  return <>
        <div className="col-lg-12 d-flex justify-content-center" id={"radar0"}></div>
     </>;
}

export default RadarPlot;
