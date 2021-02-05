import { LightningElement, api, track } from 'lwc';
import { updateRecord } from 'lightning/uiRecordApi';
import { ShowToastEvent } from 'lightning/platformShowToastEvent';
import { NavigationMixin } from 'lightning/navigation';
import getUserEmailById from '@salesforce/apex/userController.getUserEmailById';
import sendEmailToNewOwner from '@salesforce/apex/emailSendingController.sendEmailToNewOwner';
import ID_FIELD from '@salesforce/schema/Opportunity.Id';
import OWNERID_FIELD from '@salesforce/schema/Opportunity.OwnerId';


export default class ChangeOwnerModalBox extends NavigationMixin(LightningElement) {
    @api opportunity
    @track selectedUserId
    @track sentNotificationEmail = false
    @track errorMessage = false
    @track timeoutIndex = false

    randeredCallback(){
        this.sentNotificationEmail = false
    }

    closeModal(){
        this.dispatchEvent(new CustomEvent('close'))
    }

    submitModal(){
        this.dispatchEvent(new CustomEvent('submit'))
    }

    showErrorMessage(message){
        if(this.timeoutIndex){
            clearTimeout(this.timeoutIndex)
        }
        this.errorMessage = message
        this.timeoutIndex = setTimeout(() => {
           this.errorMessage = false
           this.timeoutIndex = false 
        }, 5000);
    }

    changeOwner(){
        if(this.opportunity.OwnerId == this.selectedUserId){
            this.showErrorMessage('This user is already own this opportunity')
            return
        }
        const fields = {}
        fields[ID_FIELD.fieldApiName] = this.opportunity.Id
        fields[OWNERID_FIELD.fieldApiName] = this.selectedUserId
        getUserEmailById({
            userId: this.selectedUserId
        })
        .then((email) => {
            updateRecord({fields})
            .then(() => {
                this.dispatchEvent(
                    new ShowToastEvent({
                        title: 'Success',
                        message: 'Owner changed',
                        variant: 'success'
                    })
                );
                if(this.sentNotificationEmail){
                    this[NavigationMixin.GenerateUrl]({
                        type: 'standard__recordPage',
                        attributes: {
                            recordId: this.opportunity.Id,
                            objectApiName: 'Opportunity',
                            actionName: 'view'
                        },
                    }).then(url => {
                        sendEmailToNewOwner({
                            newOwnerEmail: email,
                            opportunityName: this.opportunity.Name,
                            opportunityUrl: window.location.origin + url
                        })
                        .then(() => {
                            this.closeModal()
                        })
                    });
                }
                
            })
            .catch((error) => {
                this.dispatchEvent(
                    new ShowToastEvent({
                        title: 'Error deleting record',
                        message: error.body.message,
                        variant: 'error'
                    })
                );
                this.closeModal()
            })
        })
        .catch((error) => {
            this.dispatchEvent(
                new ShowToastEvent({
                    title: 'User does not exist',
                    message: error.body.message,
                    variant: 'error'
                })
            );
        })
    }

    handleSwitchStatisEmailCheckbox(){
        this.sentNotificationEmail = !this.sentNotificationEmail
    }

    handleUserChange(event){
        this.selectedUserId = event.detail.selectedRecordId
    }
}