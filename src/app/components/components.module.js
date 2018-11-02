import { HomeModule } from './home/home';
import { FocusQuestionsModule } from './focus-questions/focus-questions';
import { QuestionCompareModule } from './question-compare/question-compare';
import { ResponseRateModule } from './response-rate/response-rate';
import { TopicsModule } from './topics/topics';
import { SurveyResourcesModule } from './survey-resources/survey-resources';

export const ComponentsModule = angular
  .module('components', [
    HomeModule,
    FocusQuestionsModule,
    QuestionCompareModule,
    ResponseRateModule,
    TopicsModule,
    SurveyResourcesModule,
  ])
  .name;
