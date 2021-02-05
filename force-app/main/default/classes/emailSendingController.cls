public with sharing class emailSendingController {
    
    @AuraEnabled
    public static void sendEmailToNewOwner(String newOwnerEmail, String opportunityName, String opportunityUrl){
        Messaging.SingleEmailMessage email = new Messaging.SingleEmailMessage();
        List<String> emailsToSent = new List<String>();
        emailsToSent.add(newOwnerEmail);

        email.setToAddresses(emailsToSent);
        email.setSubject('Test Mail');
        email.setHtmlBody(
            'Opportunity ' + opportunityName + ' has been assigned to you. Please click on the link below to view the record.<p>'
            +'<a href="' + opportunityUrl +'">' + opportunityUrl + ' </a>' 
        );
        try{
            Messaging.sendEmail(new Messaging.SingleEmailMessage[] { email });
        }catch(exception e){
            apexpages.addmessage(new apexpages.message(apexpages.severity.error,e.getMessage()));
        }
    }
}
