import React from 'react';
import { withRouter } from 'react-router-dom';
import {Col, Form, Button, } from 'react-bootstrap';

import { confirmAlert } from 'react-confirm-alert';

import './styles.scss';
import { AcNoDataView, AcTable, AcViewModal} from '../../../UiComponents/AcImports';
import { alertService } from '../../../../_services/alert.service';
import { submitSets } from '../../../UiComponents/SubmitSets';
import { submitCollection } from '../../../../_services/submit.service';
import { FindMaxResult, measureConverter, preventinputToString, preventinputotherthannumbers, roundOffDecimal } from '../../../../_services/common.service';

import {  withTranslation } from "react-i18next";
import "../../../../_translations/i18n";

import AddCategoryFieldModal from '../AddCategoryModal/addcategorymodal';
import { SubCatUpdate } from './additionalComps/subcat_update';
// import { PencilIcon, XIcon } from '@primer/octicons-react';
import SwitchParentModal from '../switchParentModal/switchParentModal';
import ResultSummery from '../resultSummery/resultSummery';
import StackableModal from '../stackablemodal/stackableModal';
import { stackableLevels } from '../../../../enums/departmentCategoriesEnums';

export class SubCategory extends React.Component{
    _isMounted = false;

    constructor(props){
        super(props);
        this.state = {
            isButtonDisable:false,
            isedit: true,
            
            vobj: {},
            sobj: this.defaultFilterObjectLoad(), //filter
            cobj: this.defaultCategoryObjectLoad(),// category
            subcatobj: null,
            
            isdataloaded: false, //is table data loaded
            isnottesting: true,
            ftablebody: [], //showing page table data
            toridata:[],startpage: 1, totalresults: 0, //startpage and total results 

            showSubCatNewModal:false,

            //new category add
            showCatNewModal: false,
            loadDunitList:[], 
            fieldStartIdx: 0, fieldMaxResults: 12, fieldTotalCount: 0,
            singleFieldWidth: 300, singleFieldHeight: 310, minWidthCheckValue: 160, oldCatLength: 0,
            activeTabKey: "fieldselect", 

            divWidth: 0, divHeight: 0, displayUOM: "cm", displayRatio: 0,
            svgwidth: "100%",
            fieldLevelObj: null, fieldEyeLevels: [],
            isFromLogSub : false,
            
            showSwitchModal:false,
            chaindeps:[],
            parentupdatebulkobj:null,
            catlist : [{value :0, label:"-"}],
            showresultSummeryModal:false,
            summeryres:null,
            selecteddepid:-1,
            fisrtcatlistloaded:false,
            iscatlistloading:false,

            oneresultheight:55, maxShowresultcount:0,orimaxShowresultcount:0,//find max result varibles
            showStackableModal:false,
        }
    }

    componentDidMount(){
        this._isMounted = true;
        if(this._isMounted){
            //console.log(this.props.depobj);
            this.setState({
                divWidth: 380,
                divHeight: 350,
            });

            //md load
            this.getDunits();

            if(this.props.catobj){  
                let catobj = this.props.catobj;
                catobj.departmentId = this.props.depobj.departmentId;

                let srchobj = this.defaultFilterObjectLoad();
                srchobj.depCategoryId = this.props.catobj.id;
                
                var maxresutcount=FindMaxResult(this.props.whitecontainer.current?(this.props.whitecontainer.current.offsetHeight) : 0,this.state.oneresultheight,145)

                this.setState({
                    sobj:srchobj,
                    cobj: JSON.parse(JSON.stringify(this.props.catobj)),
                    maxShowresultcount:maxresutcount.maxresultCount,orimaxShowresultcount:maxresutcount.maxresultCount
                },()=>{
                    this.handleTableSearch(null, "click");
                    this.initExistingEditMode();
                });
            }
            this.setState({
                selecteddepid:this.props.depobj.departmentId
            },()=>{
                this.getAllcatfromDepartment()
            })
            
            this.setselecteddepindex()
        }
    }

    componentWillUnmount(){
        this._isMounted = false;
    }

     //handleresultSummeryModal
     handleresultSummeryModal=()=>{
        this.setState({showresultSummeryModal:!this.state.showresultSummeryModal})
    }
    setselecteddepindex=()=>{
        var idx=this.props.alldepratmentList.findIndex(x=>x.value===this.props.depobj.departmentId);
        this.setState({selectedDepindx:idx})
    }
    initExistingEditMode = () =>{
        if(this.props.isFromLog==="true" && this.props.navigatedata){
            if((this.props.navigatedata.main_type === "SubCategory") && this.props.navigatedata.main_obj){
                this.setState({subcatobj:this.props.navigatedata.main_obj.subCategory, isModalEdit:true, isFromLogSub:true},()=>{
                    this.handleModalToggle();
                });
            }
        }
    }


    //default filter object
    defaultFilterObjectLoad = () => {
        return {searchValue:"", depCategoryId:0, isReqPagination:true, maxResult:8,startIndex:0, isReqCount:false};
    }

    //default category object
    defaultCategoryObjectLoad = () => {
        return {
            id:0,
            chainDepartmentId:0,
            categoryName:"",
            color:"#FFF",
            subCategory:[],
            isDelete:false,
            isNew:true,
        };
    }

    //get all Dunits
    getDunits = () => {
        var csobj = { isReqPagination: true, startIndex: this.state.fieldStartIdx, maxResult: this.state.fieldMaxResults };
        submitSets(submitCollection.mpFieldList, csobj).then(res => {
            //console.log(res.extra);

            if (res && res.status) {
                var list = this.state.loadDunitList.concat(res.extra);
                list.forEach(ele => { ele["isSelected"] = false });

                this.setState({ 
                    loadDunitList: list, 
                    fieldTotalCount: (this.state.fieldStartIdx === 0?res.count:this.state.fieldTotalCount),
                });
            }
        });
    }
    //display unit load more items
    loadMoreDunits = () => {
        this.setState({ fieldStartIdx: (this.state.fieldStartIdx + this.state.fieldMaxResults) }, () => {
            this.getDunits();
        });
    }

    //set filter object
    handleFilterObject = (evt,etype,ctype,msg) => {
        var cobj = this.state.sobj;
        
        if(etype === "searchValue"){
            if(!preventinputToString(evt,evt.target.value,msg)){
                evt.preventDefault()
                return
            }
        }
        if(etype !== null){
            cobj[etype] = evt.target.value;
        }
        cobj.startIndex = 0;

        this.setState({subcatobj:cobj}, () => {
            if(ctype === "click" || (ctype === "enter" && evt.which === 13)){
                this.setState({startpage: 1,toridata:[],totalresults:0}, () => {
                    this.handleTableSearch(null,"click");
                });
            }
        });
    }
    
    //filter search
    handleTableSearch = (evt,etype) => {
        if(etype === "click" || (etype === "enter" && evt.which === 13)){
            
            var maxresutcount=this.state.maxShowresultcount;
            let sobj = this.state.sobj;
            sobj.maxResult=maxresutcount;
            
            this.setState({
                isdataloaded: false,
                loading:true,
                sobj:sobj,
            });

            submitSets(submitCollection.getSubCategories, sobj, true).then(res => {
                var cdata = [];
                if(res && res.status){
                    var cpageidx = cdata.findIndex(x => x.page === this.state.startpage);
                    if(cpageidx > -1){
                        cdata[cpageidx].data = res.extra;
                    } else{
                        cdata.push({page:(this.state.startpage),data:res.extra});
                    }
                    
                    this.setState({
                        toridata: cdata,
                        totalresults: (this.state.startpage === 1 || this.state.sobj.isReqCount===true ?res.count:this.state.totalresults),
                        loading:false
                    }, () => {
                        this.loadTableData();
                    });
                } else{
                    this.setState({
                        toridata: cdata,loading:false
                    }, () => {
                        this.loadTableData();
                    });
                }
            });
        }
    }

    //on pagination page change or after tabledata loaded, 
    //this function use to select current selected page table data from toridata
    loadTableData = () => {
        var cdata = [];
        if(this.state.toridata && this.state.toridata.length > 0){

            var cfindList = this.state.toridata.find(x => x.page === this.state.startpage);
            if(cfindList){
                for (var i = 0; i < cfindList.data.length; i++) {
                    const citem = cfindList.data[i];
                    // console.log(citem);
                    cdata.push({0:citem.subCategoryId,1:citem.subCategoryName,
                        2:{type:"color",color:citem.color},
                        3: {type:"button", variant:"secondary", action:"switch", size:"sm", icon:"repeat", iconsize: 14, text:""},
                        4: {type:"button", variant:"secondary", action:"edit", size:"sm", icon:"edit-2", iconsize: 14, text:""},
                        5: {type:"button", variant:"secondary", action:"stack", size:"sm",title:this.props.t("IS_stackable"), icon:"layers", iconsize: 14, text:"",did:citem.subCategoryId},
                        // 5: {type:"button", variant:"secondary", action:"delete", size:"sm", icon:"trash-2", iconsize: 14,  text:""},
                    });
                }
            }

        }
        this.setState({ ftablebody: cdata }, () => {
            this.setState({isdataloaded: true});
        });
    }

    //pagination page change handle
    handlePageChange = (cstartpage) => {
        var cfindList = this.state.toridata.find(x => x.page === cstartpage);
        var csobj = this.state.sobj;
        csobj.startIndex = ((cstartpage - 1) * this.state.sobj.maxResult);

        this.setState({ sobj: csobj, startpage: cstartpage, isdataloaded: false }, () => {
            if(cfindList){
                this.loadTableData();
            } else{
                this.handleTableSearch(null, "click");
            }
        });
    }

    //reset table filters 
    resetTableFilters = () => {
        let srchobj = this.defaultFilterObjectLoad();
        srchobj.depCategoryId = this.props.catobj.id;
        this.setState({ sobj: srchobj, startpage: 1, isButtonDisable:false}, () => {
            this.handleTableSearch(null,"click");
        });
    }

    //on tablerow click handle set object to redux and redirect to edit view
    handleRowClick = (cidx,citem,caction) => {
        if(caction){
            if(caction==='edit'){
                var cfindList = this.state.toridata.find(x => x.page === this.state.startpage);
                if(cfindList){
                    if(citem && citem[0] && citem[0] !== ""){
                        let finditem = cfindList.data.find(z => z.subCategoryId === citem[0]);
                        if(finditem){
                            this.setState({subcatobj: JSON.parse(JSON.stringify(finditem)), isModalEdit:true},()=>{
                                //this.props.setSubCategoryObj(finditem);
                                //this.props.changeViewType("subcat");
                                this.handleModalToggle();
                            });
                        }
                    } else{
                        //console.log(cfindList.data[cidx]);
                        this.setState({subcatobj:JSON.parse(JSON.stringify(cfindList.data[cidx])), isModalEdit:true});
                        //this.props.setSubCategoryObj(cfindList.data[cidx]);
                        //this.props.changeViewType("subcat");
                        this.handleModalToggle();
                    }
                }
            }
            if(caction==='delete'){
                this.deletesubcat(citem,cidx)
            }
            if(caction==='switch'){
                this.handlSwitchCategorysubcatParent(citem,cidx)
            }
            if(caction==="stack"){
                this.handleStackabledepproducts(this.state.ftablebody[cidx])
            }
        }
        
    }
    deletesubcat=(citem,cidx)=>{
        var cfindList = this.state.toridata.find(x => x.page === this.state.startpage);
        if(cfindList){
            if(citem && citem[0] && citem[0] !== ""){
                let finditem = cfindList.data.find(z => z.subCategoryId === citem[0]);
                if(finditem){
                    this.setState({subcatobj: JSON.parse(JSON.stringify(finditem))},()=>{
                        this.handleDeletesubCategory(citem)
                    });
                }
            } else{
                this.setState({subcatobj:JSON.parse(JSON.stringify(cfindList.data[cidx]))},()=>{
                    this.handleDeletesubCategory(citem)
                });
               
            }
        }
    }
    //handling delete category
    handleDeletesubCategory=(item)=>{
        confirmAlert({
            title: this.props.t('suretodelete'),
            message: this.props.t('THIS_ACTION_WILL_DELETE_THIS_SUBCATEGORY_SURE'),
            overlayClassName: (this.props.isRTL === "rtl" ? "alertrtl-content" : ""),
            buttons: [{
                label: this.props.t('btnnames.yes'),
                onClick: () => {
                    this.handleDeletesubCategorybulkCall([{id:this.state.subcatobj.subCategoryId,name:this.state.subcatobj.subCategoryName}])
                }
            }, {
                label: this.props.t('btnnames.no'),
                onClick: () => {
                    return false;
                }
            }]
        });
        
    }
    //handleDeleteCategorubulkCall
    handleDeletesubCategorybulkCall=(ids)=>{
        var payload={
            subCategoryIds:ids
        }
        this.setState({loading:true},()=>{
            submitSets(submitCollection.bulkSubCategoryDelete, payload, true).then(res => {
                if(res){
                    if(res.extra.length>1){
                        
                    }else{
                        if(res.extra[0].success){
                            alertService.success(res.extra[0].response[0])
                            this.handleTableSearch(null,"click");
                            this.setState({loading:false})
                        }else{
                            alertService.error(res.extra[0].response[0]?res.extra[0].response[0]:this.props.t("erroroccurred"))
                            let respobj = { responseType: "subCategory", prods: res.extra,actionType: "Delete", };
                            this.setState({loading:false,summeryres:respobj,showresultSummeryModal:true},()=>{
                                // this.handleresultSummeryModal()
                            })
                        }
                    }
                }else{
                    this.setState({loading:false})
                    alertService.error(this.props.t("erroroccurred"))
                }
            })
        })
    }
    //switching sub cat parent one select
    handlSwitchCategorysubcatParent=(citem,cidx)=>{
        var cfindList = this.state.toridata.find(x => x.page === this.state.startpage);
                if(cfindList){
                    if(citem && citem[0] && citem[0] !== ""){
                        let finditem = cfindList.data.find(z => z.subCategoryId === citem[0]);
                        if(finditem){
                            this.setState({subcatobj: JSON.parse(JSON.stringify(finditem))},()=>{
                                this.handleSwitchModal()
                            });
                        }
                    } else{
                        this.setState({subcatobj:JSON.parse(JSON.stringify(cfindList.data[cidx]))});
                        this.handleSwitchModal()
                    }
                }

    }
    handleSwitchModal=()=>{
        if(this.state.showSwitchModal){
            this.setState({parentupdatebulkobj:null})
        }
        this.setState({showSwitchModal:!this.state.showSwitchModal},()=>{
           
        })
    }

    initNewSubCatModal = () => {
        this.setState({subcatobj: null, isButtonDisable:false});
        this.handleModalToggle();
    }

    //toggle tag add/edit modal
    handleModalToggle = (isreload, isdelete) => {
        this.setState({showSubCatNewModal: !this.state.showSubCatNewModal}, () => {
            if(isreload){
                let serachobj = this.state.sobj;
                const stindx = serachobj.startIndex;
                const maxresult = serachobj.maxResult;

                if(isdelete){
                    if(this.state.ftablebody.length===1 && this.state.startpage>1 ){
                        serachobj.startIndex = (stindx - maxresult);
                        serachobj.isReqCount = true;
                        this.setState({sobj:serachobj , startpage:(this.state.startpage - 1)},()=>{
                            this.handleTableSearch(null,"click");
                        });
                    }
                    else{
                        serachobj.isReqCount = true;
                        this.setState({sobj:serachobj},()=>{
                            this.handleTableSearch(null,"click");
                        });
                    }
                } else{
                    serachobj.isReqCount = true;
                    this.setState({sobj:serachobj},()=>{
                        this.handleTableSearch(null,"click");
                    });
                }
            }
        });
    }

    handleCategoryUpdate = () =>{
        let catobj = this.state.cobj;
        catobj.isDelete = false;
        catobj.subCategory = [];
        this.setState({cobj:catobj, isButtonDisable:true});
        if(catobj.categoryName !== ""){
            submitSets(submitCollection.saveSubCategories, catobj, true, null, true).then(res => {
                this.setState({ isButtonDisable:false});
                if(res && res.status){
                    alertService.success(this.props.t('SUCCESSFULLY_UPDATED'));
                    if(this.props.isFromLog==="true"){
                        this.props.history.push("/catelogueImport?isSavedLog=true") 
                    }
                    else{
                        this.props.changeViewType("dep",true);
                    }
                } else{
                    // alertService.error((res.extra?res.extra:this.props.t('ERROR_OCCURRED')));
                }
            });
        }
        else{
            alertService.warn(this.props.t('enter_catgory_name_placeholder'));
        }
    }

    handleUpdateCategory = () =>{
        if(this.state.cobj.categoryName !== ""){
            if(this.state.fieldEyeLevels && this.state.fieldEyeLevels.length > 0){
                let fieldeyelevel = this.state.fieldEyeLevels[0];
                let selectedfield = this.state.loadDunitList.find(x => x.isSelected);

                let catobj = this.state.cobj;
                catobj["isEyeLevelRank"] = fieldeyelevel.rank;
                catobj["fieldId"] = selectedfield.fieldId;
                catobj["field"] = selectedfield;

                this.setState({cobj: catobj}, () => {
                    this.handleCatModalToggle();
                });
            } else{
                alertService.error(this.props.t("select_eye_level_to_continue"));
            }
        }
        else{
            alertService.warn(this.props.t('enter_catgory_name_placeholder'));
        }
    }

    // handleCategoryDelete = () => {
    //     let catcount = 0;
    //     if(this.props.cats.length>0){
    //         if(this.props.cats[0]){
    //             catcount = this.props.cats[0].data.length;
    //         }
    //     }

       
    //     confirmAlert({
    //         title: this.props.t('CONFIRM_TO_SUBMIT'),
    //         message: (catcount === 1 ? this.props.t('ARE_YOU_SURE_TO_CONTINUE_DELETE_WILL_DELETE_DEPARTMENT') : this.props.t('ARE_YOU_SURE_TO_CONTINUE_THIS_TASK')),
    //         buttons: [{
    //             label: this.props.t('btnnames.yes'),
    //             onClick: () => {
    //                 let catobj = this.state.cobj;
    //                 catobj.isDelete = true;
    //                 submitSets(submitCollection.saveSubCategories, catobj, true).then(res => {
    //                     if(res && res.status){
    //                         alertService.success(this.props.t('SUCCESSFULLY_DELETED'));
    //                         if(this.props.isFromLog===true){
    //                             this.props.history.push("/catelogueImport?isSavedLog=true") 
    //                         }
    //                         else{
    //                             this.props.changeViewType("dep",true,"delete");
    //                         }
    //                     } else{
    //                         if(res&&res.extra==="CANT_DELETE_REFERENCE"){
    //                             alertService.error(this.props.t("CANT_DELETE_REFERENCE"));
    //                         }
    //                         else{
    //                             alertService.error((res&&res.extra?res.extra:this.props.t('ERROR_OCCURRED')));
    //                         }
    //                     }
    //                 });
    //             }
    //         }, {
    //             label: this.props.t('btnnames.no'),
    //             onClick: () => {
    //                 //
    //             }
    //         }
    //         ]
    //     });
    // }

    //toggle add/edit modal
    handleCatModalToggle = () => {
        if(!this.state.showCatNewModal){
            let editobj = JSON.parse(JSON.stringify(this.state.cobj));
            
            this.setState({
                fieldEyeLevels: (editobj.fieldId && editobj.isEyeLevelRank?[{ rank: editobj.isEyeLevelRank }]:[]),
            });
        }

        this.setState({showCatNewModal: !this.state.showCatNewModal})
    }

    handleModalReset = () => {
        let isfieldavailable = (this.state.cobj.fieldId > 0)
        this.handleSelectfield({ fieldId: (isfieldavailable?this.state.cobj.fieldId:-1) }, isfieldavailable);

        this.setState({ activeTabKey: "fieldselect" });
    }

    toggleActiveTab = (ctab) => {
        //validate category and field
        if(ctab === "fielddraw"){
            if(this.state.cobj.categoryName && this.state.cobj.categoryName !== ""){
                let selectedfield = this.state.loadDunitList.find(x => x.isSelected);

                if(selectedfield){
                    this.calcFieldObject(selectedfield);
                } else{
                    alertService.error(this.props.t("selectfield"));
                    return false;
                }
            } else{
                alertService.error(this.props.t("category_name_empty_warn"));
                return false;
            }
        }

        this.setState({ activeTabKey: ctab });
    }
    // creating field
    calcFieldObject = (fieldObj) => {
        let exportfield = JSON.parse(JSON.stringify(fieldObj));
        //calculate dimention
        var dimention = (this.state.divHeight / measureConverter(exportfield.uom,this.state.displayUOM,exportfield.height));
        
        //current field width/height
        exportfield["drawHeight"] = measureConverter(exportfield.uom,this.state.displayUOM,exportfield.height) * dimention;
        exportfield["drawWidth"] = measureConverter(exportfield.uom,this.state.displayUOM,exportfield.width) * dimention;
        
        if (exportfield.fieldShelves) {
            let cshelfs = (exportfield.fieldShelves?exportfield.fieldShelves:[]);
            
            let prevGap = 0;
            for (let i = 0; i < cshelfs.length; i++) {
                const shelf = cshelfs[i];
                let drawHeight = measureConverter(exportfield.uom,this.state.displayUOM,shelf.height) * dimention;
                let drawGap = measureConverter(exportfield.uom,this.state.displayUOM,shelf.gap) * dimention;

                //pick x, y
                shelf.x = 0;
                shelf.y = roundOffDecimal(prevGap,2);
                
                shelf.drawWidth = exportfield.drawWidth;
                shelf.drawHeight = roundOffDecimal(drawHeight,2);
                shelf.drawGap = roundOffDecimal(drawGap,2);

                prevGap = prevGap + (drawHeight + drawGap);
            }
        }
        //console.log(exportfield);
        this.setState({ fieldLevelObj: exportfield });
    }
    //
    handleSelectRow = (sidx, sitem) => {
        let ceyelevels = [];

        //check already added
        let fieldshelveidx = this.state.fieldEyeLevels.findIndex(x => x.rank === sitem.rank);
        if(fieldshelveidx > -1){
            ceyelevels.splice(fieldshelveidx,1);
        } else{
            ceyelevels.push(sitem);
        }

        this.setState({ fieldEyeLevels: ceyelevels }, () => {
            this.handleUpdateCategory();
        });
    }
    //selecting field
    handleSelectfield=(field, isfieldavailable, ismanual)=>{
        var list=this.state.loadDunitList
        for (let i = 0; i < list.length; i++) {
            const ele = list[i];
            if(field && ele.fieldId === field.fieldId){
                ele.isSelected=true
            } else{
                ele.isSelected=false
            }  
        }
        this.setState({loadDunitList:list, fieldEyeLevels: (isfieldavailable?this.state.fieldEyeLevels:[])}, () => {
            if(ismanual){
                this.toggleActiveTab("fielddraw");
            }
        });
    }
    //remove added field
    handleRemoveFieldDetails = () => {
        confirmAlert({
            title: this.props.t('REMOVE_FIELD_FROM_CATEGORY'),
            message: this.props.t('SURE_TO_REMOVE_FIELD_FROM_CATEGORY'),
            overlayClassName: (this.props.isRTL === "rtl" ? "alertrtl-content" : ""),
            buttons: [{
                label: this.props.t('btnnames.yes'),
                onClick: () => {
                    let catobj = this.state.cobj;
                    catobj["isEyeLevelRank"] = 1;
                    catobj["fieldId"] = -1;
                    catobj["field"] = null;

                    this.setState({ cobj: catobj });
                }
            }, {
                label: this.props.t('btnnames.no'),
            }]
        });
    }
    handleParentChange=(evt)=>{
        var obj={
            departmentId:this.props.depobj.departmentId,
            oldCatParent:this.state.cobj.id,
            newCatParent:evt.value,
            subCategoryIds:[
                {
                    id: this.state.subcatobj.subCategoryId,
                    name:this.state.subcatobj.subCategoryName
                }        
            ]
        }
        this.setState({parentupdatebulkobj:obj},()=>{
            // console.log(this.state.parentupdatebulkobj,this.state.cobj);
        }) 
    }
    getAllcatfromDepartment=()=>{
        var payload={
            departmentId:this.state.selecteddepid,
            isReqPagination:false,
            searchValue:""
        }
        submitSets(submitCollection.getAllCategoriesFromDepartment, payload, true).then(res => {
            var catdata = [];
                if(res && res.status){
                    if(res.extra.length>0){
                        res.extra.forEach(dep => {
                            var catd={
                                value: dep.id,label:dep.categoryName
                            }
                            if(dep.id!==this.state.cobj.id){
                                catdata.push(catd)
                            }
                           
                        });
                    }
                    
                    this.setState({
                        catlist : catdata,categoriesori:res.extra,fisrtcatlistloaded:true,iscatlistloading:false
                    })
                }else{
                    alertService.error(this.props.t("erroroccurred"))
                    this.setState({iscatlistloading:false})
                }
        
        });
    }
    handleswitchparentupdate=()=>{
        if(this.state.parentupdatebulkobj===null){
            //validate message
            alertService.error(this.props.t("depcatcannot_be_empty"))
        }else{
            confirmAlert({
                title: this.props.t('suretochangeparent'),
                message: this.props.t('THIS_ACTION_WILL_CHANGE_PARENT_CURRENT_TO_NEW'),
                overlayClassName: (this.props.isRTL === "rtl" ? "alertrtl-content" : ""),
                buttons: [{
                    label: this.props.t('btnnames.yes'),
                    onClick: () => {
                        this.sendbulksubCategoryParentUpdatecall(this.state.parentupdatebulkobj)    
                    }
                }, {
                    label: this.props.t('btnnames.no'),
                    onClick: () => {
                        return false;
                    }
                }]
            })
        }
       
       
        
    }
    sendbulksubCategoryParentUpdatecall=(obj)=>{
        this.setState({loading:true},()=>{
            submitSets(submitCollection.bulkSubCategoryParentUpdate, obj, true, null, true).then(res => {
                if(res){
                    if(res.status){
                        if(res.extra.length>1){
                            //bulk update
                         }else{
                             if(res.extra[0].success){
                                //  alertService.success(res.extra[0].response[0])
                                alertService.success(this.props.t("SUCCESSFULLY_UPDATED"));
                                 this.setState({loading:false,showSwitchModal:false,parentupdatebulkobj:null},()=>{
                                     this.handleTableSearch(null,"click");
                                 })
                             }else{
                                 alertService.error(res.extra[0].response[0]?res.extra[0].response[0]:this.props.t("erroroccurred"))
                                 let respobj = { responseType: "subCategory", prods: res.extra,actionType: "changeParent", };
                                 this.setState({loading:false,summeryres:respobj,showresultSummeryModal:true},()=>{
                                    //  this.handleresultSummeryModal()
                                 })
                             } 
                         }

                    }else{
                        this.setState({loading:false})
                        // alertService.error(res.extra)
                    }
                    
                }else{
                    this.setState({loading:false})
                    alertService.error(this.props.t("erroroccurred"))
                }
            })
        })
    }
    handleswdepChange=(e)=>{
        
        this.setState({selecteddepid:e.value,parentupdatebulkobj:null,iscatlistloading:true},()=>{
            this.getAllcatfromDepartment()
        })
    }

    handleShowingresults=(e, isonblur)=>{
        if(isonblur===true){
            this.setState({maxShowresultcount: (e.target.value!=="" && e.target.value>0)?e.target.value:this.state.orimaxShowresultcount})
        }
        else{
            this.setState({maxShowresultcount: e.target.value})
        }
    }
    //handling stackable products marking or removing
    handleStackabledepproducts=(obj)=>{
        // console.log(obj);
        this.setState({showStackableModal:true,selectedrowid:obj[0],selectedName:obj[1]})
    }
    handleToggleStackableModal=()=>{
        this.setState({showStackableModal:false})
    }
    render(){
        const ftableheaders = [{text: "", width: "1%"}, this.props.t('subCategory'),this.props.t("color"),{text: "", width: "1%"},{text: "", width: "1%"},{text: "", width: "1%"}];
       
        return(
            <>
                <Col xs={12}>
                    <Col className="formcontrol-main">
                        {/* <Col xs={12}>
                            <h5 className='subheader-txt'>{this.props.t("CATEGORY_DETAILS")}</h5>
                            <Row>
                                <Col xs={6}>
                                    <Form.Group>
                                        <AcInput eleid="catnametxt" atype="text" aid="categoryName" adefval={this.state.cobj.subCategoryName} aobj={this.state.cobj} avset={this.state.vobj} avalidate={[ValT.empty]} aplace={this.props.t('categoryName')} showlabel={true} arequired={true}/>
                                    </Form.Group>
                                    {
                                        this.state.cobj.importName && (this.state.cobj.importStatus==="None" || this.state.cobj.importStatus==="ReferenceUpdatePending")  ?
                                            <div style={{marginTop:"-15px", marginBottom:"20px"}}>
                                                <Badge bg="warning" pill>{this.props.t("CATELOG_IMP_NAME")} : {this.state.cobj.importName}</Badge>
                                            </div>
                                        :<></>
                                    }
                                </Col>
                                <Col xs={6} style={{paddingTop:"5px"}}>
                                    <Form.Group>
                                        <AcInput atype="color" aid="color" adefval={this.state.cobj.color} aobj={this.state.cobj} avset={this.state.vobj} avalidate={[ValT.empty]} aplace={this.props.t('color')} showlabel={true}/>
                                    </Form.Group>
                                </Col>
                                <Col xs={6}>
                                    <Col className="fielddetails-content">
                                        <Button onClick={this.handleCatModalToggle} variant="secondary" className='update-link' size="sm"><PencilIcon size={12}/> {this.props.t('btnnames.update')}</Button>
                                        <Button onClick={this.handleRemoveFieldDetails} variant="secondary" size="sm"><XIcon size={12}/></Button>

                                            <Form.Group>
                                                <AcInput atype="color" aid="color" adefval={this.state.cobj.color} aobj={this.state.cobj} avset={this.state.vobj} avalidate={[ValT.empty]} aplace={this.props.t('color')} showlabel={true}/>
                                            </Form.Group>
                                        </Col>
                                        <Col xs={6} style={{paddingTop:"5px"}}>
                                            <Col className="fielddetails-content">
                                                <Button onClick={this.handleCatModalToggle} variant="secondary" className='update-link' size="sm"><PencilIcon size={12}/> {this.props.t('btnnames.update')}</Button>
                                                <Button onClick={this.handleRemoveFieldDetails} variant="secondary" size="sm"><XIcon size={12}/></Button>

                                                <small>{this.props.t('dunitname')}</small>
                                                <h5>{(this.state.cobj && this.state.cobj.fieldId > 0)?this.state.cobj.field.fieldName.substring(0,25):"No Field Selected"}</h5>
                                                {(this.state.cobj && this.state.cobj.fieldId > 0)?<label>{this.props.t('EYE_LEVEL')+": "+this.state.cobj.isEyeLevelRank}</label>:<></>}
                                            </Col>
                                        </Col>        
                                    </Row>
                                </Col>
                                
                               

                            </Row>
                        </Col> */}
                        <Col xs={12} className="depcat-categoriespage">
                                    <h5 className='subheader-txt'>{this.props.t("SUB_CATEGORY_DETAILS")}</h5>

                                    <Col className="custom-filters form-inline">
                                        {/* <label className="filter-label">{this.props.t('departmentname')}</label> */}
                                        <Form.Control placeholder={this.props.t('searchsubcat')} value={this.state.sobj.searchValue} onChange={e => this.handleFilterObject(e,"searchValue","change",this.props.t('Character.search_text'))} onKeyUp={e => this.handleFilterObject(e,"searchValue","enter")} onKeyDown={(e)=>preventinputToString(e,this.state.sobj.searchValue,(this.props.t('Character.search_text')))}/>
                                        <span> <label className="filter-label">{this.props.t("SHOW_RESULTS")}</label>
                                        <Form.Control style={{width:"60px"}} type="number"  value={this.state.maxShowresultcount} onChange={e => this.handleShowingresults(e,false)} onBlur={e => this.handleShowingresults(e,true)} onKeyDown={ (evt) => evt.key === "."?evt.preventDefault(): preventinputotherthannumbers(evt,this.state.maxShowresultcount,(this.props.t('Character.results'))) } /></span>
                                        <Button type="button" variant="warning" className="search-link filter-btn" onClick={e => this.handleFilterObject(e,null,"click")}>{this.props.t('btnnames.search')}</Button>
                                        <Button type="button" variant="outline-secondary" className="filter-btn" onClick={this.resetTableFilters}>{this.props.t('btnnames.reset')}</Button>
                                    </Col>
                                    <Button type="submit" className="highlight-btn" onClick={this.initNewSubCatModal} variant="success">{this.props.t('btnnames.addnewsubcat')}</Button>
                                    
                                    {this.state.isdataloaded && this.state.ftablebody && this.state.ftablebody.length > 0?
                                        <AcTable isRTL={this.props.isRTL} t={this.props.t} aheaders={ftableheaders} totalresults={this.state.totalresults} startpage={this.state.startpage} alldata={this.state.toridata} asearchobj={this.state.sobj} abody={this.state.ftablebody} showpaginate={true} pagetype="ajax" pagecount={this.state.sobj.maxResult} handleRowClick={this.handleRowClick} handlePageChange={this.handlePageChange}/>
                                    :this.state.isdataloaded?<>
                                        <AcNoDataView />
                                    </>:<></>}
                                
                                </Col>

                        <Col className="savebtns-section">
                            {/* <Button style={{float:(this.props.isRTL==="rtl"?"right":"left")}} variant="secondary" type="button"  onClick={this.props.isFromLog==="true"? ()=> this.props.history.push("/catelogueImport?isSavedLog=true") : () => this.props.changeViewType("dep")}>{this.props.t('btnnames.back')}</Button> */}
                            {this.state.isedit?<>
                                {/* <Button style={{float:(this.props.isRTL==="rtl"?"left":"right"), marginLeft:"10px"}} onClick={()=>this.handleCategoryUpdate()} size='lg' id="updatebtnlink" variant="success" disabled={this.state.isButtonDisable} className={"formview-btn "}>{this.props.t('btnnames.updatecategory')}</Button>  */}
                                {/* <Button style={{float:(this.props.isRTL==="rtl"?"left":"right"),  marginLeft:"10px"}} onClick={()=>this.handleCategoryDelete()} size='lg' id="deletebtnlink" variant="danger" className={"formview-btn "}>{this.props.t('btnnames.deletecategory')}</Button>  */}
                            </>:
                                // <Button onClick={()=>this.handleDepartmentSave()} size='lg' id="savebtnlink" variant="success" className={"formview-btn "+(this.props.isRTL==="rtl"?"float-right":"float-left")}>{this.props.t('btnnames.update')}</Button>
                                <></>
                            }
                        </Col>

                    </Col>

                    {this.state.showSubCatNewModal?
                    <SubCatUpdate t={this.props.t} isRTL={this.props.isRTL}
                        catobj={this.state.cobj}
                        subcatobj={this.state.subcatobj}
                        showSubCatNewModal={this.state.showSubCatNewModal}
                        handleModalToggle={this.handleModalToggle}
                        />
                    :<></>}

                    <AddCategoryFieldModal 
                        isUpdateField={true}
                        showCatNewModal={this.state.showCatNewModal}
                        catobj={this.state.cobj}
                        vobj={this.state.vobj}
                        isRTL={this.props.isRTL}
                        fieldTotalCount={this.state.fieldTotalCount}
                        fieldLevelObj={this.state.fieldLevelObj}
                        fieldEyeLevels={this.state.fieldEyeLevels}
                        loadDunitList={this.state.loadDunitList} 
                        activeTabKey={this.state.activeTabKey}
                        loadMoreDunits={this.loadMoreDunits}
                        handleModalReset={this.handleModalReset}
                        handleModalToggle={this.handleCatModalToggle}
                        handleSelectfield={this.handleSelectfield}
                        handleSelectRow={this.handleSelectRow}
                        toggleActiveTab={this.toggleActiveTab}
                        UpdateCategory={this.handleUpdateCategory}
                        dmode={this.props.dmode}
                        />
                    {this.state.fisrtcatlistloaded? <SwitchParentModal 
                        isRTL={this.props.isRTL}
                        iscatlistloading={this.state.iscatlistloading}
                        selectedDepindx={this.state.selectedDepindx}
                        dtype={"category"} showSwitchModal={this.state.showSwitchModal} currentName={this.state.cobj.categoryName}
                        departmentslist={this.state.catlist}
                        depobj={this.props.depobj}
                        parentupdatebulkobj={this.state.parentupdatebulkobj}
                        maindepartmentslist={this.props.alldepratmentList}
                        handleParentChange={this.handleParentChange}
                        handleSwitchModal={this.handleSwitchModal}
                        handleUpdate={this.handleswitchparentupdate}
                        handleswdepChange={this.handleswdepChange} />:<></>}
                    {/* <ResultSummery showresultSummeryModal={this.state.showresultSummeryModal}
                        summeryres={this.state.summeryres}
                        handleresultSummeryModal={this.handleresultSummeryModal}
                        /> */}
                    {this.state.showresultSummeryModal? 
                        <ResultSummery responseObj={this.state.summeryres} toggleResponseModal={this.handleresultSummeryModal}
                        t={this.props.t} isRTL={this.props.isRTL} /> 
                    :<></>}
                    <AcViewModal showmodal={this.state.loading} message={this.props.t('PLEASE_WAIT')} />
                    {this.state.showStackableModal?<StackableModal level={stackableLevels.subcategory} selectedName={this.state.selectedName} isRTL={this.props.isRTL}
                 sid={this.state.selectedrowid} show={this.state.showStackableModal} handleClose={this.handleToggleStackableModal} />:<></>}
                </Col>
            </>
        )

    }
}

export default  withTranslation()(withRouter(SubCategory));