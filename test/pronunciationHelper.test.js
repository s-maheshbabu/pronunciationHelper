const unitUnderTest = require("../pronunciationHelper");

const expect = require("chai").expect;
const assert = require("chai").assert;
const mockery = require("mockery");
const sinon = require("sinon");

const vsprintf = require("sprintf-js").vsprintf;

const genericEvent = require("../test-data/event").event;
const launchRequestEvent = require("../test-data/launch_request_event").event;

let context;
let eventArgs;
beforeEach(function() {
  eventArgs = {
    mockApplicationId:
      "amzn1.echo-sdk-ams.app.22799827-aae1-4115-9b48-e2b74e33ee03"
  };

  context = {
    fail: function() {},
    succeed: function() {},
    done: function() {}
  };
});

it("should fail when we receive an incorrect applicationId", function() {
  eventArgs.mockApplicationId = "invalid application id";
  const event = JSON.parse(vsprintf(genericEvent, eventArgs));

  const failSpy = sinon.spy(context, "fail");

  unitUnderTest.handler(event, context);
  expect(failSpy.calledWith("Invalid Application ID")).to.be.true;
});

it("handles the AMAZON.HelpIntent properly", function() {
  const event = require("../test-data/help_intent_event");
  const succeedSpy = sinon.spy(context, "succeed");

  unitUnderTest.handler(event, context);

  assert(succeedSpy.calledOnce);

  const argument = succeedSpy.args[0][0];
  const sessionAttributesUsed = argument.sessionAttributes;
  assert(
    Object.keys(sessionAttributesUsed).length === 0 &&
      sessionAttributesUsed.constructor === Object
  );

  const responseUsed = argument.response;
  assert(!responseUsed.shouldEndSession);

  const outputSpeech = responseUsed.outputSpeech;
  expect(outputSpeech.ssml).to.equal(
    `<speak> I can help you pronounce English words in American accent. You just need to spell the word you need the pronunciation for. For example, you can say, pronounce B. I. T. S. <break time="100ms"/> and I will tell you that it is pronounced as bits. So what word do you want me to pronounce? </speak>`
  );
  expect(outputSpeech.type).to.equal("SSML");

  const reprompt = responseUsed.reprompt;
  expect(reprompt.outputSpeech.ssml).to.equal(
    "<speak> What word do you want the pronunciation for? You can say things like, what is the pronunciation for P. I. L. A. N. I. </speak>"
  );
  expect(reprompt.outputSpeech.type).to.equal("SSML");
});

it("handles the AMAZON.CancelIntent properly", function() {
  const event = require("../test-data/cancel_intent_event");
  const succeedSpy = sinon.spy(context, "succeed");

  unitUnderTest.handler(event, context);

  assert(succeedSpy.calledOnce);

  const argument = succeedSpy.args[0][0];
  const sessionAttributesUsed = argument.sessionAttributes;
  assert(
    Object.keys(sessionAttributesUsed).length === 0 &&
      sessionAttributesUsed.constructor === Object
  );

  const responseUsed = argument.response;
  console.log(responseUsed);
  assert(responseUsed.shouldEndSession);

  const outputSpeech = responseUsed.outputSpeech;
  expect(outputSpeech.ssml).to.equal("");
  expect(outputSpeech.type).to.equal("SSML");

  const reprompt = responseUsed.reprompt;
  expect(reprompt.outputSpeech.ssml).to.equal("");
  expect(reprompt.outputSpeech.type).to.equal("SSML");
});

it("handles the AMAZON.StopIntent properly", function() {
  const event = require("../test-data/stop_intent_event");
  const succeedSpy = sinon.spy(context, "succeed");

  unitUnderTest.handler(event, context);

  assert(succeedSpy.calledOnce);

  const argument = succeedSpy.args[0][0];
  const sessionAttributesUsed = argument.sessionAttributes;
  assert(
    Object.keys(sessionAttributesUsed).length === 0 &&
      sessionAttributesUsed.constructor === Object
  );

  const responseUsed = argument.response;
  console.log(responseUsed);
  assert(responseUsed.shouldEndSession);

  const outputSpeech = responseUsed.outputSpeech;
  expect(outputSpeech.ssml).to.equal("");
  expect(outputSpeech.type).to.equal("SSML");

  const reprompt = responseUsed.reprompt;
  expect(reprompt.outputSpeech.ssml).to.equal("");
  expect(reprompt.outputSpeech.type).to.equal("SSML");
});

it("should render the welcome message on launch requests", function() {
  const event = JSON.parse(vsprintf(launchRequestEvent, eventArgs));

  const succeedSpy = sinon.spy(context, "succeed");

  unitUnderTest.handler(event, context);
  assert(succeedSpy.calledOnce);

  const argument = succeedSpy.args[0][0];
  const sessionAttributesUsed = argument.sessionAttributes;
  assert(
    Object.keys(sessionAttributesUsed).length === 0 &&
      sessionAttributesUsed.constructor === Object
  );

  const responseUsed = argument.response;
  assert(!responseUsed.shouldEndSession);

  const outputSpeech = responseUsed.outputSpeech;
  expect(outputSpeech.ssml).to.equal(
    "<speak> Welcome to Pronunciations. You can say things like, pronounce B. I. T. S. </speak>"
  );
  expect(outputSpeech.type).to.equal("SSML");

  const reprompt = responseUsed.reprompt;
  expect(reprompt.outputSpeech.ssml).to.equal(
    "<speak> What word do you want the pronunciation for? You can say things like, what is the pronunciation for P. I. L. A. N. I. </speak>"
  );
  expect(reprompt.outputSpeech.type).to.equal("SSML");

  const card = responseUsed.card;
  expect(card.title).to.equal("Welcome to Pronunciations");
  expect(card.type).to.equal("Simple");
  expect(card.content).to.equal(
    "Examples: \nPronounce D. O. G.\nHow to pronounce B. I. T. S.\nWhat is the pronunciation for C. A. T.\nAsk pnonunciations to pronounce P. I. L. A. N. I.\n"
  );
});
