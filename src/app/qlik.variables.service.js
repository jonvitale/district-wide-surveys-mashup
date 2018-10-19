export class QlikVariablesService {
	constructor(qlik, $openApp){
    'ngInject';
    this.$openApp = $openApp;
    this.variables = {};
    this.variableObserverCallbacks = {};
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
  	console.log("callback", callback);
  	// if we don't yet have an array of callbacks for this variable, add one
  	if (this.variableObserverCallbacks[variableName] == null){
  		this.variableObserverCallbacks[variableName] = [callback];
  	} else {
  		this.variableObserverCallbacks[variableName].push(callback);
  	}
  }

  notifyVariableObservers(variableName){
  	console.log("notifyVariableObservers", variableName, this.variableObserverCallbacks);
  	if (typeof this.variableObserverCallbacks[variableName] == 'object' &&
  		  this.variableObserverCallbacks[variableName].length > 0){
  		let observerCallbacks = this.variableObserverCallbacks[variableName];
  		angular.forEach(observerCallbacks, callback => {
  			callback(this.variables[variableName]);
  		});
  	}
  }

  unregisterVariableObservers(variableName){
  	if (typeof this.variableObserverCallbacks[variableName] == 'object' &&
  		  this.variableObserverCallbacks[variableName].length > 0){
  		this.variableObserverCallbacks[variableName] = null;
  	}
  }
}
