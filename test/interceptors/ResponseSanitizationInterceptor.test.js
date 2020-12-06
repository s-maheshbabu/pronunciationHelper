const skill = require("../../src/index");
const expect = require("chai").expect;

const APL_DOCUMENT_TYPE = require("constants/APL").APL_DOCUMENT_TYPE;

it("retains APL directive in the response if the device supports Alexa Presentation Language Interface", async () => {
  const event = require("../../test-data/apl_supported_intent_event");

  const response = await skill.handler(event);

  const aplDirectives = extractAPLDirectives(response.response.directives);
  expect(aplDirectives.length).to.equal(1);
});

it("strips away APL directives if the device does not support Alexa Presentation Language Interface", async () => {
  const event = require("../../test-data/apl_not_supported_event");

  const response = await skill.handler(event);

  const aplDirectives = extractAPLDirectives(response.response.directives);
  expect(aplDirectives.length).to.equal(0);
});

function extractAPLDirectives(directives) {
  if (!Array.isArray(directives)) return [];

  const aplDirectives = [];
  directives.forEach(directive => {
    if (directive.type === APL_DOCUMENT_TYPE) aplDirectives.push(directive);
  });

  return aplDirectives;
}
