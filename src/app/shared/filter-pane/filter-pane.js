import templateUrl from './filter-pane.html';

const FilterPaneComponent = {
  template: templateUrl,
  bindings: {
      objId: '@',
      height: '@',
      objOptions: '<'
  },
  $inject: ['qlik', '$openApp', 'QlikVariablesService'],
  controller: class FilterPaneComponent {
    constructor(qlik, $openApp, QlikVariablesService){
      'ngInject';
      this.qlik = qlik;
      this.$openApp = $openApp;
      this.QlikVariablesService = QlikVariablesService;
      this.height = "100px";
      this.survey = 'Student';
      this.useDemos = true;
    }

    $onInit(){
      this.$openApp.getObject('CurrentSelections', 'CurrentSelections');
      this.QlikVariablesService.getVariableValue('vSurvey_Selected').then(value => {
        this.survey = value;
        this.useDemos = this.survey == 'Student' || this.survey == "Parent";
      });

      //register listeners
      this.QlikVariablesService.registerVariableObserver('vSurvey_Selected', value => {
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
      //console.log("on change", this.$openApp, this.objId);
      this.$openApp.getObject('CurrentSelections', 'CurrentSelections');
      //this.$openApp.getObject(this.objId,this.objId, this.objOptions || null);
    }

    $onDestroy(){
      // unregister listeners
      console.log("---onDestroy question-compare--");
      this.QlikVariablesService.unregisterVariableObservers('vSurvey_Selected');
    }

    onClickFilterHeader(){
      this.qlik.resize();
    }
  }
};


export const FilterPaneModule = angular
  .module('filterPane', [])
  .component('filterPane', FilterPaneComponent)
  .name;