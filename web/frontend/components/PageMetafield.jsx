import { useState, useEffect } from "react";
import { Card} from "@shopify/polaris";
import axios from 'axios';

export function PageMetafield() {

   
    const [data, setData] = useState([]);

    useEffect(async () => {
        console.log('ASYNC CALLING.....')
        const response2 = await axios.get('/admin/api/2023-01/pages/109906886958/metafields.json', {
            headers: {
                'X-Shopify-Access-Token': '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',
                'Content-Type': 'application/json'
            }
            
        });
        console.log(response2.data.metafields)
        setData(response2.data.metafields);
    }, [])
    return (
        <>
            <Card>
                <table className="table" cellSpacing={10} cellPadding={10}>
                    <thead>
                        <tr >
                            <th>Id</th>
                            <th>MainId</th>
                            <th>Namespace</th>
                            <th>Key</th>
                            <th>Value</th>
                            
                        </tr>
                    </thead>
                    <tbody>
                        {
                            data.map((metaData, index) => {
                                return (
                                   
                                    <tr key={index} >
                                        <td >{index + 1}</td>
                                        <td>{metaData.id}</td>
                                        <td>{metaData.namespace}</td>
                                        <td>{metaData.key}</td>
                                        <td>{metaData.value}</td>
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