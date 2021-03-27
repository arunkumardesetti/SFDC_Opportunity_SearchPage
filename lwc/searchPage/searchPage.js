import { LightningElement, track } from 'lwc';
import { ShowToastEvent } from 'lightning/platformShowToastEvent';

import getOpps from '@salesforce/apex/SearchController.getOpps';
import sendOpportunities from '@salesforce/apex/SendDataApi.sendOpportunities'

export default class SearchPage extends LightningElement {
    
    // Get Records ////////////////////////////////////////////////////////////////////////////

    nameKey;
    accKey;
    amtKey;
    typeKey;
    stageKey;

    totalRecs = 0;
    OffsetSize = 0;
    LimitSize= 10;
    
    @track oppties;
    @track errorMsg = '';

    updateNameKey(event){
        this.nameKey = event.target.value;
        this.amtKey = parseInt(this.nameKey);
    }

    handleSearch(){
        if(!this.nameKey && !this.amtKey) {
            this.errorMsg = 'Please Enter a Keyword to search.';
            return;
        }
        getOpps({searchName: this.nameKey,
            searchAmount: this.amtKey,
            OffsetSize: this.OffsetSize,
            LimitSize: this.LimitSize
        })
        .then(result=>{
        this.oppties = result;

        if (result) {  
            var tempOppList = [];  
            for (var i = 0; i < result.length; i++) {  
                let tempRecord = Object.assign({}, result[i]); //Cloning Object
                tempRecord.oppLink = "/" + tempRecord.Id;  
                tempRecord.accLink = "/" + tempRecord.Account.Id;  
                tempRecord.accName = tempRecord.Account.Name;
                tempOppList.push(tempRecord);  
            }  
            this.oppties = tempOppList;
            this.totalRecs = this.oppties.length;
        }
       
        if (result && result.length === 0) {
            this.dispatchEvent(
                new ShowToastEvent({
                    title: 'Error',
                    message: 'No Records Found.',
                    variant: 'error'
                })
            );
        }
        })
        .catch(error => {
            window.console.log('error =====> '+JSON.stringify(error));
            this.errorMsg = error.body.message;
        })
    }

    cols = [
        { label: 'Name', fieldName: 'oppLink', type:'url', typeAttributes: { label: { fieldName: 'Name' },target:'_blank'}},
        { label: 'Account Name', fieldName: 'accLink', type:'url', typeAttributes: { label: { fieldName: 'accName' },target:'_blank'}},
        { label: 'Stage', fieldName: 'StageName' },
        { label: 'Type', fieldName: 'Type' },
        { label: 'Amount', fieldName: 'Amount', type:'currency' },
    ];

    // Send Record to 3rd Party App ///////////////////////////////////////////////////////////

    rowId;

    handleRowAction(event) {
        this.rowId = event.detail.selectedRows[0].Id;
    }
    handleSend(){
        sendOpportunities({oppId: this.rowId})
        .then(resStatus=>{
            if(resStatus=="Sync Success"){
                this.dispatchEvent(
                    new ShowToastEvent({
                        title: 'Success',
                        message: 'Record Successfully Sent.',
                        variant: 'success'
                    })
                );
            }
            if(resStatus=="Sync Failed"){
                this.dispatchEvent(
                    new ShowToastEvent({
                        title: 'Failed',
                        message: 'Http Response Error.',
                        variant: 'error'
                    })
                );
            }
            })
            .catch(error => {
                window.console.log('error =====> '+JSON.stringify(error));
                this.dispatchEvent(
                    new ShowToastEvent({
                        title: 'Failed',
                        message: 'Http Response Error.',
                        variant: 'error'
                    })
                );
            })
    }

    // Pagination /////////////////////////////////////////////////////////////////////////////

    previousHandeler()
    {
        this.OffsetSize = (this.OffsetSize-this.LimitSize);
        this.handleSearch();
    }

    nextHandeler()
    {
        this.OffsetSize = this.OffsetSize + this.LimitSize;
        this.handleSearch();
    }
    
    get prev()
    {
        if(this.OffsetSize == 0){
            return true;
        }
        else {
            return false;
        }
    }
    
    get nxt()
    {
        if((this.OffsetSize + this.LimitSize) > this.totalRecs){
            return true;
        }
        else {
            return false;
        }
    }
}