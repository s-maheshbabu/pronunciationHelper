const STATES = require("constants/States").states;
const SpellChecker = require("spellcheck/SpellChecker");

const extraneousPhrases = require("constants/PhrasesToStrip");
const wordPronouncedDocument = require("apl/document/WordPronouncedDocument.json");
const wordPronouncedDatasource = require("apl/data/WordPronouncedDatasource");

const APL_DOCUMENT_TYPE = "Alexa.Presentation.APL.RenderDocument";
const APL_DOCUMENT_VERSION = "1.0";

const HowToPronounceIntentHandler = {
  canHandle(handlerInput) {
    return (
      handlerInput.requestEnvelope.request.type === "IntentRequest" &&
      handlerInput.requestEnvelope.request.intent.name ===
        "HowToPronounceIntent"
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

      const educativeVisualMessage = `Now that you know how to pronounce '${wordToBePronounced}', you can ask Alexa for its meaning by saying "Alexa, define ${wordToBePronounced}". By the way, you might have tried to pronounce a word or a phrase but I work best when you spell the word you need pronunciation for. Say "Ask Pronunciations for help" to learn more.`;
      return responseBuilder
        .speak(
          `I would pronounce it as ${wordToBePronounced}. By the way, I work best when you spell the word you want me to pronounce, instead of saying the entire word or phrase.`
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
            `I pronounced '${wordToBePronounced}'`,
            educativeVisualMessage
          )
        })
        .getResponse();
    } else {
      // Remove all non-alphanumeric characters. This is to strip out spaces and dots that Alexa might provide in its slot values.
      // D. Og will get converted to DOg, for example.
      wordToBePronounced = wordToBePronounced.replace(/\W/g, "");
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
              `I would pronounce it as ${wordToBePronounced}. By the way, I have a feeling that I misheard you. I have some suggestions on what you might have been trying to pronounce. Do you want to hear them?`
            )
            .reprompt(
              `While I pronounced what I heard, I have a feeling that I either misheard you or you gave an incorrect spelling. I have some suggestions on what you might have been trying to pronounce. Do you want to hear them?`
            )
            .withShouldEndSession(false)
            .getResponse();
        }

        return response
          .speak(`I would pronounce it as ${wordToBePronounced}.`)
          .getResponse();
      } else {
        const educativeVisualMessage = `Now that you know how to pronounce ${wordToBePronounced}, you can ask for its meaning by saying "Alexa, define ${wordToBePronounced}"`;

        return responseBuilder
          .speak(`It is pronounced as ${wordToBePronounced}.`)
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
              `I pronounced '${wordToBePronounced}'`,
              educativeVisualMessage
            )
          })
          .getResponse();
      }
    }
  } else {
    incrementFailedAttemptsCount(attributesManager.getSessionAttributes());

    if (isAttemptsRemaining(attributesManager.getSessionAttributes())) {
      console.log(
        `Invalid input. Rendering an error prompt and asking the user to try again.`
      );

      return responseBuilder
        .speak(`I didn't get that. Please try again.`)
        .reprompt(
          `I didn't get the word you were asking for. Please try again.`
        )
        .withSimpleCard(
          cardTitle,
          `Am sorry, am having trouble understanding. Please try again.`
        )
        .withShouldEndSession(false)
        .getResponse();
    } else {
      console.log(`Too many invalid inputs. Quitting.`);

      return responseBuilder
        .speak(
          `Sorry, am having trouble understanding. Please try again later. Good bye.`
        )
        .withSimpleCard(
          cardTitle,
          `Am sorry, am having trouble understanding. Please try again.`
        )
        .withShouldEndSession(true)
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
 * should be removed.
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
