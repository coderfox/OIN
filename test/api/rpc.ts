"use strict";

import { assert } from "chai";
import { clearDb, requestRpc, UuidRegExp } from "../helpers";
import * as uuid from "uuid/v4";
import { deploy_token } from "../../lib/config";

export default () => {
  describe("POST /rpc/register_service", () => {
    after(clearDb);
    it("200 OK", async () => {
      const result = await requestRpc(
        "register_service",
        { deploy_token, metadata: { id: uuid(), name: "Hello World!" } }
      );
      assert.match(result, UuidRegExp);
    });
    it("INVALID_PARAMETERS", () => requestRpc(
      "register_service",
      { deploy_token },
      "INVALID_PARAMETERS"
    ));
    it("INSUFFICIENT_PERMISSION", () => requestRpc(
      "register_service",
      { deploy_token: deploy_token + "INVALID", metadata: { id: uuid(), name: "Hello World!" } },
      "INSUFFICIENT_PERMISSION"
    ));
  });
};
