
/*todo: query for existing container name and delete if it returns results   */
var metadataContainer = {
    create : function(conn,containerName){
        return conn.tooling.sobject('MetadataContainer').create({
                "Name" : containerName
        });

    }
};

module.exports = metadataContainer;


