// Route the incoming request based on type (LaunchRequest, IntentRequest,
// etc.) The JSON body of the request is provided in the event parameter.
exports.handler = function(event, context) {
  try {
    console.log(
      "event.session.application.applicationId=" +
        event.session.application.applicationId
    );

    if (
      event.session.application.applicationId !==
      "amzn1.echo-sdk-ams.app.22799827-aae1-4115-9b48-e2b74e33ee03"
    ) {
      context.fail("Invalid Application ID");
    }

    if (event.session.new) {
      onSessionStarted({ requestId: event.request.requestId }, event.session);
    }

    if (event.request.type === "LaunchRequest") {
      onLaunch(event.request, event.session, function callback(
        sessionAttributes,
        speechletResponse
      ) {
        context.succeed(buildResponse(sessionAttributes, speechletResponse));
      });
    } else if (event.request.type === "IntentRequest") {
      onIntent(event.request, event.session, function callback(
        sessionAttributes,
        speechletResponse
      ) {
        context.succeed(buildResponse(sessionAttributes, speechletResponse));
      });
    } else if (event.request.type === "SessionEndedRequest") {
      onSessionEnded(event.request, event.session);
      context.succeed();
    }
  } catch (e) {
    context.fail("Exception: " + e);
  }
};

/**
 * Called when the session starts.
 */
function onSessionStarted(sessionStartedRequest, session) {
  console.log(
    "onSessionStarted requestId=" +
      sessionStartedRequest.requestId +
      ", sessionId=" +
      session.sessionId
  );
}

/**
 * Called when the user launches the skill without specifying what they want.
 */
function onLaunch(launchRequest, session, callback) {
  console.log(
    "onLaunch requestId=" +
      launchRequest.requestId +
      ", sessionId=" +
      session.sessionId
  );

  // Dispatch to your skill's launch.
  getWelcomeResponse(callback);
}

/**
 * Called when the user specifies an intent for this skill.
 */
function onIntent(intentRequest, session, callback) {
  console.log(
    "onIntent requestId=" +
      intentRequest.requestId +
      ", sessionId=" +
      session.sessionId
  );

  var intent = intentRequest.intent,
    intentName = intentRequest.intent.name;

  // Dispatch to your skill's intent handlers
  if ("HowToPronounceIntent" === intentName) {
    pronounceTheWord(intent, session, callback);
  } else if ("AMAZON.HelpIntent" === intentName) {
    getHelpResponse(callback);
  } else if ("AMAZON.StopIntent" === intentName) {
    exitSkill(callback);
  } else if ("AMAZON.CancelIntent" === intentName) {
    exitSkill(callback);
  } else {
    throw "Invalid intent";
  }
}

/**
 * Called when the user ends the session.
 * Is not called when the skill returns shouldEndSession=true.
 */
function onSessionEnded(sessionEndedRequest, session) {
  console.log(
    "onSessionEnded requestId=" +
      sessionEndedRequest.requestId +
      ", sessionId=" +
      session.sessionId
  );
  // Add cleanup logic here
}

// --------------- Functions that control the skill's behavior -----------------------

function getWelcomeResponse(callback) {
  // If we wanted to initialize the session to have some attributes we could add those here.
  var sessionAttributes = {};
  var cardTitle = "Welcome to Pronunciations";
  var cardOutput =
    "Examples: \n" +
    "Pronounce D. O. G.\n" +
    "How to pronounce B. I. T. S.\n" +
    "What is the pronunciation for C. A. T.\n" +
    "Ask pnonunciations to pronounce P. I. L. A. N. I.\n";
  var speechOutput =
    "<speak> Welcome to Pronunciations. " +
    "You can say things like, pronounce B. I. T. S. </speak>";
  // If the user either does not reply to the welcome message or says something that is not
  // understood, they will be prompted again with this text.
  var repromptText =
    "<speak> What word do you want the pronunciation for? You can say things like, what is the pronunciation for P. I. L. A. N. I. </speak>";
  var shouldEndSession = false;

  callback(
    sessionAttributes,
    buildSpeechletResponse(
      cardTitle,
      cardOutput,
      speechOutput,
      repromptText,
      shouldEndSession
    )
  );
}

function getHelpResponse(callback) {
  var speechOutput =
    "<speak> I can help you pronounce English words in American accent. You just need to spell the word you need the pronunciation for. " +
    'For example, you can say, pronounce B. I. T. S. <break time="100ms"/> and I will tell you that it is pronounced as bits. So what word do you want me to pronounce? </speak>';
  var repromptText =
    "<speak> What word do you want the pronunciation for? You can say things like, what is the pronunciation for P. I. L. A. N. I. </speak>";
  var shouldEndSession = false;

  callback(
    {},
    buildSpeechletResponseWithoutCards(
      speechOutput,
      repromptText,
      shouldEndSession
    )
  );
}

function exitSkill(callback) {
  var speechOutput = "";
  var repromptText = "";
  var shouldEndSession = true;

  callback(
    {},
    buildSpeechletResponseWithoutCards(
      speechOutput,
      repromptText,
      shouldEndSession
    )
  );
}

/**
 * Pronounces the word or informs the user that no word exists with the spelling.
 */
function pronounceTheWord(intent, session, callback) {
  var cardTitle = "Pronunciations";
  var wordToBePronoucnedSlot = intent.slots.Spelling;
  var repromptText = "";
  var sessionAttributes = session.attributes;
  var shouldEndSession = true;
  var speechOutput = "";
  var cardOutput = "";

  if (
    wordToBePronoucnedSlot !== undefined &&
    wordToBePronoucnedSlot.value !== undefined
  ) {
    var wordToBePronoucned = wordToBePronoucnedSlot.value;
    if (hasLowerCase(wordToBePronoucned)) {
      sessionAttributes = incrementFailedAttemptsCount(sessionAttributes);

      if (
        !sessionAttributes ||
        !sessionAttributes.numberOfFailedAttempts ||
        sessionAttributes.numberOfFailedAttempts < 3
      ) {
        shouldEndSession = false;
        speechOutput = "<speak> I didn't get that. Please try again. </speak>";
        cardOutput =
          'I heard "' +
          wordToBePronoucned +
          '" but I do not know how to pronounce it. Please try again.';
      } else {
        speechOutput =
          "<speak> Sorry, am having trouble understanding. Please try again later. Good bye. </speak>";
        cardOutput =
          'I heard "' +
          wordToBePronoucned +
          '" but I do not know how to pronounce it. Sorry.';
      }
    } else if (hasWhiteSpaces(wordToBePronoucned)) {
      wordToBePronoucned = wordToBePronoucned.replace(/ /g, "");
      speechOutput =
        "<speak> I would pronounce it as " + wordToBePronoucned + ". </speak>";
      cardOutput =
        "Now that you know how to pronounce " +
        wordToBePronoucned +
        ', you can ask Alexa for its meaning by saying "Alexa, define ' +
        wordToBePronoucned +
        '"';
      cardTitle = "Pronunciation of " + wordToBePronoucned;
    } else {
      speechOutput =
        "<speak> It is pronounced as " + wordToBePronoucned + ". </speak>";
      cardOutput =
        "Now that you know how to pronounce " +
        wordToBePronoucned +
        ' you can ask Alexa for its meaning by saying "Alexa, define ' +
        wordToBePronoucned +
        '"';
      cardTitle = "Pronunciation of " + wordToBePronoucned;
    }
  } else {
    sessionAttributes = incrementFailedAttemptsCount(sessionAttributes);

    if (
      !sessionAttributes ||
      !sessionAttributes.numberOfFailedAttempts ||
      sessionAttributes.numberOfFailedAttempts < 3
    ) {
      shouldEndSession = false;
      speechOutput = "<speak> I didn't get that. Please try again. </speak>";
      cardOutput =
        "Am sorry, am having trouble understanding. Please try again.";
    } else {
      speechOutput =
        "<speak> Sorry, am having trouble understanding. Please try again later. Good bye </speak>";
      cardOutput =
        "Am sorry, am having trouble understanding. Please try again.";
    }
  }

  callback(
    sessionAttributes,
    buildSpeechletResponse(
      cardTitle,
      cardOutput,
      speechOutput,
      repromptText,
      shouldEndSession
    )
  );
}

function incrementFailedAttemptsCount(sessionAttributes) {
  if (sessionAttributes && sessionAttributes.numberOfFailedAttempts) {
    sessionAttributes.numberOfFailedAttempts++;
    return sessionAttributes;
  }
  return {
    numberOfFailedAttempts: 1
  };
}

// --------------- Helpers that build all of the responses -----------------------
function buildSpeechletResponse(
  cardTitle,
  cardOutput,
  speechOutput,
  repromptText,
  shouldEndSession
) {
  return {
    outputSpeech: {
      type: "SSML",
      ssml: speechOutput
    },
    card: {
      type: "Simple",
      title: cardTitle,
      content: cardOutput
    },
    reprompt: {
      outputSpeech: {
        type: "SSML",
        ssml: repromptText
      }
    },
    shouldEndSession: shouldEndSession
  };
}

function buildSpeechletResponseWithoutCards(
  speechOutput,
  repromptText,
  shouldEndSession
) {
  return {
    outputSpeech: {
      type: "SSML",
      ssml: speechOutput
    },
    reprompt: {
      outputSpeech: {
        type: "SSML",
        ssml: repromptText
      }
    },
    shouldEndSession: shouldEndSession
  };
}

function buildResponse(sessionAttributes, speechletResponse) {
  return {
    version: "1.0",
    sessionAttributes: sessionAttributes,
    response: speechletResponse
  };
}

// --------------- Utility functions -----------------------
function hasLowerCase(input) {
  return input.toUpperCase() != input;
}

function hasWhiteSpaces(input) {
  return input.indexOf(" ") > -1;
}
