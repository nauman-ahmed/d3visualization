import { useEffect, useRef, useState } from "react"
import * as d3 from "d3";
import "./multibar.css"
import MultiBarChartPlot from "./multiBarChartPlot";

function Density(props) {
   
    const [selected,setSelected] = useState('Status')
    const [keyDatasets,setKeyDatasets] = useState([])
    const [colOfInterest, setColOfInterest] = useState(['Status', 'Drug', 'Sex', 'Ascites', 'Hepatomegaly', 
    'Spiders', 'Edema'])
    
    const prepareData = (data,col) => {

        let subData = []
        // Using a Set to collect unique 'Status' values
        const uniqueValues = Array.from(new Set(data.map(item => item[col])));

        uniqueValues.map((value) => {
            let obj1 = {}
            obj1["group"] = value
            obj1["Stage1"] = data.filter((d) => d.Stage  == "1" && d[col] == value).length
            obj1["Stage2"] = data.filter((d) => d.Stage  == "2" && d[col] == value).length
            obj1["Stage3"] = data.filter((d) => d.Stage  == "3" && d[col] == value).length
            subData.push(obj1)
        })

        let obj = {
            col_name : col,
            datasets :  subData,
            uniqueValues: uniqueValues
        }

        return obj
    }

    useEffect(() => {
        if(colOfInterest.includes(props.variable)){
            setSelected(props.variable)
        }
    },[props.variable])
    
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
                    <MultiBarChartPlot dataset={keyDatasets.filter((dataset) => dataset.col_name == selected)} />
                }
            </div>
        </div>
    );
}

export default Density;
