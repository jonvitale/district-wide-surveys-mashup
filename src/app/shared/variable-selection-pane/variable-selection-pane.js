import templateUrl from './variable-selection-pane.html';

const VariableSelectionPaneComponent = {
  template: templateUrl,
  bindings: {
    orientSurvey: '@',
    orientConstruct: '@',
    orientSubConstruct: '@',
    orientQuestionText: '@',
    surveysHidden: '<',
    constructsHidden: '<',
    subConstructsHidden: '<',
    questionTextsHideen: '<',
  },
  $inject: ['QlikVariablesService'],
  controller: class VariableSelectionPaneComponent {
    constructor(QlikVariablesService){
      'ngInject';
      this.QlikVariablesService = QlikVariablesService;
    }

    $onInit(){
     
      this.questionText = null;
      
      let fieldNames = [];     
      let variableNames = [];       
      let variables = {};
      let variableName = '';
      let variableDetails = {};

      // for each possible type of variable gather the details
      // so that we can pass those parameters onto the individual selectors
      // also gather all names of fields
      if (this.orientSurvey != null){
        variableName = 'vSurvey_Selected';
        variableDetails = this.QlikVariablesService.getVariableDetails(variableName);
        variableDetails.orientation = this.orientSurvey;
        variables['survey'] = variableDetails;
        if (variableDetails.sourceField != null) fieldNames.push(variableDetails.sourceField);
        variableNames.push(variableName);
      }
      if (this.orientConstruct != null){
        variableName = 'vConstruct_Selected';
        variableDetails = this.QlikVariablesService.getVariableDetails(variableName);
        variableDetails.orientation = this.orientConstruct;
        variables['construct'] = variableDetails;
        if (variableDetails.sourceField != null) fieldNames.push(variableDetails.sourceField);
        variableNames.push(variableName);
      }
      if (this.orientSubConstruct != null){
        variableName = 'vSubConstruct_Selected';
        variableDetails = this.QlikVariablesService.getVariableDetails(variableName);
        variableDetails.orientation = this.orientSubConstruct;
        variables['subConstruct'] = variableDetails;
        if (variableDetails.sourceField != null) fieldNames.push(variableDetails.sourceField);
        variableNames.push(variableName);
      }
      if (this.orientQuestionText != null){
        variableName = 'vQuestionText_Selected';
        variableDetails = this.QlikVariablesService.getVariableDetails(variableName);
        variableDetails.orientation = this.orientQuestionText;
        variables['questionText'] = variableDetails;
        if (variableDetails.sourceField != null) fieldNames.push(variableDetails.sourceField);
        variableNames.push(variableName);
      }

      /// only include governing fields for an individual variable if
      /// they are present in the fields list gathered above
      /// that way, for example, if there is Survey, but not Construct
      /// we don't have survey rely upon the value of Survey.  
      for (let variableKey in variables){
        let v = variables[variableKey];
        if (v.governingVariables != null && v.governingVariables.length > 0){
          for (let i = v.governingVariables.length - 1; i >= 0; i--){
            let gvariable = v.governingVariables[i];
            if (variableNames.indexOf(gvariable) < 0){
              v.governingVariables.splice(i, 1);
            }
          }
        }
        // create objects with the information for each variable
        this[variableKey] = v;
      }
    }

  }
}

export const VariableSelectionPaneModule = angular
  .module('variableSelectionPane', [])
  .component('variableSelectionPane', VariableSelectionPaneComponent)
  .name;
