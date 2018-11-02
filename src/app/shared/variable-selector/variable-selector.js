import templateUrl from './variable-selector.html';

const VariableSelectorComponent = {
  template: templateUrl,
  bindings: {
      variableName: '@',
      variableLabel: '@',
      sourceField: '@',
      sourceArray: '<',
      //governingState: '@',
      governingFields: '<',
      orientation: '@',
      onSelection: '&',
      selections: '<',

  },
  $inject: ['$scope', '$openApp', 'QlikVariablesService'],
  controller: class VariableSelectorComponent {
    constructor($scope, $openApp, QlikVariablesService){
      'ngInject';
      this.$scope = $scope;
      this.$openApp = $openApp;
      this.QlikVariablesService = QlikVariablesService;
      this.inputStateName = typeof this.inputStateName !== 'undefined' ? this.inputStateName : '$';     
      this.currentValue = null;
      this.currentValues = null;
      this.displayed = false;
    }
 
    /**
     * On initialization set the current value based upon the variable value in the app
     */
    $onInit(){
      // console.log("---onInit---", this.variableName, this.orientation);  
      if (this.orientation == 'combo'){
        this.currentValues = [];
      } else {   
        this.QlikVariablesService.getVariableValue(this.variableName).then(
          value => this.setVariableValue(value, false),
          error => console.log(error)
        );
      }
    }
   
   /**
    * Receives notice that there has been a change. May be initialization or update to selections.
    * Will continue to displayValues if:
    * 1. We have not displayed anything yet
    * 2. The originating variable (i.e. what the user has selected) is not this and is a governing field
    * @return {[type]} [description]
    */
  	$onChanges(){
       //console.log("---onChanges---", this.variableName, this.selections.originVariable, this.orientation);
      if (this.selections.originVariable !== null && this.selections.originField !== null &&
          (!this.displayed || 
            this.selections.originVariable !== this.variableName && 
            this.governingFields != null && this.governingFields.indexOf(this.selections.originField) >= 0)){
        console.log("---3. Received onChange event, this: (", this.variableName, "), from: (", this.selections.originVariable, ")", this.selections);
        this.displayValues();      
      }
    }

    onClick(val, index){
      if (typeof val === 'object'){
        if (val.selectable){
          this.setVariableValue(val.value, true);                        
        }
      } else {
        this.setVariableValue(val, true);
      }
    }

   
    /**
     * If there are governing fields and a governing state this will
     * apply current selections to the governing fields in the governing state.
     * Displayed values will then reflect possible fields with those selections made
     * If there is no governance, then we simply display all values. 
     * @return {[type]} [description]
     */
    displayValues(){      
      if (typeof this.sourceField === 'string' && this.sourceField.length > 0){
        // console.log("---displayValues: with governance---", this.variableName, this.selectedValue, this.selections);
        let governingSelections = null;
        if (this.governingFields.length > 0){
          for (let i = 0; i < this.governingFields.length; i++){
            let gField = this.governingFields[i];
            if (this.selections[gField] != null){
              if (governingSelections == null) governingSelections = {};
              governingSelections[gField] = this.selections[gField];
            }
          }
        }

        // get all and possible field values for this field with selections
        this.QlikVariablesService.getFieldValuesWithSelections(this.sourceField, governingSelections).then(
          values => {
            this.displayed = true;
            this.values = values;

            // get just selectable values, then determine if its the same as the previously selectableValues
            let selectableValues = [];
            for (let i = 0; i < values.length; i++){
              if (values[i].selectable){
                selectableValues.push(values[i].value);
              }
            }
           
            let selectableValuesUpdated = !angular.equals(selectableValues, this.selectableValues);

            console.log("----4. Get updated fields (", this.variableName, ")", selectableValues, this.currentValue, selectableValuesUpdated, values);
            this.selectableValues = selectableValues;

            // set defaults based upon combo or not
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
                this.currentValues = selectableValues;
              }
              this.onSelection({'name': this.sourceField, 'value': this.currentValues, 'variable': this.variableName});
                            
            } else {
              // if the current value is no longer on the list, use the first value  
              if (selectableValues != null && selectableValues.length > 0 && selectableValues.indexOf(this.currentValue) < 0){
                this.setVariableValue(selectableValues[0], true).then(
                  //success => this.$scope.$apply()
                );
              } else if (selectableValuesUpdated) {
                // if there is a change in selected values, fire a change
                this.$scope.$apply();
              }
            }
             
          }, error => console.log(error)
        );
        
      } else {
        // for fields from an array all are possible
        let values = []; 
        for (let i = 0; i < this.sourceArray.length; i++){
          values.push({'value': this.sourceArray[i], 'selectable':true});
        }
        selectableValues = this.sourceArray;
        firstValue = this.sourceArray[0];
        this.displayed = true;
        this.values = values; 
      }
    }

     /**
     * Upon clicking a button an internal variable is set allowing an ng-class
     * in the template check for active status.
     * Additionally, if there is a sourceField and outputStateName, then we 
     * set values in the field to this value.
     * @param  {[string]} value [the selected value]
     * @return {null}     
     */
    setVariableValue(value, updateService){
      
      return new Promise( (resolve, reject) => {
        if (this.orientation == 'combo'){
          if (this.currentValues.indexOf(value) >= 0){
            // remove value
            this.currentValues.splice(this.currentValues.indexOf(value), 1);
          } else {
            this.currentValues.push(value);
          }
          this.currentValues = this.currentValues.slice(); // make copy to trigger watchers.
          console.log("-1. Set variable valueS",this.variableName, value, this.currentValues);          
          this.onSelection({'name': this.sourceField, 'value': this.currentValues, 'variable': this.variableName});
          resolve(true);
        } else {
          if (value !== this.currentValue){
            console.log("-1. Set variable value ",this.variableName, value);  
            if (updateService){
              this.QlikVariablesService.setVariableValue(this.variableName, value).then(
                success => {
                  // console.log("    after qlik - setVariableValue---",this.variableName, value, this.currentValue);
                  this.currentValue = value;
                  this.onSelection({'name': this.sourceField, 'value': this.currentValue, 'variable': this.variableName});      
                  resolve(true);
                },
                error => reject(error)
              );
            } else {
              this.currentValue = value;
              this.onSelection({'name': this.sourceField, 'value': this.currentValue, 'variable': this.variableName});          
              resolve(true);
            } 
          } else {
            resolve (true);
          }
        }
      });
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
