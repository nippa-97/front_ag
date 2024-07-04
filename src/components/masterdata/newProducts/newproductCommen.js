
import React from 'react';
import { Col, Button, Badge, Form, Modal, Table, Alert, FormSelect, OverlayTrigger, Tooltip } from "react-bootstrap";
import FeatherIcon from 'feather-icons-react';

import { ProductSearchCritieriaTypes } from "../../../enums/productsEnum";
import { getPager, convertDateTime, maxInputLength } from '../../../_services/common.service';
import { Icons } from '../../../assets/icons/icons';
import { DotFillIcon, XIcon } from '@primer/octicons-react';
import { PopoverWrapper } from '../../newMasterPlanogram/AddMethods';

export function isdiamentionfilterOn(diemntions){
    var bool = false
    
      if( diemntions.width.searchCriteria!==ProductSearchCritieriaTypes.Equal){
        bool= true
      }else if(diemntions.width.lowerBound!==0){
            bool= true
        }else if( diemntions.height.searchCriteria!==ProductSearchCritieriaTypes.Equal){
            bool= true
          }else if(diemntions.height.lowerBound!==0){
                bool= true
            }else if( diemntions.depth.searchCriteria!==ProductSearchCritieriaTypes.Equal){
                bool= true
              }else if(diemntions.depth.lowerBound!==0){
                    bool= true
                }else{
                    bool=false
                }
      return bool
   
  }

export function MultipleSelectList(props) {
  return <Col xs={12} className="multiselect-container newproducts-filters">
    <ul className='list-inline newfilter-list'>
        <li className='list-inline-item'>
            <Button className="selectall" variant='outline-danger' size='sm' onClick={() => props.selectAllProds()}>
              <Badge bg='danger'>{props.multiSelectList && props.multiSelectList[props.viewtype]?props.multiSelectList[props.viewtype].length:0}</Badge> 
              {props.t("multiselect.all")}
            </Button>
        </li>
        {props.multiSelectList && props.multiSelectList[props.viewtype] && props.multiSelectList[props.viewtype].length > 0?<>
            <li className='list-inline-item margin'>
                <Button variant='outline-danger' size='sm' onClick={() => props.selectAllProds(true)}>{props.t("multiselect.unselect")}</Button>
            </li>
            {/* {props.viewtype === "newProds"?<>
                <li className='list-inline-item'>
                    <Button variant='danger' onClick={() => props.multiSelectAction(1)} size='sm'>{props.t("SEND_TO_DEP")}</Button>
                </li>
                <li className='list-inline-item'>
                    <Button variant='outline-primary' onClick={() => props.multiSelectAction(2)} size='sm'>{props.t("ARCHIVE")}</Button>
                </li>
            </>:<>
                <li className='list-inline-item'>
                    <Button variant='warning' onClick={() => props.multiSelectAction(3)} size='sm'>{props.t("btnnames.restore")}</Button>
                </li>
            </>} */}
        </>:<></>}
        
        <li className={'list-inline-item right-actions'+(props.EditProdEnable?" active-sidebar":"")}>
            <Col className='form-inline'>
                <label className='filter-label'>{props.t("multiselect.allaction")}</label>
                <FormSelect size='sm' className='searchbox' value={(props.multiSelectList?props.multiSelectList.allAction:-1)} onChange={e => props.updateMultiSelect("allAction", false, e.target.value)}>
                    <option value={-1}>{props.t("NONE")}</option>
                    {props.viewtype === "newProds"?<>
                        <option value={1}>{props.t("SEND_TO_DEP")}</option>
                        <option value={2}>{props.t("ARCHIVE")}</option>
                    </>:<>
                        <option value={3}>{props.t("btnnames.restore")}</option>
                    </>}
                </FormSelect>
                <Button type='button' variant='danger' onClick={() => props.triggerAllAction()} size='sm'>{props.t("APPLY")}</Button>
            </Col>
        </li>
    </ul>
  </Col>
}

export class ResponseProdsModal extends React.Component{
    constructor(props){
        super(props);

        this._isMounted = false;

        this.state = {
            oridata:[], bkpOriData: [],
            paginatedList:[],
            currentPage: 1,
            totalPages: 0,

            pageLength: 8,
            freeSearchTxt: "",
        }
    }

    componentDidMount(){
        this._isMounted = true;

        if(this._isMounted){
            if(this.props.responseObj){
                let prods = (this.props.responseObj?this.props.responseObj.prods:[]);
                this.setState({ oridata: prods, bkpOriData: prods },()=>{
                    this.setPage(1);
                });
            } 
        }
    }

    componentWillUnmount(){
        this._isMounted = false;
    }

    setPage = (cpage) => {
        var citems = JSON.parse(JSON.stringify(this.state.oridata));
        var pager = getPager(citems.length, cpage, this.state.pageLength);

        // check page isn't out of range
        if (cpage < 1 || cpage > pager.totalPages) {
            return;
        }
        var sspage = (pager.currentPage === 1 ? 0 : ((pager.currentPage - 1) * this.state.pageLength));
        var sepage = (pager.currentPage * this.state.pageLength);
        this.setState({
            paginatedList: citems.slice(sspage, sepage),
            currentPage: pager.currentPage,
            totalPages: pager.totalPages,
        });
    }

    changeSearchFilter = (etxt) =>{
        let filteredData = [];
        let allprods = JSON.parse(JSON.stringify(this.state.bkpOriData));
        let text = etxt.toLowerCase();
        this.setState({ freeSearchTxt: etxt });

        if(text !== ""){
            for (let i = 0; i < allprods.length; i++) {
                let barcode = allprods[i].barcode.toLowerCase();
                let name = allprods[i].productName.toLowerCase();
    
                if(barcode.includes(text) || name.includes(text)){
                    filteredData.push(allprods[i]);
                }
            }

        } else{
            filteredData = allprods;
        }
        
        this.setState({oridata:filteredData, paginatedList:(filteredData.length===0?[]:this.state.paginatedList)},()=>{
            this.setPage(1);
        });
    }

    _handleKeyDown = (evt) => {
        let charCode = ((evt.which) ? evt.which : evt.keyCode);

        if (charCode > 31 && (charCode < 48 || charCode > 57)){
            return false;
        }
        return true;
    }

    changeFilters = (type, value) => {
        if(type === "freeSearchValue"){
            this.changeSearchFilter(value);
        } 
        else if(type === "resultsCount"){
            this.setState({ pageLength: (parseFloat(value) > 100?100:parseFloat(value) > 0?parseFloat(value):1) }, () => {
                this.setPage(1);
            });
        }
    }

    render(){
        let resptype = (this.props.responseObj && this.props.responseObj.responseType?this.props.responseObj.responseType:"")

        return <>
            <Modal show={true} className="store-product-adding-modal responseprods-modal " dir={this.props.isRTL} onHide={this.props.toggleResponseModal} backdrop="static">
                <Modal.Header>
                    <Modal.Title style={{fontSize:"22px",fontWeight:"700"}}>{resptype === "archive"?this.props.t('ARCHIVE_PRODS'):resptype === "restore"?this.props.t('RESTORED_PRODS'):resptype === "sendtodep"?this.props.t('SENT_DEPPRODS'):"-"}</Modal.Title>
                </Modal.Header>
                <Modal.Body>
                    <Col className="newproducts-filters">
                        <Col xs={6} className="sub-design">
                            <Col className='searchbox' >
                                <Form.Control 
                                    type="text" 
                                    maxLength={maxInputLength}
                                    placeholder={this.props.t("searchproduct")} 
                                    onFocus={e => e.target.select()}
                                    onChange={(e) => this.changeFilters("freeSearchValue",e.target.value)}  
                                    value={this.state.freeSearchTxt}
                                />
                                {Icons.SearchIcon("#4F4F4F",14)}
                            </Col>    
                        </Col>
                        <Col xs={6} className="sub-design text-right">
                            <Col className='searchbox number float-right'>
                                <label>{this.props.t("resultscount")}</label>
                                <Form.Control 
                                    type="number" 
                                    placeholder={this.props.t("resultscount")} 
                                    onFocus={e => e.target.select()}
                                    onChange={(e) => this.changeFilters("resultsCount",e.target.value)}  
                                    value={this.state.pageLength}
                                    onKeyDown={this._handleKeyDown}
                                />
                            </Col>   
                        </Col>
                    </Col>

                    <Col className='products-list'>
                        <Table size='small'>
                            {this.state.oridata.length > 0?
                                <thead>
                                    <tr><th width="160px">{this.props.t("barcode")}</th><th>{this.props.t("productname")}</th><th className='text-center' width="25px">{this.props.t("CATELOGUE_FILTERS.status")}</th></tr>
                                </thead>
                            :<></>}
                            <tbody>{
                                this.state.paginatedList.map((item,index)=>{
                                    return(<React.Fragment key={index}>
                                        <tr>
                                            <td className='barcode'>{item.barcode}</td>
                                            <td className='name'>
                                                {item.productName}
                                                {!item.success?<Alert variant={'danger'}>{item.response}</Alert>:<></>}
                                            </td>
                                            <td className='status'>{item.success?<Badge bg='success'>{this.props.t("RESPONSE_STAT.updated")}</Badge>:<Badge bg='danger'>{this.props.t("RESPONSE_STAT.failed")}</Badge>}</td>
                                        </tr>
                                        <tr className='empty-row'><td colSpan={3}></td></tr>
                                    </React.Fragment>);
                                })
                            }</tbody>
                        </Table>
                        {this.state.oridata.length === 0?
                            <h6 className='resolve_no_res_found_txt'>{this.props.t("NORESULTFOUNDSEARCH")}</h6>:<></> 
                        } 
                    </Col>

                    <Col xs={12} className={"pagination-section "+(this.state.paginatedList.length>0?"":"d-none")}>
                        <div className={"btn-group btn-group-sm pagination-main "+(this.props.isRTL==="rtl" ?"float-right":"float-left")}>
                            <span ><Button variant="outline-secondary" size="sm" onClick={() => this.setPage(1)} disabled={(this.state.currentPage === 1 ? true : false)} ><FeatherIcon size={14} icon="chevrons-left"/></Button></span>
                            <span ><Button variant="outline-secondary"  size="sm" onClick={() => this.setPage((this.state.currentPage - 1))} disabled={(this.state.currentPage === 1 ? true : false)}>
                                <span className=''><FeatherIcon size={14} icon="chevron-left"/></span>
                            </Button></span>
                            <Button size="sm" className='total' variant='light' disabled={true}>{this.state.currentPage} / {this.state.totalPages}</Button>
                            <span ><Button variant="outline-secondary"  size="sm" onClick={() => this.setPage((this.state.currentPage + 1))} disabled={(this.state.currentPage === this.state.totalPages ? true : false)} >
                                <span className=''><FeatherIcon size={14} icon="chevron-right"/></span>
                                
                            </Button></span>
                            <span ><Button variant="outline-secondary" size="sm" onClick={() => this.setPage(this.state.totalPages)} disabled={(this.state.currentPage === this.state.totalPages ? true : false)} ><FeatherIcon size={14} icon="chevrons-right"/></Button></span>
                        </div>
                    </Col>
                </Modal.Body>
                <Modal.Footer>
                    <Button variant="danger" disabled={(this.state.isSaveLoading===true ? true : false)} onClick={this.props.toggleResponseModal} type="button" style={{borderRadius:"25px"}}>{this.props.t('OKAY_NOTED')}</Button>     
                </Modal.Footer>
            </Modal>
        </>;
    }
}








export class MasterPlanogramImplementationModal extends React.Component{
    constructor(props){
        super(props);

        this._isMounted = false;

        this.state = {
            oridata:[], bkpOriData: [],
            paginatedList:[],
            currentPage: 1,
            totalPages: 0,

            pageLength: 8,
            freeSearchTxt: "",
        }
    }

    componentDidMount(){
        this._isMounted = true;

        if(this._isMounted){
     
            if(this.props.responseObj){ 
                let prods = (this.props.responseObj?this.props.responseObj.implementedDetails:[]);
                this.setState({ oridata: prods, bkpOriData: prods },()=>{
                    this.setPage(1);
                });
            } 
        }
    }

    componentWillUnmount(){
        this._isMounted = false;
    }

    setPage = (cpage) => {
        var citems = JSON.parse(JSON.stringify(this.state.oridata));
        var pager = getPager(citems.length, cpage, this.state.pageLength);

        // check page isn't out of range
        if (cpage < 1 || cpage > pager.totalPages) {
            return;
        }
        var sspage = (pager.currentPage === 1 ? 0 : ((pager.currentPage - 1) * this.state.pageLength));
        var sepage = (pager.currentPage * this.state.pageLength);
        this.setState({
            paginatedList: citems.slice(sspage, sepage),
            currentPage: pager.currentPage,
            totalPages: pager.totalPages,
        });
    }

    changeSearchFilter = (etxt) =>{
        let filteredData = [];
        let allprods = JSON.parse(JSON.stringify(this.state.bkpOriData));
        let text = etxt.toLowerCase();
        this.setState({ freeSearchTxt: etxt });

        if(text !== ""){
            for (let i = 0; i < allprods.length; i++) {
                let name = allprods[i].storeName.toLowerCase();
    
                if(name.includes(text)){
                    filteredData.push(allprods[i]);
                }
            }

        } else{
            filteredData = allprods;
        }
        
        this.setState({oridata:filteredData, paginatedList:(filteredData.length===0?[]:this.state.paginatedList)},()=>{
            this.setPage(1);
        });
    }

    _handleKeyDown = (evt) => {
        let charCode = ((evt.which) ? evt.which : evt.keyCode);

        if (charCode > 31 && (charCode < 48 || charCode > 57)){
            return false;
        }
        return true;
    }

    changeFilters = (type, value) => {
        if(type === "freeSearchValue"){
            this.changeSearchFilter(value);
        } 
        else if(type === "resultsCount"){
            this.setState({ pageLength: (parseFloat(value) > 100?100:parseFloat(value) > 0?parseFloat(value):1) }, () => {
                this.setPage(1);
            });
        }
    }

    redirectToPlanogram = (citem) => {
        const spgobj = { id: citem.floorLayoutId, tags: [], isnotsredirect: true };
        this.props.planogramViewRedirect(spgobj);
        this.props.toggleResponseModal();
    }

    render(){
    
        return <>
            <Modal show={true} className={"store-product-adding-modal responseprods-modal Implementation "+this.props.isRTL} onHide={this.props.toggleResponseModal} backdrop="static" >
                <Modal.Body >
                    <div className='closebtn' onClick={() => this.props.toggleResponseModal()}><XIcon size={25} /></div>
                    <Col>
                        <div className='pb-4'>
                            <div className='d-flex flex-row justify-content-between header-wrapper'>
                                <span className='main-title' style={{"fontSize":"24px","fontWeight":"700"}}>{this.props.t("MP_IMPLEMENTATION")}</span>
                                <div className='d-flex flex-column align-items-end version-details' style={{"color":"#808080"}}>
                                    <span style={{fontWeight: "700"}}>{this.props.responseObj?.masterPlanogramName}</span>
                                    <span>{"v"+this.props.responseObj?.masterPlanogramVersion}</span>
                                </div>
                            </div>
                            <div className='d-flex gap-2' style={{"position":"absolute","marginTop":"-15px","color":"#808080","fontSize":"18px"}}>
                                <span style={{"fontSize":"18px","fontWeight":"700"}}>{this.props.responseObj?.departmentName}</span>
                                <span>{this.props.t("CatelogImportLogTypes.Department")}</span>
                            </div>
                        </div>
                   
                    </Col>
                    <Col className="newproducts-filters">
                        <Col xs={6} className="sub-design">
                            <Col className='searchbox' >
                                <Form.Control 
                                    maxLength={maxInputLength}
                                    type="text" 
                                    placeholder={this.props.t("searchstore")} 
                                    onFocus={e => e.target.select()}
                                    onChange={(e) => this.changeFilters("freeSearchValue",e.target.value)}  
                                    value={this.state.freeSearchTxt}
                                />
                                {Icons.SearchIcon("#4F4F4F",14)}
                            </Col>    
                        </Col>
                        <Col xs={6} className="sub-design text-right">
                            <Col className={'searchbox number'+(this.props.isRTL === "rtl"?" float-left":" float-right")}>
                                <label>{this.props.t("resultscount")}</label>
                                <Form.Control 
                                    type="number" 
                                    className='text-right'
                                    placeholder={this.props.t("resultscount")} 
                                    onFocus={e => e.target.select()}
                                    onChange={(e) => this.changeFilters("resultsCount",e.target.value)}  
                                    value={this.state.pageLength}
                                    onKeyDown={this._handleKeyDown}
                                />
                            </Col>   
                        </Col>
                    </Col>

                    <Col className='products-list'>
                        <Table size='small'>
                            {this.state.oridata.length > 0?
                                <thead>
                                    <tr>
                                        <th width="160px">{this.props.t("STORE")}</th>
                                        <th>{this.props.t("DESCRIPTION")}</th>
                                        <th width="160px">{this.props.t("planogram")}</th>
                                        <th width="150px">{this.props.t("date")}</th>
                                        <th> </th>
                                    </tr>
                                </thead>
                            :<></>}
                            <tbody>{
                                this.state.paginatedList.map((item,index)=>{
                                    return(<React.Fragment key={index}>
                                        <tr>
                                            <td>{item.storeName}</td>
                                            <td>{item.description}</td>
                                            <td>
                                                <div className='d-flex flex-column'>
                                                <Badge bg="warning" style={{"width":"auto"}}><DotFillIcon/> {(item.floorStatus+" v"+item.planogramVersion)}</Badge> 
                                                </div>
                                            </td>
                                            <td> { convertDateTime(item.date)}</td>
                                            <td><span className='ext-link' onClick={() => this.redirectToPlanogram(item)}><FeatherIcon icon="external-link" size={20} /></span></td>
                                        </tr>
                                        <tr className='empty-row'><td colSpan={3}></td></tr>
                                    </React.Fragment>);
                                })
                            }</tbody>
                        </Table>
                        {this.state.oridata.length === 0?
                            <h6 className='resolve_no_res_found_txt'>{this.props.t("NORESULTFOUNDSEARCH")}</h6>:<></> 
                        } 
                    </Col>

                    <Col xs={12} className={"pagination-section "+(this.state.paginatedList.length>0?"":"d-none")}>
                        <div className={"btn-group btn-group-sm pagination-main "+(this.props.isRTL==="rtl" ?"float-right":"float-left")}>
                            <span ><Button variant="outline-secondary" size="sm" onClick={() => this.setPage(1)} disabled={(this.state.currentPage === 1 ? true : false)} ><FeatherIcon size={14} icon="chevrons-left"/></Button></span>
                            <span ><Button variant="outline-secondary"  size="sm" onClick={() => this.setPage((this.state.currentPage - 1))} disabled={(this.state.currentPage === 1 ? true : false)}>
                                <span className=''><FeatherIcon size={14} icon="chevron-left"/></span>
                            </Button></span>
                            <Button size="sm" className='total' variant='light' disabled={true}>{this.state.currentPage} / {this.state.totalPages}</Button>
                            <span ><Button variant="outline-secondary"  size="sm" onClick={() => this.setPage((this.state.currentPage + 1))} disabled={(this.state.currentPage === this.state.totalPages ? true : false)} >
                                <span className=''><FeatherIcon size={14} icon="chevron-right"/></span>
                                
                            </Button></span>
                            <span ><Button variant="outline-secondary" size="sm" onClick={() => this.setPage(this.state.totalPages)} disabled={(this.state.currentPage === this.state.totalPages ? true : false)} ><FeatherIcon size={14} icon="chevrons-right"/></Button></span>
                        </div>
                    </Col>
                </Modal.Body>
                <Modal.Footer>
                    <Button variant="danger" disabled={(this.state.isSaveLoading===true ? true : false)} onClick={this.props.toggleResponseModal} type="button" style={{borderRadius:"25px"}}>{this.props.t('OKAY_NOTED')}</Button>     
                </Modal.Footer>
            </Modal>
        </>;
    }
}



export class ExcelBulkImportUpdateDetailsModel extends React.Component{
    constructor(props){
        super(props);

        this._isMounted = false;

        this.state = {
            oridata:[], bkpOriData: [],
            paginatedList:[],
            currentPage: 1,
            totalPages: 0,

            pageLength: 8,
            freeSearchTxt: "",
        }
    }

    componentDidMount(){
        this._isMounted = true;

        if(this._isMounted){
            if(this.props.responseObj){
                let prods = (this.props.responseObj?this.props.responseObj.prods:[]);
                this.setState({ oridata: prods, bkpOriData: prods },()=>{
                    this.setPage(1);
                });
            } 
        }
    }

    componentWillUnmount(){
        this._isMounted = false;
    }

    setPage = (cpage) => {
        var citems = JSON.parse(JSON.stringify(this.state.oridata));
        var pager = getPager(citems.length, cpage, this.state.pageLength);

        // check page isn't out of range
        if (cpage < 1 || cpage > pager.totalPages) {
            return;
        }
        var sspage = (pager.currentPage === 1 ? 0 : ((pager.currentPage - 1) * this.state.pageLength));
        var sepage = (pager.currentPage * this.state.pageLength);
        this.setState({
            paginatedList: citems.slice(sspage, sepage),
            currentPage: pager.currentPage,
            totalPages: pager.totalPages,
        });
    }

    changeSearchFilter = (etxt) =>{
        let filteredData = [];
        let allprods = JSON.parse(JSON.stringify(this.state.bkpOriData));
        let text = etxt.toLowerCase();
        this.setState({ freeSearchTxt: etxt });

        if(text !== ""){
            for (let i = 0; i < allprods.length; i++) {
                let barcode = (allprods[i].barcode).toLowerCase();
                let name = allprods[i].productName?allprods[i].productName.toLowerCase():null;
    
                if(name){
                    if(barcode.includes(text) || name.includes(text)){
                        filteredData.push(allprods[i]);
                    }
                }else{
                    if(barcode.includes(text)){
                        filteredData.push(allprods[i]);
                    }
                }
              
            }

        } else{
            filteredData = allprods;
        }
        
        this.setState({oridata:filteredData, paginatedList:(filteredData.length===0?[]:this.state.paginatedList)},()=>{
            this.setPage(1);
        });
    }

    _handleKeyDown = (evt) => {
        let charCode = ((evt.which) ? evt.which : evt.keyCode);

        if (charCode > 31 && (charCode < 48 || charCode > 57)){
            return false;
        }
        return true;
    }

    changeFilters = (type, value) => {
        if(type === "freeSearchValue"){
            this.changeSearchFilter(value);
        } 
        else if(type === "resultsCount"){
            this.setState({ pageLength: (parseFloat(value) > 100?100:parseFloat(value) > 0?parseFloat(value):1) }, () => {
                this.setPage(1);
            });
        }
    }

    render(){

        return <>
            <Modal show={true} className="store-product-adding-modal responseprods-modal " dir={this.props.isRTL} onHide={this.props.toggleResponseModal} backdrop="static">
                <Modal.Header>
                    <Modal.Title style={{fontSize:"22px",fontWeight:"700"}}>{this.props.t('Excel_Import_Bulk_Update_Details')}</Modal.Title>
                </Modal.Header>
                <Modal.Body>
                    <Col className="newproducts-filters">
                        <Col xs={6} className="sub-design">
                            <Col className='searchbox' >
                                <Form.Control 
                                    maxLength={maxInputLength}
                                    type="text" 
                                    placeholder={this.props.t("searchproduct")} 
                                    onFocus={e => e.target.select()}
                                    onChange={(e) => this.changeFilters("freeSearchValue",e.target.value)}  
                                    value={this.state.freeSearchTxt}
                                />
                                {Icons.SearchIcon("#4F4F4F",14)}
                            </Col>    
                        </Col>
                        <Col xs={6} className="sub-design text-right">
                            <Col className='searchbox number float-right'>
                                <label>{this.props.t("resultscount")}</label>
                                <Form.Control 
                                    type="number" 
                                    placeholder={this.props.t("resultscount")} 
                                    onFocus={e => e.target.select()}
                                    onChange={(e) => this.changeFilters("resultsCount",e.target.value)}  
                                    value={this.state.pageLength}
                                    onKeyDown={this._handleKeyDown}
                                />
                            </Col>   
                        </Col>
                    </Col>

                    <Col className='products-list'>
                        <Table size='small'>
                            {this.state.oridata.length > 0?
                                <thead>
                                    <tr>
                                        <th>{this.props.t("barcode")}</th>
                                        <th>{this.props.t("productname")}</th>
                                        <th>{this.props.t("DESCRIPTION")}</th>
                                        <th>{this.props.t("ACTION")}</th>
                                        <th className='text-center' width="25px">{this.props.t("CATELOGUE_FILTERS.status")}</th>
                                    </tr>
                                </thead>
                            :<></>}
                            <tbody >{
                                this.state.paginatedList.map((item,index)=>{
                                    return(<React.Fragment key={index}>
                                        <tr>
                                            <td><TextToolTip text={item.barcode} /></td>
                                            <td>
                                                {item.productName?<TextToolTip text={item.productName} />:"-"}
                                            </td>
                                            <td>
                                                {item.updateStatus === "None" && <Alert className='excelImport-danger' variant={'danger'}><TextToolTip text={item.description} /></Alert>} 
                                                {item.updateStatus === "Full Data" && <TextToolTip text={item.description} />} 
                                                {item.updateStatus === "Half Data" && <Alert className='excelImport-warning' variant={"warning"}><TextToolTip text={item.description} /></Alert>} 
                                            </td>
                                            <td>{item.action}</td>
                                            <td>{item.status === "Failed"?<Badge bg='danger'>{item.status}</Badge>:<Badge bg='success'>{item.status}</Badge>}</td>
                                        </tr>
                                        <tr className='empty-row'><td colSpan={3}></td></tr>
                                    </React.Fragment>);
                                })
                            }</tbody>
                        </Table>
                        {this.state.oridata.length === 0?
                            <h6 className='resolve_no_res_found_txt'>{this.props.t("NORESULTFOUNDSEARCH")}</h6>:<></> 
                        } 
                    </Col>

                    <Col xs={12} className={"pagination-section "+(this.state.paginatedList.length>0?"":"d-none")}>
                        <div className={"btn-group btn-group-sm pagination-main "+(this.props.isRTL==="rtl" ?"float-right":"float-left")}>
                            <span ><Button variant="outline-secondary" size="sm" onClick={() => this.setPage(1)} disabled={(this.state.currentPage === 1 ? true : false)} ><FeatherIcon size={14} icon="chevrons-left"/></Button></span>
                            <span ><Button variant="outline-secondary"  size="sm" onClick={() => this.setPage((this.state.currentPage - 1))} disabled={(this.state.currentPage === 1 ? true : false)}>
                                <span className=''><FeatherIcon size={14} icon="chevron-left"/></span>
                            </Button></span>
                            <Button size="sm" className='total' variant='light' disabled={true}>{this.state.currentPage} / {this.state.totalPages}</Button>
                            <span ><Button variant="outline-secondary"  size="sm" onClick={() => this.setPage((this.state.currentPage + 1))} disabled={(this.state.currentPage === this.state.totalPages ? true : false)} >
                                <span className=''><FeatherIcon size={14} icon="chevron-right"/></span>
                                
                            </Button></span>
                            <span ><Button variant="outline-secondary" size="sm" onClick={() => this.setPage(this.state.totalPages)} disabled={(this.state.currentPage === this.state.totalPages ? true : false)} ><FeatherIcon size={14} icon="chevrons-right"/></Button></span>
                        </div>
                    </Col>
                </Modal.Body>
                <Modal.Footer>
                    <Button variant="danger" disabled={(this.state.isSaveLoading===true ? true : false)} onClick={this.props.toggleResponseModal} type="button" style={{borderRadius:"25px"}}>{this.props.t('OKAY_NOTED')}</Button>     
                </Modal.Footer>
            </Modal>
        </>;
    }
}

const TextToolTip = ({text}) => {
  return (
    <OverlayTrigger placement={"bottom"} overlay={<Tooltip id={`tooltip-bottom`}>{text}</Tooltip> }>
        <span>{text}</span>
    </OverlayTrigger>   
  )
}
export class NewProductApplyDetailsModel extends React.Component{
    constructor(props){
        super(props);

        this._isMounted = false;

        this.state = {
            oridata:[], bkpOriData: [],
            paginatedList:[],
            currentPage: 1,
            totalPages: 0,

            pageLength: 8,
            freeSearchTxt: "",
        }
    }

    componentDidMount(){
        this._isMounted = true;

        if(this._isMounted){
            if(this.props.responseObj){
                let prods = (this.props.responseObj?this.props.responseObj:[]);
                this.setState({ oridata: prods, bkpOriData: prods },()=>{
                    this.setPage(1);
                });
            } 
        }
    }

    componentWillUnmount(){
        this._isMounted = false;
    }

    setPage = (cpage) => {
        var citems = JSON.parse(JSON.stringify(this.state.oridata));
        var pager = getPager(citems.length, cpage, this.state.pageLength);

        // check page isn't out of range
        if (cpage < 1 || cpage > pager.totalPages) {
            return;
        }
        var sspage = (pager.currentPage === 1 ? 0 : ((pager.currentPage - 1) * this.state.pageLength));
        var sepage = (pager.currentPage * this.state.pageLength);
        this.setState({
            paginatedList: citems.slice(sspage, sepage),
            currentPage: pager.currentPage,
            totalPages: pager.totalPages,
        });
    }

    changeSearchFilter = (etxt) =>{
        let filteredData = [];
        let allprods = JSON.parse(JSON.stringify(this.state.bkpOriData));
        let text = etxt.toLowerCase();
        this.setState({ freeSearchTxt: etxt });

        if(text !== ""){
            for (let i = 0; i < allprods.length; i++) {
                let name  = (allprods[i].productName).toLowerCase();
                if(name.includes(text)){
                    filteredData.push(allprods[i]);
                }
            }

        } else{
            filteredData = allprods;
        }
        
        this.setState({oridata:filteredData, paginatedList:(filteredData.length===0?[]:this.state.paginatedList)},()=>{
            this.setPage(1);
        });
    }

    _handleKeyDown = (evt) => {
        let charCode = ((evt.which) ? evt.which : evt.keyCode);

        if (charCode > 31 && (charCode < 48 || charCode > 57)){
            return false;
        }
        return true;
    }

    changeFilters = (type, value) => {
        if(type === "freeSearchValue"){
            this.changeSearchFilter(value);
        } 
        else if(type === "resultsCount"){
            this.setState({ pageLength: (parseFloat(value) > 100?100:parseFloat(value) > 0?parseFloat(value):1) }, () => {
                this.setPage(1);
            });
        }
    }

    render(){

        return <>
            <Modal show={true} className="store-product-adding-modal responseprods-modal" dir={this.props.isRTL} onHide={this.props.toggleResponseModal} backdrop="static">
                <Modal.Header>
                    <Modal.Title style={{fontSize:"22px",fontWeight:"700"}}>{this.props.t('Apply_Products_Details')}</Modal.Title>
                </Modal.Header>
                <Modal.Body>
                    <Col className="newproducts-filters">
                        <Col xs={6} className="sub-design">
                            <Col className='searchbox' >
                                <Form.Control 
                                    maxLength={maxInputLength}
                                    type="text" 
                                    placeholder={this.props.t("searchproduct")} 
                                    onFocus={e => e.target.select()}
                                    onChange={(e) => this.changeFilters("freeSearchValue",e.target.value)}  
                                    value={this.state.freeSearchTxt}
                                />
                                {Icons.SearchIcon("#4F4F4F",14)}
                            </Col>    
                        </Col>
                        <Col xs={6} className="sub-design text-right">
                            <Col className='searchbox number float-right'>
                                <label>{this.props.t("resultscount")}</label>
                                <Form.Control 
                                    type="number" 
                                    placeholder={this.props.t("resultscount")} 
                                    onFocus={e => e.target.select()}
                                    onChange={(e) => this.changeFilters("resultsCount",e.target.value)}  
                                    value={this.state.pageLength}
                                    onKeyDown={this._handleKeyDown}
                                />
                            </Col>   
                        </Col>
                    </Col>

                    <Col className='products-list'>
                        <Table size='small'>
                            {this.state.oridata.length > 0?
                                <thead>
                                    <tr>
                                        <th>{this.props.t("productname")}</th>
                                        <th>{this.props.t('Apply_Result')}</th>
                                    </tr>
                                </thead>
                            :<></>}
                            <tbody>{
                                this.state.paginatedList.map((item,index)=>{
                                    return(<React.Fragment key={index}>
                                        <tr>
                                            <td className='name'>{item.productName?item.productName:"-"}</td>
                                            <td className='status'>
                                                {item.status === "fail"?
                                                    <PopoverWrapper text={<>{this.props.t('Replace_Product_Not_Available')}</>} trigger={["hover","focus"]}>
                                                        <Badge bg='danger' style={{width:"auto"}}>{this.props.t('Replace_Product_Not_Available')}</Badge>
                                                    </PopoverWrapper>
                                                :
                                                <PopoverWrapper text={<>{this.props.t("Applied")}</>} trigger={["hover","focus"]}>
                                                    <Badge bg='success'>{this.props.t("Applied")}</Badge>
                                                </PopoverWrapper>
                                                }
                                            </td>
                                        </tr>
                                        <tr className='empty-row'><td colSpan={3}></td></tr>
                                    </React.Fragment>);
                                })
                            }</tbody>
                        </Table>
                        {this.state.oridata.length === 0?
                            <h6 className='resolve_no_res_found_txt'>{this.props.t("NORESULTFOUNDSEARCH")}</h6>:<></> 
                        } 
                    </Col>

                    <Col xs={12} className={"pagination-section "+(this.state.paginatedList.length>0?"":"d-none")}>
                        <div className={"btn-group btn-group-sm pagination-main "+(this.props.isRTL==="rtl" ?"float-right":"float-left")}>
                            <span ><Button variant="outline-secondary" size="sm" onClick={() => this.setPage(1)} disabled={(this.state.currentPage === 1 ? true : false)} ><FeatherIcon size={14} icon="chevrons-left"/></Button></span>
                            <span ><Button variant="outline-secondary"  size="sm" onClick={() => this.setPage((this.state.currentPage - 1))} disabled={(this.state.currentPage === 1 ? true : false)}>
                                <span className=''><FeatherIcon size={14} icon="chevron-left"/></span>
                            </Button></span>
                            <Button size="sm" className='total' variant='light' disabled={true}>{this.state.currentPage} / {this.state.totalPages}</Button>
                            <span ><Button variant="outline-secondary"  size="sm" onClick={() => this.setPage((this.state.currentPage + 1))} disabled={(this.state.currentPage === this.state.totalPages ? true : false)} >
                                <span className=''><FeatherIcon size={14} icon="chevron-right"/></span>
                                
                            </Button></span>
                            <span ><Button variant="outline-secondary" size="sm" onClick={() => this.setPage(this.state.totalPages)} disabled={(this.state.currentPage === this.state.totalPages ? true : false)} ><FeatherIcon size={14} icon="chevrons-right"/></Button></span>
                        </div>
                    </Col>
                </Modal.Body>
                <Modal.Footer>
                    <Button variant="danger"  onClick={this.props.toggleResponseModal} type="button" style={{borderRadius:"25px"}}>{this.props.t('OKAY_NOTED')}</Button>     
                </Modal.Footer>
            </Modal>
        </>;
    }
}
