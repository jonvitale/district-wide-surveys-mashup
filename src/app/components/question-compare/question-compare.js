import templateUrl from './question-compare.html';

const QuestionCompareComponent = {
  template:  templateUrl,
  $inject: ['$timeout', 'qlik', '$openApp', 'QlikVariablesService'],
  controller: class QuestionCompareComponent {
     constructor($timeout, qlik, $openApp, QlikVariablesService){
      'ngInject';
      this.$timeout = $timeout;
      this.qlik = qlik;
      this.$openApp = $openApp;
      this.QlikVariablesService = QlikVariablesService;        
    }

    $onInit(){
      if (window.scrollTo != null) window.scrollTo(0, 0);
      // google analytics
      gtag('event', 'screen_init', {
        'event_category': 'navigation',
        'event_label': 'AllQuestions'
      });

      this.includeComparison = true;
      this.questionCollapsed = true;
      this.accordionsCollapsed = true;
      this.survey = '';
      this.construct = '';
      this.subConstruct = '';
      this.questionText = '';
      this.questionStem = '';
      this.useDemos = true;    

      let filters = ["Sector", "Current Network", "School Name", "Grade", "Gender", "Ethnicity"];
      for (let f = 0; f < filters.length; f++){
        let filter = filters[f];
        this.$openApp.visualization.create('listbox',
          [filter], {
            "showTitles": true,
            "title": filter,
            "qListObjectDef": {
              "qStateName": "Alt1",
            }
          }
        ).then(vis => {
          vis.show("altSelectionPlaceholder-"+f);
        });
      }


      // console.log($(".collapse"));
      // $(".collapse").collapse();
      // $(".collapse").on('shown.bs.collapse', function(){
      //   console.log("accordion shown");
      // });

      // what's the latest year
      this.$openApp.variable.getContent('vCYTD', reply => {
        this.CYTD = reply.qContent.qString;
      });

      // constants
      this.$openApp.variable.getContent('vCount_Questions_Student_CYTD', reply => {
        this.numQuestionsStudent = reply.qContent.qString;
      });
      this.$openApp.variable.getContent('vCount_Questions_Parent_CYTD', reply => {
        this.numQuestionsParent = reply.qContent.qString;
      });
      this.$openApp.variable.getContent('vCount_Questions_Teacher_CYTD', reply => {
        this.numQuestionsTeacher = reply.qContent.qString;
      });
      this.$openApp.variable.getContent('vCount_Questions_Principal_CYTD', reply => {
        this.numQuestionsPrincipal = reply.qContent.qString;
      });


      // question-related variables
      this.QlikVariablesService.getVariableValue('vSurvey_Selected').then(value => {
        this.survey = value;
      });
      this.QlikVariablesService.getVariableValue('vConstruct_Selected').then(value => {
        this.construct = value;
      });
      this.QlikVariablesService.getVariableValue('vSubConstruct_Selected').then(value => {
        this.subConstruct = value;
      });
      this.QlikVariablesService.getVariableValue('vQuestionText_Selected').then(value => {
        this.questionText = value;
      });
      this.QlikVariablesService.getVariableValue('vQuestionStem_Selected').then(value => {
        this.questionStem = value;
      });


      //register listeners
      this.QlikVariablesService.registerVariableObserver('vSurvey_Selected', (variable, value) => {
        if (this.survey !== value){
          this.survey = value;
          this.useDemos = this.survey == 'Student' || this.survey == "Parent";
        }
      });
      this.QlikVariablesService.registerVariableObserver('vConstruct_Selected', (variable, value) => {
        if (this.construct !== value){
          this.construct = value;
        }
      });
      this.QlikVariablesService.registerVariableObserver('vSubConstruct_Selected', (variable, value) => {
        if (this.subConstruct !== value){
          this.subConstruct = value;
        }
      });
      this.QlikVariablesService.registerVariableObserver('vQuestionText_Selected', (variable, value) => {
        if (this.questionText !== value){
          this.questionText = value;
          // when the questionText changes we also need the stem.
          this.QlikVariablesService.getVariableValue('vQuestionStem_Selected').then(value => {
            this.questionStem = value;
          });
        }
      });
    }

    $onChanges(){
      this.QlikVariablesService.getVariableValue('vQuestionText_Selected').then(value => {
        this.questionText = value;
      });
      this.QlikVariablesService.getVariableValue('vQuestionStem_Selected').then(value => {
        this.questionStem = value;
      });
    }

    $onDestroy(){
      // unregister listeners
      console.log("---onDestroy question-compare--");
      this.QlikVariablesService.unregisterVariableObservers('vSurvey_Selected');
      this.QlikVariablesService.unregisterVariableObservers('vConstruct_Selected');
      this.QlikVariablesService.unregisterVariableObservers('vSubConstruct_Selected');
      this.QlikVariablesService.unregisterVariableObservers('vQuestionText_Selected');
    }

    onVariableSelection(survey, topic, questionText){
      this.survey = survey;
      this.topic = topic;
      this.questionText = questionText;
    }

    clearSelections(stateName){
      this.$openApp.clearAll(true, stateName);
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
          'event_label': 'AllQuestions-' + evt.currentTarget.id
        });
      } else {
        this.accordionsCollapsed = true;
      }

      this.$timeout(() => {console.log("here"); this.qlik.resize()}, 1000);
      
      // this.qlik.resize();
    }

    onClickQuestionSelect(){
      this.questionCollapsed = !this.questionCollapsed; 
      this.qlik.resize();
    }

    onClickAltSelectionsClose(){
      this.qlik.resize();
    }

    onClickAltSelectionsOpen(){
      this.qlik.resize();
    }
  }
}

export const QuestionCompareModule = angular
  .module('questionCompare', [])
  .component('questionCompare', QuestionCompareComponent)
  .name;
