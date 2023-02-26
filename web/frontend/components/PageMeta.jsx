import { useState, useEffect, useCallback } from "react";
import { Button, Card, Toast, Frame, TextContainer, Stack, Heading, Spinner } from "@shopify/polaris";
import axios from 'axios';
import createApp from '@shopify/app-bridge';
import { useAppBridge, useShopify } from "@shopify/app-bridge-react";
import { useAppQuery, useAuthenticatedFetch } from "../hooks";

export function PageMeta() {
    const [pageMsg, setPageMsg] = useState();
    const [loading, setLoading] = useState(false);
    const [loadingAdmin, setLoadingAdmin] = useState(false);
    const [data, setData] = useState([]);
    const [updateM, setUpdateM] = useState(true);
    //const [id, setId] = useState([]);
    const [meta, setMeta] = useState([]);
    const [testArr, setTestArr] = useState([]);
    const [active, setActive] = useState(false);
    const fetch = useAuthenticatedFetch();
    const [buttonText, setButtonText] = useState('Publish');
    const [domain, setDomain] = useState();
       
    useEffect(async () => {
        setLoadingAdmin(true);
        const response = await fetch("/api/shop");
        if (response.ok) {
            const data = await response.json();
            let doma = data[0].domain;
            console.log("pagename", doma);
            setDomain(doma);
            setLoadingAdmin(false);
        }
        const pagefetch = await fetch("/api/pages");
        if (pagefetch.ok) {
            const pagedata = await pagefetch.json();
            console.log("Sourcepages", pagedata);
            setData(pagedata);
            setLoading(false);
        }
    }, []),

        useEffect(async () => {

            setLoading(true);
            pageRenderingLogic();

        }, [data, updateM]);

    const pageRenderingLogic = () => {
        console.log("ddddd part 2");
        Promise.all(data.map(async info => {

            // Then put your try catch here so that it only wraps around
            // the results of the function you're awaiting...
            let dataResponse;
            try {
                // const response = await fetch("/api/pageMetafields");
                // response = await axios.get(`/admin/api/2023-01/metafields.json?metafield[owner_id]=${info.id}&metafield[owner_resource]=page`, {
                let obj = {
                    owner_id: info.id,
                    owner_resource: 'page',

                };
                const method = "POST";
                // 
                const response = await fetch("/api/pageMetafields", {
                    method,
                    body: JSON.stringify(obj),
                    headers: { "Content-Type": "application/json" },
                });
                if (response.ok) {
                    dataResponse = await response.json();
                    dataResponse = dataResponse.allPages;
                    let pagelog = dataResponse.pages;
                    // dataResponse = dataResponse[0];
                }
            } catch (err) {
                return err;
            }

            // Anything else you want to do with the response...

            let arrObj = dataResponse;


            const found = dataResponse.find(x => (x.namespace == "custom" && x.key == "language"));
            const found3 = dataResponse.find(x => (x.namespace == "custom" && x.key == "country"));
            const found2 = dataResponse.find(x => (x.namespace == "global" && x.key == "pagepublish"));
            // const found_updateMeta = dataResponse.find(x => (x.namespace == "global" && x.key == "pageupdate_at"));
            // console.log(dataResponse[0].owner_id, "found 1", found, "found 2", found2);
            let obj = {};
            if (typeof found === "undefined") {
                obj.owner_id = info.id;
                obj.key = "language";
                obj.value = "Not defined";

                // mainArr[arrObj[0].owner_id] = obj;
            } else {
                obj.owner_id = found.owner_id;
                obj.key = found.key;
                obj.namespace = found.namespace;
                obj.owner_resource = found.owner_resource;
                obj.id = found.id;
                obj.value = found.value;
                obj.old_updated_at = found.old_updated_at;
                obj.new_updated_at = found.new_updated_at;
                obj.idStatus = (typeof found2 === "undefined") ? false : found2.id;
                obj.status = (typeof found2 === "undefined") ? false : found2.value;
                obj.country = (typeof found3 === "undefined") ? false : found3.value;
                // obj.old_update_at = (typeof found_updateMeta === "undefined") ? false : found_updateMeta.value;

                // mainArr[arrObj[0].owner_id] = obj;
            }
            console.log("obj", obj);
            return obj;
        })).then(results => {
            // All the resolved promises returned from the map function.
            setMeta(results);
            console.log("final result", results);
            setLoading(false);
        })

    }

    const createPageBasedOnId = async (id, lan_value, idStatus, status, updated_at,country) => {
        //
        let obj = {
            page_id: id,
            language: lan_value,
            idStatus: idStatus,
            status: status,
            updated_at: updated_at,
            country:country
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
                setPageMsg(resdata.msg);
                alert(resdata.msg);
            } else {
                setPageMsg(resdata.msg);
                alert(resdata.msg);
            }
            setUpdateM(!updateM);


        }
    }

    const toggleActive = useCallback(() => setActive((active) => !active), []);

    const toastMarkup = active ? (
        <Toast content={pageMsg} onDismiss={toggleActive} />
    ) : "";

    const adminPageDetails = loadingAdmin ? <Spinner accessibilityLabel="Spinner example" size="small" /> : <Stack
        wrap={false}
        spacing="extraTight"
        distribution="trailing"
        alignment="center"
    >
        <Stack.Item fill>
            <TextContainer spacing="loose" >
                <div></div>
                <Heading Style={{ padding: "10px;" }}>Pages Auto Published By Admin</Heading>
                <div></div>
            </TextContainer>
        </Stack.Item>

    </Stack>;

    return (
        <>
            <Frame>
                {loading ? <Spinner accessibilityLabel="Spinner example" size="large" /> :
                 (domain == "apple-qa.myshopify.com") ?
                  // (domain == "river-content-test.myshopify.com") ?
                        <Card>
                            <table className="table" cellPadding={10} cellSpacing={10}>
                                <thead>
                                    <tr>
                                        <th>Id</th>
                                        <th>Title</th>
                                        <th>Country</th>
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
                                                            <td>{metaData.title}</td>
                                                            <td>{mt.country}</td>
                                                            <td>{mt.value}</td>
                                                            <td> {(mt.value == "Not defined") ? <Button disabled onClick={() => createPageBasedOnId(metaData.id, mt.value, mt.idStatus, mt.status,mt.country)}>Not Defined</Button>
                                                                : <div >
                                                                    {(mt.status) ? <div>{(mt.new_updated_at == mt.old_updated_at) ? <Button disabled className=" Polaris-Button " onClick={() => createPageBasedOnId(metaData.id, mt.value, mt.idStatus, mt.status, metaData.updated_at,mt.country)}>Published</Button> : <button className=" Polaris-Button white" onClick={() => createPageBasedOnId(metaData.id, mt.value, mt.idStatus, mt.status, metaData.updated_at,mt.country)}>Republish</button>}</div> : <button className="Polaris-Button Polaris-Button--primary" type="button" onClick={() => createPageBasedOnId(metaData.id, mt.value, mt.idStatus, mt.status, metaData.updated_at,mt.country)} >Publish </button>}
                                                                </div>}</td>

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
                        :
                        adminPageDetails

                }

            </Frame>
        </>
    );


}
