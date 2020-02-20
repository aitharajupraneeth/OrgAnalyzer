//Dependencies
var express = require('express');
var router = express.Router();
var jsforce = require('jsforce');
var request = require('request');
var toolingApexClass = require('../js/apexclass');
var toolingApexClassMember = require('../js/apexclassMember');
var metadataContainer = require('../js/metadataContainer');
var fetchObjects = require('./../js/fetchObjects');
var objectInfo = require('./../js/getTotalRecordCount');
var performDML = require('./../js/performDML');
var getRecords = require('../js/fetchRecords');
var toolingQuery = require('../js/toolingQuery');
var containerAsyncRequest = require('../js/containerAsyncRequest');

// constants

var metadataContainerName = 'OHA'+Math.random()+'4';
var metadaContainerId;
var apexClassList = new Array();
var apexClassMemberResponseList = new Array();
///Add list of objects to be excluded  (Objects we create to track org custom objects health).
var objectsToExclude = ['HK_Sobject_Metadata__c','HK_Apex_Class_Inbound__c','HK_Apex_Class_Outbound__c','HK_Apex_Class_References__c','HK_Apex_Class__c','HK_Apex_Trigger__c','HK_Employee_Info__c','HK_Fields__c','HK_VF_Page__c','HK_Workflow__c'];

//Routes

    router.get('/oha',function(req,response) {
        //response.send('api is working');

        //oAuth2 authentication...

        var conn = new jsforce.Connection({
            loginUrl : 'https://login.salesforce.com',
            oauth2 : {
                // you can change loginUrl to connect to sandbox or prerelease env.

                clientId : '3MVG9fMtCkV6eLhePUUGgYZz_829_85yiASQN4T1xd7AAe5sPrO1hD6qVflsPaDVmpNMOFKCwRFhcCoQNT5bk',
                clientSecret : 'C684AE953E972C67C46370C5F789C063F21CD35D5D01A903609959DD8A171B04',
                redirectUri : 'http://localhost:3000/'
            }
        });

 /*then(function(){ //create metadata container :
 return metadataContainer.create(conn,metadataContainerName);
 }). then(function(res){
 response.send(res);
 //rboine.hackathon@salesforce.com.sourceorg','Dreamjob11'
 */
    conn.login('aitharaju.praneeth@gmail.com','Saihemanth1!')
        .then(function(userInfo){
            console.log('**' + userInfo.id);
        })

        //get all objects from org
        .then (function (){
            return fetchObjects.getObjects(conn);
        })
        //filter only custom objects and exclude unwanted objects
        .then(function(meta){
            return fetchObjects.getValidObjects(meta,objectsToExclude);

        })
        //iterate through all objects , get total number of records
        .then(function(validObjects){

            if(validObjects){
                var promises = new Array();
                for(var i=0;i<validObjects.length;i++){
                    promises.push(objectInfo.totalNumberOfRecords(conn,validObjects[i]));

                }
                return Promise.all(promises);
            }
        })
        //get last record created for each object
        .then (function(sObjects){
            var promises = new Array();
            for(var i=0;i<sObjects.length;i++){
                promises.push(objectInfo.lastRecordCreated(conn,sObjects[i]));
            }
            return Promise.all(promises);
        })
        //get lastRecordModified for each object (Think: Do we really need this field? )
        .then (function(sObjects){
            var promises = new Array();
            for(var i=0;i<sObjects.length;i++){
                promises.push(objectInfo.lastRecordModified(conn,sObjects[i]));
            }
            return Promise.all(promises);
        })

        // now upsert list of sObjects into HK_Sobject_Metadata__c object.
        .then(function(sObjects){
            return performDML.upsert(conn,"HK_Sobject_Metadata__c","upsert",{extIdField : "Object_API__c"},sObjects);

        })

        // // 1) insert fields , apex classes
        //2) Using tooling api, insert apex outbound references
        //3) Determine apex inbound references
        //4) Determine object/apex references...
        //  ----
        //1 ) Insert apex classes into HK Apex Class object

        //fetch apex class records
        .then(function(response){
            return getRecords(conn,'ApexClass',['Id','Name']);

        })
        //insert apex class records into HK_Apex_Class__c object
        .then (function(response){
            var records = new Array();

            if(response.totalSize>=1) {
                for(var i=0;i<response.records.length;i++){
                    records.push({"Name" : response.records[i].Name,"Apex_Class_ID__c" : response.records[i].Id});
                }

            }
            apexClassList = records;
            return performDML.upsert(conn,"HK_Apex_Class__c","upsert",{extIdField :"Apex_Class_ID__c"},records);

        })
        //for each apex class record, get inbound and outbound references using tooling api...

        //Step 1) Create a metadata container



        .then(function(){
            if(metadaContainerId == null){
                return metadataContainer.create(conn,metadataContainerName);
            } else {
                return metadaContainerId;
            }

        })
        /*Step 2) fetch apex class Ids from apexClassList and call tooling apex class to retrieve body*/
        .then (function(result){
                 metadaContainerId = result.id;

                 var promises = new Array();
                for(var i=0;i<apexClassList.length;i++){
                    promises.push(toolingApexClass(conn, apexClassList[i].Apex_Class_ID__c));

                }
                return Promise.all(promises);

        })
        /*Step 3) Call apexClassMember tooling endpoint */

       .then(function (result){
            var apexObjectArray = new Array();
           var promises = new Array();
            for(var i=0;i<result.length;i++){
                apexObjectArray.push({"Id" : result[i].Id,"Body" : result[i].Body});
                promises.push(toolingApexClassMember(conn,result[i].Id,metadaContainerId,result[i].Body));
            }

           return  Promise.all(promises); //result set contains an array of Id and succes flag and erros if any :

           /* ex: [
            {
            "id": "40046000000XU3lAAG",
            "success": true,
            "errors": []
            },
            {
            "id": "40046000000XU4oAAG",
            "success": true,
            "errors": []
            }, .....
            ]*/

        })
           //call ContainerAsyncRequest
        .then (function(result){
            apexClassMemberResponseList = result;
            return containerAsyncRequest.create(conn,metadaContainerId);

        })

        .then (function(result){
            return  containerAsyncRequest.retrieve (conn,result.id);

        })


        /*.

         {
         "attributes": {
         "type": "ContainerAsyncRequest",
         "url": "/services/data/v39.0/tooling/sobjects/ContainerAsyncRequest/1dr46000001RfidAAC"
         },
         "Id": "1dr46000001RfidAAC",
         "IsDeleted": false,
         "CreatedDate": "2017-07-21T08:05:08.000+0000",
         "CreatedById": "005460000012VNrAAM",
         "LastModifiedDate": "2017-07-21T08:05:08.000+0000",
         "LastModifiedById": "005460000012VNrAAM",
         "SystemModstamp": "2017-07-21T08:05:08.000+0000",
         "MetadataContainerId": "1dc46000000RJ9SAAW",
         "MetadataContainerMemberId": null,
         "ErrorMsg": null,
         "IsRunTests": false,
         "State": "Queued",
         "IsCheckOnly": true,
         "DeployDetails": null
         }




                *
                *
                *
                * */

        .then(function(result){
            console.log('response??/');
            console.log('***' + result);

            var promises = new Array();
            if(apexClassMemberResponseList.length > 0){
                for(var i=0;i<apexClassMemberResponseList.length;i++){
                    var filter = "  Id = '"+apexClassMemberResponseList[i].id+"'";
                    promises.push(toolingQuery(conn,'ApexClassMember',['Id','SymbolTable'],filter));
                }
            }
            return  Promise.all(promises);
        })
       //results with symbol table

        .then(function(result){

            var sObjects = new Array();
            for(var i=0;i<result.length;i++){
                var response = result[i];
                var record = response.records[0]; //not sure at what instances we have more than one entry in response.records...but this is still an array with one element (according to my observation)
                var externalReferences = record.SymbolTable.externalReferences;
                for(var i=0;i<externalReferences.length;i++){
                    var HK_Apex_Class_Outbound__c = {"Class_ID__c" : record.id, "Outbound_Class_Name__c" : externalReferences[i].name, "Ext_Id__c" : record.id+externalReferences[i].name};
                    sObjects.push(HK_Apex_Class_Outbound__c);

                }
            }

            return performDML.upsert(conn,"HK_Apex_Class_Outbound__c","upsert",{extIdField : "Ext_Id__c"},sObjects);
            //response.send(result);
        })

        .then (function(result){
            response.send(result);
        })

        .catch(function(err){
            console.log('err?????');
            response.send(err);
            console.error(err);
    });


});

//Return router

module.exports = router;
