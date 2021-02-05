public with sharing class opportunityController {
    
    @AuraEnabled(cacheable=true)
    public static List<Opportunity> getAllOpportunities() {
        List<Opportunity> allOpportunities;
        allOpportunities = [
            SELECT Name, Account.Name, CloseDate, StageName, OwnerId
            FROM Opportunity
            LIMIT 100 
        ];
        
        return allOpportunities;
    }
}
