import templateUrl from './topics.html';

const TopicsComponent = {
  template: templateUrl,
  controller: class TopicsComponent {
    constructor(){
      this.groups = ['Student', 'Teacher', 'Parent', 'Principal'];
      this.topics = ['School Climate', 'Instruction', 'Parent/Guardian-Community Ties', 'Professional Capacity', 'School Leadership'];
      this.yoyId = 'JPhNfNh';
      
    }
  }
}

export const TopicsModule = angular
  .module('topics', [])
  .component('topics', TopicsComponent)
  .name;
