"use strict";

import { expect } from "chai";
import { CorruptedAuthorizationHeaderError, TokenInvalidError, InvalidAuthenticationTypeError } from "../../lib/errors";
import { parseBasic, parseBearer, parseAuth } from "../../lib/auth";

export default () => {
  describe("parseBasic", () => {
    it("works", () => {
      const result = parseBasic("Basic dXNlcjpwYXNzd29yZA==");
      expect(result.username).eql("user");
      expect(result.password).eql("password");
    });
    it("throws on not-base64 data", () => {
      expect(() => parseBasic("Basic some*thing*not*base64"))
        .to.throw(CorruptedAuthorizationHeaderError);
    });
    it("throws on invalid base64-decoded data", () => {
      expect(() => parseBasic("Basic aW52YWxpZA=="))
        .to.throw(CorruptedAuthorizationHeaderError);
    });
    it("throws on non-Basic auth", () => {
      expect(() => parseBasic("Invalid auth"))
        .to.throw(InvalidAuthenticationTypeError);
    });
  });
  describe("parseBearer", () => {
    it("works", () => {
      const result = parseBearer("Bearer 8228ea23-6bae-499f-b780-69cc8903bfeb");
      expect(result).eql("8228ea23-6bae-499f-b780-69cc8903bfeb");
    });
    it("throws on not-token data", () => {
      expect(() => parseBearer("Bearer some*thing*not*bearer*token"))
        .to.throw(TokenInvalidError);
    });
    it("throws on non-Bearer auth", () => {
      expect(() => parseBasic("Invalid auth"))
        .to.throw(InvalidAuthenticationTypeError);
    });
  });
  describe("parseAuth", () => {
    it("throws on corrupted header missing credentials", () => {
      expect(() => parseAuth("Invalid"))
        .to.throw(CorruptedAuthorizationHeaderError);
    });
    it("throws on corrupted header missing anything", () => {
      expect(() => parseAuth("Authorization:"))
        .to.throw(CorruptedAuthorizationHeaderError);
    });
  });
};
