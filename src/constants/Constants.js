const applinks = Object.freeze({
    APP_LINK_INTERFACE: "AppLink",
    SPEAK_PROMPT_BEHAVIOR: "SPEAK",
    UNIVERSAL_APP_LINK_TYPE: "UNIVERSAL_LINK",
});

const ios = Object.freeze({
    DICTIONARY_IDENTIFIER: "id399452287",
    STORE_TYPE: "IOS_APP_STORE",
});

const android = Object.freeze({
    DICTIONARY_IDENTIFIER: "com.merriamwebster",
    STORE_TYPE: "GOOGLE_PLAY_STORE",
});

module.exports = {
    android: android,
    applinks: applinks,
    ios: ios,
};
