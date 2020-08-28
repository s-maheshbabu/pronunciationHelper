const STATES = require("constants/States").states;

module.exports = NoIntentHandler = {
  canHandle(handlerInput) {
    return (
      handlerInput.requestEnvelope.request.type === "IntentRequest" &&
      handlerInput.requestEnvelope.request.intent.name === "AMAZON.NoIntent"
    );
  },
  handle(handlerInput) {
    const { attributesManager, responseBuilder } = handlerInput;

    const sessionAttributes = attributesManager.getSessionAttributes() || {};
    if (
      !(sessionAttributes.state === STATES.SUGGEST_CORRECT_SPELLINGS &&
        Array.isArray(sessionAttributes.suggestedSpellings) &&
        sessionAttributes.suggestedSpellings.length)
    )
      console.log(`User said 'No' at an unexpected state. This log is to track how often it happens. This could help us improve the voice interaction model.`);

    return responseBuilder
      .speak("Okay.")
      .withShouldEndSession(true)
      .getResponse();
  }
};
