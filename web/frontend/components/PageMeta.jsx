import { useState, useEffect } from "react";
import { Button, Card } from "@shopify/polaris";
import axios from 'axios';

export function PageMeta() {

    const [data, setData] = useState([]);
    //const [id, setId] = useState([]);
    const [meta, setMeta] = useState([]);
    const [testArr, setTestArr] = useState([]);
    useEffect(() => {
        axios.get('/admin/api/2023-01/pages.json/', {
            headers: {
                'X-Shopify-Access-Token': 'xxx',
                'Content-Type': 'application/json'
            }
        }).then(res => { setData(res.data.pages); }).catch(err => console.log(err))

    }, []),

        useEffect(() => {

            Promise.all(data.map(async info => {

                // Then put your try catch here so that it only wraps around
                // the results of the function you're awaiting...
                let response
                try {
                    response = await axios.get(`/admin/api/2023-01/metafields.json?metafield[owner_id]=${info.id}&metafield[owner_resource]=page`, {

                        headers: {
                            'X-Shopify-Access-Token': 'xxxx',
                            'Content-Type': 'application/json'
                        }

                    });
                } catch (err) {
                    return err;
                }

                // Anything else you want to do with the response...

                let arrObj = response.data.metafields;
                console.log("arra", arrObj);

                const found = arrObj.find(x => (x.namespace == "custom" && x.key=="language"));
                console.log("dd", found);
                // for (let x in arrObj) {
                //     console.log("test", x);
                //     // setTestArr([...testArr,x]);
                // }
                return found;

            })).then(results => {
                // All the resolved promises returned from the map function.
                console.log("dd", results);
                // console.log("async wait ", results.data.metafields[0]);
                setMeta(results);
                // setTestArr([...testArr, pagedetails.data.metafields[0]]);

            })


            // fetchMyAPI();
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
                            <th>Language</th>
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
