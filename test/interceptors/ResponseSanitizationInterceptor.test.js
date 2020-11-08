const skill = require("../../src/index");
const expect = require("chai").expect;
const assert = require("chai").assert;

const APL_CONSTANTS = require("constants/APL");

const APL_DOCUMENT_TYPE = APL_CONSTANTS.APL_DOCUMENT_TYPE;
const APL_DOCUMENT_VERSION = APL_CONSTANTS.APL_DOCUMENT_VERSION;

it("retains APL directive in the response if the device supports Alexa Presentation Language Interface", async () => {
  const event = require("../../test-data/apl_supported_intent_event");

  const response = await skill.handler(event);

  expect(response.response.directives).to.have.lengthOf(1);
  const directive = response.response.directives[0];
  expect(Object.keys(directive)).to.have.lengthOf(4);
  expect(directive.type).to.equal(APL_DOCUMENT_TYPE);
  expect(directive.version).to.equal(APL_DOCUMENT_VERSION);
});

it("strips away APL directives if the device does not support Alexa Presentation Language Interface", async () => {
  const event = require("../../test-data/apl_not_supported_event");

  const response = await skill.handler(event);

  expect(response.response.directives.length).to.equal(0);
});
