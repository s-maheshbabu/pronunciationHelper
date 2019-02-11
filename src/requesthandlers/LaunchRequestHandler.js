const APL_CONSTANTS = require("constants/APL");

const APL_DOCUMENT_TYPE = APL_CONSTANTS.APL_DOCUMENT_TYPE;
const APL_DOCUMENT_VERSION = APL_CONSTANTS.APL_DOCUMENT_VERSION;

const skillInfoDocument = require("apl/document/SkillInfoDocument.json");
const skillInfoDatasource = require("apl/data/SkillInfoDatasource");

module.exports = LaunchRequestHandler = {
  canHandle(handlerInput) {
    return handlerInput.requestEnvelope.request.type === "LaunchRequest";
  },
  handle(handlerInput) {
    return getWelcomeResponse(handlerInput);
  }
};

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
    .addDirective({
      type: APL_DOCUMENT_TYPE,
      version: APL_DOCUMENT_VERSION,
      document: skillInfoDocument,
      datasources: skillInfoDatasource(
        `I can help you with the pronunciations of English words and phrases. Just spell the word you want me to pronounce. For example, you can say - `,
        `Alexa, open pronunciations
Alexa, ask pronunciations to pronounce G. Y. R. O.
Alexa, open pronunciations and help me pronounce W. A. L. T.
Alexa, pronounce the word D. O. U. B. T.`
      )
    })
    .getResponse();
}
