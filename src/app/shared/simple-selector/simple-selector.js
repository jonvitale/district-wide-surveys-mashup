import templateUrl from './simple-selector.html';
import { DH_UNABLE_TO_CHECK_GENERATOR } from 'constants';

const SimpleSelectorComponent = {
  template: templateUrl,
  bindings: {
    label: '@',
    values: '<',
    defaultValue: '@',
    orientation: '@'
  }, 
  $inject: ['$scope'],
  controller: class SimpleSelectorComponent {
    constructor($scope){
      'ngInject';
      this.$scope = $scope; 
    }
 
    $onInit(){
      if (this.orientation == null) {
          this.orientation = 'horiz';
      }
      if (this.defaultValue == null || this.values.indexOf(this.defaultValue) === -1) {
          this.currentValue = this.values[0];
      } else {
          this.currentValue = this.defaultValue;
      }
    }
  

    onClick(val, index){
        this.currentValue = val; 
        this.$scope.$emit('childPressEvent', val);
    }

  }
}

export const SimpleSelectorModule = angular
  .module('simpleSelector', [])
  .component('simpleSelector', SimpleSelectorComponent)
  .name;
