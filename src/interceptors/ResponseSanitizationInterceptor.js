const hasIn = require("immutable").hasIn;

/**
 * Sanitize the response. Retains the right directives based
 * on the device's capabilities.
 */
module.exports = ResponseSanitizationInterceptor = {
  process(handlerInput, response) {
    const { requestEnvelope } = handlerInput;
    if (
      hasIn(requestEnvelope, [
        "context",
        "System",
        "device",
        "supportedInterfaces",
        "Alexa.Presentation.APL"
      ])
    ) {
      response.card = undefined;
    } else {
      response.directives = undefined;
    }

    return Promise.resolve();
  }
};
