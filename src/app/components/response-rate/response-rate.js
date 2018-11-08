import templateUrl from './response-rate.html';

const ResponseRateComponent = {
  template: templateUrl,
  controller: class ResponseRateComponent {
    constructor(qlik, $openApp){
      'ngInject';
      this.qlik = qlik;
      this.$openApp = $openApp;      
    }

    $onInit(){
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
