import templateUrl from './response-rate.html';

const ResponseRateComponent = {
  template: templateUrl,
  $inject: ['qlik', '$openApp', 'QlikVariablesService'],
  controller: class ResponseRateComponent {
    constructor(qlik, $openApp, QlikVariablesService){
      'ngInject';
      this.qlik = qlik;
      this.$openApp = $openApp;   
      this.QlikVariablesService = QlikVariablesService;   
    }

    $onInit(){
      // google analytics
      gtag('event', 'screen_init', {
        'event_category': 'navigation',
        'event_label': 'ResponseRate'
      });

      this.groups = ['Student', 'Teacher', 'Parent', 'Principal'];
      this.qlikIds = {
        'Student':
          {kpi: "agjyrN", comboChart:"ubXkKJP",
            nlines:1, title: "Student", style: {
              'background-color':'rgba(71, 170, 216, 0.2)',
            },
          },        
        "Parent": 
          {kpi: "gPCKLE", comboChart:"mKgBpN",
            nlines:1, title:"Parent/Guardian", style: {
              'background-color':'rgba(57, 134, 53, 0.2)',
            },
          },
        "Teacher": 
          {kpi: "vzerBN", comboChart:"PRqJJDN",
            nlines:1, title:"Teacher", style: {
              'background-color':'rgba(255, 170, 48, 0.2)',
            },
          },
        "Principal": 
          {kpi: "fFmEEmX", comboChart:"XWYmtpS",
            nlines:1, title:"Principal", 
            style: {
              'background-color':'rgba(11, 49, 91, 0.1)',
            },
          }
      };

      this.accordionsCollapsed = true;
      this.$openApp.variable.getContent('vCYTD', reply => {
        this.CYTD = reply.qContent.qString;
      });
      this.$openApp.variable.getContent('vPYTD', reply => {
        this.PYTD = reply.qContent.qString;
      });

      this.$openApp.variable.getContent('vCount1_Enrolled_Student_CYTD', reply => {
        this.studentsEnrolledCYTD = reply.qContent.qString;
      });
      this.$openApp.variable.getContent('vCount1_Enrolled_Teacher_CYTD', reply => {
        this.teachersEnrolledCYTD = reply.qContent.qString;
      });
      this.$openApp.variable.getContent('vCount1_Enrolled_Parent_CYTD', reply => {
        this.parentsEnrolledCYTD = reply.qContent.qString;
      });
      this.$openApp.variable.getContent('vCount1_Enrolled_Principal_CYTD', reply => {
        this.principalsEnrolledCYTD = reply.qContent.qString;
      });

      // get initial value of survey, if "Principal" set to "Student"
      this.QlikVariablesService.getVariableValue('vSurvey_Selected').then(value => {
        this.survey_selected = value;
        if (this.survey_selected == 'Principal'){
          this.QlikVariablesService.setVariableValue('vSurvey_Selected', 'Student');
        }
      });
    }

    /**
     * When an accordion tab is opened we need to resize the qlik object.
     * Additionally, we keep track if any accordion tabs are open.
     * If they are we will hide the top graph and question selection button.
     */
    onClickAccordion(evt){
      // if this is the map, do an arbitrary selection and clearing.
      if (evt.currentTarget.id == "headingMap"){//} && this.map_init == null){
        // make an arbitrary selection to force the map to zoom.
        let dfield = this.$openApp.field('_dummy_field');
        dfield.select([0, 1]).then(() => {
          dfield.clear();
          this.map_init = true;
        });
      }

      // is the target of this event going from or to a collapsed state
      if (evt.currentTarget.className.includes("collapsed")){
        this.accordionsCollapsed = false;
        gtag('event', 'accordion-open', {
          'event_category': 'view-content',
          'event_label': 'ResponseRate-' + evt.currentTarget.id
        });
      } else {
        this.accordionsCollapsed = true;
      }
      
      this.qlik.resize();
    }
  }
}

export const ResponseRateModule = angular
  .module('responseRate', [])
  .component('responseRate', ResponseRateComponent)
  .name;
