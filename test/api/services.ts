"use strict";

import { assert } from "chai";
import { clearDb, request } from "../helpers";
import * as uuid from "uuid/v4";
import Service from "../../models/service";

const prepareDb = async () => Promise.all([1, 2, 3].map((value) =>
  new Service(uuid(), `Service ${value}`).save(),
));

export default () => {
  describe("GET /services", () => {
    let services: Service[];
    beforeEach(async () => {
      await clearDb();
      services = await prepareDb();
    });
    it("200 OK", async () => {
      const result = await request(
        "GET /services",
        "200 OK",
      );
      for (const id in services) {
        if (id in services && id in result) {
          for (const field in services[id].toView()) {
            if (field in services[id].toView() && field in result[id]) {
              const view: any = services[id].toView();
              assert.equal(result[id][field], view[field], `${id}#${field}`);
            }
          }
        }
      }
    });
    it("200 OK #pagination");
  });
};
