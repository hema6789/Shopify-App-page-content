// @ts-check
import { join } from "path";
import { readFileSync, writeFileSync } from "fs";
import express from "express";
import serveStatic from "serve-static";
import { S3Client, PutObjectCommand } from "@aws-sdk/client-s3";
import { sdkStreamMixin } from '@aws-sdk/util-stream-node';
import shopify from "./shopify.js";
import productCreator from "./product-creator.js";
import GDPRWebhookHandlers from "./gdpr.js";
import { createRequire } from "module";
const require = createRequire(import.meta.url);
const ShopifyTest = require("shopify-api-node");
import AWS from 'aws-sdk';
import axios from 'axios';

const PORT = parseInt(process.env.BACKEND_PORT || process.env.PORT, 10);

const STATIC_PATH =
  process.env.NODE_ENV === "production"
    ? `${process.cwd()}/frontend/dist`
    : `${process.cwd()}/frontend/`;

const app = express();
// Set up Shopify authentication and webhook handling
app.get(shopify.config.auth.path, shopify.auth.begin());
app.get(
  shopify.config.auth.callbackPath,
  shopify.auth.callback(),
  shopify.redirectToShopifyOrAppRoot()
);
app.post(
  shopify.config.webhooks.path,
  shopify.processWebhooks({ webhookHandlers: GDPRWebhookHandlers })
);

// All endpoints after this point will require an active session
app.use("/api/*", shopify.validateAuthenticatedSession());

app.use(express.json());

//AWS
export const s3buckets = async (obj) => {
  try {// Unique bucket name
    const bucketName = 'appleexamplebucket';
    const primary_locale = obj.primary_locale;
    const keyName = 'shop-' + primary_locale + '.json';
    // Set the AWS 
    const REGION = "us-west-1";
    // Create an Amazon S3 service client object.
    const s3Client = new S3Client({
      region: REGION,
      credentials: {
        accessKeyId: 'xxx',
        secretAccessKey: 'xxx'
      }
    });
    const paramsZ = {
      Bucket: bucketName,
      Key: keyName
    };
    const s3 = new AWS.S3({
      accessKeyId: 'xxx',
      secretAccessKey: 'xxx'
    });
    const isExist = await isFileExist(s3, paramsZ);
    console.log("is Exist", isExist);
    if (isExist) {
      console.log("keyName", keyName);
      const test = await checkStoreJson(obj, keyName);
      console.log("final check Obje", test);

      const putCommand = new PutObjectCommand({
        Bucket: bucketName,
        Key: keyName,
        Body: JSON.stringify(test)
      })

      //if check condition with the same language json file
      //if this logic true then we get the content of that file and add new shop json into this file and update it..
      const { response } = await s3Client.send(putCommand);
      console.log('Successfully uploaded data to ' + bucketName + '/' + keyName);
      console.log('Bucket content ' + response);

    } else {
      const putCommand = new PutObjectCommand({
        Bucket: bucketName,
        Key: keyName,
        Body: JSON.stringify([obj])
      })
      //if check condition with the same language json file
      //if this logic true then we get the content of that file and add new shop json into this file and update it..
      const { response } = await s3Client.send(putCommand);
      console.log("check file create");
    }


  } catch (err) {
    console.log(err);
  }

}

const checkStoreJson = async (obj, keyName) => {
  const s3 = new AWS.S3({
    accessKeyId: 'xxx',
    secretAccessKey: 'xxx'
  });

  const bucketName = 'appleexamplebucket';

  const params = {
    Bucket: bucketName,
    Key: keyName
  };

  const shopid = obj.shopid;
  console.log("shop id for checking ", shopid);
  console.log("keyName", keyName);
  const targetCredentials = await fetchObject(s3, params);
  let targetCredentialsJson = JSON.parse(targetCredentials);
  console.log("fetching file from aws ", targetCredentialsJson);
  let flag = true;
  let i = 0;
  if (targetCredentialsJson.length) {
    console.log("***********shop id comparing loop***************");
    for (const targetCredentials of targetCredentialsJson) {
      console.log(targetCredentials.shopid, " == ", shopid)
      if (targetCredentials.shopid == shopid) {
        console.log(targetCredentials, "==", obj);
        targetCredentialsJson[i] = obj;
        flag = false;
      }
      i++;
    }
    console.log("*********** end shop id comparing loop***************");
    console.log("flag value", flag);
    if (flag) {
      targetCredentialsJson.push(obj);
      return targetCredentialsJson;
    } else {

      return targetCredentialsJson;
    }
  } else {
    let objArr = [];
    objArr.push(obj);
    return objArr;
  }
}

async function isFileExist(s3, params) {
  // console.log("test1");
  try {
    // console.log("test1.5");
    const data = await s3.getObject(params).promise();
    // console.log("data from bucket", data.Body.toString());
    return true;
  } catch (error) {
    console.log("test2", error);
    return false;
  }
}

async function fetchObject(s3, params) {
  try {
    // console.log("checking fetchObject", params);
    const data = await s3.getObject(params).promise();
    // console.log("data from bucket", data.Body.toString());
    return data.Body.toString();
  } catch (error) {
    console.error("try catch", error, "parame", params);
  }
}



app.post("/api/writeshop", async (_req, res) => {
  //console.log("node js start", _req, res);
  console.log("test file");
  try {
    const shopid = _req.body.shopid;
    const domain = _req.body.domain;
    const name = _req.body.name;
    const primary_locale = _req.body.primary_locale;
    const obj = {
      shopid: shopid,
      domain: domain,
      name: name,
      primary_locale: primary_locale,
      session: res.locals.shopify.session,
    };
    console.log("test file", res.locals.shopify.session);
    await s3buckets(obj);
    console.log("s3 bucket invoke..........................................1");
    res.status(200);

  } catch (e) {
    console.log(e);
  }
});

app.get("/api/shop", async (_req, res) => {
  //console.log("node js start");
  const countData = await shopify.api.rest.Shop.all({
    session: res.locals.shopify.session,
  });
  //console.log("node js test", countData);
  res.status(200).send(countData);
})
app.post("/api/PageCreate", async (_req, res) => {
  console.log("*****************Page Create logic**********************");
  const Shopify = require('shopify-api-node');

  try {
    let retObj = {};
    const page_id = _req.body.page_id;  //getting page id
    const language = _req.body.language; // langauage
    const updated_at = _req.body.updated_at;
    const source_country = _req.body.country;

    // we are fetching pages dettails by page id
    const getPageData = await shopify.api.rest.Page.find({
      session: res.locals.shopify.session,
      id: page_id,
    });

    //extracating page details
    let testObj = {
      title: getPageData.title,
      body_html: getPageData.body_html,
      template_suffix: getPageData.template_suffix
    };

    // you can search page language and search in aws file and get shopname and access token.

    const s3 = new AWS.S3({
      accessKeyId: 'xxx',
      secretAccessKey: 'xxxx'
    });

    const bucketName = 'appleexamplebucket';
    const keyName = 'shop-' + language + '.json';

    const params = {
      Bucket: bucketName,
      Key: keyName
    };


    const targetCredentials = await fetchObject(s3, params);
    let targetCredentialsJson = JSON.parse(targetCredentials);
    console.log("List of all target store", targetCredentialsJson);
    //res.status(200).send(targetCredentialsJson);
    //start of targetstore for loop

    let checkCountryFlag = false;
    for (const targetStoreObj of targetCredentialsJson) {
      //we are expecting aws json file shopname and there acces token from particular language page
      try {
        const targetStore = new Shopify({ //target store where we creating our pages
          shopName: targetStoreObj.session.shop,
          accessToken: targetStoreObj.session.accessToken //'shpua_dcc726d9d7702864f98cb5321233eb47' // 
        });

        //just sheck shopjso of taget store
        const country = await targetStore.shop.get();
        console.log("store country", country.country);
        const targetCountry = country.country;
        //get country code from shop.json api

        //check country is equal to country 
        
        let source_coutry_arr = source_country.split(",");
        console.log(targetCountry, "==", source_country);
        if (source_coutry_arr.includes(targetCountry)) {
          checkCountryFlag = true;
          let handleParams = { handle: getPageData.handle };
          const targetStoreList = await targetStore.page.list(handleParams);
          // console.log("target store", targetStoreList);
          // create functions for moving pages to target store 
          let testPageData;
          if (targetStoreList.length <= 0) {
            testPageData = await targetStore.page.create(testObj);
            retObj.msg = "Page Created";
          } else {
            const updatePageId = targetStoreList[0].id;//taeget store update page id
            testPageData = await targetStore.page.update(updatePageId, testObj);
            retObj.msg = "Page updated";
          }

          const pagenew_id = testPageData.id;

          const singlePageAllMetafields = await shopify.api.rest.Metafield.all({
            session: res.locals.shopify.session,
            metafield: { owner_id: page_id, owner_resource: "page" }, // source store page id
          });

          // console.log("all metafields of single page", singlePageAllMetafields);
          // transfer single page all metafiels to target store
          for (const singleMeta of singlePageAllMetafields) {
            let namespace = singleMeta.namespace;
            let type = singleMeta.type;
            let key = singleMeta.key;
            let value = singleMeta.value;
            // transferring source metafields to target store metafields
            const metafld = await targetStore.metafield.create({
              key: key,
              value: value,
              type: type,
              namespace: namespace,
              owner_resource: 'page',
              owner_id: pagenew_id //target store page id
            });
            // console.log("create single metafields in target store ", metafld);
          }
        }
      } catch (e) {
        console.log("error of token ", e);
      }

    }


    //end of targetstore for loop

    //metaifeld flag true for showing as published
    if (checkCountryFlag) {
      const metafieldPage = new shopify.api.rest.Metafield({
        session: res.locals.shopify.session
      });
      metafieldPage.key = "pagepublish";
      metafieldPage.value = "true";
      metafieldPage.type = "boolean";
      metafieldPage.namespace = "global";
      metafieldPage.page_id = page_id; //source store page id
      const checkMetafieldPage = await metafieldPage.save({
        update: true,
      });
      console.log(" metafieldPage ", checkMetafieldPage);
      // create metafiedls for page update metafields.
      const metafieldPageUpdateTfs = await shopify.api.rest.Page.find({
        session: res.locals.shopify.session,
        id: page_id
      });
      upsertPageUpdateJson(page_id, metafieldPageUpdateTfs.updated_at);
      retObj.status = 1;
    } else {
      retObj.msg = "Please check Language or country code";
      retObj.status = 0;
    }

    res.status(200).send(retObj);

  } catch (e) {
    res.status(200).send({ status: false, msg: e });
    console.log(`Failed to process page/create:`, e);
  }
});

const upsertPageUpdateJson = async (page_id, updated_at) => {
  try {
    let obj = {
      page_id: page_id,
      old_updated_at: updated_at
    }
    const bucketName = 'appleexamplebucket';
    const keyName = 'parentstorelogs.json';
    // shop-parent-page.json
    // Set the AWS 
    const REGION = "us-west-1";
    // Create an Amazon S3 service client object. wrinng the object
    const s3Client = new S3Client({
      region: REGION,
      credentials: {
        accessKeyId: 'xxx',
        secretAccessKey: 'xxxxx'
      }
    });

    // this is for reading the object
    const paramsZ = {
      Bucket: bucketName,
      Key: keyName
    };
    const s3 = new AWS.S3({
      accessKeyId: '---',
      secretAccessKey: 'xxxx'
    });
    const isExist = await isFileExist(s3, paramsZ);
    // console.log("is Exist",)
    let flag = true;
    //check file is exitst
    if (isExist) {
      // will read file data and convert it into json format
      let data = await s3.getObject(paramsZ).promise();
      let pages = data.Body.toString();
      pages = JSON.parse(pages);

      // console.log("pages list", pages);
      let i = 0;
      for (const page of pages) {
        console.log(page.page_id, "==", page_id);
        if (page.page_id == page_id) {
          pages[i] = obj;
          flag = false;
        }
        i++;
      }

      if (flag) {
        pages.push(obj);
      }
      // console.log("list of page", pages);
      // update the new contecnt in pages
      const putCommand = new PutObjectCommand({
        Bucket: bucketName,
        Key: keyName,
        Body: JSON.stringify(pages)
      })
      const { response } = await s3Client.send(putCommand);
      // console.log("file is updated", response);
    } else {
      // wile create file name in aws config json
      const putCommand = new PutObjectCommand({
        Bucket: bucketName,
        Key: keyName,
        Body: JSON.stringify([obj])
      })
      const { response } = await s3Client.send(putCommand);
      console.log("file is created", response);
    }
  } catch (e) {
    console.log("error of creating pages", e);
  }
}

const testApi = async () => {
  console.log("***********************************************");
  console.log("running test apis");
  const Shopify = require('shopify-api-node');
  // app.put("/api/metaupdate", async (_req, res) => {
  //   const Shopify = require('shopify-api-node');
  //   console.log("testssssfs");
  const targetStore = new Shopify({ //target store where we creating our pages
    shopName: 'automate-page.myshopify.com',
    accessToken: '----' //'----' // 
  });

  const createMetafields = await targetStore.metafield.create({
    key: 'warehouse',
    value: 25,
    type: 'single_line_text_field',
    namespace: 'inventory',
    owner_resource: 'page',
    owner_id: 110415413537,
  });

  console.log("chechk ans", createMetafields);


}

// testApi();

app.get("/api/pages", async (_req, res) => {
  const Allpages = await shopify.api.rest.Page.all({
    session: res.locals.shopify.session,
  });
  res.status(200).send(Allpages);
});

//get metafields value for specific page id and owner resourse

app.post("/api/pageMetafields", async (_req, res) => {
  console.log("********************Get Page Metafields******************************");
  try {
    const owner_resource = _req.body.owner_resource;
    const owner_id = _req.body.owner_id;
    // console.log("owner_resource", owner_resource, " owner_id ", owner_id);
    const allPages = await shopify.api.rest.Metafield.all({
      session: res.locals.shopify.session,
      metafield: { "owner_id": owner_id, "owner_resource": owner_resource },
    });

    const bucketName = 'appleexamplebucket';
    const keyName = 'parentstorelogs.json';

    // this is for reading the object
    const paramsZ = {
      Bucket: bucketName,
      Key: keyName
    };
    const s3 = new AWS.S3({
      accessKeyId: 'xxx',
      secretAccessKey: 'xxx'
    });

    let data = await s3.getObject(paramsZ).promise();
    let pages = data.Body.toString();
    pages = JSON.parse(pages);
    // console.log(allPages);
    const mergedObj = [];
    pages.forEach(obj => mergedObj[obj.page_id] = obj);

    const pagesLists = await shopify.api.rest.Page.all({
      session: res.locals.shopify.session,
    });
    const pageObj = [];
    pagesLists.forEach(obj => pageObj[obj.id] = obj);

    // console.log("check object", mergedObj);
    let i = 0;
    for (const allPage of allPages) {
      if (mergedObj[allPage.owner_id]) {
        allPages[i].old_updated_at = mergedObj[allPage.owner_id].old_updated_at;
        allPages[i].new_updated_at = pageObj[allPage.owner_id].updated_at;
      }
      i++;
    }
    // console.log("chck all page", allPages);


    res.status(200).send({ 'allPages': allPages, 'pages': pages });
  } catch (e) {
    res.status(500).send(e);
  }

});

app.get("/api/products/count", async (_req, res) => {

  const countData = await shopify.api.rest.Product.count({
    session: res.locals.shopify.session,
  });
  res.status(200).send(countData);
});

app.get("/api/products/create", async (_req, res) => {
  let status = 200;
  let error = null;

  try {
    await productCreator(res.locals.shopify.session);
  } catch (e) {
    console.log(`Failed to process products/create: ${e.message}`);
    status = 500;
    error = e.message;
  }
  res.status(status).send({ success: status === 200, error });
});

app.use(serveStatic(STATIC_PATH, { index: false }));

app.use("/*", shopify.ensureInstalledOnShop(), async (_req, res, _next) => {
  return res
    .status(200)
    .set("Content-Type", "text/html")
    .send(readFileSync(join(STATIC_PATH, "index.html")));
});

app.listen(PORT);

