import React, { Component } from 'react'
import { Col, Row ,InputGroup,Form, Button} from 'react-bootstrap'
import DatePicker from 'react-datepicker'
import { CalendarIcon, SearchIcon} from '@primer/octicons-react'
import './queuejobfilter.css'


export class QueueJobLogFilters extends Component {
    constructor(props) {
      super(props)
    
      this.state = {
         first:false
      }
    }
  render() {
    return (
       <div className="queueJobFilter">
            <Col className="filterbox">
                <Row className="filterbody taskfilter-content">
                    <Col className="filterinput input-div">
                        <span>
                            <label className="namelable">{this.props.t('Job_Status')}</label>
                            <Form.Control as="select" style={{ width: '140px' }} onChange={(e) => this.props.handleFilterChange('jobStatus',e.target.value)}  value={(this.props.sobj.jobStatus!== "")?this.props.sobj.jobStatus:""}>
                                <option value="">{this.props.t('ALL')}</option>
                                <option value="Pending">{this.props.t('PENDING')}</option>
                                <option value="Ongoing">{this.props.t('TESTTYPES.ONGOING')}</option>
                                <option value="Completed">{this.props.t('CATELOGUE_DASHBOARD.planigoCompleted')}</option>
                                <option value="Canceled">{this.props.t('Canceled')}</option>            
                            </Form.Control>
                        </span>
                    </Col>
                    <Col className="filterinput input-div">
                        <span>
                            <label className="namelable">{this.props.t('type')}</label>
                            <Form.Control as="select" style={{ width: '140px' }} onChange={(e) => this.props.handleFilterChange('type',e.target.value)}  value={(this.props.sobj.type !== "")?this.props.sobj.type:""}>
                                <option value="">{this.props.t('ALL')}</option>
                                <option value="Catelogue">{this.props.t('Catelogue')}</option>
                                <option value="Sale">{this.props.t('Sale')}</option>         
                            </Form.Control>
                        </span>
                    </Col>
                    <Col className={"input-div "}>
                        <Col className="datetitle">{this.props.t('CATELOGUE_FILTERS.from')}</Col>
                        <Col className="datebox" style={{ position: 'relative' }}>
                            <DatePicker
                                dateFormat="dd/MM/yyyy"
                                placeholderText="DD/MM/YYYY"
                                popperPlacement="bottom-start"
                                showYearDropdown
                                onChange={(e) => this.props.setFilterDates(e,'startDate')}
                                selected={this.props.sobj.startDate}
                                className="datepicker-txt"
                            />
                            {/* <InputGroup.Append> */}
                                <InputGroup.Text>
                                    <CalendarIcon size={12} />
                                </InputGroup.Text>
                            {/* </InputGroup.Append> */}
                        </Col>
                    </Col>
                    <Col className={"input-div "}>
                        <Col className="datetitle">{this.props.t('CATELOGUE_FILTERS.todate')}</Col>
                        <Col className="datebox" style={{ position: 'relative' }}>
                            <DatePicker
                                dateFormat="dd/MM/yyyy"
                                placeholderText="DD/MM/YYYY"
                                popperPlacement="bottom-start"
                                showYearDropdown
                                onChange={(e) =>this.props.setFilterDates(e,'endDate')}
                                selected={this.props.sobj.endDate}
                                className="datepicker-txt"
                            />
                            {/* <InputGroup.Append> */}
                                <InputGroup.Text>
                                    <CalendarIcon size={12} />
                                </InputGroup.Text>
                            {/* </InputGroup.Append> */}
                        </Col>
                    </Col>
                    <Col className="filterinput input-div">
                        <span> 
                            <label className="namelable">{this.props.t('SHOW_RESULTS')}</label>
                            <Form.Control style={{width:"46px",padding:"5px 9px"}} type="number"  value={this.props.maxShowresultcount} onChange={e => this.props.handleShowingresults(e,false)} onBlur={e => this.props.handleShowingresults(e,true)} onKeyDown={ (evt) => (evt.key === 'e'||evt.key === '.') && evt.preventDefault() } />
                        </span>
                    </Col>
                    <Col md={12} sm={6} lg={3} className="btnlist input-div">
                            <Button type="button" variant="warning" className="search-btn filter-btn" onClick={this.props.searchfilterHandle}> <SearchIcon size={18} /> {this.props.t('btnnames.search')}</Button>
                            <Button type="button" variant="warning" className="reset-btn filter-btn" onClick={this.props.resetFilterHandle}>{this.props.t('btnnames.reset')}</Button>
                    </Col>
                </Row>
            </Col>
       </div>
    )
  }
}

export default QueueJobLogFilters