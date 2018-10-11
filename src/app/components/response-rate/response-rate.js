import templateUrl from './response-rate.html';

const ResponseRateComponent = {
  template: templateUrl,
  controller: class ResponseRateComponent {
    constructor(){
      this.groups = ['Student', 'Teacher', 'Parent', 'Principal'];

      this.qlikIds = {
        'Student':
          {kpi: "agjyrN", comboChart:"ubXkKJP",
            nlines:1, title: "Student"},
        
        "Parent": 
          {kpi: "gPCKLE", comboChart:"mKgBpN",
            nlines:1, title:"Parent"},
        
        "Teacher": 
          {kpi: "vzerBN", comboChart:"PRqJJDN",
            nlines:1, title:"Teacher"},
        
        "Principal": 
          {kpi: "fFmEEmX", comboChart:"XWYmtpS",
            nlines:1, title:"Principal"},
        
      };
    }
  }
}

export const ResponseRateModule = angular
  .module('responseRate', [])
  .component('responseRate', ResponseRateComponent)
  .name;
