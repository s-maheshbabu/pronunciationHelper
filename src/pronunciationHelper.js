const Alexa = require("alexa-sdk");
const SKILL_ID = "amzn1.echo-sdk-ams.app.22799827-aae1-4115-9b48-e2b74e33ee03";

const handlers = {
  "AMAZON.CancelIntent": function() {
    this.emit(":tell", "");
  },
  HowToPronounceIntent: pronounceTheWord,
  "AMAZON.HelpIntent": getHelpResponse,
  "AMAZON.StopIntent": function() {
    this.emit(":tell", "");
  },
  LaunchRequest: getWelcomeResponse,
  SessionEndedRequest: function() {
    console.log("Session ended! State when session ended: " + this.attributes);
  },
  Unhandled: function() {
    this.emit("AMAZON.HelpIntent");
  }
};

exports.handler = function(event, context, callback) {
  const alexa = Alexa.handler(event, context, callback);
  alexa.appId = SKILL_ID;
  alexa.registerHandlers(handlers);
  alexa.execute();
};

// --------------- Functions that control the skill's behavior -----------------------
function getWelcomeResponse() {
  console.log(`Handling Launch request.`);
  this.emit(
    ":askWithCard",
    "Welcome to Pronunciations. You can say things like, pronounce B. I. T. S.",
    "What word do you want the pronunciation for? You can say things like, what is the pronunciation for P. I. L. A. N. I.",
    "Welcome to Pronunciations",
    `Examples: 
    Pronounce D. O. G.
    How to pronounce B. I. T. S.
    What is the pronunciation for C. A. T.
    Ask pnonunciations to pronounce P. I. L. A. N. I.`
  );
}

function getHelpResponse() {
  console.log(`Handling Amazon.HelpIntent.`);

  this.emit(
    ":ask",
    `I can help you pronounce English words in my accent. You just need to spell the word you need the pronunciation for. For example, you can say, pronounce B. I. T. S. <break time="100ms"/> and I will tell you that it is pronounced as bits. So go ahead and spell the word you want me to pronounce.`,
    `What word do you want the pronunciation for? You can say things like, what is the pronunciation for P. I. L. A. N. I.`
  );
}

/**
 * Pronounces the word or informs the user that no word exists with the spelling.
 */
function pronounceTheWord() {
  const session = this.event.session;
  const intent = this.event.request.intent;

  var cardTitle = "Pronunciations";
  var wordToBePronoucnedSlot = intent.slots.Spelling;

  if (
    wordToBePronoucnedSlot !== undefined &&
    wordToBePronoucnedSlot.value !== undefined
  ) {
    var wordToBePronoucned = wordToBePronoucnedSlot.value;
    console.log(`Spelling slot value provided by Alexa: ${wordToBePronoucned}`);

    if (isAllLowerCase(wordToBePronoucned)) {
      // User is probably trying to pronounce a word without spelling it out (For ex, Alexa, ask pronunciations to pronounce 'how are you').
      // Not the purpose of this skill but we can still try to pronounce it and then educate the user.
      console.log(
        `Input is all lower case. Pronouncing the word and rendering an educative prompt.`
      );
      this.emit(
        ":tellWithCard",
        `I would pronounce it as ${wordToBePronoucned}. By the way, I work best when you spell the word you want me to pronounce, instead of saying the entire word or phrase.`,
        `Pronunciation of '${wordToBePronoucned}'`,
        `Now that you know how to pronounce '${wordToBePronoucned}', you can ask Alexa for its meaning by saying "Alexa, define ${wordToBePronoucned}". By the way, you might have tried to pronounce a word or a phrase but I work best when you spell the word you need pronunciation for. Say "Ask Pronunciations for help" to learn more.`
      );
    } else if (hasWhiteSpaces(wordToBePronoucned)) {
      // Remove all non-alphanumeric characters. This is to strip out spaces and dots that Alexa might provide in its slot values.
      // D. Og will get converted to DOg, for example.
      wordToBePronoucned = wordToBePronoucned.replace(/\W/g, "");
      console.log(
        `Word that will be delivered after pre-processing: ${wordToBePronoucned}`
      );

      this.emit(
        ":tellWithCard",
        `I would pronounce it as ${wordToBePronoucned}.`,
        `Pronunciation of ${wordToBePronoucned}`,
        `Now that you know how to pronounce ${wordToBePronoucned}, you can ask Alexa for its meaning by saying "Alexa, define ${wordToBePronoucned}"`
      );
    } else {
      console.log(`Word that will be delivered: ${wordToBePronoucned}`);

      this.emit(
        ":tellWithCard",
        `It is pronounced as ${wordToBePronoucned}.`,
        `Pronunciation of ${wordToBePronoucned}`,
        `Now that you know how to pronounce ${wordToBePronoucned}, you can ask Alexa for its meaning by saying "Alexa, define ${wordToBePronoucned}"`
      );
    }
  } else {
    incrementFailedAttemptsCount(this.attributes);

    if (isAttemptsRemaining(this.attributes)) {
      console.log(`Too many invalid inputs. Quitting.`);
      this.emit(
        ":askWithCard",
        "I didn't get that. Please try again.",
        "I didn't get the word you were asking for. Please try again.",
        cardTitle,
        "Am sorry, am having trouble understanding. Please try again."
      );
    } else {
      console.log(
        `Invalid input. Rendering an error prompt and asking the user to try again.`
      );

      this.emit(
        ":tellWithCard",
        "Sorry, am having trouble understanding. Please try again later. Good bye.",
        cardTitle,
        "Am sorry, am having trouble understanding. Please try again."
      );
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
function isAllLowerCase(input) {
  return input === input.toLowerCase();
}

function hasWhiteSpaces(input) {
  return input.indexOf(" ") > -1;
}
