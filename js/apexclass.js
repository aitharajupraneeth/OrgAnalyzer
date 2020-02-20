
    var apexClass = function(conn,Id){
         return conn.tooling.sobject('ApexClass').retrieve(Id);
     }





  module.exports = apexClass;

