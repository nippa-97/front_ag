import React from 'react';
import { Link, withRouter } from 'react-router-dom';
import {Col, Breadcrumb, Form, Button, Row, Modal, Tabs, Tab, Badge, OverlayTrigger, Tooltip,InputGroup } from 'react-bootstrap';
import ReactCrop from 'react-image-crop';
import axios from 'axios';
import { connect } from "react-redux";
import { InfoIcon, XIcon } from '@primer/octicons-react'; //XCircleFillIcon, PlusIcon, 
import Select from 'react-select';
import { confirmAlert } from 'react-confirm-alert';
import { withTranslation } from 'react-i18next';

import { AcInput, AcButton, AcDropzone, AcViewModal, ValT} from '../../../UiComponents/AcImports';
import { ProductOptionIcons, SimulationWarinIcon } from '../../../../assets/icons/icons';
import { shelfLifeEnums, paceScaleEnums } from '../../../../enums/masterPlanogramEnums';

import { viewSetProdPrevAction } from '../../../../actions/prod/prod_action';
import { viewSetAction } from '../../../../actions/prod/prod_action';
import { uomList } from '../../../../_services/common.service';
import { alertService } from '../../../../_services/alert.service';
import { submitCollection } from '../../../../_services/submit.service';
import { submitSets } from '../../../UiComponents/SubmitSets';

import PreviewImage from '../../../common_layouts/image_preview/imagePreview.js';
import {SnapshotWarning} from './snapshotWarning';
import { ProductOrigin } from '../../../../enums/productsEnum';
import DatePicker from 'react-datepicker'
import { CalendarIcon} from '@primer/octicons-react'
import Gs1OverRideModal from '../gs1Overidemodal/Gs1OverRideModal';

import './addnew.scss';
import loadinggif from "../../../../assets/img/loading-sm.gif";
import { SimulationNewProductSearchDetailsSetAction } from '../../../../actions/masterPlanogram/masterplanogram_action';
import AffectedSimulationModal from '../../../newMasterPlanogram/simulateview/AffectedSimulationModal/AffectedSimulationModal';
import { TooltipWrapper } from '../../../newMasterPlanogram/AddMethods';

/**
 * products add/edit page
 * using to add new product or edit directly/gs1 products
 *
 * @class AddNewItemComponent
 * @extends {React.Component}
 */
export class AddNewItemComponent extends React.Component{
    _isMounted = false;

    constructor(props){
        super(props);
        this.state = {
            isedit: false,
            sobj: {}, vobj: {}, savemodalshow: false,
            srcList: {"":this.props.t("CHOOSE"), "gs1":"GS1", "direct":this.props.t("DIRECT"), "arigo":"Arigo"},
            toUploadImages: null,
            issourcecodeview: false,
            saveLoading:false,

            previewImg: false, thumbpreviews: [], showPreviewImageModal:false,
            previewsrc: null, previewcrop: null, previewcroppedimg: null,

            tabtype:1,
            brandlist:[{value:0, label:"-"}],
            subcategorylist:[{value:0, label:"-"}],

            tagslist:[{value:"", label:""}],
            selectedTag:{tagId:0, tagName:""},
            adddedTags:[],
            imgloadfromback:false,

            isFromLog:false,
            prevpagedetails: null,

            snapshotAvailable:false,
            snapshotAvailableModal:false,
            snapshotsList:[{current: {label: ""},new: {label: ""}}],
            isGS1Modal:false,
            GS1overrideProductDetails:null,
            isdimensionAll:false,
            isupdateAll:false,
            isChangesAvailable: false,
            isShowAffectedModal:false,
            AffectedSimList:[],
            loadingicon:false,
        }
    }

    componentDidMount(){
        this._isMounted = true;

        if(this._isMounted){
            var cisedit = (this.props.prodState&&this.props.prodState.prodDetails?true:false);
            let prepagedetails = (this.props.prodState && this.props.prodState.prodPrevDetails?this.props.prodState.prodPrevDetails:null);
            
            this.setState({
                isedit: cisedit,
                sobj: (cisedit?this.props.prodState.prodDetails:this.defaultObjectLoad()),
                adddedTags:cisedit ? (this.props.prodState.prodDetails.productTags?this.props.prodState.prodDetails.productTags:[]):[],
                issourcecodeview: (cisedit?(this.props.prodState.prodDetails.productSource==="GS1"?true:false):false),
                imgloadfromback:cisedit,
                prevpagedetails: prepagedetails,
                originalData : (cisedit?JSON.parse(JSON.stringify(this.props.prodState.prodDetails)):this.defaultObjectLoad()),
            }, () => {
                if(this.state.sobj && this.state.sobj.imageId){ //if edit view load image onload
                    this.getUploadImage(this.state.sobj.imageId);
                }
                this.checkHaveAffectedSimList(this.state.sobj.id);
            });

            //get subcategories form props else load from backend
            if(this.props.subcategorylist){
                this.setState({subcategorylist:this.props.subcategorylist});
            }else{
                this.getAllSubCategories();
            }

            //get brands form props else load from backend
            if(this.props.brands){
                this.setState({brandlist:this.props.brands});
            }else{
                this.getAllBrands();
            }

            this.loadAllTags();
            this.getAllBrands();
          
            const queryParams = new URLSearchParams(window.location.search);
            const isFromLog = queryParams.get('isFromLog');
            this.setState({isFromLog:isFromLog});
        }
    }

     //load all tags
     loadAllTags = () =>{
        let sobj = {isReqPagination:false,type:"",tagName: ""}
        submitSets(submitCollection.searchTags, sobj, true).then(res => {
            if(res && res.status){
                var arr = [];
                for (let i = 0; i < res.extra.length; i++) {
                    arr.push({value:res.extra[i].id, label:res.extra[i].tagName});
                }
                this.setState({tagslist:arr});
            } 
        });
    }

    //get all subcategories
    getAllSubCategories = () =>{
        var obj = {isReqPagination:false};
        submitSets(submitCollection.getFullListOfSubCategories, obj, true).then(resp => {
            let arr = [{value:0, label:"-"}];
            if(resp && resp.status){
                for (let i = 0; i < resp.extra.length; i++) {
                    arr.push({
                        value:resp.extra[i].subCategoryId,
                        label:resp.extra[i].subCategoryName,
                    });
                    
                }
                this.setState({subcategorylist:arr});
            } 
        });
    }

    //get all brands
    getAllBrands = () =>{
        var obj = {isReqPagination:false};
        submitSets(submitCollection.searchBrand, obj, true).then(resp => {
            let arr = [{value:0, label:"-"}];
            if(resp && resp.status){
                for (let i = 0; i < resp.extra.length; i++) {
                    arr.push({
                        value:resp.extra[i].brandId,
                        label:resp.extra[i].brandName,
                    });
                    
                }
                this.setState({brandlist:arr});
            } 
        });
    }

    componentWillUnmount(){
        this._isMounted = false;
    }
    //default product object
    defaultObjectLoad = () => {
        return { 
            productName: "", width: 0, height: 0, depth: 0,sensitivity: "", uom: "cm", barcode: "", imagePath: "", 
            productSource: "direct", gs1Code: "", 
            isMvp:false,isNOOS:true,isPremium:false,
            minQty: 0, maxQty: 0, minRevenue: 0, maxRevenue: 0, shelvesLife: 0, paceOfSalesInQty: 0, isMandatory: false, 
            paceOfSalesInQtyUot: "per_day", shelveLifeUot: "days", subCategoryId: 0,brandId: 0, productTags: [], 
            isManualAdded: false, isOnTop: false, isFavorite: false, isStackable: false, isBlock: false,
            blockUntilDate: null, isUseProdMinRev: false, maxStackableCount: 0, origin: ProductOrigin.Manual };//, 
    }
    //on drop images added save image array
    handleDropImages = (resp) => {
        var cfilelist = (resp?[{"preview":resp[0].preview}]:[]);
        this.setState({
            toUploadImages: resp, thumbpreviews: cfilelist, imgloadfromback:false, isChangesAvailable: true,
        });
    }

    handleConfirmationForSendToDep = () =>{
        var csobj = this.state.sobj;
        let msg = (csobj.mpUsageStatus==="New" ? this.props.t("PROD_SAVE_CONFIRM_SENTTODEP"): this.props.t("PROD_SAVE_CONFIRM_NOT_SENTTODEP"));
        confirmAlert({
            title: this.props.t("CONFIRM_TO_SUBMIT"),
            message: msg,
            overlayClassName: (this.props.isRTL === "rtl" ? "alertrtl-content" : ""),
            buttons: [{
                label: this.props.t('btnnames.yes'),
                onClick: () => {
                    this.checkForSnapshotAvailability()
                    return false;
                }
                
            }, {
                label: this.props.t('btnnames.no'),
                onClick: () => {
                    return false;
                }
            }]
        });
    }

    //validate save object and upload image
    handleGetUploadImage = (type) => {
    
        //validae save obj
        var csobj = this.state.sobj;
        if(csobj.productName === undefined || csobj.productName === ""){
            alertService.error(this.props.t('ADD_A_PRODUCT_NAME'));
            return false;
        }

        if(csobj.width === "" || csobj.width === 0 || csobj.width === null){
            alertService.error(this.props.t('ADD_PRODUCT_WIDTH'));
            return false;
        }

        if( csobj.height === "" || csobj.height === 0 || csobj.height === null){
            alertService.error(this.props.t('ADD_PRODUCT_HEIGHT'));
            return false;
        }

        if(csobj.depth === "" || csobj.depth === 0 || csobj.depth === null){
            alertService.error(this.props.t('ADD_PRODUCT_DEPTH'));
            return false;
        }

        if(csobj.uom === undefined || csobj.uom === undefined || csobj.uom <= 0 || csobj.uom ==="anone"){
            alertService.error("Select a Unit of Measure");
            return false;
        }

        // if(csobj.sensitivity === "" || csobj.sensitivity === 0){
        //     alertService.error(this.props.t('ADD_PRODUCT_SENSITIVITY'));
        //     return false;
        // }

        if(csobj.barcode === undefined || csobj.barcode === ""){
            alertService.error(this.props.t('ADD_PRODUCT_BARCODE'));
            return false;
        }

        if(csobj.productSource === undefined || csobj.productSource === ""){
            alertService.error(this.props.t('SELECT_A_PRODUCT_SOURCE'));
            return false;
        }

        if(type === 1 && (this.state.toUploadImages === null || this.state.toUploadImages.length === 0)){
            alertService.error(this.props.t('ADD_IMAGE_OF_PRODUCT'));
            return false;
        }

        if(csobj.fromProductLookup===true){
            if(csobj.subCategoryId===0 ||csobj.subCategoryId===null || csobj.subCategoryId===undefined || csobj.subCategoryId<0){
                alertService.error("Select a Subcategory");
                return false;
            }
            if(csobj.brandId===0 ||csobj.brandId===null || csobj.brandId===undefined || csobj.brandId<0){
                alertService.error("Select a Brand");
                return false;
            }
        }

        if(csobj.isMvp === false && csobj.isOnTop === false && csobj.isManualAdded===true){
            alertService.error(this.props.t("CHECK_MVPONTOP_WHEN_OVERRIDE"));
            return false;
        }
        if(csobj.isBlock === true && (csobj.blockUntilDate === undefined || csobj.blockUntilDate === null || csobj.blockUntilDate === 0 )){
            alertService.error("Select a Date");
            return false;
        }

        var crespname = (this.state.toUploadImages&&this.state.toUploadImages.length>0&&this.state.toUploadImages[0].name?this.state.toUploadImages[0].name:"prodimg_"+(new Date().getTime())+".png");
        var imgObj = {};
        imgObj.imageName = crespname;
        //console.log(imgObj);

        this.setState({saveLoading:true});
        if(type !== 3 && this.state.toUploadImages){
            this.setState({savemodalshow: true});
            submitSets(submitCollection.getImagePutURL, imgObj, true).then(res => {
                if(res && res.status){
                    this.handleUploadImage(this.state.toUploadImages[0],res.extra,type);
                } else{
                    if(type){ this.handleProdSave(type); }
                }
            });
        } else{
            if(type){ this.handleProdSave(type); }
        }
    }
    //upload image
    handleUploadImage = (imgobj, urlobj, type) => {
        try {
            const coheaders = {"Content-Type": 'image/*'};
            axios({url: urlobj.url,method: "PUT",data: imgobj,headers:coheaders}).then((res) => {
                if(res.status === 200){
                    var csobj = this.state.sobj;
                    csobj["imageId"] = urlobj.id;
                    this.setState({
                        sobj: csobj
                    });
                    if(type){ this.handleProdSave(type); }
                } else{
                    if(type){ this.handleProdSave(type); }
                }
            });
        } catch (error) {
            if(type){ this.handleProdSave(type); }
        }
    }
    //get uploaded image
    getUploadImage = (imgId) => {
        var imgObj = {};
        imgObj.id = imgId;

        submitSets(submitCollection.getImageGETURL, imgObj, true).then(res => {
            //console.log(res);
            if(res && res.status && res.extra){
                var csobj = this.state.sobj;
                csobj["imagePath"] = res.extra.url;

                var previewimgs = [{"preview": res.extra.url}];

                this.setState({
                    sobj: csobj, thumbpreviews: previewimgs
                });
            }
        });
    }
    //product save call response
    handleProdSave = (type) => {
        if(this.state.sobj){
            var csobj = this.state.sobj;
            if(csobj.productSource === "direct"){ //clear gs1code if direct
                csobj.gs1Code = "";
            }
            csobj.productTags = this.state.adddedTags;
            csobj.isMvp = (csobj.isMvp?csobj.isMvp:false);
            csobj.isOnTop = (csobj.isOnTop?csobj.isOnTop:false);

            csobj.snapId = -1;
            csobj.isApprovedSnapshot = this.state.snapshotAvailable;
            csobj.isUpdateOnlyFlags = false;

            // if(type===2){
            //     csobj.isUpdateOnlyFlags = false;
            //     csobj.isApprovedSnapshot = this.state.snapshotAvailable;
            // }

            var savepath = (type === 3?submitCollection.deleteProds:type === 2?submitCollection.updateProds:submitCollection.saveProds);
            submitSets(savepath, csobj, true, null, true).then(resp => {
                this.setState({savemodalshow: false, saveLoading:false});
                if(resp && resp.status){
                    let cprevdetails = this.state.prevpagedetails;
                    
                    alertService.success(this.props.t('PRODUCT_DETAILS_SUCCESSFULLY')+this.props.t(type===1?"saved":"updated"));

                    if(type===2 && this.state.snapshotAvailable===true){
                        if(this.props.isFromSimulation){
                            //resimulation
                            let warnprod = this.props.selectedwarningdropprod;
                            let rdx={ text: (warnprod?warnprod.barcode:this.props.productSearchText), warnProd: warnprod };
                            this.props.setSimulationNewProductSearchDetails(rdx)
                            this.props.getSimulationcall(true)
                        }
                        this.updateSnapshots(csobj);
                    }
                    else{
                        if(cprevdetails){
                            cprevdetails["viewtype"] = (type===1?"new":"update");
                            this.props.setProdPrevDetails(cprevdetails);
                        }
    
                        if(this.state.isFromLog === "true"){
                            this.props.history.push("/catelogueImport?isSavedLog=true");
                        }
                        else{
                            if(this.props.ismodal===true){
                                this.props.hidemodal("update");
                                if(this.props.isFromSimulation){
                                    //resimulation.
                                    let warnprod = this.props.selectedwarningdropprod;
                                    let rdx={ text: (warnprod?warnprod.barcode:this.props.productSearchText), warnProd: warnprod };
                                    this.props.setSimulationNewProductSearchDetails(rdx)
                                    this.props.getSimulationcall(true)
                                }
                            }
                            else{
                                this.props.history.push("/products");
                            }
                        }
                    }
                } else{
                    // alertService.error((resp?(resp.error?resp.error.errorMessage:resp.extra):this.props.t('ERROR_OCCURRED')));
                }
            });
        }
    }
    //delete product response
    handleProdDelete = (resp) => {
        if(resp && resp.status){
            let cprevdetails = this.state.prevpagedetails;
            var csobj = JSON.parse(JSON.stringify(this.state.sobj));
            //console.log(csobj);
            //console.log(cprevdetails);
            if(cprevdetails){
                cprevdetails["viewtype"] = "delete";

                if(csobj.barcode === cprevdetails.productName){//delete if searched text is equal to deleted product barcode
                    cprevdetails.productName = "";
                }

                this.props.setProdPrevDetails(cprevdetails);
            }

            alertService.success(this.props.t('SUCCESSFULLY_PRODUCT_DETAILS_DELETED'));
            
            if(this.state.isFromLog === "true"){
                this.props.history.push("/catelogueImport?isSavedLog=true");
            }
            else{
                if(this.props.ismodal===true){
                    this.props.hidemodal("delete");
                }
                else{
                    this.props.history.push("/products");
                }
            }
        } else{
            // alertService.error((resp&&resp.extra?resp.extra:resp.msg?resp.msg:this.props.t('ERROR_OCCURRED')));
            if(resp.validation){
            
                let codeMessage = this.props.t(resp.validation.code);
    
                if(resp.validation.msgParams && resp.validation.msgParams.length > 0){
                    
                    let filledMessage = codeMessage.replace(/\[\$\]/g, () => resp.validation.msgParams.shift());
    
                    resp.validation.type === "error" ? alertService.error(filledMessage) : alertService.warn(filledMessage);
    
                }else{
                    resp.validation.type === "error" ? alertService.error(codeMessage) : alertService.warn(codeMessage);
                }
    
            }else{
                alertService.error(this.props.t("ERROR_OCCURRED"));
            }

        }
    }
    //#PRD-H02 onchange source
    handleSourceView = (resp) => {
        var csobj = this.state.sobj;
        this.setState({
            issourcecodeview: (resp==="gs1"?true:false), sobj: csobj
        });
    }
    //preview modal toggle
    handleTogglePreview = (cprevimg,type) => {
        this.setState({previewImg: cprevimg, showPreviewImageModal:type});
    }
    //after crop image complete create image from that
    onCropComplete = crop => {
        this.makeClientCrop(crop);
    };
    //create image from crop details
    async makeClientCrop(crop) {
        if (this.imageRef && crop.width && crop.height) {
          const croppedImageUrl = await this.getCroppedImg(
            this.imageRef,
            crop,
            'newFile.png'
          );
          //console.log(croppedImageUrl);
          this.setState({ previewcroppedimg: croppedImageUrl });
        }
    }
    //convert base64 image to blob
    dataURItoBlob = (dataURI) => {
        // convert base64/URLEncoded data component to raw binary data held in a string
        var byteString;
        if (dataURI.split(',')[0].indexOf('base64') >= 0)
            byteString = atob(dataURI.split(',')[1]);
        else
            byteString = unescape(dataURI.split(',')[1]);
        // separate out the mime component
        var mimeString = dataURI.split(',')[0].split(':')[1].split(';')[0];
        // write the bytes of the string to a typed array
        var ia = new Uint8Array(byteString.length);
        for (var i = 0; i < byteString.length; i++) {
            ia[i] = byteString.charCodeAt(i);
        }
        return new Blob([ia], {type:mimeString});
    }
    //create crop image to from a canvas
    getCroppedImg(image, crop, fileName) {
        const canvas = document.createElement('canvas');
        const scaleX = image.naturalWidth / image.width;
        const scaleY = image.naturalHeight / image.height;
        canvas.width = crop.width;
        canvas.height = crop.height;

        const ctx = canvas.getContext('2d');
        ctx.drawImage( image, crop.x * scaleX, crop.y * scaleY, crop.width * scaleX, crop.height * scaleY, 0, 0, crop.width, crop.height );
        
        return new Promise((resolve, reject) => {
          canvas.toBlob(blob => {
            if (!blob) {
              return;
            }
            blob.name = fileName;

            window.URL.revokeObjectURL(this.fileUrl);
            this.fileUrl = window.URL.createObjectURL(blob);

            resolve(this.fileUrl);
          }, 'image/png');
        });
    }
    //set ref after image loaded
    onImageLoaded = image => {
        this.imageRef = image;
    };
    //ReactCrop change event
    onCropChange = (crop) => {
        this.setState({ previewcrop: crop });
    };

    handleToggleCrop = (ccropimg) => {
        if(ccropimg){
            var xhr = new XMLHttpRequest();
            xhr.open("GET", ccropimg, true);
            xhr.responseType = "blob";
            xhr.onload = (e) => {
                //console.log(e);
                var reader = new FileReader();
                reader.onload = (event) => {
                    var res = event.target.result;
                    //console.log(res);
                    this.setState({previewsrc: res});
                }
                var file = e.currentTarget.response;
                reader.readAsDataURL(file)
            };
            xhr.send();
        } else{
            this.setState({previewsrc: false});
        }
    }

    handleCropAndClose = () => {
        if(this.state.previewcroppedimg){
            var cfilelist = (this.state.previewcroppedimg?[{"preview":this.state.previewcroppedimg}]:[]);
            this.setState({ toUploadImages: [this.state.previewcroppedimg], thumbpreviews: cfilelist}, () => {
                this.handleToggleCrop(null);
            });
        } else{
            this.handleToggleCrop(null);
        }
    }
    //on change width/height
    handleChangeDetails = (ctxt, ctype) => {
        // setTimeout(() => {
            var csobj = this.state.sobj;
            csobj[ctype] = ctxt;
            this.setState({sobj: csobj, isChangesAvailable: true});
        // }, 100);
    }

    handleChangesAvailable = () => {
        this.setState({ isChangesAvailable: true});
    }

    //#PRD-H03
    handleSwitchChanges = (ctxt, ctype) =>{
        // setTimeout(() => {
            var csobj = this.state.sobj;
            
            if(ctype==="isMvp"){
                //check override is activated
                if(!csobj.isManualAdded && !csobj.isMvp){
                   alertService.error(this.props.t("ACTIVATE_OVERRIDE_TOCONTINUE")); 
                   return false;
                }
                
                csobj.isOnTop = false;

                if(csobj.isMvp){
                    csobj.isMandatory = false;
                }
                
                if(this.state.isedit===true){
                    csobj.isManualAdded = true;
                }
            }
            
            //
            if(ctype==="isOnTop"){
                //check override is activated
                if(!csobj.isManualAdded){
                    alertService.error(this.props.t("ACTIVATE_OVERRIDE_TOCONTINUE")); 
                    return false;
                }

                csobj.isMvp = false;
                csobj.isMandatory = false;
                if(this.state.isedit===true){
                    csobj.isManualAdded = true;
                }
            }

            if(ctype==="isMandatory" && ctxt===false){
                csobj.isOnTop = false;
                csobj.isMvp = true;
                if(this.state.isedit===true){
                    csobj.isManualAdded = true;
                }
            }

            if(ctype === "isManualAdded"){
                if(csobj.isManualAdded){
                    csobj.isOnTop = false;
                    csobj.isMvp = false;
                    csobj.isMandatory = false;
                }
            }

            //toggle option value
            csobj[ctype] = !ctxt;

            this.setState({sobj: csobj, isChangesAvailable: true});
        // }, 100);
    }

    changeDropDowns = (key, value) => {
        let selprod = this.state.sobj;
        selprod[key] = value;

        if(key === "isUseProdMinRev" && !value){
            selprod["minRevenue"] = 0;
        }
        
        this.setState({ sobj: selprod, isChangesAvailable: true });
    }

    //handle tag select change
    handleTagChange = (e) => {
        let tempObj = this.state.selectedTag;
        tempObj.tagId = e.value;
        tempObj.tagName = e.label;

        this.setState({selectedTag:tempObj, isChangesAvailable: true}, () => {
            this.addTag();
        });
    }

    //#PRD-H04 addNew Tag
    addTag = () =>{
        if(this.state.selectedTag.tagId && this.state.selectedTag.tagId > 0){
            let seltag = this.state.selectedTag;
            let atags = this.state.adddedTags;

            let isalreadyadded = false;
            for (let i = 0; i < atags.length; i++) {
                if(atags[i].tagId === seltag.tagId){
                    isalreadyadded = true;
                }
            }

            if(!isalreadyadded){
                atags.push(seltag);
            }
            
            this.setState({ adddedTags: atags, selectedTag: {tagId:0, tagName:""} });
        }
    }

    //remove tag
    removeTag = (i) =>{
        let atags = this.state.adddedTags;
        if(atags[i].productHasTagId){
            atags[i].isDelete = true;
        }
        else{
            atags.splice(i,1);
        }
        this.setState({adddedTags:atags, isChangesAvailable: true});
    }
    //
    handlePreviewModal = () => {
        this.handleTogglePreview(!this.state.previewImg,false);
    }

    handleSwitchmpUsageStatus = () =>{
        //this.state.sobj.mpUsageStatus
        setTimeout(() => {
            var csobj = this.state.sobj;
            csobj.mpUsageStatus = (csobj.mpUsageStatus === "New" ? "None" : "New");
            this.setState({sobj: csobj});
        }, 100);
    }

    archiveProduct = () =>{
        confirmAlert({
            title: this.props.t("CONFIRM_TO_SUBMIT"),
            message: this.props.t("NEW_PROD_ARCHIVE_CONFIRM"),
            overlayClassName: (this.props.isRTL === "rtl" ? "alertrtl-content" : ""),
            buttons: [{
                label: this.props.t('btnnames.yes'),
                onClick: () => {
                    this.setState({ savemodalshow: true}, () => {
                        let prod = this.state.sobj;
                        // prod.isFromNewProduct = false;

                        let newarchiveobj = {
                            isEnableMultiple: false,
                            isFromNewProduct: false,
                            isSingleProd: true,
                            isUpdateAll: false,
                            productIds: [prod.id],
                            searchFilter: null,
                        };

                        //console.log(prod);
                        submitSets(submitCollection.archiveProduct, newarchiveobj, true, null, true).then(resp => {
                            this.setState({ savemodalshow:false});
                            if(resp && resp.status){
                                
                                if(resp.extra && Array.isArray(resp.extra) && resp.extra.length > 0){
                                    let firstitem = resp.extra[0];
                                    if(firstitem.success){
                                        alertService.success(this.props.t("succussfuly")+" "+firstitem.productName+" "+this.props.t("ARCHIVED"));
                                    } else{
                                        
                                        alertService.error(firstitem.response);
                                        return false;
                                    }

                                    if(this.props.ismodal===true){
                                        this.props.hidemodal("update");
                                    } else{
                                        
                                        let cprevdetails = this.state.prevpagedetails;
                                        if(cprevdetails){
                                            cprevdetails["viewtype"] = "update";
                                            this.props.setProdPrevDetails(cprevdetails);
                                        }
                                        
                                        this.props.history.push("/products");
                                    }
                                }
                            }
                            else{
                                // alertService.error((resp&&resp.msg?resp.msg:resp&&resp.extra?resp.extra:this.props.t('ERROR_OCCURRED')));
                            }
                        });
                    });
                    
                }
                
            }, {
                label: this.props.t('btnnames.no'),
                onClick: () => {
                    return false;
                }
            }]
        });
    }

    restoreProduct = () =>{
        confirmAlert({
            title: this.props.t("CONFIRM_TO_SUBMIT"),
            message: this.props.t("NEW_PROD_ARCHIVE_CONFIRM"),
            overlayClassName: (this.props.isRTL === "rtl" ? "alertrtl-content" : ""),
            buttons: [{
                label: this.props.t('btnnames.yes'),
                onClick: () => {
                    this.setState({ saveLoading:true});
                    let prod = this.state.sobj;
                    // prod.isFromNewProduct = false;

                    let newrestoreobj = {
                        isEnableMultiple: false,
                        isFromNewProduct: false,
                        isSingleProd: true,
                        isUpdateAll: false,
                        productIds: [prod.id],
                        searchFilter: null,
                    };

                    //console.log(prod);
                    submitSets(submitCollection.restoreProduct, newrestoreobj, true, null, true).then(resp => {
                        this.setState({ saveLoading:false});
                        if(resp && resp.status){
                            /* alertService.success(this.props.t("succussfuly")+" " +this.props.t("saved"));
                            if(this.props.ismodal===true){
                                this.props.hidemodal("delete");
                            }else{
                                let cprevdetails = this.state.prevpagedetails;
                                if(cprevdetails){
                                    cprevdetails["viewtype"] = "update";
                                    this.props.setProdPrevDetails(cprevdetails);
                                }
                                
                                this.props.history.push("/products");
                            } */

                            if(resp.extra && Array.isArray(resp.extra) && resp.extra.length > 0){
                                let firstitem = resp.extra[0];
                                if(firstitem.success){
                                    alertService.success(this.props.t("succussfuly")+" "+firstitem.productName+" "+this.props.t("RESTORED"));
                                } else{
                                    alertService.error(firstitem.response);
                                    return false;
                                }

                                if(this.props.ismodal===true){
                                    this.props.hidemodal("update");
                                }else{
                                    let cprevdetails = this.state.prevpagedetails;
                                    if(cprevdetails){
                                        cprevdetails["viewtype"] = "update";
                                        this.props.setProdPrevDetails(cprevdetails);
                                    }

                                    this.props.history.push("/products");
                                }

                                /* let respobj = { responseType: "restore", prods: resp.extra };
                                this.setState({ isShowResponseModal: true, responseObj: respobj }); */
                            }
                        }
                        else{
                            // alertService.error((resp&&resp.msg?resp.msg:resp&&resp.extra?resp.extra:this.props.t('ERROR_OCCURRED')));
                        }
                    });
                    return false;
                }
                
            }, {
                label: this.props.t('btnnames.no'),
                onClick: () => {
                    return false;
                }
            }]
        });

    }

    backLinkSet = (backpath, iscurrent) => {
        let cprevdetails = this.state.prevpagedetails;
        if(iscurrent && cprevdetails){
            cprevdetails["viewtype"] = "back";
            this.props.setProdPrevDetails(cprevdetails);
    
            this.props.history.push(backpath);
        }
    }

    //snapshot availabitlity check methods
    checkForSnapshotAvailability = () =>{

        if(this.state.isedit===true){
            if(!this.state.isChangesAvailable){
                alertService.warn(this.props.t("NO_CHANGES_AVAILABLE"));
                return false;
            }
        }

        this.setState({savemodalshow:true, saveLoading:true, snapshotAvailable:false,});
        var csobj = this.state.sobj;
        //console.log(csobj);
        //this.handleSnapshotAvailabilityModalToggle();

        var tagsAvailable = false;
        for (let i = 0; i < csobj.productTags.length; i++) {
           if(csobj.productTags[i].isDelete!==true){tagsAvailable=true}
        }
        
        //check if snapshots available , if it does pop up to the user to get input otherwise continue to product update
        var sobj = {subCategoryId: csobj.subCategoryId, brandId: csobj.brandId, productId: csobj.id, flags: { isMvp: (csobj.isMvp?csobj.isMvp:false), isOnTop: (csobj.isOnTop?csobj.isOnTop:false), isMandatory: csobj.isMandatory,  isOnTopTag:tagsAvailable }}
        submitSets(submitCollection.hasSnapShot, sobj, true).then(resp => {
            this.setState({ savemodalshow:false, saveLoading:false});
            if(resp && resp.status && resp.extra){
                if(resp.extra.isHasSnapShot===true){
                    var snapdata = resp.extra.snapDirection;
                    this.setState({snapshotAvailable:true, snapshotsList:snapdata});
                    this.handleSnapshotAvailabilityModalToggle();
                }
                else{
                    this.handleGetUploadImage(2);
                }
            }
            else{
                //alertService.error((resp&&resp.msg?resp.msg:resp&&resp.extra?resp.extra:this.props.t('ERROR_OCCURRED')));
                this.handleGetUploadImage(2);
            }
        });
        
    }

    continueToUpdateFromSnashotWarning = () =>{
        this.handleSnapshotAvailabilityModalToggle();
        this.handleGetUploadImage(2);
    }

    handleSnapshotAvailabilityModalToggle = () =>{
        this.setState({snapshotAvailableModal:!this.state.snapshotAvailableModal});
    }

    updateSnapshots = (product) =>{
        this.setState({savemodalshow:false});
        let hasTags = false;
        for (let i = 0; i < product.productTags.length; i++) {
            if(product.productTags[i].isDelete!==true){
                hasTags = true;
            }
        }

        // var oriProd = this.state.originalData;
        var oriProd = this.state.sobj;

        let sobj = {
            snapId:-1,
            productId: product.id,
            subCategoryId: oriProd.subCategoryId,
            brandId: oriProd.brandId,
            isMvp: oriProd.isMvp,
            isOnTop: oriProd.isOnTop,
            isMandatory: oriProd.isMandatory,
            isHasTags: hasTags,
            isUpdateOnlyFlags : false,
            isApprovedSnapshot : this.state.snapshotAvailable,
        } 

        submitSets(submitCollection.updateMpSnapShot, sobj , true, null, true).then(resp => {
            this.setState({ savemodalshow:false});
            if(resp && resp.status){
                let cprevdetails = this.state.prevpagedetails;
                if(cprevdetails){
                    cprevdetails["viewtype"] = "update";
                    this.props.setProdPrevDetails(cprevdetails);
                }

                if(this.state.isFromLog === "true"){
                    this.props.history.push("/catelogueImport?isSavedLog=true");
                }
                else{
                    if(this.props.ismodal===true){
                        this.props.hidemodal("update");
                    }
                    else{
                        this.props.history.push("/products");
                    }
                }
                if(this.props.isFromSimulation){
                    //resimulation
                    this.props.getSimulationcall()
                }
            }
            else{
                // alertService.error((resp&&resp.msg?resp.msg:resp&&resp.extra?resp.extra:this.props.t('ERROR_OCCURRED')));
            }
        });
    }

    toggleResponseModal = () => {
        this.setState({ isShowResponseModal: !this.state.isShowResponseModal }, () => {
            if(this.props.ismodal===true){
                this.props.hidemodal("delete");
            }else{
                this.props.history.push("/products");
            }
        });
    }

    //tomorrow's date
    tomorrowDate (){
        const today = new Date(); 
        const tomorrow = new Date(today); 
        tomorrow.setDate(today.getDate() + 1); 

        return tomorrow
    }


    //gs1 overide modal
    ClickGS1Override=(val,type)=>{
        if(val){
            this.setState({savemodalshow:true,});
            submitSets(submitCollection.getOverrideGs1ProductInfo, ('?productId='+this.state.sobj.id), true, null, true).then(res => {
                this.setState({savemodalshow:false,dataloading:true});
                if(res && res.status){
                    this.setState({GS1overrideProductDetails:res.extra},()=>{
                        this.setState({isGS1Modal:val})
                    });
                }else{
                    // alertService.error(this.props.t("THIS_PROD_HAVENT_GS1_UPDATE_AVAILABLE"))
                }
            });
        }else{
            if(type&&type==="havechange"){
                if(this.props.ismodal===true){
                    this.props.hidemodal("delete");
                }
            }
            
            this.setState({isGS1Modal:val,  isdimensionAll:false,
                isupdateAll:false})
        }
        
       
    }
    handleChangeProdAttr=(bool,type,dimenType)=>{
        if(!bool){
            this.setState({isupdateAll:false})
        }
        var overrideobj=this.state.GS1overrideProductDetails
       
        if(dimenType){
            overrideobj[type][dimenType].isUpdate=bool
            //update dimention all if all selected
            if(overrideobj.dimensions.width.isUpdate&&overrideobj.dimensions.height.isUpdate&&overrideobj.dimensions.depth.isUpdate){
                this.setState({isdimensionAll:true})
            }else{
                this.setState({isdimensionAll:false})
            }
        }else{
            overrideobj[type].isUpdate=bool
        }
        this.setState({GS1overrideProductDetails:overrideobj},()=>{
           
            var isDimensionAll=this.dimensionUpdateAllAutoSwitch()
            this.setState({
                isdimensionAll:isDimensionAll},()=>{
                    var isHandleUpdateAll=this.UpdateAllAutoSwitch()
                    this.setState({isupdateAll:isHandleUpdateAll,})
                })
        })
    }
    checkisAllDimensionDisable=()=>{
        var bool= false
        var ProductDetails=this.state.GS1overrideProductDetails
        var widthequal=((ProductDetails.dimensions.width.currentObj.dimension=== ProductDetails.dimensions.width.newObj.dimension))&&((ProductDetails.dimensions.width.currentObj.uom=== ProductDetails.dimensions.width.newObj.uom))
        var heightequal=((ProductDetails.dimensions.height.currentObj.dimension=== ProductDetails.dimensions.height.newObj.dimension))&&((ProductDetails.dimensions.height.currentObj.uom=== ProductDetails.dimensions.height.newObj.uom))
        var depthequal=((ProductDetails.dimensions.depth.currentObj.dimension=== ProductDetails.dimensions.depth.newObj.dimension))&&((ProductDetails.dimensions.depth.currentObj.uom=== ProductDetails.dimensions.depth.newObj.uom))
        bool=(widthequal&&heightequal&&depthequal)
        return bool
    }
    dimensionUpdateAllAutoSwitch=()=>{
        var markall=false
        var ProductDetails=this.state.GS1overrideProductDetails
        var widthequal=((ProductDetails.dimensions.width.currentObj.dimension=== ProductDetails.dimensions.width.newObj.dimension))&&((ProductDetails.dimensions.width.currentObj.uom=== ProductDetails.dimensions.width.newObj.uom))
        var heightequal=((ProductDetails.dimensions.height.currentObj.dimension=== ProductDetails.dimensions.height.newObj.dimension))&&((ProductDetails.dimensions.height.currentObj.uom=== ProductDetails.dimensions.height.newObj.uom))
        var depthequal=((ProductDetails.dimensions.depth.currentObj.dimension=== ProductDetails.dimensions.depth.newObj.dimension))&&((ProductDetails.dimensions.depth.currentObj.uom=== ProductDetails.dimensions.depth.newObj.uom))
    
        if(ProductDetails.dimensions.width.isUpdate&&ProductDetails.dimensions.height.isUpdate&&ProductDetails.dimensions.depth.isUpdate){
            markall=true
        }
        if(widthequal){
            markall=ProductDetails.dimensions.height.isUpdate&&ProductDetails.dimensions.depth.isUpdate
        }
        if(heightequal){
            markall=ProductDetails.dimensions.width.isUpdate&&ProductDetails.dimensions.depth.isUpdate
        }
        if(depthequal){
            markall=ProductDetails.dimensions.height.isUpdate&&ProductDetails.dimensions.width.isUpdate
        }

        if(widthequal&&heightequal){
            markall=ProductDetails.dimensions.depth.isUpdate
        }
        if(widthequal&&depthequal){
            markall=ProductDetails.dimensions.height.isUpdate
        }
        if(heightequal&&depthequal){
            markall=ProductDetails.dimensions.height.isUpdate
        }
    return markall
    }
    handleAffectedSimulationModal=()=>{
        this.setState({isShowAffectedModal:!this.state.isShowAffectedModal})
    }
    UpdateAllAutoSwitch=()=>{
        var isAllDimensionDisable=this.checkisAllDimensionDisable()
        var update=false
        var nameequal=(this.state.GS1overrideProductDetails.product.currentName===this.state.GS1overrideProductDetails.product.newName)
        var dimentionall=this.state.isdimensionAll
        var img=this.state.GS1overrideProductDetails.image
        var brand=this.state.GS1overrideProductDetails.brand
        // var prodname=this.state.GS1overrideProductDetails.product
        if(isAllDimensionDisable){
            if(img.isUpdate){
                if(brand.currentName===null){
                    // update=brand.isUpdate
                    if(nameequal){
                        update=brand.isUpdate
                    }else{
                        update=this.state.GS1overrideProductDetails.product.isUpdate&&brand.isUpdate
                    }
    
                }else{
                    if(nameequal){
                        update=true
                    }else{
                        update=this.state.GS1overrideProductDetails.product.isUpdate
                    }
                   
                }
              
            }else{
                update=false
            }
        }else{
            if(dimentionall&&img.isUpdate){
                if(brand.currentName===null){
                    // update=brand.isUpdate
                    if(nameequal){
                        update=brand.isUpdate
                    }else{
                        update=this.state.GS1overrideProductDetails.product.isUpdate&&brand.isUpdate
                    }
    
                }else{
                    if(nameequal){
                        update=true
                    }else{
                        update=this.state.GS1overrideProductDetails.product.isUpdate
                    }
                   
                }
              
            }else{
                update=false
            }
        }
        
        // if(dimentionall&&img.isUpdate&&((brand&&brand.currentName!==null)?brand.isUpdate:true)&&nameequal?true:this.state.GS1overrideProductDetails.product.isUpdate){
        //     update=true
            
        // }else{
        //     update=false
        // }
// console.log(update);
        return update
    }
    handleChangeAlldimention=(bool,type)=>{
        if(!bool){
            this.setState({isupdateAll:false})
        }
        var ProductDetails=this.state.GS1overrideProductDetails
        var widthequal=((ProductDetails.dimensions.width.currentObj.dimension=== ProductDetails.dimensions.width.newObj.dimension))&&((ProductDetails.dimensions.width.currentObj.uom=== ProductDetails.dimensions.width.newObj.uom))
        var heightequal=((ProductDetails.dimensions.height.currentObj.dimension=== ProductDetails.dimensions.height.newObj.dimension))&&((ProductDetails.dimensions.height.currentObj.uom=== ProductDetails.dimensions.height.newObj.uom))
        var depthequal=((ProductDetails.dimensions.depth.currentObj.dimension=== ProductDetails.dimensions.depth.newObj.dimension))&&((ProductDetails.dimensions.depth.currentObj.uom=== ProductDetails.dimensions.depth.newObj.uom))
        
        var overrideobj=this.state.GS1overrideProductDetails
        // overrideobj[type].isUpdate=bool
        if(!depthequal){overrideobj[type]["depth"].isUpdate=bool}
        if(!heightequal){overrideobj[type]["height"].isUpdate=bool}
        if(!widthequal){overrideobj[type]["width"].isUpdate=bool}
        this.setState({GS1overrideProductDetails:overrideobj,isdimensionAll:bool},()=>{
            var isHandleUpdateAll=this.UpdateAllAutoSwitch()
            
            this.setState({isupdateAll:isHandleUpdateAll})
        })
    }
    
    handleChangeAllUpdate=(bool)=>{
        var ProductDetails=this.state.GS1overrideProductDetails
        var widthequal=((ProductDetails.dimensions.width.currentObj.dimension=== ProductDetails.dimensions.width.newObj.dimension))&&((ProductDetails.dimensions.width.currentObj.uom=== ProductDetails.dimensions.width.newObj.uom))
        var heightequal=((ProductDetails.dimensions.height.currentObj.dimension=== ProductDetails.dimensions.height.newObj.dimension))&&((ProductDetails.dimensions.height.currentObj.uom=== ProductDetails.dimensions.height.newObj.uom))
        var depthequal=((ProductDetails.dimensions.depth.currentObj.dimension=== ProductDetails.dimensions.depth.newObj.dimension))&&((ProductDetails.dimensions.depth.currentObj.uom=== ProductDetails.dimensions.depth.newObj.uom))
        var nameequal=(ProductDetails.product.currentName===ProductDetails.product.newName)

        var overrideobj=this.state.GS1overrideProductDetails
        // overrideobj[type].isUpdate=bool
        if(!depthequal){overrideobj.dimensions["depth"].isUpdate=bool}
        if(!heightequal){overrideobj.dimensions["height"].isUpdate=bool}
        if(!widthequal){overrideobj.dimensions["width"].isUpdate=bool}
        overrideobj.image.isUpdate=bool
        if(!nameequal){overrideobj.product.isUpdate=bool}
        if(overrideobj.brand.currentName===null){
            overrideobj.brand.isUpdate=bool
        }

    
        this.setState({GS1overrideProductDetails:overrideobj,isupdateAll:bool,isdimensionAll:(widthequal&&heightequal&&depthequal)?false:bool})

    }
    dateFormatDatePicker =(date)=>{
        const utcDate = new Date(date);
        const utcTime = utcDate.getTime();
        const istOffset = 5.5 * 60 * 60 * 1000;
        const istTime = utcTime + istOffset;
        const istDate = new Date(istTime);
        return istDate
    }
    loadRowDetails = (rowobj) => {
        
            this.setState({productdataloading:true});
            submitSets(submitCollection.findProdByID, ('?productId='+rowobj.id), true).then(res => {
                this.setState({productdataloading:false});
                if(res && res.status && res.extra){
                    var pobj = res.extra;
                    pobj.subCategoryId = (pobj.subCategoryId ? pobj.subCategoryId : 0);
                    pobj.brandId = (pobj.brandId ? pobj.brandId : 0);
                    pobj.blockUntilDate = (pobj.blockUntilDate ?this.dateFormatDatePicker(pobj.blockUntilDate): null)
                    this.props.setProdView(pobj);
                    this.setState({
                        sobj: pobj,
                    }, () => {
                        this.getUploadImage(this.state.sobj.imageId);
                    });
                    // this.props.setProdPrevDetails(this.exportPrevDetails(null));
                    
                    // this.props.history.push('/products/details');
                } else{
                    //
                }
            });
        
    }
    clickUpdateGsiOveride=()=>{
        let sobj = this.state.GS1overrideProductDetails;

        this.setState({ savemodalshow: true }, () => {
            submitSets(submitCollection.updateFromGs1ProductInfo, sobj, true).then(res => {
                this.setState({savemodalshow:false})
                if(res && res.status){
                    alertService.success(this.props.t("PRODUCT_DETAILS_SUCCESSFULLY_UPDATED"));
    
                    this.getAllBrands();
                    this.loadRowDetails(this.state.sobj);
                    
                    this.ClickGS1Override(false,"havechange");

                    if(this.props.isFromSimulation){
                        //resimulation
                        let warnprod = this.props.selectedwarningdropprod;
                        let rdx={ text: (warnprod?warnprod.barcode:this.props.productSearchText), warnProd: warnprod };
                        this.props.setSimulationNewProductSearchDetails(rdx);
                        this.props.getSimulationcall(true);
                    }
                    
                } else{
                    // alertService.error(res.extra?res.extra:this.props.t("erroroccurred"))
                }
            });
        });
    }
    handleKeyDown = (event) => {
        if(!(/[0-9/]/.test(event.key) || parseInt(event.keyCode) === 8  || parseInt(event.keyCode) === 37 || parseInt(event.keyCode) === 39)){
            event.preventDefault();
        }
    }
    checkHaveAffectedSimList=(id)=>{
        let sobj={
            productId:id
        }
        this.setState({loadingicon:true})
        submitSets(submitCollection.getProductSimulationSnapshotWarning, sobj, false).then(res => {
            if(res && res.status){
                this.setState({AffectedSimList:res.extra,loadingicon:false});
            }else{
                this.setState({loadingicon:false})
            }
            
             //remove this if call up
            //  let item=
            //     {simulationSnapshotId: 1164,
            //     departmentId: 817,
            //     departmentName: "non-alcoholic beverages",
            //     mpVersionName : "non-alcoholic beverages vmp 1",
            //     mpId: 
            //     701,storeName : "Test Store",fieldCount: 5,
            //     tags:[{tagId: 1, tagName: "Test tag"},{tagId: 1, tagName: "Test tag"},{tagId: 1, tagName: "Test tag"},{tagId: 1, tagName: "Test tag"}]
            // }
            
            // let list=[]
            // for (let i = 0; i < 4; i++) {
            //     list.push(item)
                
            // }
            // this.setState({AffectedSimList:list});
            //end
            
        });
    }
    render(){
        
        var thumbpreviews = (this.state.thumbpreviews?(this.state.thumbpreviews.map((titem, tidx) => {
            return <div key={tidx} className="thumb">
            <img src={titem.preview} className={this.state.sobj && this.state.sobj.width >= this.state.sobj.height?"img-resize-ver":"img-resize-hor"} onClick={() => this.handleTogglePreview(titem.preview, true)} alt="" />
        </div>
        })):<></>);

        var cuomlist = {anone:"-"};
        for (const key in uomList) {
            cuomlist[key] = this.props.t("uomlist."+key);
        }
        var {isShowAffectedModal,AffectedSimList}=this.state;

        let newShelfLifeEnums = Object.keys(shelfLifeEnums).map(xitem => this.props.t(xitem));
        let newPaceScaleEnums = Object.keys(paceScaleEnums).map(xitem => this.props.t(xitem));

        
        return (<>
            <Col xs={12} className={"main-content product-md-page "+(this.props.isRTL==="rtl"?"RTL":"LTR")+" "+(this.props.ismodal === true ? " is-modal ":"") } dir={this.props.isRTL}>
                {
                    this.props.ismodal === false ?
                        <Breadcrumb dir="ltr">
                            {this.props.isRTL==="rtl"?<>
                            <Breadcrumb.Item active>{this.props.t('PRODUCT_DETAILS')}</Breadcrumb.Item>
                            <li className="breadcrumb-item"><Link to="/products" onClick={() => this.backLinkSet("/products", true)} role="button">{this.props.t('products')}</Link></li>
                            <li className="breadcrumb-item"><Link to={"/"+this.props.HomePageVal} onClick={() => this.backLinkSet("/"+this.props.HomePageVal)} role="button">{this.props.t('home')}</Link></li>
                            </>:<>
                            <li className="breadcrumb-item"><Link to={"/"+this.props.HomePageVal} onClick={() => this.backLinkSet("/"+this.props.HomePageVal)} role="button">{this.props.t('home')}</Link></li>
                            <li className="breadcrumb-item"><Link to="/products" onClick={() => this.backLinkSet("/products", true)} role="button">{this.props.t('products')}</Link></li>
                            <Breadcrumb.Item active>{this.props.t('PRODUCT_DETAILS')}</Breadcrumb.Item>
                            </>}
                        </Breadcrumb>
                    :<></>
                }

                <Col xs={12} className=" additem-content" style={{background:"transparent",boxShadow:"none"}}>
                    <Col xs={12} md={this.props.ismodal === false ? 5 : 12} lg={this.props.ismodal === false ? 5 : 12} className="col-centered" style={{position:"relative"}}>
                    
                    {this.state.isedit && this.state.sobj.mpUsageStatus === "Archived"?<Badge bg='danger' className='archived-badge'>{this.props.t("ARCHIVE")}</Badge>:<></>}
                    {this.state.loadingicon?
                    <img className='simwarnIconLoading' src={loadinggif} style={{ height: "20px" }} alt="loading animation" />
                    :<></>}
                    <OverlayTrigger
                        overlay={
                            <Tooltip >
                            {this.props.t("Simulation_Affected_List")}
                            </Tooltip>
                        }
                        >
                         {AffectedSimList.length?<Button className='simwarnIcon' onClick={()=>this.handleAffectedSimulationModal()}><SimulationWarinIcon /></Button>:<></>}
                    </OverlayTrigger>
                    
                    <Tabs defaultActiveKey="info" id="uncontrolled-tab-example" className="mb-3 tasktab">
                        <Tab eventKey="info" title={this.props.t("product_info")}>
                            <Form className="formcontrol-main">
                                <>
                                <Col xs={12} className="form-subcontent">
                                    <Col xs={12} className="form-section">
                                        <Row>
                                            <Form.Group as={Col} xs={12}>
                                                <AcInput eleid="productnametxt" atype="text" aid="productName" adefval={this.state.sobj.productName} aobj={this.state.sobj} avset={this.state.vobj} arequired={true} avalidate={[ValT.empty]} aplace={this.props.t('productname')} achange={e => this.handleChangesAvailable()} showlabel={true} msg={this.props.t('Character.ProductName')} validateString={true}/>
                                            </Form.Group>
                                            {
                                                this.state.sobj.importName && (this.state.sobj.importStatus==="None" || this.state.sobj.importStatus==="ReferenceUpdatePending") ?
                                                    <div style={{marginTop:"-15px", marginBottom:"20px"}}>
                                                        <Badge bg="warning" pill>{this.props.t("CATELOG_IMP_NAME")} : {this.state.sobj.importName}</Badge>
                                                    </div>
                                                :<></>
                                            }
                                        </Row>
                                        <Row>
                                            <Form.Group as={Col} xs={6} className="brand-select-formgroup">
                                                <Form.Label style={{marginTop:"10px"}}>{this.props.t('subcategory')}</Form.Label>
                                                <Select id="subCategoryId" name="subCategoryId" placeholder={""} options={this.state.subcategorylist} onChange={(e) => this.changeDropDowns("subCategoryId",e.value)} value={this.state.subcategorylist.filter(option => option.value === this.state.sobj.subCategoryId)} className="filter-subcatlist" size="sm" classNamePrefix="searchselect-inner" maxMenuHeight={400} data-validation-type="subcategory" />
                                            </Form.Group>
                                            <Form.Group as={Col} xs={6} className="brand-select-formgroup">
                                                <Form.Label style={{marginTop:"10px"}}>{this.props.t('productbrand')}</Form.Label>
                                                <Select id="brandId" name="brandId" placeholder={""} options={this.state.brandlist} onChange={(e) => this.changeDropDowns("brandId",e.value)} value={this.state.brandlist.filter(option => option.value === this.state.sobj.brandId)} className="filter-brandlist" size="sm" classNamePrefix="searchselect-inner" maxMenuHeight={400} data-validation-type="brand" />
                                            </Form.Group>
                                        </Row>
                                    
                                    </Col>
                                   
                                    <Col xs={12} className="form-section">
                                        <h4>{this.props.t('scales')}</h4>
                                        <Row>
                                            <Form.Group as={Col} xs={5}>
                                                <AcInput atype="number" aid="width" aplace={this.props.t('width')} adefval={this.state.sobj.width} aobj={this.state.sobj} avset={this.state.vobj} avalidate={[ValT.empty,ValT.number]} achange={e => this.handleChangeDetails(e, "width")} showlabel={true} restrictDecimalPoint={3} removeSpecialCharacter={true} msg={this.props.t('Character.width')} />
                                            </Form.Group>
                                            <Col xs={2}></Col>
                                            <Form.Group as={Col} xs={5}>
                                                <AcInput atype="number" aid="height" aplace={this.props.t('height')} adefval={this.state.sobj.height} aobj={this.state.sobj} avset={this.state.vobj} avalidate={[ValT.empty,ValT.number]} achange={e => this.handleChangeDetails(e, "height")} showlabel={true} restrictDecimalPoint={3} removeSpecialCharacter={true} msg={this.props.t('Character.height')}/>
                                            </Form.Group>
                                        </Row>
                                        <Row>
                                            <Form.Group as={Col} xs={5}>
                                                <AcInput atype="number" aid="depth" aplace={this.props.t('depth')} adefval={this.state.sobj.depth} aobj={this.state.sobj} avset={this.state.vobj} avalidate={[ValT.empty,ValT.number]} achange={e => this.handleChangeDetails(e, "depth")} showlabel={true} restrictDecimalPoint={3} removeSpecialCharacter={true} msg={this.props.t('Character.depth')}/>
                                            </Form.Group>
                                            <Col xs={2}></Col>
                                            <Form.Group as={Col} xs={5}>
                                                <AcInput eleid="uomtxt" atype="select" aid="uom" aplace={this.props.t('uomeasure')} adefval={this.state.sobj.uom} adata={cuomlist} aobj={this.state.sobj} avset={this.state.vobj} avalidate={[ValT.empty]} achange={e => this.handleChangesAvailable()}/>
                                            </Form.Group>
                                        </Row>
                                        <Row>
                                            <Form.Group as={Col} xs={5}>
                                                <AcInput atype="number" aid="sensitivity" aplace={this.props.t('STORE_PRODUCTS')} adefval={this.state.sobj.sensitivity} aobj={this.state.sobj} avset={this.state.vobj} avalidate={[ValT.empty,ValT.number]} achange={e => this.handleChangeDetails(e, "sensitivity")} showlabel={true} restrictDecimalPoint={3} removeSpecialCharacter={true} msg={this.props.t('Character.sensitivity')}/>
                                            </Form.Group>
                                        </Row>
                                        
                                    </Col>
                                    

                                    <Col xs={12} className="form-section">
                                        <h4>{this.props.t('productdetails')}</h4>
                                        <Row>
                                            <Form.Group as={Col} xs={12}>
                                                <AcInput eleid="barcodetxt" atype="text" aid="barcode" aplace={this.props.t('barcode')} adefval={this.state.sobj.barcode} aobj={this.state.sobj} avset={this.state.vobj} avalidate={[ValT.empty]} arequired={true} showlabel={true} achange={e => this.handleChangesAvailable()} msg={this.props.t('Character.ProductBarocde')} validateString={true}/>
                                            </Form.Group>
                                        </Row>
                                        <Row>
                                            <Form.Group as={Col} xs={12}>
                                                <Form.Label>{this.props.t('img')}</Form.Label>
                                                <AcDropzone updatedImage={this.state.sobj.imagePath} acceptTypes={"image/png, image/jpeg, image/jpg, image/webp, image/avif"} handleDropImage={this.handleDropImages}/>
                                                <Col className="preview-thumbs"><aside>{thumbpreviews}</aside></Col>
                                            </Form.Group>
                                        </Row>

                                    </Col>
                                    
                                    <Col xs={12} className="form-section">
                                        <h4>{this.props.t('sourcedetails')}</h4>
                                        <Col xs={6} className='sourcecontent'>
                                            <small>{this.props.t('source')}</small>
                                            <label className='sourceview-badge'>{this.props.t("PROD_SOURCETYPES."+this.state.sobj.origin)}</label>
                                        </Col>
                                        {/* <Row>
                                            <Form.Group as={Col} xs={6}>
                                                <AcInput atype="select" aid="productSource" adefval={this.state.sobj.productSource} aplace={this.props.t('source')} adata={this.state.srcList} aobj={this.state.sobj} avset={this.state.vobj} avalidate={[ValT.empty]} achange={this.handleSourceView} disabled={true} />
                                            </Form.Group>
                                            <Form.Group as={Col} xs={6} style={{display:(this.state.sobj&&this.state.sobj.productSource&&this.state.sobj.productSource==="gs1"?"block":"none")}}>
                                                <AcInput atype="text" aid="gs1Code" adefval={this.state.sobj.gs1Code} aplace="GS1 Code" aobj={this.state.sobj} avset={this.state.vobj}/>
                                            </Form.Group>
                                        </Row> */}
                                    </Col>

                                    {this.state.sobj.fromProductLookup === true ?
                                        <Col xs={12} className="form-section">
                                            <Row>
                                                <Col xs={4} style={{paddingTop:"15px"}}>
                                                    <div className={"switch-main-div"}>
                                                        <label className="pure-material-switch" style={{ width: "100%" }}>
                                                            <input type="checkbox" checked={this.state.sobj.mpUsageStatus==="New"?true:false} onChange={(e) => this.handleSwitchmpUsageStatus()} />
                                                            <span> {this.props.t("SEND_TO_DEP")} </span>
                                                        </label>    
                                                    </div>    
                                                </Col>
                                            </Row>

                                        </Col>
                                    :<></>}
                                </Col>
                                </>
                            </Form>
                        </Tab>

                        <Tab eventKey="opt" title={this.props.t("product_options")}>
                            <Form className="formcontrol-main">
                                <Col xs={12} className="form-subcontent">
                                    <Col xs={12} className="form-section">
                                        <h4>{this.props.t("product_options")}</h4>
                                    
                                        <Col xs={12} style={{padding:"0px"}}>
                                            <ul className="list-inline switch-formitems">
                                                <li className='list-inline-item'>
                                                    <div className='content-dive'>
                                                        <TooltipWrapper text={this.props.t('isnoos')}>
                                                            <div className={"text-content "+(this.state.sobj.isNOOS?"active":"")} onClick={() => this.handleSwitchChanges(this.state.sobj.isNOOS,"isNOOS")}>
                                                            <div className="icon-view"><ProductOptionIcons icontype="noos" size={36} /></div>{this.props.t('isnoos')}</div>
                                                        </TooltipWrapper>
                                                    </div>
                                                </li>
                                                <li className='list-inline-item'>
                                                    <div className='content-dive'>
                                                        <div className={"text-content "+(this.state.sobj.isFavorite ?"active":"")} onClick={() => this.handleSwitchChanges(this.state.sobj.isFavorite,"isFavorite")}>
                                                        <div className="icon-view"><ProductOptionIcons icontype="favorite" size={36} /></div> {this.props.t('isfav')}</div>
                                                    </div>
                                                </li>
                                                <li className='list-inline-item'>
                                                    <div className='content-dive'>
                                                        <div className={"text-content "+(this.state.sobj.isPremium?"active":"")} onClick={() => this.handleSwitchChanges(this.state.sobj.isPremium,"isPremium")}>
                                                        <div className="icon-view"><ProductOptionIcons icontype="premium" size={36} /></div>{this.props.t('ispremium')}</div>
                                                    </div>
                                                </li>
                                                <li className='list-inline-item'>
                                                    <div className='content-dive'>
                                                        <div className={"text-content "+(this.state.sobj.isMandatory===true?"active":"")} onClick={() => this.handleSwitchChanges(this.state.sobj.isMandatory,"isMandatory")}>
                                                            <div className="icon-view"><ProductOptionIcons icontype="mandatory" size={36} /></div>
                                                            {this.props.t('IS_MANDATORY')}
                                                        </div>
                                                    </div>
                                                </li>
                                                <li className='list-inline-item'>
                                                    <div className='content-dive'>
                                                        <div className={"text-content "+(this.state.sobj.isStackable===true?"active":"")} onClick={() => this.handleSwitchChanges(this.state.sobj.isStackable,"isStackable")}>
                                                            <div className="icon-view"><ProductOptionIcons icontype="stackable" size={36} /></div>
                                                            {this.props.t('IS_stackable')}
                                                        </div>
                                                    </div>
                                                </li>
                                                <li className='list-inline-item'>
                                                    <div className='content-dive'>
                                                        <div className={"text-content "+(this.state.sobj.isBlock===true?"active":"")} onClick={() => this.handleSwitchChanges(this.state.sobj.isBlock,"isBlock")}>
                                                            <div className="icon-view"><ProductOptionIcons icontype="isBlock" size={36} /></div>
                                                            {this.props.t('IS_BLOCK')}
                                                        </div>
                                                    </div>
                                                </li>
                                                <li className='list-inline-item manualOverride'>
                                                    <div className='content-dive'>
                                                        <div className={"text-content "+(this.state.sobj.isManualAdded===true?"active":"")} onClick={() => this.handleSwitchChanges(this.state.sobj.isManualAdded,"isManualAdded")}>
                                                            <div className="icon-view"><ProductOptionIcons icontype="manualOverride" size={34} /></div>
                                                            {this.props.t('manualOverride')}
                                                        </div>
                                                    </div>
                                                </li>
                                                {this.state.sobj.isManualAdded?<>
                                                    <li className='list-inline-item'>
                                                        <div className='content-dive'>
                                                            <div className={"text-content "+(this.state.sobj.isMvp?"active":"")} onClick={() => this.handleSwitchChanges(this.state.sobj.isMvp,"isMvp")}>
                                                            <div className="icon-view"><ProductOptionIcons icontype="mvp" size={36} /></div> {this.props.t('ismvp')}</div>
                                                        </div>
                                                    </li>
                                                    <li className='list-inline-item'>
                                                        <div className='content-dive'>
                                                            <div className={"text-content "+(this.state.sobj.isOnTop?"active":"")} onClick={() => this.handleSwitchChanges(this.state.sobj.isOnTop,"isOnTop")}>
                                                            <div className="icon-view"><ProductOptionIcons icontype="ontop" size={36} /></div> {this.props.t('isontop')}</div>
                                                        </div>
                                                    </li>
                                                </>:<></>}
                                                <li className='list-inline-item'>
                                                    <div className='content-dive'>
                                                        <div className={"text-content "+(this.state.sobj.isUseProdMinRev===true?"active":"")} onClick={() => this.changeDropDowns("isUseProdMinRev", !this.state.sobj.isUseProdMinRev)}>
                                                            <div className="icon-view"><ProductOptionIcons icontype="minRevenue" size={34} /></div>
                                                            {this.props.t('USE_MINREV_IN_PRODLEVEL')}
                                                        </div>
                                                    </div>
                                                </li>
                                            </ul>
                                        </Col>

                                        <Col xs={12} style={{padding:"0px 5px"}}>
                                            <Row>
                                                <Form.Group as={Col} xs={6}>
                                                    <AcInput atype="number" aid="minQty" aplace={this.props.t('minqty')} adefval={this.state.sobj.minQty} aobj={this.state.sobj} avset={this.state.vobj} avalidate={[ValT.empty,ValT.number]} achange={e => this.handleChangeDetails(e, "minQty")}  showlabel={true}  restrictDecimalPoint={3} removeSpecialCharacter={true} msg ={this.props.t('Character.min_qty')}/>
                                                </Form.Group>

                                                <Form.Group as={Col} xs={6}>
                                                    <div className='form-inline multiitem-form' style={{width: "100%"}}>
                                                        <AcInput atype="number" aid="paceOfSalesInQty" aplace={this.props.t('paceOfSalesInQty')} adefval={this.state.sobj.paceOfSalesInQty} aobj={this.state.sobj} avset={this.state.vobj} avalidate={[ValT.empty,ValT.number]} achange={e => this.handleChangeDetails(e, "paceOfSalesInQty")} showlabel={true}  removeSpecialCharacter={true} msg ={this.props.t('Character.PaceofSale')} isFull={true} errorAlign={true}/>
                                                        <Form.Control className='measure-types-select' as="select" size="sm" value={this.state.sobj.shelveLifeUot} onChange={e => this.changeDropDowns("shelveLifeUot",e.target.value)} >
                                                            {newShelfLifeEnums.map(xitem => {
                                                                return <option key={xitem} value={xitem}>{xitem}</option>
                                                            })}
                                                        </Form.Control>    
                                                    </div>
                                                </Form.Group>

                                                <Form.Group as={Col} xs={6}>
                                                    <AcInput atype="number" aid="maxQty" aplace={this.props.t('maxqty')} adefval={this.state.sobj.maxQty} aobj={this.state.sobj} avset={this.state.vobj} avalidate={[ValT.empty,ValT.number]} achange={e => this.handleChangeDetails(e, "maxQty")} showlabel={true}  restrictDecimalPoint={3} removeSpecialCharacter={true} msg ={this.props.t('Character.max_qty')}/>
                                                </Form.Group>
                                                {/* <Form.Group as={Col} xs={6}>
                                                    <AcInput atype="number" aid="maxRevenue" aplace={this.props.t('maxrev')} adefval={this.state.sobj.maxRevenue} aobj={this.state.sobj} avset={this.state.vobj} avalidate={[ValT.empty,ValT.number]} achange={e => this.handleChangeDetails(e, "maxRevenue")} showlabel={true}  restrictDecimalPoint={3} removeSpecialCharacter={true} msg ={this.props.t('Character.max_rev')}/>
                                                </Form.Group> */}
                                                <Form.Group as={Col} xs={6}>
                                                    <div className='form-inline multiitem-form' style={{width: "100%"}}>
                                                        <AcInput atype="number" aid="shelvesLife" aplace={this.props.t('shelvelife')} adefval={this.state.sobj.shelvesLife} aobj={this.state.sobj} avset={this.state.vobj} avalidate={[ValT.empty,ValT.number]} achange={e => this.handleChangeDetails(e, "shelvesLife")} showlabel={true} removeSpecialCharacter={true} msg ={this.props.t('Character.ShelveLife')} isFull={true} errorAlign={true} />
                                                        <Form.Control className='measure-types-select' as="select" size="sm" value={this.state.sobj.paceOfSalesInQtyUot} onChange={e => this.changeDropDowns("paceOfSalesInQtyUot",e.target.value)}>
                                                            {newPaceScaleEnums.map((xitem) => {
                                                                return <option key={xitem} value={xitem}>{xitem}</option>
                                                            })}
                                                        </Form.Control>
                                                    </div>
                                                </Form.Group>
                                            
                                                <Form.Group as={Col} xs={6} style={{display:(this.state.sobj.isUseProdMinRev?"block":"none")}}>
                                                    <AcInput atype="number" aid="minRevenue" aplace={this.props.t('minrev')} adefval={this.state.sobj.minRevenue} aobj={this.state.sobj} avset={this.state.vobj} avalidate={[ValT.empty,ValT.number]} achange={e => this.handleChangeDetails(e, "minRevenue")} showlabel={true}/>
                                                </Form.Group>

                                                <Form.Group as={Col} xs={6} style={{display:(this.state.sobj.isStackable?"block":"none")}}>
                                                    <OverlayTrigger
                                                        overlay={
                                                            <Tooltip >
                                                            {this.props.t("Max_Stack_count_zero_or_empty_means_no_stack_count")}
                                                            </Tooltip>
                                                        }
                                                        >
                                                        <Button variant="secondary"  className='stackwarn-warn'><InfoIcon size={15} /></Button>
                                                    </OverlayTrigger>
                                                    <div style={{position: "relative"}}>
                                                        <AcInput atype="number" aid="maxStackableCount" aplace={this.props.t('maxstackablecount')} adefval={this.state.sobj.maxStackableCount} aobj={this.state.sobj} avset={this.state.vobj} avalidate={[ValT.empty,ValT.number]} achange={e => this.handleChangeDetails(e, "maxStackableCount")} showlabel={false} removeSpecialCharacter={true} isInt={true} msg={this.props.t('Character.StackableCount')} t={this.props.t}/>
                                                    </div>
                                                </Form.Group>

                                               {/* {this.state.sobj.isBlock && this.state.sobj.isStackable && <Col xs={2}></Col> }  */}

                                                <Form.Group as={Col} xs={6}  style={{display:(this.state.sobj.isBlock?"block":"none")}}>
                                                    <div className='blockUntilDate'>
                                                        <Col className="datetitle">
                                                            {this.props.t('BLOCK_UNTIL_DATE')}
                                                        </Col>
                                                        <Col
                                                            className="datebox"
                                                            style={{ position: 'relative' }}
                                                        >
                                                            <DatePicker
                                                                dateFormat="dd/MM/yyyy"
                                                                popperPlacement="bottom-start"
                                                                showYearDropdown
                                                                placeholderText="DD/MM/YYYY"
                                                                onChange={e => this.handleChangeDetails(e, "blockUntilDate")}
                                                                selected={this.state.sobj.blockUntilDate?new Date(this.state.sobj.blockUntilDate):null}
                                                                minDate={this.tomorrowDate()}
                                                                className="datepicker-txt"
                                                                onKeyDown={this.handleKeyDown}
                                                                
                                                            />
                                                            <InputGroup.Text className='calendar_Icon'>
                                                                <CalendarIcon size={12} />
                                                            </InputGroup.Text>
                                                        
                                                        </Col>
                                                    </div>
                                                </Form.Group>

                                                <Form.Group as={Col} xs={12} className="tags-section">
                                                    <h4>{this.props.t("tags")}</h4>

                                                    <ul className="list-inline right-list">
                                                        <li className="list-inline-item">
                                                            <Select id="tagDropdown" name="tagDropdown" placeholder={this.props.t("Select_tags")} menuPlacement={"auto"} options={this.state.tagslist} onChange={(e) => this.handleTagChange(e)} value={this.state.tagslist.filter(option => option.value === this.state.selectedTag.tagId)} className="filter-tagslist" size="sm" classNamePrefix="searchselect-inner" maxMenuHeight={200} data-validation-type="tags" />
                                                        </li>
                                                    </ul>
                                                    <Col xs={12} className="tagsdiv field">
                                                        <Row style={(this.props.isRTL === "rtl" ? { marginRight: "0px", width: "100%" } : { marginLeft: "0px", width: "100%" })}>
                                                            {this.state.adddedTags.map((tagitem, i) =>
                                                                tagitem.isDelete !== true ? 
                                                                <Col md={3} key={i} style={{padding:"2px"}}>
                                                                    <Col className={"tag-item sub-item" }>
                                                                        {tagitem.tagName}
                                                                        <span onClick={()=>this.removeTag(i)}><XIcon size={15} /></span>
                                                                    </Col>
                                                                </Col>
                                                                :<span key={i} className="d-none"></span>
                                                            )}
                                                        </Row>
                                                    </Col>
                                                </Form.Group>
                                            </Row>
                                        </Col>
                                    </Col>
                                    
                                </Col>
                            </Form>
                        </Tab>

                    </Tabs>
                    
                    <Col style={{margin:(this.props.ismodal===true ? "20px 0px 0px 0px" : "20px 0px 20px 0px")}}>
                        {this.props.ismodal === true ?
                            <Button onClick={()=>this.props.hidemodal(false)} variant="light" type="button">{this.props.t('btnnames.back')}</Button>
                        :
                            <Link to={this.state.isFromLog==="true" ? "/catelogueImport?isSavedLog=true": "/products"} onClick={() => this.backLinkSet((this.state.isFromLog==="true" ? "/catelogueImport?isSavedLog=true": "/products"), true)}><Button variant="light" type="button">{this.props.t('btnnames.back')}</Button></Link>
                        }

                        {this.state.isedit?<>
                            <span onClick={() =>(this.state.sobj.fromProductLookup===true ? this.handleConfirmationForSendToDep() : this.checkForSnapshotAvailability())}><AcButton avariant="success" eleid="updatebtn" aclass={"formview-btn "+(this.props.isRTL==="rtl"?"float-left":"float-right")} atype="button" disabled={this.state.saveLoading}>{this.props.t('btnnames.update')}</AcButton></span>
                            <AcButton eleid="deletebtn" avariant={this.state.sobj.fromProductLookup===true?"warning":"danger"} adelete={true} aconfirm={true} asubmit={submitCollection.deleteProds} aobj={this.state.sobj} avalidate={this.state.vobj} aclass={"formview-btn "+(this.props.isRTL==="rtl"?"float-left":"float-right")} atype="button" aresp={this.handleProdDelete} disabled={this.state.saveLoading}>{this.state.sobj.fromProductLookup===true? this.props.t('CANCEL') : this.props.t('btnnames.delete')}</AcButton>
                            
                            {this.state.sobj.mpUsageStatus === "Archived" ?
                                <span onClick={()=>this.restoreProduct()}><AcButton avariant="info" eleid="archivebtn" aclass={"formview-btn "+(this.props.isRTL==="rtl"?"float-left":"float-right")} atype="button" disabled={this.state.saveLoading}>{this.props.t("btnnames.restore")}</AcButton></span>
                            :
                                <span onClick={()=>this.archiveProduct()}><AcButton avariant="warning" eleid="archivebtn" aclass={"formview-btn "+(this.props.isRTL==="rtl"?"float-left":"float-right")} atype="button" disabled={this.state.saveLoading}>{this.props.t("ARCHIVE")}</AcButton></span>
                            }

                        <span onClick={()=>this.ClickGS1Override(true)}><AcButton avariant="info" eleid="archivebtn" aclass={"formview-btn gs1overidebtn "+(this.props.isRTL==="rtl"?"float-left":"float-right")} atype="button" >{this.props.t("GS1_Override")}</AcButton></span>    
                        
                        </>:<span onClick={() => this.handleGetUploadImage(1)}><AcButton eleid="savebtn" avariant="success" aclass={"formview-btn "+(this.props.isRTL==="rtl"?"float-left":"float-right")} atype="button" disabled={this.state.saveLoading}>{this.props.t('btnnames.save')}</AcButton></span>}
                    </Col>

                        
                    </Col>

                </Col>
                {isShowAffectedModal?<AffectedSimulationModal isRTL={this.props.isRTL} mpstate={this.props.mpstate} isShow={isShowAffectedModal} AffectedSimList={this.state.AffectedSimList} isShowHandle={this.handleAffectedSimulationModal} />:<></>}
            </Col>
            
            {this.state.snapshotAvailableModal === true ?
                <SnapshotWarning
                    t={this.props.t}
                    isRTL={this.props.isRTL}
                    snapshotAvailableModal={this.state.snapshotAvailableModal}
                    snapshotsList={this.state.snapshotsList}
                    handleSnapshotAvailabilityModalToggle={this.handleSnapshotAvailabilityModalToggle}
                    continueToUpdateFromSnashotWarning= {this.continueToUpdateFromSnashotWarning}
                />
            :<></>}

            {this.state.showPreviewImageModal===true ? 
                <PreviewImage 
                    productid={this.state.sobj.id ? this.state.sobj.id : null} 
                    loadfromback={this.state.imgloadfromback} 
                    imgurl={this.state.previewImg} 
                    isshow={this.state.showPreviewImageModal} 
                    isRTL={this.props.isRTL} 
                    handlePreviewModal={this.handlePreviewModal}
                    hideheaderlables={true}
                    />
            :<></>}
 
            <Modal size="lg" show={this.state.previewsrc} onHide={() => this.handleToggleCrop(null)} aria-labelledby="example-modal-sizes-title-lg" >
                <Modal.Body style={{minHeight:"calc(100vh - 200px)"}}>
                    <div className="FDimagecrop-box">
                    {this.state.previewsrc && (<ReactCrop className="crop-plan-image" style={{border:"1px solid #ccc"}}
                        src={this.state.previewsrc} crop={this.state.previewcrop} onImageLoaded={this.onImageLoaded}
                        ruleOfThirds onComplete={this.onCropComplete} onChange={this.onCropChange} /> )}
                    </div>
                </Modal.Body>
                <Modal.Footer>
                    <Button variant="warning" onClick={() => this.handleCropAndClose()}>Crop Image</Button>
                </Modal.Footer>
            </Modal>
            {this.state.isGS1Modal?
            <Gs1OverRideModal 
                ProductDetails={this.state.GS1overrideProductDetails} 
                barcode={this.state.sobj.barcode} 
                productName={this.state.sobj.productName}
                isShow={this.state.isGS1Modal} 
                isRTL={this.props.isRTL}
                isdimensionAll={this.state.isdimensionAll} 
                isupdateAll={this.state.isupdateAll} 
                handleChangeAllUpdate={this.handleChangeAllUpdate} 
                handleShow={this.ClickGS1Override}
                handleChangeProdAttr={this.handleChangeProdAttr} 
                handleChangeAlldimention={this.handleChangeAlldimention} 
                clickUpdateGsiOveride={this.clickUpdateGsiOveride}
                />
              :<></> }
            <AcViewModal showmodal={this.state.savemodalshow} />
        </>);
    }
}

const mapDispatchToProps = dispatch => ({
    setProdPrevDetails: (payload) => dispatch(viewSetProdPrevAction(payload)),
    setProdView: (payload) => dispatch(viewSetAction(payload)),
    setSimulationNewProductSearchDetails:(payload) => dispatch(SimulationNewProductSearchDetailsSetAction(payload)),
});

export default withTranslation()(withRouter(connect(null,mapDispatchToProps)(AddNewItemComponent)));
