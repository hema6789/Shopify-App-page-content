// @ts-check
import { join } from "path";
import { readFileSync, writeFileSync } from "fs";
import express from "express";
import serveStatic from "serve-static";
import { S3Client, GetObjectCommand, PutObjectCommand } from "@aws-sdk/client-s3";
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
        accessKeyId: 'AKIA2LNDD6PGMREIQW7F',
        secretAccessKey: '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'
      }
    });
    const putCommand = new PutObjectCommand({
      Bucket: bucketName,
      Key: keyName,
      Body: JSON.stringify(obj)
    })
    const { response } = await s3Client.send(putCommand);
    console.log('Successfully uploaded data to ' + bucketName + '/' + keyName)
    console.log('Bucket content ' + response)
  } catch (err) {
    console.log(err)
  }

}

async function fetchObject(s3, params) {
  try {
    const data = await s3.getObject(params).promise();
    console.log("data from bucket", data.Body.toString());
    return data.Body.toString();
  } catch (error) {
    console.error(error);
  }
}



app.post("/api/writeshop", async (_req, res) => {
  //console.log("node js start", _req, res);
  console.log("test file");
  try {
    const domain = _req.body.domain;
    const name = _req.body.name;
    const primary_locale = _req.body.primary_locale;
    const obj = {
      domain: domain,
      name: name,
      primary_locale: primary_locale,
      session: res.locals.shopify.session,
    }
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
  const Shopify = require('shopify-api-node');
  console.log("testssssfs");
  try {
    const page_id = _req.body.page_id;  //getting page id
    const language = _req.body.language;

    // const shopData = await shopify.api.rest.Shop.all({
    //   session: res.locals.shopify.session,
    //   fields: "primary_locale",
    // });

    // console.log("shopdetails ddd", shopData[0].primary_locale);

    // console.log("page_id : ", page_id, "  Langauage : ", language);

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
    }

    // you can search page language and search in aws file and get shopname and access token.

    const s3 = new AWS.S3({
      accessKeyId: 'AKIA2LNDD6PGMREIQW7F',
      secretAccessKey: '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'
    });

    const bucketName = 'appleexamplebucket';
    const keyName = 'shop-' + language + '.json';

    const params = {
      Bucket: bucketName,
      Key: keyName
    };


    const targetCredentials = await fetchObject(s3, params);
    console.log("fetching file from aws ", targetCredentials);
    let targetCredentialsJson = JSON.parse(targetCredentials);


    //we are expecting aws json file shopname and there acces token from particular language page
    const targetStore = new Shopify({ //target store where we creating our pages
      shopName: targetCredentialsJson.session.shop,
      accessToken: targetCredentialsJson.session.accessToken
    });



    console.log("get page details", getPageData);

    console.log("object checking", testObj);
    console.log("page hanle", getPageData.handle);
    let handleParams = { handle: getPageData.handle };
    const targetStoreList = await targetStore.page.list(handleParams);
    if (targetStoreList.length <= 0) { // create functions for moving pages to target store
      const testPageData = await targetStore.page.create(testObj);
      console.log("checking function ", testPageData);
      res.status(200).send(testPageData);
    } else {
      let msg = {
        message: "Page already exist!!",
        status: 1
      };
      res.status(200).send(msg);
    }

  } catch (e) {
    console.log(`Failed to process page/create: ${e.message}`);

  }

})

app.get("/api/pages/list", async (_req, res) => {

  const pages = await shopify.api.rest.Page.all({
    session: res.locals.shopify.session,
  });
  res.status(200).send(pages);
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
