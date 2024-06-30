import { useEffect, useRef, useState } from "react"
import * as d3 from "d3";
import "./radar.css"
import RadarPlot from "./radarPlot";
import { range } from "d3";

function Radar(props) {
   
    const [selected,setSelected] = useState('Status')
    const [keyDatasets,setKeyDatasets] = useState([])
    const [colOfInterest, setColOfInterest] = useState(['Bilirubin', 'Cholesterol', 'Albumin', 
    'Copper', 'Alk_Phos', 'SGOT', 'Tryglicerides', 'Platelets', 'Prothrombin'])
    
    const prepareData = (data) => {

        let subData1 = []
        let subData2 = []
        let subData3 = []

        for (let index = 1; index < 4; index++) {
            if(index == 1){
                colOfInterest.map((value) => {
                    let obj1 = {}
                    obj1["axis"] = value
                    obj1["value"] = Math.max(...data.map(item => item.Stage  == "1" && parseInt(item[value], 10))); 
                   
                    subData1.push(obj1)
                })
            }else if (index == 2){
                colOfInterest.map((value) => {
                    let obj2 = {}
                    obj2["axis"] = value
                    obj2["value"] = Math.max(...data.map(item => item.Stage  == "2" && parseInt(item[value], 10))); 
                   
                    subData2.push(obj2)
                })
            }else{
                colOfInterest.map((value) => {
                    let obj3 = {}
                    obj3["axis"] = value
                    obj3["value"] = Math.max(...data.map(item => item.Stage  == "3" && parseInt(item[value], 10))); 
                   
                    subData3.push(obj3)
                })
            }
        }

        return [subData1, subData2, subData3]
    }

    useEffect(() => {
        if(props.data.length){
            const dataset = prepareData(props.data,colOfInterest)
            setKeyDatasets(dataset)
        }
    },[props])

    return (
        <div className="col-6">
            <div className="row" >
                { keyDatasets.length &&
                    <RadarPlot dataset={keyDatasets} />
                }
            </div>
        </div>
    );
}

export default Radar;
