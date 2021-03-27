public with sharing class SendDataApi {
    
    @AuraEnabled  
    public static String sendOpportunities(Id oppId){
        Opportunity opp = [select Id,Name,Account.Name,StageName,Type,Amount from Opportunity Where Id=:oppId];
        String Body;
        Http http = new Http();
        HttpRequest req = new HttpRequest();
        req.setEndpoint('callout:GoogleSheetApi/v4/spreadsheets/1RJpSm8I6GtJ9q4lzjKSIY7goS-1A0aTNaPH7ONUHNqs/values/Sheet1:append?valueInputOption=RAW');
        req.setHeader('Accept', 'application/json');
        req.setHeader('Content-Type', 'application/json');
		req.setMethod('POST');        
        String jsonString='{'+
            '"majorDimension": "ROWS",'+'"values":['+
            '["'+opp.Name+'","'+opp.Account.Name+'","'+opp.StageName+'","'+opp.Type+'","'+opp.Amount+'"]'+
            '],'+
            '"range":"Sheet1"'+
            '}';
        System.debug('JSON Request Body'+jsonString);
        req.setBody(jsonString);
        HttpResponse res = http.send(req);
        System.debug('JSON Response Body'+res.getBody());
        if(res.getStatusCode()==200){
            System.debug('Success');
            Body='Sync Success';
        }else{
            System.debug('Sync Failed '+res.getBody());
            Body='Sync Failed';
        }
        if(Body=='Sync Success'){
            opp.Integration_Status__c = 'Success';
            opp.Integration_Comments__c = 'Successfully Sent Over to Google Sheets';
            update opp;
        }else if(Body=='Sync Failed'){
            opp.Integration_Status__c = 'Error';
            opp.Integration_Comments__c = 'Failed to Sent Over to Google Sheets';
            update opp;
        }
        return Body;
   }
}