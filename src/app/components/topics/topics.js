import templateUrl from './topics.html';

const TopicsComponent = {
  template: templateUrl,
   $inject: ['qlik'],
  controller: class TopicsComponent {
    constructor(qlik){
      'ngInject';
      this.qlik = qlik;
      this.groups = ['Student', 'Teacher', 'Parent', 'Principal'];
      this.topics = ['School Climate', 'Instruction', 'Parent/Guardian-Community Ties', 'Professional Capacity', 'School Leadership'];
    }

    $onInit(){
      this.accordionsCollapsed = true;
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

export const TopicsModule = angular
  .module('topics', [])
  .component('topics', TopicsComponent)
  .name;
