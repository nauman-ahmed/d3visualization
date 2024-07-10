import { useEffect, useRef, useState } from "react"
import { Table } from 'reactstrap';
import Papa from 'papaparse';

function TableView(props) {

    return (
        <div className="container">
            <input
                type="file"
                accept=".csv"
                onChange={props.handleFileChange}
                className="form-control my-3"
            />
            {props.basicData.length > 0 && (
                <Table striped>
                <thead>
                    <tr>
                    {Object.keys(props.basicData[0]).map((key) => (
                        <th key={key}>{key}</th>
                    ))}
                    </tr>
                </thead>
                <tbody>
                    {props.basicData.map((row, index) => (
                    <tr key={index}>
                        {Object.values(row).map((value, i) => (
                        <td key={i}>{value}</td>
                        ))}
                    </tr>
                    ))}
                </tbody>
                </Table>
            )}
        </div>
    );
}

export default TableView;
