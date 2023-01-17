import { useState, useEffect } from "react";
import { Card } from "@shopify/polaris";
import axios from 'axios';

export function PageMetafield() {

    const [data, setData] = useState([]);
    const [id, setId] = useState([]);
    localStorage.setItem('data', 'Data')
    useEffect(() => {
        axios.get('/admin/api/2023-01/pages.json', {
            headers: {
                'X-Shopify-Access-Token': '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',
                'Content-Type': 'application/json'
            }
        }).then(res => { setData(res.data.pages);  }).catch(err => console.log(err))
        
    }, [])

    useEffect(() => {
      
        data.map(info => {
            
            axios.get(`/admin/api/2023-01/pages/${info.id}/metafields.json`, {
                headers: {
                    'X-Shopify-Access-Token': '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',
                    'Content-Type': 'application/json'
                }
            }).then(res => 
                console.log(res.data)
                             
            ).catch(err => console.log(err))
        })
    }, [data])
    return (
        <>
            <Card>
                <table className="table" cellPadding={10} cellSpacing={10}>
                    <thead>
                        <tr>
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
                                    <tr key={index}>
                                        <td>{index + 1}</td>
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