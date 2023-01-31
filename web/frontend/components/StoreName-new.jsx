import { useState, useEffect } from "react";
import createApp from '@shopify/app-bridge';
import { useAppBridge, useShopify } from "@shopify/app-bridge-react";
import {
  Card,
  Heading,
  TextContainer,
  DisplayText,
  TextStyle,
} from "@shopify/polaris";
import { useAppQuery, useAuthenticatedFetch } from "../hooks";
export function StoreName() {

  const [id, setId] = useState('');
  const [name, setName] = useState('');
  const fetch = useAuthenticatedFetch();
  const emptyToastProps = { content: null };
  const [isLoading, setIsLoading] = useState(true);
  const [toastProps, setToastProps] = useState(emptyToastProps);
  const toastMarkup = toastProps.content && !isRefetchingCount && (
    <Toast {...toastProps} onDismiss={() => setToastProps(emptyToastProps)} />
  );

  useEffect(() => {
    console.log("test start");
    handlePopulate();


    // fetch('/admin/api/2023-01/shop.json', {
    //   headers: {
    //     'Content-Type': 'application/json',
    //     'X-Shopify-Access-Token': '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'
    //   }
    // })
    //   .then(res => res.json())
    //   .then(data => {


    //     setId(data.shop.id);
    //     setName(data.shop.name);
    //     console.log("store", data);
    //     console.log("id", id, "name", name);
    //     saveXMLFile();

    //   })
    //   .catch(error => console.log(error))
  }, []);

  const handlePopulate = async () => {

    const response = await fetch("/api/shop");
    if (response.ok) {
      const data = await response.json();
      let primary_locale = data[0].primary_locale;
      let domain = data[0].domain;
      let name = data[0].name;
      saveXMLFile(primary_locale, domain, name);
    }

  }
  const saveXMLFile = async (primary_locale, domain, name) => {

    // const serializer = new XMLSerializer();

    let obj = {
      primary_locale: primary_locale,
      domain: domain,
      name: name
    };
    const method = "POST";
    // 
    const response = await fetch("/api/writeshop", {
      method,
      body: JSON.stringify(obj),
      headers: { "Content-Type": "application/json" },
    });
    if (response.ok) {

    }
    // // const xmlData = serializer.serializeToString(obj);
    // // console.log(xmlData);
    // // const xmlData = json2xml.parse("root", obj);
    // const json = JSON.stringify(obj);
    // const xml = json2xml(json, { compact: true, spaces: 1 });
    // console.log("dfdf",xml);
  }
  return (
    <div></div>

  );

}
