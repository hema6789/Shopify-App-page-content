import { useState, useEffect } from "react";
import { Card, Button } from "@shopify/polaris";
import exportFromJSON from 'export-from-json';
import axios from 'axios';

export function PageList() {
    const [data, setData] = useState([]);
    useEffect(async () => {
     //   console.log('ASYNC CALLING.....')
        const response1 = await axios.get('/admin/api/2023-01/pages.json/', {
            headers: {
                'X-Shopify-Access-Token': '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',
                'Content-Type': 'application/json'
            }
         
        });
      //  console.log(response1.data.pages)
       
        setData(response1.data.pages);
    }, [])
    let result;
    const handlePublish = (ddata) => {
        result = Object.entries(ddata).map(ef => `<${ef[0]}>${ef[1]}</${ef[0]}>`).join('');
        console.log(result)
    }

    return (
        <>
           
            <Card>
                <table className="table" cellSpacing={10} cellPadding={10}>
                    <thead>
                        <tr >
                            <th>Id</th>
                            <th>MainId</th>
                            <th>Title</th>
                            <th>Handle</th>
                            <th>metafield</th>
                            <th>Action</th>

                        </tr>
                    </thead>
                    <tbody>
                        {
                            data.map((displayData, index) => {
                                return (

                                    <tr key={index} >
                                        <td >{index + 1}</td>
                                        <td>{displayData.id}</td>
                                        <td>{displayData.title}</td>
                                        <td>{displayData.handle}</td>
                                        <td>{displayData.metafield_value}</td>
                                        <td><Button onClick={()=>handlePublish(displayData) }> Publish </Button></td>
                                    </tr>

                                )
                            })
                        }
                    </tbody>
                </table>

            </Card>
        </>
    );
}
