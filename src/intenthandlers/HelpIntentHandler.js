const APL_CONSTANTS = require("constants/APL");

const APL_DOCUMENT_TYPE = APL_CONSTANTS.APL_DOCUMENT_TYPE;
const APL_DOCUMENT_VERSION = APL_CONSTANTS.APL_DOCUMENT_VERSION;

const skillInfoDocument = require("apl/document/SkillInfoDocument.json");
const skillInfoDatasource = require("apl/data/SkillInfoDatasource");

module.exports = HelpIntentHandler = {
  canHandle(handlerInput) {
    return (
      handlerInput.requestEnvelope.request.type === "IntentRequest" &&
      handlerInput.requestEnvelope.request.intent.name === "AMAZON.HelpIntent"
    );
  },
  handle(handlerInput) {
    const helpText = `I can help you pronounce English words in my accent. You just need to spell the word you need the pronunciation for. For example, you can say, pronounce <say-as interpret-as="spell-out">BITS</say-as> <break time="100ms"/> and I will tell you that it is pronounced as bits. So go ahead and spell the word you want me to pronounce.`;
    const helpRepromptText = `What word do you want the pronunciation for? You can say things like, what is the pronunciation for <say-as interpret-as="spell-out">ROBOT</say-as>`;

    return handlerInput.responseBuilder
      .speak(helpText)
      .reprompt(helpRepromptText)
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
};
