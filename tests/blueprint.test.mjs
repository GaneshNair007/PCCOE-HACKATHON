import { test, describe } from "node:test";
import assert from "node:assert/strict";
import http from "node:http";

describe("Carbonerra Blueprint Compliance & API Explorer Contracts", () => {
  test("1. GET /api/methodology adheres to SWDM v4 transparent specifications", async () => {
    const data = await new Promise((resolve, reject) => {
      const req = http.get("http://127.0.0.1:3001/api/methodology", (res) => {
        let body = "";
        res.on("data", (chunk) => (body += chunk));
        res.on("end", () => {
          try {
            resolve(JSON.parse(body));
          } catch (e) {
            reject(e);
          }
        });
      });
      req.on("error", reject);
    });

    assert.equal(data.status, "success");
    assert.ok(data.model_version.includes("v4"));
    assert.ok(Array.isArray(data.limitations));
    assert.ok(data.limitations.length >= 3);
    assert.ok(data.methodology.operationalKwhPerByte > 0);
  });

  test("2. POST /api/simulate computes reproducible scenario delta", async () => {
    const postPayload = JSON.stringify({
      baseline_bytes: 2000000,
      img_comp: 85,
      js_defer: 60,
      cache_ttl: 30,
      green_hosting: true,
    });

    const result = await new Promise((resolve, reject) => {
      const req = http.request(
        "http://127.0.0.1:3001/api/simulate",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            "Content-Length": Buffer.byteLength(postPayload),
          },
        },
        (res) => {
          let body = "";
          res.on("data", (chunk) => (body += chunk));
          res.on("end", () => {
            try {
              resolve(JSON.parse(body));
            } catch (e) {
              reject(e);
            }
          });
        }
      );
      req.on("error", reject);
      req.write(postPayload);
      req.end();
    });

    assert.equal(result.status, "success");
    assert.ok(result.simulated.co2_grams < result.baseline.co2_grams);
    assert.ok(result.saving_pct > 0);
  });
});
