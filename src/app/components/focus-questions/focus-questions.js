import templateUrl from './focus-questions.html';

const FocusQuestionsComponent = {
  template: templateUrl,
  $inject: ['qlik', '$openApp'],
  controller: class FocusQuestionsComponent {
    constructor(qlik, $openApp){
      'ngInject';
      this.qlik = qlik;
      this.$openApp = $openApp;
    }

    $onInit(){
     
      this.groups = ['Student', 'Teacher', 'Parent'];
      this.ags = ['AG1', 'AG2', 'AG3'];
      this.ag1_Grades = '';
      this.ag2_Grades = '';
      
      this.demoHeaders = {
        'intro': '% of Students that selected',
        'response': '"Most or all the time"',
        'stem': 'How often are these things true?',
      };

      this.groupHeaders = {
        'Student': {
          'intro': '% of Students that selected',
          'response': '"Most or all the time"',
          'stem': 'How often are these things true?',
        },
        'Parent': {
          'intro': '% of Parents that selected',
          'response': '"Strongly agree"',
          'stem': 'How much do you agree with the following statements?',
        },
        'Teacher': {
          'intro': '% of Teachers that selected',
          'response': '"Strongly agree"',
          'stem': 'How much do you agree or disagree with the following statements?',
        },
      }

      this.agHeaders = {
        'AG1': {
          'intro': 'Students that selected',
          'response': '"Strongly agree"',
          'stem': 'How often are these things true?',
        },
        'AG2': {
          'intro': 'Parents that selected',
          'response': '"Strongly agree"',
          'stem': 'How much do you agree with the following statements?',
        },
        'AG3': {
          'intro': 'Teachers that selected',
          'response': '"Not a challenge"',
          'stem': 'How much do you agree or disagree with the following statements?',
        },
      }

      this.demoIds = {
        kpi: "SkGwzt", 
        comboChart: "EqPaCh",
        nlines: 1, 
        title: "I enjoy being in school."
      }

      this.groupIds = {
        'Student': [
          {kpi: "wwELJm", comboChart:"deDTty",
            nlines:1, title: "When I am in school, I feel like I belong."},
          {kpi: "mTJvZYa", comboChart:"fypwxT",
            nlines:2, title:"My teachers have high expectations for me in school."},
          {kpi: "mJkJzd", comboChart:"jqKeJMM",
            nlines:1, title:"I feel safe in my classes."},
        ],
        "Parent": [
          {kpi: "DYpjPgm", comboChart:"nTLYrD",
            nlines:3, title:"I feel welcome in my child’s school."},
          {kpi: "UAjtB", comboChart:"ZpLw",
            nlines:3, title:"My child's school has high expectations for my child's learning."},
          {kpi: "HSzxBtb", comboChart:"UqQzeE",
            nlines:3, title:"My child's school values my feedback."},
        ],
        "Teacher": [
          {kpi: "mEATKb", comboChart:"NkMKJg",
            nlines:2, title:"Teacher morale is high."},
          {kpi: "JSdtjzb", comboChart:"xJqeW",
            nlines:2, title:"Teachers at my school support the idea that all students can learn."},
          {kpi: "ruJVeP", comboChart:"tFVQ",
            nlines:2, title:"I am encouraged to innovate to improve my teaching."},
        ]
      };

      this.agIds = {
        'AG1': [
          {kpi: "nLvTP", comboChart:"NnQURGd",
            nlines:1, title: "My school is helping to prepare me for college."},
          {kpi: "VVnuMSj", comboChart:"vTjs",
            nlines:2, title:"I am learning skills in school that will help me when I am older. "},
          {kpi: "hMdjgP", comboChart:"JcdAcx",
            nlines:1, title:"I am learning skills in school that can help me make my community better."},
        ],
        "AG2": [
          {kpi: "HnXjwp", comboChart:"FmUmHB",
            nlines:3, title:"My child likes to read."},
          {kpi: "vAPpqD", comboChart:"KFFUHK",
            nlines:3, title:"Teachers at my child's school encourage my child to read outside of school."},
          {kpi: "haQjqeK", comboChart:"pQjpa",
            nlines:3, title:"Teachers at my child's school give helpful comments on homework, classwork, and tests."},
        ],
        "AG3": [
          {kpi: "NNZBNrb", comboChart:"XPnvme",
            nlines:2, title:"Teacher turnover."},
          {kpi: "QJFds", comboChart:"qtCqfM",
            nlines:2, title:"Shortage of highly qualified teachers."},
          {kpi: "YGfjEg", comboChart:"XfPpVFW",
            nlines:2, title:"Lack of high-quality professional development opportunities for teachers."},
        ]
      };

      this.selectActiveGroup('Student');
      this.selectActiveAG('AG1');
      this.accordionsCollapsed = true;
      this.$openApp.variable.getContent('vCYTD', reply => {
        this.CYTD = reply.qContent.qString;
      });
      this.$openApp.variable.getContent('vPYTD', reply => {
        this.PYTD = reply.qContent.qString;
      });
      //this.$openApp.field('Survey').selectMatch("Teacher", true);
    }


    onClickFilterHeader(){
      this.$openApp.variable.getContent('vGrades_AG1', reply => {
        this.ag1_Grades = reply.qContent.qString;
      });
      this.$openApp.variable.getContent('vGrades_AG2', reply => {
        this.ag2_Grades = reply.qContent.qString;
      });
    }

    onClickGroup(group){
      this.selectActiveGroup(group);
    }

    onClickAG(ag){
      this.selectActiveAG(ag);
    }

    selectActiveGroup(group){
      this.activeGroup = group;
    }

    selectActiveAG(ag){
      this.activeAG = ag;
    }

    /**
     * When an accordion tab is opened we need to resize the qlik object.
     * Additionally, we keep track if any accordion tabs are open.
     * If they are we will hide the top graph and question selection button.
     */
    onClickAccordion(evt){
      // is the target of this event going from or to a collapsed state
      if (evt.currentTarget.className.includes("collapsed")){
        this.accordionsCollapsed = false;
        this.$openApp.variable.getContent('vGrades_AG1', reply => {
          this.ag1_Grades = reply.qContent.qString;
        });
        this.$openApp.variable.getContent('vGrades_AG2', reply => {
          this.ag2_Grades = reply.qContent.qString;
        });
      } else {
        this.accordionsCollapsed = true;
      }
      
      this.qlik.resize();
    }
  }
}

export const FocusQuestionsModule = angular
  .module('focusQuestions', [])
  .component('focusQuestions', FocusQuestionsComponent)
  .name;
