const unitUnderTest = require("../src/index");

const expect = require("chai").expect;
const assert = require("chai").assert;
const decache = require("decache");

const extraneousPhrases = require("constants/PhrasesToStrip");
const STATES = require("constants/States").states;
const SpellChecker = require("spellcheck/SpellChecker");

const APL_DOCUMENT_TYPE = "Alexa.Presentation.APL.RenderDocument";
const APL_DOCUMENT_VERSION = "1.0";
const wordPronouncedDocument = require("apl/document/WordPronouncedDocument.json");
const wordPronouncedDatasource = require("apl/data/WordPronouncedDatasource");

const context = {};

before(async () => {
  await SpellChecker.init();
});

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
    `<speak>I can help you pronounce English words in my accent. You just need to spell the word you need the pronunciation for. For example, you can say, pronounce <say-as interpret-as="spell-out">BITS</say-as> <break time="100ms"/> and I will tell you that it is pronounced as bits. So go ahead and spell the word you want me to pronounce.</speak>`
  );
  expect(outputSpeech.type).to.equal("SSML");

  const reprompt = responseUsed.reprompt;
  expect(reprompt.outputSpeech.ssml).to.equal(
    `<speak>What word do you want the pronunciation for? You can say things like, what is the pronunciation for <say-as interpret-as="spell-out">PILANI</say-as></speak>`
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

it("handles the AMAZON.NoIntent properly", async () => {
  const event = require("../test-data/no_intent_event");

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
    `<speak>Welcome to Pronunciations. You can say things like, pronounce <say-as interpret-as="spell-out">BITS</say-as> <break time="100ms"/> So, what word do you want me to pronounce?</speak>`
  );
  expect(outputSpeech.type).to.equal("SSML");

  const reprompt = responseUsed.reprompt;
  expect(reprompt.outputSpeech.ssml).to.equal(
    `<speak>What word do you want the pronunciation for? You can say things like, what is the pronunciation for <say-as interpret-as="spell-out">PILANI</say-as></speak>`
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
    const wordToBePronounced = wordsToBePronoucned[i][1];

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
      "<speak>It is pronounced as " + wordToBePronounced + ".</speak>"
    );
    expect(outputSpeech.type).to.equal("SSML");

    expect(responseUsed.reprompt).to.be.undefined;

    const card = responseUsed.card;
    expect(card.title).to.equal(`Pronunciation of '${wordToBePronounced}'`);
    expect(card.type).to.equal("Simple");
    expect(card.content).to.equal(
      `Now that you know how to pronounce ${wordToBePronounced}, you can ask for its meaning by saying "Alexa, define ${wordToBePronounced}"`
    );

    verifyAPLDirectiveStructure(responseUsed.directives);
    const directive = responseUsed.directives[0];
    expect(directive.document).to.eql(wordPronouncedDocument);

    const actualDatasource = directive.datasources;
    expect(actualDatasource).to.eql(
      wordPronouncedDatasource(
        wordToBePronounced,
        `Now that you know how to pronounce ${wordToBePronounced}, you can ask Alexa for its meaning by saying "Alexa, define ${wordToBePronounced}"`
      )
    );
  }
});

it(`should render a less confident prompt when a misspelling is detected. This could be a user mistake or just Alexa hearing them wrong and so the response should be less confident. The session attributes should also be updated to allow spell correction`, async () => {
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

    const wordToBePronounced = wordsWithIncorrectSpellings[i][1];

    const response = await unitUnderTest.handler(event, context);

    const sessionAttributes = response.sessionAttributes;
    assert(sessionAttributes);
    expect(sessionAttributes.state).to.deep.equal(
      STATES.SUGGEST_CORRECT_SPELLINGS
    );
    expect(sessionAttributes.suggestedSpellings).to.deep.equal(
      SpellChecker.getSuggestedSpellings(wordToBePronounced)
    );

    const responseUsed = response.response;
    assert(!responseUsed.shouldEndSession);

    const outputSpeech = responseUsed.outputSpeech;
    expect(outputSpeech.ssml).to.equal(
      "<speak>I would pronounce it as " +
        wordToBePronounced +
        ". By the way, I have a feeling that I misheard you. I have some suggestions on what you might have been trying to pronounce. Do you want to hear them?</speak>"
    );
    expect(outputSpeech.type).to.equal("SSML");

    const repromptSpeech = responseUsed.reprompt.outputSpeech;
    expect(repromptSpeech.ssml).to.equal(
      "<speak>While I pronounced what I heard, I have a feeling that I either misheard you or you gave an incorrect spelling. I have some suggestions on what you might have been trying to pronounce. Do you want to hear them?</speak>"
    );
    expect(repromptSpeech.type).to.equal("SSML");

    const card = responseUsed.card;
    expect(card.title).to.equal(`Pronunciation of '${wordToBePronounced}'`);
    expect(card.type).to.equal("Simple");
    expect(card.content).to.equal(
      `Now that you know how to pronounce ${wordToBePronounced}, you can ask Alexa for its meaning by saying "Alexa, define ${wordToBePronounced}"`
    );
  }
});

it(`should render a less confident prompt but not offer to make suggestions when there are no suggestions that could be derived from the misspelled word.`, async () => {
  const event = require("../test-data/event");
  const misspelledWordWithoutSuggestions = "ASLIEJDINVJDUDN";

  event.request.intent.slots.Spelling.value = misspelledWordWithoutSuggestions;
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
    "<speak>I would pronounce it as " +
      misspelledWordWithoutSuggestions +
      ".</speak>"
  );
  expect(outputSpeech.type).to.equal("SSML");

  expect(responseUsed.reprompt).to.be.undefined;

  const card = responseUsed.card;
  expect(card.title).to.equal(
    `Pronunciation of '${misspelledWordWithoutSuggestions}'`
  );
  expect(card.type).to.equal("Simple");
  expect(card.content).to.equal(
    `Now that you know how to pronounce ${misspelledWordWithoutSuggestions}, you can ask Alexa for its meaning by saying "Alexa, define ${misspelledWordWithoutSuggestions}"`
  );
});

it(`should cycle through all available spell suggestions as the user keeps asking for them. When all suggestions are rendered, the session should be ended with an appropriate message.`, async () => {
  const event = require("../test-data/event");
  const wordToBePronounced = "SDOT";

  const spellSuggestions = SpellChecker.getSuggestedSpellings(
    wordToBePronounced
  );

  event.request.intent.slots.Spelling.value = wordToBePronounced;
  let response = await unitUnderTest.handler(event, context);

  let sessionAttributes = response.sessionAttributes;

  // Simulate user asking for spell suggestions. Maintain sessionAttributes from previous interaction.
  const yesEvent = require("../test-data/yes_intent_event");
  yesEvent.session.attributes = sessionAttributes;

  for (let index = 0; index < spellSuggestions.length; index++) {
    const suggestion = spellSuggestions[index];

    response = await unitUnderTest.handler(yesEvent, context);
    sessionAttributes = response.sessionAttributes;

    // Up until the last but one suggestion
    if (index < spellSuggestions.length - 1) {
      assert(sessionAttributes);
      expect(sessionAttributes.state).to.deep.equal(
        STATES.SUGGEST_CORRECT_SPELLINGS
      );
      expect(sessionAttributes.suggestedSpellings).to.deep.equal(
        spellSuggestions.slice(index + 1, spellSuggestions.length)
      );

      responseUsed = response.response;
      assert(!responseUsed.shouldEndSession);

      outputSpeech = responseUsed.outputSpeech;
      expect(outputSpeech.ssml).to.equal(
        '<speak>If you meant <say-as interpret-as="spell-out">' +
          suggestion +
          "</say-as>, it is pronounced as " +
          suggestion +
          ". Would you like to hear another suggestion?</speak>"
      );
      expect(outputSpeech.type).to.equal("SSML");

      repromptSpeech = responseUsed.reprompt.outputSpeech;
      expect(repromptSpeech.ssml).to.equal(
        "<speak>I have more suggestions. Would you like to hear them?</speak>"
      );
      expect(repromptSpeech.type).to.equal("SSML");

      // Maintain sessionAttributes from the previous interaction.
      yesEvent.session.attributes = sessionAttributes;
    } else {
      // While rendering the last suggestion.
      responseUsed = response.response;
      assert(responseUsed.shouldEndSession);

      outputSpeech = responseUsed.outputSpeech;
      expect(outputSpeech.ssml).to.equal(
        '<speak>If you meant <say-as interpret-as="spell-out">' +
          suggestion +
          "</say-as>, it is pronounced as " +
          suggestion +
          ".</speak>"
      );
      expect(outputSpeech.type).to.equal("SSML");
    }
  }
});

it(`should render an error message if we received a YesIntent but the session attributes are in an unexpected state.`, async () => {
  const yesEvent = require("../test-data/yes_intent_event");

  const invalidSessionAttributes = [];

  // Simulate the state in the session being undefined.
  const missingStateSessionAttributes = {};
  missingStateSessionAttributes.state = undefined;
  missingStateSessionAttributes.suggestedSpellings = ["SOMETHING"];
  invalidSessionAttributes.push(missingStateSessionAttributes);

  // Simulate the state in the session being invalid.
  const invalidStateSessionAttributes = {};
  invalidStateSessionAttributes.state = "UNEXPECTED_STATE";
  missingStateSessionAttributes.suggestedSpellings = ["SOMETHING"];
  invalidSessionAttributes.push(invalidStateSessionAttributes);

  // Simulate the suggestedSpellings in the session being undefined.
  const missingSuggestedSpellingsSessionAttributes = {};
  missingSuggestedSpellingsSessionAttributes.state =
    STATES.SUGGEST_CORRECT_SPELLINGS;
  missingSuggestedSpellingsSessionAttributes.suggestedSpellings = undefined;
  invalidSessionAttributes.push(missingSuggestedSpellingsSessionAttributes);

  // Simulate the suggestedSpellings in the session being an empty array.
  // It should have at least one suggestion.
  const emptySuggestedSpellingsSessionAttributes = {};
  emptySuggestedSpellingsSessionAttributes.state =
    STATES.SUGGEST_CORRECT_SPELLINGS;
  emptySuggestedSpellingsSessionAttributes.suggestedSpellings = [];
  invalidSessionAttributes.push(emptySuggestedSpellingsSessionAttributes);

  for (let index = 0; index < invalidSessionAttributes.length; index++) {
    const invalidSessionAttribute = invalidSessionAttributes[index];

    yesEvent.session.attributes = invalidSessionAttribute;

    let response = await unitUnderTest.handler(yesEvent, context);

    let responseUsed = response.response;
    assert(responseUsed.shouldEndSession);

    let outputSpeech = responseUsed.outputSpeech;
    expect(outputSpeech.ssml).to.equal(
      "<speak>Sorry, something went wrong. Please try again.</speak>"
    );
    expect(outputSpeech.type).to.equal("SSML");
    expect(responseUsed.reprompt).to.be.undefined;
  }
});

it("should strip away extraneous phrases from the input and just pronounce the remaining word.", async () => {
  const event = require("../test-data/event");

  const wordToBePronounced = "DOG";
  const inputs = [];
  for (let i = 0; i < extraneousPhrases.length; i++) {
    inputs.push(extraneousPhrases[i] + " " + wordToBePronounced);
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
      "<speak>It is pronounced as " + wordToBePronounced + ".</speak>"
    );
    expect(outputSpeech.type).to.equal("SSML");

    expect(responseUsed.reprompt).to.be.undefined;

    const card = responseUsed.card;
    expect(card.title).to.equal(`Pronunciation of '${wordToBePronounced}'`);
    expect(card.type).to.equal("Simple");
    expect(card.content).to.equal(
      `Now that you know how to pronounce ${wordToBePronounced}, you can ask for its meaning by saying "Alexa, define ${wordToBePronounced}"`
    );

    verifyAPLDirectiveStructure(responseUsed.directives);
    const directive = responseUsed.directives[0];
    expect(directive.document).to.eql(wordPronouncedDocument);

    const actualDatasource = directive.datasources;
    expect(actualDatasource).to.eql(
      wordPronouncedDatasource(
        wordToBePronounced,
        `Now that you know how to pronounce ${wordToBePronounced}, you can ask Alexa for its meaning by saying "Alexa, define ${wordToBePronounced}"`
      )
    );
  }
});

/**
 * Verify the structure of the APL directives. We check that we are sending exactly
 * one directive and that it is of the right type and version.
 */
function verifyAPLDirectiveStructure(directives) {
  expect(directives).is.not.null;
  expect(directives.length).is.equal(1);

  const directive = directives[0];
  expect(directive.type).to.equal(APL_DOCUMENT_TYPE);
  expect(directive.version).to.equal(APL_DOCUMENT_VERSION);
}
