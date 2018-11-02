import templateUrl from './response-rate.html';

const ResponseRateComponent = {
  template: templateUrl,
  controller: class ResponseRateComponent {
    constructor(qlik, $openApp){
      'ngInject';
      this.qlik = qlik;
      this.$openApp = $openApp;
      this.groups = ['Student', 'Teacher', 'Parent', 'Principal'];
      this.qlikIds = {
        'Student':
          {kpi: "agjyrN", comboChart:"ubXkKJP",
            nlines:1, title: "Students", style: {
              'background-color':'#e2e8ff',
            },
          },        
        "Parent": 
          {kpi: "gPCKLE", comboChart:"mKgBpN",
            nlines:1, title:"Parents", style: {
              'background-color':'#ddffe4',
            },
          },
        "Teacher": 
          {kpi: "vzerBN", comboChart:"PRqJJDN",
            nlines:1, title:"Teachers", style: {
              'background-color':'#fff4ee',
            },
          },
        "Principal": 
          {kpi: "fFmEEmX", comboChart:"XWYmtpS",
            nlines:1, title:"Principals", 
            style: {
              'background-color':'#d3ccff',
            },
          }
      };
    }

    $onInit(){
      this.accordionsCollapsed = true;
      this.$openApp.variable.getContent('vCYTD', reply => {
        this.CYTD = reply.qContent.qString;
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
