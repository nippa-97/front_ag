import React, { Component } from 'react'
import { Col, Form, Row } from 'react-bootstrap'
import { withTranslation } from 'react-i18next';
import { Days, Weeks } from '../../../../enums/taskfeedEnums';
class MonthlyComp extends Component {
    render() {
        var monthweeks = Object.keys(Weeks).map(x => {
            return <Col md={3} key={x} value={x} className="week">
                <div className="whentask" style={{ color: this.props.errors.MonthwichWeek && "red" }}>
                    <div className='form-check'><Form.Check type="radio" aria-label="radio 1" name="reapeatTypeweekRadios" checked={this.props.sobj.taskRepeatDetails.repeatDateRank === Weeks[x]} onChange={(e) => this.props.handleRepeatType(Weeks[x], "repeatDateRank")} /></div>
                    {(Weeks[x] === Weeks.First ? this.props.t('FIRST') : (Weeks[x] === Weeks.Second ? this.props.t('SECOND') : (Weeks[x] === Weeks.Third ? this.props.t('THIRD') : Weeks[x] === Weeks.Fourth ? this.props.t('FOURTH') : "")))}
                </div>
            </Col>
        });
        var monthsdays = Object.keys(Days).map(x => {
            return <Col md={3} key={x} value={x} className="">
                <div className="whentask" style={{ color: this.props.errors.MonthDay && "red" }}>
                    <div className='form-check'><Form.Check type="radio" aria-label="radio 1" name="reapeatTypedayRadios" checked={this.props.sobj.taskRepeatDetails.taskDay === Days[x]} onChange={(e) => this.props.handleRepeatType(Days[x], "taskDay")} /></div>
                    {(Days[x] === Days.Sunday ? this.props.t('SUN') : (Days[x] === Days.Monday ? this.props.t('MON') : (Days[x] === Days.Tuesday ? this.props.t('TUE') : Days[x] === Days.Wednsday ? this.props.t('WED') : (Days[x] === Days.Thursday) ? this.props.t('THU') : (Days[x] === Days.Friday ? this.props.t('FRI') : this.props.t('SAT')))))}
                </div>
            </Col>
        });
        return (
            <Col>
                <Form.Label >{this.props.t('IN_WICH_WEEK_OFTHE_MONTH')} <span style={{ color: "red" }}>*</span></Form.Label>
                <Col style={{ padding: "0px 8px" }}><Row>{monthweeks} </Row></Col>
                <Form.Label >{this.props.t('IN_WICH_DAY_OF_THE_WEEK')}  <span style={{ color: "red" }}>*</span></Form.Label>
                <Row>
                    {monthsdays}
                </Row>
            </Col>
        )
    }
}


export default withTranslation()(MonthlyComp)

