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
      console.log("---onInit---", this.variableName, this.currentValue, this.currentValues, this.parent, this.hideValues);  
      
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
          console.log("---", this.variableName, " observed change of", variable, "new value", value);
          this.displayValues();
        });
      }

      this.QlikVariablesService.getVariableValue(this.variableName).then(
        value => {
          if (this.orientation == "combo"){
            this.currentValues = value;
          } else {
            this.currentValue = value;
          }          
          this.displayValues();
        },
        error => console.log(error)
      );
    }
  
    
    /**
     * If there are governing fields and a governing state this will
     * apply current selections to the governing fields in the governing state.
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
          // make sure values are not in hideValues
          if (angular.isArray(this.hideValues) && this.hideValues.length > 0){
            for (let i = values.length-1; i >= 0; i--){
              let value = values[i].value;
              if (this.hideValues.indexOf(value) >= 0){
                values.splice(i, 1);
              }
            }
          }
          this.values = values;

          // get just selectable values, then determine if its the same as the previously selectableValues
          let selectableValues = [];
          for (let i = 0; i < values.length; i++){
            if (values[i].selectable){
              selectableValues.push(values[i].value);
            }
          }
         
          let selectableValuesUpdated = !angular.equals(selectableValues, this.selectableValues);

          // console.log("----4. Get updated fields (", this.variableName, ")", this.currentValue);//, selectableValues, selectableValuesUpdated, values);
          this.selectableValues = selectableValues;

          // if there are multiple values take the intersection of the selectable values and current values
          if (this.orientation == 'combo'){
            // are there is an intersection of selectableValues on currentValues
            let intersectingValues = [];
            for (let i = 0; i < this.currentValues.length; i++){
              if (selectableValues.indexOf(this.currentValues[i]) >= 0){
                intersectingValues.push(this.currentValues[i]);
              }
            }
            if (intersectingValues.length > 0){
              this.currentValues = intersectingValues
            } else {
              // default to all selectable values
              this.currentValues = selectableValues;
            }           
          } else {
            // if the current value is not a selectable value
            // set the value to the first on the selectable list
            if (this.selectableValues.length > 0 && 
                this.selectableValues.indexOf(this.currentValue) < 0)
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
    return function(input, column, trueOrFalse){
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
  .component('variableSelector', VariableSelectorComponent)
  .name;
