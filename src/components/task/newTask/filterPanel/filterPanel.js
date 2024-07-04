import { CalendarIcon, ClockIcon, XIcon } from '@primer/octicons-react';
import React, { Component } from 'react'
import { Button, Col, Form, InputGroup, Row, Badge } from 'react-bootstrap';
import { withTranslation } from 'react-i18next';
import { withRouter } from 'react-router-dom';
import { TASK_FILTER_STATUS } from './../../../../enums/taskfeedEnums'
import './filterPanel.css'
import DatePicker from "react-datepicker";
import TimeKeeper from 'react-timekeeper';
import { usrLevels } from '../../../../_services/common.service';
import { alertService } from '../../../../_services/alert.service';

class FilterPanel extends Component {
    // validate filer ox
    validatefilter = (csobj) => {
        var allow = true
        if (this.props.drawfstartDate !== "") {
            if (this.props.drawfendDate === "") {
                alertService.error(this.props.t("PLEASE_SET_TO_DATE"));
                return false
            }
        }
        if (this.props.drawfendDate !== "") {
            if (this.props.drawfstartDate === "") {
                alertService.error(this.props.t("PLEASE_SET_A_FROM_DATE"));
                return false
            }
        }
        if (this.props.drawfstartTime !== "") {
            if (this.props.drawfstartDate === "" || this.props.drawfendDate === "") {
                alertService.error(this.props.t('PLEASE_SE_DATE_RANGE'));
                return false
            }
        }
        if (this.props.drawfendDate !== "") {
            if (this.props.drawfstartDate === "" || this.props.drawfendDate === "") {
                alertService.error(this.props.t('PLEASE_SE_DATE_RANGE'));
                return false
            }
        }
        if (this.props.drawffromCDate !== "") {
            if (this.props.drawftoCDate === "") {
                alertService.error(this.props.t("PLEASE_SET_CREATED_DATE_RANGE"));
                return false
            }
        }
        if (this.props.drawftoCDate !== "") {
            if (this.props.drawffromCDate === "") {
                alertService.error(this.props.t("PLEASE_SET_CREATED_DATE_RANGE"));
                return false
            }
        }
        return allow
    }
    ApplyFilters = () => {
        var validation = this.validatefilter();
        if (validation) {
            this.props.ApplyFilterSerach();
        }
    }
    statusdisplay = (status) => {
        var Status = ""
        if (status === TASK_FILTER_STATUS.All) {
            Status = this.props.t('ALL')
        }
        if (status === TASK_FILTER_STATUS.Late) {
            Status = this.props.t('LATE')
        }
        if (status === TASK_FILTER_STATUS.Now) {
            Status = this.props.t('NOW')
        }
        if (status === TASK_FILTER_STATUS.ToApprove) {
            Status = this.props.t('APPROVE')
        }
        if (status === TASK_FILTER_STATUS.Done) {
            Status = this.props.t('DONE')
        }
        return Status
    }

    handleKeyDown = (event) => {
        if(!(/[0-9/]/.test(event.key) || parseInt(event.keyCode) === 8  || parseInt(event.keyCode) === 37 || parseInt(event.keyCode) === 39)){
            event.preventDefault();
        }
    }
    render() {
        var filterList = Object.keys(TASK_FILTER_STATUS).map(x => {
            return <Form.Check type="radio" name="status" key={x} checked={this.props.drawfstatus === TASK_FILTER_STATUS[x]} label={this.statusdisplay(TASK_FILTER_STATUS[x])} onChange={() => this.props.changeStatushandle(TASK_FILTER_STATUS[x])} />
        });

        return (
            <Col className={"taskfilter-content " + (this.props.isRTL === "rtl" ? "RTL" : "")} >
                <Row className="inside">
                    <Col md={3} className="rtlcon">
                        <Col className="title">{this.props.t("status")}</Col>
                        <Col className="">
                            {filterList}
                        </Col>
                        <hr/>
                        <Col style={{ marginTop: "20px" }}>
                            <Col className="title">
                                <Form.Check style={this.props.isRTL === "rtl"?{ marginLeft: "10px" }:{ marginRight: "10px" }} type="checkbox"
                                checked={this.props.drawisplanigoTaskOnly} onChange={() => this.props.isplanigoTaskOnlyhandle()} />
                                {this.props.t("PLANIGO_TASK_ONLY")}
                            </Col>
                        </Col>
                    </Col>
                    <Col md={2} className={"rtlcon insidecol " + (this.props.isRTL === "rtl" ? "Linside" : "")}>
                        <Col className="title">  {this.props.t("URGENT")}</Col>
                        <Form.Check type="radio" name="urgent" label={this.props.t("btnnames.yes")} checked={this.props.drawfurgent} onChange={() => this.props.UrgentHandle(true)} />
                        <Form.Check type="radio" name="urgent" label={this.props.t("btnnames.no")} checked={!this.props.drawfurgent} onChange={() => this.props.UrgentHandle(false)} />
                    </Col>
                    {this.props.signedobj.signinDetails.userRolls.userLevel === usrLevels.CN && <Col className={"rtlcon insidecol " + (this.props.isRTL === "rtl" ? "Linside" : "")}>
                        <Col className="title"> {this.props.t("ASSIGNEE")}</Col>
                        <Col style={{ maxHeight: "35vh", overflowY: "auto" }}>
                            {this.props.regionListFilter && this.props.regionListFilter.map((assignee, i) => <Col key={i}>
                                <Form.Check type="checkbox" name="assignee" label={assignee.name}
                                    checked={this.props.drawfassignee.length > 0 && (this.props.drawfassignee.find(x => x.name === assignee.name) !== undefined)}
                                    onChange={() => this.props.Assigneefilterhandle(assignee)}
                                    disabled={this.props.drawisChainUsers}
                                />
                            </Col>)}
                        </Col>
                        <hr/>
                        <Col style={{ marginTop: "20px" }}>
                            <Col className="title">  
                                <Form.Check style={this.props.isRTL === "rtl"?{ marginLeft: "10px" }:{ marginRight: "10px" }} type="checkbox"
                                checked={this.props.drawisChainUsers} onChange={() => this.props.isChainlevelhandle()} />
                                {this.props.t("HEADQUARTERS")}
                            </Col>
                        </Col>
                    </Col>}
                    <Col md={6} className={"insidecol datetimeRange " + (this.props.isRTL === "rtl" ? "Linside" : "")}>
                        <Col className="title"> {this.props.t("DATE_ANMND_TIME_RANGE")}</Col>
                        <Row>
                            <Col md={7}>
                                <Col className="fromdate">
                                    <Col className="datetitle">{this.props.t("FROM")}</Col>
                                    <Col className="datebox" style={{ position: "relative" }}>
                                        <DatePicker dateFormat="dd/MM/yyyy" placeholderText="DD/MM/YYYY" popperPlacement="bottom-start"
                                            onChange={(e) => this.props.setFilterDates(e, "startDate")}
                                            selected={this.props.drawfstartDate}
                                            showYearDropdown
                                            className="datepicker-txt"
                                            onKeyDown={this.handleKeyDown}
                                        // popperModifiers={{ flip: { behavior: ['bottom'] }, preventOverflow: { enabled: false }, hide: { enabled: false } }}
                                        />
                                        <InputGroup.Text><CalendarIcon size={12} /></InputGroup.Text>
                                    </Col>
                                </Col>
                                <Col className="todate">
                                    <Col className="datetitle">{this.props.t('TO')}</Col>
                                    <Col className="datebox" style={{ position: "relative" }}>
                                        <DatePicker dateFormat="dd/MM/yyyy" placeholderText="DD/MM/YYYY" popperPlacement="bottom-start"
                                            onChange={(e) => this.props.setFilterDates(e, "toDate")}
                                            selected={this.props.drawfendDate}
                                            showYearDropdown
                                            className="datepicker-txt"
                                            onKeyDown={this.handleKeyDown}
                                        // popperModifiers={{ flip: { behavior: ['bottom'] }, preventOverflow: { enabled: false }, hide: { enabled: false } }}
                                        />
                                        <InputGroup.Text><CalendarIcon size={12} /></InputGroup.Text>
                                    </Col>
                                </Col>
                                <Col style={{ marginTop: "20px" }}>
                                    <Col className="title"> {this.props.t("CREATED_DATE")}</Col>
                                    <Col className="createddatebox">
                                        <Col>
                                            <Col className="datetitle">{this.props.t("FROM")}</Col>
                                            <Col className="datebox" style={{ position: "relative" }}>
                                                <DatePicker dateFormat="dd/MM/yyyy" placeholderText="DD/MM/YYYY" popperPlacement="bottom-start"
                                                    onChange={(e) => this.props.setFilterDates(e, "createdFromdate")}
                                                    selected={this.props.drawffromCDate}
                                                    showYearDropdown
                                                    maxDate={new Date()}
                                                    className="datepicker-txt"
                                                    onKeyDown={this.handleKeyDown}
                                                // popperModifiers={{ flip: { behavior: ['bottom'] }, preventOverflow: { enabled: false }, hide: { enabled: false } }}
                                                />
                                                <InputGroup.Text><CalendarIcon size={12} /></InputGroup.Text>
                                            </Col>
                                        </Col>
                                        <Col className="createdtodate">
                                            <Col className="datetitle">{this.props.t("TO")}</Col>
                                            <Col className="datebox" style={{ position: "relative" }}>
                                                <DatePicker dateFormat="dd/MM/yyyy" placeholderText="DD/MM/YYYY" popperPlacement="bottom-start"
                                                    onChange={(e) => this.props.setFilterDates(e, "createdTodate")}
                                                    selected={this.props.drawftoCDate}
                                                    showYearDropdown
                                                    maxDate={new Date()}
                                                    className="datepicker-txt"
                                                    onKeyDown={this.handleKeyDown}
                                                // popperModifiers={{ flip: { behavior: ['bottom'] }, preventOverflow: { enabled: false }, hide: { enabled: false } }}
                                                />
                                                <InputGroup.Text><CalendarIcon size={12} /></InputGroup.Text>
                                            </Col>
                                        </Col>
                                    </Col>
                                </Col>
                            </Col>
                            <Col md={5} className="timeset">
                                <Col className="stime">
                                    <Col className="TaskModal tasktimepiker">
                                        {this.props.showStarttimePicker && <TimeKeeper
                                            hour24Mode={true}
                                            time={(this.props.drawfstartTime !== "") ? this.props.drawfstartTime : "00:00"}
                                            onChange={(e) => this.props.onChangeFilterTime(e.formatted24, "startTime")}
                                            onDoneClick={() => this.props.onclickStarttime(false)}
                                        />}
                                    </Col>
                                    <Col className="timebox" style={{ position: "relative" }}>
                                        <input className="filtertime" type="text" placeholder="HH:MM" defaultValue={this.props.drawfstartTime} value={this.props.drawfstartTime} onClick={() => this.props.onclickStarttime(true)} />
                                        <InputGroup.Text><ClockIcon size={12} /></InputGroup.Text>
                                    </Col>
                                </Col>
                                <Col>
                                    <Col className="TaskModal tasktimepiker">
                                        {this.props.showendtimePicker && <TimeKeeper
                                            hour24Mode={true}
                                            time={(this.props.drawfendTime !== "") ? this.props.drawfendTime : "00:00"}
                                            onChange={(e) => this.props.onChangeFilterTime(e.formatted24, "endTime")}
                                            onDoneClick={() => this.props.onclickEndtime(false)}
                                        />}
                                    </Col>
                                    <Col className="timebox" style={{ position: "relative" }}>
                                        <input className="filtertime" type="text" placeholder="HH:MM" defaultValue={this.props.drawfendTime} value={this.props.drawfendTime} onClick={() => this.props.onclickEndtime(true)} />
                                        <InputGroup.Text><ClockIcon size={12} /></InputGroup.Text>
                                    </Col>
                                </Col>
                            </Col>
                        </Row>
                    </Col>
                </Row>
                {this.props.sobj && this.props.sobj.storeNames && this.props.sobj.storeNames.length > 0 ? <><Col className="chartfilter-list">
                    <ul className="list-inline">
                        <li className="list-inline-item">Chart Filters:</li>
                        {this.props.sobj.storeNames.map((xitem, xidx) => {
                            return <li key={xidx} className="list-inline-item">
                                <Badge bg="default">Store: {xitem}</Badge>
                                {this.props.sobj.storeStatus !== "" ? <Badge bg="default" style={this.props.sobj.storeStatus === "Late" ? { background: "#FF4848" } : { background: "#FFA900" }}>Status: {this.props.sobj.storeStatus}</Badge> : <></>}
                                {this.props.sobj.storeUrgent ? <Badge bg="default" style={{ background: "#E74C3C" }}>Urgent</Badge> : <></>}
                                <Button variant="secondary" size="sm" onClick={this.props.handleRemoveChartFilters} className="clearfilters-link" title="Clear chart filters"><XIcon size={12} /></Button>
                            </li>;
                        })}
                    </ul>
                </Col></> : <></>}
                <Col className="filterbtns">
                    <Button className="whitecancle reset " onClick={() => this.props.ResetFilters()}>{this.props.t('RESET_FILTERS_SHOWALL')}</Button>
                    <Button className="pinkbtn apply" onClick={() => this.ApplyFilters()}>{this.props.t('APPLY_FILTER')}</Button>
                </Col>
            </Col>
        )
    }
}



export default withTranslation()(withRouter((FilterPanel)));