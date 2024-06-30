import { useEffect, useState } from "react"
import './App.css';
import { parse } from 'papaparse';
import Density from './DensityPlot';
import MultiBar from "./MultibarPlot";
import Scatter from "./ScatterPlot";
import Radar from "./RadarPlot";

function App() {

  const [data, setData] = useState([]);

  useEffect(() => {
    const csvFilePath = '/liver_cirrhosis.csv'; 
    fetch(csvFilePath)
      .then(response => response.text())
      .then(csvData => {
        parse(csvData, {
          complete: (result) => {
            setData(result.data);
          },
          header: true,
          skipEmptyLines: true,
        });
      })
      .catch(error => console.error('Error loading the CSV file:', error));
  }, []);


  return (
    <div className="App row">
      {data.length && <Radar data={data} />}
      {/* {data.length && <Density data={data} />}
      {data.length && <MultiBar data={data} />}
      {data.length && <Scatter data={data} />} */}
    </div>
  );
}

export default App;
