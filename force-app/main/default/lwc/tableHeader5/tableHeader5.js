import { LightningElement } from 'lwc';

export default class TableHeader5 extends LightningElement {
    newButtonHandler(){
        this.dispatchEvent(new CustomEvent('opencreationmodal'))
    }

    handleEditButtonClick(){
        this.dispatchEvent(new CustomEvent('clickedit'))
    }
}