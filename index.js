/* global $ */
'use strict';

/******************************************************** 
 Main arrays
********************************************************/

let QUESTIONS = [];  // Nothing to see here until the data is fetched from the Open Trivia Database (https://opentdb.com/)

/******************************************************** 
 json data packet variables 
********************************************************/

const JSON = {  // All the variables connected to the json packet go here.
  endpoint: 'https://opentdb.com/',
  apiKey: '',
  amount: 10,
  category: 9,
  type: '',
  questionsArray: []
};

/******************************************************** 
 All global variables here. 
********************************************************/

const STORE = {  // All the variables connected with the state of the DOM go here.
  currentQuestion: 0,
  currentView: 'splash',
  currentScore: 0,
  radioButtonClicked: false
};

/******************************************************** 
Step 1: Render the DOM. 
********************************************************/

const GetAPIPacket = {  // Gets questions data from the Open Trivia Database (https://opentdb.com/).
  getJsonKey: function(){
    console.log('In the getKey method');
    $.getJSON(`${JSON.endpoint}api_token.php?command=request`, function(json){
      //console.log(json.token);
      if(json.token!==''){
        JSON.apiKey=json.token;
      }
    });
    this.getJsonQuestions();
  },

  getJsonQuestions: function(){
    console.log('In the getJsonQuestions method');
    let tempObj={
      category: JSON.category===0  ? '' : `&category=${JSON.category}`,
      type: JSON.type===''  ? '' : `&type=${JSON.type}`,
      token: JSON.apiKey==='' ? '' : `&token=${JSON.apiKey}`
    };
    if(JSON.amount===0){
      JSON.amount=5;
    }
    $.getJSON(`${JSON.endpoint}api.php?amount=${JSON.amount}${tempObj.category}${tempObj.type}${tempObj.token}`, function(json){
      console.log('In the json callback function');
      console.log(`${JSON.endpoint}api.php?amount=${JSON.amount}${tempObj.category}${tempObj.type}${tempObj.token}`);
      JSON.questionsArray=[];
      QUESTIONS=[];
      console.log(JSON.questionsArray);    
      JSON.questionsArray=json.results;
      GetAPIPacket.pushToQUESTIONS();
    }).fail(function() {
      console.log( 'error' );
    });
  },

  pushToQUESTIONS: function(){
    let newQuestion='';
    let newChoice1='';
    let newChoice2='';
    let newChoice3='';
    let newChoice4='';
    let newChoiceCount=0;
    for(let i=0; i<JSON.amount; i++){
      newQuestion=JSON.questionsArray[i].question;
      newChoice1=JSON.questionsArray[i].correct_answer;
      newChoice2=JSON.questionsArray[i].incorrect_answers[0];
      if(JSON.questionsArray[i].type==='multiple'){
        console.log('Adding a multiple question');
        newChoiceCount=4;
        newChoice3=JSON.questionsArray[i].incorrect_answers[1];
        newChoice4=JSON.questionsArray[i].incorrect_answers[2];        
      } else {
        console.log('Adding a boolean question');
        newChoiceCount=2;
        newChoice3='';
        newChoice4='';
      }
      QUESTIONS.push({
        question: newQuestion,
        answer1: newChoice1,
        answer2: newChoice2,
        answer3: newChoice3,
        answer4: newChoice4,
        correct: 0,
        userChoice: 0,
        choiceCount: newChoiceCount,
      });
    }
    scrambleChoices.doScrambling();
  }  
};

const scrambleChoices = {  // First answer is always right. Scramble the choices so that's not so.
  doScrambling: function(){
    console.log('In the doScrambling method');
    for(let i=0; i<QUESTIONS.length; i++){
      let rightChoice=QUESTIONS[i].answer1;
      let wrongChoices=[];
      wrongChoices.push('');
      wrongChoices.push(QUESTIONS[i].answer2);
      if(QUESTIONS[i].choiceCount===4){
        wrongChoices.push(QUESTIONS[i].answer3);
        wrongChoices.push(QUESTIONS[i].answer4);      
      }
      let seqArr=[];
      if(QUESTIONS[i].choiceCount===4){
        seqArr=[1,2,3,4];     
      } else {
        seqArr=[1,2];
      }
      let rndPos=0;
      let rndArr=[];
      for(let j=QUESTIONS[i].choiceCount; j>1; j--){
        rndPos=this.pickNum(1,j);
        rndArr.push(seqArr.splice(rndPos-1,1));
      }
      rndArr.push(seqArr.splice(0,1));
      // rndArr.push(seqArr[0]);
      let newAnswers=[];
      let pos=0;
      for(let j=0; j<QUESTIONS[i].choiceCount; j++){
        pos = rndArr[j];
        newAnswers.push(wrongChoices[pos-1]);   
      }
      for(let j=1; j<=QUESTIONS[i].choiceCount; j++){
        QUESTIONS[i]['answer'+j]=newAnswers[j-1];
        if(QUESTIONS[i]['answer'+j]===''){
          QUESTIONS[i]['answer'+j]=rightChoice;
          QUESTIONS[i].correct=j;
        }
      }
    }
    if(STORE.currentView==='settings'){
      STORE.currentScore = 0;
      STORE.radioButtonClicked = false;
      FlipPages.nextView();
      RenderPage.doShowPages();
    }
  },

  pickNum: function(min, max){
    console.log('In the pickNum method');
    min = Math.ceil(min);
    max = Math.floor(max);
    return Math.floor(Math.random() * (max - min + 1)) + min;
  }
};

const RenderPage = {  // Determines what HTML to display based on the current state.
  doShowPages: function(){
    console.log('In the doShowPages method.');
    if (STORE.currentQuestion===0 && STORE.currentView==='splash'){
      this.splashPage();
    }
    if (STORE.currentQuestion===0 && STORE.currentView==='settings'){
      this.settingsPage();
    }
    if (STORE.currentQuestion>=1 && STORE.currentQuestion<=QUESTIONS.length && STORE.currentView==='question'){
      this.questionsPage();
    }
    if (STORE.currentQuestion>=1 && STORE.currentQuestion<=QUESTIONS.length && STORE.currentView==='feedback'){
      this.feedBackPage();
    }
    if(STORE.currentQuestion === QUESTIONS.length && STORE.currentView === 'wrap'){
      this.wrapPage();
    }
  },

  splashPage: function(){
    console.log('In the splashPage method.');
    $('#js-userButton').html('START');
    $('div.js-pageViewSplashHTML').show();
    $('div.js-pageViewSettingsHTML').hide();
    $('div.js-pageViewQuestionHTML').hide();
    $('div.js-pageViewFeedBackHTML').hide();
    $('div.js-pageViewWrapHTML').hide();
  },

  settingsPage: function(){
    console.log('In the settingsPage method.');
    $('#js-userButton').html('ONWARD!');
    $('div.js-pageViewSplashHTML').hide();
    $('div.js-pageViewSettingsHTML').show();
    $('div.js-pageViewQuestionHTML').hide();
    $('div.js-pageViewFeedBackHTML').hide();
    $('div.js-pageViewWrapHTML').hide();
  },

  questionsPage: function(){
    console.log('In the questionsPage method.');
    $('#js-userButton').html('ENTER');
    $('.js-scoreBox').html(`Score: ${STORE.currentScore} of ${QUESTIONS.length}`);
    $('.js-questionCounter').html(`Question: ${STORE.currentQuestion} of ${QUESTIONS.length}`);
    this.renderQuestions();
    if(QUESTIONS[STORE.currentQuestion-1].answer3===''){  // true-false question
      $('.js-twoMore').hide();
      document.getElementById('js-radioButtonBox').setAttribute('class','js-twoQuestionBox');
    } else {
      $('.js-twoMore').show();
      document.getElementById('js-radioButtonBox').setAttribute('class','js-fourQuestionBox');
    }
    document.getElementById('js-userButton').setAttribute('class','js-userbutton disabled');
    $('div.js-pageViewSplashHTML').hide();
    $('div.js-pageViewSettingsHTML').hide();
    $('div.js-pageViewQuestionHTML').show();
    $('div.js-pageViewFeedBackHTML').hide();
    $('div.js-pageViewWrapHTML').hide();
  },

  feedBackPage: function(){
    console.log('In the feedbackPage method.');
    $('#js-userButton').html('CONTINUE');
    $('.js-feedbackQuestion').html(QUESTIONS[STORE.currentQuestion-1].question);
    $('.js-correctAnswer').html('THE ANSWER IS:<br/>'+QUESTIONS[STORE.currentQuestion-1]['answer'+QUESTIONS[STORE.currentQuestion-1].correct]);
    $('.js-userAnswer').html('YOUR ANSWER:<br/>'+QUESTIONS[STORE.currentQuestion-1]['answer'+QUESTIONS[STORE.currentQuestion-1].userChoice]);
    if(QUESTIONS[STORE.currentQuestion-1].userChoice+'' === QUESTIONS[STORE.currentQuestion-1].correct+''){
      STORE.currentScore++;
      $('.js-feedBackImageRight').show();
      $('.js-feedBackImageWrong').hide();
      $('.js-userAnswer').hide();
    } else {
      $('.js-feedBackImageRight').hide();
      $('.js-feedBackImageWrong').show();
      $('.js-userAnswer').show();     
    }
    $('.js-scoreBox').html(`Score: ${STORE.currentScore} of ${QUESTIONS.length}`);
    $('.js-questionCounter').html(`Question: ${STORE.currentQuestion} of ${QUESTIONS.length}`);
    $('div.js-pageViewSplashHTML').hide();
    $('div.js-pageViewSettingsHTML').hide();
    $('div.js-pageViewQuestionHTML').hide();
    $('div.js-pageViewFeedBackHTML').show();
    $('div.js-pageViewWrapHTML').hide();
  },

  wrapPage: function(){
    console.log('In the wrapPage method.');
    let listHTML='';
    for(let i=0; i<QUESTIONS.length; i++) {
      if((QUESTIONS[i].correct+''!==QUESTIONS[i].userChoice+'') && QUESTIONS[i].choiceCount+''==='4'){
        listHTML+=`<li>${QUESTIONS[i].question}<br/>Answer: <span class='js-correct'>${QUESTIONS[i]['answer'+QUESTIONS[i].correct]}</span><br/>Yours: <span class='js-incorrect'>${QUESTIONS[i]['answer'+QUESTIONS[i].userChoice]}  X</span></li>`;
      } else if((QUESTIONS[i].correct+''!==QUESTIONS[i].userChoice+'') && QUESTIONS[i].choiceCount+''==='2'){
        listHTML+=`<li>${QUESTIONS[i].question}<br/>Yours: <span class='js-incorrect'>${QUESTIONS[i]['answer'+QUESTIONS[i].userChoice]}  X</span></li>`;
      } else {
        listHTML+=`<li>${QUESTIONS[i].question}<br/>Yours: <span class='js-correct'>${QUESTIONS[i]['answer'+QUESTIONS[i].userChoice]}  ✔</span></li>`;
      }
    }
    $('#js-userButton').html('PLAY AGAIN?');
    $('.js-scoreBox').html(`Score: ${STORE.currentScore} of ${QUESTIONS.length}`);
    let newPercent=(STORE.currentScore/STORE.currentQuestion)*100;
    $('.js-scorePercent').html(Math.round((newPercent + 0.00001) * 100) / 100 + '%');
    $('.js-evalList').html(listHTML);
    $('div.js-pageViewSplashHTML').hide();
    $('div.js-pageViewSettingsHTML').hide();
    $('div.js-pageViewQuestionHTML').hide();
    $('div.js-pageViewFeedBackHTML').hide();
    $('div.js-pageViewWrapHTML').show();
  },

  renderQuestions: function(){
    console.log('In the renderQuestions method.');
    //only if the STORE is on pages that show questions
    $('.js-screenQuestion').html(QUESTIONS[STORE.currentQuestion-1].question);
    $('#js-choice1').html(QUESTIONS[STORE.currentQuestion-1].answer1);
    $('#js-choice2').html(QUESTIONS[STORE.currentQuestion-1].answer2);
    $('#js-choice3').html(QUESTIONS[STORE.currentQuestion-1].answer3);
    $('#js-choice4').html(QUESTIONS[STORE.currentQuestion-1].answer4);
    $('div.js-pageViewQuestionHTML').show();
  }
};

const GenerateHTML = {  // Here's where the extra HTML comes from.
  doHtmlPages: function(){
    console.log('In the doHtmlPages method.');
    this.splashHtml();
    this.settingsHtml();
    this.questionHtml();
    this.feedBackHtml();
    this.wrapHtml();
  },

  splashHtml: function(){
    console.log('In the splashHtml method.');
    // Set up splash page, then hide it.

    let quizSplashHTML = `
      <div class='js-settingsPage'>
        <img src="splash.jpg" class="js-splashImage" alt="Intro screen: Let's get Thinkful, because it's Quiz Time! Picture of cartoon person at 
        the beach in a thinking pose next to a huge red question mark.">
        <button type = 'button' id='js-settingsButton' class='none'>Settings</button>
      </div>`;

    $('div.js-pageViewSplashHTML').html(quizSplashHTML);
    $('div.js-pageViewSplashHTML').hide();
  },

  settingsHtml: function(){
    console.log('In the settingsHtml method.');
    // Set up splash page, then hide it.

    let quizSettingsHTML = `
      <div class='js-settingsPage'>
        <img src="settings.jpg" class="js-settingsImage" alt="Settings screen: picture of machinery and gauges.">
      </div>

      <form action='/userSettings' method='post' class='js-settingsForm'>
        <span class='js-1stWidget'>
          <label for='js-questionsToDo' class='js-questionsPickerLabel'>How many questions?</label>
          <select id='js-questionsToDo'>
            <option value=10>10 questions</option>
            <option value=20>20 questions</option>
            <option value=30>30 questions</option>
            <option value=40>40 questions</option>
            <option value=50>50 questions</option>
          </select>
        </span>

        <span class='js-2ndWidget'>
          <label for='js-category' class='js-categoryPickerLabel'>Which category?</label>
          <select id='js-category'>
            <option value=9>General Knowledge</option>
            <option value=21>Sports</option>
            <option value=20>Mythology</option>
            <option value=23>History</option>
            <option value=12>Music</option>
          </select>
        </span>
      </form>`;

    $('div.js-pageViewSettingsHTML').html(quizSettingsHTML);
    $('div.js-pageViewSettingsHTML').hide();
  },

  questionHtml: function(){
    console.log('In the questionHtml method.');
    // Set up question page, then hide it.

    let quizQuestionsHTML = `
      <div class='js-settingsPage'>
        <img src='questions.jpg' class='js-questionsImage' alt='Question screen: picture of a person walking out of fog.'>
      </div>
      <span class='js-scoreBox'></span>
      <span class='js-questionCounter'></span>
        <span class='js-screenQuestion'></span>
        <span id='js-radioButtonBox' class='none'>
          <span class='js-radioButton' name='js-radioButton'>
            <input type='radio' name='choices' value=1>
            <label for='choice1' id='js-choice1'></label><br/>            
            <input type='radio' name='choices' value=2>
            <label for='choice1' id='js-choice2'></label><br/>            
            <span class='js-twoMore'><input type='radio' name='choices' value=3>
            <label for='choice1' id='js-choice3'></label><br/>            
            <input type='radio' name='choices' value=4>
            <label for='choice1' id='js-choice4'></label><br/></span>
          </span>
        </span>
    `;
    // NOTE: The question and the five choices will be inserted in the correct places above, in renderQuestions().
    $('div.js-pageViewQuestionHTML').html(quizQuestionsHTML);
    $('div.js-pageViewQuestionHTML').hide();
  },

  feedBackHtml: function(){
    console.log('In the feedBackHtml method.');
    // Set up feedback page, then hide it.

    let quizFeedbackHTML = `
      <div class='js-settingsPage'>
        <img src='feedback.jpg' class='js-feedbackImage' alt='Feedback screen: picture of mountains in the mist.'>
      </div>
      <span class='js-scoreBox'></span>
      <span class='js-questionCounter'></span>
      <img src="Right.png" class="js-feedBackImageRight" alt="Big green check mark"></span>
      <img src="Wrong.png" class="js-feedBackImageWrong" alt="Big red X"></span>
      <span class='js-feedbackQuestion'></span><br/>
      <span class='js-correctAnswer'></span><br/>
      <span class='js-userAnswer'><br/></span>
      <br/>
      <br/>
      <br/>
    `;
    $('div.js-pageViewFeedBackHTML').html(quizFeedbackHTML);
    $('div.js-pageViewFeedBackHTML').hide();
  },

  wrapHtml: function(){
    console.log('In the wrapHtml method.');
    // Set up wrap page, then hide it.

    let quizWrapHTML = `
      <div class='js-settingsPage'>
        <img src='wrap.jpg' class='js-wrapImage' alt='Wrap-up of quiz screen: picture of a sunset.'>
      </div>
      <span class='js-scoreBox'></span>
      <span class='js-wrapScore'>Here's how you did:<br/>
        <span class='js-scorePercent'></span>
      </span>
      <ol class='js-evalList'></ol>
      <br/>
    `;
    $('div.js-pageViewWrapHTML').html(quizWrapHTML);
    $('div.js-pageViewWrapHTML').hide();
  }
};

/******************************************************** 
 * Step 2: Listen for user interactions.
 ********************************************************/

const Listeners = {  // All listener methods. More to come here.
  listen: function(){
    console.log('In the listen method');
    this.handleUserButton();
    this.handleRadioButtonClicked();
    this.handleSettingsButton();
  },

  handleUserButton: function(){
    console.log('In the handleUserButton method');
    $('#js-userButton').on('click', function() {
      $('input[name=choices]').prop('checked', false);
      console.log('Main button clicked.');
      if(STORE.currentView==='settings'){
        GetAPIPacket.getJsonKey();
        // STORE.currentScore = 0;
        // STORE.radioButtonClicked = false;
        // FlipPages.nextView();
        // RenderPage.doShowPages();
      } else if(!(STORE.currentView==='question' && STORE.radioButtonClicked===false)){
        FlipPages.nextView();
        RenderPage.doShowPages();
      }
    });
  },

  handleRadioButtonClicked: function(){
    console.log('In the handleRadioButtonClicked method');
    $('.js-radioButton').on('change',  function() {
      let selectedOption = $('input[name=choices]:checked', '.js-radioButton').val();
      if(selectedOption>0) {
        STORE.radioButtonClicked=true;
        document.getElementById('js-userButton').setAttribute('class','js-userbutton');
      }
      QUESTIONS[STORE.currentQuestion-1].userChoice = selectedOption;
    });
  },

  handleSettingsButton: function(){
    console.log('In the handleSettingsButton method');
    $('#js-settingsButton').on('click', function() {
      STORE.currentView='settings';
      RenderPage.doShowPages();
    });
  },

  handleQuestionsToDo: function(){
    console.log('In the handleQuestionsToDo method');
    var e = document.getElementById('js-questionsToDo');
    if(e.selectedIndex > 0){
      alert(e.selectedIndex);
    }
  }
};

/******************************************************** 
 * Step 3: Change the state of the STORE. 
 ********************************************************/

const FlipPages = {  // Update the DOM by changing the STORE variables on clicking the user button.
  nextView: function(){
    console.log('In the nextView method.');
    if(STORE.currentView==='splash' && STORE.currentQuestion===0){
      STORE.currentView='question';
      STORE.currentQuestion=1;
    } else if(STORE.currentView==='settings'){
      STORE.currentView='question';
      STORE.currentQuestion=1;
    } else if(STORE.currentView==='question' && STORE.currentQuestion<=QUESTIONS.length){
      STORE.currentView='feedback';
    } else if(STORE.currentView==='feedback' && STORE.currentQuestion<QUESTIONS.length){
      STORE.currentView='question';
      STORE.radioButtonClicked = false;
      STORE.currentQuestion++;
    } else if(STORE.currentView==='feedback' && STORE.currentQuestion===QUESTIONS.length){
      STORE.currentView='wrap';
    } else if(STORE.currentView==='wrap' && STORE.currentQuestion===QUESTIONS.length){
      STORE.currentQuestion = 0;
      STORE.currentView = 'splash';
      STORE.currentScore = 0;
      STORE.radioButtonClicked = false;
      QUESTIONS = [];
      GetAPIPacket.getJsonQuestions();
    }
  }
};

/******************************************************** 
 * Step 0: Wait for page to load, then begin. Once only.
 ********************************************************/

$(()=>{  // Get the API data, add HTML, render pages, attach listeners.
  console.log('Begin the Quiz program.');
  GetAPIPacket.getJsonKey();
  GenerateHTML.doHtmlPages();
  RenderPage.doShowPages();
  Listeners.listen();
});


// Render -> User Input (Event Listener) -> State Changes (Update the STORE) -> Re-Render