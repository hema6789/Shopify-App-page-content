import axios from 'axios';
import fs from 'fs';

const shopifyApi = '/admin/api/2023-01/shop.json';

axios.get(shopifyApi, {
    headers: {
        'Content-Type': 'application/json',
        'X-Shopify-Access-Token': 'xxx'
    }
})
    .then(response => {
        const { name, primary_locale } = response.data.shop;
        const xml = convert.json2xml({ name, primary_locale }, { compact: true, ignoreComment: true });
        fs.writeFileSync('../assets/shop.xml', xml);
    })
    .catch(error => console.log(error));
