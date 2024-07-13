import { useEffect, useRef, useState } from "react"
import * as d3 from "d3";
import "./scatter.css"
import ScatterPlot from "./scatterPlot";

function Scatter(props) {
    
    const [selectedX,setSelectedX] = useState('Tryglicerides')
    const [selectedY,setSelectedY] = useState('Albumin')
    const [keyDatasets,setKeyDatasets] = useState([])
    const [colOfInterest, setColOfInterest] = useState(['N_Days', 'Age', 'Bilirubin', 'Cholesterol', 'Albumin', 
    'Copper', 'Alk_Phos', 'SGOT', 'Tryglicerides', 'Platelets', 'Prothrombin'])
    
    const prepareData = (data,col) => {

        let subData = []
        
        data.map((value,index) => {
            subData.push(parseFloat(value[col]))
        })
        
        let obj = {
            col_name : col,
            datasets :  subData
        }

        return obj
    }

    useEffect(() => {
        if(colOfInterest.includes(props.variable)){
            setSelectedX(props.variable)
        }
    },[props.variable])

    useEffect(() => {
        if(props.data.length){
            if(props.colOfInterest){
                setColOfInterest(props.colOfInterest)
                setSelectedX(props.X)
                setSelectedY(props.Y)
            }
            let keyDatasetsDummy = []
            for (let index = 0; index < colOfInterest.length; index++) {
                keyDatasetsDummy.push(prepareData(props.data,colOfInterest[index])) 
            }
            setKeyDatasets(keyDatasetsDummy)
        }
    },[props,colOfInterest])

    return (
        <div className="col-sm-12 col-lg-6 ">
            <div className={props.isMobileView ? "mt-3 d-inline-block" : "mt-3 row d-flex justify-content-center"}>
                <div class="dropdown col-6" >
                    <button class="btn btn-secondary dropdown-toggle" type="button" data-bs-toggle="dropdown" aria-expanded="false">
                        {"X-Axis = "} {selectedX}
                    </button>
                    {/* <span className="mx-2">X Axis</span> */}
                    <ul class="dropdown-menu">
                        {
                            colOfInterest.map((col) => 
                                <li><a class="dropdown-item" onClick={() => {
                                    if(props.setXVariable){
                                        props.setXVariable(col)
                                    }
                                    if(props?.clickPressed){
                                        props.clickPressed.current = false;
                                    }
                                    setSelectedX(col); 
                                }}>{col}</a></li>
                            )

                        }
                    </ul>
                </div>
                <div class={props.isMobileView ? "dropdown col-6 mt-1" : "dropdown col-6"} style={{ display: "flex", justifyContent: "space-evenly" }}>
                    <button class="btn btn-secondary dropdown-toggle" type="button" data-bs-toggle="dropdown" aria-expanded="false">
                        {"Y-Axis =  "} {selectedY}
                    </button>
                    {/* <span className="mx-2">Y Axis</span> */}
                    <ul class="dropdown-menu">
                        {
                            colOfInterest.map((col) => 
                                <li><a class="dropdown-item" onClick={() => {
                                    if(props.setYVariable){
                                        props.setYVariable(col)
                                    }
                                    setSelectedY(col); 
                                    if(props?.clickPressed){
                                        props.clickPressed.current = false;
                                    }
                                }}>{col}</a></li>
                            )

                        }
                    </ul>
                </div>
            </div>
            <div className="row" >
                { keyDatasets.length ?
                    <ScatterPlot 
                        datasetX={keyDatasets.filter((dataset) => dataset.col_name == selectedX)} 
                        datasetY={keyDatasets.filter((dataset) => dataset.col_name == selectedY)} 
                        clickHandler={props.clickHandler}
                        selectedPoints={props.selectedPoints} 
                        duration={2000}
                        isMobileView={props.isMobileView}
                        zoom={props.zoom}
                        clickPressed={props.clickPressed}
                    />
                    :
                    null
                }
            </div>
        </div>
    );
}

export default Scatter;
