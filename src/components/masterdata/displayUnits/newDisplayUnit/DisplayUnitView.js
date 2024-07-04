
import React, { Component } from 'react';
import { Link, withRouter } from 'react-router-dom';
import { connect } from "react-redux";
import { Col, Row, Form, Badge, Button, Tab, Nav, Modal, Accordion, FormSelect } from 'react-bootstrap';
import { XCircleFillIcon, PlusIcon } from '@primer/octicons-react';
import axios from 'axios';

import './NewDisplayUnit.scss';
import { uomList, floorAspectRatioDrawBox, roundOffDecimal, getCookie, restrictDecimalPoint ,maxInputLength, preventinputotherthannumbers, preventinputToString, numOfDecimalsLimit } from '../../../../_services/common.service';
import { alertService } from '../../../../_services/alert.service';
import { submitCollection } from '../../../../_services/submit.service';
import { submitSets } from '../../../UiComponents/SubmitSets';

import { viewSetPrevDunit } from '../../../../actions/dunit/dunit_action';

import { AcDropzone, AcViewModal } from '../../../UiComponents/AcImports';
import { confirmAlert } from 'react-confirm-alert';
import { withTranslation } from 'react-i18next';

let dheight; let dwidth;
/**
 * using to add/edit fields in masterdata/planogram layout view
 *
 * @class DisplayUnitView
 * @extends {Component}
 */
class DisplayUnitView extends Component {
    _isMounted = false;

    constructor(props) {
        super(props);
        this.displaydiv = React.createRef();
        this.state = {
            isedit: false,
            sobj: this.defaultObjectLoad(), savemodalshow: false,
            divWidth: 0, divHeight: 0,
            viewHeight: 0, viewWidth: 0,
            shelves: [], rects: [],
            toUploadImages: null,
            loadedFnamenumbers: [],
            showmultishelve: false, multislvobj: this.defaultMultiShelve(), //show multiple rows
            selectedStore: 0, showmodalall: true,
            defaultActiveKey: "key-1",

            prevpagedetails: null,
            errors:{},
            rowsErrosgap:{},
            rowsErrosHeight:{},
            multipleShelvesErrors:{},
            isUpdated: false,
        }

        this.rowsviewref = React.createRef();
    }

    componentDidMount() {
        this._isMounted = true;

        if(this._isMounted){
            if(this.props.selectedStore){
                this.setState({ selectedStore: this.props.selectedStore});
            } else if(getCookie("storeId")){
                this.setState({ selectedStore: parseInt(getCookie("storeId"))});
            }
            //check edit details available
            var cisedit = (this.props.dunitState&&this.props.dunitState.dunitDetails&&this.props.dunitState.dunitDetails.id>0?true:false);
            let prepagedetails = (this.props.dunitState && this.props.dunitState.dunitPrevDetails?this.props.dunitState.dunitPrevDetails:null);

            //convert dunit details
            let dunitDetails = (this.props.dunitState&&this.props.dunitState.dunitDetails?this.props.dunitState.dunitDetails:this.defaultObjectLoad());
            dunitDetails.width = (dunitDetails.width > 0?roundOffDecimal(dunitDetails.width,numOfDecimalsLimit):dunitDetails.width);
            dunitDetails.height = (dunitDetails.height > 0?roundOffDecimal(dunitDetails.height,numOfDecimalsLimit):dunitDetails.height);
            dunitDetails.depth = (dunitDetails.depth > 0?roundOffDecimal(dunitDetails.depth,numOfDecimalsLimit):dunitDetails.depth);

            for (let i = 0; i < dunitDetails.shelf.length; i++) {
                const shelfObj = dunitDetails.shelf[i];
                shelfObj.width = (shelfObj.width > 0?roundOffDecimal(shelfObj.width,numOfDecimalsLimit):shelfObj.width);
                shelfObj.height = (shelfObj.height > 0?roundOffDecimal(shelfObj.height,numOfDecimalsLimit):shelfObj.height);
                shelfObj.gap = (shelfObj.gap > 0?roundOffDecimal(shelfObj.gap,numOfDecimalsLimit):shelfObj.gap);
            }

            this.setState({
                divWidth: this.displaydiv.current.offsetWidth ,
                divHeight: (this.displaydiv.current.offsetHeight ),
                isedit: cisedit,
                sobj: (this.props.dunitState&&this.props.dunitState.dunitDetails?this.props.dunitState.dunitDetails:this.defaultObjectLoad()),
                prevpagedetails: prepagedetails,
            }, () => {
                this.calculateRate(true);
                if(this.state.sobj.imageId){
                    this.getUploadImage(this.state.sobj.imageId);
                }
            });
        }
    }

    componentWillUnmount(){
        this._isMounted = false;
    }
    //default save object
    defaultObjectLoad = () => {
        return {fieldName: "", width: 0, height: 0, depth:0, uom: "cm", imagePath: "", remark: "", shelf: []};
    }
    //onchange field width
    handlewidth(e) {
        var cobj = this.state.sobj;
        let decimalLimitCheck = restrictDecimalPoint(e.target.value,3)
        if(decimalLimitCheck){
            e.preventDefault()
            return
        }
        
        if(!preventinputotherthannumbers(e,e.target.value,this.props.t('Character.width'))){
            e.preventDefault()
            return
        }
        
        cobj["width"] = (e.target.value>-1? e.target.value : 0);
        //update shelve width (using same width for all shelves)
        if(cobj.shelf && cobj.shelf.length > 0){
            for (var i = 0; i < cobj.shelf.length; i++) {
                const cshelveitem = cobj.shelf[i];
                cshelveitem["width"] = cobj["width"];
            }
        }

        this.setState({ sobj: cobj, isUpdated: true }, () => {
            this.calculateRate(false,"width");
        });
    }
    //onchange field height
    handleheight(e) {
        let decimalLimitCheck = restrictDecimalPoint(e.target.value,3)
        if(decimalLimitCheck){
            e.preventDefault()
            return
        }
          
        if(!preventinputotherthannumbers(e,e.target.value,this.props.t('Character.height'))){
            e.preventDefault()
            return
        }
        var cobj = this.state.sobj;
        cobj["height"] = (e.target.value>-1?e.target.value:0);


        this.setState({ sobj: cobj, isUpdated: true }, () => {
            this.calculateRate(false,"height");
        });
    }
    //onchange field depth
    handledepth(e) {
        let decimalLimitCheck = restrictDecimalPoint(e.target.value,3)
        if(decimalLimitCheck){
            e.preventDefault()
            return
        }
        if(!preventinputotherthannumbers(e,e.target.value,this.props.t('Character.depth'))){
            e.preventDefault()
            return
        }
        var cobj = this.state.sobj;
        cobj["depth"] = (e.target.value>-1?e.target.value:0);

        this.setState({ sobj: cobj, isUpdated: true });
    }
    //onchange shelve width details
    handleShelfWidthChange = (idx) => (evt) => {
        let decimalLimitCheck = restrictDecimalPoint(evt.target.value,3)
        if(decimalLimitCheck){
            evt.preventDefault()
            return
        } 
              
        //validate shelve width
        const re = /^[0-9]*\.?[0-9]*$/;
        if (evt.target.value === '' || re.test(evt.target.value)) {
            if(this.state.sobj && Object.keys(this.state.sobj).length > 0){
                if(this.state.sobj.shelf){
                    var csobj = this.state.sobj;
                    const newshelves = csobj.shelf.map((shelf, sidx) => {
                        if (idx !== sidx) return shelf;
                        return { ...shelf, width: evt.target.value };
                    });
                    csobj["shelf"] = newshelves;

                    this.setState({ sobj: csobj, isUpdated: true }, () => {
                        //console.log(this.state.shelves);
                        this.drawRect();
                    });
                }
            }
        }
    }
    //onchange shelve height details
    handleShelfHeightChange = (evt,idx) => {
        let decimalLimitCheck = restrictDecimalPoint(evt.target.value,3)
        if(decimalLimitCheck){
            evt.preventDefault()
            return
        } 
        if(!preventinputotherthannumbers(evt,evt.target.value,this.props.t('Character.height'))){
            evt.preventDefault()
            return
        }
        //validate height value
        const re = /^[0-9]*\.?[0-9]*$/;
        if (evt.target.value === '' || re.test(evt.target.value)) {
            var cetxt = evt.target.value > -1?evt.target.value:0;
            var newshelves = [];
            var csobj = this.state.sobj;

            if(csobj && Object.keys(csobj).length > 0){
                if(csobj.shelf){
                    //check total heights
                    var cheighttotal = 0;
                    csobj.shelf.forEach((citem,cidx) => {
                        if(cidx === idx){
                            citem.height = (cetxt > -1?cetxt:0);
                        }
                        cheighttotal = cheighttotal + (citem.height + citem.gap);
                    });

                    //set values
                    newshelves = csobj.shelf.map((shelf, sidx) => {
                        if (idx !== sidx) return shelf;
                        return { ...shelf, height: (cetxt > -1?cetxt:0) };
                    });
                }
            }
            csobj["shelf"] = newshelves;
            this.setState({ sobj: csobj, isUpdated: true }, () => {
                this.drawRect();
                //console.log(this.state.shelves);
            });
        }
    }
    //onchange shelve gap details
    handleShelfSgapChange = (idx) => (evt) => {
        let decimalLimitCheck = restrictDecimalPoint(evt.target.value,3)
        if(decimalLimitCheck){
            evt.preventDefault()
            return
        } 
        if(!preventinputotherthannumbers(evt,evt.target.value,this.props.t('Character.shelve_gap'))){
            evt.preventDefault()
            return
        }
        //validate gap value
        const re = /^[0-9]*\.?[0-9]*$/;
        if (evt.target.value === '' || re.test(evt.target.value)) {
            var cetxt = evt.target.value > -1?evt.target.value:0;
            var csobj = this.state.sobj;
            var newshelves = [];
            if(csobj && Object.keys(csobj).length > 0){
                if(csobj.shelf){
                     //check total heights
                     var cheighttotal = 0;
                     csobj.shelf.forEach((citem,cidx) => {
                         if(cidx === idx){
                             citem.gap = (cetxt > -1?cetxt:0);
                         }
                         cheighttotal = cheighttotal + (citem.height + citem.gap);
                     });
                     //set values
                    newshelves = csobj.shelf.map((shelf, sidx) => {
                        if (idx !== sidx) return shelf;
                        return { ...shelf, gap: (cetxt > -1?cetxt:0) };
                    });
                }
            }
            csobj["shelf"] = newshelves;

            this.setState({ sobj: csobj, isUpdated: true }, () => {
                this.drawRect();
            });
        }
    }
    //set x,y,drawheight/drawgap of shelve to draw shelve in field
    drawRect() {
        var csobj = this.state.sobj;
        var cshelfs = [];
        if(csobj && Object.keys(csobj).length > 0){
            if (csobj.shelf) {
                cshelfs = (csobj.shelf?csobj.shelf:[]);
                var prevgap = 0;
                for (let i = 0; i < cshelfs.length; i++) {
                    const shelf = cshelfs[i];

                    let drawHeight = parseFloat(shelf.height);
                    let drawGap = parseFloat(shelf.gap);

                    var cheightval = (this.state.sobj.height?this.state.sobj.height:0);
                    shelf.drawWidth = this.state.viewWidth;
                    shelf.drawHeight = (drawHeight * this.state.viewHeight) / cheightval;
                    shelf.drawGap = (drawGap * this.state.viewHeight) / cheightval;

                    //pick x, y
                    shelf.x = 0;
                    shelf.y = prevgap;

                    prevgap = ((shelf.drawHeight + shelf.drawGap) + prevgap);
                    //set rank no
                    shelf.rank = (i+1);
                    //set reverse shelve number
                    var defslvno = (cshelfs.length - i);
                    shelf.reverseRowNumber = defslvno;

                    cshelfs[i] = shelf;
                }
                //console.log(cshelfs);
            }
        }
        csobj["shelf"] = cshelfs;
        this.setState({ sobj: csobj }, () => {
            //console.log(csobj);
        });
    }
    //add new shelve row
    handleAddshelf = (isshowmsg,isgenerate) => {
        var nextid = 1;
        var csobj = this.state.sobj;
        var cshelfs = [];
        //check uom details added correctly
        if(csobj && csobj.uom && csobj.uom !== ""){
            if (csobj.shelf) {
                var count = csobj.shelf.length + 1;
                nextid = count;
            }

            cshelfs = (csobj.shelf?csobj.shelf:[]);
            cshelfs.push({ id: -1, rank: nextid, width: csobj.width, height: (isgenerate?(csobj.height / 2):0), drawHeight: (isgenerate?(csobj.height / 2):0), drawWidth: csobj.width, gap: 0, x: 0, y: 0, uom: csobj.uom });

            csobj["shelf"] = cshelfs;
            this.setState({ sobj: csobj, isUpdated: true });
        } else{
            if(isshowmsg){
                alertService.error(this.props.t('FILL_MAIN_DETAILS_CORRECTLY_TO_CONTINUE_EX_WHU'));
            }
        }
    }
    //remove added shelve row from field
    handleRemoveshelf = (idx) => () => {
        var csobj = this.state.sobj;
        if(csobj && Object.keys(csobj).length > 0){
            var shelves = csobj.shelf.filter((s, sidx) => idx !== sidx);
            
            //recalculate rank number
            var nextid = 1;
            for (let index = 0; index < shelves.length; index++) {
                const element = shelves[index];
                element.rank = nextid + index;
                shelves[index] = element;
            }
            csobj["shelf"] = shelves;
            
            this.setState({ sobj: csobj, isUpdated: true }, () => {
                this.drawRect();
            });
        }
    }
    //calculate current save object width height ratio onchange values
    calculateRate(ismultiview,ctype) {
        if(this.state.sobj && Object.keys(this.state.sobj).length > 0){
            //get field dimention
            var dimention = floorAspectRatioDrawBox(parseFloat(this.state.sobj.width),parseFloat(this.state.sobj.height),this.state.divWidth,this.state.divHeight);
            //set div width/height from dimention
            dheight = dimention.dheight; 
            dwidth = dimention.dwidth;
            //if not edit and no shelves available add new row from half of field height 
            var csobj = this.state.sobj;
            if(!this.state.isedit && !ismultiview && csobj.shelf.length === 0){
                this.handleAddshelf(false,true);
            }

            this.setState({ viewHeight: dheight, viewWidth: dwidth }, () => {
                this.drawRect();
            });
        }
    }
    //onchange masterdata values. breadth or uom
    handlevchange = (evt, etype,msg) => {
        var cobj = this.state.sobj;
        if(etype === "fieldName"){
            if(!preventinputToString(evt,evt.target.value,msg)){
                evt.preventDefault()
                return
              }
        }
        cobj[etype] = evt.target.value;
        this.setState({sobj: cobj, isUpdated: true}, () => {
            if(etype === "uom"){
                this.calculateRate(false,etype);
            }
        });
    }
    //when drop or select image in dropzone add that image object to state
    handleDropImage = (resp) => {
        this.setState({
            toUploadImages: resp,
            isUpdated: true
        });
    }
    //upload image before save field details
    handleGetUploadImage = (type) => {
        console.log(type)
        if(type===2){
            if(!this.state.isUpdated){
                alertService.warn(this.props.t('NO_CHANGES_AVAILABLE'));
                return false;
            }
        }

        //check image available to upload
        var crespname = (this.state.toUploadImages&&this.state.toUploadImages.length>0?this.state.toUploadImages[0].name:"");
        var imgObj = {};
        imgObj.imageName = crespname;
        //if not delete and images available to upload
        if(type !== 3 && this.state.toUploadImages){
            this.setState({savemodalshow: true});
            submitSets(submitCollection.getImagePutURL, imgObj, true).then(res => {
                if(res && res.status){
                    this.handleUploadImage(this.state.toUploadImages[0],res.extra,type);
                } else{
                    if(type){ this.handleFieldSave(type); }
                }
            });
        } else{ //if no image available to upload
            //if type is delete
            if(type===3){
                confirmAlert({
                    title: this.props.t('CONFIRM_TO_DELETE_DUNIT'),
                    message: this.props.t('CONFIRM_TO_DELETE_DUNIT_MSG'),
                    overlayClassName: (this.props.isRTL==="rtl"?"alertrtl-content":""),
                    buttons: [{
                        label: this.props.t("btnnames.yes"),
                        onClick: () => {
                            this.handleFieldSave(type)
                        }
                    }, {
                        label: this.props.t("btnnames.no"),
                        onClick: () => {
                            return false;
                        }
                    }]
                });
            }else{this.handleFieldSave(type)}
        }
    }
    //upload selected field image
    handleUploadImage = (imgobj, urlobj, type) => {
        try {
            const coheaders = {"Content-Type": 'image/*'}; //set custom headers
            axios({url: urlobj.url,method: "PUT",data: imgobj,headers:coheaders}).then((res) => {
                if(res.status === 200){
                    var csobj = this.state.sobj;
                    csobj["imageId"] = urlobj.id;
                    this.setState({
                        sobj: csobj
                    });
                    if(type){ this.handleFieldSave(type); }
                } else{
                    if(type){ this.handleFieldSave(type); }
                }
            });
        } catch (error) {
            if(type){ this.handleFieldSave(type); }
        }
    }
    //get uploaded image from image id
    getUploadImage = (imgId) => {
        var imgObj = {};
        imgObj.id = imgId;

        submitSets(submitCollection.getImageGETURL, imgObj, true).then(res => {
            //console.log(res);
            if(res && res.status && res.extra){
                var csobj = this.state.sobj;
                csobj["imagePath"] = res.extra.url;
                this.setState({
                    sobj: csobj
                });
            }
        });
    }
    //save/update field details
    handleFieldSave = (type) => {
        //validate save object
        if(this.state.sobj){
            var csobj = JSON.parse(JSON.stringify(this.state.sobj));
            if(this.state.sobj.fieldName === ""){ //check field name
                alertService.error(this.props.t('DISPLAY_UNIT_NAME_REQUIRED'));
                this.setState({savemodalshow: false});
                return false;
            }
            if(this.state.sobj.width === "" || this.state.sobj.width === 0){ //check width
                alertService.error(this.props.t('DISPLAY_UNIT_WIDTH_REQUIRED'));
                this.setState({savemodalshow: false});
                return false;
            }
            if(this.state.sobj.height === "" || this.state.sobj.height === 0){ //check height
                alertService.error(this.props.t('DISPLAY_UNIT_HEIGHT_REQUIRED'));
                this.setState({savemodalshow: false});
                return false;
            }
            if(this.state.sobj.depth === "" || this.state.sobj.depth === 0){ //check depth
                alertService.error(this.props.t('DISPLAY_UNIT_DEPTH_REQUIRED'));
                this.setState({savemodalshow: false});
                return false;
            }
            if(this.state.sobj.uom === undefined || this.state.sobj.uom === "" || this.state.sobj.uom < 0){ //check uom
                alertService.error(this.props.t('DISPLAY_UNIT_UNIT_OF_MESURE_REQUIRED'));
                this.setState({savemodalshow: false});
                return false;
            }

            if(this.state.sobj.shelf === null || this.state.sobj.shelf.length === 0){ //check shelves added
                alertService.error(this.props.t('DISPLAY_UNIT_SHELVES'));
                this.setState({savemodalshow: false});
                return false;
            } else {
                var ciarr = [];
                for (var i = 0; i < this.state.sobj.shelf.length; i++) {
                    const citem = this.state.sobj.shelf[i];

                    //validate shelve height
                    if(citem.height === "" || citem.height <= 0){
                        alertService.error(this.props.t('SHELVE_HEIGHT_REQUIRED'));
                        this.setState({savemodalshow: false});
                        return false;
                    }
                    //validate shelve gap
                    if(citem.gap !== "" && citem.gap <= 0){
                        alertService.error(this.props.t('SHELVE_GAP_REQUIRED'));
                        this.setState({savemodalshow: false});
                        return false;
                    }

                    ciarr.push({ id: citem.id, rank: citem.rank, width: citem.width, height: citem.height, gap: citem.gap, x: citem.x, y: citem.y, uom: csobj.uom, reverseRowNumber: citem.reverseRowNumber });
                }
                csobj.shelf = ciarr;
            }
            //set save url save/edit/delete
            var savepath = (type === 3?submitCollection.deleteDisplayUnit:type === 2?submitCollection.updateDisplayUnit:submitCollection.saveDisplayUnit);
            //if not delete, validate total of shelve height and field height compare
            if(type !== 3){
                //current height
                var mheight = parseFloat(csobj.height);
                //define shelve height total
                var totShelfWidth = 0;
                var totShelefHeight = 0 ;
                //calculate total shelve height
                for (let p = 0; p < csobj.shelf.length; p++) {
                    totShelfWidth = totShelfWidth + parseFloat(csobj.shelf[p].width);
                    totShelefHeight = totShelefHeight + (parseFloat(csobj.shelf[p].height) + parseFloat(csobj.shelf[p].gap));
                }
                //check both heights
                if(mheight !== roundOffDecimal(totShelefHeight,10)){
                    alertService.error(this.props.t('HEIGHT_OF_SHELVES_DOESNT_MATCH_DISPLAY_UNIT_HEIGHT'));
                    this.setState({savemodalshow: false});
                    return false;
                }
            }
            //set store id
            csobj["storeId"] = this.state.selectedStore;

            submitSets(savepath, csobj, true).then(res => {
                //console.log(res);
                this.setState({savemodalshow: false});
                if(res && res.status){
                    alertService.success(this.props.t('DISPLAY_UNIT_SUCCESSFULLY')+" "+(type===3?this.props.t("DELETED"):type===2?this.props.t("updated"):this.props.t("saved")));
                    //check is main masterdata view or planogram layout view
                    if(this.props.ismdview){
                        let cprevdetails = this.state.prevpagedetails;
                        if(cprevdetails){
                            cprevdetails["viewtype"] = (type === 3?"delete":type === 2?"update":"new");
                            this.props.setPrevDetails(cprevdetails);
                        }
                        
                        this.props.history.push("/displayunits");
                    } else{
                        this.props.togglefieldmd();
                        this.props.getFieldsList();
                    }
                } else{
                    // alertService.error((res && !res.status && res.extra !== "")?res.extra:this.props.t('ERROR_OCCURRED_IN')+(type===3?"delete":type===2?"update":"save")+" process");
                    if(res && !res.status && res.validation){

                        let codeMessage = res.validation.code;

                        if(res.validation.msgParams && res.validation.msgParams.length > 0){
                            let filledMsg = codeMessage.replace(/\[\$\]/g, () => res.validation.msgParams.shift());
                            res.validation.type === "error" ? alertService.error(this.props.t(filledMsg)) : alertService.warn(this.props.t(filledMsg));
                        }else{
                            res.validation.type === "error" ? alertService.error(this.props.t(codeMessage)) : alertService.warn(this.props.t(codeMessage));
                        }

                    }else{
                        alertService.error(this.props.t('ERROR_OCCURRED_IN')+(type===3?"delete":type===2?"update":"save")+" process");
                    }
                }
            });
        }
    }
    //show multiple add modal
    showmultiplerows = () => {
        var cmultiobj = this.state.sobj;
        //validate save data before open modal
        //validate width
        if(cmultiobj.width === "" || parseFloat(cmultiobj.width) === 0){
            alertService.error(this.props.t('DISPLAY_UNIT_WIDTH_REQUIRED'));
            return false;
        }
        //validate depth
        if(cmultiobj.depth === "" || parseFloat(cmultiobj.depth) === 0){
            alertService.error(this.props.t('DISPLAY_UNIT_DEPTH_REQUIRED'));
            return false;
        }
        //validate uom
        if(cmultiobj.uom === undefined || cmultiobj.uom === "" || cmultiobj.uom < 0){
            alertService.error(this.props.t('DISPLAY_UNIT_UNIT_OF_MESURE_REQUIRED'));
            return false;
        }

        this.togglemultiplerows(true);
    }
    //toggle view multiple add modal
    togglemultiplerows = (isnotshowall) => {
        this.setState({ multislvobj: this.defaultMultiShelve(), showmultishelve: !this.state.showmultishelve, showmodalall: (isnotshowall?!isnotshowall:true) });
    }
    //default multiple shelve object
    defaultMultiShelve = () => {
        return {width: 0, height: 0, depth: 0, gap: 0, uom: -1, shelvecount: 1 };
    }
    //update multiple shelve object when changing values
    //cval - current changing value, ctype - object key
    handleChangeMultiView = (cval, ctype,e,msg) => {   
        if(ctype === "fieldName"){
            if(!preventinputToString(e,e.target.value,msg)){
                e.preventDefault()
                return
            }
        }
        if(ctype === "width" || ctype === "height" || ctype === "gap"  || ctype === "depth" ){
            let decimalLimitCheck = restrictDecimalPoint(cval,3)
            if(decimalLimitCheck){
                e.preventDefault()
                return
            }
            if(!preventinputotherthannumbers(e,e.target.value,msg)){
                e.preventDefault()
                return
            }
        }

        if(ctype === "shelvecount"){
            if(parseInt(cval) > 20){
                alertService.error(this.props.t('validation.shelve_count'))
                e.preventDefault()
                return
            }
      
        }
   
        var cmultiobj = this.state.multislvobj;
        if(ctype === "uom" || ctype==="shelvecount"){
            cmultiobj[ctype] = (ctype === "uom"?cval:ctype==="shelvecount"?cval ?cval:"":cval);
        }else{
  
            cmultiobj[ctype] = (cval?cval:"");
        }
  
        this.setState({ multislvobj: cmultiobj,isUpdated: true  });

    }
    //update multiple rows with save object
    addMultipleShelves = () => {
        //get current multiple row object and save object
        var cmultiobj = this.state.multislvobj;
        var cobj = this.state.sobj;
        //validate multiple object data before add
        //validate width
        if(cobj.width === "" || parseFloat(cobj.width) <= 0){
            alertService.error(this.props.t('DISPLAY_UNIT_WIDTH_REQUIRED'));
            this.setState({savemodalshow: false});
            return false;
        }
        //validate depth
        if(cobj.depth === "" || parseFloat(cobj.depth) <= 0){
            alertService.error(this.props.t('DISPLAY_UNIT_DEPTH_REQUIRED'));
            this.setState({savemodalshow: false});
            return false;
        }
        //validate shelve height
        if(cmultiobj.height === "" || parseFloat(cmultiobj.height) <= 0){
            alertService.error(this.props.t('SHELVE_HEIGHT_REQUIRED'));
            this.setState({savemodalshow: false});
            return false;
        }
        //validate shelve gap
        if(cmultiobj.gap !== "" && parseFloat(cmultiobj.gap) <= 0){
            alertService.error(this.props.t('SHELVE_GAP_REQUIRED'));
            this.setState({savemodalshow: false});
            return false;
        }
        //validate uom
        if(cobj.uom === undefined || cobj.uom === "" || cobj.uom < 0){
            alertService.error(this.props.t('DISPLAY_UNIT_UNIT_OF_MESURE_REQUIRED'));
            this.setState({savemodalshow: false});
            return false;
        }
        //validate needed shelve count
        if(cmultiobj.shelvecount === "" || parseInt(cmultiobj.shelvecount) <= 0){
            alertService.error(this.props.t('DISPLAY_UNIT_SHELVECOUNT_REQUIRED'));
            this.setState({savemodalshow: false});
            return false;
        }
        //set shelve list
        var shelvelist = (cobj.shelf && cobj.shelf.length > 0?cobj.shelf:[]);
        //remove first shelve if it's empty
        if(shelvelist && shelvelist.length === 1){
            if(shelvelist[0].height === 0 && shelvelist[0].gap === 0){
                shelvelist = [];
            }
        }
        //add multiple rows to current shelves list
        if(cmultiobj.shelvecount > 0){
            cmultiobj.gap = (!cmultiobj.gap || cmultiobj.gap === ""?0:cmultiobj.gap);
            for (var i = 0; i < cmultiobj.shelvecount; i++) {
                shelvelist.push({ id: -1, rank: (i+1), width: cobj.width, height: cmultiobj.height, gap: cmultiobj.gap, x: 0, y: 0, uom: cobj.uom });
            }
        }
        //calculate total height
        var totalheight = 0;
        for (let l = 0; l < shelvelist.length; l++) {
            totalheight = totalheight + ((shelvelist[l].height?parseFloat(shelvelist[l].height):0) + (shelvelist[l].gap>0?parseFloat(shelvelist[l].gap):0));
        }
        //set shelves and height
        cobj["shelf"] = shelvelist;
        cobj["height"] = roundOffDecimal(totalheight,2);
        //update state and close modal
        //console.log(cobj);
        this.setState({ sobj: cobj, isUpdated: true, multislvobj: this.defaultMultiShelve() }, () => {
            this.calculateRate(true);
            if(this.state.showmultishelve){
                this.togglemultiplerows();
            }
            if(this.rowsviewref){ this.rowsviewref.current.click(); }
        });
    }
    //handle tabs changes
    handleSelectTabs = (selectevent) => {
        this.setState({ defaultActiveKey: selectevent});
    }

    backLinkSet = (backpath, iscurrent) => {
        let cprevdetails = this.state.prevpagedetails;
        if(iscurrent && cprevdetails){
            let cprevdetails = this.state.prevpagedetails;
            cprevdetails["viewtype"] = "back";
            this.props.setPrevDetails(cprevdetails);
    
            this.props.history.push(backpath);
        }
    }

    validateField = (key,value) =>{
        let errorObj = this.state.errors
        let msg = ""
        if(value === "" || value.length === 0){
         msg = (this.props.t('fieldisrequired'))
                
        }
        errorObj[key] = msg; 
        this.setState({
            error:errorObj
        })
    }
   
    validateRowsField = (key,value,index) =>{
        let errorObj;
        let msg = ""
        if(value === "" || value.length === 0){
         msg = (this.props.t('fieldisrequired'))
        }
        
        if(key === "height"){
            errorObj = this.state.rowsErrosHeight
            errorObj[index] = msg; 
           
            this.setState({
                rowsErrosHeight:errorObj
            })
        }else{
            errorObj = this.state.rowsErrosgap
            errorObj[index] = msg; 
            this.setState({
                rowsErrosgap:errorObj
            })
        }
    }

    validateMultipleShelveField = (key,value) =>{
        let errorObj = this.state.errors
        let msg = ""
        if(value === "" || value.length === 0){
         msg = (this.props.t('fieldisrequired'))
                
        }
        errorObj[key] = msg; 
        this.setState({
            multipleShelvesErrors:errorObj
        })
    }

    render() {
        var cvlist = Object.keys(uomList).map(x => {
            return <option key={x} value={x}>{this.props.t("uomlist."+x)}</option>
        });
        //validate if width height filled?
        const enabled = this.state.viewWidth > 0 && this.state.viewHeight > 0;

        return (<>
            <Col>
                <Row>
                    <Col xs={12} md={4} className="formcontrol-main">
                        <Col className="form-subcontent d-unit" style={{minHeight:"auto",padding:"15px 10px"}}>
                            <Tab.Container transition={false} defaultActiveKey={this.state.defaultActiveKey}>
                                <Col>
                                    <Nav variant="pills" className="dunit-tabs" style={{display:"block"}}>
                                        <Nav.Item><Nav.Link eventKey="key-1">{this.props.t('details')}</Nav.Link></Nav.Item>
                                        <Nav.Item><Nav.Link eventKey="key-2" ref={this.rowsviewref}>{this.props.t('rows')}</Nav.Link></Nav.Item>
                                    </Nav>
                                </Col>
                                <Tab.Content>
                                    <Tab.Pane eventKey="key-1">
                                        {/* <Form.Group className="NDUgroup">
                                            <Form.Label >{this.props.t('dunitname')} <span style={{color:"red"}}>*</span></Form.Label>
                                            <Form.Control maxLength={maxInputLength} size="sm" type="text" required value={this.state.sobj.fieldName} onChange={(e) => this.handlevchange(e,"fieldName")} />
                                        </Form.Group> */}
                                        {/* <Form.Group  className="NDUgroup nocollapseinput">
                                            <AcInput eleid="fieldName" atype="text" aid="fieldName" adefval={this.state.sobj.fieldName} aobj={this.state.sobj} avset={{}} avalidate={[ValT.empty]} aplace={this.props.t('dunitname')} showlabel={true} arequired={true} onChange={(e) => this.handlevchange(e,"fieldName")}  /> */}
                                        {/* </Form.Group> */}
                                        <Form.Group className="NDUgroup">
                                            <Form.Label >{this.props.t('dunitname')} <span style={{color:"red"}}>*</span></Form.Label>
                                            <Form.Control  size="sm" type="text" required value={this.state.sobj.fieldName} onChange={(e) => this.handlevchange(e,"fieldName",(this.props.t('Character.unitName')))} onBlur={(e)=>this.validateField("fieldName",e.target.value)} onKeyDown={(e)=>preventinputToString(e,this.state.sobj.fieldName,(this.props.t('Character.unitName')))}/>
                                            <div className="errorMsg">{this.state.errors.fieldName}</div>  
                                        </Form.Group>
                                        <Row>
                                            <Col xs={6}>
                                                <Form.Group>
                                                    <Form.Label >{this.props.t('width')} <span style={{color:"red"}}>*</span></Form.Label>
                                                    <Form.Control  size="sm" type="text" value={this.state.sobj.width} onBlur={(e)=>this.validateField("width",e.target.value)}  onChange={(e) => this.handlewidth(e,this.props.t('Character.width'))} onKeyDown={(e)=>preventinputotherthannumbers(e,e.target.value,(this.props.t('Character.width')))}/>
                                                    <div className="errorMsg">{this.state.errors.width}</div>  
                                                </Form.Group>
                                            </Col>
                                            <Col xs={6}>
                                                <Form.Group>
                                                    <Form.Label >{this.props.t('height')} <span style={{color:"red"}}>*</span></Form.Label>
                                                    <Form.Control  size="sm" type="text" value={this.state.sobj.height} onBlur={(e)=>this.validateField("height",e.target.value)}  onChange={(e) => this.handleheight(e,this.props.t('Character.height'))} onKeyDown={(e)=>preventinputotherthannumbers(e,this.state.sobj.height,(this.props.t('Character.height')))} />
                                                    {/* <Form.Control size="sm" type="text" value={this.state.displaywidth}  />
                                                    <Form.Control size="sm" type="text" value={this.state.displayheight}  /> */}
                                                    <div className="errorMsg">{this.state.errors.height}</div>  
                                                </Form.Group>
                                            </Col>
                                            <Col xs={6}>
                                                <Form.Group>
                                                    <Form.Label >{this.props.t('depth')} <span style={{color:"red"}}>*</span></Form.Label>
                                                    <Form.Control  maxLength={maxInputLength} size="sm" type="text" value={this.state.sobj.depth} onBlur={(e)=>this.validateField("depth",e.target.value)}  onChange={(e) => this.handledepth(e,this.props.t('Character.depth'))} onKeyDown={(e)=>preventinputotherthannumbers(e,this.state.sobj.depth,(this.props.t('Character.depth')))}/>
                                                    <div className="errorMsg">{this.state.errors.depth}</div>  
                                                </Form.Group>
                                            </Col>
                                            <Col xs={6}>
                                                <Form.Group>
                                                    <Form.Label >{this.props.t('uomeasure')} <span style={{color:"red"}}>*</span></Form.Label>
                                                    <FormSelect value={this.state.sobj.uom} onChange={(e) => this.handlevchange(e,"uom")}>
                                                        <option value="-1">{this.props.t("SELECT")}</option>
                                                        {cvlist}
                                                    </FormSelect>
                                                </Form.Group>
                                            </Col>
                                            <Col xs={12} style={{"marginTop":"7px"}}>
                                                <Accordion className="multirows-accordian" defaultActiveKey={null}>
                                                    <Accordion.Item eventKey="0">
                                                        <Accordion.Header>
                                                            <Accordion.Button  variant="link" eventKey="0">{this.props.t("multipleshelves")}</Accordion.Button>
                                                        </Accordion.Header>
                                                        {/* <Accordion.Collapse > */}
                                                            <Accordion.Body>
                                                                <Row>
                                                                    <Col>
                                                                        <Form.Group>
                                                                            <Form.Label>{this.props.t('s_height')}</Form.Label>
                                                                            <Form.Control type="text" value={this.state.multislvobj.height} onChange={e => this.handleChangeMultiView(e.target.value,"height",e,this.props.t('Character.shelve_height'))}  onKeyDown={(e)=>preventinputotherthannumbers(e,this.state.multislvobj.height,(this.props.t('Character.shelve_height')))} />
                                                                        </Form.Group>  
                                                                    </Col> 
                                                                    <Col>
                                                                        <Form.Group>
                                                                            <Form.Label>{this.props.t('s_gap')}</Form.Label>
                                                                            <Form.Control type="text" value={this.state.multislvobj.gap} onChange={e => this.handleChangeMultiView(e.target.value,"gap",e,this.props.t('Character.shelve_gap'))} onKeyDown={ (evt) => preventinputotherthannumbers(evt,this.state.multislvobj.gap,(this.props.t('Character.shelve_gap'))) } />
                                                                        </Form.Group> 
                                                                    </Col> 
                                                                </Row>
                                                                <Form.Group className="multiform-group">
                                                                    <Form.Label>{this.props.t('neededshelves')}</Form.Label>
                                                                    <Form.Control size="sm" type="text" value={this.state.multislvobj.shelvecount} onChange={e => this.handleChangeMultiView(e.target.value,"shelvecount",this.props.t('Character.shelve_count'))} style={{width:"45%",padding:"5px ​10px"}} onKeyDown={ (evt) => preventinputotherthannumbers(evt,this.state.multislvobj.shelvecount,(this.props.t('Character.shelve_count'))) } />
                                                                    <Button variant="info" type="button" className={this.props.isRTL==="rtl"?"float-left":"float-right"} style={(this.props.isRTL==="rtl"?{marginRight:"5px",marginTop:"-30px"}:{marginLeft:"5px",marginTop:"-30px"})} size="sm" onClick={() => this.addMultipleShelves()}><PlusIcon size={12}/> {this.props.t('multiplerows')}</Button>
                                                                </Form.Group>
                                                            </Accordion.Body>
                                                        {/* </Accordion.Collapse> */}
                                                    </Accordion.Item>
                                                </Accordion>
                                                
                                            </Col>
                                        </Row>
                                        <Form.Group>
                                            <Form.Label >{this.props.t('img')}</Form.Label>
                                            <AcDropzone showPreviews={true} updatedImage={(this.state.sobj.imagePath!==""?this.state.sobj.imagePath:false)} handleDropImage={this.handleDropImage} acceptTypes={"image/png, image/jpeg, image/jpg, image/webp, image/avif"} />
                                            <small style={{color: "orange", fontSize: "11px", fontWeight: "600"}}>{this.props.t('addimgtorec')}</small>
                                        </Form.Group>
                                    </Tab.Pane>
                                    <Tab.Pane eventKey="key-2">
                                        <div className="NDUrowHieghts" style={{display:"block"}}>
                                            <span> {this.props.t('rowheights')}</span>
                                            <Button variant="info" type="button" className={this.props.isRTL==="rtl"?"float-left":"float-right"} style={(this.props.isRTL==="rtl"?{marginRight:"5px"}:{marginLeft:"5px"})} size="sm" onClick={() => this.showmultiplerows()}><PlusIcon size={12}/> {this.props.t('multiplerows')}</Button>
                                            <Button variant="warning" disabled={!enabled} className={this.props.isRTL==="rtl"?"float-left":"float-right"} type="button" size="sm" onClick={() => this.handleAddshelf(true,false)}><PlusIcon size={12}/> {this.props.t('newrow')}</Button>
                                        </div>

                                        {this.state.sobj&& this.state.sobj.shelf && this.state.sobj.shelf.length > 0?<>
                                            <Row style={{width: "100%", margin: "0px"}}>
                                                <Col xs={2} style={{padding:"0px"}}></Col>
                                                <Col xs={3} style={{padding:"0px"}}><Badge bg="light" style={{ color: "#142a33" }}>{this.props.t('width')}</Badge></Col>
                                                <Col xs={3} style={{padding:"0px"}}><Badge bg="light" style={{ color: "#142a33" }}>{this.props.t('height')}</Badge></Col>
                                                <Col xs={3} style={{padding:"0px"}}><Badge bg="light" style={{ color: "#142a33" }}>{this.props.t('s_gap')}</Badge></Col>
                                                <Col xs={1}></Col>
                                            </Row>

                                            {this.state.sobj.shelf.map((shelf, idx) => (
                                                <div key={idx} className="NDUrackparams" style={{position:"relative"}}>
                                                    <Row className="NDUshelfdetails">
                                                        <Col xs={2} style={{padding:"0px", fontSize:"12px",paddingTop:"11px",paddingLeft:"8px"}} className="NDUrowname">{this.props.t('row')} {shelf.reverseRowNumber}:</Col>
                                                        <Col xs={3} style={{padding:"0px 5px"}}>
                                                            <Form.Control maxLength={maxInputLength} type="text" value={shelf.width} disabled
                                                            onChange={this.handleShelfWidthChange(idx)} style={{padding:"3px 8px"}}/>
                                                        </Col>
                                                        <Col xs={3} style={{padding:"0px 5px"}}>
                                                            <Form.Control maxLength={maxInputLength} type="text" value={shelf.height}
                                                            onChange={e => this.handleShelfHeightChange(e,idx)} onBlur={(e)=>this.validateRowsField('height',e.target.value,idx)} onKeyDown={(e)=> preventinputotherthannumbers(e,e.target.value,(this.props.t('Character.height')))}/>
                                                            <div className="errorMsg">{this.state.rowsErrosHeight[idx]}</div>  
                                                        </Col>
                                                        <Col xs={3} style={{padding:"0px 5px"}}>
                                                            <Form.Control maxLength={maxInputLength} type="text" value={shelf.gap}
                                                            onChange={this.handleShelfSgapChange(idx)} onBlur={(e)=>this.validateRowsField('gap',e.target.value,idx)} onKeyDown={(e)=> preventinputotherthannumbers(e,e.target.value,(this.props.t('Character.shelve_gap')))}/>
                                                                 <div className="errorMsg">{this.state.rowsErrosgap[idx]}</div>  
                                                        </Col>
                                                        <Col className="rowremovediv"><label className="removerow-link" onClick={this.handleRemoveshelf(idx)} style={{marginTop:"3px",right:"10px"}}><XCircleFillIcon /></label></Col>
                                                    </Row>
                                                </div>
                                            ))}

                                        </>:<></>}
                                    </Tab.Pane>    
                                </Tab.Content>
                            </Tab.Container>
                        </Col>

                        {this.props.ismdview?<Link to="/displayunits" onClick={() => this.backLinkSet("/displayunits", true)}><Button variant="light" type="button">{this.props.t('btnnames.back')}</Button></Link>
                        :<><Button variant="light" type="button" onClick={this.props.togglefieldmd}>{this.props.t('btnnames.close')}</Button></>}
                        {this.state.isedit?<>
                            <Button variant="success" className={"formview-btn "+(this.props.isRTL==="rtl"?"float-left":"float-right")} type="button" onClick={() => this.handleGetUploadImage(2)}>{this.props.t('btnnames.update')}</Button>
                            <Button variant="danger" className={"formview-btn "+(this.props.isRTL==="rtl"?"float-left":"float-right")} type="button" onClick={() => this.handleGetUploadImage(3)} style={(this.props.isRTL==="rtl"?{marginLeft:"10px"}:{marginRight:"10px"})}>{this.props.t('btnnames.delete')}</Button>

                        </>:<Button variant="success" className={"formview-btn "+(this.props.isRTL==="rtl"?"float-left":"float-right")} type="button" onClick={() => this.handleGetUploadImage(1)}>{this.props.t('btnnames.save')}</Button>}

                    </Col>
                    <Col xs={12} md={8}>
                        <div className="NDUstructureNheight">
                        <Row>
                            <Col md={12} style={{overflowX:"scroll"}}>
                                <span>{this.props.t('rowstructure')}</span>
                                <div className="NDUrowStructuredraw" ref={this.displaydiv} style={{minHeight:this.props.minHeight}}>
                                    {dheight > 0 &&
                                    <svg width={this.state.viewWidth+3} height={this.state.viewHeight+3} style={{ border: 'solid', borderRadius: 1, borderWidth:0.5, borderColor: (this.props.dmode?'#2CC990':'#5128a0') }} >
                                        {this.state.sobj&&this.state.sobj.shelf&&this.state.sobj.shelf.length>0?(this.state.sobj.shelf.map((shelf, i) => {
                                            return <g key={i}>{shelf.drawHeight > 0?<>
                                                <rect width={shelf.drawWidth} height={shelf.drawHeight} x={shelf.x} y={shelf.y} id={shelf.id} style={{strokeWidth: 2,stroke: (this.props.dmode?'#2CC990':'#5128a0'),fill: (this.props.dmode?'#2f353e':'#ffffff')}} />
                                                {shelf.reverseRowNumber&&shelf.reverseRowNumber!==""?<text x={this.props.isRTL==="rtl"?((shelf.x+shelf.drawWidth) - 10):(shelf.x + 10)} y={(shelf.y + 25)} fontSize="18" fill="#ccc">{this.props.t('shelveD')}{shelf.reverseRowNumber}</text>:<></>}
                                                <rect width={shelf.drawWidth} height={shelf.drawGap} x={shelf.x} y={shelf.y+(shelf.drawHeight?shelf.drawHeight:0)} style={{strokeWidth: 2,stroke: (this.props.dmode?'#2CC990':'#5128a0'),fill: (this.props.dmode?'#2CC990':'#5128a0')}}></rect>
                                            </>:<></>}
                                        </g>})):<></>}
                                    </svg>}
                                </div>

                            </Col>

                        </Row>
                        </div>
                    </Col>
                </Row>
            </Col>

            <AcViewModal showmodal={this.state.savemodalshow} />
            
            <Modal show={this.state.showmultishelve} dir={this.props.isRTL} centered animation={false} onHide={() => this.togglemultiplerows()} className={"fieldmultirows-modal "+(this.props.isRTL==="rtl"?"RTL":"")} backdrop="static" keyboard={false} >
                <Modal.Header>
                    <Modal.Title>{this.props.t("multipleshelves")}</Modal.Title>
                </Modal.Header>
                <Modal.Body className='m-shelves'>
                    <Row className={this.state.showmodalall?"":"d-none"}>
                        <Col>
                            <Form.Group>
                                <Form.Label style={{fontWeight:"600",color:"#5128a0",fontSize:"14px",textTransform:"uppercase"}}>{this.props.t('length')}</Form.Label>
                                <Form.Control type="text" onBlur={(e)=>this.validateMultipleShelveField("width",e.target.value)} value={this.state.multislvobj.width} onChange={e => this.handleChangeMultiView(e.target.value,"width",e,this.props.t('Character.length'))} style={{fontWeight:"600"}} onKeyDown={ (evt) => preventinputotherthannumbers(evt,this.state.multislvobj.width,(this.props.t('Character.length'))) } />
                                <div className="errorMsg">{this.state.multipleShelvesErrors.width}</div>  
                            </Form.Group>  
                        </Col> 
                        <Col>
                            <Form.Group>
                                <Form.Label style={{fontWeight:"600",color:"#5128a0",fontSize:"14px",textTransform:"uppercase"}}>{this.props.t('breadth')}</Form.Label>
                                <Form.Control type="text" onBlur={(e)=>this.validateMultipleShelveField("depth",e.target.value)} value={this.state.multislvobj.depth} onChange={e => this.handleChangeMultiView(e.target.value,"depth",e,this.props.t('Character.Breadth'))} style={{fontWeight:"600"}} onKeyDown={ (evt) => preventinputotherthannumbers(evt,this.state.multislvobj.depth,(this.props.t('Character.Breadth'))) } />
                                <div className="errorMsg">{this.state.multipleShelvesErrors.depth}</div>  
                            </Form.Group>  
                        </Col> 
                    </Row>
                    <Row>
                        <Col>
                            <Form.Group>
                                <Form.Label style={{fontWeight:"600",color:"#5128a0",fontSize:"14px",textTransform:"uppercase"}}>{this.props.t('s_height')}</Form.Label>
                                <Form.Control type="text" onBlur={(e)=>this.validateMultipleShelveField("height",e.target.value)} value={this.state.multislvobj.height} onChange={e => this.handleChangeMultiView(e.target.value,"height",e,this.props.t('Character.shelve_height'))} style={{fontWeight:"600"}} onKeyDown={ (evt) => preventinputotherthannumbers(evt,this.state.multislvobj.height,(this.props.t('Character.shelve_height'))) } />
                                <div className="errorMsg">{this.state.multipleShelvesErrors.height}</div>                  
                            </Form.Group>  
                        </Col> 
                        <Col>
                            <Form.Group>
                                <Form.Label style={{fontWeight:"600",color:"#5128a0",fontSize:"14px",textTransform:"uppercase"}}>{this.props.t('s_gap')}</Form.Label>
                                <Form.Control type="text" onBlur={(e)=>this.validateMultipleShelveField("sgap",e.target.value)} value={this.state.multislvobj.gap} onChange={e => this.handleChangeMultiView(e.target.value,"gap",e,this.props.t('Character.shelve_gap'))} style={{fontWeight:"600"}} onKeyDown={ (evt) => preventinputotherthannumbers(evt,this.state.multislvobj.gap,(this.props.t('Character.shelve_gap'))) } />
                                <div className="errorMsg">{this.state.multipleShelvesErrors.sgap}</div>                  
                            </Form.Group> 
                        </Col> 
                    </Row>
                    <Row>
                        <Col className={this.state.showmodalall?"":"d-none"}>
                            <Form.Group>
                                <Form.Label style={{fontWeight:"600",color:"#5128a0",fontSize:"14px",textTransform:"uppercase"}}>{this.props.t('uom')}</Form.Label>
                                <FormSelect value={this.state.multislvobj.uom} onChange={e => this.handleChangeMultiView(e.target.value,"uom")} style={{fontWeight:"600"}} onKeyDown={ (evt) => (evt.key === 'e'||evt.key === '.') && evt.preventDefault() }>
                                    <option value="-1">Select</option>
                                    {cvlist}
                                </FormSelect>
                            </Form.Group>  
                        </Col> 
                        <Col xs={6}>
                            <Form.Group>
                                <Form.Label style={{fontWeight:"600",color:"#5128a0",fontSize:"14px",textTransform:"uppercase"}}>{this.props.t('neededshelves')}</Form.Label>
                                <Form.Control  type="text" onBlur={(e)=>this.validateMultipleShelveField("shelvecount",e.target.value)} value={this.state.multislvobj.shelvecount} onChange={e => this.handleChangeMultiView(e.target.value,"shelvecount",e)} style={{fontWeight:"600"}} onKeyDown={(evt) => evt.key === "." ? evt.preventDefault(): preventinputotherthannumbers(evt,this.state.multislvobj.shelvecount,(this.props.t('Character.shelve_count')))  } />
                                <div className="errorMsg">{this.state.multipleShelvesErrors.shelvecount}</div>                 
                            </Form.Group>  
                        </Col> 
                    </Row>
                </Modal.Body>
                <Modal.Footer>
                    <Button variant="danger" size="sm" style={{borderRadius:"25px"}} onClick={this.addMultipleShelves}>{this.props.t("btnnames.update")}</Button>
                    <Button variant="outline-secondary" size="sm" onClick={() => this.togglemultiplerows()} style={{borderRadius:"25px"}}>{this.props.t("btnnames.close")}</Button>
                </Modal.Footer>
            </Modal>
            </>
        )
    }
}

const mapDispatchToProps = dispatch => ({
    setPrevDetails: (payload) => dispatch(viewSetPrevDunit(payload)),
});

export default withTranslation()(withRouter(connect(null,mapDispatchToProps)(DisplayUnitView)));
