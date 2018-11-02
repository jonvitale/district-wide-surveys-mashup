import templateUrl from './survey-resources.html';

const SurveyResourcesComponent = {
  template:  templateUrl,
  controller: class SurveyResourcesComponent {
    constructor(){
     
    }
  }
}


export const SurveyResourcesModule = angular
  .module('surveyResources', [])
  .component('surveyResources', SurveyResourcesComponent)
  .name;
