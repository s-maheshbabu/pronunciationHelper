require("app-module-path").addPath(__dirname);

const Alexa = require("ask-sdk");

const HowToPronounceIntentHandler = require("intenthandlers/HowToPronounceIntentHandler");
const CancelAndStopIntentHandler = require("intenthandlers/CancelAndStopIntentHandler");
const YesIntentHandler = require("intenthandlers/YesIntentHandler");
const NoIntentHandler = require("intenthandlers/NoIntentHandler");
const HelpIntentHandler = require("intenthandlers/HelpIntentHandler");

const LaunchRequestHandler = require("requesthandlers/LaunchRequestHandler");
const SessionEndedRequestHandler = require("requesthandlers/SessionEndedRequestHandler");
const SessionResumedRequestHandler = require("requesthandlers/SessionResumedRequestHandler");

const SpellCheckerInitializationInterceptor = require("interceptors/SpellCheckerInitializationInterceptor");
const APLSupportVerificationInterceptor = require("interceptors/APLSupportVerificationInterceptor");

const ResponseSanitizationInterceptor = require("interceptors/ResponseSanitizationInterceptor");

const ErrorHandler = require("errors/ErrorHandler");

// ***************************************************************************************************
// These simple interceptors just log the incoming and outgoing request bodies to assist in debugging.

const LogRequestInterceptor = {
  process(handlerInput) {
    console.log(`REQUEST ENVELOPE = ${JSON.stringify(handlerInput.requestEnvelope)}`);
  },
};

// --------------- Skill Initialization -----------------------
let skill;

exports.handler = async function (event, context) {
  if (!skill) {
    skill = Alexa.SkillBuilders.custom()
      .addRequestHandlers(
        CancelAndStopIntentHandler,
        YesIntentHandler,
        NoIntentHandler,
        LaunchRequestHandler,
        HowToPronounceIntentHandler,
        HelpIntentHandler,
        SessionEndedRequestHandler,
        SessionResumedRequestHandler,
      )
      .addRequestInterceptors(
        SpellCheckerInitializationInterceptor,
        APLSupportVerificationInterceptor,
        LogRequestInterceptor,
      )
      .addResponseInterceptors(ResponseSanitizationInterceptor)
      .addErrorHandlers(ErrorHandler)
      .create();
  }

  return skill.invoke(event, context);
};
