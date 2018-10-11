import templateUrl from './question-compare.html';

const QuestionCompareComponent = {
  template:  templateUrl,
  controller: class QuestionCompareComponent {
     constructor($openApp){
      'ngInject';
      this.$openApp = $openApp;
      console.log($openApp);
      this.$openApp.variable.setStringValue('vSurvey_Selected', 'Student');
      this.$openApp.variable.setStringValue('vConstruct_Selected', 'School Climate');
      this.$openApp.variable.setStringValue('vQuestionText_Selected', 'I enjoy being in school.');

    }
/*
    $onInit(){
      this.$openApp.variable.setStringValue('0204dcbd-87e1-4c7d-8e6c-9130fba1a712', 'Parent');
      this.$openApp.variable.setStringValue('c8253b5d-96d1-4197-99ae-9e226831fac2', 'School Climate');
      this.$openApp.variable.setStringValue('ddea6d9a-1c44-4155-8379-2535158317f4', 'Q3f');
      this.$openApp.variable.setStringValue('59015a80-55d8-42d9-b408-3b62ac806595', 'I am bullied at school');
    }
    $onChanges(){
      this.$openApp.variable.setStringValue('0204dcbd-87e1-4c7d-8e6c-9130fba1a712', 'Parent');
      this.$openApp.variable.setStringValue('c8253b5d-96d1-4197-99ae-9e226831fac2', 'School Climate');
      this.$openApp.variable.setStringValue('ddea6d9a-1c44-4155-8379-2535158317f4', 'Q3f');
      this.$openApp.variable.setStringValue('59015a80-55d8-42d9-b408-3b62ac806595', 'I am bullied at school');
    }

    */
  }
}

export const QuestionCompareModule = angular
  .module('questionCompare', [])
  .component('questionCompare', QuestionCompareComponent)
  .name;
