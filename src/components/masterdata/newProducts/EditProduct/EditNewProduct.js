import { Component } from 'react';
import { Button, Col, Modal, Row } from 'react-bootstrap';
import { withRouter } from 'react-router-dom';
import { withTranslation } from 'react-i18next';
import { AcInput, AcViewModal, ValT } from '../../../UiComponents/AcImports';
import Select from 'react-select';
import { uomList } from '../../../../_services/common.service';
import AddNewItemComponent from '../../products/AddNew/addnew';
import {SnapshotWarning} from '../../products/AddNew/snapshotWarning';
import './EditNewProduct.css';

import { submitSets } from '../../../UiComponents/SubmitSets';
import { submitCollection } from '../../../../_services/submit.service';
import { alertService } from '../../../../_services/alert.service';

class EditNewProduct extends Component {
    _isMounted = false;
    constructor(props){
        super(props);
        this.state = {
            loading:false,
            isShowExtendProdUpdate:false,
            extended_prodObj:null,
            prodObj:
            {
                "id": -1,
                "width": 0,
                "height": 0,
                "depth":0,
                "uom": "cm",
                "barcode": "N/A",
                "productName": "N/A",
                "brandId": 0,
                "subCategoryId": 0,
                "imageUrl": ""
            },

            snapshotAvailable:false,
            snapshotAvailableModal:false,
            snapshotsList:[{current: {label: ""},new: {label: ""}}],
            allProdData:null,
        }
    }

    componentDidMount(){
        this._isMounted = true;

        if(this._isMounted){
            if(this.props.selectedProduct){
                let prodObject = JSON.parse(JSON.stringify(this.props.selectedProduct));
                let editProdObject = {
                    "id": prodObject.id,
                    "width": prodObject.width,
                    "height": prodObject.height,
                    "depth":prodObject.depth,
                    "uom": (prodObject.uom?prodObject.uom:"anone"),
                    "barcode": prodObject.barcode,
                    "productName": prodObject.productName,
                    "brandId": prodObject.brandId,
                    "subCategoryId": prodObject.subCategoryId,
                    "imageUrl": prodObject.imageUrl,
                }
                
                this.setState({extended_prodObj:{prodDetails:prodObject}, prodObj:editProdObject, allProdData:JSON.parse(JSON.stringify(this.props.selectedProduct))});
            }
        }
    }

    toggleExtendedEditView = (isrefresh) =>{
        this.setState({isShowExtendProdUpdate:!this.state.isShowExtendProdUpdate});
        if(isrefresh===true){
            this.props.handleEditClose(true);
        }
        else if(isrefresh==="delete"){//delete
            this.props.handleEditClose("delete");
        }
    }


    changeFilters = (key, val) =>{
        let pobj = this.state.prodObj;
        pobj[key] = val;
        this.setState({prodObj:pobj});
    }

    saveProductData = ()=>{
        let pobj = this.state.prodObj;

        if(pobj.productName === undefined || pobj.productName === ""){
            alertService.error(this.props.t('ADD_A_PRODUCT_NAME'));
            return false;
        }

        if(pobj.width === "" || pobj.width === 0 || pobj.width === null){
            alertService.error(this.props.t('ADD_PRODUCT_WIDTH'));
            return false;
        }

        if( pobj.height === "" || pobj.height === 0 || pobj.height === null){
            alertService.error(this.props.t('ADD_PRODUCT_HEIGHT'));
            return false;
        }

        if(pobj.depth === "" || pobj.depth === 0 || pobj.depth === null){
            alertService.error(this.props.t('ADD_PRODUCT_DEPTH'));
            return false;
        }

        if(pobj.uom === undefined || pobj.uom === null || pobj.uom === "anone"){
            alertService.error("Select a Unit of Measure");
            return false;
            //pobj.uom="cm";
        }

        pobj.snapId = -1;
        pobj.isApprovedSnapshot = this.state.snapshotAvailable;
        pobj.isUpdateOnlyFlags = false;

        this.setState({loading:true});
        submitSets(submitCollection.updateRequiredDataOfProductFromMP, pobj, true, null, true).then(resp => {
            this.setState({loading: false});
            if(resp && resp.status){
                alertService.success(this.props.t('PRODUCT_DETAILS_SUCCESSFULLY')+this.props.t("saved"));
                
                if(this.state.snapshotAvailable===true){
                    this.updateSnapshots();
                }
                else{
                    this.props.handleEditClose(true);
                }

                this.setState({ isChangesAvailable: false });
            } else{
                // alertService.error((resp&&resp.extra?resp.extra:this.props.t('ERROR_OCCURRED')));
            }
        });
    }


    //snapshot availabitlity check methods
    checkForSnapshotAvailability = () => {
        if(!this.changesAvailableCheck()){
            alertService.error(this.props.t('NO_CHANGES_AVAILABLE'));
            return false;
        }
        
        this.setState({loading:true, snapshotAvailable:false,});
        var csobj = this.state.prodObj;
        var calldata = this.state.allProdData;
        //console.log(calldata);
        //this.handleSnapshotAvailabilityModalToggle();

        var tagsAvailable = false;
        for (let i = 0; i < calldata.productTags.length; i++) {
           if(calldata.productTags[i].isDelete!==true){tagsAvailable=true}
        }
        
        //check if snapshots available , if it does pop up to the user to get input otherwise continue to product update
        var sobj = {
            subCategoryId: csobj.subCategoryId, brandId: csobj.brandId, productId: csobj.id, 
            flags: { isMvp: (calldata.isMvp?calldata.isMvp:false), isOnTop: (calldata.isOnTop?calldata.isOnTop:false), isMandatory: (calldata.isMandatory? calldata.isMandatory:false), isOnTopTag:tagsAvailable }
        }
        submitSets(submitCollection.hasSnapShot, sobj, true, null, true).then(resp => {
            this.setState({loading:false});
            if(resp && resp.status && resp.extra){
                if(resp.extra.isHasSnapShot===true){
                    var snapdata =  resp.extra.snapDirection;
                    this.setState({snapshotAvailable:true, snapshotsList:snapdata});
                    this.handleSnapshotAvailabilityModalToggle();
                }
                else{
                   this.saveProductData();
                }
            }
            else{
                //alertService.error((resp&&resp.msg?resp.msg:resp&&resp.extra?resp.extra:this.props.t('ERROR_OCCURRED')));
                this.saveProductData();
            }
        });
        
    }

    continueToUpdateFromSnashotWarning = () =>{
        this.handleSnapshotAvailabilityModalToggle();
        this.saveProductData();
    }

    handleSnapshotAvailabilityModalToggle = () =>{
        this.setState({snapshotAvailableModal:!this.state.snapshotAvailableModal});
    }

    updateSnapshots = (product) =>{
        this.setState({loading:true});
        var csobj = this.state.prodObj;
        var calldata = this.state.allProdData;

        let hasTags = false;
        for (let i = 0; i < calldata.productTags.length; i++) {
            if(calldata.productTags[i].isDelete!==true){
                hasTags = true;
            }
        }

        let sobj = {
            snapId:-1,
            productId: csobj.id,
            subCategoryId: calldata.subCategoryId,
            brandId: calldata.brandId,
            isMvp: (calldata.isMvp?calldata:false),
            isOnTop: (calldata.isOnTop?calldata.isOnTop:false),
            isMandatory: (calldata.isMandatory?calldata.isMandatory:false),
            isHasTags: hasTags,
            isUpdateOnlyFlags : false,
            isApprovedSnapshot : this.state.snapshotAvailable,
        } 

        submitSets(submitCollection.updateMpSnapShot, sobj , true, null, true).then(resp => {
            this.setState({ loading:false});
            if(resp && resp.status){
                this.props.handleEditClose(true);
            }
            else{
                // alertService.error((resp&&resp.msg?resp.msg:resp&&resp.extra?resp.extra:this.props.t('ERROR_OCCURRED')));
            }
        });
    }

    changesAvailableCheck = () => {
        let bkpProdObj = this.props.selectedProduct;
        let prodObj = this.state.prodObj; 

        let isChangesAvailable = false;
        if(
            parseFloat(prodObj.width) !== bkpProdObj.width || 
            parseFloat(prodObj.height) !== bkpProdObj.height || 
            parseFloat(prodObj.depth) !== bkpProdObj.depth || 
            prodObj.uom !== bkpProdObj.uom || 
            prodObj.brandId !== bkpProdObj.brandId || 
            prodObj.subCategoryId !== bkpProdObj.subCategoryId
        ){
            
            isChangesAvailable = true;
        }

        return isChangesAvailable;
    }

    render() {
        var cuomlist = {anone:"-"};
        for (const key in uomList) {
            cuomlist[key] = this.props.t("uomlist."+key);
        }
        
        return (
            <Col className="newProdEditdiv">
                <Col>
                    <Row>
                        <Col  md={4}>
                            <Col className="imagediv">
                                {
                                    this.state.prodObj.imageUrl ?
                                    <img src={this.state.prodObj.imageUrl} className={(this.state.prodObj.width >= this.state.prodObj.height)?"img-resize-ver":"img-resize-hor"} alt="prod-img"/>
                                    :<></>
                                }
                            </Col>
                        </Col >
                        <Col md={8} className="prod-basic-details">
                            <Col >
                                <h4>{this.state.prodObj.productName}</h4> 
                                <h6>{this.state.prodObj.barcode}</h6>
                                {/* <h6>3.9 $</h6> */}
                            </Col>
                        </Col>
                    </Row>
                </Col>
                <Col>
                    <Row>
                    <Col  md={5}>
                            <AcInput atype="number" aid="width" aplace={this.props.t('width')} adefval={0} aobj={this.state.prodObj} avalidate={[ValT.empty,ValT.number]} showlabel={true} restrictDecimalPoint={3} removeSpecialCharacter={true} msg={this.props.t('Character.width')} />
                        </Col>
                        <Col md={2}></Col>
                        <Col  md={5}>
                            <AcInput atype="number" aid="height" aplace={this.props.t('height')} adefval={0} aobj={this.state.prodObj} avalidate={[ValT.empty,ValT.number]} showlabel={true} restrictDecimalPoint={3} removeSpecialCharacter={true} msg={this.props.t('Character.height')}/>
                        </Col>
                        <Col  md={5}>
                            <AcInput atype="number" aid="depth" aplace={this.props.t('depth')} adefval={0} aobj={this.state.prodObj} avalidate={[ValT.empty,ValT.number]} showlabel={true} restrictDecimalPoint={3} removeSpecialCharacter={true} msg={this.props.t('Character.depth')}/>
                        </Col>
                        <Col md={2}></Col>
                        <Col  md={5}>
                            <AcInput eleid="uomtxt" atype="select" aid="uom" aplace={this.props.t('uomeasure')} aobj={this.state.prodObj} adata={cuomlist} avalidate={[ValT.empty]} />
                        </Col>
                        <Col  md={12} style={{marginBottom:"15px"}}>
                            <label className='form-label' style={{marginBottom:"0"}}>{this.props.t("brand")}</label>
                            <Select 
                                placeholder={""} 
                                options={this.props.brands} 
                                onChange={(e) => this.changeFilters("brandId",e.value)} 
                                value={this.props.brands.filter(option => option.value === this.state.prodObj.brandId)} 
                                className="filter-selec2" size="sm" classNamePrefix="searchselect-inner" 
                                maxMenuHeight={200}    
                            />
                        </Col>
                        <Col  md={12}>
                            <label className='form-label' style={{marginBottom:"0"}}>{this.props.t("subcategory")}</label>
                            <Select 
                                placeholder={""} 
                                options={this.props.subcategorylist} 
                                onChange={(e) => this.changeFilters("subCategoryId",e.value)} 
                                value={this.props.subcategorylist.filter(option => option.value === this.state.prodObj.subCategoryId)} 
                                className="filter-selec2" size="sm" classNamePrefix="searchselect-inner" 
                                maxMenuHeight={200}    
                            />
                        </Col>
                        
                        <Col  md={12}>
                        
                        </Col>
                    </Row>
                </Col>
                <Col className='buttonSection'>
                    <Button className="newprodbtn close"  style={{color:"#52299C",background:"none",border:"1px solid #52299C",marginRight:"10px"}} onClick={()=>this.props.handleEditClose()}>{this.props.t("btnnames.close")}</Button>
                    <Button className="newprodbtn"  style={{background:"#F39C12",marginRight:"10px"}} onClick={()=> this.toggleExtendedEditView()}>{this.props.t("EXTENDED_EDITING")}</Button>
                    <Button className="newprodbtn" onClick={()=>this.checkForSnapshotAvailability()} disabled={this.state.loading===true?true:false}  style={{background:"linear-gradient(0deg, rgba(0, 0, 0, 0.2), rgba(0, 0, 0, 0.2)), #77DB61"}}>{this.props.t("btnnames.save")}</Button>
                </Col>


                <Modal  show={this.state.isShowExtendProdUpdate} className="prod-edit new-product-update-modal" dir={this.props.isRTL} onHide={()=>this.toggleExtendedEditView()} backdrop="static" animation={false}>
                    <Modal.Body style={{padding:"30px", background:"#F4F6F7"}}>
                       {
                            this.state.isShowExtendProdUpdate === true ?
                            <>
                                <AddNewItemComponent 
                                    isRTL={this.props.isRTL} 
                                    prodState={this.state.extended_prodObj} 
                                    ismodal={true} 
                                    hidemodal={this.toggleExtendedEditView}
                                    subcategorylist={this.props.subcategorylist} 
                                    brands={this.props.brands} 
                                    hidedelete={false} 
                                    size="sm"
                                />
                            </>:
                            <></>
                       }
                    </Modal.Body>
                </Modal>

                {
                    this.state.snapshotAvailableModal === true ?
                        <SnapshotWarning
                            t={this.props.t}
                            isRTL={this.props.isRTL}
                            snapshotAvailableModal={this.state.snapshotAvailableModal}
                            snapshotsList={this.state.snapshotsList}
                            handleSnapshotAvailabilityModalToggle={this.handleSnapshotAvailabilityModalToggle}
                            continueToUpdateFromSnashotWarning= {this.continueToUpdateFromSnashotWarning}
                        />
                    :<></>
                }

                <AcViewModal showmodal={this.state.loading} message={this.props.t('PLEASE_WAIT')}  />
            </Col>
        );
    }
}

export default withTranslation()(withRouter(EditNewProduct));