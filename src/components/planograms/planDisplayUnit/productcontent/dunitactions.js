import React from 'react';
import { Col, Row, Button, Modal } from 'react-bootstrap';
import { XIcon } from '@primer/octicons-react';
import { confirmAlert } from 'react-confirm-alert';

import { alertService } from '../../../../_services/alert.service';
import { submitCollection } from '../../../../_services/submit.service';
import { submitSets } from '../../../UiComponents/SubmitSets';
import { checkProductIsInBottom, sortShelvesDesc } from '../additionalcontents';
import { AcViewModal } from '../../../UiComponents/AcImports';

//import image files
import loadinggif from '../../../../assets/img/loading-sm.gif';
import savemodalimg from '../../../../assets/img/submit_modal_img.jpg';


export default class PgDunitActions extends React.Component {
    constructor(props){
        super(props);

        this.state = {
            savemodalview: false, savemodalmsg: "", //save waiting modal
        }
    }

    //confirm to continue save in active planograms
    confirmSaveContinue = (_callback) => {
        if(this.props.fieldStatus === "ACTIVE"){
            confirmAlert({
                title: this.props.t('CONTINUE_CREATE_DRAFT'),
                message: this.props.t('CONTINUE_CREATE_DRAFT_MSG'),
                overlayClassName: (this.props.isRTL==="rtl"?"alertrtl-content":""),
                buttons: [{
                    label: this.props.t('btnnames.yes'),
                    onClick: () => {
                        _callback(true);
                    }
                }, {
                    label: this.props.t('btnnames.no'),
                    onClick: () => {
                        _callback(false);
                    }
                }]
            });
        } else{
            _callback(true);
        }
    }

    //#PLG-DU-SU-H01 save/update dunit details
    handleDunitObjSave = () => {
        this.confirmSaveContinue((iscontinue) => {
            if(iscontinue){
                if(this.props.fieldStatus === "DRAFT" && !this.props.ischangesavailable){
                    alertService.error(this.props.t("NO_CHANGES_AVAILABLE"));
                    return false;
                }
        
                //check field details edit view opened. if true not letting to continue
                if(this.props.isshowedit){
                    alertService.error(this.props.t('PROPERLY_EDIT_AND_CLOSE_FIELD_DETAILS_EDIT_VIEW_TO_CONTINUE'));
                    return false;
                }
                //get current save field object
                let csaveobj = structuredClone(this.props.saveObj);
                let bkpsaveobj = structuredClone(this.props.bkpSaveObj);
                let actobj = (this.props.activeViewObj&&Object.keys(this.props.activeViewObj).length>0?JSON.parse(JSON.stringify(this.props.activeViewObj)):null);
                let isNewSave = false;
        
                //using new object in save to avoid save load
                let newSaveObj = {
                    floorlayoutId: csaveobj.floorLayoutId,
                    fieldsList: [],
                    clipboardData: []
                }
                
                let displayRatio = this.props.displayRatio;
                
                //clipboard data 
                let clipboardlist = this.props.clipBoardList;
                for (let i = 0; i < clipboardlist.clipboardData.length; i++) {
                    const parentdata = clipboardlist.clipboardData[i];
                    
                    for (let j = 0; j < parentdata.clipboardData.length; j++) {
                        const deptdata = parentdata.clipboardData[j];
                        
                        for (let l = 0; l < deptdata.shelf.length; l++) {
                            const shelfdata = deptdata.shelf[l];
        
                            for (let k = 0; k < shelfdata.products.length; k++) {
                                const proddata = shelfdata.products[k];
                                
                                proddata.startingXPoint = (proddata.startingXPoint / displayRatio);
                                proddata.startingYPoint = (proddata.startingYPoint / displayRatio);
                            }
                        }
                    }
                }
        
                // clipboardlist.floorLayoutId = newSaveObj.floorLayoutId;
        
                newSaveObj.clipboardData = clipboardlist.clipboardData;
        
                //new changes list
                let newChangesList = this.props.rpchangedprodlist;
                let checkSaveObj = structuredClone(csaveobj);
                //set change object field details
                for (let i = 0; i < newChangesList.length; i++) {
                    const changeobj = newChangesList[i];
                    changeobj.fieldId = checkSaveObj.fieldsList[changeobj.field].id;
                    changeobj.shelfId = checkSaveObj.fieldsList[changeobj.field].planogramShelfDto[changeobj.shelve].id;
                }
        
                let deptIds = [];
                for (let m = 0; m < csaveobj.fieldsList.length; m++) {
                    let isFieldChangesAvailable = false;

                    const csobj = csaveobj.fieldsList[m];
                    const bkpfieldobj = bkpsaveobj.fieldsList[m];

                    //check if safty margin changed
                    if(bkpfieldobj && bkpfieldobj.fieldSafetyMargin !== csobj.fieldSafetyMargin){
                        isFieldChangesAvailable = true;
                    }

                    deptIds.push(csobj.department.departmentId);
        
                    let reducewidth = csobj.startX;
                    let reduceheight = csobj.startY;
                    
                    //sort active field shelves
                    if(actobj && actobj.fieldsList[m]){
                        actobj.fieldsList[m].planogramShelfDto.sort(sortShelvesDesc);
                    }
                    
                    csobj["masterFieldWidth"] = parseFloat(csobj.masterFieldWidth);
                    csobj["masterFieldHeight"] = parseFloat(csobj.masterFieldHeight);
                    //sort draft field shelves
                    csobj.planogramShelfDto.sort(sortShelvesDesc);
                    
                    var isprodoverlapping = false; //check products overlapping
                    //convert back converted x,y changes
                    for (var i = 0; i < csobj.planogramShelfDto.length; i++) {
                        const shelveobj = csobj.planogramShelfDto[i];
                        //find changes available
                        let chelvechanges = (shelveobj.planogramShelfChanges?shelveobj.planogramShelfChanges:[]);
                        
                        let addedshelvechanges = newChangesList.filter((xitem) => xitem.fieldId === csobj.id && xitem.shelfId === shelveobj.id).map((xobj) => { return xobj.changeobj; });
                        if(addedshelvechanges.length > 0){
                            isFieldChangesAvailable = true; 
                        }
                        // console.log(addedshelvechanges);
                        let cshelvechanges = [];
                        
                        let availableProdList = [];
                        for (var j = 0; j < shelveobj.planogramProduct.length; j++) {
                            const prodobj = shelveobj.planogramProduct[j];
        
                            var frontfacingqty = 0; //total facing qty of product
                            var totalprodqty = 0; //total qty of product
                            var isproddelete = true; //check is product inside blocks/products deleted
        
                            let availableBlockList = [];
        
                            for (var l = 0; l < prodobj.productBlock.length; l++) {
                                const blockobj = prodobj.productBlock[l];
                                blockobj.x = ((blockobj.x - reducewidth) / this.props.displayRatio);
                                blockobj.y = ((blockobj.y - reduceheight) / this.props.displayRatio);
        
                                let isblockdelete = true; //check block inside locations deleted
                                let availableLocList = [];
                                for (var k = 0; k < blockobj.productLocations.length; k++) {
                                    const plocobj = blockobj.productLocations[k];
                                    const oriprody = plocobj.y; //need drawed y to check isinbottom
                                    plocobj.x = ((plocobj.x - reducewidth) / this.props.displayRatio);
                                    plocobj.y = ((plocobj.y - reduceheight) / this.props.displayRatio);
        
                                    //overlap obj
                                    if(plocobj.overLappingDto && Object.keys(plocobj.overLappingDto).length > 0){
                                        plocobj.overLappingDto.x = ((plocobj.overLappingDto.x - reducewidth) / this.props.displayRatio);
                                        plocobj.overLappingDto.y = (plocobj.overLappingDto.y / this.props.displayRatio);
        
                                        if(!plocobj.overLappingDto.isDelete){
                                            isprodoverlapping = true;
                                        }
                                    }
        
                                    if(!plocobj.isDelete){
                                        isproddelete = false; 
                                        isblockdelete = false;
        
                                        //check is bottom location and add width to front faceing totals
                                        var allowbottom = checkProductIsInBottom(shelveobj.y,shelveobj.drawHeight,oriprody,plocobj.drawHeight);
                                        if(allowbottom){ frontfacingqty = frontfacingqty + 1; }
                                        //frontfacingwidth = frontfacingwidth + prodobj.productWidth;
                                        totalprodqty = totalprodqty + 1;
        
                                        availableLocList.push(plocobj);
                                    } else{
                                        if(!plocobj.isNew){
                                            availableLocList.push(plocobj);
                                        }
                                    }
                                }
        
                                blockobj.productLocations = availableLocList;
                                
                                if(isblockdelete){ 
                                    if(!blockobj.isNew){
                                        blockobj.isDelete = true;
                                        availableBlockList.push(blockobj); 
                                    }
                                } else{
                                    availableBlockList.push(blockobj);
                                }
        
                                if(!blockobj.isDelete){ 
                                    isproddelete = false; 
                                }
                            }
        
                            prodobj.productBlock = availableBlockList;
        
                            prodobj["productFacingQty"] = frontfacingqty;
                            prodobj["productTotalQty"] = totalprodqty;
                            
                            if(isproddelete){ 
                                if(!prodobj.isNew){
                                    prodobj["isDelete"] = true; 
                                    prodobj["isNew"] = false; 
        
                                    availableProdList.push(prodobj);
                                }
                            } else{
                                availableProdList.push(prodobj);
                            }
                            
                            //check add/remov product qty for new shelve change
                            var cfieldactivemode = (csobj.floorLayoutStatus === "ACTIVE" || (csobj.baseFloorLayoutId && csobj.baseFloorLayoutId > 0)?true:false);
                            
                            if(cfieldactivemode){
                                //find active object tempqty 
                                let actviewobj = (actobj && actobj.fieldsList[m] &&actobj.fieldsList[m].planogramShelfDto[i]?actobj.fieldsList[m].planogramShelfDto[i].planogramProduct.find(oitem => oitem.productInfo.id === prodobj.productInfo.id):undefined);
                                
                                if(actviewobj && Object.keys(actviewobj).length > 0){ //if found existing product
                                    const actobjqty = (actviewobj?actviewobj.tempoldqty:0);
                                    // console.log(actviewobj);
        
                                    if(actobjqty > 0){
                                        var actchangeqty = 0;
                                        var actchangetype = "";
                                        var actnochange = false;
                                        //check actobjqty more than or less than totalprodqty
                                        if(totalprodqty < actobjqty){
                                            actchangeqty = actobjqty - totalprodqty;
                                            actchangetype = "QTY_REMOVE";
                                        } else if(totalprodqty > actobjqty){
                                            actchangeqty = totalprodqty - actobjqty;
                                            actchangetype = "QTY_ADD";
                                        } else if(totalprodqty === actobjqty){
                                            //check changes available for this product
                                            let ischangesavlble = addedshelvechanges.filter((yitem) => yitem.planogramShelfHasProductId === prodobj.id);
        
                                            if(ischangesavlble && ischangesavlble.length > 0){
                                                actnochange = true;
                                            }
                                        }
                                        
                                        //if new changeqty available add that change with
                                        if(actchangeqty > 0 || actnochange){
                                            var cchangeobj = {id:-1, floorShelfChangeType: actchangetype, planogramShelfId: shelveobj.id, planogramShelfHasProductId: prodobj.id, planogramShelfHasProductF_UUID: prodobj.f_uuid, changeQty: actchangeqty, noChange:actnochange, isNew: true, isDelete: false};
                                            cshelvechanges.push(cchangeobj);
                                        }
                                    }
                                } else{
                                    var actchangeqty2 = 0;
                                    var actchangetype2 = "";
                                    var actnochange2 = false;
                                    
                                    if(totalprodqty > 0){
                                        actchangeqty2 = totalprodqty;
                                        actchangetype2 = "QTY_ADD";
                                    } else{
                                        actnochange2 = true;
                                    }
                                    var cchangeobj2 = {id:-1, floorShelfChangeType: actchangetype2, planogramShelfId: shelveobj.id, planogramShelfHasProductId: prodobj.id, planogramShelfHasProductF_UUID: prodobj.f_uuid, changeQty: actchangeqty2, noChange: actnochange2, isNew: true, isDelete: false};
                                    cshelvechanges.push(cchangeobj2);
                                }
                                
                            } else{
                                let ischangesavlble = addedshelvechanges.filter((yitem) => yitem.planogramShelfHasProductId === prodobj.id);
                                
                                if(ischangesavlble && ischangesavlble.length > 0){
                                    cshelvechanges = cshelvechanges.concat(ischangesavlble);
                                }
                            }
                        }
        
                        shelveobj.planogramProduct = availableProdList;
        
                        shelveobj.planogramShelfChanges = chelvechanges.concat(cshelvechanges !== undefined?cshelvechanges:[]);
                        // console.log(shelveobj.planogramShelfChanges);
        
                        //check if overlap details deleted
                        let availableOverlapCount = shelveobj.overLappingDto.filter(x => x.isDelete && !x.isNew);
        
                        isFieldChangesAvailable = ((availableOverlapCount.length > 0) || (shelveobj.planogramShelfChanges && shelveobj.planogramShelfChanges.length > 0)?true:isFieldChangesAvailable);
                    }
                    csobj["isProductOverLapping"] = isprodoverlapping;
        
                    if(csobj.rightSidePlanogramFieldDto){
                        csobj.rightSidePlanogramFieldDto.planogramShelfDto.sort(sortShelvesDesc);
                    }
                    
                    //#PLG-DU-PP-H05 add propose data if available
                    if(this.props.isproposeavailable && this.props.loadedProposeList && Object.keys(this.props.loadedProposeList).length > 0){
                        csobj["suggestionDto"] = this.props.loadedProposeList;
                    }
                    
                    if(isFieldChangesAvailable || this.props.fieldStatus === "ACTIVE"){
                        isNewSave = csobj.isNew;
                        newSaveObj.fieldsList.push(csobj);
                    }
                }
        
                newSaveObj.departmentIds = deptIds;
        
                let snapshotData = (this.props.bottomCatSubBrands?this.props.bottomCatSubBrands:[]);
                for (let i = 0; i < snapshotData.length; i++) {
                    const deptobj = snapshotData[i];
                    deptobj.departmentActualWidth = (deptobj.departmentActualWidth / displayRatio);
        
                    for (let j = 0; j < deptobj.categories.length; j++) {
                        const catobj = deptobj.categories[j];
                        catobj.categoryActualWidth = (catobj.categoryActualWidth / displayRatio);
        
                        for (let l = 0; l < catobj.subcategories.length; l++) {
                            const subcatobj = catobj.subcategories[l];
                            subcatobj.subcategoryActualWidth = (subcatobj.subcategoryActualWidth / displayRatio);
        
                            for (let k = 0; k < subcatobj.brands.length; k++) {
                                const brandobj = subcatobj.brands[k];
                                brandobj.brandActualWidth = (brandobj.brandActualWidth / displayRatio);
                            }
                        }
                    }
                }
        
                newSaveObj.departments = snapshotData;
        
                
                //edit save changes - new object changes
                var nsaveobj = structuredClone(newSaveObj);
                var savepathobj = submitCollection.crudFloorLayoutBulkField;
                if(this.props.fieldStatus === "ACTIVE"){
                    // nsaveobj = { id:csaveobj.floorLayoutId, fieldDto: newSaveObj };
                    savepathobj = submitCollection.planogramNewVersionSaveForBulkField;
                }
        
                // console.log(savepathobj);
                // console.log(nsaveobj);
        
                this.setState({savemodalshow: true}, () => {
                    submitSets(savepathobj, nsaveobj, true).then(res => {
                        this.setState({savemodalshow: false});
            
                        if(res && res.status){
                            var cmsg = this.props.t('draftfielddetails')+(isNewSave?this.props.t('saved'):this.props.t('updated'))+this.props.t('succussfuly');
                            if(this.props.fieldStatus === "ACTIVE"){
                                cmsg = this.props.t('newdraftlayoutcreated');
                            }
                            alertService.success(cmsg);
                            
                            //clear loaded planogram layout data to reload
                            this.props.setPLanogramdetailsView(null);
                            
                            if(this.props.fieldStatus === "ACTIVE"){
                                this.props.resetReloadData(() => {
                                    this.props.setFieldIsNewDraftView(true);
                                    this.props.history.push("/planograms/details");
                                });
        
                            } else{
                                let savedFields = (res.extra && res.extra.fieldsList && res.extra.fieldsList.length > 0?res.extra.fieldsList:[]);
                                let updatedSaveObj = this.updateNewSavedFields(savedFields, csaveobj);
                                // console.log(updatedSaveObj);
                                
                                this.props.reinitSaveObj(updatedSaveObj);
                                this.props.convertCliboardData(savedFields.clipboardData, this.props.displayRatio);
                                
                                this.setState({savemodalmsg: cmsg, savemodalview: true}, () => {
                                    this.props.resetReloadData(() => {
                                        //reload propose data if already loaded
                                        if(this.props.isproposeavailable){
                                            this.props.handleViewProposeList("propose",true);
                                        }
                                    });
                                });
                            }
                        } else{
                            alertService.error((res&&res.error&&res.error.errorMessage?res.error.errorMessage:"error occurred"));
                        }
                    });
                });
            }
        })
    }

    //update fields from saved list
    updateNewSavedFields = (savedlist, reversedobj) => {
        for (let i = 0; i < reversedobj.fieldsList.length; i++) {
            let fieldobj = reversedobj.fieldsList[i];
            let findfromsave = savedlist.find(x => x.f_uuid === fieldobj.f_uuid);

            reversedobj.fieldsList[i] = (findfromsave?findfromsave:fieldobj);
        }

        return reversedobj;
    }

    //waiting modal toggle
    handleToggleSaveModal = () => {
        this.setState({savemodalview: !this.state.savemodalview});
    }

    render() {
        let isActiveMode = (this.props.isActiveMode && this.props.fieldStatus !== "MERGE" && this.props.fieldStatus !== "CONFIRMED");
        return (<>
            <Col xs={12} lg={4} className="btn-list">
                {this.props.fieldStatus !== "INACTIVE"?<>
                    <Row>
                        {isActiveMode?<Col xs={12} style={{padding:"0px",paddingRight:"5px"}} disabled={this.props.isProposeDataLoading?true:false}>
                        <Button variant="outline-primary" type="button" style={{width:"100%",borderRadius:"15px",fontSize:"12px"}} onClick={() => this.props.handleViewProposeList("propose",false)}>
                                {(this.props.isProposeDataLoading?<img src={loadinggif} style={{height:"18px"}} alt="propose loading"/>:this.props.t('btnnames.propose'))}
                        </Button>
                        </Col>:<></>}
                        
                        {(this.props.fieldStatus !== "CONFIRMED" && this.props.fieldStatus !== "MERGE")?<Col xs={12} style={{padding:"0px",paddingRight:"5px"}}>
                            <Button variant="success" type="button" className={!isActiveMode?'not-activemode':''} style={{width:"100%",borderRadius:"15px",fontSize:"12px"}} onClick={this.handleDunitObjSave}>{this.props.t('btnnames.save')}</Button>
                        </Col>:<></>}
                    </Row>
                </>:<></>}
            </Col>
        
            <Modal show={this.state.savemodalview} animation={false} onHide={this.handleToggleSaveModal} className="submitview-modal">
                <Modal.Body className="text-center">
                    <span className={this.props.isRTL==="rtl"?"float-left":"float-right"} onClick={() => this.handleToggleSaveModal()}><XIcon size={28} /></span>
                    <img src={savemodalimg} className="img-fluid" alt="submit save modal"/>
                    <h4>{this.state.savemodalmsg}</h4>
                    <Button variant="warning" size="sm" onClick={() => this.props.history.push("/planograms/details")}>{this.props.t('backtomngmt')}</Button>
                </Modal.Body>
            </Modal>

            <AcViewModal showmodal={this.state.savemodalshow} message={this.props.t('PLEASE_WAIT')} />
        </>);
    }
}