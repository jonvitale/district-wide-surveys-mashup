import templateUrl from './home.html'

const HomeComponent = {
  template: templateUrl,
  controller: class HomeComponent {
  }
}

export const HomeModule = angular
  .module('home', [])
  .component('home', HomeComponent)
  .name;
