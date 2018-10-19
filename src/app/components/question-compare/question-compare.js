import templateUrl from './question-compare.html';

const QuestionCompareComponent = {
  template:  templateUrl,
  $inject: ['qlik', '$openApp', 'QlikVariablesService'],
  controller: class QuestionCompareComponent {
     constructor(qlik, $openApp, QlikVariablesService){
      'ngInject';
      this.qlik = qlik;
      this.$openApp = $openApp;
      this.QlikVariablesService = QlikVariablesService
      this.survey = 'Student';
      this.construct = 'School Climate';
      this.questionText = '';
    }

    $onInit(){
      this.$openApp.getObject('CurrentSelections', 'CurrentSelections');
      this.QlikVariablesService.getVariableValue('vSurvey_Selected').then(value => {
        this.survey = value;
      });
      this.QlikVariablesService.getVariableValue('vConstruct_Selected').then(value => {
        this.construct = value;
      });
      this.QlikVariablesService.getVariableValue('vQuestionText_Selected').then(value => {
        this.questionText = value;
      });

      //register listeners
      this.QlikVariablesService.registerVariableObserver('vSurvey_Selected', value => {
        this.survey = value;
      });
      this.QlikVariablesService.registerVariableObserver('vConstruct_Selected', value => {
        this.construct = value;
      });
      this.QlikVariablesService.registerVariableObserver('vQuestionText_Selected', value => {
        this.questionText = value;
      });
    }

    $onDestroy(){
      // unregister listeners
      console.log("---onDestroy question-compare--");
      this.QlikVariablesService.unregisterVariableObservers('vSurvey_Selected');
      this.QlikVariablesService.unregisterVariableObservers('vConstruct_Selected');
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

    refreshQlik(){
      this.qlik.resize();
    }
  }
}

export const QuestionCompareModule = angular
  .module('questionCompare', [])
  .component('questionCompare', QuestionCompareComponent)
  .name;
