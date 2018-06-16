module.exports = HelpIntentHandler = {
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
