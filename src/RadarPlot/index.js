import { useEffect, useRef, useState } from "react"
import * as d3 from "d3";
import "./radar.css"
import RadarPlot from "./radarPlot";
import { range } from "d3";

function Radar(props) {
   
    const count = useRef(0)
    const [selected,setSelected] = useState('Status')
    const [keyDatasets,setKeyDatasets] = useState([])
    const [colOfInterest, setColOfInterest] = useState(['Bilirubin', 'Cholesterol', 'Albumin', 
    'Copper', 'Alk_Phos', 'SGOT', 'Tryglicerides', 'Platelets', 'Prothrombin'])
    

    function calculateMedian(numbers) {
        // Sort the array
        numbers.sort((a, b) => a - b);
    
        const middleIndex = Math.floor(numbers.length / 2);
    
        // Check if the array length is odd or even
        if (numbers.length % 2 !== 0) {
            // Return the middle element for an odd number of elements
            return numbers[middleIndex];
        } else {
            // Return the average of the two middle elements for an even number of elements
            return (numbers[middleIndex - 1] + numbers[middleIndex]) / 2;
        }
    }

    const prepareData = (data) => {

        let subData1 = []
        let subData2 = []
        let subData3 = []

        for (let index = 1; index < 4; index++) {
            if(index == 1){
                colOfInterest.map((value) => {
                    let obj1 = {}

                    obj1["axis"] = value
                    let arr = data.map(item => item.Stage  == "1" && parseInt(item[value], 10))
                    let filteredData = arr.filter(Boolean);
                    let sum = filteredData.reduce((accumulator, currentValue) => {
                        return accumulator + currentValue;
                    }, 0); // The '0' is the initial value of the accumulator
                    let mean = (sum / filteredData.length).toFixed(2)

                    obj1["value"] = calculateMedian(filteredData); 

                    subData1.push(obj1)

                })
            }else if (index == 2){
                colOfInterest.map((value) => {
                    let obj2 = {}
                    obj2["axis"] = value
                    let arr = data.map(item => item.Stage  == "2" && parseInt(item[value], 10))
                    let filteredData = arr.filter(Boolean);
                    let sum = filteredData.reduce((accumulator, currentValue) => {
                        return accumulator + currentValue;
                    }, 0); // The '0' is the initial value of the accumulator
                    let mean = (sum / filteredData.length).toFixed(2)


                    obj2["value"] = calculateMedian(filteredData); 
                    subData2.push(obj2)
                })
            }else{
                colOfInterest.map((value) => {
                    let obj3 = {}
                    obj3["axis"] = value
                    let arr = data.map(item => item.Stage  == "3" && parseInt(item[value], 10))
                    let filteredData = arr.filter(Boolean);
                    let sum = filteredData.reduce((accumulator, currentValue) => {
                        return accumulator + currentValue;
                    }, 0); // The '0' is the initial value of the accumulator
                    let mean = (sum / filteredData.length).toFixed(2)

                    obj3["value"] = calculateMedian(filteredData); 
                    subData3.push(obj3)
                })
            }
        }

        return [subData1, subData2, subData3]
    }

    useEffect(() => {
        if(props.data.length && count.current == 0){
            count.current = 1
            const dataset = prepareData(props.data,colOfInterest)
            setKeyDatasets(dataset)
        }
    },[props])

    return (
        <div className="col-6">
            <div className="row" >
                { keyDatasets.length &&
                    <RadarPlot dataset={keyDatasets} selectedVariable={props.selectedVariable}/>
                }
            </div>
        </div>
    );
}

export default Radar;
