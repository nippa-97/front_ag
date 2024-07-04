import React, { Component } from 'react'
import { Col, Form, Row } from 'react-bootstrap'
import { RepeatType } from '../../../../enums/taskfeedEnums';
import { withRouter } from 'react-router-dom';
import MonthlyComp from './monthlyComp';
import WeeklyComp from './weeklyComp';
import DatePicker from "react-datepicker";
import TimeKeeper from 'react-timekeeper';
import { withTranslation } from 'react-i18next';
import { alertService } from '../../../../_services/alert.service';

class TaskSheduling extends Component {


    constructor(props) {
        super(props);

        this.state = {
            startTime: "",
            endTime: "",
            showEndtimePicker: false,
            showStarttimePicker: false,
            onceDate: "",
            untilDate: "",
            strtTime: "",
            edTime: ""
        }
    }
    handleRepeatType = (value, type, change) => {
        if (!this.props.isAttend) {
            var repeatdetails
            var date = new Date();
            if (change === "typechange") {
                repeatdetails = {
                    taskRepeatListDto: [],
                    taskRepeatStartDate: date,
                    isTimeFrameTask: false,
                    startTime: this.props.startTime,
                    endTime: this.state.endTime
                }
            } else {
                repeatdetails = this.props.sobj.taskRepeatDetails;
            }
            repeatdetails[type] = value;
            this.props.handleRepeat(repeatdetails, "taskRepeatDetails")
            this.props.handleIsUpdated();
            
            //update validation errors
            let errorType = (type === "repeatType"?"repeattype":type === "repeatDateRank"?"MonthwichWeek":type === "taskDay"?"MonthDay":type === "taskRepeatListDto"?"whichWeek":type);
            this.props.validateField(errorType, value);
        }
    }
    handletimeframe = (evt) => {
        if (!this.props.isAttend) {
            var timeframe = this.props.sobj.taskRepeatDetails.isTimeFrameTask ? this.props.sobj.taskRepeatDetails.isTimeFrameTask : false;
            if (timeframe) {
                timeframe = false;
            } else {
                timeframe = true;
            }
            this.handleRepeatType(timeframe, "isTimeFrameTask");
        }
    }
    onclickEndtime = (type) => {
        if (!this.props.isAttend) { this.setState({ showEndtimePicker: type }) }
    }
    onclickStarttime = (type) => {
        if (!this.props.isAttend) { this.setState({ showStarttimePicker: type }) }
    }
    changedate = (evt, type) => {
        if (!this.props.isAttend) {
            var errors = this.props.errors;

            let todayDate = new Date();
            todayDate.setHours(0, 0, 0, 0);

            if (type === "untilDate") {
                if(todayDate.getTime() <= new Date(evt).getTime()){

                    if(this.state.strtTime === "" && this.state.edTime === ""){
                        this.setState({ untilDate: evt })
                        this.props.handleIsUpdated();
                        this.handleRepeatType(evt, "taskRepeatEndDate");

                        
                        if(errors.WeekuntilDate && errors.WeekuntilDate.length > 0){
                            this.props.validateField("WeekuntilDate", evt);
                        } else if(errors.YearuntilDate && errors.YearuntilDate.length > 0){
                            this.props.validateField("YearuntilDate", evt);
                        } else if(errors.MonthuntilDate && errors.MonthuntilDate.length > 0){
                            this.props.validateField("MonthuntilDate", evt);
                        }

                    }else{

                        if(todayDate.getTime() === new Date(evt).getTime()){

                            let isGreater = false;
    
                            let nowDateTime = new Date();
    
                            let currentTime = this.formatDateTo24Hours(nowDateTime);
    
                            isGreater = this.compareTimes(currentTime, this.state.strtTime)
    
                            if(isGreater){
                                this.setState({ untilDate: evt })
                                this.props.handleIsUpdated();
                                this.handleRepeatType(evt, "taskRepeatEndDate");
                                
                                if(errors.WeekuntilDate && errors.WeekuntilDate.length > 0){
                                    this.props.validateField("WeekuntilDate", evt);
                                } else if(errors.YearuntilDate && errors.YearuntilDate.length > 0){
                                    this.props.validateField("YearuntilDate", evt);
                                } else if(errors.MonthuntilDate && errors.MonthuntilDate.length > 0){
                                    this.props.validateField("MonthuntilDate", evt);
                                }

                            }else{
                                alertService.error(this.props.t("PLEASE_SET_A_VALID_DATE_FOR_TIME"));
                            }
                        }else{

                            this.setState({ untilDate: evt })
                            this.props.handleIsUpdated();
                            this.handleRepeatType(evt, "taskRepeatEndDate");

                            if(errors.WeekuntilDate && errors.WeekuntilDate.length > 0){
                                this.props.validateField("WeekuntilDate", evt);
                            } else if(errors.YearuntilDate && errors.YearuntilDate.length > 0){
                                this.props.validateField("YearuntilDate", evt);
                            } else if(errors.MonthuntilDate && errors.MonthuntilDate.length > 0){
                                this.props.validateField("MonthuntilDate", evt);
                            }
                        }

                    }

                }else{
                    alertService.error(this.props.t("PLEASE_SET_A_VALID_DATE"));
                }
            }
            if (type === "onceDate") {
                // console.log("onceDate", evt)

                if(todayDate.getTime() <= new Date(evt).getTime()){
                    var obj = [];

                    let strtTime = !this.props.isedit ? this.state.strtTime : this.props.startTime;
                    let edTime = !this.props.isedit ? this.state.edTime : this.props.endTime;

                    if(strtTime === "" && edTime === ""){
                        this.props.setOncedate(evt)
                        obj = [{
                            startTime: this.props.startTime,
                            endTime: this.state.endTime,
                            taskDay: null
                        }]
                        this.setState({ onceDate: evt })
                        this.props.handleIsUpdated();
                        this.handleRepeatType(obj, "taskRepeatListDto");

                        this.props.validateField("onceDate", evt);
                    }else{

                        if(todayDate.getTime() === new Date(evt).getTime()){
                            
                            let isGreater = false;
    
                            let nowDateTime = new Date();
    
                            let currentTime = this.formatDateTo24Hours(nowDateTime);
    
                            isGreater = this.compareTimes(currentTime, strtTime)
    
                            if(isGreater){
                                this.props.setOncedate(evt)
                                obj = [{
                                    startTime: this.props.startTime,
                                    endTime: this.state.endTime,
                                    taskDay: null
                                }]
                                this.setState({ onceDate: evt })
                                this.props.handleIsUpdated();
                                this.handleRepeatType(obj, "taskRepeatListDto");

                                this.props.validateField("onceDate", evt);
                            }else{
                                alertService.error(this.props.t("PLEASE_SET_A_VALID_DATE_FOR_TIME"));
                            }

                        }else{

                            this.props.setOncedate(evt)
                            obj = [{
                                startTime: this.props.startTime,
                                endTime: this.state.endTime,
                                taskDay: null
                            }]
                            this.setState({ onceDate: evt })
                            this.props.handleIsUpdated();
                            this.handleRepeatType(obj, "taskRepeatListDto");

                            this.props.validateField("onceDate", evt);
                        }

                    }

                }else{

                    alertService.error(this.props.t("PLEASE_SET_A_VALID_DATE"));

                }

            }
            if (type === "yearly") {
                this.props.yearlyDateHandle(evt)
                this.props.handleIsUpdated();

                this.props.validateField("yearDate", evt);
            }
        }
    }

    formatDateTo24Hours(date) {
        // Ensure the input is a valid Date object
        if (!(date instanceof Date) || isNaN(date)) {
            throw new Error('Invalid Date object');
        }
        
        // Extract individual components
        const hours = date.getHours();
        const minutes = date.getMinutes();

        // Format the components into a 24-hour time string
        const formattedTime = `${this.padZero(hours)}:${this.padZero(minutes)}`;
        
        return formattedTime;
        }
        
        // Helper function to pad a number with leading zeros
        padZero(number) {
        return number.toString().padStart(2, '0');
    }

    handleDateChangeRaw = (e) => {
        e.preventDefault();
    }
    
    handleKeyDown = (event) => {
        if(!(/[0-9/]/.test(event.key) || parseInt(event.keyCode) === 8  || parseInt(event.keyCode) === 37 || parseInt(event.keyCode) === 39)){
            event.preventDefault();
        }
    }

    handleChangeTime = (eformat, type, isTimeFrame) => {

        let timeComponents = eformat.split(":");
        let hours = parseInt(timeComponents[0], 10);
        let minutes = parseInt(timeComponents[1], 10);

        let repeatType = this.props.sobj.taskRepeatDetails.repeatType;

        if(repeatType === RepeatType.Once){

            let onceDt = this.props.isedit ? this.props.oncedate : this.state.onceDate;

            if(onceDt !== ""){

                let onceDate = new Date(onceDt);
                let todayDate = new Date();
    
                if( onceDate.getFullYear() === todayDate.getFullYear() &&
                    onceDate.getMonth() === todayDate.getMonth() &&
                    onceDate.getDate() === todayDate.getDate()){
                            
                        onceDate.setHours(hours, minutes, 0, 0);
    
                        if(todayDate.getTime() < onceDate.getTime()){
                            this.timeValidationCheck(isTimeFrame, eformat, type);
                        }else{
                            alertService.error(this.props.t("PLEASE_SET_A_VALID_TIME"));
                        }
                    }else{

                        this.timeValidationCheck(isTimeFrame, eformat, type);

                    }

            }else{
                alertService.error(this.props.t("PLEASE_SET_A_ONCE_DATE"));
            }

        }else if(repeatType === RepeatType.Weekly || repeatType === RepeatType.Monthly || repeatType === RepeatType.Yearly){

            let untilDt = this.props.isedit ? this.props.sobj.taskRepeatDetails.taskRepeatEndDate : this.state.untilDate;

            if(untilDt !== ""){

                let untilDate = new Date(untilDt);
                let todayDate = new Date();
    
                if( untilDate.getFullYear() === todayDate.getFullYear() &&
                    untilDate.getMonth() === todayDate.getMonth() &&
                    untilDate.getDate() === todayDate.getDate()){
                            
                        untilDate.setHours(hours, minutes, 0, 0);
    
                        if(todayDate.getTime() < untilDate.getTime()){

                            this.timeValidationCheck(isTimeFrame, eformat, type);

                        }else{
                            alertService.error(this.props.t("PLEASE_SET_A_VALID_TIME"));
                        }
                    }else{

                        this.timeValidationCheck(isTimeFrame, eformat, type);

                    }

            }else{
                alertService.error(this.props.t("PLEASE_SET_A_UNTIL_DATE"));
            }


        }else{
            alertService.error(this.props.t("PLEASE_SET_TASK_OCCURANCE"));
        }

    }

    timeValidationCheck = (isTimeFrame, eformat, type) => {
        let errors = this.props.errors;
        
        if(isTimeFrame){

            if(type === "startTime"){
                if(this.state.edTime === ""){
                    this.setState({strtTime : eformat});
                    this.props.onChangeTime(eformat, type);

                    if(errors.startTime && errors.startTime.length > 0){
                        this.props.validateField("startTime", eformat);
                    } else if(errors.WeekstartTime && errors.WeekstartTime.length > 0){
                        this.props.validateField("WeekstartTime", eformat);
                    } else if(errors.YearstartTime && errors.YearstartTime.length > 0){
                        this.props.validateField("YearstartTime", eformat);
                    } else if(errors.MonthstartTime && errors.MonthstartTime.length > 0){
                        this.props.validateField("MonthstartTime", eformat);
                    }
                    
                }else{
                    let stime = eformat;
                    let etime = this.state.edTime;

                    this.timeCheck(stime, etime, eformat, type); 
                }
            }

            if(type === "endTime"){
                if(this.state.strtTime === ""){
                    this.setState({edTime : eformat});
                    this.props.onChangeTime(eformat, type);

                    if(errors.endTime && errors.endTime.length > 0){
                        this.props.validateField("endTime", eformat);
                    } else if(errors.WeekendTime && errors.WeekendTime.length > 0){
                        this.props.validateField("WeekendTime", eformat);
                    } else if(errors.YearendTime && errors.YearendTime.length > 0){
                        this.props.validateField("YearendTime", eformat);
                    } else if(errors.MonthEndTime && errors.MonthEndTime.length > 0){
                        this.props.validateField("MonthEndTime", eformat);
                    }

                }else{
                    let stime = this.state.strtTime;
                    let etime = eformat;

                    this.timeCheck(stime, etime, eformat, type);
                }

            }

        }else{
            this.setState({edTime : eformat});
            this.props.handleIsUpdated();
            this.props.onChangeTime(eformat, type);

            if(errors.endTime && errors.endTime.length > 0){
                this.props.validateField("endTime", eformat);
            } else if(errors.WeekendTime && errors.WeekendTime.length > 0){
                this.props.validateField("WeekendTime", eformat);
            } else if(errors.YearendTime && errors.YearendTime.length > 0){
                this.props.validateField("YearendTime", eformat);
            } else if(errors.MonthEndTime && errors.MonthEndTime.length > 0){
                this.props.validateField("MonthEndTime", eformat);
            }
        }
    }

    timeCheck = (stime, etime, eformat, type) => {
        let errors = this.props.errors;

        const [hours1, minutes1] = etime.split(':').map(Number);
        const [hours2, minutes2] = stime.split(':').map(Number);
    
        const date1 = new Date(2000, 0, 1, hours1, minutes1);
        const date2 = new Date(2000, 0, 1, hours2, minutes2);

        if (date1 > date2) {
            if(type === "startTime"){
                this.setState({strtTime : eformat});

                if(errors.startTime && errors.startTime.length > 0){
                    this.props.validateField("startTime", eformat);
                } else if(errors.WeekstartTime && errors.WeekstartTime.length > 0){
                    this.props.validateField("WeekstartTime", eformat);
                } else if(errors.YearstartTime && errors.YearstartTime.length > 0){
                    this.props.validateField("YearstartTime", eformat);
                } else if(errors.MonthstartTime && errors.MonthstartTime.length > 0){
                    this.props.validateField("MonthstartTime", eformat);
                }
            }else{
                this.setState({edTime : eformat});

                if(errors.endTime && errors.endTime.length > 0){
                    this.props.validateField("endTime", eformat);
                } else if(errors.WeekendTime && errors.WeekendTime.length > 0){
                    this.props.validateField("WeekendTime", eformat);
                } else if(errors.YearendTime && errors.YearendTime.length > 0){
                    this.props.validateField("YearendTime", eformat);
                } else if(errors.MonthEndTime && errors.MonthEndTime.length > 0){
                    this.props.validateField("MonthEndTime", eformat);
                }
            }
            this.props.handleIsUpdated();

            this.props.onChangeTime(eformat, type);
        } else if (date1 < date2) {
            alertService.error(this.props.t("PLEASE_SET_A_VALID_TIME"));
        } else {
            alertService.error(this.props.t("PLEASE_SET_A_VALID_TIME"));
        }
    }

    compareTimes(startTime, endTime) {
        // Assuming time1 and time2 are in "HH:mm" format
        const [hours1, minutes1] = endTime.split(':').map(Number);
        const [hours2, minutes2] = startTime.split(':').map(Number);
      
        // Create Date objects with a common date (e.g., January 1, 2000)
        const date1 = new Date(2000, 0, 1, hours1, minutes1);
        const date2 = new Date(2000, 0, 1, hours2, minutes2);
      
        // Compare the Date objects
        if (date1 > date2) {
            return true;
        } else if (date1 < date2) {
            return false;
        } else {
            return false;
        }
        
      }

    render() {
        var errors = this.props.errors;
        var repeatType = Object.keys(RepeatType).map(x => {
            return <Col md={6} key={x} value={x}><div className="whentask" style={{ color: errors.repeattype && "red" }}>
                <div className='form-check'><Form.Check type="radio" aria-label="radio 1" name="reapeatTypeRadios" checked={this.props.sobj.taskRepeatDetails.repeatType === RepeatType[x]} onChange={(e) => this.handleRepeatType(RepeatType[x], "repeatType", "typechange")} /></div>
                {(RepeatType[x] === RepeatType.Once ? this.props.t('ONCE') : (RepeatType[x] === RepeatType.Weekly ? this.props.t('WEEKLY') : (RepeatType[x] === RepeatType.Monthly ? this.props.t('MONTHLY') : RepeatType[x] === RepeatType.Yearly ? this.props.t('YEARLY') : "")))}
            </div></Col>
        });
        return (
            <div style={{ opacity: this.props.isAttend && 0.6 }}>
                <h3>{this.props.t('TASK_SHEDULING')}</h3>
                <Form.Label >{this.props.t('WHEN_THE_TASK_OCCUR')} <span style={{ color: "red" }}>*</span></Form.Label>
                <Col md={12}>
                    <Row>
                        {repeatType}
                    </Row>
                </Col>
                {(this.props.sobj.taskRepeatDetails.repeatType === RepeatType.Monthly) && <MonthlyComp errors={this.props.errors} sobj={this.props.sobj} handleRepeatType={this.handleRepeatType} startTime={this.state.startTime} endTime={this.state.endTime} />}
                {(this.props.sobj.taskRepeatDetails.repeatType === RepeatType.Weekly) && <WeeklyComp errors={this.props.errors} sobj={this.props.sobj} handleRepeatType={this.handleRepeatType} startTime={this.state.startTime} endTime={this.state.endTime} />}
                <div className="whentask timefram">
                    <label className="pure-material-switch" style={{ width: "100%" }}>
                        <input type="checkbox" checked={this.props.sobj.taskRepeatDetails.isTimeFrameTask} onChange={(e) => this.handletimeframe(e)} />
                        <span>{this.props.t('THIS_TASK_HAVE_TIMEFRAME')} </span>
                    </label>
                </div>
                <Row>
                    <Col md={6}>
                        {this.props.sobj.taskRepeatDetails.repeatType && (this.props.sobj.taskRepeatDetails.repeatType === RepeatType.Once) &&
                            <Col style={{ marginBottom: "10px" }}>
                                <Col>  <Form.Label > {this.props.t('ONCE_DATE')}</Form.Label> <span style={{ color: "red" }}>*</span></Col>
                                <Col className='datebox'>
                                    <DatePicker showYearDropdown 
                                        className="datepicker-txt" 
                                        disabled={this.props.isAttend} 
                                        onChange={(e) => this.changedate(e, "onceDate")} 
                                        selected={this.props.oncedate} 
                                        dateFormat="dd/MM/yyyy"
                                        onKeyDown={this.handleKeyDown} 
                                        placeholderText={"(DD/MM/YYYY)"} 
                                        />
                                </Col>
                                {errors.onceDate && errors.onceDate.length > 0 &&
                                    <div className="validatediv"><span className='validationwarn'>{errors.onceDate}</span></div>}
                            </Col>
                        }
                        {this.props.sobj.taskRepeatDetails.repeatType && (this.props.sobj.taskRepeatDetails.repeatType === RepeatType.Yearly) &&
                            <Col style={{ marginBottom: "10px" }}>
                                <Col >  <Form.Label > {this.props.t('YEAR_DATE')}</Form.Label> <span style={{ color: "red" }}>*</span></Col>
                                <Col className="datebox">
                                    <DatePicker showYearDropdown 
                                        className="datepicker-txt"  
                                        disabled={this.props.isAttend} 
                                        onChange={(e) => this.changedate(e, "yearly")} 
                                        dateFormat="dd/MM/yyyy" 
                                        selected={this.props.yearlyDate}
                                        onKeyDown={this.handleKeyDown} 
                                        placeholderText={"(DD/MM/YYYY)"}
                                        />
                                </Col>
                                {errors.yearDate && errors.yearDate.length > 0 &&
                                    <div className="validatediv"><span className='validationwarn'>{errors.yearDate}</span></div>}
                            </Col>
                        }
                        {this.props.sobj.taskRepeatDetails.repeatType && (this.props.sobj.taskRepeatDetails.repeatType !== RepeatType.Once) &&
                            <Col>
                                <Col> <Form.Label > {this.props.t('UNTIL_DATE')}</Form.Label> <span style={{ color: "red" }}>*</span></Col>
                                <Col className="datebox">
                                    <DatePicker showYearDropdown 
                                        className="datepicker-txt"  
                                        disabled={this.props.isAttend} 
                                        onChange={(e) => this.changedate(e, "untilDate")} 
                                        dateFormat="dd/MM/yyyy" 
                                        selected={this.props.sobj.taskRepeatDetails.taskRepeatEndDate}
                                        onKeyDown={this.handleKeyDown} 
                                        placeholderText={"(DD/MM/YYYY)"}
                                        />
                                </Col>
                                {errors.WeekuntilDate && errors.WeekuntilDate.length > 0 &&
                                    <div className="validatediv"><span className='validationwarn'>{errors.WeekuntilDate}</span></div>}
                                {errors.YearuntilDate && errors.YearuntilDate.length > 0 &&
                                    <div className="validatediv"><span className='validationwarn'>{errors.YearuntilDate}</span></div>}
                                {errors.MonthuntilDate && errors.MonthuntilDate.length > 0 &&
                                    <div className="validatediv"><span className='validationwarn'>{errors.MonthuntilDate}</span></div>}
                            </Col>
                        }
                    </Col>
                    <Col md={6}>
                        {(this.props.sobj.taskRepeatDetails.isTimeFrameTask) && <Col>
                            <Col> <Form.Label > {this.props.t('START_TIME')}</Form.Label> <span style={{ color: "red" }}>*</span></Col>
                            <Col style={{ marginBottom: "10px" }}>
                                {this.state.showStarttimePicker && <Col className="tasktimepiker">
                                    <TimeKeeper
                                        hour24Mode={true}
                                        time={(this.props.startTime !== "") ? this.props.startTime : "00:00"}
                                        onChange={(e) => this.handleChangeTime(e.formatted24, "startTime", this.props.sobj.taskRepeatDetails.isTimeFrameTask)}
                                        onDoneClick={() => this.onclickStarttime(false)}
                                    />
                                </Col>
                                }
                                <input className="timebox" type="text" placeholder="HH:MM" defaultValue={this.props.startTime} value={this.props.startTime} onClick={() => this.onclickStarttime(true)} readOnly />
                                {errors.startTime && errors.startTime.length > 0 &&
                                    <div className="validatediv"><span className='validationwarn'>{errors.startTime}</span></div>}
                                {errors.WeekstartTime && errors.WeekstartTime.length > 0 &&
                                    <div className="validatediv"><span className='validationwarn'>{errors.WeekstartTime}</span></div>}
                                {errors.YearstartTime && errors.YearstartTime.length > 0 &&
                                    <div className="validatediv"><span className='validationwarn'>{errors.YearstartTime}</span></div>}
                                {errors.MonthstartTime && errors.MonthstartTime.length > 0 &&
                                    <div className="validatediv"><span className='validationwarn'>{errors.MonthstartTime}</span></div>}
                            </Col>
                        </Col>}
                        <Col>
                            <Col> <Form.Label >{this.props.t('END_TIME')}</Form.Label> <span style={{ color: "red" }}>*</span></Col>
                            <Col >
                                {this.state.showEndtimePicker && <Col className="tasktimepiker">
                                    <TimeKeeper 
                                        hour24Mode={true}
                                        time={(this.props.endTime !== "") ? this.props.endTime : "00:00"}
                                        onChange={(e) => this.handleChangeTime(e.formatted24, "endTime", this.props.sobj.taskRepeatDetails.isTimeFrameTask)}
                                        onDoneClick={() => this.onclickEndtime(false)}
                                    />
                                </Col>
                                
                                }
                                <input className="timebox" type="text" placeholder="HH:MM" defaultValue={this.props.endTime} onClick={() => this.onclickEndtime(true)} readOnly />
                                {errors.endTime && errors.endTime.length > 0 &&
                                    <div className="validatediv"><span className='validationwarn'>{errors.endTime}</span></div>}
                                {errors.WeekendTime && errors.WeekendTime.length > 0 &&
                                    <div className="validatediv"><span className='validationwarn'>{errors.WeekendTime}</span></div>}
                                {errors.YearendTime && errors.YearendTime.length > 0 &&
                                    <div className="validatediv"><span className='validationwarn'>{errors.YearendTime}</span></div>}
                                {errors.MonthEndTime && errors.MonthEndTime.length > 0 &&
                                    <div className="validatediv"><span className='validationwarn'>{errors.MonthEndTime}</span></div>}
                            </Col>
                        </Col>
                    </Col>
                </Row>








                <div>
                </div>
            </div>
        )
    }
}



export default withTranslation()(withRouter(TaskSheduling));