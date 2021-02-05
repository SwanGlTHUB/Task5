import { LightningElement, api } from 'lwc';

export default class EditOpportunityModalBox extends LightningElement {
    @api recordId

    closeModal(){
        this.dispatchEvent(new CustomEvent('close'))
    }

    successModal(){
        this.dispatchEvent(new CustomEvent('success'))
    }
}