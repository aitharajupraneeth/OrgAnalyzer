/**
 * Created by rboinepalli on 3/28/17.
 */


var performDml = {

    normalDML : function(conn,objectType,operation,list){

       return conn.bulk.load(objectType,operation,list);
    },

    upsert : function(conn,objectType,operation,options,list) {

       return conn.bulk.load(objectType,operation,options,list);


    }
};



module.exports = performDml;