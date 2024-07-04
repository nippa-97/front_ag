import React from 'react';
import { Link, withRouter } from 'react-router-dom';
import {Col, Breadcrumb, Row, Button, Form, Modal } from 'react-bootstrap';
import { ChevronLeftIcon, EyeClosedIcon, EyeIcon } from '@primer/octicons-react';
import FeatherIcon from 'feather-icons-react';
import { confirmAlert } from 'react-confirm-alert';
import moment from 'moment';
import Lightbox from "react-awesome-lightbox";

import "react-awesome-lightbox/build/style.css";

import {  withTranslation } from "react-i18next";
import "../../../../_translations/i18n";

import ComplansChangestable from './complansChangestable';
import { submitSets } from '../../../UiComponents/SubmitSets';
import { submitCollection } from '../../../../_services/submit.service';
import { alertService } from '../../../../_services/alert.service';
import { aspectRatio } from '../../../../_services/common.service';
import { AcViewModal } from '../../../UiComponents/AcImports';

import { ComplianceStatus, COMPLIANCE_CHANGE_TYPE } from '../../../../enums/manualComplanceEnums';

import ActiveDisplayUnitView from './activedisplayunitview';
import SvgPreview from './svgpreview';

import './mcdetails.css';

export class MCDetailsComponent extends React.Component{
    _isMounted = false;
    bctimeout; //timeout object
    constructor(props){
        super(props);

        this.displaydiv = React.createRef(); //main preview div

        this.state = {
            chainDetails: null,
            visibleNo:true,
            remarkText:"",
            redoModel:false,
            showComplied:true,
            productList:[],
            addingProductList:[],
            fieldId:null, fieldNumber:null,
            allowcompliedcheck:true,
            isComplied:false,
            imageloading:false,
            loading:false,
            isEdit:false,
            selectedAiImg:null,
            aiImages:[],
            ComplienceDetails:null,
            rectsets: [],
            isedit: false,
            sobj: this.defaultObjectLoad(),
            uploadToggle: false,
            statusslected:"",
            isviewvmenu: false, viewmenu: { xpos: 0, ypos: 0, item: null },
            divWidth: 0,
            isShowLightboxImage: false,
            
        }
    }

    componentDidMount(){
        this._isMounted = true;

        if(this._isMounted){
            // console.log(this.props.signedobj);
            this.setState({
                // chainDetails: (this.props.signedobj && this.props.signedobj.signinDetails?this.props.signedobj.signinDetails.chain:null),
                divWidth: (this.displaydiv.current && this.displaydiv.current.offsetWidth?(this.displaydiv.current.offsetWidth - 50):0),
            }, () => {
                this.loadComplienceDetails();
            });
        }
        //console.log(this.props.manualComplianceState.manualComplianceId);
    }

    componentWillUnmount(){
        this._isMounted = false;
    }
    //default object
    defaultObjectLoad = () => {
        return {};
    }
    //load removing products
    // getproductList=()=>{
    //     let psobj = { 
    //         chainId: this.state.chainDetails?this.state.chainDetails.chainId:-1,
    //         search: this.state.removesearchtText, 
    //         isReqPagination: true, 
    //         startIndex: 0,
    //         maxResult: 10, isReqCount: true,
    //     };
    //     submitSets(submitCollection.getSearchableProducts, psobj, true).then(res => {
    //         if(res && res.status ){
                
    //             var options = []
    //             var prodlist = res.extra.length>0?res.extra:[];
    //             for (let i = 0; i < prodlist.length; i++) {
    //                 const subele = prodlist[i];
    //                 options.push({ value: subele.productName, barcode:subele.barcode, label: subele.productName, id:subele.id });
    //             }
    //             this.setState({ productList:options,isLoadingremovesearch:false });
    //         }else{
    //             alertService.error(this.props.t('ERROR_OCCURRED'))
    //             this.setState({ isLoadingremovesearch:false });
    //         }
    //     })

    //     // if(this.props.prodState && this.props.prodState.prodAiList){
    //     //     const cdetails = this.state.ComplienceDetails;
           
    //     //     var options = []
    //     //     var prodlist = this.props.prodState.prodAiList;
    //     //     console.log(prodlist);
    //     //     prodlist.forEach(ele => {
    //     //         if(cdetails.chain.chainId === ele.chainId){
    //     //             ele.products.forEach(subele => {
    //     //                 options.push({ value: subele.productName, barcode:subele.barcode, label: subele.productName, id:subele.id });
    //     //             })
    //     //         }
    //     //     });
    //     //     this.setState({ productList:options },()=>{
    //     //         console.log(this.state.productList);
    //     //     });
    //     // }
    // }
    //load adding products
    getAddingproductList=()=>{
         var checkid = "?floorLayoutHasAisleFieldId="+this.state.fieldId;
        var savepath = submitCollection.findProductListByFloorLayoutHasAisleField;
        submitSets(savepath, checkid, true).then(res => {
            //console.log(res);
            if(res && res.status ){
                var options = []
                var array=res.extra
                array.forEach(ele => {
                    options.push({ value: ele.productName,barcode:ele.barcode, label: ele.productName,id:ele.id }) 
                });
                this.setState({addingProductList:options},()=>{
                    //console.log(this.state.addingProductList,this.state.fieldId);
                })
            }
            else{
                alertService.error(this.props.t("PRODUCTS_NOT_LOADED"))
            }
        }) 
        
    }
    //load loadComplienceDetails
    loadComplienceDetails=()=>{
        this.setState({ imageloading: true }, () => {
            var checkid = "?complienceId="+this.props.manualComplianceState.manualComplianceId;
            var savepath = submitCollection.singleComplienceDetails;
            submitSets(savepath, checkid, true).then(res => {
            
                //console.log(res);
                if(res && res.status ){
                this.setState({ComplienceDetails:res.extra,
                    aiImages:this.setRectsetfromback(res.extra.ai_images),
                    isEdit:res.extra.status==="pending"?false:true,
                    fieldId:res.extra.fieldDto.fieldId,
                    showComplied:res.extra.status===ComplianceStatus.NOT_COMPILED?false:true,
                    statusslected:res.extra.status,
                    chainDetails:res.extra.chain,
                    fieldNumber:res.extra.fieldDto.fieldNo,
                    

                },()=>{
                    // this.getproductList();
                    this.getAddingproductList();
                    // console.log(this.state.aiImages);
                    // var ratiopiker=this.pickRatios()
                this.setState({
                    selectedAiImg:res.extra.ai_images[0]
                        // ratio: ratiopiker.ratio,
                        // imageSize: ratiopiker.imageSize,
                        
                    },()=>{
                        //console.log(this.state.selectedAiImg);
                    this.setState({ rectsets:res.extra.ai_images[0].changes},()=>{
                        //console.log(this.state.rectsets);
                    })
                    })
                    //console.log(this.state.ComplienceDetails);
                })
                } else{
                    alertService.error(this.props.t('ERROR_OCCURRED'));
                }
            });
        });
        
    }

    //fix came dealer from back end
    setRectsetfromback=(data)=>{
        var listdata=[]
        data.forEach(ele => {
            var rationimgsize=this.pickRatios(ele.imageWidth,ele.imageHeight);
            
            let imageratio = (rationimgsize?rationimgsize.ratio:0);
            let imagesize = (rationimgsize?rationimgsize.imageSize:null);
            
            ele.ratio = imageratio;
            ele.imageSize = imagesize;
            if(ele.changes.length > 0){
                ele.changes.forEach(element => {
                    var oX=element.x;
                    var oY=element.y;
                    var oWidth = element.width;
                    var oHeight = element.height;

                    element.x=(oX * imageratio) + (imagesize?imagesize.drawX:0);
                    element.y=(oY * imageratio) + (imagesize?imagesize.drawY:0);
                    element.ratioX = oX;
                    element.ratioY = oY;
                    element.width = (oWidth) * imageratio;
                    element.height = (oHeight) * imageratio;
                    element.ratioWidth = oWidth;
                    element.ratioHeight = oHeight;
                    // listdata.push(element)
                });
            }
            // console.log(ele);
            listdata.push(ele)
        });
        
        
           
        // }
        return listdata
    }
    //toggle upload view
    handleUploadToggle = () => {
        this.setState({ uploadToggle: !this.state.uploadToggle });
    }
    setRects=(rects)=>{
        this.setState({rectsets: rects},()=>{
            this.updaterectNo()
            //console.log(this.state.rectsets);
        })
    }
    //chnage number update
    updaterectNo= ()=>{
        var creactlist = this.state.rectsets;
        var showcomplied=true;
        if(creactlist.length>0){
            showcomplied=false
            for (let i = 0; i < creactlist.length; i++) {
                const ele = creactlist[i];
                ele.changeNo=i+1   
            }
            this.setState({rectsets: creactlist},()=>{
                //console.log(this.state.rectsets);
                this.setselectedimagenAiimgarray();
            })
        }  
        this.setState({showComplied:showcomplied})
    }
    // set rects to slected obj and ai images array
    setselectedimagenAiimgarray=()=>{
        var selected_obj=this.state.selectedAiImg
        selected_obj.changes=this.state.rectsets
        this.setState({selectedAiImg:selected_obj},()=>{
            // console.log(this.state.selectedAiImg.aiImageId);
            // //set selected obj to array
            // var c_aiimgs=this.state.aiImages
            // var olist=c_aiimgs.filter(x=>x.aiImageId!==this.state.selectedAiImg.aiImageId);
            // olist.push(this.state.selectedAiImg)
            // this.setState({aiImages:olist},()=>{
            //     console.log(this.state.aiImages);
            // })
           
        })
    }
    //back to manual colance listStyle: 
    backBtnHandle=()=>{
        this.props.history.push("/manualcompliance");
    }
    //svg thumb chnge handle
    changeSvgThumb = (i_id) => {
        if(this.state.selectedAiImg.aiImageId!==i_id){
            var imagearray=this.state.aiImages
        var obj=imagearray.find(x=>x.aiImageId===i_id);
        //console.log(obj);
        this.setState({selectedAiImg:obj,rectsets:obj.changes,imageloading:true},()=>{
            // var ratiopiker=this.pickRatios(this.state.selectedAiImg.imageWidth,this.state.selectedAiImg.imageHeight)
            // this.setState({
            //     ratio: ratiopiker.ratio,
            //     imageSize: ratiopiker.imageSize})
        })
        }
    }
    //image load stop
    imageloadFalse = () => {
        this.setState({imageloading:false})
    }
    //set ratio to svg
    pickRatios = (imgWidth,imgheight) => {
      //console.log("calling pick ratio");
        var imageWidth = imgWidth
        var imageHeight = imgheight

        var drawingBoardWidth = this.state.divWidth;
        var drawingBoardHeight = 450;

        var imageSize = {
            drawWidth : 0,
            drawHeight : 0,
            drawX : 0,
            drawY : 0

        }

        if (imageWidth > 0 && imageHeight > 0 && drawingBoardWidth > 0 && drawingBoardHeight > 0) {
            var ratio = aspectRatio(imageWidth, imageHeight, drawingBoardWidth, drawingBoardHeight)

            imageSize.drawWidth = imageWidth * ratio
            imageSize.drawHeight = imageHeight * ratio

            var adjustmentX = 0
            if (imageSize.drawWidth < drawingBoardWidth) {
                adjustmentX = (drawingBoardWidth - imageSize.drawWidth) / 2
            }

            var adjustmentY = 0
            if (imageSize.drawHeight < drawingBoardHeight) {
                adjustmentY = (drawingBoardHeight - imageSize.drawHeight) / 2
            }

            imageSize.drawX = adjustmentX
            imageSize.drawY = adjustmentY

            return { ratio: ratio,imageSize: imageSize}
            // this.setState({
            //     ratio: ratio,
            //     imageSize: imageSize
            // }, () => {
            //     // this.addInitialAiValues()
            // })
        }
    }
    clickUpdate=()=>{
        var obj={};
        var ccomplienceId=this.props.manualComplianceState.manualComplianceId
        var caiImages= JSON.parse(JSON.stringify(this.state.aiImages))
        caiImages.forEach(image => {
            var changesnewarray=[]
            var cchanges=image.changes
            for (let i = 0; i < cchanges.length; i++) {
                const change = cchanges[i];
                var cchange={
                    changeId: change.changeId,
                    changeNo: change.changeNo,
                    changeDesc: change.changeDesc,
                    changeType: change.changeType,
                    productId:change.productId,
                    width: change.ratioWidth,
                    height: change.ratioHeight,
                    x: change.ratioX,
                    y: change.ratioY,
                    color: change.color,
                }
                changesnewarray.push(cchange)
            }
            image.changes=changesnewarray

        });
        var setStatus=this.StatusbeforeUpdate(caiImages)
        //set obj to save
        obj={
            complienceId:ccomplienceId,
            ai_images:caiImages,
            status:setStatus
        }
        //console.log(obj);
        //call updatecall
        if(setStatus!==""){
            confirmAlert({
                title: this.props.t("CONFIRM_TO_UPDATE"),
                message: this.props.t("SURETO_CONTINUE"),
                overlayClassName: (this.props.isRTL === "rtl" ? "alertrtl-content" : ""),
                buttons: [{
                    label: this.props.t("btnnames.yes"),
                    onClick: () => {
                        this.updateBackCalltTrigger(obj);                  
                    }
                }, {
                    label: this.props.t("btnnames.no")
                    
                }],
            })

            
        }else{
            alertService.error(this.props.t("PLEASE_TAKE_ACTION_BEFORE_UPDATE"))
        }
               
    }
    StatusbeforeUpdate=(imges)=>{
        var status=""
        var havechanges=imges.find(x=>x.changes.length>0);
        if(havechanges){
            status=ComplianceStatus.NOT_COMPILED
        }else{
            if(this.state.isComplied){
                status=ComplianceStatus.COMPLIED
            }

        }
        //console.log(this.state.isComplied);
        return status
    }
    //back call updateComplience
    updateBackCalltTrigger=(obj)=>{
        this.setState({loading:true},()=>{
            submitSets(submitCollection.updateComplience, obj, true).then(res => {
                if (res && res.status) {
                    this.setState({loading:false});
                    this.props.history.push("/manualcompliance");
                    alertService.success(this.props.t("MANUAL_COMPLANCE_SUBMITTED"))
                }
                else{
                    this.setState({loading:false});
                    alertService.error(this.props.t("MANUAL_COMPLANCE_FAIL"))
                }
            })
        })
        
        // updateComplience

    }
    //click on changes in table
    handleChanges=(img,selected,idx)=>{
        var allow=true
        var CchangeTypes=img.changeType
        for (let i = 0; i < CchangeTypes.length; i++) {
            const ele = CchangeTypes[i];
            if(ele.changeType ===selected){
                allow=false
                break
            }
            
        }
       
        if(allow){
        //can add change ype
        var cselectedAiImg=this.state.selectedAiImg
        CchangeTypes.push({changeType:selected});
        cselectedAiImg.changes[idx].changeType=CchangeTypes
        //setting color: 
        cselectedAiImg.changes[idx].color=this.pickPriorityColor(CchangeTypes)
        this.setState({selectedAiImg:cselectedAiImg},()=>{
            // console.log(this.state.selectedAiImg);
        })
        }else{
            //remove change type
            var HcselectedAiImg=this.state.selectedAiImg
            var flterd=CchangeTypes.filter(x=>x.changeType!==selected);
            //console.log(flterd);
            HcselectedAiImg.changes[idx].changeType=flterd
             //setting color: 
             HcselectedAiImg.changes[idx].color=this.pickPriorityColor(flterd)
            this.setState({selectedAiImg:HcselectedAiImg})
        }
    }
    //priorty color: 
    pickPriorityColor = (changeTypes) =>{
        var item_order = ["remove","add","move","rotate"];
        if(changeTypes){
            changeTypes.sort((a, b) => item_order.indexOf(a.changeType) - item_order.indexOf(b.changeType));
        }

        var color = "#dc3545";
        if(changeTypes.length > 0){
            if(changeTypes[0].changeType === "remove"){
                color = 'red';
            }else if(changeTypes[0].changeType === "add"){
                color = 'green';
            }else if(changeTypes[0].changeType === "move"){
                color = 'orange';
            }else if(changeTypes[0].changeType === "rotate"){
                color = 'blue';
            }
        }
        
        return color;
    }
    handleDescription=(img,evt,idx)=>{
        var cselectedAiImg=this.state.selectedAiImg
        cselectedAiImg.changes[idx].changeDesc=evt.target.value
        this.setState({selectedAiImg:cselectedAiImg})
    }
    
    //add removing products to changes
    handleRemoveProductChange=(img,evt,idx)=>{
        var cselectedAiImg = this.state.selectedAiImg;
        var ochnges = JSON.parse(JSON.stringify(cselectedAiImg.changes[idx].changeType));

        //uncomment this to add multiple removing items
        var findaddarray = ochnges.find(x=>x.changeType === COMPLIANCE_CHANGE_TYPE.Remove);
        var oldproducts = (findaddarray&&findaddarray.products)?findaddarray.products:[];
        var olddesctxt = (oldproducts && oldproducts.length > 0?(oldproducts[0].description?oldproducts[0].description:""):"");

        if(olddesctxt !== ""){
            this.updateChangeDesc(idx,olddesctxt,"remove");
        }
        
        //end
         var cproducts=[]
        //setting object
        var cobj={
            productId:evt.id,
            productName:evt.value,
            barcode:evt.barcode,
        }
        var alreadyin=cproducts.find(y=>y.productId===evt.id)
        if(!alreadyin){cproducts.push(cobj);}else{
            alertService.warn(this.props.t("ALREADY_ADDED"))
        }
        //find remove
        var ctypes=cselectedAiImg.changes[idx].changeType
        for (let i = 0; i < ctypes.length; i++) {
            const ele = ctypes[i];
            if(ele.changeType===COMPLIANCE_CHANGE_TYPE.Remove){
                ele.products=cproducts
                break;
            }
            
        }
        this.setState({selectedAiImg:cselectedAiImg},()=>{
            // console.log(this.state.selectedAiImg);
            this.getDescriptionObj(cobj.productId,idx,cobj.productName);
        })
    }
    //get description details from back end
    getDescriptionObj=(pid,idx,product)=>{
        var obj={
            productId : pid,
            complianceId : this.props.manualComplianceState.manualComplianceId
        }
        submitSets(submitCollection.getProductUsageInShelfFromProduct, obj, true).then(res => {
            if (res && res.status) {
                //console.log(res.extra);
                if(res.extra&&res.extra.length>0){
                    this.setDescriptionText(idx,res.extra[0],product,"add")
                } else{
                    this.setDescriptionText(idx,res.extra[0],product,"remove")
                }
            }else{
                alertService.error(this.props.t("erroroccurred"))
            }
        })
    }
    //description text creating
    setDescriptionText=(idx,res,product,type)=>{
        var cselectedAiImg=this.state.selectedAiImg
         //find changetype
         var ctypes=cselectedAiImg.changes[idx].changeType;
         var oldtxt = "";

         var newtext="";
         if(type === "add"){
             newtext="This "+product+" product Should be actually in \nDepartment: "+res.departmentName+"\nField No: "+res.floorFieldNo+"\nShelf No: "+res.shelfNo
         }
         
         for (let i = 0; i < ctypes.length; i++) {
             const ele = ctypes[i];
             if(ele.changeType===COMPLIANCE_CHANGE_TYPE.Remove){
                 if(ele.products[0].description){
                    oldtxt = JSON.parse(JSON.stringify(ele.products[0].description));
                 }
                 if(type === "add"){
                    ele.products[0]["description"]=newtext;
                 }
                 break;
             }
         }

         this.setState({
            selectedAiImg: cselectedAiImg,
         }, () => {
            this.updateChangeDesc(idx,oldtxt,"remove");
            if(type === "add"){
                this.updateChangeDesc(idx,newtext,"add");
            }
         });
        // alert(string);
       
    }
    updateChangeDesc = (idx,newtext,type) => {
        //console.log(idx,newtext,type);
        var cselectedAiImg=this.state.selectedAiImg;

        var desctxt = cselectedAiImg.changes[idx].changeDesc;
        //console.log(desctxt);
         if(type === "add"){
            desctxt = (desctxt+(desctxt !== ""?", ":"")+newtext);
         } else{
            desctxt = desctxt.replace(newtext,"");
            desctxt = desctxt.replace(", ","");
         }
         
         cselectedAiImg.changes[idx].changeDesc = desctxt;

         this.setState({
             selectedAiImg: cselectedAiImg,
         });
    }
    //adding products to changes
    handleProductChange=(img,evt,idx)=>{
        var cselectedAiImg=this.state.selectedAiImg
        var ochnges=JSON.parse(JSON.stringify(cselectedAiImg.changes[idx].changeType));
        var findaddarray=ochnges.find(x=>x.changeType===COMPLIANCE_CHANGE_TYPE.Add);
        var cproducts=(findaddarray&&findaddarray.products)?findaddarray.products:[]
        //setting object
        var cobj={
            productId:evt.id,
            productName:evt.value,
            barcode:evt.barcode,
        }
        var alreadyin=cproducts.find(y=>y.productId===evt.id)
        if(!alreadyin){cproducts.push(cobj);}else{
            alertService.warn(this.props.t("ALREADY_ADDED"))
        }
        //find add
        var ctypes=cselectedAiImg.changes[idx].changeType
        for (let i = 0; i < ctypes.length; i++) {
            const ele = ctypes[i];
            if(ele.changeType===COMPLIANCE_CHANGE_TYPE.Add){
                ele.products=cproducts
                break;
            }
        }
        this.setState({selectedAiImg:cselectedAiImg},()=>{
        })
    }
    //remove prosucts from changes
    removeProductsChanges=(chngNo,item,type,idx)=>{
       var slected=this.state.selectedAiImg;
       var newtext = "";
       for (let i = 0; i < slected.changes.length; i++) {
           const chng = slected.changes[i];
           if(chng.changeNo===chngNo){
               for (let t = 0; t <  chng.changeType.length; t++) {
                   const chngtype =  chng.changeType[t];
                   var filterdpro=[]
                   if(type==="add"){
                    if(chngtype.changeType===COMPLIANCE_CHANGE_TYPE.Add){
                        filterdpro=chngtype.products.filter(x=>x.productId!==item.productId);
                       chngtype.products=filterdpro
                       break
                     }
                   }
                   if(type==="remove"){
                    if(chngtype.changeType===COMPLIANCE_CHANGE_TYPE.Remove){
                        var oridetails=chngtype.products.find(x=>x.productId===item.productId);
                        newtext = (oridetails && oridetails.description?oridetails.description:"");

                        filterdpro=chngtype.products.filter(x=>x.productId!==item.productId);
                        chngtype.products=filterdpro;
                        break;
                     }
                   }
                  
               }
            break
           }
       }
       this.setState({selectedAiImg:slected},()=>{
           if(type==="remove"){
                this.updateChangeDesc(idx,newtext,"remove");
           }
        })
    }
    //delete change from table
    deleteChange=(img,evt,idx)=>{
        //console.log("dsad");
        var cselectedAiImg=this.state.selectedAiImg
        var callrects =  cselectedAiImg.changes;
        callrects.splice(idx,1);
        this.setRects(callrects)
    }
    // complied click
    clickComplied=()=>{
        this.setState({isComplied:!this.state.isComplied})
    }
    handleredoModal=()=>{
        this.setState({redoModel:!this.state.redoModel})
    }
    //redo request when complance not clear for ai user
    handleRedoRequest=()=>{
        if(this.state.remarkText===""){
            alertService.error(this.props.t("PLEASE_ADD_REMARK"))
        }else{
            this.sendRedoRequestcall()
        }
        
       
    }
    sendRedoRequestcall=()=>{
        var obj={
            complienceId : this.props.manualComplianceState.manualComplianceId,
            remark : this.state.remarkText
        }
        this.setState({loading:true},()=>{
            submitSets(submitCollection.redoRequestComplience, obj, true).then(res => {
                if (res && res.status) {
                    this.setState({loading:false,redoModel:false});
                    this.props.history.push("/manualcompliance");
                    alertService.success(this.props.t("SUCCESSFULLY_REDO_REQUESTED"));
                }
                else{
                    this.setState({loading:false});
                    alertService.error(this.props.t("REDO_REQUESTED_FAIL"))
                }
            })
        }) 
    }
    //status show
    showStatus=(status)=>{
        if(status===ComplianceStatus.REDO_REQUESTED){
            return <label className='cstatus orange' style={{color:"#DF7612",fontSize:"20px"}}>Redo Requested</label>
        }
        if(status===ComplianceStatus.COMPLIED){
            return <label className='cstatus green' style={{color:"green",fontSize:"20px"}}>Complied</label>
        }
        if(status===ComplianceStatus.NOT_COMPILED){
            return <label className='cstatus red' style={{color:"red",fontSize:"20px"}}>Not Complied</label>
        } else{
            return <label className='cstatus' style={{fontSize:"20px"}}>Pending</label>
        }
// return status
    }
    //handel add remarke
    handleRedoRemark=(e)=>{
        this.setState({remarkText:e.target.value})
    }
    //hide and visibble bumber on review
    visibleNumbers=()=>{
        this.setState({visibleNo:!this.state.visibleNo})
    }

    //viewProduct details show
    viewProdOnClick = (e,prod,isclose) =>{
        var scrolledheight = document.documentElement.scrollTop;

        if(isclose){
            this.setState({
                viewmenu: { xpos: 0, ypos: 0, item: null },
                isviewvmenu: false
            });
        } else{
            this.setState({
                viewmenu: { xpos:(e.nativeEvent.x + 5), ypos: (e.nativeEvent.y + scrolledheight), item: prod },
                isviewvmenu: !this.state.isviewvmenu
            });    
        }
    }

    //lightbox selected image
    zoomHandle = () => {
        this.setState({ isShowLightboxImage: !this.state.isShowLightboxImage });
    }
    // handleremovesearch=(e)=>{
    //     if(this.bctimeout){clearTimeout(this.bctimeout);} //clear timeout setted before

    //     this.bctimeout = setTimeout(() => {
    //         this.setState({removesearchtText:e.target.value,isLoadingremovesearch:true},()=>{
    //             this.getproductList();
    //         })
    //     }, 1000);
        
        
    // }
    
    render(){
        return (<>
            <Col xs={12} className={"main-content "+(this.props.isRTL==="rtl"?"RTL":"")} dir={this.props.isRTL}>
                <Row>
                  <Col xs={12}>
                    <Breadcrumb dir="ltr">
                        {this.props.isRTL==="rtl"?<>
                        <Breadcrumb.Item active>{this.props.t('details')}</Breadcrumb.Item>
                        <li className="breadcrumb-item"><Link to="/manualcompliance" role="button">{this.props.t("manual_compliance")}</Link></li>
                        {/* <li className="breadcrumb-item"><Link to="/dashboard" role="button">{this.props.t('home')}</Link></li> */}
                        </>:<>
                        {/* <li className="breadcrumb-item"><Link to="/dashboard" role="button">{this.props.t('home')}</Link></li> */}
                        <li className="breadcrumb-item"><Link to="/manualcompliance" role="button">{this.props.t("manual_compliance")}</Link></li>
                        <Breadcrumb.Item active>{this.props.t('details')}</Breadcrumb.Item>
                        </>}
                    </Breadcrumb>  
                    <Col className="manualcom-content" onClick={() => this.viewProdOnClick(null,null,true)}>
                        <Col xs={12}>
                            <Col xs={12} md={12} className="details-view">
                                    <Col className="details-sub-content titlbar">
                                        <Button variant="default" size={"sm"} onClick={()=>this.backBtnHandle()}><ChevronLeftIcon size={18} /></Button>
                                        <h3 style={{paddingBottom:"0px",marginBottom:"0px",marginTop:"12px"}}>{this.props.t("jobdetails")}</h3>
                                        <div className='details-single'>
                                            <small>{this.props.t("requested_datetime")}</small>
                                            <h4>{this.state.ComplienceDetails&&moment(this.state.ComplienceDetails.requestDatenTime).format('YYYY-MM-DD HH:mm')}</h4>
                                        </div>
                                        <div className='details-single'>
                                            <small>{this.props.t("jobno")}</small>
                                            <h4>{this.state.ComplienceDetails&&this.state.ComplienceDetails.jobNumber}</h4>
                                        </div>
                                        <div className='details-single'>
                                            <small>{this.props.t("request_by")}</small>
                                            <h4>{this.state.ComplienceDetails&&this.state.ComplienceDetails.requestedUser.userName}</h4>
                                        </div>
                                        <div className='details-single'>
                                            <small>{this.props.t("STORE")}</small>
                                            <h4>{this.state.ComplienceDetails&&this.state.ComplienceDetails.store.storeName}</h4>
                                        </div>
                                        <div className='details-single'>
                                            <small>{this.props.t("department")}</small>
                                            <h4>{this.state.ComplienceDetails&&this.state.ComplienceDetails.department.name}</h4>
                                        </div>
                                        <div className='details-single'>
                                            <small>{this.props.t("fieldno")}</small>
                                            <h4>{this.state.fieldNumber}</h4>
                                        </div>
                                        <div className='details-single'>
                                            <h4>{(this.state.statusslected!=="")&&this.showStatus(this.state.statusslected)}</h4>
                                        </div>
                                    </Col>
                            </Col>
                            <Row>
                                
                                <Col xs={12} md={6}>
                                    <Col className="details-sub-content">
                                        <h3>{this.props.t("active_view")}</h3>
                                        {this.state.ComplienceDetails?<ActiveDisplayUnitView isRTL={this.props.isRTL} dmode={this.props.dmode} isviewvmenu={this.state.isviewvmenu} viewmenu={this.state.viewmenu} viewProdOnClick={this.viewProdOnClick} compdetails={this.state.ComplienceDetails} />:<></>}
                                    </Col>
                                    
                                </Col>
                                <Col xs={12} md={6}>
                                    <Col className="details-sub-content">
                                        <h3>{this.props.t("review")} 
                                            <ul className={"list-inline review-btnlist"+(this.props.isRTL === "rtl"?" float-left":" float-right")}>
                                                <li className="list-inline-item">
                                                    <Button variant="warning " onClick={()=>this.zoomHandle()}> <FeatherIcon icon="zoom-in" size={14} /></Button>
                                                </li>
                                                <li className="list-inline-item">
                                                    <Button variant="warning " onClick={()=>this.visibleNumbers()}> {this.state.visibleNo?<EyeClosedIcon size={14}/>:<EyeIcon  size={14} />}</Button>
                                                </li>
                                            </ul>
                                            {/* <ButtonGroup size="sm" className="float-right">
                                                <Button variant="secondary" active={!this.state.uploadToggle} onClick={this.handleUploadToggle}>Download</Button>
                                                <Button variant="secondary" active={this.state.uploadToggle} onClick={this.handleUploadToggle}>Upload</Button>
                                            </ButtonGroup> */}
                                        </h3>
                                        <Col xs={12} ref={this.displaydiv} style={{width: "100%"}}>
                                            {this.state.ComplienceDetails?
                                            <SvgPreview 
                                                visibleNo={this.state.visibleNo} isRTL={this.props.isRTL} 
                                                divWidth={this.state.divWidth} dmode={this.props.dmode} isEdit={this.state.isEdit} 
                                                imageSize={this.state.imageSize} ratio={this.state.ratio} 
                                                selectedAiImg={this.state.selectedAiImg} aiImages={this.state.aiImages} 
                                                rectsets={this.state.rectsets} imageloading={this.state.imageloading} 
                                                setRects={this.setRects} changeSvgThumb={this.changeSvgThumb} 
                                                imageloadFalse={this.imageloadFalse} 
                                                />
                                            :<></>}
                                        </Col>
                                        {/* {this.state.uploadToggle?<SvgPreview rectsets={this.state.rectsets} setRects={this.setRects} />:<ImagePreview />} */}
                                        
                                    </Col>
                                </Col>
                            </Row>
                            {!this.state.showComplied&&<Col className="tablediv" >
                                <ComplansChangestable t={this.props.t} 
                                    addingProductList={this.state.addingProductList} 
                                    chainDetails={this.state.chainDetails}
                                    // productList={this.state.productList} 
                                    isEdit={this.state.isEdit} 
                                    selectedAiImg={this.state.selectedAiImg} 
                                    // isLoadingremovesearch={this.state.isLoadingremovesearch}
                                    handleChanges={this.handleChanges} 
                                    handleDescription={this.handleDescription} 
                                    deleteChange={this.deleteChange} 
                                    handleProductChange={this.handleProductChange} 
                                    handleRemoveProductChange={this.handleRemoveProductChange} 
                                    // handleremovesearch={this.handleremovesearch}
                                    removeProductsChanges={this.removeProductsChanges} 
                                    />
                            </Col>}
                            <Col><div  className="compliedMark">
                               {(this.state.showComplied&&!this.state.isEdit)&&<Form.Check  id="checkcomplance" >
                                    <Form.Check.Input type="checkbox" checked={this.state.isComplied} onChange={this.clickComplied} />
                                    <Form.Check.Label>{this.props.t("markthisascomp")}</Form.Check.Label>
                                </Form.Check>}
                                </div>
                            </Col>
                            <Col className={"bottom-btn-list "+(this.props.isRTL === "rtl"?"text-left":"text-right")}>
                                <ul className="list-inline">
                                    <li className='list-inline-item'>
                                    {!this.state.isEdit&&<Button variant="danger" disabled={this.state.isComplied} onClick={()=>this.handleredoModal()}>{this.props.t("btnnames.rerequest")}</Button>}
                                    </li>
                                    <li className='list-inline-item'>
                                       {!this.state.isEdit&& <Button variant="primary" onClick={()=>this.clickUpdate()}>{this.props.t("btnnames.update")}</Button>}
                                    </li>
                                </ul>
                            </Col>
                        </Col>
                    </Col>
                  </Col>
                  
                </Row>
                <Modal className="redoremark" centered show={this.state.redoModel} onHide={()=>this.handleredoModal()}>
                    <Modal.Header >
                    <Modal.Title>{this.props.t("ADD_REMARK_REDO")}</Modal.Title>
                    </Modal.Header>
                    <Modal.Body>
                    <Form.Control as="textarea"rows={4}  onChange={(e)=>this.handleRedoRemark(e)} />
                    </Modal.Body>
                    <Modal.Footer>
                    <Button variant="secondary" onClick={()=>this.handleredoModal()}>
                    {this.props.t("btnnames.close")}
                    </Button>
                    <Button variant="primary" onClick={()=>this.handleRedoRequest()}>
                    {this.props.t("btnnames.redo")}
                    </Button>
                    </Modal.Footer>
                </Modal>

                <AcViewModal showmodal={(this.state.loading || this.state.imageloading)} />

                {this.state.isShowLightboxImage?<Lightbox image={this.state.selectedAiImg.imageUrl} title="" onClose={() => this.zoomHandle()} />:<></>}
            </Col>
        </>);
    }
}

export default  withTranslation()(withRouter(MCDetailsComponent));
