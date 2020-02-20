/**
 * Created by rboinepalli on 7/20/17.
 */



var apexClassMember = function(conn,Id,metadataContainerId,body){
    return conn.tooling.sobject('ApexClassMember').create({
        MetadataContainerId : metadataContainerId,
        ContentEntityId : Id,
        Body : body
    });
}



module.exports = apexClassMember;

