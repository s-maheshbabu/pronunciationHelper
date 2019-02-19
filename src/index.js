require("app-module-path").addPath(__dirname);

const Alexa = require("ask-sdk");

const HowToPronounceIntentHandler = require("intenthandlers/HowToPronounceIntentHandler");
const CancelAndStopAndNoIntentHandler = require("intenthandlers/CancelAndStopAndNoIntentHandler");
const YesIntentHandler = require("intenthandlers/YesIntentHandler");
const HelpIntentHandler = require("intenthandlers/HelpIntentHandler");

const LaunchRequestHandler = require("requesthandlers/LaunchRequestHandler");
const SessionEndedRequestHandler = require("requesthandlers/SessionEndedRequestHandler");

const SpellCheckerInitializationInterceptor = require("interceptors/SpellCheckerInitializationInterceptor");
const APLSupportVerificationInterceptor = require("interceptors/APLSupportVerificationInterceptor");

const ErrorHandler = require("errors/ErrorHandler");

// --------------- Skill Initialization -----------------------
let skill;

exports.handler = async function(event, context) {
  if (!skill) {
    skill = Alexa.SkillBuilders.custom()
      .addRequestHandlers(
        CancelAndStopAndNoIntentHandler,
        YesIntentHandler,
        LaunchRequestHandler,
        HowToPronounceIntentHandler,
        HelpIntentHandler,
        SessionEndedRequestHandler
      )
      .addRequestInterceptors(
        SpellCheckerInitializationInterceptor,
        APLSupportVerificationInterceptor
      )
      .addErrorHandlers(ErrorHandler)
      .create();
  }

  return skill.invoke(event, context);
};
