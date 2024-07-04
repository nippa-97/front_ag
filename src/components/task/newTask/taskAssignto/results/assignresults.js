import React, { Component } from 'react';
import { Button, Col, Image, Row } from 'react-bootstrap';
import { withTranslation } from 'react-i18next';
import { withRouter } from 'react-router-dom';
import { XIcon } from '@primer/octicons-react';

import Avatar from '../../../../../assets/img/avatar.jpg'
import { TooltipWrapper } from '../../../../newMasterPlanogram/AddMethods';

class Assignresults extends Component {
    // filter((val)=> (this.state.searchTerm === "" || (this.state.searchTerm !== "" && (val.userFirstName+" "+val.userLastName).toLowerCase().includes(this.state.searchTerm.toLowerCase()))))
    filterfunction = () => {
        return this.props.allepmlist.filter((val) => (this.props.searchTerm === "" || (this.props.searchTerm !== "" && (val.userFirstName + " " + val.userLastName).toLowerCase().includes(this.props.searchTerm.toLowerCase()))))
    }
    //region tag
    filterselectedregions = () => {
        return this.props.regionId.filter((val) => val.isSelected === true)
    }
    filterselectedstore = () => {
        return this.props.storeId.filter((val) => val.isSelected === true)
    }
    filterselectedgroup = () => {
        return this.props.groupIds.filter((val) => val.isSelected === true)
    }
    filterselectedrole = () => {
        return this.props.roleIds.filter((val) => val.isSelected === true)
    }
    
    //selcting draw
    handleactvieEmp = (emp) => {
        var active = false
        var allocationlist = this.props.sobj.taskAllocationDtoList
        for (let i = 0; i < allocationlist.length; i++) {
            const allocator = allocationlist[i];
            var have = allocator.taskAllcationDetailDto.find(x => !x.isDelete && x.reciverUuid === emp.userUUID)
            if (have) {
                active = true
                break
            }
        }
        return active
    }
    render() {
        return (
            <div className="assignresults">
                <Col>
                    <Col className="tagsection">
                        {/* <div className="tagtitle">Regions</div> */}
                        {this.props.regionId.length > 0 && this.filterselectedregions().map((region, i) =>
                            <span className="tag" key={i}>{this.props.t('region')}: {region.regionName}<Button className="closetag" onClick={()=>this.props.removeFiltertag("region",region)}><XIcon size={14}/></Button></span>
                        )}
                        {this.props.storeId.length > 0 && this.filterselectedstore().map((store, i) =>
                            <span className="tag" key={i}>{this.props.t('STORE')}: {store.storeName}<Button className="closetag" onClick={()=>this.props.removeFiltertag("store",store)}><XIcon size={14}/></Button></span>
                        )}
                         {this.props.roleIds.length > 0 && this.filterselectedrole().map((role, i) =>
                            <span className="tag" key={i}>{this.props.t('ROLE')}: {role.name}<Button className="closetag" onClick={()=>this.props.removeFiltertag("role",role)}><XIcon size={14}/></Button></span>
                        )}
                        {this.props.groupIds.length > 0 && this.filterselectedgroup().map((group, i) =>
                            <span className="tag" key={i}>{this.props.t('GROUP')}: {group.groupName}<Button className="closetag" onClick={()=>this.props.removeFiltertag("group",group)}><XIcon size={14}/></Button></span>
                        )}

                    </Col>
                </Col>
                <Col>
                    <Row className="employeeareadraw" style={{height: "55vh"}}>
                      
                        {(this.props.allepmlist.length > 0) ? this.filterfunction().map((emp, i) =>
                            <Col className="empallocatedraw" key={i} md={3}>
                                <Button active={this.handleactvieEmp(emp)} onClick={(e) => this.props.handleAllocation(emp, "obj", false)} disabled={emp.isAllocate === undefined ? false : emp.isAllocate} >
                                    <Image src={Avatar} roundedCircle />
                                    <TooltipWrapper text={emp.userFirstName+" "+emp.userLastName}>
                                        <Col className="name">{emp.userFirstName} {emp.userLastName.charAt(0)}.</Col>
                                    </TooltipWrapper>
                                    <Col className="designation">{emp.rollName} </Col>
                                </Button>
                            </Col>) : <></>
                        }
                        {/* <Col className="empallocatedraw"  md={3}>
                                            <Button    >
                                                <Image src={Avatar} roundedCircle />
                                                <Col className="name">Test Tsetino</Col>
                                                <Col className="designation">Nothern </Col>
                                            </Button>
                                        </Col> */}


                    </Row>
                </Col>
            </div>
        );
    }
}


export default withTranslation()(withRouter(Assignresults));