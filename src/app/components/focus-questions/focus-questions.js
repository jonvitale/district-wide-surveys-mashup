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
      if (window.scrollTo != null) window.scrollTo(0, 0);
      // google analytics
      gtag('event', 'screen_init', {
        'event_category': 'navigation',
        'event_label': 'Highlights'
      });
     
      this.groups = ['Student', 'Teacher', 'Parent'];
      this.ags = ['AG1', 'AG2', 'AG3'];
      this.ag1_Grades = '';
      this.ag2_Grades = '';

      this.agHeaders = {
        'AG1': {
          'intro': 'Students that selected',
          'response': '"Strongly agree"',
          'stem': 'How much do you agree with the following statements?',
        },
        'AG2': {
          'intro': 'Parents that selected',
          'response': '"Strongly agree"',
          'stem': 'How much do you agree with the following statements?',
        },
        'AG3': {
          'intro': 'Students that selected',
          'response': '"Most or all the time"',
          'stem': 'How often are these things true?',
        },
      }

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
            nlines:2, title:"My teachers explain information in a way I understand."},
          {kpi: "QJFds", comboChart:"qtCqfM",
            nlines:2, title:"My teachers have high expectations for me in school."},
          {kpi: "YGfjEg", comboChart:"XfPpVFW",
            nlines:2, title:"My teachers encourage me to work hard."},
        ]
      };

      this.accordionsCollapsed = true;
      this.$openApp.variable.getContent('vCYTD', reply => {
        this.CYTD = reply.qContent.qString;
      });
      this.$openApp.variable.getContent('vPYTD', reply => {
        this.PYTD = reply.qContent.qString;
      });
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

    /**
     * When an accordion tab is opened we need to resize the qlik object.
     * Additionally, we keep track if any accordion tabs are open.
     * If they are we will hide the top graph and question selection button.
     */
    onClickAccordion(evt){
      // is the target of this event going from or to a collapsed state
      if (evt.currentTarget.className.includes("collapsed")){
        gtag('event', 'accordion-open', {
          'event_category': 'view-content',
          'event_label': 'Highlights-' + evt.currentTarget.id
        });
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
