import { useState, useEffect, useCallback } from "react";
import { Button, Card, Toast, Frame } from "@shopify/polaris";
import axios from 'axios';
import createApp from '@shopify/app-bridge';
import { useAppBridge, useShopify } from "@shopify/app-bridge-react";
import { useAppQuery, useAuthenticatedFetch } from "../hooks";
export function PageMeta() {

    const [data, setData] = useState([]);
    //const [id, setId] = useState([]);
    const [meta, setMeta] = useState([]);
    const [testArr, setTestArr] = useState([]);
    const [active, setActive] = useState(false);
    const fetch = useAuthenticatedFetch();
    const [domain, setDomain] = useState();
    useEffect(async () => {
        const response = await fetch("/api/shop");
        if (response.ok) {
            const data = await response.json();
            let doma = data[0].domain;
            console.log("pagename", doma);
            setDomain(doma);

        }
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
                            'X-Shopify-Access-Token': 'xxx',
                            'Content-Type': 'application/json'
                        }

                    });
                } catch (err) {
                    return err;
                }

                // Anything else you want to do with the response...

                let arrObj = response.data.metafields;

                const found = arrObj.find(x => (x.namespace == "custom" && x.key == "language"));
                if (typeof found === "undefined") {
                    let obj = {};
                    obj.owner_id = info.id;
                    obj.key = "language";
                    obj.value = "English"

                    // setTestArr([...testArr,info]);

                    return obj;
                }

                // for (let x in arrObj) {
                //     console.log("test", x);
                //     // setTestArr([...testArr,x]);
                // }
                return found;

            })).then(results => {
                // All the resolved promises returned from the map function.
                console.log("dd", results);
                // console.log("async wait ", results.data.metafields[0]);

                console.log("empty", testArr);
                setMeta(results);
                // setTestArr([...testArr, pagedetails.data.metafields[0]]);

            })


            // fetchMyAPI();
        }, [data])

    const createPageBasedOnId = async (id, lan_value) => {
        let obj = {
            page_id: id,
            language: lan_value,
        };
        console.log("pageid", obj);
        const method = "POST";
        const response = await fetch("/api/PageCreate", {
            method,
            body: JSON.stringify(obj),
            headers: { "Content-Type": "application/json" },
        });
        if (response.ok) {

            const resdata = await response.json();
            console.log(resdata.status);
            if (resdata.status) {
                setActive(true);
            } else {
                alert("page published!!");
            }
            // alert(resdata);

        }
    }

    const toggleActive = useCallback(() => setActive((active) => !active), []);

    const toastMarkup = active ? (
        <Toast content="Page already exist!!" onDismiss={toggleActive} />
    ) : "";

    return (
        <>
            <Frame>
                {
                    (domain == "river-content-test.myshopify.com") ?
                        <Card>
                            <table className="table" cellPadding={10} cellSpacing={10}>
                                <thead>
                                    <tr>
                                        <th>Id</th>
                                        <th>MainId</th>
                                        <th>Title</th>

                                        <th>Language</th>
                                        <th>Action</th>

                                    </tr>
                                </thead>
                                <tbody>
                                    {

                                        data.map((metaData, index) => {

                                            return (
                                                <>  {meta.map(mt =>
                                                    <> {(typeof mt !== "undefined")
                                                        && (mt.owner_id == metaData.id) ?
                                                        <tr key={index}>
                                                            <td>{index + 1}</td>
                                                            <td>{metaData.id}</td>
                                                            <td>{metaData.title}</td>

                                                            <td>{mt.value}</td>
                                                            <td> {(mt.value == "English") ? <Button disabled onClick={() => createPageBasedOnId(metaData.id, mt.value)}>Publish</Button> : <Button onClick={() => createPageBasedOnId(metaData.id, mt.value)}>Publish</Button>}</td>
                                                        </tr> : ""}
                                                    </>)

                                                }</>

                                            )
                                        })
                                    }

                                </tbody>
                            </table>
                            {toastMarkup}
                        </Card>
                        : <Card title="Pages Published from Admin"></Card>
                }

            </Frame>
        </>
    );


}
