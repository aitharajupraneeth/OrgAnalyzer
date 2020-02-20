/**
 * Created by rboinepalli on 3/25/17.
 * Get all custom objects in org minus objects listed in objectsToExclude Array
 */
 var _ = require('lodash');
 var getObjects = function(conn) {

    return conn.describeGlobal();
 };

   var getValidObjects = function(meta,objectsToExclude) {

    return new Promise(function(resolve,reject){
        var requiredObjects = [];
        for(var i=0;i<meta.sobjects.length;i++){

            var sObject = meta.sobjects[i];
            if(_.endsWith(sObject.name,'__c')){ //check if given sObject is a custom object
                //check if sObject is in excluded objects array and if yes, then ignore this object
                if(objectsToExclude){
                    if(_.indexOf(objectsToExclude,sObject.name)>=0 ){
                        continue;
                    }
                }
                requiredObjects.push(sObject.name);

            }
        }
        resolve(requiredObjects);


    });
   };



module.exports = {getObjects : getObjects, getValidObjects : getValidObjects};