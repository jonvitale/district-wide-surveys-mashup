import templateUrl from './navbar.html'

const NavBarComponent = {
  template: templateUrl,
  bindings: {
      currentPage: '@',
  },
  controller: class NavBarComponent {
  }
}

export const NavBarModule = angular
  .module('navbar', [])
  .component('navbar', NavBarComponent)
  .name;
