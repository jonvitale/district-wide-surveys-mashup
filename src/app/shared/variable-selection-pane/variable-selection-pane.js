import templateUrl from './variable-selection-pane.html';

const VariableSelectionPaneComponent = {
  template: templateUrl,
  bindings: {
    orientSurvey: '@',
    orientConstruct: '@',
    orientQuestionText: '@',
  },
  controller: class VariableSelectionPaneComponent {
    constructor(){
      let survey =
        {
          variableName: 'vSurvey_Selected', 
          variableLabel: 'Respondent Group', 
          //sourceArray: ['Student', 'Teacher', 'Parent', 'Principal'],
          sourceField: 'Survey',
          cssClass: 'survey',
          governingFields: ['Construct'],
          governingState: 'Survey_State',
          orientation: 'horiz',
        };
      let construct = 
        {
          variableName: 'vConstruct_Selected',
          variableLabel: 'Topic',
          sourceField: 'Construct',
          cssClass: 'construct',
          governingFields: ['Survey'],
          governingState: 'Construct_State',
          orientation: 'horiz', 
        };
      let questionText =
        {
          variableName: 'vQuestionText_Selected',
          variableLabel: 'Question',
          sourceField: 'QuestionText',
          cssClass:'question-text',
          governingFields: ['Survey', 'Construct'],
          governingState: 'Question_State',
          orientation: 'list',
        }

      this.selectorParams = [];
      this.selections = {};
      this.questionText = null;

      if (this.orientSurvey != null){
        survey.orientation = this.orientSurvey;
        this.selectorParams.push(survey);
      }
      if (this.orientConstruct != null){
        construct.orientation = this.orientConstruct;
        this.selectorParams.push(construct);
      }
      if (this.orientQuestionText != null){
        questionText.orientation = this.orientQuestionText;
        this.questionText = questionText;
        this.selections['QuestionText'] = null;
      }
      
      for (let i in this.selectorParams){
        let p = this.selectorParams[i];
        this.selections[p.sourceField] = null;
      }

      this.selections['originVariable'] = null;
    }

  	$onInit(){
      
    }

    onSelection(name, value, variable){
      console.log("--onSelection (pane)---",name, value, variable);
      //this.onVariableSelection(this.selections['Survey'], 
      //  this.selections['Survey'],
      //  this.selections['QuestionText']);   

      // because an internal change in an object does not trigger child onChanges
      // we make a copy of the object and then change the value
      // then set back the new selections to the scoped var
      let new_selections = {};
      for (let key in this.selections){
        new_selections[key] = this.selections[key]
      }
      new_selections[name] = value;
      new_selections['originVariable'] = variable;
      this.selections = new_selections;   

    }
  }
}

export const VariableSelectionPaneModule = angular
  .module('variableSelectionPane', [])
  .component('variableSelectionPane', VariableSelectionPaneComponent)
  .name;
