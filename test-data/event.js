// Invalid case where multi-part message has just one part. This should never happen in real world.
exports.event = String.raw`{
        "version": "1.0",
        "session": {
          "new": true,
          "sessionId": "amzn1.echo-api.session.05f123e6-1a95-4162-9050-6a18bcddb139",
          "application": {
            "applicationId": "%(mockApplicationId)s"
          },
          "user": {
            "userId":
              "amzn1.ask.account.AGNL757D3KVKOOLUH47FG2S7VA6F6OM7G5H2YULAUBLTUJVWLOUTEVT67VT5PHKUZABSN7X2STMY3KY2MX7SUMZPFIXKMQN46TJ6BKD7GTFILVALINR3MAWIETSJFFMKLXWC5FBWPKIVVEW57ACSE33E7M5BWH4QCVYDSIQSFHIETGRAZMNFP6WU4PJLOKZNQZKC57IJ2ZOEAUI"
          }
        },
        "context": {
          "AudioPlayer": {
            "playerActivity": "IDLE"
          },
          "Display": {
            "token": ""
          },
          "System": {
            "application": {
              "applicationId":
                "amzn1.echo-sdk-ams.app.22799827-aae1-4115-9b48-e2b74e33ee03"
            },
            "user": {
              "userId":
                "amzn1.ask.account.AGNL757D3KVKOOLUH47FG2S7VA6F6OM7G5H2YULAUBLTUJVWLOUTEVT67VT5PHKUZABSN7X2STMY3KY2MX7SUMZPFIXKMQN46TJ6BKD7GTFILVALINR3MAWIETSJFFMKLXWC5FBWPKIVVEW57ACSE33E7M5BWH4QCVYDSIQSFHIETGRAZMNFP6WU4PJLOKZNQZKC57IJ2ZOEAUI"
            },
            "device": {
              "deviceId":
                "amzn1.ask.device.AFMCILEOZYC7JAYUBXYGWD3EZBXX6IUYVGKLFM4WWNWFGIZAWK5GGKFQ3D3YO7YHX4YHOGROQ3B4N2EAZVIL2NKUVEMDSJZUNQFA5MGRHQVL563W2HREQUD3SGYFTTOJKUDYEUSCA5P25Z5P2HGLBSEWQHE4TUHGTRDA4WTXXZIJQAJH3VEOK",
              "supportedInterfaces": {
                "AudioPlayer": {},
                "Display": {
                  "templateVersion": "1.0",
                  "markupVersion": "1.0"
                }
              }
            },
            "apiEndpoint": "https://api.amazonalexa.com",
            "apiAccessToken":
              "eyJ0eXAiOiJKV1QiLCJhbGciOiJSUzI1NiIsImtpZCI6IjEifQ.eyJhdWQiOiJodHRwczovL2FwaS5hbWF6b25hbGV4YS5jb20iLCJpc3MiOiJBbGV4YVNraWxsS2l0Iiwic3ViIjoiYW16bjEuZWNoby1zZGstYW1zLmFwcC4yMjc5OTgyNy1hYWUxLTQxMTUtOWI0OC1lMmI3NGUzM2VlMDMiLCJleHAiOjE1MjE3OTI1ODgsImlhdCI6MTUyMTc4ODk4OCwibmJmIjoxNTIxNzg4OTg4LCJwcml2YXRlQ2xhaW1zIjp7ImNvbnNlbnRUb2tlbiI6bnVsbCwiZGV2aWNlSWQiOiJhbXpuMS5hc2suZGV2aWNlLkFGTUNJTEVPWllDN0pBWVVCWFlHV0QzRVpCWFg2SVVZVkdLTEZNNFdXTldGR0laQVdLNUdHS0ZRM0QzWU83WUhYNFlIT0dST1EzQjROMkVBWlZJTDJOS1VWRU1EU0paVU5RRkE1TUdSSFFWTDU2M1cySFJFUVVEM1NHWUZUVE9KS1VEWUVVU0NBNVAyNVo1UDJIR0xCU0VXUUhFNFRVSEdUUkRBNFdUWFhaSUpRQUpIM1ZFT0siLCJ1c2VySWQiOiJhbXpuMS5hc2suYWNjb3VudC5BR05MNzU3RDNLVktPT0xVSDQ3RkcyUzdWQTZGNk9NN0c1SDJZVUxBVUJMVFVKVldMT1VURVZUNjdWVDVQSEtVWkFCU043WDJTVE1ZM0tZMk1YN1NVTVpQRklYS01RTjQ2VEo2QktEN0dURklMVkFMSU5SM01BV0lFVFNKRkZNS0xYV0M1RkJXUEtJVlZFVzU3QUNTRTMzRTdNNUJXSDRRQ1ZZRFNJUVNGSElFVEdSQVpNTkZQNldVNFBKTE9LWk5RWktDNTdJSjJaT0VBVUkifX0.hopZlTd1KeSOjjxYaI280oJVgbmWSO_ZsaVSBsrWUMhckIyJc44rlX4ItUOa77bi0FN6LT9WauGfQja6MIpl9eeH347QnMxQf6OvezkEIDY3P2q6fE-oxgaggN8rSzqVLtnYTPFVcwW8U-wrowAHxiby7KIgmYIULwr9vYc1d7D5zDeKdTzS8aP17S-1-Ilr-wSu08bpwQ0yj5Lt3LB7SEk-z89zckPeRj_AoYYLm57rHGY3_6PbGKQ6U9cqWhUiu_zKNN0kbpS9nZpN9VyZZR2FNDy8FKzZERWqL9xH4rpN6CwO4My9GeogmK0H-JPFmWVEZA48piQeRdgZdR7Gug"
          }
        },
        "request": {
          "type": "IntentRequest",
          "requestId": "amzn1.echo-api.request.859f06f3-9f1d-4f8b-ac11-f1a26a371a42",
          "timestamp": "2018-03-23T07:09:48Z",
          "locale": "en-US",
          "intent": {
            "name": "HowToPronounceIntent",
            "confirmationStatus": "NONE",
            "slots": {
              "Spelling": {
                "name": "Spelling",
                "value": "DO G",
                "resolutions": {
                  "resolutionsPerAuthority": [
                    {
                      "authority":
                        "amzn1.er-authority.echo-sdk.amzn1.echo-sdk-ams.app.22799827-aae1-4115-9b48-e2b74e33ee03.ALL_WORDS",
                      "status": {
                        "code": "ER_SUCCESS_MATCH"
                      },
                      "values": [
                        {
                          "value": {
                            "name": "d. o. g.",
                            "id": "c48896abe3ed3840e38f7c0459022dc3"
                          }
                        },
                        {
                          "value": {
                            "name": "d. o. d. g. e.",
                            "id": "63e2cd9271a0b89f1bcec455a09c3f74"
                          }
                        },
                        {
                          "value": {
                            "name": "d. o. i. n. g.",
                            "id": "b8e71b1a5c5568ebc7d547049c0fe9ce"
                          }
                        },
                        {
                          "value": {
                            "name": "d. i. a. l. o. g.",
                            "id": "407794ec09458d7e8af771b368e6d876"
                          }
                        },
                        {
                          "value": {
                            "name": "l. o. d. g. e.",
                            "id": "e0c461a24ba746c0d088882a3b6951c1"
                          }
                        }
                      ]
                    }
                  ]
                },
                "confirmationStatus": "NONE"
              }
            }
          }
        }
      }      
  `;
