// Invalid case where multi-part message has just one part. This should never happen in real world.
exports.event = String.raw`{
  "session": {
    "new": true,
    "sessionId": "SessionId.1b9fb1fd-a94e-4832-ba95-2e54581e914a",
    "application": {
      "applicationId": "%(mockApplicationId)s"
    },
    "attributes": {},
    "user": {
      "userId": "amzn1.ask.account.AGNL757D3KVKOOLUH47FG2S7VA6F6OM7G5H2YULAUBLTUJVWLOUTEVT67VT5PHKUZABSN7X2STMY3KY2MX7SUMZPFIXKMQN46TJ6BKD7GTFILVALINR3MAWIETSJFFMKLXWC5FBWPKIVVEW57ACSE33E7M5BWH4QCVYDSIQSFHIETGRAZMNFP6WU4PJLOKZNQZKC57IJ2ZOEAUI"
    }
  },
  "request": {
    "type": "LaunchRequest",
    "requestId": "EdwRequestId.a03cdef1-9ecb-4628-8729-aca9f655da75",
    "locale": "en-US",
    "timestamp": "2018-03-23T22:22:40Z"
  },
  "context": {
    "AudioPlayer": {
      "playerActivity": "IDLE"
    },
    "System": {
      "application": {
        "applicationId": "amzn1.echo-sdk-ams.app.22799827-aae1-4115-9b48-e2b74e33ee03"
      },
      "user": {
        "userId": "amzn1.ask.account.AGNL757D3KVKOOLUH47FG2S7VA6F6OM7G5H2YULAUBLTUJVWLOUTEVT67VT5PHKUZABSN7X2STMY3KY2MX7SUMZPFIXKMQN46TJ6BKD7GTFILVALINR3MAWIETSJFFMKLXWC5FBWPKIVVEW57ACSE33E7M5BWH4QCVYDSIQSFHIETGRAZMNFP6WU4PJLOKZNQZKC57IJ2ZOEAUI"
      },
      "device": {
        "supportedInterfaces": {}
      }
    }
  },
  "version": "1.0"
}    
  `;
