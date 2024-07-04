import React, { Component } from 'react';
import { Button, Col, Collapse, Form, Row } from 'react-bootstrap';
import { withTranslation } from 'react-i18next';
import { withRouter } from 'react-router-dom';
class Allfilter extends Component {
    constructor(props) {
        super(props);

        this.state = {
            regionOpen: true,
            storeOpen: true,
            groupOpen: true,
            roleopen:true,
            fregionlist: [],
            fstorelist: [],
            fgrouplist: [],
            frolelist:[],
        }
    }
    componentDidMount() {
        this.loadfiltertypes();
      
    }

    loadfiltertypes = () => {
        if (this.props.regionId.length > 0) {
            var valregion = JSON.parse(JSON.stringify(this.props.regionId))
            this.setState({ fregionlist: valregion })
        } else {
            var rlist = [];
            this.props.regionList.forEach(element => {
                element["isSelected"] = false
                rlist.push(element)
            });
            this.setState({ fregionlist: rlist }, () => {
               
            })
        }

        //load stores
        if (this.props.storeId.length > 0) {
            var valstore = JSON.parse(JSON.stringify(this.props.storeId))
            this.setState({ fstorelist: valstore })
        } else {
            var slist = [];
            this.props.storeList.forEach(element => {
                element["isSelected"] = false
                slist.push(element)
            });
            this.setState({ fstorelist: slist }, () => {
              
            })
        }

        //load groups
        if (this.props.groupIds.length > 0) {
            var valgroup = JSON.parse(JSON.stringify(this.props.groupIds))
            this.setState({ fgrouplist: valgroup })
        } else {
            var glist = [];
            this.props.usergroupslist.forEach(element => {
                element["isSelected"] = false
                glist.push(element)
            });
            this.setState({ fgrouplist: glist }, () => {
               
            })
        }
         
        //load roles
        if (this.props.roleIds.length > 0) {
            var valrole = JSON.parse(JSON.stringify(this.props.roleIds))
            this.setState({ frolelist: valrole })
        } else {
            var rolelist = [];
            this.props.userrolelist.forEach(element => {
                element["isSelected"] = false
                rolelist.push(element)
            });
            this.setState({ frolelist: rolelist }, () => {
               
            })
        }
        

    }
    handleregions = (obj) => {
        var list = JSON.parse(JSON.stringify(this.state.fregionlist))
        for (let i = 0; i < list.length; i++) {
            const element = list[i];
            if (element.regionId === obj.regionId) {
                element.isSelected = !element.isSelected
                break
            }

        }
        this.setState({ fregionlist: list }, () => {
            
        })

    }
    handlestores = (obj) => {
      
        var list = JSON.parse(JSON.stringify(this.state.fstorelist))
        for (let i = 0; i < list.length; i++) {
            const element = list[i];
            if (element.storeId === obj.storeId) {
                element.isSelected = !element.isSelected
                break
            }

        }
        this.setState({ fstorelist: list }, () => {
            
        })

    }
    handlegroups = (obj) => {
        
        var list = JSON.parse(JSON.stringify(this.state.fgrouplist))
        for (let i = 0; i < list.length; i++) {
            const element = list[i];
            if (element.id === obj.id) {
                element.isSelected = !element.isSelected
                break
            }

        }
        this.setState({ fgrouplist: list }, () => {
            
        })

    }
    handleRoles = (obj) => {
    
        var list = JSON.parse(JSON.stringify(this.state.frolelist))
        for (let i = 0; i < list.length; i++) {
            const element = list[i];
            if (element.roleId === obj.roleId) {
                element.isSelected = !element.isSelected
                break
            }

        }
        this.setState({ frolelist: list }, () => {
           
        })

    }
    applyfilterhandle = () => {
        this.props.setAfilters(this.state.fregionlist, this.state.fstorelist, this.state.fgrouplist,this.state.frolelist);
        this.props.searchboxreset()


    }

    filterfunction = (type) => {
        if(type==="region"){
            return this.state.fregionlist.filter((val) => (this.props.searchTerm === "" || (this.props.searchTerm !== "" && (val.regionName).toLowerCase().includes(this.props.searchTerm.toLowerCase()))))
        }
        if(type==="store"){
            return this.state.fstorelist.filter((val) => (this.props.searchTerm === "" || (this.props.searchTerm !== "" && (val.storeName).toLowerCase().includes(this.props.searchTerm.toLowerCase()))))
        }
        if(type==="group"){
            return this.state.fgrouplist.filter((g) => (this.props.searchTerm === "" || (this.props.searchTerm !== "" && (g.groupName).toLowerCase().includes(this.props.searchTerm.toLowerCase()))))
        }
        if(type==="all"){
            return this.state.frolelist.filter((r) => (this.props.searchTerm === "" || (this.props.searchTerm !== "" && (r.name).toLowerCase().includes(this.props.searchTerm.toLowerCase()))))
        }
    }
    render() {
        return (
            <div className="Assigneefilter">
                {/* filter */}
                <Col className="filterbody">
                    <Col>
                        <Button className="collpasebtn"
                            onClick={() => this.setState({ regionOpen: !this.state.regionOpen })}
                            aria-controls="region-collapse"
                            aria-expanded={this.state.regionOpen}
                        >{this.props.t('region')}</Button>
                        <Collapse in={this.state.regionOpen} >
                            <div id="region-collapse" className="insidecollapes">
                                <Row>
                                    {this.state.fregionlist &&this.filterfunction("region").map((region, i) =>
                                        <Col md={3} className="filterinlist" key={i}>
                                            <div className='form-check'><Form.Check type="checkbox" onChange={(e) => this.handleregions(region)} checked={region.isSelected} aria-label=" " name="" /></div>
                                            {region.regionName}
                                        </Col>
                                    )}
                                </Row>
                            </div>
                        </Collapse>
                    </Col>
                    <Col>
                        <Button className="collpasebtn"
                            onClick={() => this.setState({ storeOpen: !this.state.storeOpen })}
                            aria-controls="store-collapse"
                            aria-expanded={this.state.storeOpen}
                        >{this.props.t('STORE')}</Button>
                        <Collapse in={this.state.storeOpen} >
                            <div id="store-collapse" className="insidecollapes">
                                <Row>
                                    {this.state.fstorelist && this.filterfunction("store").map((store, i) =>
                                        <Col md={4} className="filterinlist" key={i}>
                                            <div className='form-check'><Form.Check type="checkbox" onChange={(e) => this.handlestores(store)} checked={store.isSelected} aria-label=" " name="" /></div>
                                            {store.storeName}
                                        </Col>
                                    )}
                                </Row>

                            </div>
                        </Collapse>
                    </Col>

                    <Col>
                        <Button className="collpasebtn"
                            onClick={() => this.setState({ roleopen: !this.state.roleopen })}
                            aria-controls="role-collapse"
                            aria-expanded={this.state.roleopen}
                        >{this.props.t('ROLE')}</Button>
                        <Collapse in={this.state.roleopen} >
                            <div id="role-collapse" className="insidecollapes">

                                <Row>
                                    {this.state.frolelist &&  this.filterfunction("all").map((role, i) =>
                                        <Col md={4} className="filterinlist" key={i}>
                                            <div className='form-check'><Form.Check type="checkbox" onChange={(e) => this.handleRoles(role)} checked={role.isSelected} aria-label=" " name="" /></div>
                                            {role.name}
                                        </Col>
                                    )}
                                </Row>

                            </div>
                        </Collapse>
                    </Col>
                    <Col>
                        <Button className="collpasebtn"
                            onClick={() => this.setState({ groupOpen: !this.state.groupOpen })}
                            aria-controls="group-collapse"
                            aria-expanded={this.state.groupOpen}
                        >{this.props.t('GROUP')}</Button>
                        <Collapse in={this.state.groupOpen} >
                            <div id="group-collapse" className="insidecollapes">

                                <Row>
                                    {this.state.fgrouplist &&  this.filterfunction("group").map((groups, i) =>
                                        <Col md={4} className="filterinlist" key={i}>
                                            <div className='form-check'><Form.Check type="checkbox" onChange={(e) => this.handlegroups(groups)} checked={groups.isSelected} aria-label=" " name="" /></div>
                                            {groups.groupName}
                                        </Col>
                                    )}
                                </Row>

                            </div>
                        </Collapse>
                    </Col>

                </Col>
                <Col><Button className="applyfilters" onClick={() => this.applyfilterhandle()}>{this.props.t('APPLY_FILTERS')}</Button></Col>
            </div >
        );
    }
}

export default withTranslation()(withRouter(Allfilter));