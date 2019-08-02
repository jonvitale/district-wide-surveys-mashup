import templateUrl from './filter-pane.html';

const FilterPaneComponent = {
  template: templateUrl,
  bindings: {
      onClickHeader: '&',
  },
  $inject: ['$timeout', 'qlik', '$openApp', 'QlikVariablesService'],
  controller: class FilterPaneComponent {
    constructor($timeout, qlik, $openApp, QlikVariablesService){
      'ngInject';
      this.$timeout = $timeout;
      this.qlik = qlik;
      this.$openApp = $openApp;
      this.QlikVariablesService = QlikVariablesService;
    }

    $onInit(){
      this.showCurrent = false;
      this.height = "100px";
      this.survey = 'Student';
      this.useDemos = true;
      this.$openApp.getObject('CurrentSelections', 'CurrentSelections');
      this.QlikVariablesService.getVariableValue('vSurvey_Selected').then(value => {
        this.survey = value;
        this.useDemos = this.survey == 'Student' || this.survey == "Parent";
      });

      //register listeners
      this.QlikVariablesService.registerVariableObserver('vSurvey_Selected', (variable, value) => {
        if (this.survey !== value){
          this.survey = value;
          this.useDemos = this.survey == 'Student' || this.survey == "Parent";
          // if we are not using demos, clear any demo information
          if (this.useDemos){
            this.$openApp.field('Ethnicity').clear().then(success => {
            this.$openApp.field('Gender').clear().then(success => {
            this.$openApp.field('Grade').clear().then(success => {
              this.qlik.resize();
            })})});
          }
        }
      });
    }
    $onChanges(){
      this.$openApp.getObject('CurrentSelections', 'CurrentSelections');
    }

    $onDestroy(){
      // unregister listeners
      //console.log("---onDestroy question-compare--");
      this.QlikVariablesService.unregisterVariableObservers('vSurvey_Selected');
    }

    /**
     * Resize qlik but also sends information to parent from one-way binding
     */
    onClickFilterHeader(){
      
      this.$timeout(() => {this.qlik.resize()}, 100);
      if (this.onClickHeader != null) this.onClickHeader();
    }

    onClickCurrent() {
      this.showCurrent = !this.showCurrent;
    }
  }
};


export const FilterPaneModule = angular
  .module('filterPane', [])
  .component('filterPane', FilterPaneComponent)
  .name;