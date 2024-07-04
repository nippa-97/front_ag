import React, { Component } from 'react'
import { Tab, Tabs, Col, Row, FormControl, Button, InputGroup, Image } from 'react-bootstrap'
import { withTranslation } from 'react-i18next';
import { withRouter } from 'react-router-dom';
import FeatherIcon from 'feather-icons-react';
import './assign.css'
import Avatar from '../../../../assets/img/avatar.jpg'
import { usrLevels, } from '../../../../_services/common.service';
import AdvFilter from './all/advFilter';

class AssignEmployees extends Component {
    constructor(props) {
        super(props);
        this.state = {

            // searchTermMain: "",
            assigneeList: []
        }
    }
    componentDidMount() {
        this.setState({ assigneeList: this.props.signedobj.signinDetails });


    }

    // handlemainsearch = (evt) => {
    //     // console.log(evt.target.value);
    //     this.setState({ searchTermMain: evt.target.value })
    //     // var regions=this.props.regionList.filter(x=>x.userFirstName.toLowerCase().includes(evt.target.value.toLowerCase()));

    //     // console.log(regions);


    // }
    isactivebtn = (id) => {


        var exist = this.props.assignstlist.find(x => x.reciverUuid === parseInt(id))

        if (exist) {
            // console.log("true");
            return true
        } else {
            // console.log("falsehh");
            return false
        }
    }
    render() {
        return (
            <div className="sidemenubody" dir={this.props.isRTL}>
                {!this.props.openall? <Button className="allswitch" onClick={() => this.props.setopenAll()}>{this.props.t('ALL')}</Button>
: <Button className="allswitch back-link" onClick={() => this.props.setopenAll()}><FeatherIcon icon="arrow-left" size={18} /></Button>
}

                {!this.props.openall?<Col>
                    <Col sm={12} className="my-1 searchfilter-txt">
                        <InputGroup size="sm">
                            <InputGroup.Text><FeatherIcon icon="search" size={14} /></InputGroup.Text>
                            <FormControl id="inlineFormInputGroupUsername" placeholder={this.props.t('SEARCH_EMPLOYEE')} value={this.props.searchTermMain} onChange={(e) => this.props.handlemainsearch(e)} />
                        </InputGroup>
                    </Col>

                    <Col  >
                        <Tabs defaultActiveKey={this.props.signedobj.signinDetails.userRolls.userLevel === usrLevels.CN ? "regions" : this.props.signedobj.signinDetails.userRolls.userLevel === usrLevels.RG ? "stores" : "workers"} id="uncontrolled-tab-example" className="mb-3 tasktab">
                            {this.props.signedobj.signinDetails.userRolls.userLevel === usrLevels.CN && <Tab eventKey="regions" title={this.props.t('regions')}>
                                <Col >
                                    <Row className="employeearea">
                                        {(this.props.regionList.length > 0) ? this.props.regionList.filter((val) => (this.props.searchTermMain === "" || (this.props.searchTermMain !== "" && (val.userFirstName + " " + val.userLastName).toLowerCase().includes(this.props.searchTermMain.toLowerCase())))).map((region, i) =>
                                            <Col className="empspot" key={i} md={4}>
                                                <Button active={region.isSelected} onClick={() => this.props.Assigneehandle(region.userUUID, "region")} disabled={region.isAllocate === undefined ? false : region.isAllocate} >
                                                    <Image src={Avatar} roundedCircle />
                                                    <Col className="name">{region.userFirstName} {region.userLastName.charAt(0)}.</Col>
                                                    <Col className="designation">{region.rollName} </Col>
                                                </Button>
                                            </Col>) : <></>
                                        }
                                    </Row>
                                </Col>
                            </Tab>}
                            {!(this.props.signedobj.signinDetails.userRolls.userLevel === usrLevels.ST) && <Tab eventKey="stores" title={this.props.t('stores')}>
                                <Col md={12}>
                                    <Row className="employeearea">
                                        {(this.props.storeList.length > 0) ? this.props.storeList.filter((val) => (this.props.searchTermMain === "" || (this.props.searchTermMain !== "" && (val.userFirstName + " " + val.userLastName).toLowerCase().includes(this.props.searchTermMain.toLowerCase())))).map((store, i) =>
                                            <Col className="empspot" key={i} md={4}>
                                                <Button active={store.isSelected} onClick={() => this.props.Assigneehandle(store.userUUID, "store")} disabled={store.isAllocate === undefined ? false : store.isAllocate}>
                                                    <Image src={Avatar} roundedCircle />
                                                    <Col className="name">{store.userFirstName} {store.userLastName.charAt(0)}.</Col>
                                                    <Col className="designation">{store.rollName}</Col>
                                                </Button>
                                            </Col>) : <></>
                                        }
                                    </Row>
                                </Col>
                            </Tab>}
                            <Tab eventKey="workers" title={this.props.t('WORKERS')} >
                                <Col md={12}>
                                    <Row className="employeearea">
                                        {(this.props.workerList.length > 0) ? this.props.workerList.filter((val) => (this.props.searchTermMain === "" || (this.props.searchTermMain !== "" && (val.userFirstName + " " + val.userLastName).toLowerCase().includes(this.props.searchTermMain.toLowerCase())))).map((worker, i) =>
                                            <Col className="empspot" key={i} md={4}>
                                                <Button active={worker.isSelected} onClick={() => this.props.Assigneehandle(worker.userUUID, "worker")} disabled={worker.isAllocate === undefined ? false : worker.isAllocate}>
                                                    <Image src={Avatar} roundedCircle />
                                                    <Col className="name">{worker.userFirstName} {worker.userLastName.charAt(0)}.</Col>
                                                    <Col className="designation">{worker.rollName}  </Col>
                                                </Button>
                                            </Col>) : <></>
                                        }
                                    </Row>
                                </Col>
                            </Tab>
                            
                        </Tabs>
                    </Col>



                    <div className="buttondiv" style={{ textAlign: "right" }}>
                        {/* <Button variant="danger" className="whitecancle" size="sm" onClick={()=>this.props.hideSidebar()}  >{this.props.t('CANCEL')}</Button> */}
                        <Button className="pinkbtn " disabled={!this.props.callcomplete} size="sm" onClick={() => this.props.applyAssignees()} >{this.props.t('APPLY')}</Button>
                    </div>
                </Col>:
                <Col>
                  <AdvFilter 
                    callcomplete={this.props.callcomplete}  
                    applyAllassinees={this.props.applyAllassinees} 
                    assignAllEmplistset={this.props.assignAllEmplistset} 
                    assignAllEmplist={this.props.assignAllEmplist} 
                    clickFilter={this.props.clickFilter} 
                    filterboxopen={this.props.filterboxopen} 
                    existinggroups={this.props.existinggroups} 
                    assignempList={this.props.assignempList} 
                    signedobj={this.props.signedobj} 
                    />
              
                </Col>}
                
            </div>
        )
    }
}


export default withTranslation()(withRouter(AssignEmployees));
