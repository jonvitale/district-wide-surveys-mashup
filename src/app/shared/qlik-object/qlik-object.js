//import './qlik-object.scss';

const QlikObjectComponent = {
  template: `
    <div id="qlik-{{$ctrl.objId}}" class="qvobject" ng-style="{ 'height': $ctrl.height, 'width': $ctrl.width }">Loading...</div>
  `,
  bindings: {
      objId: '@',
      height: '@',
      width: '@',
      objOptions: '<'
  },
  $inject: ['$openApp'],
  controller: class QlikObjectComponent {
    constructor($openApp){
      'ngInject';
      this.$openApp = $openApp;
      this.objId = "DQBUdJ";
      this.height = "100px";
      this.width = "300px";
    }

    $onInit(){
     // this.$openApp.getObject(this.objId, this.objId, this.objOptions || null);
    }
    $onChanges(){
      this.$openApp.getObject('qlik-'+this.objId, this.objId, this.objOptions || null);
    }
  }
};

export const QlikObjectModule = angular
  .module('qlikObject', [])
  .component('qlikObject', QlikObjectComponent)
  .name;