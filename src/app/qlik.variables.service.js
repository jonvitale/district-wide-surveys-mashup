
/** Functions applicable class-wide */
const getUniqueValues = function(value, index, self) { 
  return self.indexOf(value) === index && value != '-' && 
      value != 'no construct/subconstruct assigned';
}

/** For an array, returns a map with each distinct array value as a key, and count as a value */
const getValueCountObj = values => {
  return values.reduce( function(acc, curr){
    acc[curr] = typeof acc[curr] == 'undefined' ? 1 : acc[curr] + 1
    return acc;
  }, {});
}

const getSortedFieldValues = (values, sortOrder) => {
  if (sortOrder != null){
    // count each value in the values
    const valueCounts = getValueCountObj(values);

    let sortedKeys = [];
    let sortedValues = [];
    let value = null;
    let valueArr =  [];
    for (let i = 0; i < sortOrder.length; i++){
      value = sortOrder[i];
      sortedKeys.push(value);
      valueArr = typeof valueCounts[value] === 'number' ? 
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

export class QlikVariablesService {
   
  constructor(qlik, $openApp){
    'ngInject';
    this.$openApp = $openApp;
    //this.variables = {};
    this.variableObserverCallbacks = {};    
    this.table = null;
    this.initializing = true;
    this.trackerStatus = null;
 		// let fieldNames = ['Survey', 'Construct', 'SubConstruct', 'QuestionText'];
 		this.variables = {

 			'vSurvey_Selected': {
        variableName: 'vSurvey_Selected', 
        variableLabel: 'Group', 
        //sourceArray: ['Student', 'Teacher', 'Parent', 'Principal'],
        sourceField: 'Survey',
        cssClass: 'survey',
        governingVariables: ['vConstruct_Selected'],
        orientation: 'horiz',
        sortOrder: ['Student', 'Teacher', 'Parent', 'Principal'],
        useQlik: true,
      },
      'vTopic_Selected': {
        variableName: 'vTopic_Selected',
        variableLabel: 'Topic',
        //sourceField: 'Construct',
        sourceArray: ['All Topics', 'Instruction', 'School Climate', 'Parent/Guardian-Community Ties', 'School Leadership', 'Professional Capacity'],
        cssClass: 'construct',
        governingVariables: [],
        orientation: 'horiz', 
        sortOrder: ['All Topics', 'Instruction', 'School Climate', 'Parent/Guardian-Community Ties', 'School Leadership', 'Professional Capacity'],
        useQlik: true,
      },
      'vConstruct_Selected': {
        variableName: 'vConstruct_Selected',
        variableLabel: 'Topic',
        sourceField: 'Construct',
        cssClass: 'construct',
        governingVariables: ['vSurvey_Selected'],
        orientation: 'horiz', 
        sortOrder: ['Instruction', 'School Climate', 'Parent/Guardian-Community Ties', 'School Leadership', 'Professional Capacity', 'Other'],
        useQlik: true,
      },
      'vSubConstruct_Selected': {
        variableName: 'vSubConstruct_Selected',
        variableLabel: 'Sub-Topic',
        sourceField: 'SubConstruct',
        cssClass: 'subConstruct',
        governingVariables: ['vSurvey_Selected', 'vConstruct_Selected'],
        orientation: 'combo', 
        useQlik: false,
      },
      'vQuestionText_Selected': {
        variableName: 'vQuestionText_Selected',
        variableLabel: 'Question',
        sourceField: 'QuestionText',
        cssClass:'question-text',
        governingVariables: ['vSurvey_Selected', 'vConstruct_Selected', 'vSubConstruct_Selected'],
        orientation: 'list',
        useQlik: true,
      }
 		};
     
    let fieldNames = [];
    this.fieldToVariable = {};

    // initialize each variable, set status and initial value
    for (let variableName in this.variables) {
      this.variables[variableName].status = "loading";
      if (this.variables[variableName].sourceField != null && this.variables[variableName].sourceField.length > 0) {
        let field = this.variables[variableName].sourceField;
        fieldNames.push(field);
        this.fieldToVariable[field] = variableName;
      }      
      this.getVariableValue(variableName);
    }
    //fieldNames.push("SequenceNumber");

    // for each variable determine which variables it is governing (we call these dependents)
    for (let variableName in this.variables) {
      this.variables[variableName].dependents = [];
    }
    
    for (let variableName in this.variables) {
      for (let gi = 0; gi < this.variables[variableName].governingVariables.length; gi++) {
        let gvariableName = this.variables[variableName].governingVariables[gi];
        this.variables[gvariableName].dependents.push(variableName);
      }
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
      // console.log("qtable", qTable);
      // debugger;
			let table = {};
      let dimNames = [];
      let dimValues = [];
      let measures = [];
			// loop through rows of the qTable to populate a static table
			for (let i = 0; i < qTable.rows.length; i++){
        dimNames = qTable.rows[i].dimensions.map(dimObj => dimObj.qDimensionInfo.qFallbackTitle);
				dimValues = qTable.rows[i].dimensions.map(dimObj => dimObj.qText);
				measures = qTable.rows[i].measures.map(measureObj => measureObj.qNum);
        
        // the sum of all values of the measures (which are 1 or 0) should equal the length
        if (measures.length == measures.reduce((acc, val) => acc+val, 0)){
					// loop through each dim adding to table
					for (let j = 0; j < dimNames.length; j++){
						let dimName = dimNames[j];
						// if this field name has not been defined yet, do so
						if (table[dimName] == null){
							table[dimName] = [];
						}	
						table[dimName].push(dimValues[j]);
					}
				}
			}
			this.table = table;
			this.initializing = false;
      console.log("Question Table Initialized!!!!", this.table);
		});

  }

  /**
   * Stores the current state of the tracker. If the tracker is
   * not working returns an empty string. If parents and students
   * are working returns 'ps'. If all are working returns 'pst'
   * @return {Promise<string>} one of 'ps', 'pst', ''
   */
  getTrackerStatus() {    
    return new Promise((resolve, reject) => {
      if (this.trackerStatus != null) {
        resolve(this.trackerStatus);
      } else {
        this.$openApp.variable.getContent('vTrackerStatus', reply => {
          const value = reply.qContent.qString;
          this.trackerStatus = value; 
          resolve(value);
        }, error => reject(error)
        )        
      }
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
            // combos need arrays
            if (this.variables[variableName]['orientation'] == 'combo'){
              this.getFieldValuesWithSelections(variableName, this.variables[variableName].governingVariables).then(
                values => {
                  // set current value to selectable values returned
                  const selectableValues = values
                    .filter(valObj => valObj.selectable)
                    .map(valObj => valObj.value);

                  this.variables[variableName]['currentValue'] = selectableValues;
                  // note, we are loading this here, but if there are any changes to governing
                  // variables, this will need to be reset
                  this.variables[variableName].status = 'loaded';
                  resolve(selectableValues);
                },
                error => reject(error)
              )
            } else {
              this.variables[variableName]['status'] = 'loaded'; 
              this.variables[variableName]['currentValue'] = '';  
              resolve('');
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
  setVariableValue(variableName, value) {
    //console.log("????qlik service - setVariableValue--", variableName, value);
  	return new Promise( (resolve, reject) => {
      // if this variable comes from Qlik set it there
      if (this.variables[variableName]['useQlik']){
    		this.$openApp.variable.setStringValue(variableName, value).then(
    			success => {
            this.variables[variableName]['status'] = 'loaded';
    				this.variables[variableName]['currentValue'] = value;
            this.setNonQlikDependentsToLoading(variableName);
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
        this.setNonQlikDependentsToLoading(variableName);
        this.notifyVariableObservers(variableName);
        resolve(value);
      }	    	
    });
  }
 
     /*
       For variables that are not being taken directly from qlik, they will need to 
       be adjusted if governing variables change, thus their status should be set to "loading"
       For example, if the default sub-construct of a survey is based upon the chosen construct
       When the construct changes, the sub-construct must load up all the new possibilities to 
       select a default.
      */
      setNonQlikDependentsToLoading(variableName) {
        for (let di = 0; di < this.variables[variableName].dependents.length; di++) {
         let dvariableName = this.variables[variableName].dependents[di];
         if (!this.variables[dvariableName].useQlik) {
          this.variables[dvariableName].status = 'loading';
          // this.variables[dvariableName].currentValue = [];
          // the following initializes the value
          this.getVariableValue(dvariableName).then(
            values => {
              this.notifyVariableObservers(dvariableName);
            },
            error => console.log(error)
          );
         }       
       }
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
      // console.log("toggleVariableValueInArray",variableName, variable, angular.isArray(variable.currentValue));
      // if the currentValue is not an array we pass this along to set
      if (angular.isArray(variable.currentValue)){
        // if the status of this variable is not loaded then we try to load all values
        if (variable.status == 'loaded'){
          resolve(this._toggleVariableValueInArray(variableName, value));
        } else {
          reject(variableName + " not loaded");
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
      if (index >= 0) {
        // take it out
        variable.currentValue.splice(index, 1);
      } else {
        // put it in
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
      // if there is a static list of values, return that immediately
      if (this.variables[targetVariable].sourceArray != null && this.variables[targetVariable].sourceArray.length > 0){
        resolve(this.variables[targetVariable].sourceArray
          .map(val => { return({'value': val, 'selectable': true}) })
        );
      } else {
        let maxAttempts = 50;
        let attempts = 0;
        // if this is still initializing keeping polling
        let poll = () => {
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
      }
    });
  }

    _getFieldValuesWithSelections(targetVariable, selectionVariables) {  
      if (this.table == null) return null;

      let _table = angular.copy(this.table);
      
      let targetField = this.variables[targetVariable].sourceField;
      let targetValues = _table[targetField];
      let indicesToKeep = Array.apply(null, {length: targetValues.length}).map(Number.call, Number);

      // get all the unique values in the field (disregarding selections)
      let uniqueVals = targetValues.filter(getUniqueValues);
      
      let selections = null;
      if (selectionVariables != null && selectionVariables.length > 0){
        selections = {};
        for (let i = 0; i < selectionVariables.length; i++){
          let variable = selectionVariables[i];
          selections[variable] = this.variables[variable];
        }
      }


      // reduce table based on selectionVariables
      if (selections == null){
        // if there are no selections return all unique values as selectable, then map array to an object with selectable field
        return getSortedFieldValues(uniqueVals, this.variables[targetVariable].sortOrder)
          .map(val => { return({'value': val, 'selectable': true}) });
      } else {
        for (let variable in selections){
          let field = this.variables[variable].sourceField;
          // make sure that the field is in selections
          // also this selection field should not be the target field
          if (_table[field] != null && targetVariable != variable){
            let fieldInTable = _table[field];
            let fSelections = selections[variable].currentValue;        
            
            // is this field selection a text/number or an array of text/numbers?
            if (typeof fSelections === 'int' || (typeof fSelections === 'string' && fSelections.length > 0)){
              // is this value on the table
              indicesToKeep = indicesToKeep.filter(indexVal => fieldInTable[indexVal] == fSelections && fieldInTable[indexVal] != "-");
            } else if (angular.isArray(fSelections)) {
              indicesToKeep = indicesToKeep.filter(indexVal => fSelections.indexOf(fieldInTable[indexVal]) >= 0 && fieldInTable[indexVal] != "-");
            }
          }
        }
        
        // get a list of unique selectable target values
        const selectableValues = indicesToKeep.map(indexVal => _table[targetField][indexVal])
          .filter(val => val != '-')
          .filter(getUniqueValues);
        
        // create and return an array determing whether the value is in the selectable array
        return getSortedFieldValues(uniqueVals, this.variables[targetVariable].sortOrder)
          .map(val => { return({'value': val, 'selectable': selectableValues.indexOf(val) >= 0}) });
      }
    }
 
  

  registerVariableObserver(variableName, callback){
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
  		angular.forEach(this.variableObserverCallbacks[variableName], callback => {
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
