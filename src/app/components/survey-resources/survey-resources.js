import templateUrl from './survey-resources.html';

const SurveyResourcesComponent = {
  template:  templateUrl,
  controller: class SurveyResourcesComponent {
    constructor(){     
    }

    $onInit(){
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
