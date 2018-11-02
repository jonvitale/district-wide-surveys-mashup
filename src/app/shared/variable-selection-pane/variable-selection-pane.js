import templateUrl from './variable-selection-pane.html';

const VariableSelectionPaneComponent = {
  template: templateUrl,
  bindings: {
    orientSurvey: '@',
    orientConstruct: '@',
    orientSubConstruct: '@',
    orientQuestionText: '@',
  },
  $inject: ['QlikVariablesService'],
  controller: class VariableSelectionPaneComponent {
    constructor(QlikVariablesService){
     
      this.selections = {'_CYTD_Flag': 1};
      this.fieldNames = [];
      this.questionText = null;

      if (this.orientSurvey != null){
        let survey = QlikVariablesService.getVariableDetails('Survey');
        survey.orientation = this.orientSurvey;
        this.survey = survey;
        this.selections[survey.sourceField] = null;
        this.fieldNames.push(survey.sourceField);
      }
      if (this.orientConstruct != null){
        let construct = QlikVariablesService.getVariableDetails('Construct');
        construct.orientation = this.orientConstruct;
        this.construct = construct;
        this.selections[construct.sourceField] = null;
        this.fieldNames.push(construct.sourceField);
      }
      if (this.orientSubConstruct != null){
        let subConstruct = QlikVariablesService.getVariableDetails('SubConstruct');
        subConstruct.orientation = this.orientSubConstruct;
        this.subConstruct = subConstruct;
        this.selections[subConstruct.sourceField] = null;
        this.fieldNames.push(subConstruct.sourceField);
      }
      if (this.orientQuestionText != null){
        let questionText = QlikVariablesService.getVariableDetails('QuestionText');
        questionText.orientation = this.orientQuestionText;
        this.questionText = questionText;
        this.selections[questionText.sourceField] = null;
        this.fieldNames.push(questionText.sourceField);
      }

      this.selections['originVariable'] = null;
      this.selections['originField'] = null;
    }

  	$onInit(){
      
    }

    onSelection(name, value, variable){
      console.log("--2. Inform parent of change (variable-selection-pane.js), from (", variable, ")", name, value);
      
      // because an internal change in an object does not trigger child onChanges
      // we make a copy of the object and then change the value
      // then set back the new selections to the scoped var
      let new_selections = angular.copy(this.selections);
      new_selections[name] = value;
      new_selections['originVariable'] = variable;
      new_selections['originField'] = name;
      this.selections = new_selections;   
    }
  }
}

export const VariableSelectionPaneModule = angular
  .module('variableSelectionPane', [])
  .component('variableSelectionPane', VariableSelectionPaneComponent)
  .name;
