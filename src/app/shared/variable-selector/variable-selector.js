import templateUrl from './variable-selector.html';

const VariableSelectorComponent = {
  template: templateUrl,
  bindings: {
      variableName: '@',
      variableLabel: '@',
      sourceField: '@',
      sourceArray: '<',
      governingState: '@',
      governingFields: '<',
      orientation: '@',
      onSelection: '&',
      selections: '<',

  },
  $inject: ['$openApp', 'QlikVariablesService'],
  controller: class VariableSelectorComponent {
    constructor($openApp, QlikVariablesService){
      'ngInject';
      this.$openApp = $openApp;
      this.QlikVariablesService = QlikVariablesService;
      this.inputStateName = typeof this.inputStateName !== 'undefined' ? this.inputStateName : '$';     
      this.currentValue = null;
      this.displayed = false;
    }
 
    /**
     * On initialization set the current value based upon the variable value in the app
     */
    $onInit(){
      console.log("---onInit---", this.variableName, this.selections);
      this.QlikVariablesService.getVariableValue(this.variableName).then(
        value => this.setVariableAndFieldValue(value),
        error => console.log(error)
      );

      // this.$openApp.variable.getContent(this.variableName, reply => {
      //   let currentValue = reply.qContent.qString;
      //   this.setVariableAndFieldValue(currentValue);
      // });
    }
   
  	$onChanges(){
       console.log("---onChanges---", this.variableName, this.selections.originVariable);
       if (this.selections.originVariable !== null &&
          (this.selections.originVariable !== this.variableName ||
           !this.displayed)){
        console.log("---onChanges (with source)---", this.variableName, this.selections.originVariable);
        this.displayValues();      
       }
    }

    onClick(value){
      this.setVariableAndFieldValue(value, true);
    }

    /**
     * Upon clicking a button an internal variable is set allowing an ng-class
     * in the template check for active status.
     * Additionally, if there is a sourceField and outputStateName, then we 
     * set falues in the field to this value.
     * @param  {[string]} value [the selected value]
     * @return {null}     
     */
    setVariableAndFieldValue(value, updateService){
      console.log("---setVariableAndFieldValue---",this.variableName, value, this.currentValue);
      if (updateService){
        this.QlikVariablesService.setVariableValue(this.variableName, value).then(
          success => {
            this.currentValue = value;
            this.onSelection({'name': this.sourceField, 'value': this.currentValue, 'variable': this.variableName});
          },
          error => console.log(error)
        );
      } else {
        this.currentValue = value;
        this.onSelection({'name': this.sourceField, 'value': this.currentValue, 'variable': this.variableName});
      }


      // this.$openApp.variable.setStringValue(this.variableName, value).then(
      //   success => {
      //     // only update the output bindings if this was from a direct click
      //     if (this.currentValue !== value){
      //       this.currentValue = value;
      //       this.onSelection({'name': this.sourceField, 'value': this.currentValue, 'variable': this.variableName});
      //     }
      //   }
      // );      
    }

    /**
     * If there are governing fields and a governing state this will
     * apply current selections to the governing fields in the governing state.
     * Displayed values will then reflect possible fields with those selections made
     * If there is no governance, then we simply display all values. 
     * @return {[type]} [description]
     */
    displayValues(){
      var count = 0;
      if (typeof this.governingState === 'string' && this.governingState.length > 0 &&
          typeof this.governingFields !== 'undefined' && this.governingFields.length > 0 &&
          typeof this.sourceField === 'string' && this.sourceField.length > 0
        ){

        console.log("---displayValues: with governance---", this.variableName, this.selectedValue, this.selections);
        for (let i in this.governingFields){
          let field = this.governingFields[i]
          let value = typeof this.selections[field] !== 'undefined' ? this.selections[field]: null; 
          if (value != null){
            this.$openApp.field(field, this.governingState).selectMatch(value, true)
            .then(
              success => {
                count++;
                //console.log("count-s", count);
                if (count == this.governingFields.length){
                  //console.log("successful field setting for", field, value)
                  this.completeDisplayValues();
                }
              },
              failure => {
                count++;
                //console.log("count-f", count);
                if (count == this.governingFields.length){
                  this.completeDisplayValues();
                }
              }
            );
          } else {
            this.completeDisplayValues();
          }
        }
      } else {
        this.completeDisplayValues();
      }
    }

    completeDisplayValues(){
      console.log('---completeDisplayValues---', this.variableName);
      if (typeof this.sourceArray === 'object' && this.sourceArray.length > 0){
        this.values = this.sourceArray;
        this.displayed = true;
      } else if (typeof this.sourceField === 'string' && this.sourceField.length > 0){
        let field = this.$openApp.field(this.sourceField, this.governingState).getData();
        field.OnData.bind(() => {
          let values = [];
          for (let rowi in field.rows){
            //console.log("field for", this.variableName, field.rows[rowi]);
            if (field.rows[rowi].qState !== 'X'){
              values.push(field.rows[rowi].qText);
            }
          }
          this.values = values;
          this.displayed = true;
          //console.log("all values for", this.variableName, this.values);
        });        
      }     
    }
 
    
  }
}

export const VariableSelectorModule = angular
  .module('variableSelector', [])
  .component('variableSelector', VariableSelectorComponent)
  .name;
