import { useState, useEffect } from "react";
import { Card } from "@shopify/polaris";

export function ProductsDetails() {
 
const [data, setData] = useState([]);

useEffect(() => {
      fetch('/admin/api/2022-10/pages.json',{
      method: "GET",  
      headers: {
           'Access-Control-Allow-Origin': "*",
           'Access-Control-Allow-Methods': "GET",
           'Access-Control-Allow-Headers': "*",
           'X-Shopify-Access-Token': "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",
           'Content-Type': 'application/json',
         }
        
    }).then((responseJson) => {
        setData(responseJson);
        console.log(responseJson);
      }).catch(error => {
        console.log("error", );
    });
  }, []);


  useEffect(() => {
    async function getData() {
      const response = await fetch(
        `https://testappaccount.myshopify.com/admin/api/2022-10/pages.json`,{
       
        headers: {
            'Access-Control-Allow-Origin': "*",
            'Access-Control-Allow-Methods': "GET",
            'Access-Control-Allow-Headers': "*",
            'X-Shopify-Access-Token': "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",
            'Content-Type': 'application/json',
          }
        }
        
      )
      let actualData = await response.json();
  
      console.log(actualData) 
    }
    getData()
  }, [])

  return (
    <>
      <Card>
        <h4>hello shyam mekala </h4>  
        <h4>coming soon </h4>
      </Card>
    </>
  );
}
