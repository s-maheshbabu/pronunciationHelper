/**
 * Sets the isAPLSupported flag to true if the device supports
 * Alexa Presentation Language. Otherwise, the flag remains undefined.
 */
module.exports = APLSupportVerificationInterceptor = {
  process(handlerInput) {
    const { requestEnvelope, attributesManager } = handlerInput;
    const attributes = attributesManager.getSessionAttributes() || {};

    if (
      requestEnvelope.context.System.device.supportedInterfaces[
        "Alexa.Presentation.APL"
      ]
    ) {
      attributes.isAPLSupported = true;
    }
  }
};
