const Alexa = require('ask-sdk-core');
const APL_INTERFACE = require("constants/APL").APL_INTERFACE;

/**
 * Helper method to determine if device supports APL.
 */
const isAplDevice = (handlerInput) => {
    const { requestEnvelope } = handlerInput;
    return Alexa.getSupportedInterfaces(requestEnvelope).hasOwnProperty(APL_INTERFACE)
}

module.exports = {
    isAplDevice: isAplDevice,
};