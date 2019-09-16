// note: according to the Qlik docs "The element that is provided as a parameter to the getObject method must have CSS property position set to relative and must not have any padding."
const QlikObjectComponent = {
  template: `
    <div id="qlik-{{$ctrl.objId}}" class="qvobject" style="position: relative; padding: 0px;" ng-style="{ 'height': $ctrl.height, 'width': $ctrl.width }">Loading...</div>    
  `,
  bindings: {
      objId: '@',
      height: '@',
      width: '@',
      objOptions: '<'
  },
  $inject: ['$timeout', '$openApp'],
  controller: class QlikObjectComponent {
    constructor($timeout, $openApp){
      'ngInject';
      this.$timeout = $timeout;
      this.$openApp = $openApp;
      this.objId = "DQBUdJ";
      this.height = "100px";
      this.width = "300px";
      this.timeoutPromise = null;
    }

    $onInit(){
     // this.$openApp.getObject(this.objId, this.objId, this.objOptions || null);
    }

    $onChanges(){
      this.getQlikObject(1);
    }

    $onDestroy(){
      // Cancel any timeout
      if (this.timeoutPromise) this.$timeout.cancel(this.timeoutPromise);
    }

    getQlikObject(count) { 
      if (count <= 10) {
        this.$openApp.getObject('qlik-'+this.objId, this.objId, this.objOptions || null).then(model => {
          // console.log("getObject", count, this.objId, angular.element($('#qlik-'+this.objId)));

          // if the Qlik element is empty then we need to try again after a short delay
          if (angular.element($('#qlik-'+this.objId)).length == 0) {
            this.timeoutPromise = this.$timeout(() => {this.getQlikObject(count + 1)}, 500);            
          }
        }, error => console.log("getObject Error", error));
      } else { 
        console.log("Error, tried 10 times to get this object");
      }
    }
  }
};

export const QlikObjectModule = angular
  .module('qlikObject', [])
  .component('qlikObject', QlikObjectComponent)
  .name;