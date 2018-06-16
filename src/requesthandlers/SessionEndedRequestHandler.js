module.exports = SessionEndedRequestHandler = {
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
