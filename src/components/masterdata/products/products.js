import React from 'react';
import { Link, withRouter } from 'react-router-dom';
import { connect } from 'react-redux';
import {Breadcrumb, Button, Col, Form, OverlayTrigger, Tooltip, Modal, Dropdown, Row, ButtonGroup} from 'react-bootstrap';
import * as XLSX from 'xlsx';
// import Switch from "react-switch";
import DatePicker from 'react-datepicker';
import './products.scss';
import Select from 'react-select';
import { AcNoDataView, AcTable, AcViewModal } from '../../UiComponents/AcImports';
import { submitSets } from '../../UiComponents/SubmitSets';
import { submitCollection } from '../../../_services/submit.service';
import { alertService } from '../../../_services/alert.service';
import FeatherIcon from 'feather-icons-react';

import { viewSetAction, viewSetProdPrevAction } from '../../../actions/prod/prod_action';
import { withTranslation } from 'react-i18next';

import { ExcelExportIcon, UploadFileIcon } from '../../../assets/icons/icons';
import AddNewItemComponent from './AddNew/addnew';
import { ImageSource, MasterProductCompleteStatus, MasterProductMissingTypes, POSHeirarchyCompleteStatus, ProductFilterProductTypes, ProductFilterArchivedTypes ,ProductSearchCritieriaTypes } from '../../../enums/productsEnum';
import { ArrowBothIcon, XIcon } from '@primer/octicons-react';
import { isdiamentionfilterOn } from '../../masterdata/newProducts/newproductCommen';
import {ExcelImportModel} from "./ExcelImport/ExcelImportModel"
import SuccessModel from "./ExcelImport/successModel"
import { replaceSpecialChars, numOfDecimalsLimit, preventinputToString, preventinputotherthannumbers, roundOffDecimal,restrictDecimalPoint } from '../../../_services/common.service';
import moment from 'moment';

/**
 * products add masterdata page
 * 
 *
 * @class ProductsComponent
 * @extends {React.Component}
 */
export class ProductsComponent extends React.Component{
    _isMounted = false;

    constructor(props){
        super(props);
        this.whitecontainer=React.createRef();
        this.state = {
            toridata:[], isdataloaded: false, isnottesting: true,
            sobj: this.defaultFilterObject(),
            startpage: 1, totalresults: 0,
            srcList: {"": "All", "gs1":"GS1", "direct": "Direct", "arigo":"Arigo"},
            ftablebody: [],

            showProductUpdateModal:false,
            selectedProduct:null,
            productdataloading:false,
            // departmetList:[],
            DepartmetList:[{value:"-1", label:this.props.t("NONE")}], oriDeptList: [],
            categoryList:[{value:"-1", label:this.props.t("NONE")}],
            subCategoryList:[{value:"-1", label:this.props.t("NONE")}],
            brandsList:[{value:"-1", label:this.props.t("NONE")}],
            supplierList:[{value:"-1", label:this.props.t("NONE")}],
            tagList:[],
            displaytags:[],
            oneresultheight:55, maxShowresultcount:0,orimaxShowresultcount:0,//find max result varibles,
            missingtypes:[],
            isdropdownopen:false,
            excelImportModel:false,
            isSuccessModel:false,
            sucessType:false,
        }
    }

    componentDidMount(){
        this._isMounted = true;

        if(this._isMounted){
            if(this.props.prodState && this.props.prodState.prodPrevDetails){
                let prevdetails = this.props.prodState.prodPrevDetails;
                let prevviewtype = prevdetails.viewtype;
                
                if(prevviewtype){
                    let isresetting = false;
                    if(prevviewtype === "delete" || prevviewtype === "new"){
                        if(prevviewtype === "new"){
                            isresetting = true;
                        } else{
                            prevdetails["isReqCount"] = true;
                        }
                        
                        let prevftable = (prevdetails.ftablebody?prevdetails.ftablebody:[]);
                        if(prevviewtype === "delete" && prevftable.length === 1 && prevdetails.prevpage > 1){
                            const stindx = prevdetails.startIndex;
                            const maxresult = prevdetails.maxResult;
    
                            prevdetails.startIndex = (stindx - maxresult);
                            prevdetails.prevpage = (prevdetails.prevpage - 1);
                        }

                    } else{
                        prevdetails["isReqCount"] = false;
                    }
    
                    let pstartpage = (!isresetting?prevdetails.prevpage:1);
                    let ptotalresults = (!isresetting?prevdetails.totalresults:0);
                    let psearchobj = (!isresetting?prevdetails:this.defaultFilterObject());
                    let prvmaxShowresultcount=prevdetails.maxShowresultcount
                    psearchobj.isFromBack = true;
                    this.setState({ sobj: psearchobj, startpage: pstartpage, totalresults: ptotalresults,categoryList:prevdetails.categoryList,subCategoryList:prevdetails.subCategoryList,displaytags:prevdetails.displaytags ,maxShowresultcount:prvmaxShowresultcount,orimaxShowresultcount:prevdetails.orimaxShowresultcount,missingtypes:prevdetails.missingtypes}, () => {
                        this.setMissingtypedromredux()
                        this.props.setProdPrevDetails(null);
                        this.handleTableSearch(null,"click");
                    });
                } else{
                    let CprvmaxShowresultcount=prevdetails.maxShowresultcount
                    this.setState({ maxShowresultcount:CprvmaxShowresultcount,orimaxShowresultcount:prevdetails.orimaxShowresultcount }, () => {
                        this.props.setProdPrevDetails(null);
                        this.handleTableSearch(null,"click");
                        this.setMissingtypes()
                    })
                }
            } else{
                var maxresutcount=this.FindMaxResult(this.whitecontainer.current?(this.whitecontainer.current.offsetHeight) : 0,this.state.oneresultheight,145)
                
                this.setState({
                    maxShowresultcount:maxresutcount.maxresultCount,orimaxShowresultcount:maxresutcount.maxresultCount
                },()=>{
                    this.handleTableSearch(null,"click");
                    this.setMissingtypes()
                })
            }
            this.getDepartments()
            this.getbrands()
            this.getSupplierList()
            this.getTagList();
          

        }
    }

    componentWillUnmount(){
        this._isMounted = false;
    }
    setMissingtypedromredux=()=>{
        var csobj= this.state.sobj
        var cmissingtypes=this.state.missingtypes
        //setting serch obj
        var missingtypes=[]
        cmissingtypes.forEach(element => {
            if(element.isCheck){
                missingtypes.push(element.enum)
            }
            
        });
        csobj.productMissingTypes=missingtypes

        this.setState({missingtypes:cmissingtypes,sobj:csobj})
    }
    setMissingtypes=()=>{
        let defsettings = this.defaultFilterObject();
        let defmissingTypes = defsettings.productMissingTypes;
        var types=[]
        Object.keys(MasterProductMissingTypes).map(x => {
           var obj=MasterProductMissingTypes[x]
           let isdeftype = defmissingTypes.findIndex(mtype => mtype === obj);

           var cobj={
            Name: obj,
            // Name:(obj===MasterProductMissingTypes.Dimension_Missing) ?this.props.t("missingtypes.dimension_missing"):(obj===MasterProductMissingTypes.Image_Missing) ?this.props.t("missingtypes.image_missing"):(obj===MasterProductMissingTypes.Brand_Missing)?this.props.t("missingtypes.brand_missing"):(obj===MasterProductMissingTypes.SubCategory_Missing)?this.props.t("missingtypes.subcatmissing"):"",
            isCheck: (isdeftype > -1?true:false),
            isProdType: (obj === MasterProductMissingTypes.Dimension_Missing),
            enum:obj
           }
           types.push(cobj)
           return cobj
        });
        this.setState({missingtypes:types})
    }
    handleMissingSwitchChange=(item)=>{
        var csobj= this.state.sobj
        var cmissingtypes=this.state.missingtypes
        for (let i = 0; i < cmissingtypes.length; i++) {
            const mtype = cmissingtypes[i];
            if(mtype.enum===item.enum){
                mtype.isCheck=!item.isCheck
            }
        }
        //setting serch obj
        var missingtypes=[]
        cmissingtypes.forEach(element => {
            if(element.isCheck){
                missingtypes.push(element.enum)
            }
            
        });
        csobj.productMissingTypes=missingtypes

        this.setState({missingtypes:cmissingtypes,sobj:csobj})
    }
    getTagList=()=>{
        var csobj={
            isReqPagination: false,
            tagName: "",
            type: "",
        }
        submitSets(submitCollection.searchTags, csobj, true).then(res => {
            var cdata = [];
            if(res && res.status){
                for (let i = 0; i < res.extra.length; i++) {
                    cdata.push({value:res.extra[i].id, label:res.extra[i].tagName});
                }
                this.setState({tagList:cdata})
            }else{
                alertService.error(this.props.t("ERROR_OCCURRED"));
            }
        })
    }
    getSupplierList=()=>{
        var csobj={
            isReqPagination:false
        }
        submitSets(submitCollection.searchSuppliers, csobj, true).then(res => {
            var cdata = [{value:0, label:""}];
            if(res && res.status){
                for (let i = 0; i < res.extra.length; i++) {
                    cdata.push({value:res.extra[i].supplierId, label:res.extra[i].supplierName});
                }
                this.setState({supplierList:cdata})
            }else{
                alertService.error(this.props.t("ERROR_OCCURRED"));
            }
        })
    }
    getbrands=()=>{
        var csobj={
            isReqPagination:false
        }
        submitSets(submitCollection.findAllBrands, csobj, true).then(res => {
            var cdata = [{value:0, label:""}];
            if(res && res.status){
                for (let i = 0; i < res.extra.length; i++) {
                    cdata.push({value:res.extra[i].brandId, label:res.extra[i].brandName});
                }
                this.setState({brandsList:cdata})
            }else{
                alertService.error(this.props.t("ERROR_OCCURRED"));
            }
        })
    }
    getDepartments = () => {
        var csobj={ isReqPagination: false, isIgnoreHide: false };

        submitSets(submitCollection.searchDepatments, csobj, true).then(res => {
            var cdata = [{value:0, label:""}];
            if(res && res.status){
                for (let i = 0; i < res.extra.length; i++) {
                    cdata.push({value:res.extra[i].departmentId, label:res.extra[i].name});
                }
                this.setState({DepartmetList: cdata, oriDeptList: (res.extra && res.extra.length > 0?res.extra:[])})
            }else{
                alertService.error(this.props.t("ERROR_OCCURRED"));
            }
        })

    }

    updateDeptList = (csearchobj) => {
        let newdeptlist = [{value:0, label:""}];
        
        if(this.state.oriDeptList && this.state.oriDeptList.length > 0){
            for (let i = 0; i < this.state.oriDeptList.length; i++) {
                const oriitem = this.state.oriDeptList[i];

                if(oriitem && oriitem.departmentId > 0){
                    if(!oriitem.hide || (csearchobj && !csearchobj.shouldIgnoreHiddenDepartment)){
                        newdeptlist.push({ value: oriitem.departmentId, label: oriitem.name });
                    }
                }
            }
        }
        
        this.setState({DepartmetList: newdeptlist});
    }

    defaultFilterObject = () => {
        return { 
            barcode: "", 
            productName: "", 
            productSource: "", 
            isReqPagination: true, 
            startIndex: 0, 
            maxResult:8, 
            completeStatus:"None",
            posHierachyCompletedStatus: POSHeirarchyCompleteStatus.OTHER,
            isMvp:false,
            isNOOS:false,
            isPremium:false,
            isFavorite:false,
            isOverride:false,
            isMendotory:false,
            isOnTop:false,
            isArchived:false,
            isStackable:false,
            isBlock:false,
            departmentId:-1,
            categoryId :-1,
            subCategoryId :-1,
            brandId :-1,
            supplierId :-1,
            imageSource :"None" ,
            tagIds:[],
            productMissingTypes: [],
            productTypes: ProductFilterProductTypes.ALL,
            archivedTypes: ProductFilterArchivedTypes.ALL,
            dimensions: {
                    width: {
                        searchCriteria: ProductSearchCritieriaTypes.Equal,
                        lowerBound: 0,
                        upperBound: 0
                    }, 
                        height: {
                        searchCriteria: ProductSearchCritieriaTypes.Equal,
                        lowerBound: 0,
                        upperBound: 0
                    },
                    depth: {
                        searchCriteria: ProductSearchCritieriaTypes.Equal,
                        lowerBound: 0,
                        upperBound: 0
                    }
                },
            shouldIgnoreHiddenDepartment: false,
            createdDateRange: {
                isHasSelectedDateRange: false,
                fromDate: null,
                toDate: null
            },
            saleDateCount: 0,
            isFromBack:false,
        }
                
    }
    

     //export prev object
     exportPrevDetails = (viewtype) => {
        let cviewtype = this.state.sobj;
        cviewtype["prevpage"] = this.state.startpage;
        cviewtype["totalresults"] = this.state.totalresults;
        cviewtype["viewtype"] = viewtype;
        cviewtype["ftablebody"] = this.state.ftablebody;
        cviewtype["categoryList"] = this.state.categoryList;
        cviewtype["subCategoryList"] = this.state.subCategoryList;
        cviewtype["displaytags"] = this.state.displaytags;
        cviewtype["maxShowresultcount"] = this.state.maxShowresultcount;
        cviewtype["orimaxShowresultcount"] = this.state.orimaxShowresultcount;
        cviewtype["missingtypes"] = this.state.missingtypes;
        

        return cviewtype;
     }

    //reset table filters 
    resetTableFilters = () => {
        this.setState({ sobj: this.defaultFilterObject(), displaytags:[], startpage: 1,missingtypes:[]}, () => {
            this.setMissingtypes();
            this.handleTableSearch(null,"click");

            this.updateDeptList(this.defaultFilterObject());
        });
    }
    separatecamelCaseWords = (str) => {
        if(str){
            let txt = str.replace(/([a-z])([A-Z])/g, '$1 $2');
            return txt;
        }
        else{
            return "N/A";
        }
    }
    //load showing table data
    loadTableData = () => {
        var cdata = [];
        if(this.state.toridata && this.state.toridata.length > 0){
            var cfindList = this.state.toridata.find(x => x.page === this.state.startpage);

            if(cfindList){
                for (var i = 0; i < cfindList.data.length; i++) {
                    const citem = cfindList.data[i];
                    let itemCompleteStatus = (citem.completeStatus==="DataMissig"?this.separatecamelCaseWords("DataMissing"):this.separatecamelCaseWords(citem.completeStatus));

                    cdata.push({
                        0: citem.id,
                        1: citem.barcode,
                        2: (citem.productName),
                        3: (citem.departmentName ? citem.departmentName : "-"), 
                        4: (citem.categoryName ? citem.categoryName : "-"),
                        5: (citem.subCategoryName ? citem.subCategoryName : "-"),
                        6: (citem.brandName ? citem.brandName : "-"), 
                        7: (citem.supplierName ? citem.supplierName : "-"), 
                        8: { 
                            type: "icon", 
                            placeholder: itemCompleteStatus,
                            icon: (citem.completeStatus==="DataMissig"?
                                <span className='status-icon'><FeatherIcon icon="x-circle" size={16} /></span>:
                                <span className='status-icon complete'><FeatherIcon icon="check-circle" size={16} /></span>
                            )
                        },
                        9: { 
                            type: "icon", 
                            placeholder: (citem.posHierachyCompletedStatus?this.findTransForPosStatus(citem.posHierachyCompletedStatus):""),
                            icon: (citem.posHierachyCompletedStatus?(citem.posHierachyCompletedStatus === POSHeirarchyCompleteStatus.HAVING_DATA?
                                <span className='status-icon complete'><FeatherIcon icon="check-circle" size={16} /></span>:
                                citem.posHierachyCompletedStatus === POSHeirarchyCompleteStatus.INVALID_DATA?
                                <span className='status-icon warn'><FeatherIcon icon="alert-triangle" size={16} /></span>
                                :<span className='status-icon'><FeatherIcon icon="x-circle" size={16} /></span>
                            ):"-")
                        }
                    });
                }
            }

        }
        this.setState({ ftablebody: cdata }, () => {
            this.setState({isdataloaded: true});
        });
    }
    //find translate for pos heirarchy complete status
    findTransForPosStatus = (cstatus) => {
        let returntxt = Object.keys(POSHeirarchyCompleteStatus).find(key => POSHeirarchyCompleteStatus[key] === cstatus);

        if(returntxt){
            if(cstatus === POSHeirarchyCompleteStatus.INVALID_DATA){
                returntxt = "DATA_ISSUES";
            }
        } else{
            returntxt = "OTHER"
        }
        
        return this.props.t(("posStatusList."+returntxt));
    }
    //set filter object
    handleFilterObject = (evt,etype,ctype,isvalidate,msg) => {
        var cobj = this.state.sobj;
        if(etype === "productName"){
            if(!preventinputToString(evt,evt.target.value,msg)){
                evt.preventDefault()
                return
            }
        }

        if(etype !== null){
            cobj[etype] = evt.target.value;
        }
        cobj.startIndex = 0;

        this.setState({sobj:cobj}, () => {
            if(ctype === "click" || (ctype === "enter" && evt.which === 13)){
                this.setState({startpage: 1,toridata:[],totalresults:0}, () => {
                    this.handleTableSearch(null,"click",isvalidate);
                });
            }
        });
    }
    handleFilterObjectdropdown=(evt,etype)=>{
        var cobj = this.state.sobj;
        if(etype==="completeStatus"){
            this.setState({missingtypes:[]},()=>{
                this.setMissingtypes()
                cobj.productMissingTypes=[]
            })
        }
        
        if(etype !== null){
            cobj[etype] = evt.target.value;
        }
        cobj.startIndex = 0;

        this.setState({sobj:cobj});
    }
    //HANDLE DATE RELATED
    handleDateRelateds = (evt, etype, ischildkey, parenttype, isnumber) => {

        var cobj = this.state.sobj;
        if(etype === "completeStatus"){
            this.setState({missingtypes:[]},() => {
                this.setMissingtypes();
                cobj.productMissingTypes = []
            })
        }

        if(etype === "fromDate" || etype === "toDate"){

            if(etype === "fromDate"){
                if(cobj.createdDateRange.toDate && cobj.createdDateRange.toDate !== ""){
                    if(new Date(evt) >= new Date(cobj.createdDateRange.toDate)){
                        alertService.error(this.props.t("PLEASE_SET_VALID_DATE_RANGE"));
                        return;
                    }
                }
            }

            if(etype === "toDate"){
                if(cobj.createdDateRange.fromDate && cobj.createdDateRange.from !== ""){
                    if(new Date(cobj.createdDateRange.fromDate) >= new Date(evt)){
                        alertService.error(this.props.t("PLEASE_SET_VALID_DATE_RANGE"));
                        return;
                    }
                }else{
                    alertService.error(this.props.t("PLEASE_SET_A_FROM_DATE"));
                    return;
                }
            }

        }

        if(etype !== null){
            if(evt && !evt.target){
                if(ischildkey){
                    cobj[parenttype][etype] = evt;
                } else{
                    cobj[etype] = evt;
                }
            } else if(evt && evt.target){
                
                cobj[etype] = (isnumber?(evt.target.value===""?"":parseFloat(evt.target.value) > 0?parseFloat(evt.target.value):0):evt.target.value);
            } else{
                if(ischildkey){
                    cobj[parenttype][etype] = null;
                } else{
                    cobj[etype] = null;
                }
            }
        }
        cobj.startIndex = 0;

        this.setState({sobj:cobj}, () => {
        });
    }
     //set filter object with combos
     handleFilterObjectCombo = (evt,etype,ctype) => {
        var cobj = this.state.sobj;
        if(etype !== null){
            cobj[etype] = evt.value;
        }
        cobj.startIndex = 0;

        this.setState({sobj:cobj}, () => {
            // if(ctype === "click" || (ctype === "enter" && evt.which === 13)){
            //     this.handleTableSearch(null,"click");
            // }
        });
    }
    //toggle departmet filter: 
    toggleDepFilter=(evt,etype,ctype)=>{
        var cobj = this.state.sobj;
        if(etype !== null){
            cobj.categoryId=-1
            cobj.subCategoryId=-1
            cobj[etype] = evt.value;
        }
        cobj.startIndex = 0;

        this.setState({sobj:cobj,subCategoryList:[{value:"-1", label:this.props.t("NONE")}],categoryList:[{value:"-1", label:this.props.t("NONE")}]}, () => {
            this.getCategories();
        });
    }
    //toggle cat Filter 
    
    togglecatFilter=(evt,etype,ctype)=>{
        var cobj = this.state.sobj;
        if(etype !== null){
            cobj.subCategoryId=-1
            cobj[etype] = evt.value;
        }
        cobj.startIndex = 0;

        this.setState({sobj:cobj,subCategoryList:[{value:"-1", label:this.props.t("NONE")}]}, () => {
            this.getSubCategories();
        });
    }
    togglesubcatFilter=(evt,etype,ctype)=>{
        var cobj = this.state.sobj;
        if(etype !== null){
            cobj[etype] = evt.value;
        }
        cobj.startIndex = 0;

        this.setState({sobj:cobj}, () => {
          
        });
    }
    getSubCategories=()=>{
        var csobj={
            isReqPagination:false,
            depCategoryId:this.state.sobj.categoryId,
        }
        submitSets(submitCollection.getSubCategories, csobj, true).then(res => {
            var cdata = [{value:0, label:""}];
            if(res && res.status){
                for (let i = 0; i < res.extra.length; i++) {
                    cdata.push({value:res.extra[i].subCategoryId, label:res.extra[i].subCategoryName});
                }
                this.setState({subCategoryList:cdata})
            }else{
                alertService.error(this.props.t("ERROR_OCCURRED"));
            }
        })
    }
    
    //get categories call
    getCategories=()=>{
        
        var csobj={
            isReqPagination:false,
            departmentId:this.state.sobj.departmentId,
        }
        submitSets(submitCollection.getAllCategoriesFromDepartment, csobj, true).then(res => {
            var cdata = [{value:0, label:""}];
            if(res && res.status){
                for (let i = 0; i < res.extra.length; i++) {
                    cdata.push({value:res.extra[i].id, label:res.extra[i].categoryName});
                }
                this.setState({categoryList:cdata})
            }else{
                alertService.error(this.props.t("ERROR_OCCURRED"));
            }
        })

        
    }
    //set filter object booleans
    handleFilterSwitchChange = (check,type) =>{
        let cobj = this.state.sobj;
        // if(type==="isOnTop"){
        //     cobj.isMvp = false
        // }
        // if(type==="isMvp"){
        //     cobj.isOnTop = false
        // }
        cobj[type] = check;

        if(type === "shouldIgnoreHiddenDepartment"){
            cobj.categoryId = -1;
            cobj.departmentId = -1;
            cobj.subCategoryId = -1;
        }

        this.setState({sobj:cobj}, () => {
            this.updateDeptList(cobj);
        });
    }

    //filter search
    handleTableSearch = (evt,etype,isvalidate) => {
        var maxresutcount=this.state.maxShowresultcount
        var csobj=this.state.sobj
        var cdisplaytag=this.state.displaytags
        let existtags = cdisplaytag.map((obj) => obj.id);
        csobj.tagIds=existtags
        csobj.maxResult=maxresutcount
        csobj.hasFilters = this.checkFiltersApplied();

        csobj.createdDateRange.isHasSelectedDateRange=csobj.createdDateRange.fromDate!==null?true:false
        
        csobj.dimensions.depth.lowerBound=csobj.dimensions.depth.lowerBound===""?0:parseFloat(csobj.dimensions.depth.lowerBound)
        csobj.dimensions.depth.upperBound=csobj.dimensions.depth.upperBound===""?0:parseFloat(csobj.dimensions.depth.upperBound)

        if(csobj.dimensions.depth.searchCriteria === ProductSearchCritieriaTypes.Range){
            if(!(csobj.dimensions.depth.lowerBound <= csobj.dimensions.depth.upperBound)){
                alertService.error(this.props.t("PLEASE_SET_VALID_Depth_RANGE"));
                return false;
            }
        }

        csobj.dimensions.height.lowerBound=csobj.dimensions.height.lowerBound===""?0:parseFloat(csobj.dimensions.height.lowerBound)
        csobj.dimensions.height.upperBound=csobj.dimensions.height.upperBound===""?0:parseFloat(csobj.dimensions.height.upperBound)

        if(csobj.dimensions.height.searchCriteria === ProductSearchCritieriaTypes.Range){
            if(!(csobj.dimensions.height.lowerBound <= csobj.dimensions.height.upperBound)){
                alertService.error(this.props.t("PLEASE_SET_VALID_height_RANGE"));
                return false;
            }
        }

        csobj.dimensions.width.lowerBound=csobj.dimensions.width.lowerBound===""?0:parseFloat(csobj.dimensions.width.lowerBound)
        csobj.dimensions.width.upperBound=csobj.dimensions.width.upperBound===""?0:parseFloat(csobj.dimensions.width.upperBound)

        if(csobj.dimensions.width.searchCriteria === ProductSearchCritieriaTypes.Range){
            if(!(csobj.dimensions.width.lowerBound <= csobj.dimensions.width.upperBound)){
                alertService.error(this.props.t("PLEASE_SET_VALID_width_RANGE"));
                return false;
            }
        }
        
        csobj.saleDateCount=csobj.saleDateCount===""?0:parseInt(csobj.saleDateCount)
        if(isvalidate){
            // if(csobj.moreFilter.searchDateType === FilterDateSearchTypes.dateRange){
                let setfromdate = csobj.createdDateRange.fromDate;
                let settodate = csobj.createdDateRange.toDate;

                let cfromdate = new Date(setfromdate);
                let ctodate = new Date(settodate);
                // if(!settodate || settodate === "") {
                //     alertService.error(this.props.t("PLEASE_SET_TO_DATE"));
                //     return false;

                // } else
                 if((setfromdate && !settodate) || (!setfromdate && settodate) ||
                (setfromdate && setfromdate !== "" && settodate && settodate !== "" && ctodate.getTime() < cfromdate.getTime())){ 
                    //(!setfromdate && settodate) || 

                    alertService.error(this.props.t("PLEASE_SET_VALID_DATE_RANGE"));
                    return false;
                }
            }

        this.setState({sobj:csobj,isdropdownopen:false},()=>{
            if(this.state.isnottesting && (etype === "click" || (etype === "enter" && evt.which === 13))){
                this.setState({ isdataloaded: false });
                submitSets(submitCollection.masterProductFind, this.state.sobj, true).then(res => {
                    var cdata = this.state.toridata;
                    if(res && res.status){
                        var cpageidx = cdata.findIndex(x => x.page === this.state.startpage);
                        if(cpageidx > -1){
                            cdata[cpageidx].data = res.extra;
                        } else{
                            cdata.push({page:(this.state.startpage),data:res.extra});
                        }
    
                        let sobj = this.state.sobj;
                        let isFromBackFlag = (sobj.isFromBack ? JSON.parse(JSON.stringify(sobj.isFromBack)) : false);
                        sobj.isFromBack = false;

                        this.setState({
                            toridata: cdata,
                            totalresults: (this.state.startpage === 1 || sobj.isReqCount?res.count:this.state.totalresults),
                        }, () => {
                            this.loadTableData();
    
                            sobj.isReqCount = false;
                            this.setState({ sobj: sobj });
                        });
    
                        //
                        if(res.extra.length===1 && isFromBackFlag===false){
                            let pobj = res.extra[0];
                            if(pobj.fromProductLookup===true ){
                                //pobj.fromProductLookup=true;
                                //this.setState({selectedProduct:{prodDetails:pobj}},()=>{this.toggleProductUpdateModal()});
                                this.loadGS1ProductEditData(pobj);
                            }
                        }
    
                    } else{
                        this.setState({
                            toridata: cdata,
                        }, () => {
                            this.loadTableData();
                        });
                    }
                });
            }
        })
        
    }


    openSuccessModelCloseExcelImpot = (val,id)=>{
        console.log(val,id)
        if(val === false){
         this.setState({excelImportModel:false,isSuccessModel:true,sucessType:val})
        }else{
            this.setState({excelImportModel:false},()=>{
                this.props.loadExcelImportBulkUpdateLog(id)
            })
        }
       
    }

    loadGS1ProductEditData = (pobj) =>{
        this.setState({productdataloading:true});
        submitSets(submitCollection.findProdByID, ('?productId='+pobj.id), true).then(res => {
            this.setState({productdataloading:false});
            if(res && res.status){
                this.setState({selectedProduct:{prodDetails:res.extra}},()=>{this.toggleProductUpdateModal()});
            }
        });
    }

    defaultObjectLoad = () => {
        return {name: ""};
    }
    //new unit
    handleNewLink = () => {
        this.props.setProdView(null);
        this.props.setProdPrevDetails(this.exportPrevDetails(null));
        this.props.history.push('/products/details');
    }
    //row click
    handleRowClick = (cidx,citem) => {
        var cfindList = this.state.toridata.find(x => x.page === this.state.startpage);
        if(cfindList){
            if(citem && citem[0] && citem[0] !== ""){
                let finditem = cfindList.data.find(z => z.id === citem[0]);
                //console.log(finditem);
                if(finditem){
                    this.loadRowDetails(finditem);
                }
            } else{
                this.loadRowDetails(cfindList.data[cidx]);
            }
        }
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
        var cfindList = this.state.toridata.find(x => x.page === this.state.startpage);
        if(cfindList){
            this.setState({productdataloading:true});
            submitSets(submitCollection.findProdByID, ('?productId='+rowobj.id), true).then(res => {
                this.setState({productdataloading:false});
                if(res && res.status){
                    var pobj = res.extra;
                    pobj.blockUntilDate = (pobj.blockUntilDate ?this.dateFormatDatePicker(pobj.blockUntilDate): null)
                    pobj.subCategoryId = (pobj.subCategoryId ? pobj.subCategoryId : 0);
                    pobj.brandId = (pobj.brandId ? pobj.brandId : 0);

                    pobj.width = (pobj.width > 0?roundOffDecimal(pobj.width,numOfDecimalsLimit):pobj.width);
                    pobj.height = (pobj.height > 0?roundOffDecimal(pobj.height,numOfDecimalsLimit):pobj.height);
                    pobj.depth = (pobj.depth > 0?roundOffDecimal(pobj.depth,numOfDecimalsLimit):0);
                    pobj.sensitivity = (pobj.sensitivity > 0?roundOffDecimal(pobj.sensitivity,numOfDecimalsLimit):0);

                    this.props.setProdView(pobj);
                    this.props.setProdPrevDetails(this.exportPrevDetails(null));
                    
                    this.props.history.push('/products/details');
                } else{
                    //
                }
            });
        }
    }
    //page change
    handlePageChange = (cstartpage) => {
        var cfindList = this.state.toridata.find(x => x.page === cstartpage);
        var csobj = this.state.sobj;
        csobj.startIndex = ((cstartpage - 1) * this.state.sobj.maxResult);

        this.setState({ sobj: csobj, startpage: cstartpage, isdataloaded: false }, () => {
            if(cfindList){
                this.setState({ isdataloaded: true });
                this.loadTableData();
            } else{
                this.handleTableSearch(null, "click");
            }
            // this.handleTableSearch(null, "click");
        });
    }
    //handle export excel
    handleExportExcel = (type) => {
        let styles = { font: { bold: true }, fill: { fgColor: { rgb: "E9E9E9" } }, alignment: { wrapText: false } };
        let filterProducts = [[
            {v:this.props.t('Excel_Export.PRODUCT_BARCODE'),s:styles},
            {v:this.props.t('Excel_Export.PRODUCT_NAME'),s:styles},
            {v:this.props.t('width'),s:styles},
            {v:this.props.t('height'),s:styles},
            {v:this.props.t('depth'),s:styles},
            {v:this.props.t('uom'),s:styles},
            {v:this.props.t('STACKABLE'),s:styles},
            {v:this.props.t('maxstackablecount'),s:styles},
            {v:this.props.t('STRGY_TYPES.block'),s:styles},
            {v:this.props.t('block_unitl_date'),s:styles},
            {v:this.props.t('mvp_override'),s:styles},
            {v:this.props.t('ISMVP_OR_ONTOP'),s:styles},
            {v:this.props.t('usageStatus'),s:styles},
            {v:this.props.t('department'),s:styles},
            {v:this.props.t('FileImportErrorLogFilterTypes.Category'),s:styles},
            {v:this.props.t('FileImportErrorLogFilterTypes.SubCategory'),s:styles},
            {v:this.props.t('FileImportErrorLogFilterTypes.Brand'),s:styles},
            {v:this.props.t('FileImportErrorLogFilterTypes.Supplier'),s:styles},
            {v:this.props.t('completeStatus'),s:styles},
            {v:this.props.t('Excel_Export.hierarchyCompleteStatus'),s:styles}]];
        let ActiveProducts = [[{v:this.props.t('STORE'),s:styles},{v:this.props.t('version'),s:styles},{v:this.props.t('status'),s:styles},{v:this.props.t('date'),s:styles},{v:this.props.t('planogram'),s:styles},{v:this.props.t('department'),s:styles},{v:this.props.t('Excel_Export.Field_No'),s:styles},{v:this.props.t('Excel_Export.Shelve_No'),s:styles},{v:this.props.t('Excel_Export.PRODUCT_BARCODE'),s:styles},{v:this.props.t('Excel_Export.PRODUCT_NAME'),s:styles}]];
        if(type === 1){
            this.setState({ isexcellinkdisabled: true,productdataloading:true});
            let sobj = {...this.state.sobj}
            sobj.isReqPagination = false;
            submitSets(submitCollection.masterProductFind, sobj, true).then(res => {
                if (res && res.status) {
                    if (res.extra && res.extra.length > 0) {
                        let result = res.extra
                        for (const val of result) {
                            let completeStatus;
                            let hierarchyCompleteStatus ;
                            let mvp;
                            if(val.completeStatus === "FullData"){
                                completeStatus = "Full Data"
                            }else if(val.completeStatus === "DataMissig"){
                                completeStatus = "Data Missig"
                            }else{
                                completeStatus = val.completeStatus
                            }

                            if(val.hierarchyCompleteStatus === "HaveIssues"){
                                hierarchyCompleteStatus = "Have Issues"
                            }else{
                                hierarchyCompleteStatus = val.hierarchyCompleteStatus
                            }
                            if(val.productType === "ontop"){
                                mvp = "On Top";
                            }else if(val.productType === "mvp"){
                                mvp = "MVP";
                            }else if(val.productType === "none"){
                                mvp = "None";
                            }else{
                                mvp = val.productType;
                            }
                            filterProducts.push([
                                val.barcode,
                                val.productName,
                                val.width,
                                val.height,
                                val.depth,
                                val.uom,
                                val.stackble?true:false,
                                val.stackble?val.stackable_count:null,
                                val.block?true:false,
                                val.block?val.block_unitl_date?moment(val.block_unitl_date).format("YYYY-MM-DD").toString():null:null,
                                val.isManualAdded?true:false,
                                mvp,
                                val.usageStatus,
                                val.departmentName,
                                val.categoryName,
                                val.subCategoryName,
                                val.brandName,
                                val.supplierName,
                                completeStatus,
                                hierarchyCompleteStatus
                            ])
                        }
                        this.setState({ excelexportdata: res.extra, isexcellinkdisabled: false ,productdataloading:false}, () => {
                            this.ExportCSV(filterProducts,(this.props.t('Excel_Export.product_details')),(this.props.t('product_info')))
                        });
                 
                    } else {
                        this.setState({ excelexportdata: [], isexcellinkdisabled: false,productdataloading:false });
                        alertService.error("No export data found");
                    }
                } else {
                    this.setState({ excelexportdata: [], isexcellinkdisabled: false,productdataloading:false });
                }
            });
        }
        if(type === 2){
            this.setState({ isexcellinkdisabled: true,productdataloading:true });
            submitSets(submitCollection.getProdInfoReport, false).then(res => {
                if (res && res.status) {
                    if (res.extra && res.extra.length > 0) {
                        let result = res.extra
                        for (const val of result) {
                            ActiveProducts.push([
                                val.storeName,
                                val.versionNumber,
                                val.layoutStatus,
                                val.createdDate,
                                val.planogramName,
                                val.departmentName,
                                val.fieldNumber,
                                val.shelfNo,
                                val.barcode,
                                val.productName,
                            ])
                        }
                        this.setState({ excelexportdata: res.extra, isexcellinkdisabled: false ,productdataloading:false}, () => {
                            this.ExportCSV(ActiveProducts,(this.props.t('Excel_Export.planigo_prodinfo_export')),(this.props.t('product_info')))
                        });
                    } else {
                        this.setState({ excelexportdata: [], isexcellinkdisabled: false,productdataloading:false });
                        alertService.error("No export data found");
                    }
                } else {
                    this.setState({ excelexportdata: [], isexcellinkdisabled: false,productdataloading:false });
                }
            });
        }
        
    }
    //export prodinfo data
    ExportCSV = (data, fileName,sheetName) => {

        // const fileType = 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet;charset=UTF-8';
        const fileExtension = '.xlsx';
        // const cdate = moment().format("YYYY-MM-DD h.mm a")
        let cdate = new Date();
        const wb = { Workbook: { Views: [{ RTL: (this.props.isRTL === "rtl"?true:false) }] }, Sheets: {}, SheetNames: [] };
        const ws = XLSX.utils.aoa_to_sheet(data);

        XLSX.utils.book_append_sheet(wb, ws, "readme");
        XLSX.writeFile(wb, replaceSpecialChars(replaceSpecialChars(String((fileName + "_" + cdate.getTime()))))+fileExtension)

        // const sheet =  XLSX.utils.json_to_sheet(data,{ skipHeader: true });
        // const wb = { Sheets: { [sheetName]: sheet, }, SheetNames: [sheetName]};
        // const excelBuffer = XLSX.write(wb, { bookType: 'xlsx', type: 'array' });
        // const exportData = new Blob([excelBuffer], { type: fileType });
        // FileSaver.saveAs(exportData,(fileName)+"_"+(cdate) + fileExtension);

        // const cdate = new Date();
        // //export data
        // var csvData = [];
        // csvData.push(["Store", "Version", "Status", "Date", "Planogram", "Department","Field No.","Shelve No.","Product Barcode","Product Name"]);
        // if (exportData && exportData.length > 0) {
        //     exportData.forEach(exproditem => {
        //         csvData.push([exproditem.storeName, exproditem.versionNumber, exproditem.layoutStatus, exproditem.createdDate, exproditem.planogramName, exproditem.departmentName, exproditem.fieldNumber, exproditem.shelfNo, exproditem.barcode, exproditem.productName]);
        //     });
        // }

        // const ws = XLSX.utils.json_to_sheet(csvData);
        // const wb = { Sheets: { 'data': ws }, SheetNames: ['data'] };
        // const excelBuffer = XLSX.write(wb, { bookType: 'xlsx', type: 'array' });
        // const data = new Blob([excelBuffer], { type: fileType });
        // FileSaver.saveAs(data, fileName + "_" + (cdate.getTime()) + fileExtension);
    }

    toggleProductUpdateModal = (isrefresh) =>{
        this.setState({showProductUpdateModal:!this.state.showProductUpdateModal},()=>{
            if(isrefresh===true){
                this.handleTableSearch(null,"click");
            }
            else if(isrefresh==="delete"){
                this.resetTableFilters();
            }
        });
    }
    handleTags=(evt)=>{
        var tagList=this.state.tagList
        var cdisplaytags=this.state.displaytags
        var selectedobj=tagList.find(x=>x.value===parseInt(evt.value))
        var alreadyhave=this.state.displaytags.find(c=>c.id===selectedobj.value)
        if(alreadyhave){
            alertService.warn(this.props.t("ALREADY_ADDED"))
        }else{
            cdisplaytags.push({
                id:selectedobj.value,
                tagName:selectedobj.label
            })
            // var ctaglist = JSON.parse(JSON.stringify(this.state.tagList))
            // ctaglist.push(parseInt(evt.target.value)) 
            
            this.setState({displaytags:cdisplaytags}, () => {
               
            });
        }
        
    }
    //remove added  tag
    removeTag = (xidx) => {
            let selectedtags = this.state.displaytags;
            selectedtags.splice(xidx,1);
            this.setState({ displaytags: selectedtags });
    }
     FindMaxResult=(divHeight,oneresultHeight,allocatedspace)=>{
       
        var result={}
        var maxresult=1
        maxresult=(divHeight-allocatedspace)/oneresultHeight
        var maxresultCount=parseInt(maxresult.toFixed(0))
        result={
            maxresultCount:(maxresultCount>8)?maxresultCount:8
        }
        return result
    }
    handleShowingresults=(e)=>{
        this.setState({maxShowresultcount: (e.target.value!==""&&e.target.value>0)?e.target.value:""})
    }
    //handle dialmentions of product
    handleDiamentions=(val,diemntiontype,boundype,isCritieria,event,msg)=>{
        var cobj = this.state.sobj;
        var diamention=cobj.dimensions
        if((diemntiontype === 'width' || diemntiontype === 'height' || diemntiontype === 'depth') && boundype !== ""){
            if(restrictDecimalPoint(event.target.value,3)){
                event.preventDefault()
                return
            }
            if(!preventinputotherthannumbers(event,event.target.value,msg)){
                return
            }
        }
        if(isCritieria){
            diamention[diemntiontype].searchCriteria=val
        }else{
            if(boundype==="lbound"){
                diamention[diemntiontype].lowerBound=(val===""?"":val>=0)?val:""
            }else if(boundype==="ubound"){
                diamention[diemntiontype].upperBound=(val===""?"":val>=0)?val:""
            }
        }
        this.setState({sobj:cobj})
    }
    getptypename=(type)=>{
        var name=""
        name=(type===ProductFilterProductTypes.ALL)?this.props.t("ALL"):type===ProductFilterProductTypes.NONE?this.props.t("NotMVPONTOP"):type===ProductFilterProductTypes.MVP?this.props.t("MVP"):type===ProductFilterProductTypes.ONTOP?this.props.t("ONTOP"):type===ProductFilterProductTypes.MVP_AND_ONTOP?this.props.t("MVPnOPNTOP"):""
        return name
      }
    getSelectTypeName=(type)=>{
        var name=""
        name=(type===ProductFilterArchivedTypes.ALL)?this.props.t("ALL"):type===ProductFilterArchivedTypes.ARCHIVED?this.props.t("ARCHIVEDD"):type===ProductFilterArchivedTypes.NOT_ARCHIVED?this.props.t("NOT_ARCHIVED"):""
        return name
      }
      onToggleHandler = (isOpen, e, metadata) => {
        // if  (metadata.source != 'select') {
           this.setState({isdropdownopen:isOpen})
        // }
    }

    //check filters applied
    checkFiltersApplied = () => {
        let searchObj = this.state.sobj;
        //check any of filters added
        let moreFiltersAvl = (searchObj && (searchObj.isOverride ||searchObj.isPremium || searchObj.isOnTop || searchObj.isNOOS || searchObj.isFavorite || 
            searchObj.isMvp || searchObj.isArchived || searchObj.isBlock ||searchObj.isStackable|| searchObj.isMendotory||searchObj.departmentId>0||searchObj.categoryId>0 ||
            searchObj.productMissingTypes.length>0||searchObj.completeStatus!=="None" || searchObj.posHierachyCompletedStatus !== POSHeirarchyCompleteStatus.OTHER ||searchObj.subCategoryId>0||searchObj.brandId>0 ||
            searchObj.supplierId>0 ||searchObj.imageSource!=="None"||searchObj.tagIds.length>0||searchObj.productSource!==""||searchObj.archivedTypes!==ProductFilterArchivedTypes.ALL||
            searchObj.productTypes!==ProductFilterProductTypes.ALL||searchObj.shouldIgnoreHiddenDepartment||
            ((searchObj.createdDateRange.fromDate && searchObj.createdDateRange.fromDate !== "") || (searchObj.createdDateRange.toDate && searchObj.createdDateRange.toDate !== "")) ||
            (searchObj.saleDateCount && searchObj.saleDateCount > 0) ||
            isdiamentionfilterOn(this.state.sobj.dimensions)));

        return moreFiltersAvl;
    }

    handleKeyDown = (event) => {
        if(!(/[0-9/]/.test(event.key) || parseInt(event.keyCode) === 8  || parseInt(event.keyCode) === 37 || parseInt(event.keyCode) === 39)){
            event.preventDefault();
        }
    }

    render(){
        let filterDepartments = JSON.parse(JSON.stringify(this.state.DepartmetList));
        filterDepartments[0] = {value:-1, label:this.props.t("ALL")};
        let filtercategoryList = JSON.parse(JSON.stringify(this.state.categoryList));
        filtercategoryList[0] = {value:-1, label:this.props.t("ALL")};
        let filterSubcategoryList = JSON.parse(JSON.stringify(this.state.subCategoryList));
        filterSubcategoryList[0] = {value:-1, label:this.props.t("ALL")};
        let filterBrnadList = JSON.parse(JSON.stringify(this.state.brandsList));
        filterBrnadList[0] = {value:-1, label:this.props.t("ALL")};
        let filterSupplierList = JSON.parse(JSON.stringify(this.state.supplierList));
        filterSupplierList[0] = {value:-1, label:this.props.t("ALL")};
        let filterTagList = JSON.parse(JSON.stringify(this.state.tagList));
        // filterTagList[0] = {value:0, label:"Select None"};


        const ftableheaders = [
            "",this.props.t('barcode'), this.props.t('productname'), this.props.t('department'), 
            this.props.t('category'), this.props.t('subcategory'), this.props.t('brand'), this.props.t('suplable'),
            {text: this.props.t('FULL_DATA'), class: "text-center"},{text: this.props.t("hierarchy"), class: "text-center"}];
        
        const srclist = Object.keys(this.state.srcList).map((x) => {
            return <option key={x} value={x}>{(x === ""?this.props.t("CatelogImportLogStatus.All"):x === "direct"?this.props.t("DIRECT"):this.state.srcList[x])}</option>;
        });

        var Imagesource = Object.keys(ImageSource).map(x => {
            return <option key={x} value={ImageSource[x]}>{(ImageSource[x]==="None"?this.props.t("ALL"):ImageSource[x]==="Custom"?this.props.t("custom"):ImageSource[x]==="Default"?this.props.t("default"):ImageSource[x])}</option>
        });

        let moreFiltersAvl = this.checkFiltersApplied();
        let searchObj = this.state.sobj;
        
        var ArchivedType = Object.keys(ProductFilterArchivedTypes).map(x => {
            return <option key={x} value={ProductFilterArchivedTypes[x]}>{this.getSelectTypeName(ProductFilterArchivedTypes[x])}</option>
        });
        var ProductType = Object.keys(ProductFilterProductTypes).map(x => {
            return <option key={x} value={ProductFilterProductTypes[x]}>{this.getptypename(ProductFilterProductTypes[x])}</option>
        });

        // var departmentList = (this.state.departmetList!==undefined&&this.state.departmetList.length>0 ? Object.keys(this.state.departmetList).map(x => {
        //     return <option key={x} value={this.state.departmetList[x].departmentId}>{this.state.departmetList[x].name}</option>
        // }) : <></>);
        // var categoryList = (this.state.categoryList!==undefined&&this.state.categoryList.length>0 ? Object.keys(this.state.categoryList).map(x => {
        //     return <option key={x} value={this.state.categoryList[x].id}>{this.state.categoryList[x].categoryName}</option>
        // }) : <></>);
        // var subcategoryList = (this.state.subCategoryList!==undefined&&this.state.subCategoryList.length>0 ? Object.keys(this.state.subCategoryList).map(x => {
        //     return <option key={x} value={this.state.subCategoryList[x].subCategoryId}>{this.state.subCategoryList[x].subCategoryName}</option>
        // }) : <></>);
        // var brandsList = (this.state.brandsList!==undefined&&this.state.brandsList.length>0 ? Object.keys(this.state.brandsList).map(x => {
        //     return <option key={x} value={this.state.brandsList[x].brandId}>{this.state.brandsList[x].brandName}</option>
        // }) : <></>);
        
        // var supplierList = (this.state.supplierList!==undefined&&this.state.supplierList.length>0 ? Object.keys(this.state.supplierList).map(x => {
        //     return <option key={x} value={this.state.supplierList[x].supplierId}>{this.state.supplierList[x].supplierName}</option>
        // }) : <></>);
        // var tagsList = (this.state.tagList!==undefined&&this.state.tagList.length>0 ? Object.keys(this.state.tagList).map(x => {
        //     return <option key={x} value={this.state.tagList[x].id}>{this.state.tagList[x].tagName}</option>
        // }) : <></>);

       

        return (<>
            <Col xs={12} className={"main-content "+(this.props.isRTL==="rtl"?"RTL":"")} dir={this.props.isRTL}>
                <Breadcrumb dir="ltr">
                    {this.props.isRTL==="rtl"?<>
                    <Breadcrumb.Item active>{this.props.t('products')}</Breadcrumb.Item>
                    <li className="breadcrumb-item"><Link to={"/"+this.props.HomePageVal} role="button">{this.props.t('home')}</Link></li>
                    </>:<>
                    <li className="breadcrumb-item"><Link to={"/"+this.props.HomePageVal} role="button">{this.props.t('home')}</Link></li>
                    <Breadcrumb.Item active>{this.props.t('products')}</Breadcrumb.Item>
                    </>}
                </Breadcrumb>
                <Col xs={12} className="white-container prodlist-container" ref={this.whitecontainer}>
                    <Button type="submit" className="highlight-btn" variant="success" size="sm" onClick={this.handleNewLink}>{this.props.t('btnnames.addnew')}</Button>
                    <Dropdown>
                        <Dropdown.Toggle  as={ButtonGroup} className='export-drop-down' variant="success" id="dropdown-basic">
                            <OverlayTrigger placement={"bottom"} overlay={<Tooltip id={`tooltip-bottom`}>{this.props.t("btnnames.exportprodinfo")}</Tooltip> }>
                                <Button variant="outline-primary" className="task-exportexcel-link plg-export-link " disabled={this.state.isexcellinkdisabled} ><ExcelExportIcon size={22} color={this.props.dmode?"#2CC990":"#5128a0"}/></Button>
                            </OverlayTrigger>
                        </Dropdown.Toggle>
                        <Dropdown.Menu className='dropDownDetails'>
                          <Dropdown.Item onClick={()=>this.handleExportExcel(1)}>{this.props.t('Excel_Export.Filtered_products')}</Dropdown.Item>
                          <Dropdown.Item onClick={()=>this.handleExportExcel(2)}>{this.props.t('Excel_Export.All_products')}</Dropdown.Item>
                        </Dropdown.Menu>
                    </Dropdown>
                   
                    
                    <OverlayTrigger placement={"bottom"} overlay={<Tooltip id={`tooltip-bottom`}>{this.props.t("btnnames.importprodinfo")}</Tooltip> }>
                        <Button variant="outline-primary" className="task-exportexcel-link plg-import-link " onClick={()=>this.setState({excelImportModel : true})}><UploadFileIcon size={22} color={this.props.dmode?"#2CC990":"#5128a0"}/></Button>
                    </OverlayTrigger> 
                
                    <Col className="custom-filters form-inline" xs={8}>
                        <div className="d-none">
                            <label className="filter-label">{this.props.t('barcode')}</label>
                            <Form.Control  placeholder="Search barcode" onKeyUp={e => this.handleFilterObject(e,"barcode","enter")} onKeyDown={(e)=> preventinputToString(e,e.target.value,(this.props.t('Character.search_text')))}/>
                        </div>
                        <label className="filter-label">{this.props.t('btnnames.search')}</label>
                        <Form.Control  placeholder={this.props.t('barcode')+", "+this.props.t('productname')} value={this.state.sobj.productName} onChange={e => this.handleFilterObject(e,"productName","change",true,this.props.t('Character.search_text'))} onKeyUp={e => this.handleFilterObject(e,"productName","enter")} style={{width:"250px"}} onKeyDown={(e)=> preventinputToString(e,e.target.value,(this.props.t('Character.search_text')))} />
                        {/* <label className="filter-label">{this.props.t('source')}</label>
                        <FormSelect value={this.state.sobj.productSource} onChange={e => this.handleFilterObject(e,"productSource","click")}>
                            {srclist}
                        </FormSelect> */}
                        
                        <Dropdown className='morefilterbtn' show={this.state.isdropdownopen} onToggle={(isOpen, e, metadata) => this.onToggleHandler(isOpen, e, metadata)}>
                            <Dropdown.Toggle variant="outline-primary" size='sm' id="dropdown-basic">
                                {this.props.t("MORE_FILTERS")}
                                {moreFiltersAvl===true ?<div className='red-dot-more-filters'></div>:<></>}
                            </Dropdown.Toggle>

                            <Dropdown.Menu>
                                <Col xs={12} className="form-subcontent">
                                    <Col xs={12} className="form-section">
                                        <Row style={{marginTop:"0px"}}>
                                        
                                            <Col className={"rtlcon "+(this.props.isRTL==="rtl"?"":"sepbox")} xs={this.props.size==="sm" ? 6 : 3}>
                                                {/* <Col className="title">{this.props.t("status")}</Col> */}
                                                <Col className="">
                                                    <Form.Check type="checkbox" id="isnoos" name="isnoos" label={this.props.t('isnoos')}
                                                    checked={this.state.sobj.isNOOS} onChange={(e) => this.handleFilterSwitchChange(!this.state.sobj.isNOOS,"isNOOS")}
                                                        />
                                                </Col>
                                                <Col className="">
                                                    <Form.Check type="checkbox" id="isfav" name="isfav" label={this.props.t('isfav')}
                                                checked={this.state.sobj.isFavorite} onChange={(e) => this.handleFilterSwitchChange(!this.state.sobj.isFavorite,"isFavorite")}
                                                        />
                                                </Col>
                                                <Col className="">
                                                    <Form.Check type="checkbox" id="isMendotory" name="isMendotory" label={this.props.t('IS_MANDATORY')}
                                                checked={this.state.sobj.isMendotory} onChange={(e) => this.handleFilterSwitchChange(!this.state.sobj.isMendotory,"isMendotory")}
                                                        />
                                                </Col>
                                                <Col className="">
                                                    <Form.Check type="checkbox" id="isPremium" name="isPremium" label={this.props.t('ispremium')}
                                                checked={this.state.sobj.isPremium} onChange={(e) => this.handleFilterSwitchChange(!this.state.sobj.isPremium,"isPremium")}
                                                        />
                                                </Col>
                                                <Col className="">
                                                    <Form.Check type="checkbox" id="isOverride" name="isOverride" label={this.props.t('manualOverride')}
                                                checked={this.state.sobj.isOverride} onChange={(e) => this.handleFilterSwitchChange(!this.state.sobj.isOverride,"isOverride")}
                                                        />
                                                </Col>
                                                <Col className="">
                                                    <Form.Check type="checkbox" id="isStackable" name="isStackable" label={this.props.t('IS_stackable')}
                                                checked={this.state.sobj.isStackable} onChange={(e) => this.handleFilterSwitchChange(!this.state.sobj.isStackable,"isStackable")}
                                                        />
                                                </Col>
                                                <Col className="">
                                                    <Form.Check type="checkbox" id="isblock" name="isblock" label={this.props.t('IS_BLOCK')}
                                                checked={this.state.sobj.isBlock} onChange={(e) => this.handleFilterSwitchChange(!this.state.sobj.isBlock,"isBlock")}
                                                        />
                                                </Col>
                                                <Col className="">
                                                <label>{this.props.t('archived_type')}</label>
                                                                <br />
                                                                <Form.Control style={{width:"100%"}} as="select" value={this.state.sobj.archivedTypes}   onChange={e => this.handleFilterObjectdropdown(e,"archivedTypes","click")}>
                                                                    {ArchivedType}
                                                                </Form.Control>
                                                </Col>
                                                <Col className="">
                                                <label>{this.props.t('product_type')}</label>
                                                                <br />
                                                                <Form.Control style={{width:"100%"}} as="select" value={this.state.sobj.productTypes}   onChange={e => this.handleFilterObjectdropdown(e,"productTypes","click")}>
                                                                    {ProductType}
                                                                </Form.Control>
                                                </Col>
                                            </Col>
                                            <Col className="sepbox rtlcon" xs={this.props.size==="sm" ? 6 : 3}>
                                                <Col >
                                                    <label>{this.props.t('completeStatus')}</label>
                                                    <Form.Control style={{width:"100%"}} as="select" value={this.state.sobj.completeStatus} onChange={e => this.handleFilterObjectdropdown(e,"completeStatus","click")}>
                                                        <option  value={MasterProductCompleteStatus.None}>{this.props.t("CatelogImportLogTypes.Other")}</option>
                                                        <option  value={MasterProductCompleteStatus.FullData}>{this.props.t("FULL_DATA")}</option>
                                                        <option  value={MasterProductCompleteStatus.DataMissing}>{this.props.t("DATA_MISSING")}</option>
                                                    </Form.Control>
                                                </Col>

                                                <Col style={{marginTop: "10px"}}>
                                                    <label>{this.props.t('posCompleteStatus')}</label>
                                                    <Form.Control style={{width:"100%"}} as="select" value={this.state.sobj.posHierachyCompletedStatus} onChange={e => this.handleFilterObjectdropdown(e,"posHierachyCompletedStatus","click")}>
                                                        <option value={POSHeirarchyCompleteStatus.OTHER}>{this.props.t("btnnames.all")}</option>
                                                        <option value={POSHeirarchyCompleteStatus.NO_DATA}>{this.props.t("posStatusList.NO_DATA")}</option>
                                                        <option value={POSHeirarchyCompleteStatus.HAVING_DATA}>{this.props.t("posStatusList.HAVING_DATA")}</option>
                                                        <option value={POSHeirarchyCompleteStatus.INVALID_DATA}>{this.props.t("posStatusList.DATA_ISSUES")}</option>
                                                    </Form.Control>
                                                </Col>

                                                <hr />
                                                {this.state.missingtypes.map((item,i)=><React.Fragment key={i}>
                                                {!item.isProdType?<Col className="" >
                                                    <Form.Check type="checkbox" id={item.Name} name={item.Name} label={this.props.t("missingtypes."+item.Name)} disabled={this.state.sobj.completeStatus!=="None"?true:false}
                                                    checked={item.isCheck} onChange={()=>this.handleMissingSwitchChange(item)}
                                                            />
                                                    </Col>:<></>}
                                                </React.Fragment>
                                                )}
                                                
                                                
                                                <hr />
                                                <Col >
                                                    <label>{this.props.t('product_source')}</label>
                                                    <Form.Control style={{width:"100%"}} as="select" value={this.state.sobj.productSource} onChange={e => this.handleFilterObjectdropdown(e,"productSource","click")}>
                                                        {srclist}
                                                    </Form.Control>
                                                </Col>
                                                <Col >
                                                    <label>{this.props.t('imageSource')}</label>
                                                    <br />
                                                    <Form.Control style={{width:"100%"}} as="select"  value={this.state.sobj.imageSource} onChange={e => this.handleFilterObjectdropdown(e,"imageSource","click")}>
                                                        {Imagesource}
                                                    </Form.Control>
                                                </Col>
                                            </Col>
                                            <Col className="sepbox rtlcon" xs={this.props.size==="sm" ? 6 : 3}>
                                                <Col className="check-bools">
                                                    <Form.Check type="checkbox" name={this.props.t("is_hiddendepartment")} id="ishiddendept-check" label={this.props.t("is_hiddendepartment")}
                                                        checked={searchObj.shouldIgnoreHiddenDepartment}  onChange={()=>this.handleFilterSwitchChange(!searchObj.shouldIgnoreHiddenDepartment,"shouldIgnoreHiddenDepartment")}
                                                    />
                                                </Col>
                                                <hr />
                                                <Col className="">
                                                    <label>{this.props.t('department')}</label>
                                                    <Select 
                                                        placeholder={this.props.t("department")} 
                                                        options={filterDepartments} 
                                                        onChange={(e) => this.toggleDepFilter(e,"departmentId","click")} 
                                                        value={filterDepartments.filter(option => option.value === this.state.sobj.departmentId)} 
                                                        className="filter-selec2" size="sm" classNamePrefix="searchselect-inner" 
                                                        maxMenuHeight={200}    
                                                        />
                                                </Col>
                                                <Col className="">
                                                    <label>{this.props.t('category')}</label>
                                                    <Select 
                                                    placeholder={this.props.t("category")} 
                                                    options={filtercategoryList} 
                                                    onChange={(e) => this.togglecatFilter(e,"categoryId","click")} 
                                                    value={filtercategoryList.filter(option => option.value === this.state.sobj.categoryId)} 
                                                    className="filter-selec2" size="sm" classNamePrefix="searchselect-inner" 
                                                    maxMenuHeight={200}    
                                                    />
                                                </Col>
                                                <Col className="">
                                                    <label>{this.props.t('subcategory')}</label>
                                                    <Select 
                                                    placeholder={this.props.t("subcategory")} 
                                                    options={filterSubcategoryList} 
                                                    onChange={(e) => this.togglesubcatFilter(e,"subCategoryId","click")} 
                                                    value={filterSubcategoryList.filter(option => option.value === this.state.sobj.subCategoryId)} 
                                                    className="filter-selec2" size="sm" classNamePrefix="searchselect-inner" 
                                                    maxMenuHeight={200}    
                                                                />
                                                </Col>
                                                <Col className="">
                                                <label>{this.props.t('brand')}</label>
                                                    <Select 
                                                    placeholder={this.props.t("brand")} 
                                                    options={filterBrnadList} 
                                                    onChange={(e) =>  this.handleFilterObjectCombo(e,"brandId","click")} 
                                                    value={filterBrnadList.filter(option => option.value === this.state.sobj.brandId)} 
                                                    className="filter-selec2" size="sm" classNamePrefix="searchselect-inner" 
                                                    maxMenuHeight={200}    
                                                    />
                                                </Col>
                                                <Col className="">
                                                    <label>{this.props.t('suplable')}</label>
                                                    <Select 
                                                    placeholder={this.props.t("suplable")} 
                                                    options={filterSupplierList} 
                                                    onChange={(e) =>  this.handleFilterObjectCombo(e,"supplierId","click")} 
                                                    value={filterSupplierList.filter(option => option.value === this.state.sobj.supplierId)} 
                                                    className="filter-selec2" size="sm" classNamePrefix="searchselect-inner" 
                                                    maxMenuHeight={200}    
                                                                />
                                                </Col>
                                            </Col>
                                            <Col className={""+(this.props.isRTL==="rtl"?"rtlcon sepbox":"")} xs={this.props.size==="sm" ? 6 : 3}>
                                            {this.state.missingtypes.map((item, i) => {
                                                            return <React.Fragment key={i}>
                                                                {item.isProdType?<Col className="">
                                                                    <Form.Check type="checkbox" id={item.Name} name={item.Name} label={this.props.t("missingtypes."+item.Name)} disabled={this.state.sobj.completeStatus!=="None"?true:false}
                                                    checked={item.isCheck} onChange={()=>this.handleMissingSwitchChange(item)}
                                                            />
                                                                </Col>:<></>}
                                                            </React.Fragment>
                                                        })}
                                                        <hr />
                                            <Col className="diemntiondiv">
                                                <Col>
                                                    <label>{this.props.t('width')+" ("+this.props.t("MM")+")"}</label>
                                                    <ButtonGroup aria-label="Basic example">
                                                        <Button variant="secondary" title={this.props.t("equal")} active={(this.state.sobj.dimensions.width.searchCriteria===ProductSearchCritieriaTypes.Equal)?true:false}
                                                            onClick={() => this.handleDiamentions(ProductSearchCritieriaTypes.Equal,"width","",true)}>=</Button>
                                                        <Button variant="secondary" title={this.props.t("range")} className='selector' active={(this.state.sobj.dimensions.width.searchCriteria===ProductSearchCritieriaTypes.Range)?true:false} 
                                                            onClick={() => this.handleDiamentions(ProductSearchCritieriaTypes.Range,"width","",true)}><ArrowBothIcon size={12} /></Button>
                                                    </ButtonGroup>
                                                </Col>
                                                <div className="filter-diamention-box">
                                                    <Row>
                                                        <Col >
                                                            {this.state.sobj.dimensions.width.searchCriteria===ProductSearchCritieriaTypes.Equal?<></>:<label>{this.props.t('MIN')}</label>}
                                                            <Form.Control placeholder='Min'  type="number"  value={this.state.sobj.dimensions.width.lowerBound} onFocus={e => e.target.select()} onChange={e => this.handleDiamentions(e.target.value,"width","lbound",false,e,(this.state.sobj.dimensions.width.searchCriteria===ProductSearchCritieriaTypes.Range?(this.props.t('Character.min_width')):(this.props.t('Character.width'))))} onKeyDown={ (evt) => preventinputotherthannumbers(evt,this.state.sobj.dimensions.width.lowerBound,(this.state.sobj.dimensions.width.searchCriteria===ProductSearchCritieriaTypes.Range?(this.props.t('Character.min_width')):(this.props.t('Character.width')))) } />
                                                        </Col>
                                                        {(this.state.sobj.dimensions.width.searchCriteria===ProductSearchCritieriaTypes.Range)?<Col style={{}}>
                                                            <label>{this.props.t('MAX')}</label><br />
<Form.Control placeholder='MAX'  type="number"  value={this.state.sobj.dimensions.width.upperBound} onFocus={e => e.target.select()} onChange={e => this.handleDiamentions(e.target.value,"width","ubound",false,e,this.props.t('Character.max_width'))} onKeyDown={ (evt) => preventinputotherthannumbers(evt,this.state.sobj.dimensions.width.upperBound,(this.props.t('Character.max_width'))) } />
                                                        </Col>:<></>}
                                                    </Row>
                                                </div>
                                            </Col>
                                            <Col className="diemntiondiv">
                                                <label>{this.props.t('height')+" ("+this.props.t("MM")+")"}</label>
                                                <ButtonGroup aria-label="Basic example">
                                                    <Button variant="secondary" title={this.props.t("equal")} active={(this.state.sobj.dimensions.height.searchCriteria===ProductSearchCritieriaTypes.Equal)?true:false}
                                                        onClick={() => this.handleDiamentions(ProductSearchCritieriaTypes.Equal,"height","",true)}>=</Button>
                                                    <Button variant="secondary" title={this.props.t("range")} className='selector' active={(this.state.sobj.dimensions.height.searchCriteria===ProductSearchCritieriaTypes.Range)?true:false} 
                                                        onClick={() => this.handleDiamentions(ProductSearchCritieriaTypes.Range,"height","",true)}><ArrowBothIcon size={12} /></Button>
                                                </ButtonGroup>
                                                <div className="filter-diamention-box">
                                                    <Row>
                                                        <Col >
                                                        {this.state.sobj.dimensions.height.searchCriteria===ProductSearchCritieriaTypes.Equal?<></>:<label>{this.props.t('MIN')}</label>}
                                                        <Form.Control placeholder='Min'  type="number"  value={this.state.sobj.dimensions.height.lowerBound} onFocus={e => e.target.select()} onChange={e => this.handleDiamentions(e.target.value,"height","lbound",false,e,((this.state.sobj.dimensions.height.searchCriteria===ProductSearchCritieriaTypes.Range?this.props.t('Character.min_height'):this.props.t('Character.height'))))} onKeyDown={ (evt) => preventinputotherthannumbers(evt,this.state.sobj.dimensions.height.lowerBound,((this.state.sobj.dimensions.height.searchCriteria===ProductSearchCritieriaTypes.Range?this.props.t('Character.min_height'):this.props.t('Character.height'))) )} />
                                                        </Col>
                                                        {(this.state.sobj.dimensions.height.searchCriteria===ProductSearchCritieriaTypes.Range)?<Col style={{}}>
                                                            <label>{this.props.t('MAX')}</label><br />
                                                            <Form.Control placeholder='Max'  type="number"  value={this.state.sobj.dimensions.height.upperBound} onFocus={e => e.target.select()} onChange={e => this.handleDiamentions(e.target.value,"height","ubound",false,e,this.props.t('Character.max_height'))} onKeyDown={ (evt) => preventinputotherthannumbers(evt,this.state.sobj.dimensions.height.upperBound,(this.props.t('Character.max_height'))) } />
                                                        </Col>:<></>}
                                                    </Row>
                                                </div>
                                                </Col>
                                                <Col className="diemntiondiv">
                                                    <label>{this.props.t('depth')+" ("+this.props.t("MM")+")"}</label>
                                                    <ButtonGroup aria-label="Basic example">
                                                            <Button variant="secondary" title={this.props.t("equal")} active={(this.state.sobj.dimensions.depth.searchCriteria===ProductSearchCritieriaTypes.Equal)?true:false}
                                                            onClick={() => this.handleDiamentions(ProductSearchCritieriaTypes.Equal,"depth","",true)}>=</Button>
                                                            <Button variant="secondary" title={this.props.t("range")} className='selector' active={(this.state.sobj.dimensions.depth.searchCriteria===ProductSearchCritieriaTypes.Range)?true:false} 
                                                            onClick={() => this.handleDiamentions(ProductSearchCritieriaTypes.Range,"depth","",true)}><ArrowBothIcon size={12} /></Button>
                                                    </ButtonGroup>
                                                    <div className="filter-diamention-box">
                                                        <Row>
                                                            <Col >
                                                            {this.state.sobj.dimensions.depth.searchCriteria===ProductSearchCritieriaTypes.Equal?<></>:<label>{this.props.t('MIN')}</label>}
                                                            <Form.Control placeholder='Min'  type="number"  value={this.state.sobj.dimensions.depth.lowerBound} onFocus={e => e.target.select()} onChange={e => this.handleDiamentions(e.target.value,"depth","lbound",false,e,(this.state.sobj.dimensions.depth.searchCriteria===ProductSearchCritieriaTypes.Range?this.props.t('Character.min_depth'):this.props.t('Character.depth')))} onKeyDown={ (evt) => preventinputotherthannumbers(evt,this.state.sobj.dimensions.depth.lowerBound,(this.state.sobj.dimensions.depth.searchCriteria===ProductSearchCritieriaTypes.Range?this.props.t('Character.min_depth'):this.props.t('Character.depth'))) } />
                                                            </Col>
                                                            {(this.state.sobj.dimensions.depth.searchCriteria===ProductSearchCritieriaTypes.Range)?<Col style={{}}>
                                                                <label>{this.props.t('MAX')}</label><br />
                                                                <Form.Control placeholder='Max'  type="number"  value={this.state.sobj.dimensions.depth.upperBound} onFocus={e => e.target.select()} onChange={e => this.handleDiamentions(e.target.value,"depth","ubound",false,e,this.props.t('Character.max_depth'))} onKeyDown={ (evt) => preventinputotherthannumbers(evt,this.state.sobj.dimensions.depth.upperBound,(this.props.t('Character.max_depth'))) } />
                                                            </Col>:<></>}
                                                        </Row>
                                                    </div>
                                                </Col>
                                            </Col>
                                        </Row>
                                    </Col>
                                </Col>
                           
                                <Col xs={12} className="form-subcontent" style={{borderBottom:"none"}}>
                                    <Col xs={12} className="form-section">
                                        <Row style={{marginTop:"0px"}}>
                                            <Col xs={this.props.size==="sm" ? 6 : 4} className="filterdate-content">
                                                <label className='datecontent-label'>{this.props.t("filter_datetype.range")}</label>
                                                <Row>
                                                    <Col>
                                                        <small>{this.props.t('FILTER_ITEMS.startdate')}</small>
                                                        <DatePicker
                                                            dateFormat="dd/MM/yyyy"
                                                            placeholderText={"DD/MM/YYYY"}
                                                            popperPlacement="bottom-start"
                                                            showYearDropdown
                                                            className="datepicker-txt"
                                                            selected={searchObj.createdDateRange.fromDate}
                                                            onChange={(e)=>this.handleDateRelateds(e, "fromDate", true, "createdDateRange")}
                                                            onKeyDown={this.handleKeyDown}
                                                            />
                                                    </Col>
                                                    <Col>
                                                        <small>{this.props.t('FILTER_ITEMS.enddate')}</small>
                                                        <DatePicker
                                                            dateFormat="dd/MM/yyyy"
                                                            placeholderText={"DD/MM/YYYY"}
                                                            popperPlacement="bottom-start"
                                                            showYearDropdown
                                                            className="datepicker-txt"
                                                            selected={searchObj.createdDateRange.toDate}
                                                            onChange={(e)=>this.handleDateRelateds(e, "toDate", true, "createdDateRange")}
                                                            onKeyDown={this.handleKeyDown}
                                                            />
                                                    </Col>
                                                </Row>
                                            </Col>
                                            <Col xs={this.props.size==="sm" ? 6 : 2} className="filter-tagslist">
                                                <label className='datecontent-label'>{this.props.t("filter_datetype.count")}</label>
                                                <Row>
                                                    <Col className='form-inline'>
                                                        <small>{this.props.t('filter_datetype.backdays')}</small>
                                                        <Form.Control type="number"  value={searchObj.saleDateCount} onFocus={e => e.target.select()} onChange={e => this.handleDateRelateds(e, "saleDateCount", false, null, true)} onKeyDown={ (evt) => evt.key === "."?evt.preventDefault(): preventinputotherthannumbers(evt,searchObj.saleDateCount,(this.props.t('Character.saleDateCount'))) } />
                                                    </Col>
                                                </Row>
                                            </Col>
                                            <Col xs={this.props.size==="sm" ? 6 : 6} className="filter-tagslist">
                                                <label>{this.props.t('tags')}</label>
                                                <Select 
                                                    menuPlacement="top"
                                                        placeholder={this.props.t("Select_tags")} 
                                                        options={filterTagList} 
                                                        onChange={e => this.handleTags(e)} 
                                                        value={-1} 
                                                        className="filter-selec2" size="sm" classNamePrefix="searchselect-inner" 
                                                        maxMenuHeight={200}    
                                                    />
                                                <ul className='list-inline mpsim-tags prodftags'>
                                                    {this.state.displaytags.map((xitem, xidx) => {
                                                        return <li key={xidx} className='list-inline-item prod-tags' title={xitem.tagName}>
                                                            <span className='close-icon' style={{opacity:this.state.selectedBranchidx>0?"0.3":"1"}} onClick={() => this.removeTag(xidx)}><XIcon size={16} /></span>
                                                            {xitem.tagName.substring(0,25)+(xitem.tagName.length > 25?"..":"")}
                                                        </li>
                                                    })}
                                                </ul>
                                            </Col>
                                        </Row> 
                                    </Col>
                                </Col>
                                <Button type="button" variant="outline-secondary" className="filter-btn reset-btn" onClick={this.resetTableFilters}>{this.props.t('btnnames.reset')}</Button>
                            </Dropdown.Menu>
                        </Dropdown>
                        <span> <label className="filter-label">{this.props.t("SHOW_RESULTS")}</label>
                        <Form.Control style={{width:"60px"}} type="number"  value={this.state.maxShowresultcount} onChange={e => this.handleShowingresults(e)} onKeyDown={ (evt) => evt.key === "."? evt.preventDefault() : preventinputotherthannumbers(evt,this.state.maxShowresultcount,(this.props.t('Character.results'))) } /></span>
                        <Button type="button" variant="warning" className="search-link filter-btn" onClick={e => this.handleFilterObject(e,null,"click",true)}>{this.props.t('btnnames.search')}</Button>
                        <Button type="button" variant="outline-secondary" className="filter-btn" onClick={this.resetTableFilters}>{this.props.t('btnnames.reset')}</Button>
                       
                    </Col>

                    {this.state.isdataloaded && this.state.ftablebody && this.state.ftablebody.length > 0?
                        <AcTable isRTL={this.props.isRTL} t={this.props.t} aheaders={ftableheaders} totalresults={this.state.totalresults} startpage={this.state.startpage} alldata={this.state.toridata} asearchobj={this.state.sobj} abody={this.state.ftablebody} showpaginate={true} pagetype="ajax" pagecount={this.state.sobj.maxResult} handleRowClick={this.handleRowClick} handlePageChange={this.handlePageChange}/>
                    :this.state.isdataloaded?<>
                        <AcNoDataView />
                    </>:<></>}
                </Col>
            </Col>

            <Modal size={"lg"} show={this.state.showProductUpdateModal} className="prod-edit new-product-update-modal" dir={this.props.isRTL} onHide={()=>this.toggleProductUpdateModal()} backdrop="static" animation={false}>
                <Modal.Body style={{padding:"30px", background:"#F4F6F7"}}>
                    {
                        this.state.showProductUpdateModal === true ?
                        <>
                            <AddNewItemComponent
                                isRTL={this.props.isRTL}
                                prodState={this.state.selectedProduct}
                                ismodal={true}
                                hidemodal={this.toggleProductUpdateModal}
                                loadRowDetails={this.loadRowDetails}
                                hidedelete={true} 
                                size="sm"
                            />
                        </>:
                        <></>
                    }
                </Modal.Body>
            </Modal>
            <ExcelImportModel isRTL={this.props.isRTL}  t={this.props.t} openSuccessModelCloseExcelImpot={this.openSuccessModelCloseExcelImpot} showmodal={this.state.excelImportModel} onHide = {()=>this.setState({excelImportModel : false})} />
            <SuccessModel isRTL={this.props.isRTL} type={this.state.sucessType} t={this.props.t} showmodal={this.state.isSuccessModel} onHide = {()=>this.setState({isSuccessModel : false})} />
            <AcViewModal showmodal={!this.state.isdataloaded} />
            <AcViewModal showmodal={this.state.productdataloading} />
        </>);
    }
}

const mapDispatchToProps = dispatch => ({
    setProdView: (payload) => dispatch(viewSetAction(payload)),
    setProdPrevDetails: (payload) => dispatch(viewSetProdPrevAction(payload)),
});

export default withTranslation()(withRouter(connect(null,mapDispatchToProps)(ProductsComponent)));
