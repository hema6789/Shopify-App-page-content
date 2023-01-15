import { useState, useEffect } from "react";
import { Card } from "@shopify/polaris";
import axios from 'axios';

export function ProductsDetails() {

    const [data, setData] = useState([]);

    useEffect(async () => {
        console.log('ASYNC CALLING.....')
        const response1 = await axios.get('/admin/api/2022-10/pages.json', {
            headers: {
                'X-Shopify-Access-Token': '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',
                'Content-Type': 'application/json'
            }
        });
        console.log(response1.data.pages)
        setData(response1.data.pages);
    }, [])
    return (
        <>
            <Card>
                <table className="table">
                    <thead>
                        <tr>
                            <th>Id</th>
                            <th>MainId</th>
                            <th>Shop_Id</th>
                            <th>Title</th>
                            <th>Handle</th>
                            <th>created_at</th>
                            <th>published_at</th>
                        </tr>
                    </thead>
                    <tbody>
                        {
                            data.map((displayData, index) => {
                                return (
                                    <tr key={index}>
                                        <td>{index + 1}</td>
                                        <td>{displayData.id}</td>
                                        <td>{displayData.shop_id}</td>
                                        <td>{displayData.title}</td>
                                        <td>{displayData.handle}</td>
                                        <td>{displayData.created_at}</td>
                                        <td>{displayData.published_at}</td>
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
