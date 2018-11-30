import templateUrl from './survey-resources.html';

const SurveyResourcesComponent = {
  template:  templateUrl,
  controller: class SurveyResourcesComponent {
    constructor(){     
    }

    $onInit(){
    	if (window.scrollTo != null) window.scrollTo(0, 0);
    	// google analytics
      gtag('event', 'screen_init', {
        'event_category': 'navigation',
        'event_label': 'About'
      });
    }
  }
}


export const SurveyResourcesModule = angular
  .module('surveyResources', [])
  .component('surveyResources', SurveyResourcesComponent)
  .name;
