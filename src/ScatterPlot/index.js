import { useEffect, useRef, useState } from "react"
import * as d3 from "d3";
import "./scatter.css"
import ScatterPlot from "./scatterPlot";

function Scatter(props) {
   
    const [selectedX,setSelectedX] = useState('N_Days')
    const [selectedY,setSelectedY] = useState('Age')
    const [keyDatasets,setKeyDatasets] = useState([])
    const [colOfInterest, setColOfInterest] = useState(['N_Days', 'Age', 'Bilirubin', 'Cholesterol', 'Albumin', 
    'Copper', 'Alk_Phos', 'SGOT', 'Tryglicerides', 'Platelets', 'Prothrombin'])
    
    const prepareData = (data,col) => {

        let subData = []
        
        data.map((value,index) => {
            subData.push(parseInt(value[col], 10))
        })

        let obj = {
            col_name : col,
            datasets :  subData
        }

        return obj
    }

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
        <div className="col-sm-12 col-lg-6 items-center justify-content-center">
            <div className="mt-5 mb-5 row">
                <div class="dropdown col-6">
                    <button class="btn btn-secondary dropdown-toggle" type="button" data-bs-toggle="dropdown" aria-expanded="false">
                        {selectedX}
                    </button>
                    {/* <span className="mx-2">X Axis</span> */}
                    <ul class="dropdown-menu">
                        {
                            colOfInterest.map((col) => 
                                <li><a class="dropdown-item" onClick={() => setSelectedX(col)} href="#">{col}</a></li>
                            )

                        }
                    </ul>
                </div>
                <div class="dropdown col-6">
                    <button class="btn btn-secondary dropdown-toggle" type="button" data-bs-toggle="dropdown" aria-expanded="false">
                        {selectedY}
                    </button>
                    {/* <span className="mx-2">Y Axis</span> */}
                    <ul class="dropdown-menu">
                        {
                            colOfInterest.map((col) => 
                                <li><a class="dropdown-item" onClick={() => setSelectedY(col)} href="#">{col}</a></li>
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
                    />
                    :
                    null
                }
            </div>
        </div>
    );
}

export default Scatter;
