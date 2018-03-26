const unitUnderTest = require("../src/pronunciationHelper");

const expect = require("chai").expect;
const assert = require("chai").assert;
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
  expect(reprompt.outputSpeech.ssml).to.equal(
    "<speak> I didn't get the word you were asking for. Please try again. </speak>"
  );
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
  expect(reprompt.outputSpeech.ssml).to.equal(
    "<speak> I didn't get the word you were asking for. Please try again. </speak>"
  );
  expect(reprompt.outputSpeech.type).to.equal("SSML");

  const card = responseUsed.card;
  expect(card.title).to.equal("Pronunciations");
  expect(card.type).to.equal("Simple");
  expect(card.content).to.equal(
    "Am sorry, am having trouble understanding. Please try again."
  );
});

it("should increment the failure attempts count in session attributes each time we receive an invalid or missing inputs and the last one is a missing input. If we are through the maximum number of attempts, we should render the right messages and exit..", function() {
  const event = require("../test-data/event");
  const maxAttempts = 3;

  let currentAttempt = 0;

  const succeedSpy = sinon.spy(context, "succeed");
  for (let i = 0; i < maxAttempts; i++) {
    currentAttempt++;
    event.request.intent.slots.Spelling.value = undefined;

    unitUnderTest.handler(event, context);

    const argumentWhenExiting = succeedSpy.args[i][0];
    event.session.attributes = argumentWhenExiting.sessionAttributes;
  }
  assert(succeedSpy.calledThrice);

  // TODO: After refactoring, may be we can assert on the output of each invalid input.
  const argumentWhenExiting = succeedSpy.args[2][0];
  const sessionAttributesUsed = argumentWhenExiting.sessionAttributes;
  expect(sessionAttributesUsed.numberOfFailedAttempts).to.equal(maxAttempts);

  const responseUsed = argumentWhenExiting.response;
  assert(responseUsed.shouldEndSession);

  const outputSpeech = responseUsed.outputSpeech;
  expect(outputSpeech.ssml).to.equal(
    "<speak> Sorry, am having trouble understanding. Please try again later. Good bye. </speak>"
  );
  expect(outputSpeech.type).to.equal("SSML");

  expect(responseUsed.reprompt).to.be.undefined;

  const card = responseUsed.card;
  expect(card.title).to.equal(`Pronunciations`);
  expect(card.type).to.equal("Simple");
  expect(card.content).to.equal(
    `Am sorry, am having trouble understanding. Please try again.`
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
    `<speak> I can help you pronounce English words in my accent. You just need to spell the word you need the pronunciation for. For example, you can say, pronounce B. I. T. S. <break time="100ms"/> and I will tell you that it is pronounced as bits. So go ahead and spell the word you want me to pronounce. </speak>`
  );
  expect(outputSpeech.type).to.equal("SSML");

  const reprompt = responseUsed.reprompt;
  expect(reprompt.outputSpeech.ssml).to.equal(
    "<speak> What word do you want the pronunciation for? You can say things like, what is the pronunciation for P. I. L. A. N. I. </speak>"
  );
  expect(reprompt.outputSpeech.type).to.equal("SSML");
});

it("should treat unknown intents like Amazon.HelpIntent", function() {
  const event = require("../test-data/unknown_intent_event");
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
    `<speak> I can help you pronounce English words in my accent. You just need to spell the word you need the pronunciation for. For example, you can say, pronounce B. I. T. S. <break time="100ms"/> and I will tell you that it is pronounced as bits. So go ahead and spell the word you want me to pronounce. </speak>`
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
  assert(responseUsed.shouldEndSession);

  const outputSpeech = responseUsed.outputSpeech;
  expect(outputSpeech.ssml).to.equal("<speak>  </speak>");
  expect(outputSpeech.type).to.equal("SSML");

  expect(responseUsed.reprompt).to.be.undefined;
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
  assert(responseUsed.shouldEndSession);

  const outputSpeech = responseUsed.outputSpeech;
  expect(outputSpeech.ssml).to.equal("<speak>  </speak>");
  expect(outputSpeech.type).to.equal("SSML");

  expect(responseUsed.reprompt).to.be.undefined;
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
    `Examples: 
    Pronounce D. O. G.
    How to pronounce B. I. T. S.
    What is the pronunciation for C. A. T.
    Ask pnonunciations to pronounce P. I. L. A. N. I.`
  );
});

it("should spell the input and educate the user if the input is a all lower case. All lower case input usually means that the user asked for the pronunciation of a word or a phrase instead of spelling out a word character by character.", function() {
  const event = require("../test-data/event");
  const wordsWithLowerCaseCharacters = [
    "dog",
    "how are you",
    "how. are you _doing"
  ];

  const succeedSpy = sinon.spy(context, "succeed");
  for (let i = 0; i < wordsWithLowerCaseCharacters.length; i++) {
    event.request.intent.slots.Spelling.value = wordsWithLowerCaseCharacters[i];
    event.session.attributes = undefined;

    succeedSpy.reset();
    unitUnderTest.handler(event, context);
    assert(succeedSpy.calledOnce);

    const argument = succeedSpy.args[0][0];
    const sessionAttributesUsed = argument.sessionAttributes;
    assert(
      Object.keys(sessionAttributesUsed).length === 0 &&
        sessionAttributesUsed.constructor === Object
    );

    const responseUsed = argument.response;
    assert(responseUsed.shouldEndSession);

    const outputSpeech = responseUsed.outputSpeech;
    expect(outputSpeech.ssml).to.equal(
      `<speak> I would pronounce it as ${
        wordsWithLowerCaseCharacters[i]
      }. By the way, I work best when you spell the word you want me to pronounce, instead of saying the entire word or phrase. </speak>`
    );
    expect(outputSpeech.type).to.equal("SSML");

    expect(responseUsed.reprompt).to.be.undefined;

    const card = responseUsed.card;
    expect(card.title).to.equal(
      `Pronunciation of '${wordsWithLowerCaseCharacters[i]}'`
    );
    expect(card.type).to.equal("Simple");
    expect(card.content).to.equal(
      `Now that you know how to pronounce '${
        wordsWithLowerCaseCharacters[i]
      }', you can ask Alexa for its meaning by saying "Alexa, define ${
        wordsWithLowerCaseCharacters[i]
      }". By the way, you might have tried to pronounce a word or a phrase but I work best when you spell the word you need pronunciation for. Say "Ask Pronunciations for help" to learn more.`
    );
  }
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
    assert(
      Object.keys(sessionAttributesUsed).length === 0 &&
        sessionAttributesUsed.constructor === Object
    );

    const responseUsed = argument.response;
    assert(responseUsed.shouldEndSession);

    const outputSpeech = responseUsed.outputSpeech;
    expect(outputSpeech.ssml).to.equal(
      "<speak> It is pronounced as " + wordToBePronoucned + ". </speak>"
    );
    expect(outputSpeech.type).to.equal("SSML");

    expect(responseUsed.reprompt).to.be.undefined;

    const card = responseUsed.card;
    expect(card.title).to.equal(`Pronunciation of ${wordToBePronoucned}`);
    expect(card.type).to.equal("Simple");
    expect(card.content).to.equal(
      `Now that you know how to pronounce ${wordToBePronoucned}, you can ask Alexa for its meaning by saying "Alexa, define ${wordToBePronoucned}"`
    );
  }
});

it(`should spell the word in case the input word has spaces and other special characters in it.`, function() {
  const event = require("../test-data/event");
  const wordsToBePronoucnedWithSpaces = [
    "D O G",
    "DOG   ",
    "   DOG",
    "          DO       G   ",
    "          D. O       G   ",
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
    assert(
      Object.keys(sessionAttributesUsed).length === 0 &&
        sessionAttributesUsed.constructor === Object
    );

    const responseUsed = argument.response;
    assert(responseUsed.shouldEndSession);

    const outputSpeech = responseUsed.outputSpeech;
    expect(outputSpeech.ssml).to.equal(
      "<speak> I would pronounce it as " + wordToBePronoucned + ". </speak>"
    );
    expect(outputSpeech.type).to.equal("SSML");

    expect(responseUsed.reprompt).to.be.undefined;

    const card = responseUsed.card;
    expect(card.title).to.equal(`Pronunciation of ${wordToBePronoucned}`);
    expect(card.type).to.equal("Simple");
    expect(card.content).to.equal(
      `Now that you know how to pronounce ${wordToBePronoucned}, you can ask Alexa for its meaning by saying "Alexa, define ${wordToBePronoucned}"`
    );
  }
});
