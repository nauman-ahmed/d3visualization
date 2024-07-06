import { useEffect, useRef, useState } from "react"
import * as d3 from "d3";
import "./density.css"
import DensityPlot from "./densityPlot";

function Density(props) {
   
    const [selected,setSelected] = useState('N_Days')
    const [keyDatasets,setKeyDatasets] = useState([])
    const [colOfInterest, setColOfInterest] = useState(['N_Days', 'Age', 'Bilirubin', 'Cholesterol', 'Albumin', 
    'Copper', 'Alk_Phos', 'SGOT', 'Tryglicerides', 'Platelets', 'Prothrombin'])
    
    const prepareData = (data,col) => {
        let stage_1 = []
        let stage_2 = []
        let stage_3 = []

        data.map((data,index) => {
            if(index < 100000) {
                if(data.Stage == "1"){
                    stage_1.push(parseInt(data[col], 10))
                }
                else if(data.Stage == "2"){
                    stage_2.push(parseInt(data[col], 10))
                }
                else if(data.Stage == "3"){
                    stage_3.push(parseInt(data[col], 10))
                }
            }
        })

        stage_1.forEach((element, index) => {
            if (element === null || element === undefined || typeof element === "boolean") {
              console.log(`Element at index ${index} is ${element}`);
            }
        })
        
        stage_2.forEach((element, index) => {
            if (element === null || element === undefined || typeof element === "boolean") {
                console.log(`Element at index ${index} is ${element}`);
            }
        })

        stage_3.forEach((element, index) => {
                if (element === null || element === undefined || typeof element === "boolean") {
                    console.log(`Element at index ${index} is ${element}`);
                }
            })

        let maxNumberDataset = [...stage_1,...stage_2,...stage_3]
        let maxNumber = Math.ceil(Math.max(...maxNumberDataset));


        let obj = {
            col_name : col,
            datasets :  [stage_1, stage_2, stage_3],
            maxNumber : maxNumber
        }

        return obj
    }

    useEffect(() => {
        if(props.data.length){
            let keyDatasetsDummy = []
            for (let index = 0; index < colOfInterest.length; index++) {
                keyDatasetsDummy.push(prepareData(props.data,colOfInterest[index])) 
            }
            setKeyDatasets(keyDatasetsDummy)
        }
    },[props])

    return (
        <div className="col-6">
            <div className="mt-5 mb-5">
                <div class="dropdown">
                    <button class="btn btn-secondary dropdown-toggle" type="button" data-bs-toggle="dropdown" aria-expanded="false">
                        {selected}
                    </button>
                    <ul class="dropdown-menu">
                        {
                            colOfInterest.map((col) => 
                                <li><a class="dropdown-item" onClick={() => setSelected(col)} href="#">{col}</a></li>
                            )

                        }
                    </ul>
                </div>
            </div>
            <div className="row" >
                { keyDatasets.length &&
                    <DensityPlot dataset={keyDatasets.filter((dataset) => dataset.col_name == selected)} />
                }
            </div>
        </div>
    );
}

export default Density;
