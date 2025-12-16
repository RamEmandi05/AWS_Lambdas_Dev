const { MongoClient } = require('mongodb');
const tableName = process.env.GlossaryCollection;  
let ObjectID = require('mongodb').ObjectId; 
 
exports.handler = async(event, context) => {
    let body = { response : "Success" }; 
    let searchString = event['searchString']; 
    try{
        const uri = process.env.doc_db;
        const mclient = new MongoClient(uri, {
            useNewUrlParser: true,
            ssl: true,
            tlsCAFile: 'rds-combined-ca-bundle.pem',  
            retryWrites: false
        });
        await mclient.connect();
        var db = mclient.db('listentrust');
        let glossaryTable = db.collection(tableName);  
        let query = { field : {$regex:searchString,$options : 'i'},isEnabled:event.isEnabled} ;
        if(searchString === null ){
           query = {isEnabled:event.isEnabled}; 
        }
        let glossaryList = await glossaryTable.find(query).project({field:1,fieldInfo:1,fieldDisplayDesc:1,isEnabled:1}).sort({"field":1}).toArray();
        console.log(glossaryList.length); 
        if(glossaryList && glossaryList.length>0){
            body['glossaryList'] = glossaryList;
            body['message'] = 'Successfully retrived the data.'
        }else{
            body['message'] = 'No data available.';
            body['glossaryList'] = [];
        }
         body['cicd_status'] = 'Working Fine after edit';
        await mclient.close();   
       
        
    }   
    catch(err){
        // console.log('err');
        console.log(err)
        body = err.message;
    } finally{
      body = body;
    }
    return body;
};