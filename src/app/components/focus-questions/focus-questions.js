import templateUrl from './focus-questions.html';

const FocusQuestionsComponent = {
  template: templateUrl,
  $inject: ['$openApp'],
  controller: class FocusQuestionsComponent {
    constructor($openApp){
      'ngInject';
      this.$openApp = $openApp;
     
      this.groups = ['Student', 'Teacher', 'Parent'];

      this.qlikIds = {
        'Student': [
          {kpi: "wwELJm", comboChart:"deDTty",
            nlines:1, title: "I enjoy being in school."},
          {kpi: "mTJvZYa", comboChart:"fypwxT",
            nlines:2, title:"My teachers have high expectations for me in school."},
          {kpi: "mJkJzd", comboChart:"jqKeJMM",
            nlines:1, title:"My school is clean."},
          {kpi: "kgmRJrX", comboChart:"bQwmsx",
            nlines:1, title:"I am bullied at school."}
        ],
        "Parent": [
          {kpi: "DYpjPgm", comboChart:"NkMKJg",
            nlines:3, title:"I am pleased with the quality of education my child's school is providing for my child."},
          {kpi: "UAjtB", comboChart:"xJqeW",
            nlines:3, title:"My child's school has high expectations for my child's learning."},
          {kpi: "HSzxBtb", comboChart:"tFVQ",
            nlines:3, title:"Teachers at my child's school encourage my child to work hard."},
          {kpi: "YUtrbg", comboChart:"sQQzQJ",
            nlines:1, title:"My child feels safe at school."}
        ],
        "Teacher": [
          {kpi: "mEATKb", comboChart:"nTLYrD",
            nlines:2, title:"The principal communicates a clear mission for our school."},
          {kpi: "JSdtjzb", comboChart:"ZpLw",
            nlines:2, title:"My students are motivated to learn."},
          {kpi: "ruJVeP", comboChart:"UqQzeE",
            nlines:2, title:"My students influence decisions regarding learning activities."},
          {kpi: "RvKpPm", comboChart:"BKkjH",
            nlines:2, title:"My students are more focused on grades than learning."}
        ]
      };

      this.selectActiveGroup('Student');
      //this.$openApp.field('Survey').selectMatch("Teacher", true);
    }

    onClickGroup(group){
      this.selectActiveGroup(group);
    }

    selectActiveGroup(group){
      this.activeGroup = group;
    }
  }
}

export const FocusQuestionsModule = angular
  .module('focusQuestions', [])
  .component('focusQuestions', FocusQuestionsComponent)
  .name;
