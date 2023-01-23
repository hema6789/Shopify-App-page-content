import { useState, useEffect } from "react";
export function StoreName() {

  const [id, setId] = useState('');
  const [name, setName] = useState('');

  useEffect(() => {
    fetch('/admin/api/2023-01/shop.json', {
      headers: {
        'Content-Type': 'application/json',
        'X-Shopify-Access-Token': 'xxx'
      }
    })
      .then(res => res.json())
      .then(data => {


        setId(data.shop.id);
        setName(data.shop.name);
        console.log("store", data);
        console.log("id", id, "name", name);
        saveXMLFile();

      })
      .catch(error => console.log(error))
  }, []);

  const saveXMLFile = () => {

    const serializer = new XMLSerializer();
    console.log("id", id, "name", name);
    let obj = {
      id: id,
      name: name,
    };
    // const xmlData = serializer.serializeToString(obj);

    fetch('../assets/shop.xml', {
      method: 'POST',
      headers: { 'Content-Type': 'application/xml'},
      body: obj
    })
      .then(res => res.json())
      .then(data => {
        if (data.status === 'success') {
          console.log('XML file saved successfully');
        } else {
          console.log('Error saving XML file');
        }
      })
      .catch(error => console.log(error));
  }
  return (
    <div> test </div>

  );

}
