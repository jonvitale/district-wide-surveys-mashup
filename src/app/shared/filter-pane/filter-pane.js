import templateUrl from './filter-pane.html';

const FilterPaneComponent = {
  template: templateUrl,
  bindings: {
      objId: '@',
      height: '@',
      objOptions: '<'
  },
  $inject: ['$openApp'],
  controller: class FilterPaneComponent {
    constructor($openApp){
      'ngInject';
      this.$openApp = $openApp;
      this.objId = "mStzpP";
      this.height = "100px";
    }

    $onInit(){
      //qlik.resize();
      //console.log("on init", this.$openApp, this.objId, this.$openApp.getObjectProperties(this.objId));
      this.$openApp.getObject('CurrentSelections', 'CurrentSelections');
      //this.$openApp.getObject(this.objId,this.objId, this.objOptions || null)
    }
    $onChanges(){
      //console.log("on change", this.$openApp, this.objId);
      this.$openApp.getObject('CurrentSelections', 'CurrentSelections');
      //this.$openApp.getObject(this.objId,this.objId, this.objOptions || null);
    }
  }
};


export const FilterPaneModule = angular
  .module('filterPane', [])
  .component('filterPane', FilterPaneComponent)
  .name;