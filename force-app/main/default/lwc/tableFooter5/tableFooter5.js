import { LightningElement } from 'lwc';

export default class TableFooter4 extends LightningElement {
    closeHandler(){
        this.dispatchEvent(new CustomEvent('close'))
    }

    saveHandler(){
        this.dispatchEvent(new CustomEvent('save'))
    }
}