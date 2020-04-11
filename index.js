window.onload = () => {
      window.steps = [
        {
          // find me a running partner
          transcriptInclusions: ['find', 'running', 'partner'],
          includeAll: true,
          response: 'Sure. What kind of run would you like to go on?'
        },
        {
          // interval running
          transcriptInclusions: ['interval'],
          response: 'Sounds good. I found 13 runners in your neighborhood. Would you like me to choose one at random?'
        },
        {
          // yes, choose one at random
          transcriptInclusions: ['yes', 'yeah', 'okay', 'sure', 'please', 'random'],
          response: 'Great, you\'ve been matched with Jeff. Please meet them at 1287 West Walnut Street, Philadelphia, PA, 19125. Would you like me to send the address to your phone?'
        },
        {
          // yes, please send
          // no thanks, i'm good
          transcriptInclusions: ['yes', 'yeah', 'okay', 'sure', 'please', 'no', 'thanks', 'good'],
          response: 'Sounds good. Have a great run!'
        }
      ];
      window.step = 0;
      // Checks if SpeechRecognition exsists in the current browser
      var SpeechRecognition = window.SpeechRecognition ||
      window.webkitSpeechRecognition ||
      window.mozSpeechRecognition ||
      window.msSpeechRecognition ||
      window.oSpeechRecognition;

    // If SpeechRecognition exsists, create a new class with options
    if (SpeechRecognition !== undefined) {
      window.recognition = new SpeechRecognition();
      window.recognition.interimResults = true;
      window.recognition.continuous = true;
      window.recognition.start();
      window.recognition.onresult = updateTranscript.bind(this);

      window.voice = window.speechSynthesis;
    }

    function updateTranscript(event) {
      let interimTranscript = '';
      let finalTranscript = '';
      for (let i = event.resultIndex; i < event.results.length; ++i) {
        // if we are on the final transcript
        if (event.results[i].isFinal && (event.results[i][0].confidence > 0)) {
          // If the SpeechRecognizes this result as final, set it to the component
          finalTranscript = event.results[i][0].transcript.toLowerCase();
          // add final transcript to redux to be used in other components
          document.getElementById('previousTranscript').innerHTML += finalTranscript + '<br>';
          document.getElementById('currentTranscript').innerHTML = '';
          window.recognition.stop();
          evaluateTranscript(finalTranscript);

        } else {
          // Concat all interim strings
          interimTranscript = concatTranscripts(interimTranscript, event.results[i][0].transcript);
          document.getElementById('currentTranscript').innerHTML = interimTranscript;
        }
      }
    }

    function concatTranscripts(...transcriptParts) {
      return transcriptParts.map(t => t.trim()).join(' ').trim();
    }

    function evaluateTranscript (finalTranscript) {
      let understands = true;
      let returnStr = ''
      if (window.steps[window.step].includeAll) {
        window.steps[window.step].transcriptInclusions.forEach(str => {
          if (understands) {
            understands = finalTranscript.includes(str);
          }
        });
      }
      else {
        for (let i = 0; i < window.steps[window.step].transcriptInclusions.length; i++) {
          let str = window.steps[window.step].transcriptInclusions[i];
          understands = finalTranscript.includes(str);
          if (understands) {
            break;
          }
        }
      }
      if (understands) {
        returnStr = window.steps[window.step].response;
        window.step++;
      }
      else {
        let suffix = window.step ? window.steps[window.step - 1].response : 'Please try again.';
        returnStr = 'I don\'t understand that. ' + suffix;
      }

      document.getElementById('currentTranscript').innerHTML = returnStr;
      var voiceOut = new SpeechSynthesisUtterance(returnStr);
      window.voice.speak(voiceOut);
      
      if (window.step < window.steps.length) {
        voiceOut.onend = ()=>{
          window.recognition.start();
          document.getElementById('previousTranscript').style.top = document.getElementById('previousTranscript').style.top - 10;
          document.getElementById('previousTranscript').innerHTML += returnStr + '<br>';
          document.getElementById('currentTranscript').innerHTML = '';
        }
      }
    }
}
