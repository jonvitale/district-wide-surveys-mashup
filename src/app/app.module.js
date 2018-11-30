import { AppComponent } from './app.component';
import { QlikVariablesService } from './qlik.variables.service';
import { SharedModule } from './shared/shared.module';
import { ComponentsModule } from './components/components.module';
// import './app.scss';
import config from './config';
import ngTouch from 'angular-touch';
import ngRoute from 'angular-route';
// import $ from 'jquery';
import bootstrap from 'bootstrap';

export const AppModule = qlik => (
  angular.module('app', [
    ComponentsModule,
    SharedModule,
    ngRoute,
    ngTouch
  ])
  .service('$openApp', ()=> qlik.openApp(config.app, config))
  .service('qlik', ()=> qlik)
  .service('QlikVariablesService', QlikVariablesService)
  .component('app', AppComponent)
  .config(['$locationProvider', '$routeProvider',
    ($locationProvider, $routeProvider) => {
      $routeProvider
        .when('/home', {
          template: '<home></home>'
        })
        .when('/focus-questions', {
          template: '<focus-questions></focus-questions>'
        })
        .when('/question-compare', {
          template: '<question-compare></question-compare>'
        })
        .when('/response-rate', {
          template: '<response-rate></response-rate>'
        })
        .when('/topics', {
          template: '<topics></topics>'
        })
        .when('/survey-resources', {
          template: '<survey-resources></survey-resources>'
        })
        .otherwise('/home');
    }
  ])
  .name
);
