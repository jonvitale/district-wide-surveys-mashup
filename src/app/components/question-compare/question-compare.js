import templateUrl from './question-compare.html';

const QuestionCompareComponent = {
  template:  templateUrl,
  $inject: ['qlik', '$openApp', 'QlikVariablesService'],
  controller: class QuestionCompareComponent {
     constructor(qlik, $openApp, QlikVariablesService){
      'ngInject';
      this.qlik = qlik;
      this.$openApp = $openApp;
      this.QlikVariablesService = QlikVariablesService;        
    }

    $onInit(){
      this.questionCollapsed = true;
      this.accordionsCollapsed = true;
      this.survey = '';
      this.construct = '';
      this.subConstruct = '';
      this.questionText = '';
      this.questionStem = '';
      this.useDemos = true;    

      this.$openApp.getObject('CurrentSelections', 'CurrentSelections');

      // what's the latest year
      this.$openApp.variable.getContent('vCYTD', reply => {
        this.CYTD = reply.qContent.qString;
      });

      // constants
      this.$openApp.variable.getContent('vCount_Questions_Student_CYTD', reply => {
        this.numQuestionsStudent = reply.qContent.qString;
      });
      this.$openApp.variable.getContent('vCount_Questions_Parent_CYTD', reply => {
        this.numQuestionsParent = reply.qContent.qString;
      });
      this.$openApp.variable.getContent('vCount_Questions_Teacher_CYTD', reply => {
        this.numQuestionsTeacher = reply.qContent.qString;
      });
      this.$openApp.variable.getContent('vCount_Questions_Principal_CYTD', reply => {
        this.numQuestionsPrincipal = reply.qContent.qString;
      });


      // question-related variables
      this.QlikVariablesService.getVariableValue('vSurvey_Selected').then(value => {
        this.survey = value;
      });
      this.QlikVariablesService.getVariableValue('vConstruct_Selected').then(value => {
        this.construct = value;
      });
      this.QlikVariablesService.getVariableValue('vSubConstruct_Selected').then(value => {
        this.subConstruct = value;
      });
      this.QlikVariablesService.getVariableValue('vQuestionText_Selected').then(value => {
        this.questionText = value;
      });
      this.QlikVariablesService.getVariableValue('vQuestionStem_Selected').then(value => {
        this.questionStem = value;
      });


      //register listeners
      this.QlikVariablesService.registerVariableObserver('vSurvey_Selected', (variable, value) => {
        if (this.survey !== value){
          this.survey = value;
          this.useDemos = this.survey == 'Student' || this.survey == "Parent";
        }
      });
      this.QlikVariablesService.registerVariableObserver('vConstruct_Selected', (variable, value) => {
        if (this.construct !== value){
          this.construct = value;
        }
      });
      this.QlikVariablesService.registerVariableObserver('vSubConstruct_Selected', (variable, value) => {
        if (this.subConstruct !== value){
          this.subConstruct = value;
        }
      });
      this.QlikVariablesService.registerVariableObserver('vQuestionText_Selected', (variable, value) => {
        if (this.questionText !== value){
          this.questionText = value;
          // when the questionText changes we also need the stem.
          this.QlikVariablesService.getVariableValue('vQuestionStem_Selected').then(value => {
            this.questionStem = value;
          });
        }
      });
    }

    $onChanges(){
      this.QlikVariablesService.getVariableValue('vQuestionText_Selected').then(value => {
        this.questionText = value;
      });
      this.QlikVariablesService.getVariableValue('vQuestionStem_Selected').then(value => {
        this.questionStem = value;
      });
    }

    $onDestroy(){
      // unregister listeners
      console.log("---onDestroy question-compare--");
      this.QlikVariablesService.unregisterVariableObservers('vSurvey_Selected');
      this.QlikVariablesService.unregisterVariableObservers('vConstruct_Selected');
      this.QlikVariablesService.unregisterVariableObservers('vSubConstruct_Selected');
      this.QlikVariablesService.unregisterVariableObservers('vQuestionText_Selected');
    }

    onVariableSelection(survey, topic, questionText){
      this.survey = survey;
      this.topic = topic;
      this.questionText = questionText;
    }

    clearSelections(stateName){
      this.$openApp.clearAll(true, stateName);
    }

    /**
     * When an accordion tab is opened we need to resize the qlik object.
     * Additionally, we keep track if any accordion tabs are open.
     * If they are we will hide the top graph and question selection button.
     */
    onClickAccordion(evt){
      // is the target of this event going from or to a collapsed state
      if (evt.currentTarget.className.includes("collapsed")){
        this.accordionsCollapsed = false;
      } else {
        this.accordionsCollapsed = true;
      }
      
      this.qlik.resize();
    }

    onClickQuestionSelect(){
      this.questionCollapsed = !this.questionCollapsed; 
      this.qlik.resize();
    }
  }
}

export const QuestionCompareModule = angular
  .module('questionCompare', [])
  .component('questionCompare', QuestionCompareComponent)
  .name;
