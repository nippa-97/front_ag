import React, { useEffect, useState } from 'react';
import { Badge, Button, Col, Form, FormSelect, ListGroup, Modal, Pagination, Table, OverlayTrigger, Tooltip } from 'react-bootstrap';
import DatePicker from "react-datepicker";
import { XIcon, DotFillIcon, ChevronLeftIcon, ChevronRightIcon, ChevronDownIcon, ChevronUpIcon, XCircleFillIcon } from '@primer/octicons-react';
import * as FileSaver from 'file-saver';
import * as XLSX from 'xlsx';
import {useDropzone} from 'react-dropzone';
import FeatherIcon from 'feather-icons-react';

import Lightbox from "react-awesome-lightbox";
import "react-awesome-lightbox/build/style.css";
import i18n from "../../_translations/i18n";

import { confirmAlert } from 'react-confirm-alert';
import 'react-confirm-alert/src/react-confirm-alert.css';

import { validateSets } from './ValidateSets';
import { submitSets } from './SubmitSets';

import { alertService } from '../../_services/alert.service';
import { objToQueryParam, btnPressedKeyCode, getPager, restrictDecimalPoint, countTextCharacter, preventinputotherthannumbers, preventinputToString, preventNumberInput} from '../../_services/common.service';
import { validateObj } from '../../_services/submit.service';

import { useTranslation } from 'react-i18next';
import Lottie from 'lottie-react';
import animationData1 from '../../assets/lotties/planigoloaders_lottie/loader_buttols.json';
import animationData2 from '../../assets/lotties/planigoloaders_lottie/loader_cans.json';
import animationData3 from '../../assets/lotties/planigoloaders_lottie/loaders_shelf.json';
import nodataIcon from '../../assets/img/nodata_icon.png';
import { TooltipWrapper } from '../newMasterPlanogram/AddMethods';

/**
 * AcButton is a common button component to show buttons/submit/validate purposes
 * it have own validation and save options 
 * completly driven by sending props and default props
 */
function AcButtonComponent(props) {
    const _isMounted = true;
  
    const [disableEvents, setDisableEvents] = useState(false);
    const { t } = useTranslation();
    useEffect(() => {
        // Anything in here is fired on component mount.
        return () => {
            // Anything in here is fired on component unmount.
            //_isMounted = false;
        }
    }, [])
    

    //handle onclick button
    const handleClick = () => {
        if (props.asubmit !== undefined) {
            if(props.aconfirm){
                confirmAlert({
                    title: (props.confirmtitle?props.confirmtitle:t('CONFIRM_TO_SUBMIT')),
                    message: (props.confirmmsg?props.confirmmsg:t('ARE_YOU_SURE_TO_CONTINUE_THIS_TASK')),
                    buttons: [{
                        label: t('btnnames.yes'),
                        onClick: () => {
                            if(props.adelete === true){
                                handleDeleteClick();
                            }
                            else{
                                handleSaveClick();
                            }
                        }
                    }, {
                        label: t('btnnames.no'),
                        onClick: () => {
                            //
                        }
                    }
                    ]
                });
            } else{
                handleSaveClick();
            }
        } else{
            if (props.aresp !== undefined) {
                props.aresp(false);
            }
        }
    }
    //backend save call function
    const handleSaveClick = () => {
        var cdata = (props.asubmit.queryparam ? objToQueryParam(props.aobj) : props.aobj); //if call have query params this converts object to query params
        if(props.avalidate && Object.keys(props.avalidate).length > 0){ //check validations available, if true check validations
            Object.keys(props.avalidate).forEach(((mitem) => {
                if(typeof props.avalidate[mitem] === "object"){
                    var newArray = (typeof props.avalidate[mitem] === "object"?props.avalidate[mitem].join(" "):"");
                    props.avalidate[mitem] = newArray;
                }
            }));
        }
    
        var checkobj = validateObj(props.avalidate, props.aobj); //validate object values
        
        if (checkobj.status) { //if validate okay
            if(_isMounted){ setDisableEvents(true) }//disable btn
            //isloading available
            if(props.aloading !== undefined){ 
                props.aloading(true) 
            }
            submitSets(props.asubmit, cdata, true).then(res => {
                if(_isMounted && !res.payload){
                    setDisableEvents(false) //enable btn
                }
                if (props.aresp !== undefined) {
                    props.aresp(res); //send response to button handle response
                }
                if(props.aloading !== undefined){ 
                    props.aloading(false) 
                }
            });
        } else {
            alertService.error(checkobj.msg); //send alert if error occured
            if (props.aresp !== undefined) {
                props.aresp(checkobj);
            }
        }
    }

    const handleDeleteClick = () => {
        var cdata = (props.asubmit.queryparam ? objToQueryParam(props.aobj) : props.aobj); //if call have query params this converts object to query params
        if(_isMounted){ setDisableEvents(true) }//disable btn
        //isloading available
        if(props.aloading !== undefined){ 
            props.aloading(true) 
        }
        submitSets(props.asubmit, cdata, true).then(res => {
            if(_isMounted && !res.payload){
                setDisableEvents(false) //enable btn
            }
            if (props.aresp !== undefined) {
                props.aresp(res); //send response to button handle response
            }
            if(props.aloading !== undefined){ 
                props.aloading(false) 
            }
        });
    }

    
        var cuslist = (props.aclass!==undefined?props.aclass:"");
        return (
            <Button ref={props.aref} id={props.eleid?props.eleid:""} variant={props.avariant} className={cuslist} onClick={handleClick} disabled={props.disabled||disableEvents} style={{marginLeft:"10px"}}>
                {props.atitle !== undefined ? props.atitle : props.children}
            </Button>
        )
    
}

class AcInputComponent extends React.Component {
    _isMounted = false;

    constructor(props) {
        super(props);

        this.state = {
            cval: "", //default value
            validatestate: null, //validate state
            validatemsg: "", //validate message
            valchanged: false, //is changed value
            warningclses: "", //warning class sets
        }
    }
    //update state onchange props
    static getDerivedStateFromProps(props) {
        return { cval: (props.aobj && props.aobj[props.aid] !== undefined ? props.aobj[props.aid] : "") };
    }

    componentDidMount() {
        this._isMounted = true;
        //get obj val or defval and set to cval also updates cobj val
        var cobj = this.props.aobj;
        if ((cobj !== undefined && cobj[this.props.aid] !== undefined) || this.props.adefval !== undefined) {
            if(this._isMounted){this.setState({ cval: (cobj[this.props.aid] ? cobj[this.props.aid] : this.props.adefval ? this.props.adefval : ""), warningclses:"" });}
            cobj[this.props.aid] = (cobj[this.props.aid] ? cobj[this.props.aid] : this.props.adefval ? this.props.adefval : "");
        } else{
            //if type=select set defval as data list's first value if available
            if(cobj !== undefined && this.props.atype === "select" && this.props.adata && Object.keys(this.props.adata).length > 0){
                cobj[this.props.aid] = Object.keys(this.props.adata)[0];
            }
        }
        //validate object values set
        if (cobj !== undefined && this.props.avset !== undefined) {
            var cvobj = this.props.avset;
            cvobj[this.props.aid] = this.props.avalidate;
        }
    }

    componentWillUnmount(){
        this._isMounted = false;
    }

    //validate input validators
    handleValidate = async (ctxt,e) => {
        if(this.props.removeSpecialCharacter){
            if(e){
                if(this.props.isFull){
                    if(e.key === "."){
                        e.preventDefault()
                        return
                    }
                }
                const check2 = preventinputotherthannumbers(e,ctxt,this.props.msg);
                if(!check2){
                    e.preventDefault();
                    return     
                }
            
            }
        }
        if(this.props.isInt){
            if(e.target.value&& preventNumberInput(e.target.value,this.props.t('validation.NumberInputValidation'))){
                e.preventDefault()
                return
            }
        }
        if(this.props.restrictDecimalPoint && this.props.restrictDecimalPoint > 0){
            const check = restrictDecimalPoint(ctxt,this.props.restrictDecimalPoint);
   
            if(check){
                e.preventDefault();
                return
            }
        }
     
        if(this.props.characterValidate && this.props.characterValidate  > 0){
            if(e){
                const count = countTextCharacter(ctxt);
                if((count > this.props.characterValidate)){
                    alertService.error(this.props.msg)
                    e.preventDefault();
                    return
                }
            }
           
        }
        if(this.props.validateString){
            if(e){
                if(!preventinputToString(e,e.target.value,this.props.msg)){
                    e.preventDefault();
                    return 
                }
            }
       
        }

        var cvalarr = this.props.avalidate ? this.props.avalidate : []; //get validators from props
        var creturns = validateSets(this.props.aplace, cvalarr, ctxt); //send to validateSets and validate with val

        if(this.props.achange){this.props.achange(creturns.cval);} //if onchange event avalilable trigget it
        
        this.setState({ //update states
            validatestate: creturns.validatestate,
            validatemsg: creturns.validatemsg,
            cval: creturns.cval,
            warningclses: (creturns.warclass?creturns.warclass:"")
        });
        if (this.props.aobj !== undefined) { //update main object value
            var cobj = this.props.aobj;
            cobj[this.props.aid] = creturns.cval;
        }
    }
    //onpress commonservice->btnPressedKeyCode and key enter event handler available trigger onenter key event
    handleKeyEnter = (e) => {
        if(e.which === btnPressedKeyCode && this.props.akeyenter){
            this.props.akeyenter();
        }
        if(this.props.removeSpecialCharacter){
            if(this.props.isFull){
                if(e.key === "."){
                    e.preventDefault()
                    return
                }
            }
            preventinputotherthannumbers(e,e.target.value,this.props.msg)
        }

        if(this.props.validateString){
            preventinputToString(e,e.target.value,this.props.msg)
        }

    }
    render() {
        var csdata = this.props.adata; //if select -> get data list
        var cdefval = this.state.cval; //get default value
        //loop through data list and create options list
        var csdataordered = {};
        if(csdata){Object.keys(csdata).sort().forEach(function(key) {csdataordered[key] = csdata[key];});}
        var seldata = (csdataordered ? Object.keys(csdataordered).map(function (key, idx) { return <option value={key} key={idx}>{csdataordered[key]}</option>; }) : "");
        var cuslist = (this.props.aclass!==undefined?" "+this.props.aclass:"");
        //render element with given type - ex: date,textarea,select
        return (
            <div className="mtd-form-field" style={{ marginBottom: "10px" }}>
                {this.props.atype === "date" ?
                    <DatePicker className={"form-control form-control-sm form__field" + cuslist + " "+this.state.warningclses} selected={this.state.cval} dateFormat="yyyy-MM-dd" onBlur={e => this.handleValidate(e.target.value)} onChange={date => this.handleValidate(date)} disabled={this.props.disabled} />
                    : this.props.atype === "time" ?
                        <DatePicker className={"form-control form-control-sm form__field" + cuslist + " "+this.state.warningclses} selected={this.state.cval} dateFormat="hh:mm a" onBlur={e => this.handleValidate(e.target.value)} onChange={date => this.handleValidate(date)} showTimeSelect showTimeSelectOnly disabled={this.props.disabled} />
                        : this.props.atype === "textarea" ?
                            <textarea id={this.props.eleid?this.props.eleid:""} rows={this.props.arows} value={cdefval !== "" ? cdefval : ""} className={"form-control form-control-sm form__field" + cuslist + " "+this.state.warningclses} placeholder={this.props.aplace} onBlur={e => this.handleValidate(e.target.value)} onChange={e => this.handleValidate(e.target.value)} disabled={this.props.disabled} ></textarea>
                            : this.props.atype === "select" ?
                                <select id={this.props.eleid?this.props.eleid:""} className={"form-control form-control-sm form__field" + cuslist + " "+this.state.warningclses} value={cdefval !== "" ? cdefval : ""} onChange={e => this.handleValidate(e.target.value)} disabled={this.props.disabled} >
                                    {seldata}
                                </select>
                                // : this.props.atype === "number" ?<input  type="text" id={this.props.eleid?this.props.eleid:""} value={cdefval !== "" ? cdefval : ""} className={"form-control form-control-sm form__field" + cuslist + " "+this.state.warningclses} placeholder={this.props.aplace} onBlur={e => this.handleValidate(e.target.value)} onKeyDown={e => this.handleKeyEnter(e)} onChange={e => this.handleValidate(e.target.value,e)} disabled={this.props.disabled} autoComplete={this.props.autocomp} autoFocus={this.props.autofocus}/>
                                //     : <input  type={this.props.atype} id={this.props.eleid?this.props.eleid:""} value={cdefval !== "" ? cdefval : ""} className={"form-control form-control-sm form__field" + cuslist + " "+this.state.warningclses} placeholder={this.props.aplace} onBlur={e => this.handleValidate(e.target.value)} onKeyDown={e => this.handleKeyEnter(e)} onChange={e => this.handleValidate(e.target.value,e)} disabled={this.props.disabled} autoComplete={this.props.autocomp} autoFocus={this.props.autofocus}/>}
                                : <input type={this.props.atype === "number"?"text":this.props.atype} id={this.props.eleid?this.props.eleid:""} 
                                    value={cdefval !== "" ? cdefval : ""} 
                                    inputMode={this.props.atype === "number"?"numeric":"text"}
                                    pattern={this.props.atype === "number"?"[0-9]{13,19}":""}
                                    className={"form-control form-control-sm form__field" + cuslist + " "+this.state.warningclses} 
                                    placeholder={this.props.aplace} 
                                    onBlur={e => this.handleValidate(e.target.value,e)} 
                                    onKeyDown={e => this.handleKeyEnter(e)} 
                                    onChange={e => this.handleValidate(e.target.value,e)} 
                                    disabled={this.props.disabled} autoComplete={this.props.autocomp} 
                                    autoFocus={this.props.autofocus} />}

                {this.props.aplace?<label className="form__label">{this.props.aplace}<span className={"form_label_reqstar "+(this.props.arequired===true?"":" d-none")} style={{color:"red"}}>*</span></label>:<></>}
                {this.state.validatestate && this.props.showlabel ? <label style={{color:"#FCB941"}} className={"valabel " + this.state.validatestate + (this.props.errorAlign?" down":" ")}>{this.state.validatemsg}</label> : <></>}
            </div>
        )
    }
}
//export option for AcTable
const ExportCSV = ({csvData, fileName}) => {

    const fileType = 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet;charset=UTF-8';
    const fileExtension = '.xlsx';

    const exportToCSV = (csvData, fileName) => {
        const ws = XLSX.utils.json_to_sheet(csvData);
        const wb = { Sheets: { 'data': ws }, SheetNames: ['data'] };
        const excelBuffer = XLSX.write(wb, { bookType: 'xlsx', type: 'array' });
        const data = new Blob([excelBuffer], {type: fileType});
        FileSaver.saveAs(data, fileName + fileExtension);
    }

    return (
        <Button type="button" variant="secondary" className="export-link" onClick={(e) => exportToCSV(csvData,fileName)}>Export</Button>
    )
}

class AcTableComponent extends React.Component{
    _isMounted = false;

    constructor(props) {
        super(props);

        this.state = {
            ctableheaders: [],
            ctablebody: [], cpagebydata: [],
            pageItemsList: [], defaultPageCount: 10, currentPage: 1, totalPages: 0, //pagination
            isonloadtable: true, totalresultscount: 0,
        }
    }

    componentDidMount(){
        this._isMounted = true;
        if(this._isMounted){
            this.setState({
                ctableheaders: this.props.aheaders,
                ctablebody: this.props.abody,
                pagedItemsList: this.props.abody,
                cpagebydata: this.props.alldata,
                currentPage: this.props.startpage,
                totalresultscount: this.props.totalresults,
            }, () => {
                if(this.state.currentPage > 1 && this.props.asearchobj && Object.keys(this.props.asearchobj).length > 0){
                    this.setPage(this.state.currentPage,false);
                } else{
                    this.setPage(1,false);
                }
            });
        }
    }

    componentWillUnmount() {
        this._isMounted = false;
    }
    //pager
    setPage = (cpage,isnewpage) => {
        var pageLength = (this.props.pagecount?this.props.pagecount:this.state.defaultPageCount);
        var citems = (this.state.ctablebody?JSON.parse(JSON.stringify(this.state.ctablebody)):[]);
        var pager = getPager(this.state.totalresultscount,cpage,pageLength);
        // check page isn't out of range
        if (cpage < 1 || cpage > pager.totalPages) {
            this.setState({
                pageItemsList: [],
                currentPage: 1,
                totalPages: 0
            });
            return;
        }

        var cfindList = (this.state.toridata?this.state.toridata.find(x => x.page === this.state.startpage):undefined);

        if(isnewpage && this.props.pagetype&&this.props.pagetype==="ajax"&&this.props.handlePageChange){
            if(cfindList&&cfindList){
                this.setState({
                    ctablebody: cfindList
                });
            } else{
                this.props.handlePageChange(cpage);
            }
        }

        this.setState({
            pageItemsList:citems,
            currentPage: pager.currentPage,
            totalPages: pager.totalPages,
            isonloadtable: false,
        });
    }
    //table sort
    handleTableSort = (eidx,etype) => {
        var ctablebody = this.props.abody;
        var csorted = (eidx>-1?(etype==="ASC"?([].concat(ctablebody).sort((a, b) => a[eidx] > b[eidx] ? 1 : -1)):([].concat(ctablebody).sort((a, b) => a[eidx] < b[eidx] ? 1 : -1))):ctablebody);

        this.setState({
            ctablebody: csorted
        }, () => {
            if(this.props.handleChangeSort){
                this.props.handleChangeSort(csorted);
            }
        });
    }
    //set filter object
    handleFilterObject = (evt) => {

    }
    //table search
    handleTableSearch = (evt,etype) => {
        if(etype === "click" || (etype === "enter" && evt.which === 13)){
            var ctxt = evt.target.value;
            var ctablebody = this.props.abody;

            var csorted = [].concat(ctablebody).filter((fitem) => {
                var foundobj = false;
                for (var j = 0; j < Object.keys(fitem).length; j++) {
                    var cftxt = (typeof fitem[j] === "object"?(fitem[j].text!==undefined?fitem[j].text:""):fitem[j]);
                    if(cftxt.toLowerCase().includes(ctxt.toLowerCase())){
                        foundobj = true;
                    }
                }
                return (foundobj === true?fitem:null);
            });
            this.setState({
                ctablebody: csorted
            });
            setTimeout(() => {
                this.setPage(1,false);
            }, 200);
        }
    }
    //handle row click
    handleTrowClick = (cidx,citem,caction) => {
        if(this.props.handleRowClick !== undefined){
            this.props.handleRowClick(cidx,citem,caction);
        }
    }
    handleTableValue = (value)=>{
        let result = value;
        if(typeof(value) === "string"){
            if(value.length > 200){
                result = (
                <OverlayTrigger placement={"bottom"} overlay={<Tooltip id={`tooltip-bottom`}>{value}</Tooltip> }>
                   <span> {value.substring(0,200)+"..."} </span>
                </OverlayTrigger>
                )
            }else{
                result = (<span> {value} </span>)
            }
        }else{
            result = (<span> {value} </span>)
        }
        return result
    }

    render() {
        //table headers
        var cheaders = (this.props.aheaders?(this.props.aheaders.map((chead,hidx) => {
            let headtxt = (typeof chead === "object"?chead.text:chead)
            return <th key={hidx} className={typeof chead === "object" && chead.class?chead.class:""} style={typeof chead === "object" && chead.width?{width: chead.width}:{}}>{headtxt} {headtxt!==""?<>
            <span onClick={e => this.handleTableSort(hidx,"ASC")}><ChevronUpIcon size={12}/></span>
            <span onClick={e => this.handleTableSort(hidx,"DESC")}><ChevronDownIcon size={12}/></span></>:<></>}</th>;
        })):<></>);
        //sort options
        var csortlist = (this.props.aheaders?(this.props.aheaders.map((chead,oidx) => {
            return <option key={oidx} value={oidx} className={chead===""?"d-none":""}>{chead}</option>;
        })):<></>);
        //tbody data
        var cviewdata = (this.props.pagetype&&this.props.pagetype==="page"?this.state.pageItemsList:this.state.ctablebody);
        
        //export data
        var exportdata = [];
        exportdata.push(this.props.aheaders);
        cviewdata.forEach(cbody => {
            var cobj = Object.keys(cbody).map((sidx) =>{
                return (cbody[sidx] && typeof cbody[sidx] === "object"?(cbody[sidx].type==="image"?"":cbody[sidx].type==="status"?cbody[sidx].text:cbody[sidx]):cbody[sidx]);
            });
            exportdata.push(cobj);
        });
        //table view
        var cbody = (cviewdata?(cviewdata.map((cbody,bidx) => {
            return <tr key={bidx}>
                {Object.keys(cbody).map((sidx) =>{
                    return <td width={1} key={sidx} onClick={e => (cbody[sidx].type && (cbody[sidx].type==="button" || cbody[sidx].type==="checkbox")?false:this.handleTrowClick(bidx,cbody))} className={cbody[sidx] && typeof cbody[sidx] === "object"?(cbody[sidx].type==="image"?"text-center":""):""}>
                    {cbody[sidx] && typeof cbody[sidx] === "object"?(cbody[sidx].type==="image"?
                    <img src={cbody[sidx].url} className={cbody[sidx].style?cbody[sidx].style:""} alt="" />:
                    cbody[sidx].type==="status"?
                    <Badge style={{textTransform:"uppercase"}} bg={cbody[sidx].variant}><DotFillIcon/> {cbody[sidx].text}</Badge>
                    :cbody[sidx].type==="color"?
                    <div className="color-label" style={{backgroundColor:(cbody[sidx].color?cbody[sidx].color:"#555")}}></div>
                    :cbody[sidx].type==="lbllist"?
                    <div className="" style={{}}>{
                        cbody[sidx].list?cbody[sidx].list.map((titem, tagindx) => (
                            <Badge style={{ margin: "2px" }} key={tagindx} bg={cbody[sidx].variant} variant={cbody[sidx].variant}>{titem}</Badge>
                        )):<></>
                    }</div>
                    :cbody[sidx].type==="icon"?
                        <TooltipWrapper text={cbody[sidx].placeholder}>{cbody[sidx].icon}</TooltipWrapper>
                    :cbody[sidx].type==="button"?
                    <Button title={cbody[sidx].title?cbody[sidx].title:""} variant={cbody[sidx].variant} size={cbody[sidx].size} className={cbody[sidx].class?cbody[sidx].class:""} onClick={() => this.handleTrowClick(bidx,cbody,cbody[sidx].action)}>
                        {cbody[sidx].icon?<FeatherIcon icon={cbody[sidx].icon} size={cbody[sidx].iconsize?cbody[sidx].iconsize:16} />:<></>} 
                        {cbody[sidx].text}
                    </Button>
                    :cbody[sidx].type==="checkbox"?
                        <input type="checkbox" className='form-check-input' checked={cbody[sidx].isChecked===true ?"checked":""} onChange={() => this.handleTrowClick(bidx,cbody,cbody[sidx].action)} />
                    :
                    <></>)
                    :(sidx === "0"?"":this.handleTableValue(cbody[sidx]))}</td>;
                
                })}
            </tr>;
        })):<></>);
        //list view
        var clistbody = (cviewdata?(cviewdata.map((cbody,bidx) => {
            return <ListGroup.Item key={bidx} onClick={e => this.handleTrowClick(bidx,cbody)}><Col style={{position:"relative",padding:"0px"}}>
                 {Object.keys(cbody).map((sidx, scidx) =>{
                    return <div key={scidx} className={(scidx > 1?"small-content ":"")+(cbody[sidx] && typeof cbody[sidx] === "object"?(cbody[sidx].type==="image"?"text-center":""):"")}>{cbody[sidx] && typeof cbody[sidx] === "object"?(cbody[sidx].type==="image"?
                    <></>: cbody[sidx].type==="status"?
                    <Badge bg={cbody[sidx].variant}><DotFillIcon size={10}/> {cbody[sidx].text}</Badge>
                    :cbody[sidx].type==="color"?
                    <div className="color-label" style={{backgroundColor:(cbody[sidx].color?cbody[sidx].color:"#555")}}></div>
                    :cbody[sidx].type==="lbllist"?
                    <div className="" style={{marginTop:"5px"}}>{
                        cbody[sidx].list?cbody[sidx].list.map((titem, tagindx) => (
                            <Badge style={{ margin: "2px", position:"relative" }} key={tagindx} variant={cbody[sidx].variant}>{titem}</Badge>
                        )):<></>
                    }</div>
                    :cbody[sidx].type==="icon"?
                        <TooltipWrapper text={cbody[sidx].placeholder}>{cbody[sidx].icon}</TooltipWrapper>
                    :<></>)
                    :(sidx === "0"?"":cbody[sidx])}</div>;
                })}
            </Col></ListGroup.Item>;
        })):<></>);

        //pagecounts
        var cpcount = (this.props.pagecount?this.props.pagecount:this.state.defaultPageCount);
        var ptotalresults = (this.props.totalresults?this.props.totalresults:0);
        var pstartcount = (this.state.currentPage > 1?((cpcount * (this.state.currentPage - 1))):1);
        var pendcount = (ptotalresults > (cpcount * this.state.currentPage)?((cpcount * this.state.currentPage)):ptotalresults);

        return (<>
            <Col className="filter-form form-inline">
                {this.props.showfilters?<>
                <label className="filter-label">Search</label>
                <Form.Control placeholder="Search" onKeyUp={e => this.handleTableSearch(e,"enter")}/>
                <label className="filter-label">Filter by</label>
                <FormSelect>
                    <option value="">All</option>
                    {csortlist}
                </FormSelect>
                <Button type="button" variant="warning" className="search-link" onClick={e => this.handleTableSearch(e,"click")}>Search</Button>
                </>:<></>}
                {this.props.showexport?<ExportCSV csvData={exportdata} fileName="exportfile_test"/>:<></>}
            </Col>
            {this.props.showfilters?
            <Col className="filter-tags div-con d-none">
                <Button variant="warning">Company Name <XIcon size="14"/></Button>
                <Button variant="warning">Status <XIcon size="14"/></Button>
            </Col>
            :<></>}
            <Col  className="d-none d-sm-block" style={{padding:"0px"}}>
                <Table className="filter-table" striped hover size="sm">
                    <thead>
                        <tr>{cheaders}</tr>
                    </thead>
                    <tbody>{cbody}</tbody>
                </Table>
            </Col>
            <Col xs={12} className="d-block d-sm-none" style={{padding:"0px"}}>
                <ListGroup className="filter-list">{clistbody}</ListGroup>
            </Col>

            {this.props.showpaginate && this.state.pageItemsList.length > 0?<>
                <Badge bg="light" className="filtertable-showttxt" style={{color:"#142a33"}}>
                    {this.props.isRTL===""?<>{this.props.t("results")} {ptotalresults} {this.props.t("of")} {pendcount} {this.props.t("to")} {pstartcount} {this.props.t("showing")}</>:<>{this.props.t("showing")} {pstartcount} {this.props.t("to")} {pendcount} {this.props.t("of")} {ptotalresults} {this.props.t("results")}</>}
                </Badge>
                <Pagination>
                    <Pagination.Item onClick={() => this.setPage(1,true)} disabled={(this.state.currentPage === 1?true:false)}><ChevronLeftIcon/><ChevronLeftIcon/></Pagination.Item>
                    <Pagination.Item onClick={() => this.setPage((this.state.currentPage - 1),true)} disabled={(this.state.currentPage === 1?true:false)}><ChevronLeftIcon/></Pagination.Item>
                    <label>{this.state.currentPage} / {(this.state.totalPages?this.state.totalPages:0)}</label>
                    <Pagination.Item onClick={() => this.setPage((this.state.currentPage + 1),true)} disabled={(this.state.currentPage === this.state.totalPages?true:false)}><ChevronRightIcon/></Pagination.Item>
                    <Pagination.Item onClick={() => this.setPage(this.state.totalPages,true)} disabled={(this.state.currentPage === this.state.totalPages?true:false)}><ChevronRightIcon/><ChevronRightIcon/></Pagination.Item>
                </Pagination>

            </>:<></>}
        </>);
    }
}

function AcDropzoneComponent(props) {
    const { t } = useTranslation();
    var cfileobj = props.updatedImage?{preview:props.updatedImage}:null;

    const [files, setFiles] = useState([]);
    const [previewImg, handleTogglePreview] = useState(false);

    const {getRootProps, getInputProps} = useDropzone({
        accept: (props.acceptTypes?props.acceptTypes:'image/*'),
        thumbnailWidth: 160,
        thumbnailHeight: 160,
        maxSize: 5242880, //max 5mb
        multiple: (props.multiple?true:false),
        onDrop: acceptedFiles => {
            if(acceptedFiles.length > 0){
                setFiles(acceptedFiles.map(file => Object.assign(file, {
                    preview: URL.createObjectURL(file)
                })));
                if(props.handleDropImage){
                    props.handleDropImage(acceptedFiles);
                }
            }
        },
        onDropRejected: errarr => {
            if(errarr.length > 0){
                if(errarr[0].errors[0].code === "file-too-large"){
                    alertService.error(t("IMAGE_IS_LARGER_THAN_5MB"));
                }
            }
        }
    });

    var thumbs = <></>;
    if(files.length > 0){
        thumbs = files.map((file,fidx) => (
        <div key={fidx} className="thumb">
            <img src={file.preview} onClick={() => changeImagePreview(file)} alt="" />
        </div>
        ));
    } else{
        if(cfileobj){
            thumbs = <div className="thumb">
                <img src={cfileobj.preview} onClick={() => changeImagePreview(cfileobj)} alt="" />
            </div>
        }
    }

    const changeImagePreview = (cobj) => {
        handleTogglePreview(cobj.preview);
    }

    useEffect(() => () => {
      // Make sure to revoke the data uris to avoid memory leaks
      files.forEach(file => URL.revokeObjectURL(file.preview));
    }, [files]);

    return (<>
        <section className="dropzone-container">
            <div {...getRootProps({className: 'dropzone'})}>
            <input {...getInputProps()} />
            <p>{t("DRAG_N_DROP_SOME_FILES_HERE_OR_CLICK")}</p>
            </div>
            {props.showPreviews?
            <aside>
                {thumbs}
            </aside>:<></>}
        </section>
        <Modal show={previewImg?true:false} onHide={() => handleTogglePreview(!previewImg)}>
            <Modal.Body className="text-center dzone-preview">
                <span onClick={() => handleTogglePreview(false)} style={{position:"absolute",right:"15px",cursor:"pointer"}}><XCircleFillIcon size={20}/></span>
                <img src={previewImg} className="img-fluid" style={{minHeight:"25rem"}} alt=""/>
            </Modal.Body>
        </Modal>
    </>

    );
}

function AcLoadingModalComponent(props) {
    let [defAnimation, SetDefAnime] = useState(animationData1);
    let [showLoader, SetShowLoader] = useState(false);

    const { t } = useTranslation();

    useEffect(() => {
        //onmodal show checks
        if(props.showmodal === true){
            //check animation default value set in session storage
            if(sessionStorage.getItem("pgdefanime")){
                //get default animation object 
                let defanime = JSON.parse(sessionStorage.getItem("pgdefanime"));
                //console.log(defanime);
                
                if(!defanime.stillLoading){
                    //get default and current times
                    let getdeftime = new Date(defanime.datetime).getTime();
                    let getcurtime = new Date().getTime();
                    //reduce current time from default time and convert it to seconds
                    let timegap = ((getcurtime - getdeftime) / 1000);
                    //if seconds are more than 10secs 
                    if(timegap > 5){
                        //if type 1, sets animation type 2
                        if(defanime.type === 1){
                            SetDefAnime(animationData2);
                            
                            defanime["type"] = 2;
                            defanime["datetime"] = new Date();
                        } else if(defanime.type === 2){
                            //if type 2, sets animation type 3
                            SetDefAnime(animationData3);

                            defanime["type"] = 3;
                            defanime["datetime"] = new Date();

                        } else if(defanime.type === 3){
                            //if type 3, sets animation type 1(resets)
                            SetDefAnime(animationData1);

                            defanime["type"] = 1;
                            defanime["datetime"] = new Date();
                        }
                    }
                    //sets still animation loading to true;
                    defanime["stillLoading"] = true;
                    //update new date times
                    sessionStorage.setItem("pgdefanime", JSON.stringify(defanime));  
                } else{
                    SetDefAnime(defanime.type === 2?animationData2:defanime.type === 3?animationData3:animationData1);
                }

                SetShowLoader(true);
            } else{
                //if default animation is not available in session storage sets default as 1
                SetDefAnime(animationData1);

                let defanime = {type: 1, datetime: new Date()};
                //sets still animation loading to true;
                defanime["stillLoading"] = true;
                //update new date times
                sessionStorage.setItem("pgdefanime", JSON.stringify(defanime));

                SetShowLoader(true);
            }
        } else{
            // if(showLoader){
                if(sessionStorage.getItem("pgdefanime")){
                    //get default animation object 
                    let defanime = JSON.parse(sessionStorage.getItem("pgdefanime"));
                    //sets still animation loading to false;
                    defanime["stillLoading"] = false;
                    //update new date times
                    sessionStorage.setItem("pgdefanime", JSON.stringify(defanime));
                }  
                    
                SetShowLoader(false);    
            // }
        }
    },[props.showmodal, showLoader]);

    return (<Modal show={showLoader} animation={false} className="loadingmodal-main centered" style={{width:"250px",marginTop:"calc(100vh / 3)"}}>
    <Modal.Body className="text-center">
        {/* <div className="animewrapper animation-2 col-centered">
            <div className="shape shape1"></div>
            <div className="shape shape2"></div>
            <div className="shape shape3"></div>
            <div className="shape shape4"></div>
        </div> */}
        <div style={{width: "140px", height: "140px", margin: "0 auto"}}>
            <Lottie animationData={defAnimation} loop={true} />
        </div>
        <Col style={{marginTop:"15px"}}><h4 className="text-center" style={{fontWeight:"300"}}>{props.message?props.message:t("LOADING")}</h4></Col>
    </Modal.Body>
</Modal>);
}

export function AcNoDataComponent(props){
    return <div className={'nodata-content'+(props.className?(" "+props.className):"")}>
        {props.customComponent?<>{props.customComponent}</>
        :<>
            <img src={nodataIcon} className='img-fluid' alt='' />
            <h3>{i18n.t("No_Data_Available")}</h3>
        </>}
    </div>;
}


function AcConfirmView(props){
    let [isShowConfirm, setShowConfirm] = useState(true);

    const handleClose = () => {
        setShowConfirm(false);
    }

    return <Modal show={isShowConfirm} onHide={handleClose}>
    <Modal.Body>Woohoo, you're reading this text in a modal!

        <ul className='list-inline text-center'>
            <li className='list-inline-item'>
                <Button variant="secondary" onClick={handleClose}>Close</Button>
            </li>
            <li className='list-inline-item'>
                <Button variant="primary" onClick={handleClose}>Save Changes</Button>
            </li>
        </ul>
    </Modal.Body>
  </Modal>
}

function AcLightBoxComp(props){
    return (props.datalist && props.datalist.length > 0?<>
    {props.datalist.length === 1?
    <Lightbox 
        image={props.datalist[0]}
        title={props.title?props.title:null}
        showTitle={props.showcount?props.showcount:false} startIndex={props.startindex?props.startindex:0}
        allowZoom={props.allowZoom?props.allowZoom:false}
        allowRotate={props.allowRotate?props.allowRotate:false}
        allowReset={props.allowReset?props.allowReset:false}
        doubleClickZoom={false}
        onClose={() => (props.onClose?props.onClose():null)}
        />
    :
    <Lightbox 
        images={props.datalist} 
        showTitle={props.showcount?props.showcount:false} startIndex={props.startindex?props.startindex:0} 
        allowZoom={props.allowZoom?props.allowZoom:false}
        allowRotate={props.allowRotate?props.allowRotate:false}
        allowReset={props.allowReset?props.allowReset:false}
        doubleClickZoom={false}
        onClose={() => (props.onClose?props.onClose():null)}
        />
    }
    </>:<></>);
}

export { AcButtonComponent, AcInputComponent, AcTableComponent, AcDropzoneComponent, AcLoadingModalComponent, AcConfirmView, AcLightBoxComp };
