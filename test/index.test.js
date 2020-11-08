const unitUnderTest = require("../src/index");
const hasIn = require("immutable").hasIn;
const cloneDeep = require("lodash.clonedeep");
const deepEqual = require('deep-equal');
const importFresh = require('import-fresh');

const AlexaTest = require('ask-sdk-test').AlexaTest;
const IntentRequestBuilder = require('ask-sdk-test').IntentRequestBuilder;

const skillSettings = {
  appId: 'amzn1.ask.skill.00000000-0000-0000-0000-000000000000',
  userId: 'amzn1.ask.account.VOID',
  deviceId: 'amzn1.ask.device.VOID',
  locale: 'en-US',
  debug: true,
};
const alexaTest = new AlexaTest(unitUnderTest.handler, skillSettings);

const expect = require("chai").expect;
const assert = require("chai").assert;
const decache = require("decache");

const extraneousPhrases = require("constants/PhrasesToStrip");
const STATES = require("constants/States").states;
const APL_CONSTANTS = require("constants/APL");
const SpellChecker = require("spellcheck/SpellChecker");
const applinks = require("constants/Constants").applinks;
const ios = require("constants/Constants").ios;
const android = require("constants/Constants").android;

const SPELLING_SLOT = "Spelling";
const SPELLING_SLOT_TYPE = "ALL_WORDS";

const APL_DOCUMENT_TYPE = APL_CONSTANTS.APL_DOCUMENT_TYPE;
const APL_DOCUMENT_VERSION = APL_CONSTANTS.APL_DOCUMENT_VERSION;

const MAX_SPELL_SUGGESTIONS_TO_DISPLAY =
  APL_CONSTANTS.MAX_SPELL_SUGGESTIONS_TO_DISPLAY;

const wordPronouncedDocument = require("apl/document/WordPronouncedDocument.json");
const wordPronouncedDatasource = require("apl/data/WordPronouncedDatasource");

const skillInfoDocument = require("apl/document/SkillInfoDocument.json");
const skillInfoDatasource = require("apl/data/SkillInfoDatasource");

const context = {};

before(async () => {
  await SpellChecker.init();
});

afterEach(function () {
  decache("../test-data/event");
});

describe("Open a dictionary app or website after pronouncing the word in the happy case.", () => {
  describe('should launch dictionary webpage on APL supporting devices after pronouncing the word in the happy case.', () => {
    const wordToBePronounced = 'DOG';
    alexaTest.test([
      {
        request: new buildHowToPronounceIntent(wordToBePronounced, true),
        says: `It is pronounced as ${wordToBePronounced}. Shall I open the dictionary app for ${wordToBePronounced}?`,
        reprompts: `Shall I open the dictionary app for ${wordToBePronounced} so you can learn its meaning, synonyms etc.?`,
        shouldEndSession: false,
        hasAttributes: {
          state: STATES.OFFER_DICTIONARY_PUNCHOUT,
          word: wordToBePronounced,
        },
        renderDocument: {
          document: (doc) => {
            return deepEqual(doc, wordPronouncedDocument);
          },
          hasDataSources: {
            bodyTemplate2Data: (ds) => {
              const educativeVisualMessage = `Now that you know how to pronounce ${wordToBePronounced}, you can ask for its meaning by saying "Alexa, define ${wordToBePronounced}"`;
              return deepEqual(ds, wordPronouncedDatasource(wordToBePronounced, educativeVisualMessage).bodyTemplate2Data);
            },
          },
        },
      },
      {
        request: new buildYesIntent(true),
        says: `Okay.`,
        repromptsNothing: true,
        shouldEndSession: true,
        callback: (response) => {
          const openUrlDirective = response.response.directives[0];
          expect(openUrlDirective).to.eql({
            type: APL_CONSTANTS.APL_COMMANDS_TYPE,
            token: APL_CONSTANTS.WORD_PRONOUNCED_VIEW_TOKEN,
            commands: [{
              type: "OpenURL",
              source: `https://www.merriam-webster.com/dictionary/${wordToBePronounced}`,
              onFail: {}
            }],
          });
        },
      },
    ]);
  });

  describe('should handle gracefully if user declines the offer to have dictionary webpage launched on APL supporting devices.', () => {
    const wordToBePronounced = 'DOG';
    alexaTest.test([
      {
        request: new buildHowToPronounceIntent(wordToBePronounced, true),
        says: `It is pronounced as ${wordToBePronounced}. Shall I open the dictionary app for ${wordToBePronounced}?`,
        reprompts: `Shall I open the dictionary app for ${wordToBePronounced} so you can learn its meaning, synonyms etc.?`,
        shouldEndSession: false,
        hasAttributes: {
          state: STATES.OFFER_DICTIONARY_PUNCHOUT,
          word: wordToBePronounced,
        },
        renderDocument: {
          document: (doc) => {
            return deepEqual(doc, wordPronouncedDocument);
          },
          hasDataSources: {
            bodyTemplate2Data: (ds) => {
              const educativeVisualMessage = `Now that you know how to pronounce ${wordToBePronounced}, you can ask for its meaning by saying "Alexa, define ${wordToBePronounced}"`;
              return deepEqual(ds, wordPronouncedDatasource(wordToBePronounced, educativeVisualMessage).bodyTemplate2Data);
            },
          },
        },
      },
      {
        request: new buildNoIntent(true),
        says: `Okay.`,
        repromptsNothing: true,
        shouldEndSession: true,
      },
    ]);
  });

  describe('should launch dictionary app on -Alexa for Apps- Android/iOS devices after pronouncing the word in the happy case.', () => {
    const operatingSystems = [android, ios];
    const wordToBePronounced = 'DOG';

    operatingSystems.forEach(os => {
      const howToPronounceIntent = new buildHowToPronounceIntent(wordToBePronounced, false);
      addAppLinkSupport(howToPronounceIntent, os.STORE_TYPE);

      const yesIntent = new buildYesIntent(false);
      addAppLinkSupport(yesIntent, os.STORE_TYPE);

      alexaTest.test([
        {
          request: howToPronounceIntent,
          says: `It is pronounced as ${wordToBePronounced}. Shall I open the dictionary app for ${wordToBePronounced}?`,
          reprompts: `Shall I open the dictionary app for ${wordToBePronounced} so you can learn its meaning, synonyms etc.?`,
          shouldEndSession: false,
          hasAttributes: {
            state: STATES.OFFER_DICTIONARY_PUNCHOUT,
            word: wordToBePronounced,
          },
        },
        {
          request: yesIntent,
          says: `Okay.`,
          repromptsNothing: true,
          shouldEndSession: true,
          callback: (response) => {
            const appLinksDirective = response.response.directives[0];
            expect(appLinksDirective).to.eql(buildDictionaryAppLinkDirective(`https://www.merriam-webster.com/dictionary/${wordToBePronounced}`, os, 'Okay.', 'Please unlock your device to see the dictionary.'));
          },
        },
      ]);
    });
  });

  describe('should handle gracefully if user declines the offer to open dictionary app on -Alexa for Apps- devices.', () => {
    const operatingSystems = [android, ios];
    const wordToBePronounced = 'DOG';

    operatingSystems.forEach(os => {
      const howToPronounceIntent = new buildHowToPronounceIntent(wordToBePronounced, false);
      addAppLinkSupport(howToPronounceIntent, os.STORE_TYPE);

      const yesIntent = new buildYesIntent(false);
      addAppLinkSupport(yesIntent, os.STORE_TYPE);

      alexaTest.test([
        {
          request: howToPronounceIntent,
          says: `It is pronounced as ${wordToBePronounced}. Shall I open the dictionary app for ${wordToBePronounced}?`,
          reprompts: `Shall I open the dictionary app for ${wordToBePronounced} so you can learn its meaning, synonyms etc.?`,
          shouldEndSession: false,
          hasAttributes: {
            state: STATES.OFFER_DICTIONARY_PUNCHOUT,
            word: wordToBePronounced,
          },
        },
        {
          request: new buildNoIntent(true),
          says: `Okay.`,
          repromptsNothing: true,
          shouldEndSession: true,
        },
      ]);
    });
  });
});

it("should increment the failure attempts count and reprompt the user if the spelling slot is missing altogether", async () => {
  const events = getEventObjects("../test-data/event");

  for (let j = 0; j < events.length; j++) {
    let event = events[j];

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

    const visualMessage = `Sorry, I'm having trouble understanding. Please try again.`;
    if (hasAPLSupport(event)) {
      expect(sessionAttributesUsed.isAPLSupported).to.be.true;

      verifyAPLDirectiveStructure(responseUsed.directives);
      const directive = responseUsed.directives[0];
      expect(directive.document).to.eql(skillInfoDocument);

      const actualDatasource = directive.datasources;
      expect(actualDatasource).to.eql(
        skillInfoDatasource(``, visualMessage)
      );
    }
    else {
      const card = responseUsed.card;
      expect(card.title).to.equal("Pronunciations");
      expect(card.type).to.equal("Simple");
      expect(card.content).to.equal(visualMessage);
    }
  }
});

it("should increment the failure attempts count and reprompt the user if the spelling slot value is undefined", async () => {
  const events = getEventObjects("../test-data/event");

  for (let j = 0; j < events.length; j++) {
    let event = events[j];

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

    const visualMessage = `Sorry, I'm having trouble understanding. Please try again.`;
    if (hasAPLSupport(event)) {
      expect(sessionAttributesUsed.isAPLSupported).to.be.true;

      verifyAPLDirectiveStructure(responseUsed.directives);
      const directive = responseUsed.directives[0];
      expect(directive.document).to.eql(skillInfoDocument);

      const actualDatasource = directive.datasources;
      expect(actualDatasource).to.eql(
        skillInfoDatasource(``, visualMessage)
      );
    }
    else {
      const card = responseUsed.card;
      expect(card.title).to.equal("Pronunciations");
      expect(card.type).to.equal("Simple");
      expect(card.content).to.equal(
        visualMessage
      );
    }
  }
});

it("should increment the failure attempts count in session attributes each time we receive an invalid or missing inputs and the last one is a missing input. If we are through the maximum number of attempts, we should render the right messages and exit.", async () => {
  const maxAttempts = 3;

  const events = getEventObjects("../test-data/event");

  for (let j = 0; j < events.length; j++) {
    let event = events[j];

    let response;
    for (let i = 0; i < maxAttempts; i++) {
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
      "<speak>Sorry, I'm having trouble understanding. Please try again later. Good bye.</speak>"
    );
    expect(outputSpeech.type).to.equal("SSML");

    expect(responseUsed.reprompt).to.be.undefined;

    const visualMessage = `Sorry, I'm having trouble understanding. Please try again later. Good bye.`;
    if (hasAPLSupport(event)) {
      expect(sessionAttributesUsed.isAPLSupported).to.be.true;

      verifyAPLDirectiveStructure(responseUsed.directives);
      const directive = responseUsed.directives[0];
      expect(directive.document).to.eql(skillInfoDocument);

      const actualDatasource = directive.datasources;
      expect(actualDatasource).to.eql(
        skillInfoDatasource(``, visualMessage)
      );
    }
    else {
      const card = responseUsed.card;
      expect(card.title).to.equal(`Pronunciations`);
      expect(card.type).to.equal("Simple");
      expect(card.content).to.equal(visualMessage);
    }
  }
});

it("handles the AMAZON.HelpIntent properly", async () => {
  const event = require("../test-data/help_intent_event");

  const response = await unitUnderTest.handler(event, context);

  const sessionAttributesUsed = response.sessionAttributes;
  expect(sessionAttributesUsed.isAPLSupported).to.be.true;

  const responseUsed = response.response;
  assert(!responseUsed.shouldEndSession);

  const outputSpeech = responseUsed.outputSpeech;
  expect(outputSpeech.ssml).to.equal(
    `<speak>I can help you pronounce English words in my accent. You just need to spell the word you need the pronunciation for. For example, you can say, pronounce <say-as interpret-as="spell-out">BITS</say-as> <break time="100ms"/> and I will tell you that it is pronounced as bits. So go ahead and spell the word you want me to pronounce.</speak>`
  );
  expect(outputSpeech.type).to.equal("SSML");

  const reprompt = responseUsed.reprompt;
  expect(reprompt.outputSpeech.ssml).to.equal(
    `<speak>What word do you want the pronunciation for? You can say things like, what is the pronunciation for <say-as interpret-as="spell-out">ROBOT</say-as></speak>`
  );
  expect(reprompt.outputSpeech.type).to.equal("SSML");

  verifyAPLDirectiveStructure(responseUsed.directives);
  const directive = responseUsed.directives[0];
  expect(directive.document).to.eql(wordPronouncedDocument);

  const actualDatasource = directive.datasources;
  expect(actualDatasource).to.eql(
    skillInfoDatasource(
      `I can help you with the pronunciations of English words and phrases. Just spell the word you want me to pronounce. For example, you can say - `,
      `Alexa, open pronunciations
Alexa, ask pronunciations to pronounce G. Y. R. O.
Alexa, open pronunciations and help me pronounce W. A. L. T.
Alexa, pronounce the word D. O. U. B. T.`
    )
  );
});

it("should render an error message for unknown intents.", async () => {
  const event = require("../test-data/unknown_intent_event");

  const response = await unitUnderTest.handler(event, context);

  const sessionAttributesUsed = response.sessionAttributes;
  expect(sessionAttributesUsed.isAPLSupported).to.be.true;

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
  expect(sessionAttributesUsed.isAPLSupported).to.be.true;

  const responseUsed = response.response;
  assert(responseUsed.shouldEndSession);
  expect(responseUsed.outputSpeech).to.be.undefined;
  expect(responseUsed.reprompt).to.be.undefined;
});

it("handles the AMAZON.NoIntent properly", async () => {
  const event = require("../test-data/no_intent_event");

  const response = await unitUnderTest.handler(event, context);
  const responseUsed = response.response;

  assert(responseUsed.shouldEndSession);

  outputSpeech = responseUsed.outputSpeech;
  expect(outputSpeech.ssml).to.equal(
    '<speak>Okay.</speak>'
  );
  expect(outputSpeech.type).to.equal("SSML");
});

it("handles the AMAZON.StopIntent properly", async () => {
  const event = require("../test-data/stop_intent_event");

  const response = await unitUnderTest.handler(event, context);

  const sessionAttributesUsed = response.sessionAttributes;
  expect(sessionAttributesUsed.isAPLSupported).to.be.true;

  const responseUsed = response.response;
  assert(responseUsed.shouldEndSession);
  expect(responseUsed.outputSpeech).to.be.undefined;
  expect(responseUsed.reprompt).to.be.undefined;
});

it("should render the welcome message on launch requests", async () => {
  const events = getEventObjects("../test-data/launch_request_event");

  for (let j = 0; j < events.length; j++) {
    let event = events[j];
    const response = await unitUnderTest.handler(event, context);

    const sessionAttributesUsed = response.sessionAttributes;

    const responseUsed = response.response;
    assert(!responseUsed.shouldEndSession);

    const outputSpeech = responseUsed.outputSpeech;
    expect(outputSpeech.ssml).to.equal(
      `<speak>Welcome to Pronunciations. You can say things like, pronounce <say-as interpret-as="spell-out">BITS</say-as> <break time="100ms"/> So, what word do you want me to pronounce?</speak>`
    );
    expect(outputSpeech.type).to.equal("SSML");

    const reprompt = responseUsed.reprompt;
    expect(reprompt.outputSpeech.ssml).to.equal(
      `<speak>What word do you want the pronunciation for? You can say things like, what is the pronunciation for <say-as interpret-as="spell-out">ROBOT</say-as></speak>`
    );
    expect(reprompt.outputSpeech.type).to.equal("SSML");

    if (hasAPLSupport(event)) {
      expect(sessionAttributesUsed.isAPLSupported).to.be.true;

      verifyAPLDirectiveStructure(responseUsed.directives);
      const directive = responseUsed.directives[0];
      expect(directive.document).to.eql(wordPronouncedDocument);

      const actualDatasource = directive.datasources;
      expect(actualDatasource).to.eql(
        skillInfoDatasource(
          `I can help you with the pronunciations of English words and phrases. Just spell the word you want me to pronounce. For example, you can say - `,
          `Alexa, open pronunciations
Alexa, ask pronunciations to pronounce G. Y. R. O.
Alexa, open pronunciations and help me pronounce W. A. L. T.
Alexa, pronounce the word D. O. U. B. T.`
        )
      );
    }
    else {
      assert(
        Object.keys(sessionAttributesUsed).length === 0 &&
        sessionAttributesUsed.constructor === Object
      );

      const card = responseUsed.card;
      expect(card.title).to.equal("Welcome to Pronunciations");
      expect(card.type).to.equal("Simple");
      expect(card.content).to.equal(
        `Examples:
Pronounce D. O. G.
How to pronounce B. I. T. S.
What is the pronunciation for C. A. T.
Ask pnonunciations to pronounce A. L. E. X. A.`
      );
    }
  }
});

it("should spell the input and educate the user if the input is all lower case. All lower case input usually means that the user asked for the pronunciation of a word or a phrase instead of spelling out a word character by character.", async () => {
  const wordsWithLowerCaseCharacters = [
    "dog",
    "how are you",
    "how. are you _doing"
  ];

  const events = getEventObjects("../test-data/event");

  for (let j = 0; j < events.length; j++) {
    let event = events[j];

    for (let i = 0; i < wordsWithLowerCaseCharacters.length; i++) {
      event.request.intent.slots.Spelling.value = wordsWithLowerCaseCharacters[i];
      event.session.attributes = undefined;

      const response = await unitUnderTest.handler(event, context);

      const sessionAttributesUsed = response.sessionAttributes;

      const responseUsed = response.response;
      assert(responseUsed.shouldEndSession);

      const outputSpeech = responseUsed.outputSpeech;
      expect(outputSpeech.ssml).to.equal(
        `<speak>I would pronounce it as ${wordsWithLowerCaseCharacters[i]
        }. By the way, I work best when you spell the word you want me to pronounce, instead of saying the entire word or phrase.</speak>`
      );
      expect(outputSpeech.type).to.equal("SSML");

      expect(responseUsed.reprompt).to.be.undefined;

      const educativeVisualMessage = `Now that you know how to pronounce '${wordsWithLowerCaseCharacters[i]
        }', you can ask Alexa for its meaning by saying "Alexa, define ${wordsWithLowerCaseCharacters[i]
        }".

By the way, you might have tried to pronounce a word or a phrase but I work best when you spell the word you need pronunciation for. Say "Ask Pronunciations for help" to learn more.`;

      if (hasAPLSupport(event)) {
        expect(sessionAttributesUsed.isAPLSupported).to.be.true;

        verifyAPLDirectiveStructure(responseUsed.directives);
        const directive = responseUsed.directives[0];
        expect(directive.document).to.eql(wordPronouncedDocument);

        const actualDatasource = directive.datasources;
        expect(actualDatasource).to.eql(
          wordPronouncedDatasource(
            wordsWithLowerCaseCharacters[i],
            educativeVisualMessage
          )
        );
      }
      else {
        assert(
          Object.keys(sessionAttributesUsed).length === 0 &&
          sessionAttributesUsed.constructor === Object
        );

        const card = responseUsed.card;
        expect(card.title).to.equal(
          `Pronunciation of '${wordsWithLowerCaseCharacters[i]}'`
        );
        expect(card.type).to.equal("Simple");
        expect(card.content).to.equal(educativeVisualMessage);
      }
    }
  }
});

it("should spell the words in the happy case", async () => {
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
    ["          D O       G    ", "DOG"],
    ["D. E. ma. N. d.", "DEMAND"],
    ["D. e. m. a. n. d.", "DEMAND"],
    ["D. emAn. D.", "DEMAND"],
    ["d. E. M. A. N. D.", "DEMAND"],
    ["D. E. M. A. nd", "DEMAND"]
  ];

  const event = importFresh("../test-data/apl_not_supported_event");

  for (let i = 0; i < wordsToBePronoucned.length; i++) {
    event.request.intent.slots.Spelling.value = wordsToBePronoucned[i][0];
    const wordToBePronounced = wordsToBePronoucned[i][1];

    const response = await unitUnderTest.handler(event, context);
    const responseUsed = response.response;
    assert(responseUsed.shouldEndSession);

    const outputSpeech = responseUsed.outputSpeech;
    expect(outputSpeech.ssml).to.equal(
      "<speak>It is pronounced as " + wordToBePronounced + ".</speak>"
    );
    expect(outputSpeech.type).to.equal("SSML");

    expect(responseUsed.reprompt).to.be.undefined;

    const sessionAttributesUsed = response.sessionAttributes;
    const educativeVisualMessage = `Now that you know how to pronounce ${wordToBePronounced}, you can ask for its meaning by saying "Alexa, define ${wordToBePronounced}"`;
    assert(
      Object.keys(sessionAttributesUsed).length === 0 &&
      sessionAttributesUsed.constructor === Object
    );

    const card = responseUsed.card;
    expect(card.title).to.equal(`Pronunciation of '${wordToBePronounced}'`);
    expect(card.type).to.equal("Simple");
    expect(card.content).to.equal(educativeVisualMessage);
  }
});

it(`should render a less confident prompt when a misspelling is detected. This could be a user mistake or just Alexa hearing them wrong and so the response should be less confident. The session attributes should also be updated to allow spell correction`, async () => {
  const wordsWithIncorrectSpellings = [
    ["RETREIVE", "RETREIVE"],
    ["CORT", "CORT"],
    ["   REND  EZV UOS ", "RENDEZVUOS"],
    ["C.A.L.A.N.D.AR", "CALANDAR"],
    ["QU. EUEU     ", "QUEUEU"]
  ];

  const events = getEventObjects("../test-data/event");

  for (let j = 0; j < events.length; j++) {
    let event = events[j];

    for (let i = 0; i < wordsWithIncorrectSpellings.length; i++) {
      event.request.intent.slots.Spelling.value =
        wordsWithIncorrectSpellings[i][0];

      const wordToBePronounced = wordsWithIncorrectSpellings[i][1];
      const suggestedSpellings = SpellChecker.getSuggestedSpellings(
        wordToBePronounced
      );

      const response = await unitUnderTest.handler(event, context);

      const sessionAttributes = response.sessionAttributes;
      assert(sessionAttributes);
      expect(sessionAttributes.state).to.deep.equal(
        STATES.SUGGEST_CORRECT_SPELLINGS
      );
      expect(sessionAttributes.suggestedSpellings).to.deep.equal(
        suggestedSpellings
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

      if (hasAPLSupport(event)) {
        expect(sessionAttributes.isAPLSupported).to.be.true;

        verifyAPLDirectiveStructure(responseUsed.directives);
        const directive = responseUsed.directives[0];
        expect(directive.document).to.eql(wordPronouncedDocument);

        const actualDatasource = directive.datasources;
        expect(actualDatasource).to.eql(
          wordPronouncedDatasource(
            wordToBePronounced,
            `I have a feeling I misheard you though. Here are some words that are similar to what I heard. Do you want me to pronounce them?`,
            topSuggestedSpellings(
              suggestedSpellings,
              MAX_SPELL_SUGGESTIONS_TO_DISPLAY
            )
          )
        );
      }
      else {
        const card = responseUsed.card;
        expect(card.title).to.equal(`Pronunciation of '${wordToBePronounced}'`);
        expect(card.type).to.equal("Simple");
        expect(card.content).to.equal(
          `Now that you know how to pronounce ${wordToBePronounced}, you can ask Alexa for its meaning by saying "Alexa, define ${wordToBePronounced}"`
        );
      }
    }
  }
});

it(`should render a less confident prompt but not offer to make suggestions when there are no suggestions that could be derived from the misspelled word.`, async () => {
  const misspelledWordWithoutSuggestions = "ASLIEJDINVJDUDN";

  const events = getEventObjects("../test-data/event");

  for (let j = 0; j < events.length; j++) {
    let event = events[j];

    event.request.intent.slots.Spelling.value = misspelledWordWithoutSuggestions;
    const response = await unitUnderTest.handler(event, context);

    const sessionAttributesUsed = response.sessionAttributes;

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

    if (hasAPLSupport(event)) {
      expect(sessionAttributesUsed.isAPLSupported).to.be.true;

      verifyAPLDirectiveStructure(responseUsed.directives);
      const directive = responseUsed.directives[0];
      expect(directive.document).to.eql(wordPronouncedDocument);

      const actualDatasource = directive.datasources;
      expect(actualDatasource).to.eql(
        wordPronouncedDatasource(
          misspelledWordWithoutSuggestions,
          `To be honest, I don't recognize this word but I pronounced it anyways because you asked for it.`
        )
      );
    }
    else {
      assert(
        Object.keys(sessionAttributesUsed).length === 0 &&
        sessionAttributesUsed.constructor === Object
      );

      const card = responseUsed.card;
      expect(card.title).to.equal(
        `Pronunciation of '${misspelledWordWithoutSuggestions}'`
      );
      expect(card.type).to.equal("Simple");
      expect(card.content).to.equal(
        `Now that you know how to pronounce ${misspelledWordWithoutSuggestions}, you can ask Alexa for its meaning by saying "Alexa, define ${misspelledWordWithoutSuggestions}"`
      );
    }
  }
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

    const responseUsed = response.response;
    verifyAPLDirectiveStructure(responseUsed.directives);
    const directive = responseUsed.directives[0];
    expect(directive.document).to.eql(wordPronouncedDocument);

    // Up until the last but one suggestion
    if (index < spellSuggestions.length - 1) {
      assert(sessionAttributes);
      expect(sessionAttributes.state).to.deep.equal(
        STATES.SUGGEST_CORRECT_SPELLINGS
      );
      expect(sessionAttributes.suggestedSpellings).to.deep.equal(
        spellSuggestions.slice(index + 1, spellSuggestions.length)
      );

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

      const actualDatasource = directive.datasources;
      expect(actualDatasource).to.eql(
        wordPronouncedDatasource(
          suggestion,
          `Here are more words that are similar to what I originally heard. Do you want me to pronounce them?`,
          topSuggestedSpellings(
            sessionAttributes.suggestedSpellings,
            MAX_SPELL_SUGGESTIONS_TO_DISPLAY
          )
        )
      );
    } else {
      // While rendering the last suggestion.
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

      const actualDatasource = directive.datasources;
      expect(actualDatasource).to.eql(
        wordPronouncedDatasource(
          suggestion,
          `Now that you know how to pronounce ${suggestion}, you can ask Alexa for its meaning by saying "Alexa, define ${suggestion}"`,
          `Thank you for using pronunciations.`
        )
      );
    }
  }
});

it(`should cycle through available spell suggestions as the user keeps asking for them but should abort when the user indicates they don't want anymore suggestions.`, async () => {
  const event = require("../test-data/event");
  const wordToBePronounced = "SDOT";

  const spellSuggestions = SpellChecker.getSuggestedSpellings(
    wordToBePronounced
  );

  event.request.intent.slots.Spelling.value = wordToBePronounced;
  let response = await unitUnderTest.handler(event, context);

  let sessionAttributes = response.sessionAttributes;

  // Simulate user asking for spell suggestions except the last one.
  const NUMBER_OF_SUGGESTIONS_REQUESTED = spellSuggestions.length - 1;
  const yesEvent = require("../test-data/yes_intent_event");
  yesEvent.session.attributes = sessionAttributes;

  for (let index = 0; index < NUMBER_OF_SUGGESTIONS_REQUESTED; index++) {
    response = await unitUnderTest.handler(yesEvent, context);
    sessionAttributes = response.sessionAttributes;

    // Maintain sessionAttributes from the previous interaction.
    // Not doing any assertions on the response itself because that is already tested in other tests.
    yesEvent.session.attributes = sessionAttributes;
  }

  // Simulate user saying they don't want any more suggestions.
  const noEvent = require("../test-data/no_intent_event");
  noEvent.session.attributes = sessionAttributes;

  response = await unitUnderTest.handler(noEvent, context);
  const responseUsed = response.response;

  assert(responseUsed.shouldEndSession);

  outputSpeech = responseUsed.outputSpeech;
  expect(outputSpeech.ssml).to.equal(
    '<speak>Okay.</speak>'
  );
  expect(outputSpeech.type).to.equal("SSML");
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
  const wordToBePronounced = "DOG";
  const inputs = [];
  for (let i = 0; i < extraneousPhrases.length; i++) {
    inputs.push(extraneousPhrases[i] + " " + wordToBePronounced);
  }

  const events = getEventObjects("../test-data/event");

  for (let j = 0; j < events.length; j++) {
    let event = events[j];

    for (let i = 0; i < inputs.length; i++) {
      event.request.intent.slots.Spelling.value = inputs[i];

      const response = await unitUnderTest.handler(event, context);

      const sessionAttributesUsed = response.sessionAttributes;

      const responseUsed = response.response;

      const outputSpeech = responseUsed.outputSpeech;

      const educativeVisualMessage = `Now that you know how to pronounce ${wordToBePronounced}, you can ask for its meaning by saying "Alexa, define ${wordToBePronounced}"`;
      if (hasAPLSupport(event)) {
        assert(!responseUsed.shouldEndSession);
        expect(sessionAttributesUsed.isAPLSupported).to.be.true;

        expect(outputSpeech.ssml).to.equal(
          `<speak>It is pronounced as ${wordToBePronounced}. Shall I open the dictionary app for ${wordToBePronounced}?</speak>`
        );
        expect(outputSpeech.type).to.equal("SSML");
        expect(responseUsed.reprompt.outputSpeech.ssml).to.equal(`<speak>Shall I open the dictionary app for ${wordToBePronounced} so you can learn its meaning, synonyms etc.?</speak>`);

        const sessionAttributes = response.sessionAttributes;
        expect(sessionAttributes.state).to.deep.equal(
          STATES.OFFER_DICTIONARY_PUNCHOUT
        );
        expect(sessionAttributes.word).to.deep.equal(
          wordToBePronounced
        );

        verifyAPLDirectiveStructure(responseUsed.directives);
        const directive = responseUsed.directives[0];
        expect(directive.document).to.eql(wordPronouncedDocument);

        const actualDatasource = directive.datasources;
        expect(actualDatasource).to.eql(
          wordPronouncedDatasource(wordToBePronounced, educativeVisualMessage)
        );
      }
      else {
        assert(responseUsed.shouldEndSession);

        expect(outputSpeech.ssml).to.equal(
          "<speak>It is pronounced as " + wordToBePronounced + ".</speak>"
        );
        expect(outputSpeech.type).to.equal("SSML");
        expect(responseUsed.reprompt).to.be.undefined;

        assert(
          Object.keys(sessionAttributesUsed).length === 0 &&
          sessionAttributesUsed.constructor === Object
        );
      }

      const card = responseUsed.card;
      expect(card.title).to.equal(`Pronunciation of '${wordToBePronounced}'`);
      expect(card.type).to.equal("Simple");
      expect(card.content).to.equal(educativeVisualMessage);
    }
  }
});

/**
 * ask-sdk-test module currently does not support AppLinks interface. So, for the time being,
 * this method adds AppLinks to the request objects built using ask-sdk-test.
 * Once this issue is resolved, this function should be removed and we should use the ask-sdk-test module
 * to build intents with AppLinks support.
 * https://github.com/taimos/ask-sdk-test/issues/19
 * @param {*} intent the object to which app links support should be added
 * @param {*} catalogType android | ios
 */
function addAppLinkSupport(intent, catalogType) {
  intent.context[applinks.APP_LINK_INTERFACE] = {
    supportedCatalogTypes: [
      catalogType
    ]
  };
}

/**
 * Builds the app link directive.
 * @param {*} link the universal link to punch out to
 * @param {*} os android | ios
 * @param {*} unlockedScreenSpeech to be rendered when the screen is unlocked
 * @param {*} lockedScreenSpeech  to be rendered when the screen is locked
 */
function buildDictionaryAppLinkDirective(link, os, unlockedScreenSpeech, lockedScreenSpeech) {
  return {
    type: "Connections.StartConnection",
    uri: "connection://AMAZON.LinkApp/1",
    input: {
      catalogInfo: {
        identifier: os.DICTIONARY_IDENTIFIER,
        type: os.STORE_TYPE,
      },
      actions: {
        primary: {
          type: "UNIVERSAL_LINK",
          link: link
        }
      },
      prompts: {
        onAppLinked: {
          prompt: {
            ssml: `<speak>${unlockedScreenSpeech}</speak>`,
            type: "SSML"
          },
          defaultPromptBehavior: "SPEAK"
        },
        onScreenLocked: {
          prompt: {
            ssml: `<speak>${lockedScreenSpeech}</speak>`,
            type: "SSML"
          }
        }
      }
    }
  }
}

function buildHowToPronounceIntent(wordToBePronounced, isAplDevice = false) {
  const howToPronounceIntent = new IntentRequestBuilder(skillSettings, 'HowToPronounceIntent')
    .withInterfaces({ apl: isAplDevice })
    .withSlotResolution(SPELLING_SLOT, wordToBePronounced, SPELLING_SLOT_TYPE, "entity resolution that does not matter").build();

  return howToPronounceIntent;
}

function buildYesIntent(isAplDevice = false) {
  const yesIntent = new IntentRequestBuilder(skillSettings, 'AMAZON.YesIntent')
    .withInterfaces({ apl: isAplDevice }).build();

  return yesIntent;
}

function buildNoIntent(isAplDevice = false) {
  const noIntent = new IntentRequestBuilder(skillSettings, 'AMAZON.NoIntent')
    .withInterfaces({ apl: isAplDevice }).build();

  return noIntent;
}

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

/**
 * Returns a string that is a comma separated list of top suggestions.
 * @param suggestedSpellings The complete list of spellings. Should be a non-empty array.
 * @param numberOfSuggestions The number of top spellings to extract. This should be a
 * positive number. If the number is larger than the size of all spellings available, we
 * will return all spellings.
 */
function topSuggestedSpellings(suggestedSpellings, numberOfSuggestions) {
  if (
    !Array.isArray(suggestedSpellings) ||
    !suggestedSpellings.length ||
    numberOfSuggestions <= 0
  )
    throw `Invalid inputs. suggestedSpellings = ${suggestedSpellings}. numberOfSuggestions = ${numberOfSuggestions}.`;

  let result = "";
  for (
    var i = 0;
    i < numberOfSuggestions && i < suggestedSpellings.length;
    i++
  ) {
    result += suggestedSpellings[i] + ", ";
  }

  return result.substring(0, result.length - 2);
}



/*
Alexa supports Alexa Presentation Language (APL) on only a few devices and
so there is a fork in the code to issue APL directives for devices that support
APL and plain old cards for other devices. This test method generates an array
of two events simulating devices with and without APL support.
*/
function getEventObjects(path) {
  // Events by default are configured to have APL support.
  const event = require(path);

  // Build an event object without APL support.
  const eventWithoutAPLSupport = cloneDeep(event);
  delete eventWithoutAPLSupport.context.System.device.supportedInterfaces["Alexa.Presentation.APL"];

  return [event, eventWithoutAPLSupport];
}

/*
Helper fucntion to tell if APL is supported.
*/
function hasAPLSupport(event) {
  if (
    hasIn(event, [
      "context",
      "System",
      "device",
      "supportedInterfaces",
      "Alexa.Presentation.APL"
    ])
  ) return true;
  else return false;
}
