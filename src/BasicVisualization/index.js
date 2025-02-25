import { useEffect, useRef, useState } from "react"
import Scatter from "../ScatterPlot";
import Radar from "../RadarPlot";

function Visualization(props) {
    const [colOfInterest, setColOfInterest] = useState(["Economy (mpg)", "Cylinders", "Displacement (cc)", "Power (hp)", "Weight (lb)", "0-60 mph (s)", "Year"])
    const [selectedPoints, setSelectedPoints] = useState([])
    const [xVariable, setXVariable] = useState("Power (hp)")
    const [yVariable, setYVariable] = useState("Weight (lb)")
    const clickPressed = useRef(false)

    const clickHandler = (event,data,axisX,axisY) => {
        props.data.map(dataPoints => {
            if(selectedPoints.length < 5){
                if(parseFloat(dataPoints[axisX]) == data.x && parseFloat(dataPoints[axisY]) == data.y){
                    const dummy = [...selectedPoints]
                    if(!dummy.includes(dataPoints.Name)){
                        dummy.push(dataPoints.Name)
                        setSelectedPoints(dummy)
                        clickPressed.current = true
                    }
                }
            }
        })
    }

    const filterOptions = (col) => {
        let dummy = [...selectedPoints]
        dummy = dummy.filter(d => d !== col)
        setSelectedPoints(dummy)
        clickPressed.current = true
    }

    useEffect(() => {},[selectedPoints])

    return (
        <div className="container row">
            {props.data.length ? 
            <Scatter 
                isMobileView={props.isMobileView} 
                data={props.data} 
                colOfInterest={colOfInterest} 
                X={xVariable} Y={yVariable} 
                setXVariable={setXVariable}
                setYVariable={setYVariable}
                clickHandler={clickHandler}
                selectedPoints={selectedPoints} 
                zoom={false}
                clickPressed={clickPressed}
            /> : null}
            {props.data.length ? <Radar 
                isMobileView={props.isMobileView} 
                data={props.data}
                colOfInterest={colOfInterest} 
                selectedPoints={selectedPoints} 
                filterOptions={filterOptions}
            /> : null}
        
        </div>
    );
}

export default Visualization;
