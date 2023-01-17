import { useState, useEffect } from "react";
import { Card, Button} from "@shopify/polaris";
import js2xmlparser from 'js2xmlparser';

import axios from 'axios';

export function PageList() {
    const [data, setData] = useState([]);
    useEffect(async () => {
        console.log('ASYNC CALLING.....')
        const response1 = await axios.get('/admin/api/2023-01/pages.json/', {
            headers: {
                'X-Shopify-Access-Token': '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',
                'Content-Type': 'application/json'
            }
            
        });
        console.log(response1.data.pages)
        console.log(js2xmlparser.parse("data",data));
        setData(response1.data.pages);
    }, [])

    console.log(js2xmlparser.parse("pages", obj));

    return (
        <>
        <div>{xml}</div>
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
                                        <td><Button action="/"> Publish </Button></td>
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