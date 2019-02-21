import templateUrl from './navbar.html'

const NavBarComponent = {
  template: templateUrl,
  bindings: {
      currentPage: '@',
  },
  $inject: ['QlikVariablesService'],
  controller: class NavBarComponent {
  	constructor(QlikVariablesService){
      'ngInject';
      this.QlikVariablesService = QlikVariablesService;
    }

    $onInit(){
      this.QlikVariablesService.getTrackerStatus()
        .then(status => this.showTracker = status.length > 0)
        .catch(() => this.showTracker = false);
    }  
  }
}

export const NavBarModule = angular
  .module('navbar', [])
  .component('navbar', NavBarComponent)
  .name;


