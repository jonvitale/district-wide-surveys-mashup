import templateUrl from './variable-selector.html';

const VariableSelectorComponent = {
  template: templateUrl,
  bindings: {
      variableName: '@',
      variableLabel: '@',
      sourceField: '@',
      governingVariables: '<',
      orientation: '@',
      hideValues: '<',
  },
  require: {
    parent: '^variableSelectionPane'
  },
  $inject: ['$scope', '$openApp', 'QlikVariablesService'],
  controller: class VariableSelectorComponent {
    constructor($scope, $openApp, QlikVariablesService){
      'ngInject';
      this.$scope = $scope;
      this.$openApp = $openApp;
      this.QlikVariablesService = QlikVariablesService;
    }
 
    /**
     * On initialization set the current value based upon the variable value in the app
     */
    $onInit(){
      // console.log("---onInit---", this.variableName, this.currentValue, this.currentValues, this.parent, this.hideValues);  
      this.paused = false;
      this.currentValues = null;
      this.currentValue = null;
      this.displayed = false;

      //register lisener on this variable
      this.QlikVariablesService.registerVariableObserver(this.variableName, (variable, value) => {
        this.currentValue = value;
      });

      //register listeners on governing variables
      for (let i = 0; i < this.governingVariables.length; i++){
        let gvar = this.governingVariables[i];
        this.QlikVariablesService.registerVariableObserver(gvar, (variable, value) => {
          // console.log("---", this.variableName, " observed change of", variable, "new value", value);
          this.displayValues();
        });
      }

      // initialize values
      this.QlikVariablesService.getVariableValue(this.variableName).then(
        value => {
          if (!this.paused){
            if (this.orientation == "combo"){
              this.currentValues = value;
            } else {
              this.currentValue = value;
            }          
            this.displayValues();
          }
        },
        error => console.log(error)
      );
    }
  
    
    /**
     * If there are governing fields this will
     * apply current selections to the governing fields.
     * Displayed values will then reflect possible fields with those selections made
     * If there is no governance, then we simply display all values. 
     * However, there may be explicitely removed values (hideValues)
     * @return {[type]} [description]
     */
    displayValues(){      
      // get all and possible field values for this field with selections
      this.QlikVariablesService.getFieldValuesWithSelections(this.variableName, this.governingVariables).then(
        values => {
          this.displayed = true;
          // get just selectable values, then determine if its the same as the previously selectableValues
          let selectableValues = values.filter(valObj => valObj.selectable).map(valObj => valObj.value);
          
          // make sure values are not in hideValues
          // Note, this must come after selectableValues in case there are multiple open
          // variable-selection-panes on the page with different hidden values
          // one will tell the other that some values are not selectable even if they are.
          if (angular.isArray(this.hideValues) && this.hideValues.length > 0){
            values = values.filter(valObj => this.hideValues.indexOf(valObj.value) === -1);
          }
          this.values = values;

          // let selectableValuesUpdated = !angular.equals(selectableValues, this.selectableValues);

          // console.log("----4. Get updated fields (", this.variableName, ")", this.currentValue);//, selectableValues, selectableValuesUpdated, values);
          const pselectableValues = this.selectableValues;
          this.selectableValues = selectableValues;

          // if there are multiple values take the intersection of the selectable values and current values
          if (this.orientation == 'combo'){
            
            // if a selectable value is new (not on the previous list of selectableValues) or value is currently selectable
            this.currentValues = this.selectableValues.filter(val => 
                !pselectableValues || pselectableValues.indexOf(val) < 0
              ).concat(
                this.currentValues.filter(val => this.selectableValues.indexOf(val) >= 0)
              );            
          } else {
            // if the current value is not a selectable value
            // set the value to the first on the selectable list
            if (this.selectableValues.length > 0 && this.selectableValues.indexOf(this.currentValue) < 0)
              this.setCurrentValue(this.selectableValues[0]);
          }
          // force a refresh
          this.$scope.$apply(); 
        }, error => console.log(error)
      );
    }

    onClick(val, index){
      if (val.selectable){
        this.setCurrentValue(val.value);           
      }      
    }

    setCurrentValue(value){
      if (this.orientation == 'combo'){
        this.QlikVariablesService.toggleVariableValueInArray(this.variableName, value).then(
          values => this.currentValues = values,
          error => console.log(error)
        ); 
      } else {
        this.QlikVariablesService.setVariableValue(this.variableName, value).then(
          value => this.currentValue = value,
          error => console.log(error)
        );     
      }    
    }

  }
}

export const VariableSelectorModule = angular
  .module('variableSelector', [])
  .filter('matchBooleanFilter', function(){
    return function(input, column, trueOrFalse) {
      // console.log("!!!!!!!filter!!!!!!!!!!!")
      var ret = [];
      if (!angular.isDefined(trueOrFalse)) {
        trueOrFalse = false;
      }
      angular.forEach(input, function (v) {
        if (angular.isDefined(v[column]) && v[column] === trueOrFalse) {
          ret.push(v);
        }
      });
      return ret;
    }
  })
  .filter('includeTextFilter', function(){
    return function(input, column, textToMatch) {
      //  console.log("filter text", input, column, textToMatch);
      var ret = [];
      if (!angular.isDefined(textToMatch)) {
        textToMatch = '';
      }
      angular.forEach(input, function (v) {
        // console.log("filter this", column, v[column], textToMatch);
        if (angular.isDefined(v[column]) && v[column].toLowerCase().includes(textToMatch.toLowerCase())) {
          ret.push(v);
        }
      });
      return ret;
    }
  })
  .component('variableSelector', VariableSelectorComponent)
  .name;
