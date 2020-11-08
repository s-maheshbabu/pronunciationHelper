const hasIn = require("immutable").hasIn;
const APL_CONSTANTS = require("constants/APL");

/**
 * Sanitize the response. Retains the APL directives only if the
 * device supports APL and the requests are intent requests.
 */
module.exports = ResponseSanitizationInterceptor = {
  process(handlerInput, response) {
    const { requestEnvelope } = handlerInput;
    if (
      !hasIn(requestEnvelope, [
        "context",
        "System",
        "device",
        "supportedInterfaces",
        "Alexa.Presentation.APL"
      ]) && Array.isArray(response.directives)
    ) {
      console.log(`Stripping APL directives.`);
      response.directives = response.directives.filter(directive => directive.type !== APL_CONSTANTS.APL_DOCUMENT_TYPE)
    }

    return Promise.resolve();
  }
};
