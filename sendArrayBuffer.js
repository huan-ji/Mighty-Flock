const sendArrayBuffer = function (arrayBuffer) {
  return new Promise((resolve, reject) => {
    const xhr = new XMLHttpRequest();
    const url = 'https://access-alexa-na.amazon.com/v1/avs/speechrecognizer/recognize';

    xhr.open('POST', url, true);
    xhr.responseType = 'arraybuffer';
    xhr.onload = (event) => {
      if (xhr.status === 200) {
      } else {
        let error = new Error('An error occured with request.');
      }
    };

    xhr.onerror = (error) => {
      console.log(error);
    };

    const BOUNDARY = 'BOUNDARY1234';

    xhr.setRequestHeader('Authorization', `Bearer ${avs._token}`);
    xhr.setRequestHeader('Content-Type', 'multipart/form-data; boundary=' + BOUNDARY);
    xhr.send(arrayBuffer);
  });
}

module.exports = sendArrayBuffer;
