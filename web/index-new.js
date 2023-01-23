// @ts-check
import { join } from "path";
import { readFileSync, writeFileSync } from "fs";
import express from "express";
import serveStatic from "serve-static";

import shopify from "./shopify.js";
import productCreator from "./product-creator.js";
import GDPRWebhookHandlers from "./gdpr.js";

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

app.post("/api/writeshop", async (_req, res) => {
  console.log("node js start", _req, res);
  try {
    const domain = _req.body.domain;
    const name = _req.body.name;
    const primary_locale = _req.body.primary_locale;
    const obj = {
      domain: domain,
      name: name,
      primary_locale: primary_locale
    }

    const test = writeFileSync('shop.xml', JSON.stringify(obj), { flag: 'ax' });
    res.status(200).send(test);
  } catch (e) {
    console.log(e);
  }
});

app.get("/api/shop", async (_req, res) => {
  console.log("node js start");
  const countData = await shopify.api.rest.Shop.all({
    session: res.locals.shopify.session,
  });
  console.log("node js test", countData);
  res.status(200).send(countData);
})

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
