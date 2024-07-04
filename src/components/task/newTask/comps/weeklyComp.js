import React, { Component } from 'react'
import { Col, Form, Row } from 'react-bootstrap'
import { withTranslation } from 'react-i18next';
import { Days } from '../../../../enums/taskfeedEnums';

 class WeeklyComp extends Component {
   
componentDidMount(){
    
}
    handleTaskRepeatdayList=(day)=>{
        var list =this.props.sobj.taskRepeatDetails.taskRepeatListDto?this.props.sobj.taskRepeatDetails.taskRepeatListDto:[];
        var flist=list.find(x=>x.taskDay===day);
        if(flist){
            list=list.filter(x=>x.taskDay!==day);
        }else{
            var obj={
                startTime:this.props.startTime,
                endTime:this.props.endTime,
                customDate: null,
                taskDay: day, 
            }
            list.push(obj); 
        }
        this.props.handleRepeatType(list,"taskRepeatListDto")
    }
    
    render() {
        var monthsdays = Object.keys(Days).map(x => {
            return <Col md={3} key={x} value={x} className="" ><div className="whentask" style={{color:this.props.errors.whichWeek&&'red'}}>
                <div className='form-check'><Form.Check type="checkbox" aria-label="radio 1" name="weeklydaysRadios"  
            checked={this.props.sobj.taskRepeatDetails.taskRepeatListDto&&this.props.sobj.taskRepeatDetails.taskRepeatListDto.find(z=>z.taskDay===Days[x])?true:false}
             onChange={(e) => this.handleTaskRepeatdayList(Days[x])} /></div>
                {(Days[x] === Days.Sunday ? this.props.t('SUN') : (Days[x] === Days.Monday ?this.props.t('MON') : (Days[x] === Days.Tuesday ? this.props.t('TUE') : Days[x] === Days.Wednsday ? this.props.t('WED') : (Days[x] === Days.Thursday)?this.props.t('THU'):(Days[x] === Days.Friday?this.props.t('FRI'):this.props.t('SAT')))))}
            </div></Col>
        });
        return (
            <Col>
            <Form.Label >{this.props.t('IN_WICH_DAY_OF_THE_WEEK')} <span style={{ color: "red" }}>*</span></Form.Label>
            <Row>
            {monthsdays}
            </Row>
        </Col>
        )
    }
}

export default withTranslation()(WeeklyComp)