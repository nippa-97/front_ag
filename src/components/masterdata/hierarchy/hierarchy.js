import React, { Component } from 'react'
import { v4 as uuidv4 } from 'uuid';
import { Breadcrumb, Button, Col, Row, Nav, Tab } from 'react-bootstrap'; // 
import { Link, withRouter } from 'react-router-dom';
import Tree from 'react-d3-tree';
import { withTranslation } from 'react-i18next';
import randomColor from 'randomcolor';
import { WorkflowIcon, QuoteIcon } from '@primer/octicons-react';
import { confirmAlert } from 'react-confirm-alert';

import { submitCollection } from '../../../_services/submit.service';
import { submitSets } from '../../UiComponents/SubmitSets';
import { alertService } from '../../../_services/alert.service';
import { AcViewModal } from '../../UiComponents/AcImports';

import MDSidebarMenu from '../../common_layouts/mdsidebarmenu';
import Role from './Role';
import i18n from "../../../_translations/i18n";
import './hierarchy.scss';
//var crandomcolor = randomColor({luminosity: 'light'});

function loopHeirachyColors(cdata,firstitem){
    cdata["color"] = (firstitem&&firstitem.color?firstitem.color:randomColor({luminosity: 'light'}));
    if(cdata.children && cdata.children.length > 0){
        cdata.children.map((zitem,zidx) => {
            return loopHeirachyColors(zitem,(cdata.children.length>0?cdata.children[0]:false));
        });
    }
    return cdata;
}

function loopHeirachyDelete(cdata,uuid){
    if(cdata.uuid === uuid){
        cdata["isNew"] = false;
        cdata["isDelete"] = true;
    }
    if(cdata.children && cdata.children.length > 0){
        cdata.children.map((zitem,zidx) => {
            return loopHeirachyDelete(zitem,uuid);
        });
    }
    return cdata;
}

function loopTreedataDelete(cdata){
    var notdeletedlist = (cdata.children&&cdata.children.length>0?cdata.children.filter(xitem => !xitem.isDelete):[]);
    cdata["children"] = notdeletedlist;
    if(cdata.children && cdata.children.length > 0){
        cdata.children.map((zitem,zidx) => {
            return loopTreedataDelete(zitem);
        });
    }
    return cdata;
}

var exportheirachyobj = {status: true, msg: ""};
function loopHeirachyValidation(cdata, _callback){
    if(!cdata.isDelete){
        if(!cdata.systemUserRoleType || cdata.systemUserRoleType === ""){
            exportheirachyobj.status = false;
            exportheirachyobj.msg = i18n.t("ADD_EMP_ROLES_CORRECTLY");
        } else if(!cdata.name || cdata.name === ""){
            exportheirachyobj.status = false;
            exportheirachyobj.msg = i18n.t("ADD_EPM_NAMES_CORRECT");
        } else{
            if(cdata.children && cdata.children.length > 0){
                cdata.children.map((zitem,zidx) => {
                    return loopHeirachyValidation(zitem);
                });
            }
        }
    }
}

class hierarchy extends Component {
    constructor(props) {
        super(props);

        this.state = {
            Selectdata:[],
            data: [{ "name": 'CEO', "uuid": 0, "rank": 1, color:randomColor({luminosity: 'light'}), "systemUserRoleType":"", "parent": null, "children": [], "isSystem": true, "isNew":true }],
            savedata: [{ "name": 'CEO', "uuid": 0, "rank": 1, color:randomColor({luminosity: 'light'}), "systemUserRoleType":"", "parent": null, "children": [], "isNew":true }],
            dltenewnode: 0,
            loadingscreen:false, treedata: [{"name":"", "parent": null, "children": []}],
            isUpdated: false,
        }
    }

    componentDidMount() {
        this.loadSystemUserRoles(); //load system roles
        this.sethierachy(); //load current saved heirachy

        this.setState({ translate: { x: 320, y: 30 } });
    }
    //get user roles
    loadSystemUserRoles = () => {
      submitSets(submitCollection.getSystemUSerRoll, { isReqPagination: false, withImageUrl: true }, true).then(res => {
          this.setState({ Selectdata: res.extra });
          //console.log(this.state.Selectdata);
      });
    }
    //load saved heirachy
    sethierachy=()=>{
        this.setState({loadingscreen:true});
        submitSets(submitCollection.getUSerRollHierachy, { isReqPagination: false, withImageUrl: true }, true).then(res => {
           if(res && res.status){
             if(res.extra && res.extra.length > 0){
                const expdata = (res.extra && res.extra?res.extra.map((xitem,xidx) => {
                    return loopHeirachyColors(xitem,false);
                }):[])
                //console.log(expdata);  

              this.setState({loadingscreen:false, data:expdata, savedata: JSON.parse(JSON.stringify(res.extra)) });
             }
           }else{
              this.setState({loadingscreen:false});
           }
        });
    }
    //delete item from heirachy
    deleteNodeFromTree = (node, uuid) => {
        /* if (node.children != null) {
            for (let i = 0; i < node.children.length; i++) {
                let filtered = node.children.filter(f => f.uuid === uuid);

                if (filtered && filtered.length > 0) {
                    node.children = node.children.filter(f => f.uuid !== uuid);
                    return;
                }
                this.deleteNodeFromTree(node.children[i], uuid,);
            }
            if (node.isNew === undefined) {
                node["isDelete"] = true;
                node.children=[];

                var oldState = this.state.data;
                oldState.children = node;

                var newoldstate = oldState[0];

                this.setState({
                    data: [newoldstate],
                    savedata: [JSON.parse(JSON.stringify(newoldstate))],
                    dltenewnode: node.uuid
                }, () => {
                    this.removenewnode(this.state.data[0], node.parent)
                });

            } else {
                this.setState({ dltenewnode: node.uuid }, () => {
                    this.removenewnode(this.state.data[0], node.parent)
                });
            }
        } */

        confirmAlert({
            title: this.props.t('DELETE_HEIRARCHY'),
            message: this.props.t('SURTO_DELETE_HEIRARCHY'),
            overlayClassName: (this.props.isRTL === "rtl" ? "alertrtl-content" : ""),
            buttons: [{
                label: this.props.t('btnnames.yes'),
                onClick: () => {
                    var oldState = JSON.parse(JSON.stringify(this.state.data));
                    if(oldState&&oldState[0]){
                        const expdata = (oldState&&oldState[0].children?oldState[0].children.map((xitem,xidx) => {
                            return loopHeirachyDelete(xitem,uuid);
                        }):[])
                        oldState[0].children = expdata
                        
                        //console.log(oldState);  
                        this.setState({ data: oldState, savedata: oldState, isUpdated: true });
                    }
                }
            }, {
                label: this.props.t('btnnames.no')
            }]
        });
    }

    removenewnode = (node, uuid) => {
        // if (node.uuid == uuid) {
        var existnodes = node.children.filter(x => x.uuid !== this.state.dltenewnode);
        node.children = existnodes;

        var oldState = JSON.parse(JSON.stringify(this.state.data));
        oldState.children = node;

        var newoldstate = oldState[0]
        //console.log(node);
        this.setState({ data: [newoldstate], isUpdated: true });

        //this.clickbtn("3");
    }

    clickbtn=(type)=>{

        let isUpdated = this.state.isUpdated

        if (isUpdated) {
            
            var savepath = (submitCollection.saveUSerRollHierachy);
            var csobj=this.state.savedata[0];
    
            exportheirachyobj = {status: true, msg: ""};
            loopHeirachyValidation(csobj);
            
            if(exportheirachyobj.status){
                this.setState({loadingscreen:true});
                submitSets(savepath, csobj, true).then((res) => {
                    this.setState({loadingscreen:false});
    
                    if (res && res.status) {
                        this.sethierachy();
                        if(type==="1"){
                            this.setState({isUpdated: false});
                            alertService.success(this.props.t('EMP_HEIRACHY_SAVED'));
                        }
                    } else {
                        alertService.error(this.props.t('ERROR_OCCORED_IN_PROCESS'));
                    }
                });
            } else{
                alertService.error(exportheirachyobj.msg);
            }

        }else{
            alertService.warn(this.props.t('NO_CHANGES_AVAILABLE'));
        }

        
    }

    updatenameNodeInTree = (node, uuid, newname,type) => {
        if (node.uuid === uuid) {
            if(type==="name"){
                 node.name = newname;
            }

            if(type === "systemUserRoleType"){
                node.systemUserRoleType = newname;
                //if name not defined or empty
                if(!node.name || node.name === "" || node.name === "Employee"){
                    node.name = newname.replace(/_/g," ");
                }
            }
            if(type === "rollUserLevel"){
                node.rollUserLevel = newname;
               
            }
            

        } else if (node.children != null) {
            for (let i = 0; i < node.children.length; i++) {
                this.updatenameNodeInTree(node.children[i], uuid, newname);
            }
        }

        var oldState = this.state.data
        oldState.children = node;
        var newoldstate = oldState[0]

        this.setState({data: [newoldstate],savedata: [newoldstate], isUpdated: true});
    }

    insertNodeIntoTree = (node, uuid, name) => {
        if (node.uuid === uuid) {
            // get new id
            /** Your logic to generate new Id **/
            if (name) {
                var newNode = {}

                newNode.uuid = uuidv4();
                newNode.rank = node.rank + 1;
                newNode.parent = node.uuid
                newNode.name = name
                newNode.isNew = true
                newNode.children = [];
                newNode.color = (node.children.length>0&&node.children[0].color?node.children[0].color:randomColor({luminosity: 'light'}));
                node.children.push(newNode);
            }

            if (node.rank !== 0) {
                var oldState = this.state.data;
                oldState.children = node;

                var newoldstate = oldState[0];
                this.setState({ data: [newoldstate],savedata: [newoldstate] });
            } else {
                this.setState({ data: [node] });
            }

        } else if (node.children !== null) {
            for (let i = 0; i < node.children.length; i++) {
                this.insertNodeIntoTree(node.children[i], uuid, "Test2");
            }
        }

        this.setState({isUpdated: true})
    }

    reloadTree = () => {
        var oldState = JSON.parse(JSON.stringify(this.state.data));
        if(oldState&&oldState[0]){
            const notdeletedcild = (oldState&&oldState[0].children?oldState[0].children.filter(zitem => !zitem.isDelete):[]);
            const expdata = notdeletedcild.map((xitem,xidx) => {
                return loopTreedataDelete(xitem);
            });
            oldState[0].children = expdata
            
            //console.log(oldState);  
            this.setState({ treedata: oldState, isUpdated: false});
        }
    }

    render() {
        return (
            <Col xs={12} className={"main-content " + (this.props.isRTL === "rtl" ? "RTL" : "")} dir={this.props.isRTL}>
                <div>
                    <div className="displayunit_outerbox">
                        <Row>
                          <MDSidebarMenu />
                          <Col xs={12} lg={10}>
                            <Breadcrumb dir="ltr">
                            {this.props.isRTL==="rtl"?<>
                                <Breadcrumb.Item active>{this.props.t('userheirachy')}</Breadcrumb.Item>
                                <li className="breadcrumb-item"><Link to={"/"+this.props.HomePageVal} role="button">{this.props.t('home')}</Link></li>
                            </>:<>
                                <li className="breadcrumb-item"><Link to={"/"+this.props.HomePageVal} role="button">{this.props.t('home')}</Link></li>
                                <Breadcrumb.Item active>{this.props.t('userheirachy')}</Breadcrumb.Item>
                            </>}
                          </Breadcrumb>
                            <Col className="white-container additem-content pdunit-content heirachy-content">
                                {/* <h3 style={{ fontSize: "22px", fontWeight: 800 }}>{this.props.t('userheirachy')}</h3> */}
                                <Col xs={12} lg={8}>
                                    <Tab.Container transition={false} defaultActiveKey="first">
                                        <Row>
                                            <Col sm={12}>
                                                <Nav variant="pills">
                                                    <Nav.Item>
                                                        <Nav.Link eventKey="first"><QuoteIcon size={12} /> {this.props.t("tree")}</Nav.Link>
                                                    </Nav.Item>
                                                    <Nav.Item>
                                                        <Nav.Link eventKey="second" onClick={() => this.reloadTree()}><WorkflowIcon size={12} /> {this.props.t("preview")}</Nav.Link>
                                                    </Nav.Item>
                                                </Nav>
                                            </Col>
                                            <Col sm={12}>
                                                <Tab.Content>
                                                    <Tab.Pane eventKey="first">
                                                        <Col className="maintree-content">
                                                            {!this.state.loadingscreen?<Role t={this.props.t} isRTL={this.props.isRTL} ischildrow={false} data={this.state.data} insertNodeIntoTree={this.insertNodeIntoTree} deleteNodeFromTree={this.deleteNodeFromTree} updatenameNodeInTree={this.updatenameNodeInTree} Selectdata={this.state.Selectdata} />:<></>}
                                                        </Col>
                                                        <Button variant="success" onClick={()=>this.clickbtn("1")} size="sm" className={"formview-btn "+(this.props.isRTL==="rtl"?"float-left":"float-right")} style={(this.props.isRTL==="rtl"?{marginTop:"10px",marginLeft:"50px"}:{marginTop:"10px",marginRight:"50px"})}>{this.props.t('btnnames.save')}</Button>
                                                    </Tab.Pane>
                                                    <Tab.Pane eventKey="second">
                                                        <Col xs={12} id="treeWrapper" dir="ltr">
                                                            <span className="help-txt">{this.props.t("usezoominout")}</span>
                                                            <Tree data={this.state.treedata} orientation='vertical' pathFunc='step' rootNodeClassName="node__root" translate={this.state.translate} collapsible={false} branchNodeClassName="node__branch" leafNodeClassName="node__leaf" />
                                                        </Col>
                                                    </Tab.Pane>
                                                </Tab.Content>
                                            </Col>
                                        </Row>
                                    </Tab.Container>
                                </Col>
                            </Col>  
                          </Col>
                        </Row>
                    </div>
                    <AcViewModal showmodal={this.state.loadingscreen} message={this.props.t('PLEASE_WAIT')} />
                </div>

            </Col>
        )
    }
}


export default withTranslation()(withRouter(hierarchy));
