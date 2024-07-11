import { useEffect, useRef, useState } from "react"
import Scatter from "../ScatterPlot";
import Radar from "../RadarPlot";

function Visualization(props) {
    const [colOfInterest, setColOfInterest] = useState(["Economy (mpg)", "Cylinders", "Displacement (cc)", "Power (hp)", "Weight (lb)", "0-60 mph (s)", "Year"])
    const [selectedPoints, setSelectedPoints] = useState([])

    const clickHandler = (event,data,axisX,axisY) => {
        props.data.map(dataPoints => {
            if(selectedPoints.length < 5){
                if(dataPoints[axisX] == data.x && dataPoints[axisY] == data.y){
                    const dummy = [...selectedPoints]
                    if(!dummy.includes(dataPoints.Name)){
                        dummy.push(dataPoints.Name)
                        setSelectedPoints(dummy)
                    }
                }
            }
        })
    }

    const filterOptions = (col) => {
        let dummy = [...selectedPoints]
        dummy = dummy.filter(d => d !== col)
        setSelectedPoints(dummy)
    }

    useEffect(() => {},[selectedPoints])

    return (
        <div className="container row">
            {props.data.length ? <Scatter data={props.data} colOfInterest={colOfInterest} X={"Power (hp)"} Y={"Weight (lb)"} clickHandler={clickHandler}/> : null}
            {props.data.length ? <Radar data={props.data} colOfInterest={colOfInterest} selectedPoints={selectedPoints} filterOptions={filterOptions}/> : null}
        
        </div>
    );
}

export default Visualization;
