import React, { Component } from 'react';
import { Button, Col, FormControl, InputGroup } from 'react-bootstrap';
import { withTranslation } from 'react-i18next';
import { withRouter } from 'react-router-dom';
import FeatherIcon from 'feather-icons-react';
import { submitSets } from '../../../../../UiComponents/SubmitSets';
import { submitCollection } from '../../../../../../_services/submit.service';
import { usrLevels } from '../../../../../../_services/common.service';
import { alertService } from '../../../../../../_services/alert.service';
import Filteremp from '../../../taskAssignto/filter/filteremp';
import Approverfilteremplist from './approverfilteremplist';
class ApproverAdvFilter extends Component {

    constructor(props) {
        super(props);
        this.state = {
            searchTerm: '',
            storeId: [],
            searchName: "",
            regionId: [],
            userRollIds: [],
            mainUserRollTypes: [],
            groupIds: [],
            roleIds: [],
            empList: [],
            usergroupslist: [],
            storeList: [],
            regionList: [],
        }
    }
    componentDidMount() {
        this.loadRegions();
        this.loadepmList();
        this.loadStores();
        this.loadRoles();
        this.loaduserGroupList();
    }
    //loadroles
    loadRoles = () => {
        submitSets(submitCollection.getUserRoles).then(res => {
            if (res) {
                this.setState({ userrolelist: res.extra }, () => {
                });
            } else {
                alertService.error(this.props.t('DATA_LOADING_FAIL'))
            }
        })
    }
    //load group list
    loaduserGroupList = () => {
        var obj = {
            "name": "",
            "groupId": "",
            "isReqPagination": false,
            "startIndex": 0,
            "maxResult": 10
        }
        submitSets(submitCollection.findGroupOnly, obj).then(res => {
            if (res) {
                this.setState({ usergroupslist: res.extra }, () => {
                    if (this.props.existinggroups.length > 0) {
                        var exlist = JSON.parse(JSON.stringify(this.state.usergroupslist))
                        exlist.forEach(elm => {
                            var existg = this.props.existinggroups.find(x => x.groupId === elm.id);
                            if (existg) {
                                elm["isSelected"] = true
                            } else {
                                elm["isSelected"] = false
                            }
                        });
                        this.setState({
                            groupIds: exlist
                        }, () => {
                            // this.props.setgroupsformain(this.state.groupIds)
                        })
                    }
                });
            } else {
                alertService.error(this.props.t('DATA_LOADING_FAIL'))
            }
        })
    }
    //regions
    loadRegions = () => {
        submitSets(submitCollection.getRegionList).then(res => {
            if (res) {
                this.setState({ regionList: res.extra })
            }
            else {
                alertService.error(this.props.t('DATA_LOADING_FAIL'))
            }
        })
    }
    //load stores
    loadStores = () => {
        var obj = {}
        if (this.props.signedobj.signinDetails.userRolls.userLevel === usrLevels.RG) {
            obj["regionId"] = this.props.signedobj.signinDetails.userRolls.regionId
        }
        submitSets(submitCollection.getStoreList, obj).then(res => {
            if (res) {
                this.setState({ storeList: res.extra })
            }
            else {
                alertService.error(this.props.t('DATA_LOADING_FAIL'))
            }
        })
    }
    setAfilters = (regionl, storel, groupl, rolel) => {
        this.setState({ regionId: regionl, storeId: storel, groupIds: groupl, roleIds: rolel }, () => {
            this.loadepmList();
            this.props.clickFilter();
        })
    }
    removeFiltertag = (type, val) => {
        if (type === "region") {
            var rlist = this.state.regionId
            for (let i = 0; i < this.state.regionId.length; i++) {
                const element = this.state.regionId[i];
                if (element.regionId === val.regionId) {
                    element.isSelected = false;
                }
            }
            this.setState({ regionId: rlist }, () => {
                this.loadepmList();
            })
        }
        //store
        if (type === "store") {
            var slist = this.state.storeId
            for (let i = 0; i < this.state.storeId.length; i++) {
                const element = this.state.storeId[i];
                if (element.storeId === val.storeId) {
                    element.isSelected = false;
                }
            }
            this.setState({ storeId: slist }, () => {
                this.loadepmList();
            })
        }
        //role
        if (type === "role") {
            var rolist = this.state.roleIds
            for (let i = 0; i < this.state.roleIds.length; i++) {
                const element = this.state.roleIds[i];
                if (element.roleId === val.roleId) {
                    element.isSelected = false;
                }
            }
            this.setState({ roleIds: rolist }, () => {
                this.loadepmList();
            })
        }
        //group
        if (type === "group") {
            var glist = this.state.groupIds
            for (let i = 0; i < this.state.groupIds.length; i++) {
                const element = this.state.groupIds[i];
                if (element.id === val.id) {
                    element.isSelected = false;
                }
            }
            this.setState({ groupIds: glist }, () => {
                this.loadepmList();
            })
        }
    }
    loadepmList = () => {
        var Sobj = {
            storeId: this.setFilterobj("storeId"),
            searchName: this.state.searchName,
            regionId: this.setFilterobj("regionId"),
            userRollIds: this.setFilterobj("userRollIds"),
            mainUserRollTypes: this.state.mainUserRollTypes,
            groupIds: this.setFilterobj("groupIds"),
        }
        submitSets(submitCollection.findAllUsersByFilter, Sobj).then(res => {
            //console.log(res);
            if (res) {
                this.setState({ empList: res.extra })
            } else {
                alertService.error(this.props.t('DATA_LOADING_FAIL'))
            }
        })
    }
    setFilterobj = (type) => {
        if (type === "regionId") {
            var rlist = []
            this.state.regionId.forEach(element => {
                if (element.isSelected) {
                    rlist.push(element.regionId)
                }
            });
            return rlist
        }
        if (type === "storeId") {
            var slist = [];
            this.state.storeId.forEach(element => {
                if (element.isSelected) {
                    slist.push(element.storeId)
                }
            });
            return slist
        }
        if (type === "userRollIds") {
            var urlist = []
            this.state.roleIds.forEach(element => {
                if (element.isSelected) {
                    urlist.push(element.roleId)
                }
            });
            return urlist
        }
        if (type === "groupIds") {
            var glist = [];
            this.state.groupIds.forEach(element => {
                if (element.isSelected) {
                    glist.push(element.id)
                }
            });
            return glist
        }
    }
    handlesearch = (evt) => {
        this.setState({ searchTerm: evt.target.value })
    }
    searchboxreset = () => {
        this.setState({ searchTerm: "" })
    }
    render() {
        return (
            <div className="AssignTo ">
                <Col className="seacrhsection">
                    <InputGroup size="sm">
                        <InputGroup.Text><FeatherIcon icon="search" size={14} /></InputGroup.Text>
                        <FormControl id="inlineFormInputGroupUsername" value={this.state.searchTerm} placeholder={this.props.t('SEARCH')} onChange={(e) => this.handlesearch(e)} />
                    </InputGroup>
                    <Button className="filterbtn" active={this.props.filterboxopen} onClick={() => this.props.clickFilter()}>{this.props.filterboxopen ? <FeatherIcon icon="x" size={14} /> : <FeatherIcon icon="filter" size={14} />}</Button>
                </Col>
                {!this.props.filterboxopen && <Approverfilteremplist
                    handleAllocation={this.props.handleAllocation}
                    regionId={this.state.regionId}
                    storeId={this.state.storeId}
                    groupIds={this.state.groupIds}
                    roleIds={this.state.roleIds}
                    sobj={this.props.sobj}
                    searchTerm={this.state.searchTerm}
                    allepmlist={this.state.empList}
                    removeFiltertag={this.removeFiltertag} />}
                {this.props.filterboxopen && <Filteremp
                    userrolelist={this.state.userrolelist}
                    existinggroups={this.props.existinggroups}
                    searchTerm={this.state.searchTerm}
                    storeList={this.state.storeList}
                    regionList={this.state.regionList}
                    usergroupslist={this.state.usergroupslist}
                    regionId={this.state.regionId}
                    storeId={this.state.storeId}
                    roleIds={this.state.roleIds}
                    groupIds={this.state.groupIds}
                    setAfilters={this.setAfilters}
                    searchboxreset={this.searchboxreset}
                    loadepmList={this.loadepmList} />}
            </div>
        );
    }
}


export default withTranslation()(withRouter(ApproverAdvFilter));