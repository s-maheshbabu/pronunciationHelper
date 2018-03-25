const unitUnderTest = require("../pronunciationHelper");

const expect = require("chai").expect;
const assert = require("chai").assert;
//TODO Is this even needed?
//const mockery = require("mockery");
const sinon = require("sinon");
const decache = require("decache");

const genericEvent = require("../test-data/event").event;

let context;
beforeEach(function() {
  context = {
    fail: function() {},
    succeed: function() {},
    done: function() {}
  };
});

afterEach(function() {
  decache("../test-data/event");
});

it("should fail when we receive an incorrect applicationId", function() {
  const event = require("../test-data/event");
  event.session.application.applicationId = "invalid application id";

  const failSpy = sinon.spy(context, "fail");

  unitUnderTest.handler(event, context);
  expect(failSpy.calledWith("Invalid Application ID")).to.be.true;
});

it("should fail when we receive an unknown intent", function() {
  const event = require("../test-data/unknown_intent_event");

  const failSpy = sinon.spy(context, "fail");

  unitUnderTest.handler(event, context);
  assert(failSpy.calledOnce);
});

it("should increment the failure attempts count and reprompt the user if the spelling slot is missing altogether", function() {
  const event = require("../test-data/event");
  event.request.intent.slots.Spelling = undefined;

  const succeedSpy = sinon.spy(context, "succeed");

  unitUnderTest.handler(event, context);
  assert(succeedSpy.calledOnce);

  const argument = succeedSpy.args[0][0];
  const sessionAttributesUsed = argument.sessionAttributes;
  expect(sessionAttributesUsed.numberOfFailedAttempts).to.equal(1);

  const responseUsed = argument.response;
  assert(!responseUsed.shouldEndSession);

  const outputSpeech = responseUsed.outputSpeech;
  expect(outputSpeech.ssml).to.equal(
    "<speak> I didn't get that. Please try again. </speak>"
  );
  expect(outputSpeech.type).to.equal("SSML");

  const reprompt = responseUsed.reprompt;
  expect(reprompt.outputSpeech.ssml).to.equal("");
  expect(reprompt.outputSpeech.type).to.equal("SSML");

  const card = responseUsed.card;
  expect(card.title).to.equal("Pronunciations");
  expect(card.type).to.equal("Simple");
  expect(card.content).to.equal(
    "Am sorry, am having trouble understanding. Please try again."
  );
});

it("should increment the failure attempts count and reprompt the user if the spelling slot value is undefined", function() {
  const event = require("../test-data/event");
  event.request.intent.slots.Spelling.value = undefined;

  const succeedSpy = sinon.spy(context, "succeed");

  unitUnderTest.handler(event, context);
  assert(succeedSpy.calledOnce);

  const argument = succeedSpy.args[0][0];
  const sessionAttributesUsed = argument.sessionAttributes;
  expect(sessionAttributesUsed.numberOfFailedAttempts).to.equal(1);

  const responseUsed = argument.response;
  assert(!responseUsed.shouldEndSession);

  const outputSpeech = responseUsed.outputSpeech;
  expect(outputSpeech.ssml).to.equal(
    "<speak> I didn't get that. Please try again. </speak>"
  );
  expect(outputSpeech.type).to.equal("SSML");

  const reprompt = responseUsed.reprompt;
  expect(reprompt.outputSpeech.ssml).to.equal("");
  expect(reprompt.outputSpeech.type).to.equal("SSML");

  const card = responseUsed.card;
  expect(card.title).to.equal("Pronunciations");
  expect(card.type).to.equal("Simple");
  expect(card.content).to.equal(
    "Am sorry, am having trouble understanding. Please try again."
  );
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
  const event = require("../test-data/launch_request_event");

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

it("should spell the words in the happy case", function() {
  const event = require("../test-data/event");
  const wordsToBePronoucned = ["DOG", "A", "D.O.G.", "D.O.G"];

  const succeedSpy = sinon.spy(context, "succeed");
  for (let i = 0; i < wordsToBePronoucned.length; i++) {
    const wordToBePronoucned = wordsToBePronoucned[i];
    event.request.intent.slots.Spelling.value = wordToBePronoucned;

    succeedSpy.reset();
    unitUnderTest.handler(event, context);
    assert(succeedSpy.calledOnce);

    const argument = succeedSpy.args[0][0];
    const sessionAttributesUsed = argument.sessionAttributes;
    expect(sessionAttributesUsed).to.be.undefined;

    const responseUsed = argument.response;
    assert(responseUsed.shouldEndSession);

    const outputSpeech = responseUsed.outputSpeech;
    expect(outputSpeech.ssml).to.equal(
      "<speak> It is pronounced as " + wordToBePronoucned + ". </speak>"
    );
    expect(outputSpeech.type).to.equal("SSML");

    const reprompt = responseUsed.reprompt;
    expect(reprompt.outputSpeech.ssml).to.equal("");
    expect(reprompt.outputSpeech.type).to.equal("SSML");

    const card = responseUsed.card;
    expect(card.title).to.equal(`Pronunciation of ${wordToBePronoucned}`);
    expect(card.type).to.equal("Simple");
    expect(card.content).to.equal(
      `Now that you know how to pronounce ${wordToBePronoucned}, you can ask Alexa for its meaning by saying "Alexa, define ${wordToBePronoucned}"`
    );
  }
});

it(`should spell the word in case the input word has spaces in it. This is actually the most common
case because Alexa usually returns a space separated slot value when users pronounce each character
separately which they do when they are asking for a pronunciation`, function() {
  const event = require("../test-data/event");
  const wordsToBePronoucnedWithSpaces = [
    "D O G",
    "DOG   ",
    "   DOG",
    "          DO       G   ",
    "          D O       G   ",
    "          D O       G    "
  ];
  const wordToBePronoucned = "DOG";

  const succeedSpy = sinon.spy(context, "succeed");
  for (let i = 0; i < wordsToBePronoucnedWithSpaces.length; i++) {
    event.request.intent.slots.Spelling.value =
      wordsToBePronoucnedWithSpaces[i];

    succeedSpy.reset();
    unitUnderTest.handler(event, context);
    assert(succeedSpy.calledOnce);

    const argument = succeedSpy.args[0][0];
    const sessionAttributesUsed = argument.sessionAttributes;
    expect(sessionAttributesUsed).to.be.undefined;

    const responseUsed = argument.response;
    assert(responseUsed.shouldEndSession);

    const outputSpeech = responseUsed.outputSpeech;
    expect(outputSpeech.ssml).to.equal(
      "<speak> I would pronounce it as " + wordToBePronoucned + ". </speak>"
    );
    expect(outputSpeech.type).to.equal("SSML");

    const reprompt = responseUsed.reprompt;
    expect(reprompt.outputSpeech.ssml).to.equal("");
    expect(reprompt.outputSpeech.type).to.equal("SSML");

    const card = responseUsed.card;
    expect(card.title).to.equal(`Pronunciation of ${wordToBePronoucned}`);
    expect(card.type).to.equal("Simple");
    expect(card.content).to.equal(
      `Now that you know how to pronounce ${wordToBePronoucned}, you can ask Alexa for its meaning by saying "Alexa, define ${wordToBePronoucned}"`
    );
  }
});
