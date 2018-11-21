import templateUrl from './home.html'

const HomeComponent = {
  template: templateUrl,
  controller: class HomeComponent {

  	$onInit(){
  		// google analytics
      gtag('event', 'screen_init', {
        'event_category': 'navigation',
        'event_label': 'Home'
      });
  	}
  }
}

export const HomeModule = angular
  .module('home', [])
  .component('home', HomeComponent)
  .name;
