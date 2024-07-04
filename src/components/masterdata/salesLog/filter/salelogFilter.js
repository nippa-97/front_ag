import React, { Component } from 'react'
import { Button, Col, Form, InputGroup, Row } from 'react-bootstrap'
import { withTranslation } from 'react-i18next'
import { withRouter } from 'react-router-dom'
import './saleslogFilter.scss'
import DatePicker from 'react-datepicker'
import { CalendarIcon, SearchIcon } from '@primer/octicons-react' //, ClockIcon, XIcon
import { AutoSalesImportSyncStatus } from '../../../../enums/saleslogEnums'
import { preventinputToString, preventinputotherthannumbers } from '../../../../_services/common.service'
class SalelogFilter extends Component {
    filterStatusName=(val)=>{
        var value =(val==="success"?this.props.t("SUCCESS"):val==="fail"?this.props.t("FAIL"):"");
        return value
    }
    handleKeyDown = (event) => {
        if(!(/[0-9/]/.test(event.key) || parseInt(event.keyCode) === 8  || parseInt(event.keyCode) === 37 || parseInt(event.keyCode) === 39)){
            event.preventDefault();
        }
    }
    render() {
        var filterdepartments = (this.props.departments!==undefined&&this.props.departments.length>0 ? Object.keys(this.props.departments).map(x => {
            return <option key={x} value={this.props.departments[x].departmentId}>{this.props.departments[x].name}</option>
        }) : <></>);

        var filterStatusList = Object.keys(AutoSalesImportSyncStatus).map(x => {
            return <option key={x} value={AutoSalesImportSyncStatus[x]}>{this.filterStatusName(AutoSalesImportSyncStatus[x])}</option>
          });
          var filterBranches = (this.props.branches!==undefined&&this.props.branches.length>0 ? Object.keys(this.props.branches).map(x => {
            return <option key={x} value={this.props.branches[x].storeId}>{this.props.branches[x].storeName}</option>
        }) : <></>);
          
        return (
            <div className="saleslogfilter">
                <Col className="filterbox">
                    <Row className="filterbody taskfilter-content">
                        <Col className="input-div">
                            <Col className="datetitle">
                                {this.props.t('SYNC_FROM_DATE')}
                            </Col>
                            <Col
                                className="datebox"
                                style={{ position: 'relative' }}
                            >
                                <DatePicker
                                    dateFormat="dd/MM/yyyy"
                                    placeholderText="DD/MM/YYYY"
                                    popperPlacement="bottom-start"
                                    showYearDropdown
                                    onChange={(e) =>
                                        this.props.setFilterDates(
                                            e,
                                            'startDate'
                                        )
                                    }
                                    selected={this.props.filterStartDate}
                                    className="datepicker-txt"
                                    onKeyDown={this.handleKeyDown}
                                    // popperModifiers={{ flip: { behavior: ['bottom'] }, preventOverflow: { enabled: false }, hide: { enabled: false } }}
                                />
                                <InputGroup.Text><CalendarIcon size={12} /></InputGroup.Text>
                            </Col>
                        </Col>
                        <Col className="input-div">
                            <Col className="datetitle">
                                {this.props.t('SYNC_TO_DATE')}
                            </Col>
                            <Col
                                className="datebox"
                                style={{ position: 'relative' }}
                            >
                                <DatePicker
                                    dateFormat="dd/MM/yyyy"
                                    placeholderText="DD/MM/YYYY"
                                    popperPlacement="bottom-start"
                                    showYearDropdown
                                    onChange={(e) =>
                                        this.props.setFilterDates(
                                            e,
                                            'toDate'
                                        )
                                    }
                                    selected={this.props.filterEndDate}
                                    className="datepicker-txt"
                                    onKeyDown={this.handleKeyDown}
                                    // popperModifiers={{ flip: { behavior: ['bottom'] }, preventOverflow: { enabled: false }, hide: { enabled: false } }}
                                />
                                <InputGroup.Text><CalendarIcon size={12} /></InputGroup.Text>
                            </Col>
                        </Col>
                        <Col className={"input-div "+(this.props.disableSaleDates?"disabledsdate":"")}>
                            <Col className="datetitle">
                                {this.props.t('SALE_FROM')}
                            </Col>
                            <Col
                                className="datebox"
                                style={{ position: 'relative' }}
                            >
                                <DatePicker
                                    dateFormat="dd/MM/yyyy"
                                    placeholderText="DD/MM/YYYY"
                                    popperPlacement="bottom-start"
                                    showYearDropdown
                                    onChange={(e) =>
                                        this.props.setFilterDates(
                                            e,
                                            'saleStartDate'
                                        )
                                    }
                                    disabled={this.props.disableSaleDates}
                                    selected={this.props.filterSaleStartDate}
                                    className="datepicker-txt"
                                    onKeyDown={this.handleKeyDown}
                                    // popperModifiers={{ flip: { behavior: ['bottom'] }, preventOverflow: { enabled: false }, hide: { enabled: false } }}
                                />
                                <InputGroup.Text><CalendarIcon size={12} /></InputGroup.Text>
                            </Col>
                        </Col>
                        <Col className={"input-div "+(this.props.disableSaleDates?"disabledsdate":"")}>
                            <Col className="datetitle">
                                {this.props.t('SALE_TO')}
                            </Col>
                            <Col
                                className="datebox"
                                style={{ position: 'relative' }}
                            >
                                <DatePicker
                                    dateFormat="dd/MM/yyyy"
                                    placeholderText="DD/MM/YYYY"
                                    popperPlacement="bottom-start"
                                    showYearDropdown
                                    onChange={(e) =>
                                        this.props.setFilterDates(
                                            e,
                                            'saleToDate'
                                        )
                                    }
                                    disabled={this.props.disableSaleDates}
                                    selected={this.props.filterSaleEndDate}
                                    onKeyDown={this.handleKeyDown}
                                    className="datepicker-txt"
                                    // popperModifiers={{ flip: { behavior: ['bottom'] }, preventOverflow: { enabled: false }, hide: { enabled: false } }}
                                />
                                <InputGroup.Text><CalendarIcon size={12} /></InputGroup.Text>
                            </Col>
                        </Col>
                        {this.props.isBranch&&<Col className="input-div">
                            <Col className="datetitle">
                                {this.props.t('branch')}
                            </Col>
                            <Col style={{ position: 'relative' }}>
                                <Form.Control
                                    as="select"
                                    style={{ width: '140px' }}
                                    onChange={(e) => this.props.handleFilterbranches(e)} 
                                    value={(this.props.filterBranchId!==-1)?this.props.filterBranchId:-1}
                                >
                                    <option value="-1">
                                        {this.props.t('ALL')}
                                    </option>
                                    {filterBranches}
                                </Form.Control>    
                            </Col>
                        </Col>}
                        {this.props.status&&<Col className="filterinput input-div">
                            <Col className="datetitle">
                                {this.props.t('status')}
                            </Col>
                            <Col style={{ position: 'relative' }}>
                                <Form.Control
                                    as="select"
                                    style={{ width: '140px' }}
                                    onChange={(e) => this.props.handleFilterStatus(e)} 
                                    value={(this.props.filterstatus!==null)?this.props.filterstatus:""}
                                >
                                    <option value="">
                                        {this.props.t('ALL')}
                                    </option>
                                    {filterStatusList}
                                </Form.Control>    
                            </Col>
                        </Col>}
                       
                        {this.props.department&&<Col className="filterinput input-div" >
                            <Col className="datetitle">
                                {this.props.t('department')}
                            </Col>
                            <Col style={{ position: 'relative' }}>
                                <Form.Control
                                    as="select"
                                    style={{ width: '140px' }}
                                    onChange={(e)=>this.props.handleFilterDepartment(e)}
                                    value={this.props.filterDepartmet!==null?this.props.filterDepartmet:""}
                                >
                                    <option value="">
                                        {this.props.t('ALL')}
                                    </option>
                                    {filterdepartments}
                                </Form.Control>    
                            </Col>
                        </Col>}
                        {this.props.productName&&<Col className="filterinput input-div">
                            <Col className="datetitle">
                                {this.props.t('product')}
                            </Col>
                            <Col style={{ position: 'relative' }}>
                            <Form.Control  placeholder={this.props.t('PRODUCTOBARCODE')}  onChange={(e) => this.props.handleFilterProduct(e)} value={this.props.filterProduct!==null?this.props.filterProduct:""} onKeyDown={(e)=>preventinputToString(e,this.props.filterProduct?this.props.filterProduct:"",(this.props.t('Character.barcode')))}/>
                            </Col>
                            {/* <span>
                                <label className="namelable">
                                    {this.props.t('product')}
                                </label>
                                <Form.Control  placeholder={this.props.t('PRODUCTOBARCODE')}  onChange={(e) => this.props.handleFilterProduct(e)} value={this.props.filterProduct!==null?this.props.filterProduct:""} onKeyDown={(e)=>preventinputToString(e,this.props.filterProduct?this.props.filterProduct:"",(this.props.t('Character.barcode')))}/>
                            </span> */}
                        </Col>}
                        <Col className="filterinput input-div">
                            <Col className="datetitle">
                                {this.props.t('SHOW_RESULTS')}
                            </Col>
                            <Col style={{ position: 'relative' }}>
                            <Form.Control style={{width:"60px"}} type="number"  value={this.props.maxShowresultcount} onChange={e => this.props.handleShowingresults(e,false)} onBlur={e => this.props.handleShowingresults(e,true)} onKeyDown={ (evt) => preventinputotherthannumbers(evt,this.props.maxShowresultcount,(this.props.t('Character.results'))) } />
                            </Col>
                            {/* <span> 
                            <label className="namelable">
                                    {this.props.t('SHOW_RESULTS')}
                            </label>
                            <Form.Control style={{width:"60px"}} type="number"  value={this.props.maxShowresultcount} onChange={e => this.props.handleShowingresults(e,false)} onBlur={e => this.props.handleShowingresults(e,true)} onKeyDown={ (evt) => preventinputotherthannumbers(evt,this.props.maxShowresultcount,(this.props.t('Character.results'))) } />
                            </span> */}
                        </Col>
                        <Col md={12} sm={6} lg={3} className="btnlist input-div">
                            <Button type="button" variant="warning" className="search-btn filter-btn" onClick={this.props.searchfilterHandle}> <SearchIcon size={18} /> {this.props.t("SEARCH")}</Button>
                            <Button type="button" variant="warning" className="reset-btn filter-btn" onClick={this.props.resetFilterHandle}> {this.props.t("btnnames.reset")}</Button>
                        </Col>
                        
                    </Row>
                </Col>
            </div>
        )
    }
}

export default withTranslation()(withRouter(SalelogFilter))
