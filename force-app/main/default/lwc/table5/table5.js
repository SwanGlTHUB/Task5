import { LightningElement, wire, track } from 'lwc'
import { NavigationMixin } from 'lightning/navigation';
import { refreshApex } from '@salesforce/apex';
import { deleteRecord } from 'lightning/uiRecordApi';
import { updateRecord } from 'lightning/uiRecordApi';
import { ShowToastEvent } from 'lightning/platformShowToastEvent';
import getAllOpportunities from '@salesforce/apex/opportunityController.getAllOpportunities'
import ACCOUNTID_FIELD from '@salesforce/schema/Opportunity.AccountId';
import STAGENAME_FIELD from '@salesforce/schema/Opportunity.StageName';
import CLOSEDATE_FIELD from '@salesforce/schema/Opportunity.CloseDate';
import NAME_FIELD from '@salesforce/schema/Opportunity.Name';
import ID_FIELD from '@salesforce/schema/Opportunity.Id'

export default class Table5 extends NavigationMixin(LightningElement) {
    @track data = []
    @track openCreationModal = false
    @track openEditModal = false
    @track openChangeOwnerModal = false
    @track rowActionSelectedOpportunity
    @track opportunitiesResponse    
    @track selectedCell = undefined
    @track opportunities
    @track selectedRows = []
    @track showFooter = false
    @track editedRows = {}
    @track selectedCell = undefined
    @track headerEditButtonClicked = false
    @track highestSelectedRow = undefined
    @track rowIndexByRecordId = {}
    @track cellThatEnableEdit = {}
    @track refreshRow = false
    @track hasRendered = false
    @track windowTimeoutId

    @wire(getAllOpportunities) getOpportunities(response){
        this.opportunitiesResponse = response
        if(response.error){
            // Do something
            return
        }
        if(response.data){
            this.updateRowIndexByRecordId(response.data)
            this.opportunities = response.data
            
        }
    }

    renderedCallback(){
        if(!this.opportunities){
            return
        }
        if(!this.hasRendered){
                window.addEventListener('click', () => {
                this.resetSelectedCell()
                this.windowTimeoutId = setTimeout(() => {
                    let selectedCellIndex = this.columnNameToColumnIndex(this.selectedCell.column)
                    if((this.selectedCell.recordId != this.cellThatEnableEdit.recordId)
                    || (selectedCellIndex != this.cellThatEnableEdit.columnIndex)){
                        console.log('kek')
                        this.disableAllCellsEditMode()
                        this.windowTimeoutId = undefined
                    }
                }, 20)
            })
            this.hasRendered = true
        }
    }

    updateRowIndexByRecordId(opportunities){
        let rowIndex = 0
        this.newRowIndexByRecordId = {}
        opportunities.forEach((item) => {
            this.newRowIndexByRecordId[item.Id] = rowIndex
            rowIndex += 1
        })

        this.rowIndexByRecordId = {...this.newRowIndexByRecordId}
    }

    updateHighestSelectedRow(){
        if(this.selectedRows.length == 0){
            this.highestSelectedRow = undefined
        }
        let [resultRecordId, resultRowIndex] = [-1, 1000000]
        this.selectedRows.forEach((item) => {
            let itemRowIndex = this.rowIndexByRecordId[item]
                if( itemRowIndex < resultRowIndex){
                resultRowIndex = itemRowIndex
                resultRecordId = item
            }
        })
        this.highestSelectedRow = resultRecordId
    }

    disableAllCellsEditMode(){
        this.cellThatEnableEdit = {
            recordId: -1,
            columnIndex: -1              
        }
    }   

    resetSelectedCell(){
        this.selectedCell = {
            recordId : -1,
            column: -1
        }
    }

    switchCreationModalState(){
        this.openCreationModal = !this.openCreationModal
    }

    switchEditModalState(){
        this.openEditModal = !this.openEditModal
    }

    onOpenCreationModal(event){
        this.switchCreationModalState()
    }


    refreshDatatable(){
        return refreshApex(this.opportunitiesResponse)
    }

    saveNewOpportunityHandler(){
        this.refreshDatatable()
        .then(() => {
            this.openCreationModal = false
            this.dispatchEvent(
                new ShowToastEvent({
                    title: 'Success',
                    message: 'New opportunity was created',
                    variant: 'success'
                })
            )
        })
    }

    columnNameToColumnIndex(columnName){
        if(columnName == 'opportunityName'){
            return 1
        }
        if(columnName == 'accountName'){
            return 2
        }
        if(columnName == 'stageName'){
            return 3
        }
        if(columnName == 'closeDate'){
            return 4
        }
    }

    routineBeforeDelete(recordId){
        this.selectedRows = this.selectedRows.filter((item) => item != recordId)
        if(this.selectedCell){
            if(this.selectedCell.recordId == recordId){
                this.resetSelectedCell()        
            }
        }
        if(this.highestSelectedRow){
            if(this.highestSelectedRow == recordId){
                this.highestSelectedRow = undefined
            }
        }
        if(this.editedRows.hasOwnProperty(recordId)){
            delete this.editedRows[recordId]
        }
    }

    deleteRecordWrapper(event){
        let recordId = event.detail
        this.routineBeforeDelete(recordId)
        deleteRecord(recordId)
            .then(() => {
                this.dispatchEvent(
                    new ShowToastEvent({
                        title: 'Success',
                        message: 'Record deleted',
                        variant: 'success'
                    })
                );
                this.refreshDatatable()
            })
            .catch(error => {
                this.dispatchEvent(
                    new ShowToastEvent({
                        title: 'Error deleting record',
                        message: error.body.message,
                        variant: 'error'
                    })
                );
            });
    }

    updateRecordsWrapper(){
        let allPromises = []
        let allEditedRowsId = Object.keys(this.editedRows)
        allEditedRowsId.forEach((recordId) => {
            let row = this.editedRows[recordId]
            let fields = {}
            fields[ID_FIELD.fieldApiName] = recordId
            let allFields = Object.keys(row)
            allFields.forEach((field) => {
                if(field == 'recordId' || field == 'accountName'){
                    return
                }
                if(field == 'opportunityName'){
                    fields[NAME_FIELD.fieldApiName] = row[field]
                }
                if(field == 'accountId'){
                    fields[ACCOUNTID_FIELD.fieldApiName] = row[field]
                }
                if(field == 'stageName'){
                    fields[STAGENAME_FIELD.fieldApiName] = row[field]
                }
                if(field == 'closeDate'){
                    fields[CLOSEDATE_FIELD.fieldApiName] = row[field]
                }
            })
            allPromises.push(updateRecord({fields}))
        })
        Promise.all(allPromises)
        .then(() => {
            this.dispatchEvent(
                new ShowToastEvent({
                    title: 'Success',
                    message: 'Records updated',
                    variant: 'success'
                })
            )
            this.refreshDatatable()
            .then(() => {
                this.handleFooterClose()
            })
        })
        .catch(error => {
            this.dispatchEvent(
                new ShowToastEvent({
                    title: 'Error updating records',
                    message: error.body.message,
                    variant: 'error'
                })
            );
            this.handleFooterClose()
        });
    }
    

    handleRowActions(event){
        let actionName = event.detail.actionType
        this.rowActionSelectedOpportunity = event.detail.opportunity
        if(actionName == 'delete'){
            this.deleteRecordWrapper({detail: event.detail.opportunity.Id})
        }
        if(actionName == 'edit'){
            this.openEditModal = true
        }
        if(actionName == 'changeOwner'){
            this.openChangeOwnerModal = true
        }
    }

    handleHeaderEditClick(event){
        if(!this.highestSelectedRow || !this.selectedCell){
            return 
        }
        this.cellThatEnableEdit = {
            recordId : this.highestSelectedRow,
            columnIndex: this.columnNameToColumnIndex(this.selectedCell.column) 
        }
        this.headerEditButtonClicked = true
        setTimeout(() => {
            console.log('mda')
            clearTimeout(this.windowTimeoutId)
            this.headerEditButtonClicked = false
        }, 10);
    }

    handleSelectCell(event){
        const recordId = event.detail.recordId
        const column = event.detail.column
        setTimeout(() => {
            this.selectedCell = {recordId, column}
        }, 10);
    }

    handleCheckboxSwitch(event){
        const recordId = event.detail.recordId
        const indexInList = this.selectedRows.find((id) => id == recordId)
        if(!indexInList){
            this.selectedRows = [...this.selectedRows, recordId]
        }else{
            this.selectedRows = this.selectedRows.filter((elem) => elem != recordId)
        }
        this.updateHighestSelectedRow()
    }

    handleHeaderCheckboxSwitch(event){
        let checkboxChecked = event.target.checked
        if(checkboxChecked){
            this.selectedRows = this.opportunities.map((item) => item.Id)
        }else{
            this.selectedRows = []
        }
        this.updateHighestSelectedRow()
    }

    handleEditRow(event){
        const recordId = event.detail.recordId
        this.editedRows[recordId] = {...this.editedRows[recordId], ...event.detail}
        this.showFooter = true
    }

    handleFooterClose(event){
        this.showFooter = !this.showFooter
        this.editedRows = {}
    }

    handleFooterSave(event){
        this.updateRecordsWrapper()
    }

    handleMultiEdit(event){ 
        this.selectedRows.forEach((recordId) => {
            this.editedRows[recordId] = {...this.editedRows[recordId], ...event.detail}
        })
        this.editedRows = {...this.editedRows}
        this.showFooter = true
    }

    handleEditModeEnable(event){
        this.cellThatEnableEdit = event.detail
    }

    handleChangeOwnerModalClose(){
        this.openChangeOwnerModal = false
    }

    handleSuccessEdit(){
        this.refreshDatatable()
        .then(() => {
            this.refreshRow = true
            setTimeout(() => {
                this.refreshRow = false
            }, 10)
            this.openEditModal = false
            this.dispatchEvent(
                new ShowToastEvent({
                    title: 'Success',
                    message: 'Record was updated',
                    variant: 'success'
                })
            )
        })
    }
} 