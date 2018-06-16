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
    .getResponse();
}
