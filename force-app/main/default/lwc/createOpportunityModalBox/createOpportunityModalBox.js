import { LightningElement } from 'lwc';

export default class CreateOpportunityModalBox extends LightningElement {
    
    closeModal(){
        this.dispatchEvent(new CustomEvent('close'))
    }

    formSubmitHandler(){
        this.dispatchEvent(new CustomEvent('save'))
    }
}