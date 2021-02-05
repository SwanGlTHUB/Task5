public with sharing class userController {
    
    @AuraEnabled
    public static String getUserEmailById(String userId) {
        User resultUser;
        try{
            resultUser = [
                SELECT Email
                FROM User
                WHERE Id = :userId
            ];
        }
        catch(DmlException e){
            System.debug('User does not exist');
        }
        return resultUser.Email;
    }
}
