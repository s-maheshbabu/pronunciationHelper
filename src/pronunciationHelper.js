const Alexa = require("ask-sdk");
const SKILL_ID = "amzn1.echo-sdk-ams.app.22799827-aae1-4115-9b48-e2b74e33ee03";

const extraneousPhrases = require("../src/phrasesToStrip");
const STATES = require("../src/Constants").states;

const dictionary = require("dictionary-en-us");
const nspell = require("nspell");
let SpellChecker;

// --------------- Intent Handlers -----------------------
const CancelAndStopAndNoIntentHandler = {
  canHandle(handlerInput) {
    return (
      handlerInput.requestEnvelope.request.type === "IntentRequest" &&
      (handlerInput.requestEnvelope.request.intent.name ===
        "AMAZON.CancelIntent" ||
        handlerInput.requestEnvelope.request.intent.name ===
          "AMAZON.StopIntent" ||
        handlerInput.requestEnvelope.request.intent.name === "AMAZON.NoIntent")
    );
  },
  handle(handlerInput) {
    return handlerInput.responseBuilder
      .withShouldEndSession(true)
      .getResponse();
  }
};

const YesIntentHandler = {
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

    return handlerInput.responseBuilder
      .speak("Sorry, something went wrong. Please try again.")
      .withShouldEndSession(true)
      .getResponse();
  }
};

const LaunchRequestHandler = {
  canHandle(handlerInput) {
    return handlerInput.requestEnvelope.request.type === "LaunchRequest";
  },
  handle(handlerInput) {
    return getWelcomeResponse(handlerInput);
  }
};

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

const HelpIntentHandler = {
  canHandle(handlerInput) {
    return (
      handlerInput.requestEnvelope.request.type === "IntentRequest" &&
      handlerInput.requestEnvelope.request.intent.name === "AMAZON.HelpIntent"
    );
  },
  handle(handlerInput) {
    const helpText = `I can help you pronounce English words in my accent. You just need to spell the word you need the pronunciation for. For example, you can say, pronounce <say-as interpret-as="spell-out">BITS</say-as> <break time="100ms"/> and I will tell you that it is pronounced as bits. So go ahead and spell the word you want me to pronounce.`;
    const helpRepromptText = `What word do you want the pronunciation for? You can say things like, what is the pronunciation for <say-as interpret-as="spell-out">PILANI</say-as>`;

    return handlerInput.responseBuilder
      .speak(helpText)
      .reprompt(helpRepromptText)
      .withShouldEndSession(false)
      .getResponse();
  }
};

const SessionEndedRequestHandler = {
  canHandle(handlerInput) {
    return handlerInput.requestEnvelope.request.type === "SessionEndedRequest";
  },
  handle(handlerInput) {
    console.log(
      `Session ended! State when session ended: ${handlerInput.attributesManager.getSessionAttributes()}`
    );

    return handlerInput.responseBuilder.getResponse();
  }
};

// --------------- Error Handlers -----------------------
const ErrorHandler = {
  canHandle() {
    return true;
  },
  handle(handlerInput, error) {
    console.error(`Error handled: ${error.message}`);

    return handlerInput.responseBuilder
      .speak("Sorry, I didn't get that. Please try again.")
      .reprompt("Sorry, I didn't get that. Please try again.")
      .withShouldEndSession(false)
      .getResponse();
  }
};

// --------------- Interceptors -----------------------
const SpellCheckerInitializationInterceptor = {
  process(handlerInput) {
    return new Promise((resolve, reject) => {
      if (!SpellChecker) {
        console.log("SpellChecker being initialied.");
        dictionary(function(error, dict) {
          if (error) {
            // TODO: We should swallow this error and make the spell checker optional.
            // Currently code/tests assumes that SpellChecker is always available.
            console.log(`Error initializing the dictionary. Error: ${error}`);
            reject(error);
            return;
          }

          // Need to check if this is prohibitively expensive in prod env.

          // This is an expensive operation. SpellChecker should be made optional.
          // The load should be kicked off so subsequent requests can benefit from it
          // but the current session shouldn't be blocked on this.
          SpellChecker = nspell(dict);

          resolve();
        });
      } else {
        resolve();
      }
    });
  }
};

// --------------- Skill Initialization -----------------------
let skill;

exports.handler = async function(event, context) {
  if (!skill) {
    skill = Alexa.SkillBuilders.custom()
      .addRequestHandlers(
        CancelAndStopAndNoIntentHandler,
        YesIntentHandler,
        LaunchRequestHandler,
        HowToPronounceIntentHandler,
        HelpIntentHandler,
        SessionEndedRequestHandler
      )
      .addRequestInterceptors(SpellCheckerInitializationInterceptor)
      .addErrorHandlers(ErrorHandler)
      .create();
  }

  return skill.invoke(event, context);
};

// --------------- Functions that control the skill's behavior -----------------------
function getWelcomeResponse(handlerInput) {
  console.log(`Handling Launch request.`);

  return handlerInput.responseBuilder
    .speak(
      `Welcome to Pronunciations. You can say things like, pronounce <say-as interpret-as="spell-out">BITS</say-as> <break time="100ms"/> So, what word do you want me to pronounce?`
    )
    .reprompt(
      `What word do you want the pronunciation for? You can say things like, what is the pronunciation for <say-as interpret-as="spell-out">PILANI</say-as>`
    )
    .withSimpleCard(
      `Welcome to Pronunciations`,
      `Examples:
Pronounce D. O. G.
How to pronounce B. I. T. S.
What is the pronunciation for C. A. T.
Ask pnonunciations to pronounce P. I. L. A. N. I.`
    )
    .withShouldEndSession(false)
    .getResponse();
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
        `If you meant <say-as interpret-as="spell-out">${suggestion}</say-as>, it is pronounced as ${suggestion}. Would you like to hear another suggestion?`
      )
      .reprompt(`I have more suggestions. Would you like to hear them?`)
      .withShouldEndSession(false)
      .getResponse();
  } else {
    return responseBuilder
      .speak(
        `If you meant <say-as interpret-as="spell-out">${suggestion}</say-as>, it is pronounced as ${suggestion}.`
      )
      .withShouldEndSession(true)
      .getResponse();
  }
}

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

      return responseBuilder
        .speak(
          `I would pronounce it as ${wordToBePronounced}. By the way, I work best when you spell the word you want me to pronounce, instead of saying the entire word or phrase.`
        )
        .withSimpleCard(
          `Pronunciation of '${wordToBePronounced}'`,
          `Now that you know how to pronounce '${wordToBePronounced}', you can ask Alexa for its meaning by saying "Alexa, define ${wordToBePronounced}". By the way, you might have tried to pronounce a word or a phrase but I work best when you spell the word you need pronunciation for. Say "Ask Pronunciations for help" to learn more.`
        )
        .withShouldEndSession(true)
        .getResponse();
    } else {
      // Remove all non-alphanumeric characters. This is to strip out spaces and dots that Alexa might provide in its slot values.
      // D. Og will get converted to DOg, for example.
      wordToBePronounced = wordToBePronounced.replace(/\W/g, "");
      console.log(`Word that will be delivered: ${wordToBePronounced}`);
      if (isMisspelled(wordToBePronounced)) {
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
        const suggestedSpellings = getSuggestedSpellings(wordToBePronounced);
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
        return responseBuilder
          .speak(`It is pronounced as ${wordToBePronounced}.`)
          .withSimpleCard(
            `Pronunciation of '${wordToBePronounced}'`,
            `Now that you know how to pronounce ${wordToBePronounced}, you can ask Alexa for its meaning by saying "Alexa, define ${wordToBePronounced}"`
          )
          .withShouldEndSession(true)
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

/**
 * Checks the lower case version and the title case version of
 * the input and if both are recognized as misspelled, returns
 * true.
 * @param {*} input word whose spelling is to be checked.
 */
function isMisspelled(input) {
  return (
    !SpellChecker.correct(input.toLowerCase()) &&
    !SpellChecker.correct(toTitleCase(input))
  );
}

/**
 * Lower cases the input and obtains spelling suggestions.
 * If there are no suggestions, an empty array is returned.
 *
 * @param {*} input word for which spell suggestions are to
 * be obtained.
 */
function getSuggestedSpellings(input) {
  return SpellChecker.suggest(input);
}

/**
 * Converts given string to title case. For example, san diEGo
 * would be converted to San Diego.
 * @param {*} input the string to be title cased.
 */
function toTitleCase(input) {
  return input.replace(/\w\S*/g, function(txt) {
    return txt.charAt(0).toUpperCase() + txt.substr(1).toLowerCase();
  });
}
