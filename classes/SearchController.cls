public with sharing class SearchController {

    @AuraEnabled(Cacheable = true)
    public static list<Opportunity> getOpps(
                                            string searchName,
                                            Integer searchAmount,
                                            Integer OffsetSize,
                                            Integer LimitSize
                                            ) {
        searchName = '%'+searchName+'%';
        list<Opportunity> lstOpp = [SELECT  Id, Name, Account.Name, StageName, Type, Amount From Opportunity 
        WHERE Name LIKE :searchName OR Account.Name LIKE :searchName OR Amount = :searchAmount OR StageName LIKE :searchName OR 
        (Type LIKE :searchName AND Type != NULL)
        LIMIT :LimitSize OFFSET :OffsetSize
        ];
        return lstOpp; 
    }
}