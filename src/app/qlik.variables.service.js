export class QlikVariablesService {
	constructor(qlik, $openApp){
    'ngInject';
    this.$openApp = $openApp;
    //this.variables = {};
    this.variableObserverCallbacks = {};    
    this.table = null;
    this.initializing = true;
 		// let fieldNames = ['Survey', 'Construct', 'SubConstruct', 'QuestionText'];
 		this.variables = {

 			'vSurvey_Selected': {
        variableName: 'vSurvey_Selected', 
        variableLabel: 'Group', 
        //sourceArray: ['Student', 'Teacher', 'Parent', 'Principal'],
        sourceField: 'Survey',
        cssClass: 'survey',
        // governingFields: ['Construct'],
        governingVariables: ['vConstruct_Selected'],
        orientation: 'horiz',
        sortOrder: ['Student', 'Teacher', 'Parent', 'Principal'],
        useQlik: true,
      },
      'vConstruct_Selected': {
        variableName: 'vConstruct_Selected',
        variableLabel: 'Topic',
        sourceField: 'Construct',
        cssClass: 'construct',
        // governingFields: ['Survey'],
        governingVariables: ['vSurvey_Selected'],
        orientation: 'horiz', 
        sortOrder: ['School Climate', 'Instruction', 'Parent/Guardian-Community Ties', 'School Leadership', 'Professional Capacity', 'Other'],
        useQlik: true,
      },
      'vSubConstruct_Selected': {
        variableName: 'vSubConstruct_Selected',
        variableLabel: 'Sub-Topic',
        sourceField: 'SubConstruct',
        cssClass: 'subConstruct',
        // governingFields: ['Survey', 'Construct'],
        governingVariables: ['vSurvey_Selected', 'vConstruct_Selected'],
        orientation: 'combo', 
        useQlik: false,
      },
      'vQuestionText_Selected': {
        variableName: 'vQuestionText_Selected',
        variableLabel: 'Question',
        sourceField: 'QuestionText',
        cssClass:'question-text',
        // governingFields: ['Survey', 'Construct', 'SubConstruct'],
        governingVariables: ['vSurvey_Selected', 'vConstruct_Selected', 'vSubConstruct_Selected'],
        orientation: 'list',
        useQlik: true,
      }
 		};

    let fieldNames = [];
    this.fieldToVariable = {};

    // initialize each variable, set status and initial value
    for (let variableName in this.variables){
      this.variables[variableName].status = "loading";
      let field = this.variables[variableName].sourceField;
      fieldNames.push(field);
      this.fieldToVariable[field] = variableName;
      this.getVariableValue(variableName);
    }
    // add _CYTD_Flag to ensure that we are always using up to date data
    this.variables['_CYTD_Flag'] = {
      variableName: '_CYTD_Flag',
      sourceField: '_CYTD_Flag',
      currentValue: 1,
      useQlik: false,
    }

 		let qTable = this.$openApp.createTable(fieldNames, ["Max(_CYTD_Flag)"], {rows:2000});
		qTable.OnData.bind(() => {
			qTable.OnData.unbind();
			this.initializing = false;
			let table = {};
			// loop through rows of the qTable to populate a static table
			for (let i = 0; i < qTable.rows.length; i++){
				let dims = qTable.rows[i].dimensions;
				let measures = qTable.rows[i].measures
				let valid = true;
				// loop through any measures and make sure they are all 1
				for (let j = 0; j < measures.length; j++){
					if (measures[j].qNum != 1){
						valid = false;
						break;
					}
				}
				// make sure that the first measure is 1
				if (valid){
					// loop through each dim adding to table
					for (let j = 0; j < dims.length; j++){
						let dimName = dims[j].qDimensionInfo.qFallbackTitle;
						// if this field name has not been defined yet, do so
						if (table[dimName] == null){
							table[dimName] = [];
						}	
						table[dimName].push(dims[j].qText);
					}
				}
			}
			this.table = table;
			console.log("Question Table Initialized!!!!", this.table);
		});


  }

  getVariableDetails(variableName){
    if (this.variables[variableName] != null){
  		return angular.copy(this.variables[variableName]);
  	}
  }

  /**
   * Initially, uses the Qlik API to get the current value of a variable.
   * Subsequently, this value is stored and retrieved immediately.
   * @param  {string} variableName The name of the variable in Qlik.
   * @return {Promise}              A promise of the value of the variable.
   */
  getVariableValue(variableName){
    return new Promise( (resolve, reject) => {
      if (this.variables[variableName] != null){
        // has this value been loaded?
        if (this.variables[variableName].status == "loaded"){
          resolve(this.variables[variableName].currentValue);
        } else {
          // if this variable comes from Qlik go grab it
          if (this.variables[variableName]['useQlik']){
            this.$openApp.variable.getContent(variableName, reply => {
              let value = reply.qContent.qString;
              this.variables[variableName]['status'] = 'loaded'; 
              this.variables[variableName]['currentValue'] = value;   
              resolve(value);
            }, error => {
              // if already set, don't change, else set
              if (this.variables[variableName]['status'] == null || this.variables[variableName]['status'] != 'loaded'){
                this.variables[variableName]['status'] = 'loaded'; 
                this.variables[variableName]['currentValue'] = null;  
              }
              reject(variableName, "not set");
            });
          } else {
            // if not from qlik set as blank
            if (this.variables[variableName]['orientation'] == 'combo'){
              // we keep the status as loading because we need to make sure all
              // selections are set before we load in all possibilites
              this.variables[variableName]['status'] = 'loading'; 
              this.variables[variableName]['currentValue'] = [];      
              resolve([]);
            } else {
              this.variables[variableName]['status'] = 'loaded'; 
              this.variables[variableName]['currentValue'] = '';  
              resolve(value);
            }            
          }
        }
      } else {
        // this isn't a registered variable, but it may exist in Qlik,
        // try to receive it but don't do anything with it.
        this.$openApp.variable.getContent(variableName, 
          reply => resolve(reply.qContent.qString),
          error => reject("no such variable in Qlik", variableName, error)
        )
      }
    });
  }

  /**
   * Sets a variable to the given value. Do not use with any variable that stores in an array.
   * @param {string} variableName The name of a string or int variable
   * @param {string} value        The value to set the current value to.
   */
  setVariableValue(variableName, value){
    //console.log("????qlik service - setVariableValue--", variableName, value);
  	return new Promise( (resolve, reject) => {
      // if this variable comes from Qlik set it there
      if (this.variables[variableName]['useQlik']){
    		this.$openApp.variable.setStringValue(variableName, value).then(
    			success => {
            this.variables[variableName]['status'] = 'loaded';
    				this.variables[variableName]['currentValue'] = value;
    				this.notifyVariableObservers(variableName);
          	resolve(value);
          },
          failure => {
            // we don't update or inform observers because it needs to be tied to the Qlik var
          	reject(variableName, "failed to set");
          }
        );
      } else {
        this.variables[variableName]['status'] = 'loaded';
        this.variables[variableName]['currentValue'] = value;
        this.notifyVariableObservers(variableName);
        resolve(value);
      }	    	
    });
  }

  /**
   * For an array variable will either add the value to the current array, or if it already exists
   * take it off. Additionally, if the possible values have not been loaded yet will load all
   * possible values (with governing variables) as the current values.
   * @param {string} variableName The name of a string or int variable
   * @param {string} value        The value to add or remove from the current values array.
   */
  toggleVariableValueInArray(variableName, value){
    return new Promise( (resolve, reject) => {
     
      let variable = this.variables[variableName];
      // if the currentValue is not an array we pass this along to set
      if (angular.isArray(variable.currentValue)){
        // if the status of this variable is not loaded then we try to load all values
        if (variable.status == 'loaded'){
          resolve(this._toggleVariableValueInArray(variableName, value));
        } else {
          this.getFieldValuesWithSelections(variableName, variable.governingVariables).then(
            values => {
              // set current value to selectable values returned
              let selectableValues = [];
              for (let i = 0; i < values.length; i++){
                if (values[i].selectable) selectableValues.push(values[i].value);
              }
              this.variables[variableName]['currentValue'] = selectableValues;
              resolve(this._toggleVariableValueInArray(variableName, value));
            },
            error => reject(error)
          )
        }
      } else {
        return this.setVariableValue(variableName, value);
      } 
    });
  }

    _toggleVariableValueInArray(variableName, value){
      let variable = this.variables[variableName];
      // is this variable in the current selections
      let index = variable.currentValue.indexOf(value);
      if (index >= 0){
        // take it out
        variable.currentValue.splice(index, 1);
      } else {
        variable.currentValue.push(value);
      }
      this.notifyVariableObservers(variableName);
      return variable.currentValue;
    }

  /**
   * Returns an object with the unique values in a field, given a set of selections in other fields.
   * @param  {string} targetField The name of a field, from which we return unique values
   * @param  {[type]} selections  An object with field names as keys and a string, int, or array of selected values in that field
   * @return {[type]}             An object with "all" (M unique values), "selectable" (M boolean values, is the value possible), "selectableValues" (N unique, selectable values)
   */
  getFieldValuesWithSelections(targetVariable, selectionVariables){
    return new Promise( (resolve, reject) => {
      let maxAttempts = 10;
      let attempts = 0;
    
      // if this is still initializing keeping polling
      let poll = () => {
        // console.log(this, maxAttempts, attempts);
        maxAttempts++;
        if (this.initializing){
          if (attempts <= maxAttempts){
            attempts++;
            setTimeout(poll, 1000);
          } else {
            reject('Could not get table from Qlik');
          }
        } else {
          resolve(this._getFieldValuesWithSelections(targetVariable, selectionVariables));
        }
      }
      if (this.initializing){
        setTimeout(poll, 1000);
      } else {
        resolve(this._getFieldValuesWithSelections(targetVariable, selectionVariables));
      }
    });
  }

    _getFieldValuesWithSelections(targetVariable, selectionVariables){  
      function onlyUnique(value, index, self){ 
        return self.indexOf(value) === index && value != '-' && 
            value != 'no construct/subconstruct assigned';
      }
      let getSortedFieldValues = (variableName, values) => {
        if (this.variables[variableName].sortOrder != null){
          // count each value in the values
          let valueCounts = values.reduce( function(acc, curr){
            acc[curr] = typeof acc[curr] == 'undefined' ? 1 : acc[curr] + 1
            return acc;
          }, {});
          let sortedValues = [];
          let sortedKeys = [];
          for (let i = 0; i < this.variables[variableName].sortOrder.length; i++){
            let value = this.variables[variableName].sortOrder[i];
            sortedKeys.push(value);
            let valueArr = typeof valueCounts[value] === 'number' ? 
              new Array(valueCounts[value]).fill(value) : [];
            sortedValues = sortedValues.concat(valueArr);
          }
          // add on any values that we haven't added yet
          for (let key in valueCounts){
            if (sortedKeys.indexOf(key) == -1){
              sortedValues = sortedValues.concat(new Array(valueCounts[key]).fill(key));
            }
          }
          return sortedValues;
        } else {
          return values;
        }
      }

      if (this.table == null) return null;

      let _table = angular.copy(this.table);
      
      let targetField = this.variables[targetVariable].sourceField;
      let targetValues = _table[targetField];
      let indicesToKeep = Array.apply(null, {length: targetValues.length}).map(Number.call, Number);

      // get all the unique values in the field (disregarding selections)
      let uniqueVals = targetValues.filter(onlyUnique);
      
      let selections = null;
      if (selectionVariables != null && selectionVariables.length > 0){
        selections = {};
        for (let i = 0; i < selectionVariables.length; i++){
          let variable = selectionVariables[i];
          selections[variable] = this.variables[variable];
        }
      }

      // reduce table based on selectionVariables
      // if selections are null, assume that all variables are possible
      if (selections == null){
        let sortedUniqueVals = getSortedFieldValues(targetVariable, uniqueVals);
        let values = []; 
        for (let i = 0; i < sortedUniqueVals.length; i++){
          values.push({'value': sortedUniqueVals[i], 'selectable':true});
        }
        return values;
      } else {
        for (let variable in selections){
          let field = this.variables[variable].sourceField;
          // make sure that the field is in selections
          // also this selection field should not be the target field
          if (_table[field] != null && targetVariable != variable){
            let fieldInTable = _table[field];
            let fSelections = selections[variable].currentValue;        
            
            // loop through the field in table
            for (let i = indicesToKeep.length - 1; i >= 0; i--){
              let index = indicesToKeep[i];
              // a single value for this variable
              if (typeof fSelections === 'int' || (typeof fSelections === 'string' && fSelections.length > 0)){
                if (fieldInTable[index] != fSelections || fieldInTable[index] == "-"){
                  indicesToKeep.splice(i, 1);
                }
              } else if (fSelections.length > 0) {
              // an array of values, if empty we take everything
                let found = false;
                for (let j = 0; j < fSelections.length; j++){
                  if (fieldInTable[index] == fSelections[j] || fieldInTable[index] == "-"){
                    found = true;
                    break;
                  }
                }
                if (!found){
                  indicesToKeep.splice(i, 1);             
                }
              }
            }
          }
        }
        
        // get a list of unique selectable target values
        let selectableValues = [];
        for (let i = 0; i < indicesToKeep.length; i++){       
          let index = indicesToKeep[i]
          let value = _table[targetField][index];
          // is this value already in selectableValues?
          if (value != '-' && (selectableValues.length == 0 || selectableValues.indexOf(value) < 0)){
            selectableValues.push(_table[targetField][index]);
          }
        }
        let sortedSelectableVals = getSortedFieldValues(targetVariable, selectableValues);

        // create an array determing whether the value in the selectable array
        let sortedUniqueVals = getSortedFieldValues(targetVariable, uniqueVals);

        let values = [];
        for (let i = 0; i < sortedUniqueVals.length; i++){
          values.push({'value': sortedUniqueVals[i], 'selectable':selectableValues.indexOf(sortedUniqueVals[i]) >= 0});
        }

        return values;
      }
    }
 
  

  registerVariableObserver(variableName, callback){
  	//console.log("callback", callback);
  	// if we don't yet have an array of callbacks for this variable, add one
  	if (this.variableObserverCallbacks[variableName] == null){
  		this.variableObserverCallbacks[variableName] = [callback];
  	} else {
  		this.variableObserverCallbacks[variableName].push(callback);
  	}
  }

  notifyVariableObservers(variableName){
  	// console.log("notifyVariableObservers", variableName, this.variableObserverCallbacks);
  	if (this.variableObserverCallbacks[variableName] != null &&
  		  this.variableObserverCallbacks[variableName].length > 0){
  		let observerCallbacks = this.variableObserverCallbacks[variableName];
  		angular.forEach(observerCallbacks, callback => {
  			callback(variableName, this.variables[variableName].currentValue);
  		});
  	}
  }

  unregisterVariableObservers(variableName){
  	if (this.variableObserverCallbacks[variableName] != null &&
  		  this.variableObserverCallbacks[variableName].length > 0){
  		this.variableObserverCallbacks[variableName] = null;
  	}
  }
}
