import { useEffect, useState, useRef } from "react"
import './App.css';
import { parse } from 'papaparse';
import Papa from 'papaparse';
import { TabContent, TabPane, Nav, NavItem, NavLink, Row, Col } from 'reactstrap';
import classnames from 'classnames';

import Density from './DensityPlot';
import MultiBar from "./MultibarPlot";
import Scatter from "./ScatterPlot";
import Radar from "./RadarPlot";
import TableView from "./TableView";
import Visualization from "./BasicVisualization";

function App() {

  const [data, setData] = useState([]);
  const [basicData, setBasicData] = useState([]);
  const [variable, setVariable] = useState(null);
  const [activeTab, setActiveTab] = useState('1');
  const [isMobileView, setIsMobileView] = useState(window.innerWidth < 500 ? true : false);

  useEffect(() => {
    const handleResize = () => {
      setIsMobileView(window.innerWidth < 500 ? true : false)
    };

    // Add event listener
    window.addEventListener('resize', handleResize);

    // Remove event listener on cleanup
    return () => {
      window.removeEventListener('resize', handleResize);
    };
  }, []);

  const toggle = tab => {
    if (activeTab !== tab) setActiveTab(tab);
  };

  const handleFileChange = (event) => {
    const file = event.target.files[0];
    if (file) {
    Papa.parse(file, {
        header: true,
        skipEmptyLines: true,
        complete: function(results) {
          setBasicData(results.data);
        },
    });
    }
};

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
              let ageInYears = convertDaysToYears(parseFloat(person.Age));
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

  const selectedVariable = (data, variable) => {
    setVariable(variable.axis)
  }

  return (
    <div>
      <Nav tabs className="row">
        <NavItem className="col-lg-4 mt-2 col-sm-12">
          <NavLink
            className={classnames({ active: activeTab === '1' }) + " d-flex justify-content-center"}
            onClick={() => { toggle('1');}}
          >
            Table View
          </NavLink>
        </NavItem>
        <NavItem className="col-lg-4 mt-2 col-sm-12">
          <NavLink
            className={classnames({ active: activeTab === '2' }) + " d-flex justify-content-center"}
            onClick={() => { toggle('2'); }}
          >
            Basic Visualization
          </NavLink>
        </NavItem>
        <NavItem className="col-lg-4 mt-2 col-sm-12">
          <NavLink
            className={classnames({ active: activeTab === '3' }) + " d-flex justify-content-center"}
            onClick={() => { toggle('3'); }}
          >
            Dashboard
          </NavLink>
        </NavItem>
      </Nav>
      <TabContent activeTab={activeTab}>
        <TabPane tabId="1">
          <Row>
            <Col sm="12">
              <TableView basicData={basicData} handleFileChange={handleFileChange}/>
            </Col>
          </Row>
        </TabPane>
        <TabPane tabId="2">
          <Row>
            <Col sm="12">
              {basicData.length && activeTab == "2" ? <Visualization data={basicData} isMobileView={isMobileView}/> : null}
            </Col>
          </Row>
        </TabPane>
        <TabPane tabId="3">
          <Row>
            <Col sm="12">
              <div className="App row">
                {data.length && activeTab == "3" &&  <Density data={data} variable={variable} isMobileView={isMobileView}/>}
                {data.length && activeTab == "3" &&  <Radar data={data} selectedVariable={selectedVariable} isMobileView={isMobileView}/>}
                {data.length && activeTab == "3" &&  <MultiBar data={data} variable={variable} isMobileView={isMobileView} />}
                {data.length && activeTab == "3" &&  <Scatter data={data} variable={variable} zoom={true} isMobileView={isMobileView}/>} 
              </div>
            </Col>
          </Row>
        </TabPane>      
      </TabContent>
    </div>
  
  );
}

export default App;
