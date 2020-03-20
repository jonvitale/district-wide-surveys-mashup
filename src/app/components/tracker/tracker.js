import templateUrl from './tracker.html'

const TrackerComponent = {
  template: templateUrl,
  bindings: {
      currentPage: '@',
  },
  $inject: ['qlik', '$openApp', 'QlikVariablesService'],
  controller: class TrackerComponent {
  	constructor(qlik, $openApp, QlikVariablesService){
      'ngInject';
      this.qlik = qlik;
      this.$openApp = $openApp;   
      this.QlikVariablesService = QlikVariablesService;
      this.afterMay31 = false;
      // these are overwritten by variables
      this.showTracker = true
      this.showParent = true
      this.showTeacher = true

    }

    $onInit(){
       // google analytics
      gtag('event', 'screen_init', {
        'event_category': 'navigation',
        'event_label': 'Tracker'
      });

      this.qlikIds = {
        'Student': {
          kpi: "RAfuLTN",
          title: "Student", 
          style: {
            'background-color':'rgba(71, 170, 216, 0.2)',
          },
        },        
        "Parent": {
          kpi: "jZQTKke", 
          title:"Parent/Guardian", 
          style: {
            'background-color':'rgba(57, 134, 53, 0.2)',
          },
        },
        "Teacher": {
          kpi: "wGPjvN", 
          title:"Teacher", 
          style: {
            'background-color':'rgba(255, 170, 48, 0.2)',
          },
        }
      };
      
      this.QlikVariablesService.getTrackerStatus()
        .then(status => {
          this.showTeacher = status.includes('t');
          this.showParent = status.includes('p');
          
          if (this.showTeacher && this.showParent) {
            this.tableId = 'PbMGPNn';
          } else if (this.showTeacher) {
            this.tableId = 'mNp';
            delete this.qlikIds['Parent'];
          } else {
            this.tableId = 'UGeqLT';
            delete this.qlikIds['Teacher'];
          }
          this.qlik.resize();
        })
        .catch(() => this.showTracker = false);

      this.$openApp.variable.getContent('vEYTD', reply => {
        this.EYTD = reply.qContent.qString;
      });

      this.$openApp.variable.getContent('vReloadYesterday', reply => {
        this.reloadDate = reply.qContent.qString;
      });

      this.$openApp.variable.getContent('_vDate_Household', reply => {
        this.householdDate = reply.qContent.qString;
      });

      this.$openApp.variable.getContent('vSum_ResponseCount_Student_Current', reply => {
        this.studentResponsesCYTD = reply.qContent.qString;
      });
      this.$openApp.variable.getContent('vSum_ResponseCount_Parent_Current', reply => {
        this.parentResponsesCYTD = reply.qContent.qString;
      });
      this.$openApp.variable.getContent('vSum_ResponseCount_Household_Current', reply => {
        this.householdResponsesCYTD = reply.qContent.qString;
      });
      this.$openApp.variable.getContent('vSum_ResponseCount_Teacher_Current', reply => {
        this.teacherResponsesCYTD = reply.qContent.qString;
      });
    }  

    onClickAccordion(evt) {
      this.qlik.resize();
      if (evt.currentTarget.className.includes("collapsed")){
        gtag('event', 'accordion-open', {
          'event_category': 'view-content',
          'event_label': 'Tracker-' + evt.currentTarget.id
        });
      } 
    }
  }
}

export const TrackerModule = angular
  .module('tracker', [])
  .component('tracker', TrackerComponent)
  .name;


