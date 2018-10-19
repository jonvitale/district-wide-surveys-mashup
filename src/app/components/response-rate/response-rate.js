import templateUrl from './response-rate.html';

const ResponseRateComponent = {
  template: templateUrl,
  controller: class ResponseRateComponent {
    constructor(qlik){
      'ngInject';
      this.qlik = qlik;
      this.groups = ['Student', 'Teacher', 'Parent', 'Principal'];

      this.qlikIds = {
        'Student':
          {kpi: "agjyrN", comboChart:"ubXkKJP",
            nlines:1, title: "Students"},
        
        "Parent": 
          {kpi: "gPCKLE", comboChart:"mKgBpN",
            nlines:1, title:"Parents"},
        
        "Teacher": 
          {kpi: "vzerBN", comboChart:"PRqJJDN",
            nlines:1, title:"Teachers"},
        
        "Principal": 
          {kpi: "fFmEEmX", comboChart:"XWYmtpS",
            nlines:1, title:"Principals"},
        
      };
      this.qlikId_YOY = 'ZFNtJ';
      this.qlikId_Map = 'xXTjfW';
    }

    refreshQlik(){
      this.qlik.resize();
    }
  }
}

export const ResponseRateModule = angular
  .module('responseRate', [])
  .component('responseRate', ResponseRateComponent)
  .name;
