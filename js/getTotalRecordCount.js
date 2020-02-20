/**
 * Created by rboinepalli on 3/26/17.
 */

var objectRecordInfo = {
    totalNumberOfRecords : function(conn,objectApi){

         return new Promise(function(resolve,reject){
             conn.query('SELECT count() from '+ objectApi)
                 .then(function(response){
                     var sObject = {"Name" : objectApi,"Object_API__c" : objectApi};
                     sObject["Number_of_Records__c"] = response.totalSize;
                     resolve(sObject);
                     })
                   .catch(function(err){
                     console.log('error' + err);

                   });
                 })


  },

    lastRecordCreated : function(conn,sObject){
        return new Promise(function(resolve,reject){
            conn.query('SELECT CREATEDDATE FROM '+sObject.Name +' order by CREATEDDATE Desc LIMIT 1')
                .then(function(response){
                    if(response && response.totalSize>=1){
                        var queryResult = response.records[0];
                        sObject["Last_Record_Created_Date__c"] = queryResult.CreatedDate;

                    } else {
                        sObject["Last_Record_Created_Date__c"] = null;
                    }
                    resolve(sObject);

                })
                .catch(function(err){
                    console.log('error' + err);
                    reject(err);
                });
        })

            .catch(function(err){
                console.log('err');
            });

    },

    lastRecordModified : function(conn,sObject){
        return new Promise(function(resolve,reject){
            conn.query('SELECT LASTMODIFIEDDATE FROM '+sObject.Name +' order by LASTMODIFIEDDATE Desc LIMIT 1')
                .then(function(response){
                    if(response && response.totalSize>=1){
                        var queryResult = response.records[0];
                        sObject["Last_Record_Modified_Date__c"] = queryResult.LastModifiedDate;

                    } else {
                        sObject["Last_Record_Modified_Date__c"] = null;
                    }
                    resolve(sObject);

                })
                .catch(function(err){
                    console.log('error' + err);
                    reject(err);
                });
        })

            .catch(function(err){
                console.log(err);
                reject(err);
            });
    }



};

module.exports = objectRecordInfo;
