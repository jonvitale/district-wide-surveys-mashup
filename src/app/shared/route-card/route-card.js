import templateUrl from './route-card.html'

const RouteCardComponent = {
  template: templateUrl,
  transclude: true,
  bindings: {
    title: '@',
    imgSrc: '@',
    route: '@',
    hideText: '@',
  },
  controller: class RouteCardComponent {
    constructor(){
      this.title = "Loading...";
      this.imgSrc = null;
      this.hideText = false;
    }

    navigateToRoute(){
      console.log("here", this.route);
    }
  }
}

export const RouteCardModule = angular
  .module('routeCard', [])
  .component('routeCard', RouteCardComponent)
  .name;