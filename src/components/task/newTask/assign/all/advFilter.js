import React, { Component } from 'react';
import { Button, Col, FormControl, InputGroup } from 'react-bootstrap';
import { alertService } from '../../../../../_services/alert.service';
import { usrLevels } from '../../../../../_services/common.service';
import { submitCollection } from '../../../../../_services/submit.service';
import { submitSets } from '../../../../UiComponents/SubmitSets';
import FeatherIcon from 'feather-icons-react';
import { withTranslation } from 'react-i18next';
import { withRouter } from 'react-router-dom';
import AllResults from './allResults';
import Allfilter from './allfilter';

class AdvFilter extends Component {


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
            userrolelist: [],
            storeList: [],
            regionList: [],

            isChangesAvailable: false,
        }
    }
    componentDidMount() {
        this.loadRegions();
       
        this.loadStores();
        this.loadRoles();
        this.loaduserGroupList();
    }
    setgroupsformain = (val) => {
        this.setState({
            groupIds: val
        })
    }
    //loadroles
    loadRoles = () => {
        submitSets(submitCollection.getUserRoles).then(res => {
            //console.log(res);
            if (res) {
                var userRList = []
                if (res.status) {
                    userRList = res.extra;
                }
                this.setState({ userrolelist: userRList }, () => {
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
            //console.log(res);
            if (res) {
                var Glist=[]
                if(res.status){Glist=res.extra}
                this.setState({ usergroupslist: Glist }, () => {
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
                            this.setgroupsformain(this.state.groupIds)
                        })
                    }

                });

                this.loadepmList();
            } else {
                alertService.error(this.props.t('DATA_LOADING_FAIL'))
            }
        })
    }
    //regions
    loadRegions = () => {

        submitSets(submitCollection.getRegionList).then(res => {
            //console.log(res);
            if (res) {
                var Rlist=[];
                if(res.status){Rlist=res.extra}
                this.setState({ regionList: Rlist})
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
            //console.log(res);
            if (res) {
                var StoreL=[];
                if(res.status){StoreL=res.extra}
                this.setState({ storeList: StoreL })
            }
            else {
                alertService.error(this.props.t('DATA_LOADING_FAIL'))
            }
        })
    }
    setAfilters = (regionl, storel, groupl, rolel) => {
      
        this.setState({ regionId: regionl, storeId: storel, groupIds: groupl, roleIds: rolel }, () => {
            // this.props.setgroupsformain(this.state.groupIds)
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
               
                var list = []
                res.extra.forEach(element => {
                    var exist = this.props.assignempList.find(x => x.taskAllcationDetailDto[0].reciverUuid === element.userUUID);
                    if (exist) {
                        element["isSelected"] = true
                    } else {
                        element["isSelected"] = false
                    }
                    list.push(element)
                });
                this.setState({ empList: list }, () => {
                   
                })
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
        if (type === "userRollIds") {
            var urlist = []
            this.state.roleIds.forEach(element => {
                if (element.isSelected) {
                    urlist.push(element.roleId)
                }
            });
            return urlist
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
    handleAllEmpAllocation = (emp) => {
        var list=[];
        this.state.empList.forEach(element => {
            if(emp.userUUID===element.userUUID){
                element.isSelected= !element.isSelected
            }
            list.push(element)
        });
       this.setState({empList: list, isChangesAvailable: true })
    }
    searchboxreset=()=>{
        this.setState({searchTerm:""})
    }

    render() {
        return (

            <div className="AssignTo allmain">
                <Col className="seacrhsection searchfilter-txt">
                    <InputGroup size="sm">
                        <InputGroup.Text><FeatherIcon icon="search" size={14} /></InputGroup.Text>
                        <FormControl id="inlineFormInputGroupUsername" size="sm" value={this.state.searchTerm} placeholder={this.props.t('SEARCH')} onChange={(e) => this.handlesearch(e)} />
                    </InputGroup>
                    <Button className="filterbtn" size="sm" active={this.props.filterboxopen} onClick={() => this.props.clickFilter()}>{this.props.filterboxopen ? <FeatherIcon icon="x" size={14} /> : <FeatherIcon icon="filter" size={14} />}</Button>
                </Col>

                {!this.props.filterboxopen && <AllResults
                    handleAllocation={this.props.handleAllocation}
                    regionId={this.state.regionId}
                    storeId={this.state.storeId}
                    groupIds={this.state.groupIds}
                    roleIds={this.state.roleIds}
                    assignempList={this.props.assignempList}
                    searchTerm={this.state.searchTerm}
                    allepmlist={this.state.empList}
                    applyAllassinees={this.props.applyAllassinees}
                    removeFiltertag={this.removeFiltertag} handleAllEmpAllocation={this.handleAllEmpAllocation} />}

                {this.props.filterboxopen &&
                    <Allfilter
                        existinggroups={this.props.existinggroups} 
                        storeList={this.state.storeList}
                        regionList={this.state.regionList} usergroupslist={this.state.usergroupslist}
                        userrolelist={this.state.userrolelist}
                        regionId={this.state.regionId}
                        storeId={this.state.storeId}
                        roleIds={this.state.roleIds}
                        groupIds={this.state.groupIds}
                        searchTerm={this.state.searchTerm}
                        setAfilters={this.setAfilters}
                        searchboxreset={this.searchboxreset}
                        loadepmList={this.loadepmList} />
                }
                
                { !this.props.filterboxopen && 
                    <Button className="pinkbtn allapplypnkbtn" 
                        disabled={!this.props.callcomplete} size="sm" 
                        onClick={() => (this.state.isChangesAvailable?this.props.applyAllassinees(this.state.empList,this.state.groupIds):alertService.error(this.props.t("NO_CHANGES_AVAILABLE")))} 
                    >{this.props.t('APPLY')}</Button>}
            </div>

        );
    }
}
export default withTranslation()(withRouter(AdvFilter));