/**
 * Created by rboinepalli on 7/17/17.
 */



var getRecords = function(conn,objName,fields,filter) {

    var query ='SELECT ';
     for(var i=0;i<fields.length;i++){
         query = query + fields[i] + ',';
     }

    query = query.substring(0,query.length-1);
    query = query + ' FROM ' + objName;


    if(filter && filter!=null){
        query = query + ' WHERE ' + filter;
    }
    return conn.query(query);



};



module.exports = getRecords;