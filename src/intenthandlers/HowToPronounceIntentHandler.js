const STATES = require("constants/States").states;
const APL_CONSTANTS = require("constants/APL");
const SpellChecker = require("spellcheck/SpellChecker");

const utilities = require("utilities");
const extraneousPhrases = require("constants/PhrasesToStrip");
const wordPronouncedDocument = require("apl/document/WordPronouncedDocument.json");
const wordPronouncedDatasource = require("apl/data/WordPronouncedDatasource");

const skillInfoDocument = require("apl/document/SkillInfoDocument.json");
const skillInfoDatasource = require("apl/data/SkillInfoDatasource");

const APL_DOCUMENT_TYPE = APL_CONSTANTS.APL_DOCUMENT_TYPE;
const APL_DOCUMENT_VERSION = APL_CONSTANTS.APL_DOCUMENT_VERSION;

const MAX_SPELL_SUGGESTIONS_TO_DISPLAY =
  APL_CONSTANTS.MAX_SPELL_SUGGESTIONS_TO_DISPLAY;

const HowToPronounceIntentHandler = {
  canHandle(handlerInput) {
    return (
      handlerInput.requestEnvelope.request.type === "IntentRequest" &&
      handlerInput.requestEnvelope.request.intent.name === "HowToPronounceIntent"
    );
  },
  handle(handlerInput) {
    return pronounceTheWord(handlerInput);
  }
};

module.exports = HowToPronounceIntentHandler;

/**
 * Pronounces the word or informs the user that no word exists with the spelling.
 */
function pronounceTheWord(handlerInput) {
  const { requestEnvelope, attributesManager, responseBuilder } = handlerInput;
  const intent = requestEnvelope.request.intent;

  var cardTitle = `Pronunciations`;
  var wordToBePronoucnedSlot = intent.slots.Spelling;

  if (
    wordToBePronoucnedSlot !== undefined &&
    wordToBePronoucnedSlot.value !== undefined
  ) {
    var wordToBePronounced = wordToBePronoucnedSlot.value;
    console.log(`Spelling slot value provided by Alexa: ${wordToBePronounced}`);

    wordToBePronounced = removeExtraneousPhrases(
      wordToBePronounced,
      extraneousPhrases
    );

    if (isAllLowerCase(wordToBePronounced)) {
      // User is probably trying to pronounce a word without spelling it out (For ex, Alexa, ask pronunciations to pronounce 'how are you').
      // Not the purpose of this skill but we can still try to pronounce it and then educate the user.
      console.log(
        `Input is all lower case. Pronouncing the word and rendering an educative prompt.`
      );

      const educativeVisualMessage = `Now that you know how to pronounce '${wordToBePronounced}', you can ask Alexa for its meaning by saying "Alexa, define ${wordToBePronounced}".

By the way, you might have tried to pronounce a word or a phrase but I work best when you spell the word you need pronunciation for. Say "Ask Pronunciations for help" to learn more.`;
      return responseBuilder
        .speak(
          `I would pronounce it as ${wordToBePronounced}. I repeat, <prosody rate="x-slow">${wordToBePronounced}</prosody>. By the way, I work best when you spell the word you want me to pronounce, instead of saying the entire word or phrase.`
        )
        .withSimpleCard(
          `Pronunciation of '${wordToBePronounced}'`,
          educativeVisualMessage
        )
        .withShouldEndSession(true)
        .addDirective({
          type: APL_DOCUMENT_TYPE,
          version: APL_DOCUMENT_VERSION,
          document: wordPronouncedDocument,
          datasources: wordPronouncedDatasource(
            wordToBePronounced,
            educativeVisualMessage
          )
        })
        .getResponse();
    } else {
      // Remove all non-alphanumeric characters. This is to strip out spaces and dots that Alexa might provide in its slot values.
      // D. Og will get converted to DOg, for example.
      wordToBePronounced = wordToBePronounced.replace(/\W/g, "").toUpperCase();
      console.log(`Word that will be delivered: ${wordToBePronounced}`);
      if (SpellChecker.isMisspelled(wordToBePronounced)) {
        console.log(
          `${wordToBePronounced} has been reccognized to be an incorrect spelling.`
        );

        const response = responseBuilder
          .withSimpleCard(
            `Pronunciation of '${wordToBePronounced}'`,
            `Now that you know how to pronounce ${wordToBePronounced}, you can ask Alexa for its meaning by saying "Alexa, define ${wordToBePronounced}"`
          )
          .withShouldEndSession(true);

        // If there are any suggested spellings, save them in the session and offer to pronounce the suggested words.
        const suggestedSpellings = SpellChecker.getSuggestedSpellings(
          wordToBePronounced
        );
        if (Array.isArray(suggestedSpellings) && suggestedSpellings.length) {
          const attributes = attributesManager.getSessionAttributes() || {};

          attributes.state = STATES.SUGGEST_CORRECT_SPELLINGS;
          attributes.suggestedSpellings = suggestedSpellings;

          attributesManager.setSessionAttributes(attributes);

          return response
            .speak(
              `I would pronounce it as ${wordToBePronounced}. I repeat, <prosody rate="x-slow">${wordToBePronounced}</prosody>. By the way, I have a feeling that I misheard you. I have some suggestions on what you might have been trying to pronounce. Do you want to hear them?`
            )
            .reprompt(
              `While I pronounced what I heard, I have a feeling that I either misheard you or you gave an incorrect spelling. I have some suggestions on what you might have been trying to pronounce. Do you want to hear them?`
            )
            .withShouldEndSession(false)
            .addDirective({
              type: APL_DOCUMENT_TYPE,
              version: APL_DOCUMENT_VERSION,
              document: wordPronouncedDocument,
              datasources: wordPronouncedDatasource(
                wordToBePronounced,
                `I have a feeling I misheard you though. Here are some words that are similar to what I heard. Do you want me to pronounce them?`,
                suggestedSpellings
              )
            })
            .getResponse();
        }

        // We recognized a misspelling but don't have any suggestions. Could be a non-English word, the user just messing
        // with Alexa or an actual gap in the spell check library. In any case, we will just pronounce it anyways.
        return response
          .speak(`I would pronounce it as ${wordToBePronounced}.`)
          .addDirective({
            type: APL_DOCUMENT_TYPE,
            version: APL_DOCUMENT_VERSION,
            document: wordPronouncedDocument,
            datasources: wordPronouncedDatasource(
              wordToBePronounced,
              `To be honest, I don't recognize this word but I pronounced it anyways because you asked for it.`
            )
          })
          .getResponse();
      } else {
        const educativeVisualMessage = `Now that you know how to pronounce ${wordToBePronounced}, you can ask for its meaning by saying "Alexa, define ${wordToBePronounced}"`;
        const isAplDevice = utilities.isAplDevice(handlerInput);
        const isAppLinksSupported = utilities.isAppLinksSupported(handlerInput);

        if (isAplDevice || isAppLinksSupported) {
          const attributes = attributesManager.getSessionAttributes() || {};
          attributes.state = STATES.OFFER_DICTIONARY_PUNCHOUT;
          attributes.word = wordToBePronounced;
          attributesManager.setSessionAttributes(attributes);

          responseBuilder
            .speak(`It is pronounced as ${wordToBePronounced}. I repeat, <prosody rate="x-slow">${wordToBePronounced}</prosody>. Shall I open the dictionary for ${wordToBePronounced}?`)
            .reprompt(`Shall I open the dictionary for ${wordToBePronounced} so you can learn its meaning, synonyms etc.?`)
            .withShouldEndSession(undefined)
        }
        else {
          responseBuilder
            .speak(`It is pronounced as ${wordToBePronounced}. I repeat, <prosody rate="x-slow">${wordToBePronounced}</prosody>.`)
            .withShouldEndSession(true)
        }
        return responseBuilder
          .withSimpleCard(
            `Pronunciation of '${wordToBePronounced}'`,
            educativeVisualMessage
          )
          .addDirective({
            type: APL_DOCUMENT_TYPE,
            version: APL_DOCUMENT_VERSION,
            token: APL_CONSTANTS.WORD_PRONOUNCED_VIEW_TOKEN,
            document: wordPronouncedDocument,
            datasources: wordPronouncedDatasource(
              wordToBePronounced,
              educativeVisualMessage
            )
          })
          .getResponse();
      }
    }
  } else {
    // TODO: APL support should be added in this section.
    incrementFailedAttemptsCount(attributesManager.getSessionAttributes());

    if (isAttemptsRemaining(attributesManager.getSessionAttributes())) {
      console.log(
        `Invalid input. Rendering an error prompt and asking the user to try again.`
      );

      const visualMessage = `Sorry, I'm having trouble understanding. Please try again.`;
      return responseBuilder
        .speak(`I didn't get that. Please try again.`)
        .reprompt(
          `I didn't get the word you were asking for. Please try again.`
        )
        .withSimpleCard(
          cardTitle,
          visualMessage
        )
        .withShouldEndSession(false)
        .addDirective({
          type: APL_DOCUMENT_TYPE,
          version: APL_DOCUMENT_VERSION,
          document: skillInfoDocument,
          datasources: skillInfoDatasource(
            ``,
            visualMessage
          )
        })
        .getResponse();
    } else {
      console.log(`Too many invalid inputs. Quitting.`);

      const visualMessage = `Sorry, I'm having trouble understanding. Please try again later. Good bye.`;
      return responseBuilder
        .speak(
          `Sorry, I'm having trouble understanding. Please try again later. Good bye.`
        )
        .withSimpleCard(
          cardTitle,
          visualMessage
        )
        .withShouldEndSession(true)
        .addDirective({
          type: APL_DOCUMENT_TYPE,
          version: APL_DOCUMENT_VERSION,
          document: skillInfoDocument,
          datasources: skillInfoDatasource(
            ``,
            visualMessage
          )
        })
        .getResponse();
    }
  }
}

function isAttemptsRemaining(attributes) {
  if (
    typeof attributes["numberOfFailedAttempts"] === "number" &&
    attributes["numberOfFailedAttempts"] >= 3
  ) {
    return false;
  }
  return true;
}

function incrementFailedAttemptsCount(attributes) {
  // TODO Is this right?
  if (typeof attributes["numberOfFailedAttempts"] === "number") {
    attributes["numberOfFailedAttempts"] += 1;
  } else {
    attributes["numberOfFailedAttempts"] = 1;
  }
}

// --------------- Utility functions -----------------------
/**
 * Searches if the given string has any of the extraneous phrases
 * and if there are, finds the longest extraneous phrase and remove
 * it.
 * @param {String} input the string from which the extraneous phrase
 * should be removed.,
          datasources: skillInfoDatasource(
            visualMessage,
            ``
          )
 * @param {Array of Strings} extraneousPhrases the list of strings
 * that should be removed from the input.
 */
function removeExtraneousPhrases(input, extraneousPhrases) {
  if (!input) return input;

  let longestExtraneousPhrase;
  for (let i = 0; i < extraneousPhrases.length; i++) {
    const extraneousPhrase = extraneousPhrases[i];

    if (!extraneousPhrase) continue;

    if (input.includes(extraneousPhrase)) {
      if (
        !longestExtraneousPhrase ||
        longestExtraneousPhrase.length < extraneousPhrase.length
      ) {
        longestExtraneousPhrase = extraneousPhrase;
      }
    }
  }

  if (longestExtraneousPhrase)
    return input.replace(longestExtraneousPhrase, "").trim();
  return input.trim();
}

function isAllLowerCase(input) {
  return input === input.toLowerCase();
}
