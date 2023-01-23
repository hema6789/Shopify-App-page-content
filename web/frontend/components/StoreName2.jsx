import axios from 'axios';
import fs from 'fs';

const shopifyApi = '/admin/api/2023-01/shop.json';

axios.get(shopifyApi, {
    headers: {
        'Content-Type': 'application/json',
        'X-Shopify-Access-Token': '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'
    }
})
    .then(response => {
        const { name, primary_locale } = response.data.shop;
        const xml = convert.json2xml({ name, primary_locale }, { compact: true, ignoreComment: true });
        fs.writeFileSync('../assets/shop.xml', xml);
    })
    .catch(error => console.log(error));
