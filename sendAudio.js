function sendAudio(dataView) {
  avs.sendAudio(dataView)
  .then(({xhr, response}) => {

    var promises = [];
    var audioMap = {};
    var directives = null;

    if (response.multipart.length) {
      response.multipart.forEach(multipart => {
        let body = multipart.body;
        if (multipart.headers && multipart.headers['Content-Type'] === 'application/json') {
          try {
            body = JSON.parse(body);
          } catch(error) {
            console.error(error);
          }

          if (body && body.messageBody && body.messageBody.directives) {
            directives = body.messageBody.directives;
          }
        } else if (multipart.headers['Content-Type'] === 'audio/mpeg') {
          const start = multipart.meta.body.byteOffset.start;
          const end = multipart.meta.body.byteOffset.end;

          /**
           * Not sure if bug in buffer module or in http message parser
           * because it's joining arraybuffers so I have to this to
           * seperate them out.
           */
          var slicedBody = xhr.response.slice(start, end);

          //promises.push(avs.player.enqueue(slicedBody));
          audioMap[multipart.headers['Content-ID']] = slicedBody;
        }
      });

      function findAudioFromContentId(contentId) {
        contentId = contentId.replace('cid:', '');
        for (var key in audioMap) {
          if (key.indexOf(contentId) > -1) {
            return audioMap[key];
          }
        }
      }

      directives.forEach(directive => {
        if (directive.namespace === 'SpeechSynthesizer') {
          if (directive.name === 'speak') {
            const contentId = directive.payload.audioContent;
            const audio = findAudioFromContentId(contentId);
            if (audio) {
              avs.audioToBlob(audio)
              .then(blob => logAudioBlob(blob, 'RESPONSE'));
              promises.push(avs.player.enqueue(audio));
            }
          }
        } else if (directive.namespace === 'AudioPlayer') {
          if (directive.name === 'play') {
            const streams = directive.payload.audioItem.streams;
            streams.forEach(stream => {
              const streamUrl = stream.streamUrl;

              const audio = findAudioFromContentId(streamUrl);
              if (audio) {
                avs.audioToBlob(audio)
                .then(blob => logAudioBlob(blob, 'RESPONSE'));
                promises.push(avs.player.enqueue(audio));
              } else if (streamUrl.indexOf('http') > -1) {
                const xhr = new XMLHttpRequest();
                const url = `/parse-m3u?url=${streamUrl.replace(/!.*$/, '')}`;
                xhr.open('GET', url, true);
                xhr.responseType = 'json';
                xhr.onload = (event) => {
                  const urls = event.currentTarget.response;

                  urls.forEach(url => {
                    avs.player.enqueue(url);
                  });
                };
                xhr.send();
              }
            });
          } else if (directive.namespace === 'SpeechRecognizer') {
            if (directive.name === 'listen') {
              const timeout = directive.payload.timeoutIntervalInMillis;
              // enable mic
            }
          }
        }
      });

      if (promises.length) {
        Promise.all(promises)
       .then(() => {
          avs.player.playQueue()
        });
      }
    }

  })
  .catch(error => {
    console.error(error);
  });
};

module.exports = sendAudio;
