export class QlikVariablesService {
	constructor(qlik, $openApp){
    'ngInject';
    this.$openApp = $openApp;
    this.variables = {};
    this.variableObserverCallbacks = {};    
    this.table = null;
    this.initializing = true;
 		let fieldNames = ['Survey', 'Construct', 'SubConstruct', 'QuestionText'];
 		this.possibleVariables = {
 			 'Survey': {
        variableName: 'vSurvey_Selected', 
        variableLabel: 'Group', 
        //sourceArray: ['Student', 'Teacher', 'Parent', 'Principal'],
        sourceField: 'Survey',
        cssClass: 'survey',
        governingFields: ['Construct'],
        orientation: 'horiz',
        sortOrder: ['Student', 'Teacher', 'Parent', 'Principal'],
      },
      'Construct': {
        variableName: 'vConstruct_Selected',
        variableLabel: 'Topic',
        sourceField: 'Construct',
        cssClass: 'construct',
        governingFields: ['Survey'],
        orientation: 'horiz', 
        sortOrder: ['School Climate', 'Instruction', 'Parent/Guardian-Community Ties', 'School Leadership', 'Professional Capacity', 'Other'],
      },
      'SubConstruct': {
        variableName: 'vSubConstruct_Selected',
        variableLabel: 'Sub-Topic',
        sourceField: 'SubConstruct',
        cssClass: 'subConstruct',
        governingFields: ['Survey', 'Construct'],
        orientation: 'combo', 
      },
      'QuestionText': {
        variableName: 'vQuestionText_Selected',
        variableLabel: 'Question',
        sourceField: 'QuestionText',
        cssClass:'question-text',
        governingFields: ['Survey', 'Construct', 'SubConstruct'],
        orientation: 'list',
      }
 		};

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

  getVariableDetails(fieldName){
  	if (this.possibleVariables[fieldName] != null){
  		return this.possibleVariables[fieldName];
  	}
  }

  /**
   * Given a set of N values, returns an N sorted array according to stored sorting rules
   * @param  {[type]} fieldName Name of the field
   * @param  {[type]} values    Values in the field
   * @return {[type]}           Array of sorted values.
   */
  sortFieldValues(fieldName, values){
  	if (this.possibleVariables[fieldName].sortOrder != null){
  		// count each value in the values
  		let valueCounts = values.reduce( function(acc, curr){
  			acc[curr] = typeof acc[curr] == 'undefined' ? 1 : acc[curr] + 1
			  return acc;
  		}, {});
  		let sortedValues = [];
  		let sortedKeys = [];
  		for (let i = 0; i < this.possibleVariables[fieldName].sortOrder.length; i++){
  			let value = this.possibleVariables[fieldName].sortOrder[i];
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

  /**
   * Returns an object with the unique values in a field, given a set of selections in other fields.
   * @param  {string} targetField The name of a field, from which we return unique values
   * @param  {[type]} selections  An object with field names as keys and a string, int, or array of selected values in that field
   * @return {[type]}             An object with "all" (M unique values), "selectable" (M boolean values, is the value possible), "selectableValues" (N unique, selectable values)
   */
	getFieldValuesWithSelections(targetField, selections){
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
					resolve(this._getFieldValuesWithSelections(targetField, selections));
				}
			}
			if (this.initializing){
				setTimeout(poll, 1000);
			} else {
				resolve(this._getFieldValuesWithSelections(targetField, selections));
			}
		});
	}

	_getFieldValuesWithSelections(targetField, selections){
  	function clone(obj) {
	    if (null == obj || "object" != typeof obj) return obj;
	    var copy = obj.constructor();
	    for (var attr in obj) {
	        if (obj.hasOwnProperty(attr)) copy[attr] = clone(obj[attr]);
	    }
	    return copy;
		}

		function onlyUnique(value, index, self){ 
   	  return self.indexOf(value) === index && value != '-' && 
          value != 'no construct/subconstruct assigned';
		}

		if (this.table == null) return null;

  	let _table = clone(this.table);
  	
  	let targetValues = _table[targetField];
  	let indicesToKeep = Array.apply(null, {length: targetValues.length}).map(Number.call, Number);

  	// get all the unique values in the field (disregarding selections)
  	let uniqueVals = targetValues.filter(onlyUnique);
  	
  	// if selections are null, assume that all variables are possible
  	if (selections == null){
  		let sortedUniqueVals = this.sortFieldValues(targetField, uniqueVals);
  		let values = []; 
      for (let i = 0; i < sortedUniqueVals.length; i++){
        values.push({'value': sortedUniqueVals[i], 'selectable':true});
      }
  		return values;
  	} else {
	  	for (let field in selections){
	  		// make sure that the field is in selections
	  		// also this selection field should not be the target field
	  		if (_table[field] != null && targetField != field){
	  			let fieldInTable = _table[field];
					let fSelections = selections[field];  			
	  			
	  			// loop through the field in table
	  			for (let i = indicesToKeep.length - 1; i >= 0; i--){
	  				let index = indicesToKeep[i];
		  			if (typeof fSelections === 'int' || typeof fSelections === 'string'){
		  				if (fieldInTable[index] != fSelections || fieldInTable[index] == "-"){
		  					indicesToKeep.splice(i, 1);
		  				}
		  			} else {
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
			let sortedSelectableVals = this.sortFieldValues(targetField, selectableValues);

			// create an array determing whether the value in the selectable array
			let sortedUniqueVals = this.sortFieldValues(targetField, uniqueVals);

			let values = [];
			for (let i = 0; i < sortedUniqueVals.length; i++){
				values.push({'value': sortedUniqueVals[i], 'selectable':selectableValues.indexOf(sortedUniqueVals[i]) >= 0});
			}

			return values;
		}
  }
 
  getVariableValue(variableName){
  	return new Promise( (resolve, reject) => {
  		if (this.variables[variableName] == null){
    		this.$openApp.variable.getContent(variableName, reply => {
	        resolve(reply.qContent.qString);
	      }, error => {
	      	reject(variableName, "failed to load");
	      });
    	} else {
    		resolve(this.variables[variableName]);
    	}
  	});
  }

  setVariableValue(variableName, value){
    //console.log("????qlik service - setVariableValue--", variableName, value);
  	return new Promise( (resolve, reject) => {
  		this.$openApp.variable.setStringValue(variableName, value).then(
  			success => {
  				this.variables[variableName] = value;
  				this.notifyVariableObservers(variableName);
        	resolve(true);
        },
        failure => {
        	reject(variableName, "failed to set");
        }
      );	    	
  	});
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
  			callback(this.variables[variableName]);
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
