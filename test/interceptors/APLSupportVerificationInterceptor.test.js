const skill = require("../../src/index");
const expect = require("chai").expect;

it("sets the APL enabled flag to true if the device supports Alexa Presentation Language Interface", async () => {
  const event = require("../../test-data/apl_supported_intent_event");

  const response = await skill.handler(event);
  const sessionAttributesUsed = response.sessionAttributes;
  expect(sessionAttributesUsed.isAPLSupported).to.be.true;
});

it("leaves the APL enabled flag undefined if the device does not support Alexa Presentation Language Interface", async () => {
  const event = require("../../test-data/apl_not_supported_intent_event");

  const response = await skill.handler(event);
  const sessionAttributesUsed = response.sessionAttributes;
  expect(sessionAttributesUsed.isAPLSupported).to.be.undefined;
});
