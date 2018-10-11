import templateUrl from './filter-selector.html';

const FilterSelectorComponent = {
  template: templateUrl,
  bindings: {
    selectionFieldNames: '@',
    filterFieldNames: '<'
  },
  $inject: ['$openApp'],
  controller: class FilterSelectorComponent {
    constructor($openApp){
      'ngInject';
      this.$openApp = $openApp;

      this.fields = [
        {name: "QuestionText", label: "Questions", role: "selection", variable: 'vQuestionText_Selected'},
        {name: "Survey", label: "Respondent Group", role: "selection", variable: 'vSurvey_Selected'},
        {name: "Construct", label: "Topic", role: "filter", variable: 'vConstruct_Selected'}
      ];

      this.fieldNames = [];
      this.fieldRolls = {};
      for (let i = 0; i < this.fields.length; i++){
        this.fieldNames.push(this.fields[i]['name']);
        this.fieldRolls[this.fields[i]['name']] = this.fields[i]['role'];
      }

      this.activeFilters = {};
      this.activeSelection = "";
    }

    $onInit (){
      // an array with each table row as object, each column header as key
      var fieldData = this.fieldData = [];
      // an object with keys for each field with array of distinct cases
      var fieldValues = this.fieldValues = {};
      // a light version of fieldValues with only active filters
      var activeFilters = this.activeFilters;
      var fieldRolls = this.fieldRolls;
      try {
        this.$openApp
          .createTable(this.fieldNames, [], {rows:1000})
          .OnData.bind(function(){
            let table = this;
            for (let rowi = 0; rowi < table.rows.length; rowi++){
              let rowData = {};
              for (let coli = 0; coli < table.colCount; coli++){
                let fname = table.rows[rowi].dimensions[coli].qDimensionInfo.qFallbackTitle;
                let fvalue = table.rows[rowi].dimensions[coli].qText;
                rowData[fname] = fvalue;
                if (fvalue !== '-'){
                  typeof fieldValues[fname] !== 'undefined'
                    ? fieldValues[fname].push(fvalue)
                    : fieldValues[fname] = [];
                }
                // we only need one of these for rolls
                if (rowi === 0 && fieldRolls[fname] === 'filter'){
                  activeFilters[fname] = []; // default to empty
                }
              }
              fieldData.push(rowData);
            }
            // remove duplicates of fieldValues
            for (var key in fieldValues){
              var seen = {};
              fieldValues[key] = fieldValues[key].filter(function(item){
                return seen.hasOwnProperty(item) ? false : (seen[item] = true);
              });
            }
          });
        } catch (err) {
          console.log("Qlik did not load a table");
        }
    }

    onClickFilter(field, value, isSelected){
      //console.log("toggle filter:", field['name'], value, isSelected);
      let fname = field['name'];
      let index = this.activeFilters[fname].indexOf(value);
      if (isSelected && index < 0){
        this.activeFilters[fname].push(value);
      } else if (!isSelected && index >= 0){
        this.activeFilters[fname].splice(index, 1);
      }
      //console.log("active filters", this.activeFilters);
    }

    onClickSelection(selectedRow, fieldName){
      console.log("selection clicked:", selectedRow, "fieldName:", fieldName);
      //let index = this.fieldNames[fieldName].indexOf(value);
      //let field = this.fields[index];
      this.$openApp.variable.setStringValue('vSurvey_Selected', selectedRow.Survey);
      this.$openApp.variable.setStringValue('vConstruct_Selected', selectedRow.Construct);
      this.$openApp.variable.setStringValue('vQuestionText_Selected', selectedRow.QuestionText);

      this.activeSelection = selectedRow[fieldName];
      // this.$openApp.field(fieldName).selectValues(
      //   [{qText: this.activeSelection}], true, true
      // );
      // 
      console.log('in onClickSelection', this.activeSelection);
      //this.$openApp.variable.setStringValue(field.variable, this.activeSelection);
    }
  }
}

export const FilterSelectorModule = angular
  .module('filterSelector', [])
  .filter('inArrayByKeyFilter', function(){
    return function(items, search){
      if (!search) {
        return items;
      }
      return items.filter(function(element, index, array){
          for (let e in element){
            if (typeof search[e] !== 'undefined'){
              if (search[e].indexOf(element[e]) >= 0){
                continue;
              } else {
                return false;
              }
            }
          }
          return true;
        }
      );
    }
  })
  .component('filterSelector', FilterSelectorComponent)
  .name;
