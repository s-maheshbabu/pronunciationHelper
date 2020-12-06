const STATES = require("constants/States").states;
const APL_CONSTANTS = require("constants/APL");

const utilities = require("utilities");

const applinks = require("constants/Constants").applinks;
const ios = require("constants/Constants").ios;
const android = require("constants/Constants").android;

const wordPronouncedDocument = require("apl/document/WordPronouncedDocument.json");
const wordPronouncedDatasource = require("apl/data/WordPronouncedDatasource");

const APL_DOCUMENT_TYPE = APL_CONSTANTS.APL_DOCUMENT_TYPE;
const APL_DOCUMENT_VERSION = APL_CONSTANTS.APL_DOCUMENT_VERSION;

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
    else if (sessionAttributes.state === STATES.OFFER_DICTIONARY_PUNCHOUT) {
      const { word } = sessionAttributes;
      // TODO: If word is missing, throw unexpected error. Write a test for that.
      // TODO: Test the case where neither APL not AppLinks is supported. That would be an unexpected error.
      if (utilities.isAplDevice(handlerInput))
        return openDictionaryUrl(handlerInput, word);
      else if (utilities.isAppLinksSupported(handlerInput))
        return punchOutToDictionaryApp(handlerInput, word, 'Okay.', 'Please unlock your device to see the dictionary.');
    }

    return responseBuilder
      .speak("Sorry, something went wrong. Please try again.")
      .withShouldEndSession(true)
      .getResponse();
  }
};

/**
 * Builds an AppLink directive to direct AlexaForApps enabled devices to launch a dictionary app for the given word.
 */
function punchOutToDictionaryApp(handlerInput, word, unlockedSpeech, lockedScreenSpeech) {
  let identifier = ios.DICTIONARY_IDENTIFIER, storeType = ios.STORE_TYPE;

  const isAndroid = isAndroidBased(handlerInput);
  if (isAndroid) {
    identifier = android.DICTIONARY_IDENTIFIER;
    storeType = android.STORE_TYPE;
  }

  const appLinkDirective = {
    type: "Connections.StartConnection",
    uri: "connection://AMAZON.LinkApp/1",
    input: {
      catalogInfo: {
        identifier: identifier,
        type: storeType,
      },
      actions: {
        primary: {
          type: applinks.UNIVERSAL_APP_LINK_TYPE,
          link: buildDictionaryLink(word)
        }
      },
      prompts: {
        onAppLinked: {
          prompt: {
            ssml: `<speak>${unlockedSpeech}</speak>`,
            type: "SSML"
          },
          defaultPromptBehavior: applinks.SPEAK_PROMPT_BEHAVIOR
        },
        onScreenLocked: {
          prompt: {
            ssml: `<speak>${lockedScreenSpeech}</speak>`,
            type: "SSML"
          }
        }
      }
    }
  };

  const { responseBuilder } = handlerInput;
  return responseBuilder
    .withShouldEndSession(undefined)
    .addDirective(appLinkDirective)
    .getResponse();
}

function openDictionaryUrl(handlerInput, word) {
  const { responseBuilder } = handlerInput;

  return responseBuilder
    .speak(`Okay.`)
    .withShouldEndSession(undefined)
    .addDirective(buildOpenUrlDirective(word))
    .getResponse();
}

/**
 * Builds a 'OpenURL' directive to direct APL devices to launch a dictionary web page for the given word.
 * @param {*} word The word to which the URL points to
 */
function buildOpenUrlDirective(word) {
  return {
    type: APL_CONSTANTS.APL_COMMANDS_TYPE,
    token: APL_CONSTANTS.WORD_PRONOUNCED_VIEW_TOKEN,
    commands: [{
      type: "OpenURL",
      source: buildDictionaryLink(word),
      onFail: {}
    }],
  };
}

function buildDictionaryLink(word) {
  return `https://www.merriam-webster.com/dictionary/${word}`;
}

/**
 * Assumes AppLinks is supported and supported catalog types are already validated. Returns
 * true is the request is coming from an Android based device.
 */
function isAndroidBased(handlerInput) {
  const appLinksInterface = handlerInput.requestEnvelope.context[applinks.APP_LINK_INTERFACE];
  return appLinksInterface.supportedCatalogTypes.includes(android.STORE_TYPE);
}

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
        `If you meant <say-as interpret-as="spell-out">${suggestion}</say-as>, it is pronounced as ${suggestion}. I repeat, <prosody rate="x-slow">${suggestion}</prosody>. Would you like to hear another suggestion?`
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
          `Now that you know how to pronounce ${suggestion}, you can ask Alexa for its meaning by saying "Alexa, define ${suggestion}". Thank you for using pronunciations.`,
        )
      })
      .getResponse();
  }
}
