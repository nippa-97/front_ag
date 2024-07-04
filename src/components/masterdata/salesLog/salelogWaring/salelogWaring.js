import React from 'react';
import { Accordion, Col, Dropdown, Row } from 'react-bootstrap'; //Card, 
import { withTranslation } from 'react-i18next';
import { withRouter } from 'react-router-dom'; //,Link
import { SyncIcon } from '@primer/octicons-react';
import FeatherIcon from 'feather-icons-react';

// import loadinggif from '../../../../assets/img/loading-sm.gif'

import "./salelogWaring.scss";

class SalelogWaring extends React.Component {
    constructor(props){
        super(props);

        this.state = {
            selectedTab: "waringList-1",
        }
    }
    //redirect to sale log
    directtoLog = () => {
        this.props.history.push("/salesLog");
    }
    //update opened tab when change
    selectedAccTab = (tab) => {
        this.setState({ selectedTab: tab });
    }

    render() {
        let { saleLogState } = this.props;
        
        return (
            <Dropdown.Menu >
                <Col className="slaelog-warning">
                    <Col style={{display:"flex",justifyContent:"space-between"}}>
                        <h3>{this.props.t("sale_log_warnings")}
                            <span className={this.props.isRTL === "rtl"?"float-left":"float-right"} onClick={() => this.props.GetSalesLogWarings()} title={this.props.t('refreshnotifications')} style={{marginTop:"-5px"}}><SyncIcon size={16} className={(this.props.issalewarningLoading?"active-anime ":"")}/></span>
                        </h3>
                    </Col>

                    {/* {this.props.issalewarningLoading?<Col style={{textAlign:"center"}}>
                        <img className="loadingimg" src={loadinggif}  alt="loading..." />
                    </Col> :<></>} */}
                    <Accordion defaultActiveKey="waringList-1" onSelect={e => this.selectedAccTab(e)}>
                        {saleLogState.WarningDetails.length>0?saleLogState.WarningDetails.map((item,i)=>{
                            return <React.Fragment key={i}>
                                <Accordion.Item eventKey={"waringList-"+(i+1)} className="onecard">
                                    <Accordion.Header className="header">
                                        <Col> 
                                            <span className='branchname-txt'><FeatherIcon icon={this.state.selectedTab === ("waringList-"+(i+1))?"minus":"plus"} size={14} /> {item.branch}</span>
                                            <span className={"redirect "+(this.props.isRTL === "rtl"?"float-left":"float-right")}>
                                                <label onClick={()=>this.directtoLog()}><FeatherIcon icon="external-link" size={16} /></label>
                                            </span>
                                        </Col>
                                    </Accordion.Header>
                                    <Accordion.Body>
                                        <Col>
                                            <Row >
                                                {item.missedSaleDates.length>0?item.missedSaleDates.map((date,d)=>{
                                                        return<Col className='dates' md={6} key={d}><div className='date-txt'>{date}</div></Col>
                                                }):<></>}
                                            </Row>
                                        </Col>
                                    </Accordion.Body>
                                </Accordion.Item>
                            </React.Fragment>}):<></>}
                    </Accordion>  
                </Col>
                
            </Dropdown.Menu>
        );
    }
}

export default withTranslation()(withRouter(SalelogWaring));