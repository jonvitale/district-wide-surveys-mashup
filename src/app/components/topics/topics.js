import templateUrl from './topics.html';

const TopicsComponent = {
  template: templateUrl,
  $inject: ['$scope', 'qlik', '$openApp', 'QlikVariablesService'],
  controller: class TopicsComponent {
    constructor($scope, qlik, $openApp, QlikVariablesService){
      'ngInject';
      this.qlik = qlik;      
      this.$openApp = $openApp;       
      this.QlikVariablesService = QlikVariablesService;
      this.groups = ['Student', 'Teacher', 'Parent', 'Principal'];
      this.topics = ['School Climate', 'Instruction', 'Parent/Guardian-Community Ties', 'Professional Capacity', 'School Leadership'];
      $scope.$on('childPressEvent', this.onClickValueTypeSelector.bind(this));
    }

    $onInit(){
      if (window.scrollTo != null) window.scrollTo(0, 0);
      // google analytics
      gtag('event', 'screen_init', {
        'event_category': 'navigation',
        'event_label': 'Topics'
      });

      this.accordionsCollapsed = true;

      this.valueType = '0-10 Scale';
      this.useScaledScore = true;
      
      // what's the latest year
      this.$openApp.variable.getContent('vCYTD', reply => {
        this.CYTD = reply.qContent.qString;
      });
      // previous year
      this.$openApp.variable.getContent('vPYTD', reply => {
        this.PYTD = reply.qContent.qString;
      });
      
      // get initial value of construct, if "Other" set to "School Climate"
      this.QlikVariablesService.getVariableValue('vConstruct_Selected').then(value => {
        this.construct_selected = value;
        if (this.construct_selected == 'Other'){
          this.QlikVariablesService.setVariableValue('vConstruct_Selected', 'School Climate');
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
      if (evt.currentTarget.id == "headingMap"){// && this.map_init == null){
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
          'event_label': 'Topics-' + evt.currentTarget.id
        });
      } else {
        this.accordionsCollapsed = true;
      }
      
      this.qlik.resize();
    }

    onClickValueTypeSelector(event, val) {
      // console.log("hi", event, val);
      this.valueType = val;
      if (val == '% Most Positive') {
        this.useScaledScore = false;
      } else {
        this.useScaledScore = true;
      }
    }
  }
}

export const TopicsModule = angular
  .module('topics', [])
  .component('topics', TopicsComponent)
  .name;
