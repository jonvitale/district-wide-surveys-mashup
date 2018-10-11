import './filter-pane.scss';

const FilterPaneComponent = {
  template: `
    <div id="CurrentSelections">Current Selections Loading...</div>
    <qlik-object obj-id="{{$ctrl.objId}}" height="5rem" width="100%"></qlik-object>
  `
  // <div id="{{$ctrl.objId}}" class="qvobject" ng-style="{ 'height': '5rem', 'width': '100%' }">
      // Loading...
    // </div>
  ,
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