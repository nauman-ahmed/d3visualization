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

    function convertDaysToYears(days) {
      const daysPerYear = 365.25; // Includes leap years
      return days / daysPerYear;
    }


    const csvFilePath = '/liver_cirrhosis.csv'; 
    fetch(csvFilePath)
      .then(response => response.text())
      .then(csvData => {
        parse(csvData, {
          complete: (result) => {
            // Assume dataArray is your array of 25,000 objects
            let updatedDataArray = result.data.map(person => {
              // Convert the Age from string to integer, then to years, and round it
              let ageInYears = convertDaysToYears(parseInt(person.Age, 10));
              return {
                  ...person, // Spread operator to copy all original properties
                  Age: ageInYears.toFixed(2) // Update the Age property, rounded to two decimal places
              };
            });
            setData(updatedDataArray);
          },
          header: true,
          skipEmptyLines: true,
        });
      })
      .catch(error => console.error('Error loading the CSV file:', error));
  }, []);


  return (
    <div className="App row">
      {data.length && <Density data={data} />}
      {data.length && <Radar data={data} />}
      {data.length && <MultiBar data={data} />}
      {data.length && <Scatter data={data} />}
    </div>
  );
}

export default App;
