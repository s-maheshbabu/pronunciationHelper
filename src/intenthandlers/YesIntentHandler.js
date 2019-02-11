const STATES = require("constants/States").states;
const APL_CONSTANTS = require("constants/APL");

const wordPronouncedDocument = require("apl/document/WordPronouncedDocument.json");
const wordPronouncedDatasource = require("apl/data/WordPronouncedDatasource");

const APL_DOCUMENT_TYPE = APL_CONSTANTS.APL_DOCUMENT_TYPE;
const APL_DOCUMENT_VERSION = APL_CONSTANTS.APL_DOCUMENT_VERSION;

const MAX_SPELL_SUGGESTIONS_TO_DISPLAY =
  APL_CONSTANTS.MAX_SPELL_SUGGESTIONS_TO_DISPLAY;

module.exports = YesIntentHandler = {
  canHandle(handlerInput) {
    return (
      handlerInput.requestEnvelope.request.type === "IntentRequest" &&
      handlerInput.requestEnvelope.request.intent.name === "AMAZON.YesIntent"
    );
  },
  handle(handlerInput) {
    const { attributesManager, responseBuilder } = handlerInput;

    const sessionAttributes = attributesManager.getSessionAttributes() || {};
    if (
      sessionAttributes.state === STATES.SUGGEST_CORRECT_SPELLINGS &&
      Array.isArray(sessionAttributes.suggestedSpellings) &&
      sessionAttributes.suggestedSpellings.length
    )
      return renderSpellSuggestions(handlerInput);

    return responseBuilder
      .speak("Sorry, something went wrong. Please try again.")
      .withShouldEndSession(true)
      .getResponse();
  }
};

/*
Extracts the spelling suggestions from the session attributes and renders the
first one. It also removes the rendered suggestion from the session attributes
so we don't keep repeating.

If there is only one suggestion remaining in the session, it gets rendered and
the session closed.

This method operates under the assumption that there is at least one suggestion in
the session attributes. Behavior is undeterministic, if there are no suggestions in
the session attributes.
*/
function renderSpellSuggestions(handlerInput) {
  const { attributesManager, responseBuilder } = handlerInput;

  const sessionAttributes = attributesManager.getSessionAttributes();
  const suggestedSpellings = sessionAttributes.suggestedSpellings;

  const suggestion = suggestedSpellings.shift();
  attributesManager.setSessionAttributes(sessionAttributes);

  if (suggestedSpellings.length) {
    return responseBuilder
      .speak(
        `If you meant <say-as interpret-as="spell-out">${suggestion}</say-as>, it is pronounced as ${suggestion}. Would you like to hear another suggestion?`
      )
      .reprompt(`I have more suggestions. Would you like to hear them?`)
      .withShouldEndSession(false)
      .addDirective({
        type: APL_DOCUMENT_TYPE,
        version: APL_DOCUMENT_VERSION,
        document: wordPronouncedDocument,
        datasources: wordPronouncedDatasource(
          suggestion,
          `Here are more words that are similar to what I originally heard. Do you want me to pronounce them?`,
          suggestedSpellings
            .slice(0, MAX_SPELL_SUGGESTIONS_TO_DISPLAY)
            .join(", ")
        )
      })
      .getResponse();
  } else {
    return responseBuilder
      .speak(
        `If you meant <say-as interpret-as="spell-out">${suggestion}</say-as>, it is pronounced as ${suggestion}.`
      )
      .withShouldEndSession(true)
      .addDirective({
        type: APL_DOCUMENT_TYPE,
        version: APL_DOCUMENT_VERSION,
        document: wordPronouncedDocument,
        datasources: wordPronouncedDatasource(
          suggestion,
          `Now that you know how to pronounce ${suggestion}, you can ask Alexa for its meaning by saying "Alexa, define ${suggestion}"`,
          `Thank you for using pronunciations.`
        )
      })
      .getResponse();
  }
}
