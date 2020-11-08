const Alexa = require("ask-sdk");

const APL_INTERFACE = require("constants/APL").APL_INTERFACE;
const applinks = require("constants/Constants").applinks;

/**
 * Helper method to determine if device supports APL.
 */
const isAplDevice = (handlerInput) => {
    const { requestEnvelope } = handlerInput;
    return Alexa.getSupportedInterfaces(requestEnvelope).hasOwnProperty(APL_INTERFACE)
}

/**
 * Helper method to determine if AppLinks interface is supported.
 */
const isAppLinksSupported = (handlerInput) => {
    return handlerInput.requestEnvelope.context[applinks.APP_LINK_INTERFACE] !== undefined;
}

module.exports = {
    isAplDevice: isAplDevice,
    isAppLinksSupported: isAppLinksSupported,
};