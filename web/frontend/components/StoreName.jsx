import { useState, useEffect } from "react";
export function StoreName() {

const [id, setId] = useState('');
const [name, setName] = useState('');

useEffect(() => {
    fetch('/admin/api/2023-01/shop.json', {
      headers: {
        'Content-Type': 'application/json',
        'X-Shopify-Access-Token': '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'
    }
    })
        .then(res => res.json())
        .then(data => {
            setId(data.id);
            setName(data.name);
            saveXMLFile();
            console.log(data)
        })
        .catch(error => console.log(error))
}, []);

const saveXMLFile = () => {
    const serializer = new XMLSerializer();
    const xmlData = serializer.serializeToString({ id, name });

    fetch('../assets', {
        method: 'POST',
        headers: { 'Content-Type': 'application/xml' },
        body: xmlData
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
}