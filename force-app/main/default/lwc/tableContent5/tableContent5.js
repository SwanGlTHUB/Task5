import { LightningElement, api, track } from 'lwc';
import { NavigationMixin } from 'lightning/navigation';

const stageNames = {
    '--None--' : 0,
    'Prospecting' : 1,
    'Qualification' : 2,
    'Needs Analysis' : 3,
    'Value Proposition' : 4,
    'Id. Decision Makers' : 5,
    'Perception analysis' : 6,
    'Proposal/Price Quote' : 7,
    'Negotiation/Review' : 8,
    'Closed Won' : 9,
    'Closed Lost' : 10
}

export default class TableContent extends NavigationMixin(LightningElement) {
    @api opportunity
    @api selectedCellInfo
    @api highestSelectedRow
    @track opportunityEditMode = false
    @track accountNameEditMode = false
    @track stageEditMode = false
    @track dateEditMode = false
    @track opportunityNameToDisplay = undefined
    @track accountNameToDisplay = undefined
    @track stageNameToDisplay = undefined
    @track closeDateToDisplay = undefined
    @track rowIndexToDisplay = undefined
    @track initialised = false
    @track rowSelected = false
    @track showFooter = false
    @track multipleRowEdit = false
    @track applyMultipleRowEdit = false
    @track opportunityNameInInput = undefined
    @track stageNames = stageNames

    @api 
    get rowIndex(){
        return undefined
    }

    set rowIndex(rowIndexes){
        if(this.opportunity && Object.keys(rowIndexes).length != 0){
            this.rowIndexToDisplay = rowIndexes[this.opportunity.Id] + 1 
        }
    }

    @api 
    get refreshRow(){
        return undefined
    }

    set refreshRow(value){
        if(!this.opportunity){
            return
        }
        if(value == true){
            this.initDisplayVars()
        }
    }

    @api 
    get enableEditmode(){
        return undefined
    }

    set enableEditmode(editCell){
        if(!this.opportunity || Object.keys(editCell).length == 0){
            return
        }
        if(editCell.recordId != this.opportunity.Id){
            for(let columnIndex = 1; columnIndex <= 4; columnIndex++){
                this.deactivateEditMode(columnIndex)
            }
        }else{
            for(let columnIndex = 1; columnIndex <= 4; columnIndex++){
                if(columnIndex == editCell.columnIndex)continue
                this.deactivateEditMode(columnIndex)
            }
        }
    }

    @api
    get editedRows(){
        return this.editedRowsInfo
    }

    set editedRows(editedRowsInfo){
        if(!this.opportunity || Object.keys(editedRowsInfo).length === 0){
            return
        }
        const recordId = this.opportunity.Id
        if(!editedRowsInfo[recordId]){
            return
        }
        let newValues = editedRowsInfo[recordId]
        Object.keys(newValues).forEach((columnName) => {
            if(columnName == 'recordId' || columnName == 'accountId'){
                return
            }
            if(columnName == 'opportunityName'){
                this.opportunityNameToDisplay = newValues[columnName]
            }
            if(columnName == 'accountName'){
                this.accountNameToDisplay = newValues[columnName]
            }
            if(columnName == 'stageName'){
                this.stageNameToDisplay = newValues[columnName]
            }
            if(columnName == 'closeDate'){
                this.closeDateToDisplay = newValues[columnName]
            }
            this.changeCellColor(this.getCellByColumn(columnName), '#FFFACD')
        })
    }

    @api 
    get headerEditclicked(){
        return undefined
    }

    set headerEditclicked(value){
        if(!this.opportunity || !value){
            return
        }
        if(value == true){
            if(this.opportunity.Id == this.highestSelectedRow){
                if(this.selectedCellInfo.recordId == -1){
                    setTimeout(() => {
                        this.activateCellEditMode('opportunityName')
                    }, 30)
                }
                else{
                    this.activateCellEditMode(this.selectedCellInfo.column)
                }
                this.multipleRowEdit = true
                this.applyMultipleRowEdit = false
            }
        }
    }

    @api
    get selectedCell(){
        return this.selectedCellInfo
    }

    set selectedCell(value){
        this.selectedCellInfo = value
        if(this.selectedCellInfo && this.opportunity){
            this.deactivateOutlineAllCells()
            let cellElement = this.getCellByColumn(this.selectedCellInfo.column)
            if(this.selectedCellInfo.recordId == this.opportunity.Id){
                this.activateCellOutline(cellElement)
            }
        }
    }

    @api
    get selectedRows(){
        return undefined
    }
    set selectedRows(selectedRows){
        if(!this.opportunity)return
        const rowSelected = selectedRows.find((elem) => elem == this.opportunity.Id)
        if(rowSelected){
            this.rowSelected = true
        }else{
            this.rowSelected = false
        }
    }

    @api
    get footerState(){
        return this.showFooter
    }

    set footerState(value){
        this.showFooter = value
        if(value == false && this.opportunity){
            this.returnRowsInDefault()
        }
    }

    deactivateEditMode(columnIndex){
        if(columnIndex == 1){
            this.opportunityEditMode = false
        }
        if(columnIndex == 2){
            this.accountNameEditMode = false
        }
        if(columnIndex == 3){
            this.stageEditMode = false
        }
        if(columnIndex == 4){
            this.dateEditMode = false
        }
    }

    activateEditMode(columnIndex){
        if(columnIndex == 1){
            this.opportunityEditMode = true
        }
        if(columnIndex == 2){
            this.accountNameEditMode = true
        }
        if(columnIndex == 3){
            this.stageEditMode = true
        }
        if(columnIndex == 4){
            this.dateEditMode = true
        }
    }

    renderedCallback(){
        if(!this.initialised && this.opportunity){
            this.initDisplayVars()
            this.initialised = true
        }   
    }

    activateCellEditMode(columnName){
        if(columnName == 'opportunityName'){
            this.opportunityEditMode = true
            setTimeout(() => {   
                this.template.querySelectorAll('lightning-input')[1].focus()  
            }, 10);
        }
        if(columnName == 'accountName'){
            this.accountNameEditMode = true
        }
        if(columnName == 'stageName'){
            this.stageEditMode = true
        }
        if(columnName == 'closeDate'){
            this.dateEditMode = true
        }
    }

    returnRowsInDefault(){
        this.opportunityEditMode = false
        this.accountNameEditMode = false
        this.stageEditMode = false
        this.dateEditMode = false
        this.initDisplayVars()
        this.resetColorOfCells()
        this.deactivateOutlineAllCells()
    }

    resetColorOfCells(){
        const allCells = this.template.querySelectorAll('td')
        allCells.forEach((item) => {
            item.style.backgroundColor = ''
        })
    }

    deactivateOutlineAllCells(){
        const allCells = this.template.querySelectorAll('td')
        allCells.forEach((item) => {
            item.style.outline = ''
            item.style.outlineOffset = ''
        })
    }

    getCellByColumn(columnName){
        const allCells = this.template.querySelectorAll('td')
        let resultCell = undefined
        allCells.forEach((item) => {
            if(item.id == ''){
                return
            }
            const realId = item.id.split('-')[0]
            if(realId == columnName){
                resultCell = item
            }
        })
        return resultCell
    }

    initDisplayVars(){
        if(this.opportunity.hasOwnProperty('Account')){
            this.accountNameToDisplay = this.opportunity.Account.Name
        }
        else{
            this.accountNameToDisplay = ''
        }
        this.opportunityNameToDisplay = this.opportunity.Name
        this.stageNameToDisplay = this.opportunity.StageName
        this.closeDateToDisplay = this.opportunity.CloseDate
    }

    changeCellColor(cellElement, color){
        while(cellElement.tagName != 'TD'){
            cellElement = cellElement.parentNode
        }
        cellElement.style.backgroundColor = color
    }

    getFirstTDParent(element){
        while(element.tagName != 'TD'){
            element = element.parentNode
        }
        return element
    }
    handleRedirectToOpportunityPage(){
        this[NavigationMixin.Navigate]({
            type: 'standard__recordPage',
            attributes: {
                recordId: this.opportunity.Id,
                objectApiName: 'Opportunity',
                actionName: 'view'
            },
        });
    }    

    handleRedirectToAccountPage(){
        this[NavigationMixin.Navigate]({
            type: 'standard__recordPage',
            attributes: {
                recordId: this.opportunity.AccountId,
                objectApiName: 'Account',
                actionName: 'view'
            },
        });
    }

    onMouseOutHandler(event){
        const buttonId = 'btn' + event.target.id.split('-')[1].slice(-1) + '-' + event.target.id.split('-')[2]
        const btn = this.template.querySelector('#' + buttonId)
        btn.style.visibility = 'hidden'    
    }

    onMouseOverHandler(event){
        const buttonId = 'btn' + event.target.id.split('-')[1].slice(-1) + '-' + event.target.id.split('-')[2]
        const btn = this.template.querySelector('#' + buttonId)
        btn.style.visibility = 'visible'
    }    

    closeAllEditors(){
        this.opportunityEditMode = false
        this.nameEditMode = false
        this.stageEditMode = false
        this.dateEditMode = false
    }

    activateCellOutline(cellElement){
        cellElement.style.outline = '1px solid black'
        cellElement.style.outlineOffset = '-1px' 
    }

    deactivateCellOutline(cellElement){
        cellElement.style.outline = ''
        cellElement.style.outlineOffset = ''
    }


    handleRowAction(event){
        const actionType = event.detail.value
        const detail = {
            detail:{
                opportunity: this.opportunity,
                actionType
            }
        }
        this.dispatchEvent(new CustomEvent('rowaction', detail))
    }

    handleBtn1Click(event){
        this.multipleRowEdit = false
        this.applyMultipleRowEdit = false
        this.opportunityEditMode = !this.opportunityEditMode
        this.opportunityNameInInput = ''
        setTimeout(() => {
            if(this.opportunityEditMode){
                inputElement.focus()
            }    
        }, 10);
        this.dispatchCellEditModeEnable(1)
    }

    handleBtn2Click(event){
        this.multipleRowEdit = false
        this.applyMultipleRowEdit = false
        this.accountNameEditMode = !this.accountNameEditMode
        this.dispatchCellEditModeEnable(2)
    }

    handleBtn3Click(event){
        this.multipleRowEdit = false
        this.applyMultipleRowEdit = false
        this.stageEditMode = !this.stageEditMode
        setTimeout(() => {
            let selectDOM = this.template.querySelector('select') 
            selectDOM.childNodes[this.stageNames[this.stageNameToDisplay]].setAttribute('selected')
        }, 10)
        this.dispatchCellEditModeEnable(3)
    }

    handleBtn4Click(event){
        this.multipleRowEdit = false
        this.applyMultipleRowEdit = false
        this.dateEditMode = !this.dateEditMode
        setTimeout(() => {
            let inputDateDOM = this.template.querySelectorAll('lightning-input')[1]
            inputDateDOM.value = this.closeDateToDisplay
        }, 10)
        this.dispatchCellEditModeEnable(4)
    }

    dispatchCellEditModeEnable(columnIndex){
        const detail = {
            detail: {
                recordId: this.opportunity.Id,
                columnIndex
            }
        }
        this.dispatchEvent(new CustomEvent('editmodeenable', detail ))
    }

    dispatchMultipleRowEdit(detail){
        this.dispatchEvent(new CustomEvent('multiedit', detail))
    }

    handleOpportunityNameInInputChange(event){
        this.opportunityNameInInput = event.target.value
    }

    handleOpportunityNameChange(event){
        this.opportunityNameToDisplay = this.opportunityNameInInput
        const detail = {
            detail:{
                recordId: this.opportunity.Id,
                opportunityName: this.opportunityNameToDisplay
            }
        }
        if(this.multipleRowEdit){
            if(this.applyMultipleRowEdit){
                this.opportunityNameInInput = ''
                this.opportunityEditMode = false
                this.dispatchMultipleRowEdit(detail)
                return
            }
        }
        this.dispatchEvent(new CustomEvent('edit', detail))
        this.changeCellColor(event.target, '#FFFACD')
        this.opportunityNameInInput = ''
        this.opportunityEditMode = false
    }

    handleAccountNameChange(event){
        this.accountNameToDisplay = event.detail.selectedValue
        const detail = {
            detail:{
                recordId: this.opportunity.Id,
                accountId: event.detail.selectedRecordId,
                accountName: event.detail.selectedValue
            }
        }
        if(this.multipleRowEdit){
            if(this.applyMultipleRowEdit){
                this.dispatchMultipleRowEdit(detail)
                return
            }
        }
        this.dispatchEvent(new CustomEvent('edit', detail))
        this.changeCellColor(event.target, '#FFFACD')
        this.accountNameEditMode = false
    }

    handleStageNameChange(event){
        this.stageNameToDisplay = event.target.value
        const detail = {
            detail:{
                recordId: this.opportunity.Id,
                stageName: event.target.value
            }
        }
        if(this.multipleRowEdit){
            if(this.applyMultipleRowEdit){
                this.dispatchMultipleRowEdit(detail)
                return
            }
        }
        
        this.dispatchEvent(new CustomEvent('edit', detail))
        this.changeCellColor(event.target, '#FFFACD')
        this.stageEditMode = false
    }

    handleClosedDateChange(event){
        if(event.target.value == null){
            this.dateEditMode = false
            return    
        }
        this.closeDateToDisplay = event.target.value
        const detail = {
            detail:{
                recordId: this.opportunity.Id,
                closeDate: event.target.value
            }
        }
        if(this.multipleRowEdit){
            if(this.applyMultipleRowEdit){
                this.dispatchMultipleRowEdit(detail)
                return
            }
        }
        this.dispatchEvent(new CustomEvent('edit', detail))
        this.changeCellColor(event.target, '#FFFACD')
        this.dateEditMode = false
    }

    handleRowSelect(event){
        this.dispatchEvent(new CustomEvent('checkboxswitch', {detail:{recordId: this.opportunity.Id}}))
    }

    handleSelectCell(event){
        const cellElement = this.getFirstTDParent(event.target)
        const recordId = this.opportunity.Id
        const column = cellElement.id.split('-')[0]
        const detail = {
            detail:{
                recordId: recordId,
                column: column
            }
        }
        this.dispatchEvent(new CustomEvent('selectcell', detail))      
    }

    handleInputCheckbox(){
        this.applyMultipleRowEdit = !this.applyMultipleRowEdit
    }
}