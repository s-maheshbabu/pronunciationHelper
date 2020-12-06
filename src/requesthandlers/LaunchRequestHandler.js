const APL_CONSTANTS = require("constants/APL");

const APL_DOCUMENT_TYPE = APL_CONSTANTS.APL_DOCUMENT_TYPE;
const APLA_DOCUMENT_TYPE = APL_CONSTANTS.APLA_DOCUMENT_TYPE;
const APL_DOCUMENT_VERSION = APL_CONSTANTS.APL_DOCUMENT_VERSION;

const skillInfoDocument = require("apl/document/SkillInfoDocument.json");
const skillInfoDatasource = require("apl/data/SkillInfoDatasource");

const launchSkillAudioDatasource = require("responses/LaunchSkill/datasources/default");
const launchSkillAudioDocument = require("responses/LaunchSkill/document");

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
  const welcomeMessage = `Welcome to Pronunciations. You can say things like, pronounce <say-as interpret-as="spell-out">BITS</say-as> <break time="100ms"/> So, what word do you want me to pronounce?`;

  return handlerInput.responseBuilder
    .reprompt(
      `What word do you want the pronunciation for? You can say things like, what is the pronunciation for <say-as interpret-as="spell-out">ROBOT</say-as>`
    )
    .withSimpleCard(
      `Welcome to Pronunciations`,
      `Examples:
Pronounce D. O. G.
How to pronounce B. I. T. S.
What is the pronunciation for C. A. T.
Ask pnonunciations to pronounce A. L. E. X. A.`
    )
    .addDirective({
      type: APLA_DOCUMENT_TYPE,
      document: launchSkillAudioDocument,
      datasources: launchSkillAudioDatasource(welcomeMessage),
    })
    .withShouldEndSession(false)
    .addDirective({
      type: APL_DOCUMENT_TYPE,
      version: APL_DOCUMENT_VERSION,
      document: skillInfoDocument,
      datasources: skillInfoDatasource(
        `I can help you with the pronunciations of English words and phrases. Just spell the word you want me to pronounce.<br><br>For example, you can say - `,
        `Alexa, open pronunciations<br>Alexa, ask pronunciations to pronounce G. Y. R. O.<br>Alexa, open pronunciations and help me pronounce W. A. L. T.<br>Alexa, pronounce the word D. O. U. B. T.`
      )
    })
    .getResponse();
}
