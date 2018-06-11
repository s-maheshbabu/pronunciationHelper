const unitUnderTest = require("../src/pronunciationHelper");

const expect = require("chai").expect;
const assert = require("chai").assert;
const sinon = require("sinon");
const decache = require("decache");

const genericEvent = require("../test-data/event").event;
const extraneousPhrases = require("../src/phrasesToStrip");

let context;

// The async/await pattern forces each test to wait until
// SpellChecker initialization is done.
// Need to revisit this. Is this the right thing to do? May
// be having some tests where the initialization hasn't
// happened will help because nspell will be made optional
// anyways in the source code.

afterEach(function() {
  decache("../test-data/event");
});

it("should increment the failure attempts count and reprompt the user if the spelling slot is missing altogether", async () => {
  const event = require("../test-data/event");
  event.request.intent.slots.Spelling = undefined;

  const response = await unitUnderTest.handler(event, context);

  const sessionAttributesUsed = response.sessionAttributes;
  expect(sessionAttributesUsed.numberOfFailedAttempts).to.equal(1);

  const responseUsed = response.response;
  assert(!responseUsed.shouldEndSession);

  const outputSpeech = responseUsed.outputSpeech;
  expect(outputSpeech.ssml).to.equal(
    "<speak>I didn't get that. Please try again.</speak>"
  );
  expect(outputSpeech.type).to.equal("SSML");

  const reprompt = responseUsed.reprompt;
  expect(reprompt.outputSpeech.ssml).to.equal(
    "<speak>I didn't get the word you were asking for. Please try again.</speak>"
  );
  expect(reprompt.outputSpeech.type).to.equal("SSML");

  const card = responseUsed.card;
  expect(card.title).to.equal("Pronunciations");
  expect(card.type).to.equal("Simple");
  expect(card.content).to.equal(
    "Am sorry, am having trouble understanding. Please try again."
  );
});

it("should increment the failure attempts count and reprompt the user if the spelling slot value is undefined", async () => {
  const event = require("../test-data/event");
  event.request.intent.slots.Spelling.value = undefined;

  const response = await unitUnderTest.handler(event, context);

  const sessionAttributesUsed = response.sessionAttributes;
  expect(sessionAttributesUsed.numberOfFailedAttempts).to.equal(1);

  const responseUsed = response.response;
  assert(!responseUsed.shouldEndSession);

  const outputSpeech = responseUsed.outputSpeech;
  expect(outputSpeech.ssml).to.equal(
    "<speak>I didn't get that. Please try again.</speak>"
  );
  expect(outputSpeech.type).to.equal("SSML");

  const reprompt = responseUsed.reprompt;
  expect(reprompt.outputSpeech.ssml).to.equal(
    "<speak>I didn't get the word you were asking for. Please try again.</speak>"
  );
  expect(reprompt.outputSpeech.type).to.equal("SSML");

  const card = responseUsed.card;
  expect(card.title).to.equal("Pronunciations");
  expect(card.type).to.equal("Simple");
  expect(card.content).to.equal(
    "Am sorry, am having trouble understanding. Please try again."
  );
});

it("should increment the failure attempts count in session attributes each time we receive an invalid or missing inputs and the last one is a missing input. If we are through the maximum number of attempts, we should render the right messages and exit.", async () => {
  const event = require("../test-data/event");
  const maxAttempts = 3;

  let currentAttempt = 0;
  let response;

  for (let i = 0; i < maxAttempts; i++) {
    currentAttempt++;
    event.request.intent.slots.Spelling.value = undefined;

    response = await unitUnderTest.handler(event, context);

    event.session.attributes = response.sessionAttributes;
  }

  // TODO: After refactoring, may be we can assert on the output of each invalid input.
  const sessionAttributesUsed = response.sessionAttributes;
  expect(sessionAttributesUsed.numberOfFailedAttempts).to.equal(maxAttempts);

  const responseUsed = response.response;
  assert(responseUsed.shouldEndSession);

  const outputSpeech = responseUsed.outputSpeech;
  expect(outputSpeech.ssml).to.equal(
    "<speak>Sorry, am having trouble understanding. Please try again later. Good bye.</speak>"
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

it("handles the AMAZON.HelpIntent properly", async () => {
  const event = require("../test-data/help_intent_event");

  const response = await unitUnderTest.handler(event, context);

  const sessionAttributesUsed = response.sessionAttributes;
  assert(
    Object.keys(sessionAttributesUsed).length === 0 &&
      sessionAttributesUsed.constructor === Object
  );

  const responseUsed = response.response;
  assert(!responseUsed.shouldEndSession);

  const outputSpeech = responseUsed.outputSpeech;
  expect(outputSpeech.ssml).to.equal(
    `<speak>I can help you pronounce English words in my accent. You just need to spell the word you need the pronunciation for. For example, you can say, pronounce B. I. T. S. <break time="100ms"/> and I will tell you that it is pronounced as bits. So go ahead and spell the word you want me to pronounce.</speak>`
  );
  expect(outputSpeech.type).to.equal("SSML");

  const reprompt = responseUsed.reprompt;
  expect(reprompt.outputSpeech.ssml).to.equal(
    "<speak>What word do you want the pronunciation for? You can say things like, what is the pronunciation for P. I. L. A. N. I.</speak>"
  );
  expect(reprompt.outputSpeech.type).to.equal("SSML");
});

it("should render an error message for unknown intents.", async () => {
  const event = require("../test-data/unknown_intent_event");

  const response = await unitUnderTest.handler(event, context);

  const sessionAttributesUsed = response.sessionAttributes;
  assert(
    Object.keys(sessionAttributesUsed).length === 0 &&
      sessionAttributesUsed.constructor === Object
  );

  const responseUsed = response.response;
  assert(!responseUsed.shouldEndSession);

  const outputSpeech = responseUsed.outputSpeech;
  expect(outputSpeech.ssml).to.equal(
    `<speak>Sorry, I didn't get that. Please try again.</speak>`
  );
  expect(outputSpeech.type).to.equal("SSML");

  const reprompt = responseUsed.reprompt;
  expect(reprompt.outputSpeech.ssml).to.equal(
    "<speak>Sorry, I didn't get that. Please try again.</speak>"
  );
  expect(reprompt.outputSpeech.type).to.equal("SSML");
});

it("handles the AMAZON.CancelIntent properly", async () => {
  const event = require("../test-data/cancel_intent_event");

  const response = await unitUnderTest.handler(event, context);

  const sessionAttributesUsed = response.sessionAttributes;
  assert(
    Object.keys(sessionAttributesUsed).length === 0 &&
      sessionAttributesUsed.constructor === Object
  );

  const responseUsed = response.response;
  assert(responseUsed.shouldEndSession);
  expect(responseUsed.outputSpeech).to.be.undefined;
  expect(responseUsed.reprompt).to.be.undefined;
});

it("handles the AMAZON.StopIntent properly", async () => {
  const event = require("../test-data/stop_intent_event");

  const response = await unitUnderTest.handler(event, context);

  const sessionAttributesUsed = response.sessionAttributes;
  assert(
    Object.keys(sessionAttributesUsed).length === 0 &&
      sessionAttributesUsed.constructor === Object
  );

  const responseUsed = response.response;
  assert(responseUsed.shouldEndSession);
  expect(responseUsed.outputSpeech).to.be.undefined;
  expect(responseUsed.reprompt).to.be.undefined;
});

it("should render the welcome message on launch requests", async () => {
  const event = require("../test-data/launch_request_event");

  const response = await unitUnderTest.handler(event, context);

  const sessionAttributesUsed = response.sessionAttributes;
  assert(
    Object.keys(sessionAttributesUsed).length === 0 &&
      sessionAttributesUsed.constructor === Object
  );

  const responseUsed = response.response;
  assert(!responseUsed.shouldEndSession);

  const outputSpeech = responseUsed.outputSpeech;
  expect(outputSpeech.ssml).to.equal(
    "<speak>Welcome to Pronunciations. You can say things like, pronounce B. I. T. S. So, what word do you want me to pronounce?</speak>"
  );
  expect(outputSpeech.type).to.equal("SSML");

  const reprompt = responseUsed.reprompt;
  expect(reprompt.outputSpeech.ssml).to.equal(
    "<speak>What word do you want the pronunciation for? You can say things like, what is the pronunciation for P. I. L. A. N. I.</speak>"
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

it("should spell the input and educate the user if the input is all lower case. All lower case input usually means that the user asked for the pronunciation of a word or a phrase instead of spelling out a word character by character.", async () => {
  const event = require("../test-data/event");
  const wordsWithLowerCaseCharacters = [
    "dog",
    "how are you",
    "how. are you _doing"
  ];

  for (let i = 0; i < wordsWithLowerCaseCharacters.length; i++) {
    event.request.intent.slots.Spelling.value = wordsWithLowerCaseCharacters[i];
    event.session.attributes = undefined;

    const response = await unitUnderTest.handler(event, context);

    const sessionAttributesUsed = response.sessionAttributes;
    assert(
      Object.keys(sessionAttributesUsed).length === 0 &&
        sessionAttributesUsed.constructor === Object
    );

    const responseUsed = response.response;
    assert(responseUsed.shouldEndSession);

    const outputSpeech = responseUsed.outputSpeech;
    expect(outputSpeech.ssml).to.equal(
      `<speak>I would pronounce it as ${
        wordsWithLowerCaseCharacters[i]
      }. By the way, I work best when you spell the word you want me to pronounce, instead of saying the entire word or phrase.</speak>`
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

it("should spell the words in the happy case", async () => {
  const event = require("../test-data/event");
  const wordsToBePronoucned = [
    ["DOG", "DOG"],
    ["   DOG", "DOG"],
    ["DOG   ", "DOG"],
    ["A", "A"],
    ["D.O.G.", "DOG"],
    ["D.O.G", "DOG"],
    ["D O G", "DOG"],
    ["          DO       G   ", "DOG"],
    ["          D. O       G   ", "DOG"],
    ["          D O       G    ", "DOG"]
  ];

  for (let i = 0; i < wordsToBePronoucned.length; i++) {
    event.request.intent.slots.Spelling.value = wordsToBePronoucned[i][0];
    const wordToBePronoucned = wordsToBePronoucned[i][1];

    const response = await unitUnderTest.handler(event, context);

    const sessionAttributesUsed = response.sessionAttributes;
    assert(
      Object.keys(sessionAttributesUsed).length === 0 &&
        sessionAttributesUsed.constructor === Object
    );

    const responseUsed = response.response;
    assert(responseUsed.shouldEndSession);

    const outputSpeech = responseUsed.outputSpeech;
    expect(outputSpeech.ssml).to.equal(
      "<speak>It is pronounced as " + wordToBePronoucned + ".</speak>"
    );
    expect(outputSpeech.type).to.equal("SSML");

    expect(responseUsed.reprompt).to.be.undefined;

    const card = responseUsed.card;
    expect(card.title).to.equal(`Pronunciation of '${wordToBePronoucned}'`);
    expect(card.type).to.equal("Simple");
    expect(card.content).to.equal(
      `Now that you know how to pronounce ${wordToBePronoucned}, you can ask Alexa for its meaning by saying "Alexa, define ${wordToBePronoucned}"`
    );
  }
});

it(`should render a less confident prompt when a misspelling is detected. This could be used fault or just Alexa hearing it wrong and so the response should be less confident from Alexa.`, async () => {
  const event = require("../test-data/event");
  const wordsWithIncorrectSpellings = [
    ["RETREIVE", "RETREIVE"],
    ["   REND  EZV UOS ", "RENDEZVUOS"],
    ["C.A.L.A.N.D.AR", "CALANDAR"],
    ["QU. EUEU     ", "QUEUEU"]
  ];

  for (let i = 0; i < wordsWithIncorrectSpellings.length; i++) {
    event.request.intent.slots.Spelling.value =
      wordsWithIncorrectSpellings[i][0];

    const wordToBePronoucned = wordsWithIncorrectSpellings[i][1];

    const response = await unitUnderTest.handler(event, context);

    const sessionAttributesUsed = response.sessionAttributes;
    assert(
      Object.keys(sessionAttributesUsed).length === 0 &&
        sessionAttributesUsed.constructor === Object
    );

    const responseUsed = response.response;
    assert(responseUsed.shouldEndSession);

    const outputSpeech = responseUsed.outputSpeech;
    expect(outputSpeech.ssml).to.equal(
      "<speak>I would pronounce it as " + wordToBePronoucned + ".</speak>"
    );
    expect(outputSpeech.type).to.equal("SSML");

    expect(responseUsed.reprompt).to.be.undefined;

    const card = responseUsed.card;
    expect(card.title).to.equal(`Pronunciation of '${wordToBePronoucned}'`);
    expect(card.type).to.equal("Simple");
    expect(card.content).to.equal(
      `Now that you know how to pronounce ${wordToBePronoucned}, you can ask Alexa for its meaning by saying "Alexa, define ${wordToBePronoucned}"`
    );
  }
});

it("should strip away extraneous phrases from the input and just pronounce the remaining word.", async () => {
  const event = require("../test-data/event");

  const wordToBePronoucned = "DOG";
  const inputs = [];
  for (let i = 0; i < extraneousPhrases.length; i++) {
    inputs.push(extraneousPhrases[i] + " " + wordToBePronoucned);
  }

  for (let i = 0; i < inputs.length; i++) {
    event.request.intent.slots.Spelling.value = inputs[i];

    const response = await unitUnderTest.handler(event, context);

    const sessionAttributesUsed = response.sessionAttributes;
    assert(
      Object.keys(sessionAttributesUsed).length === 0 &&
        sessionAttributesUsed.constructor === Object
    );

    const responseUsed = response.response;
    assert(responseUsed.shouldEndSession);

    const outputSpeech = responseUsed.outputSpeech;
    expect(outputSpeech.ssml).to.equal(
      "<speak>It is pronounced as " + wordToBePronoucned + ".</speak>"
    );
    expect(outputSpeech.type).to.equal("SSML");

    expect(responseUsed.reprompt).to.be.undefined;

    const card = responseUsed.card;
    expect(card.title).to.equal(`Pronunciation of '${wordToBePronoucned}'`);
    expect(card.type).to.equal("Simple");
    expect(card.content).to.equal(
      `Now that you know how to pronounce ${wordToBePronoucned}, you can ask Alexa for its meaning by saying "Alexa, define ${wordToBePronoucned}"`
    );
  }
});
