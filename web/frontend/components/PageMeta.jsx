import { useState, useEffect } from "react";
import { Card, Button } from "@shopify/polaris";
import axios from 'axios';

export function PageMeta() {

    const [data, setData] = useState([]);
    const [id, setId] = useState([]);
    const [meta, setMeta] = useState([]);

    useEffect(() => {
        axios.get('/admin/api/2023-01/pages.json', {
            headers: {
                'X-Shopify-Access-Token': '',
                'Content-Type': 'application/json'
            }
        }).then(res => { setData(res.data.pages); }).catch(err => console.log(err))

    }, [])

    useEffect(() => {
        localStorage.setItem('pages', JSON.stringify(data))
        data.map(info => {

            axios.get(`/admin/api/2022-10/metafields.json?metafield[owner_id]=${info.id}&metafield[owner_resource]=page`, {
                headers: {
                    'X-Shopify-Access-Token': '',
                    'Content-Type': 'application/json'
                }
            }).then(res => {
                // console.log(res.data.metafields)
                res.data.metafields.map(et => {
                    if (et.key == "language") {
                        setMeta([...meta, et])
                        console.log(et)
                    }
                })


            }
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
                            <th>Title</th>
                            <th>Handle</th>
                            <th>Metafield</th>
                            <th>Action</th>

                        </tr>
                    </thead>







                    <tbody>
                        {
                            data.map((metaData, index) => {
                                return (
                                    <>  {meta.map(mt =>
                                        <> {(mt.owner_id == metaData.id) ?
                                            <tr key={index}>
                                                <td>{index + 1}</td>
                                                <td>{metaData.id}</td>
                                                <td>{metaData.title}</td>
                                                <td>{metaData.handle}</td>
                                                <td>{mt.value}</td>
                                                <td>{mt.owner_id}</td>
                                                <td><Button>Publish</Button></td>

                                            </tr> : ""}</>)
                                    }</>
                                )
                            })

                        }
                    </tbody>
                </table>
            </Card>
        </>
    );
}
