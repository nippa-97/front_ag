import React, { Component } from 'react';
import { Button, Col, Image, Row } from 'react-bootstrap';
import { withTranslation } from 'react-i18next';
import Avatar from '../../../../../assets/img/avatar.jpg'
import { withRouter } from 'react-router-dom';

class AllResults extends Component {
   
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
    // handleactvieEmp = (emp) => {
    //     // console.log(this.props.assignempList);
    //     var active = false
    //     var allocationlist = this.props.assignempList
    //     for (let i = 0; i < allocationlist.length; i++) {
    //         const allocator = allocationlist[i];
    //         var have = allocator.taskAllcationDetailDto.find(x => !x.isDelete && x.reciverUuid === emp.userUUID)
    //         if (have) {
    //             active = true
    //             break
    //         }
    //     }
    //     return active
    // }
    render() {
        return (
            <div className="assigeenresults">
                <Col>
                    <Col className="tagsection">
                       
                        {this.props.regionId.length > 0 && this.filterselectedregions().map((region, i) =>
                            <span className="tag" key={i}>{this.props.t('region')}: {region.regionName}<Button className="closetag" onClick={()=>this.props.removeFiltertag("region",region)}>X</Button></span>
                        )}
                        {this.props.storeId.length > 0 && this.filterselectedstore().map((store, i) =>
                            <span className="tag" key={i}>{this.props.t('STORE')}: {store.storeName}<Button className="closetag" onClick={()=>this.props.removeFiltertag("store",store)}>X</Button></span>
                        )}
                         {this.props.roleIds.length > 0 && this.filterselectedrole().map((role, i) =>
                            <span className="tag" key={i}>{this.props.t('ROLE')}: {role.name}<Button className="closetag" onClick={()=>this.props.removeFiltertag("role",role)}>X</Button></span>
                        )}
                        {this.props.groupIds.length > 0 && this.filterselectedgroup().map((group, i) =>
                            <span className="tag" key={i}>{this.props.t('GROUP')}: {group.groupName}<Button className="closetag" onClick={()=>this.props.removeFiltertag("group",group)}>X</Button></span>
                        )}

                    </Col>
                </Col>
                <Col>
                    <Row className="employeeareadraw">
                        {/* {console.log(this.props.sobj)} */}
                        {(this.props.allepmlist.length > 0) ? this.filterfunction().map((emp, i) =>
                            <Col className="empallocatedraw" key={i} md={3}>
                                <Button active={emp.isSelected} onClick={(e) => this.props.handleAllEmpAllocation(emp)} disabled={emp.isAllocate === undefined ? false : emp.isAllocate} >
                                    <Image src={Avatar} roundedCircle />
                                    <Col className="name">{emp.userFirstName} {emp.userLastName.charAt(0)}.</Col>
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


export default withTranslation()(withRouter(AllResults));