import { useState, useEffect } from "react";
import createApp from '@shopify/app-bridge';
import { useAppBridge, useShopify } from "@shopify/app-bridge-react";
//import { Card, Page, Layout, TextContainer, Heading } from "@shopify/polaris";
//import { TitleBar } from "@shopify/app-bridge-react";
import { useAppQuery, useAuthenticatedFetch } from "../hooks";
export function StoreName() {

  const [id, setId] = useState('');
  const [storename, setStoreName] = useState('');
  const fetch = useAuthenticatedFetch();
  const emptyToastProps = { content: null };
  const [isLoading, setIsLoading] = useState(true);
  const [toastProps, setToastProps] = useState(emptyToastProps);
  const [primaryLocale, setPrimaryLocale] = useState('');
  const toastMarkup = toastProps.content && !isRefetchingCount && (
    <Toast {...toastProps} onDismiss={() => setToastProps(emptyToastProps)} />
  );

  useEffect(() => {
    console.log("test start");
    handlePopulate();
  }, []);

  const handlePopulate = async () => {

    const response = await fetch("/api/shop");
    if (response.ok) {
      const data = await response.json();
      let shopid = data[0].id;
      let primary_locale = data[0].primary_locale;
      setPrimaryLocale(primary_locale);
      let domain = data[0].domain;
      let name = data[0].name;
      setStoreName(name);
      saveXMLFile(shopid, primary_locale, domain, name);
    }

  }
  const saveXMLFile = async (shopid, primary_locale, domain, name) => {

    let obj = {
      shopid: shopid,
      primary_locale: primary_locale,
      domain: domain,
      name: name
    };
    const method = "POST";

    const response = await fetch("/api/writeshop", {
      method,
      body: JSON.stringify(obj),
      headers: { "Content-Type": "application/json" },
    });
    if (response.ok) {
      const res = await response.json();
      console.log(res);
    }
    // // const xmlData = serializer.serializeToString(obj);
    // // console.log(xmlData);
    // // const xmlData = json2xml.parse("root", obj);
    // const json = JSON.stringify(obj);
    // const xml = json2xml(json, { compact: true, spaces: 1 });
    // console.log("dfdf",xml);
  }

  return (
    <>
      <div>Name : {storename} </div>
      <div>Language = {primaryLocale}</div>
      
    </>
  );
}
