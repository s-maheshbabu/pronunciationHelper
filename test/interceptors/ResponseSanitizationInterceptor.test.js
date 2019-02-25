const skill = require("../../src/index");
const expect = require("chai").expect;
const assert = require("chai").assert;

const APL_CONSTANTS = require("constants/APL");

const APL_DOCUMENT_TYPE = APL_CONSTANTS.APL_DOCUMENT_TYPE;
const APL_DOCUMENT_VERSION = APL_CONSTANTS.APL_DOCUMENT_VERSION;

it("doesn't contain a card but contains an APL directive in the response if the device supports Alexa Presentation Language Interface", async () => {
  const event = require("../../test-data/apl_supported_intent_event");

  const response = await skill.handler(event);

  assert.notExists(response.response.card);

  expect(response.response.directives).to.have.lengthOf(1);
  const directive = response.response.directives[0];
  expect(Object.keys(directive)).to.have.lengthOf(4);
  expect(directive.type).to.equal(APL_DOCUMENT_TYPE);
  expect(directive.version).to.equal(APL_DOCUMENT_VERSION);
});

it("doesn't contain an APL directive but contains a card if the device does not support Alexa Presentation Language Interface", async () => {
  const event = require("../../test-data/apl_not_supported_intent_event");

  const response = await skill.handler(event);

  expect(Object.keys(response.response.card)).to.have.lengthOf(3);
  assert.notExists(response.response.directives);
});
