import { ChevronDownIcon } from '@primer/octicons-react';
import React from 'react';
import { Badge, Button, Col, Collapse, ListGroup } from 'react-bootstrap';
import FeatherIcon from 'feather-icons-react';

import { TooltipWrapper } from '../../AddMethods';
import { submitSets } from '../../../UiComponents/SubmitSets';
import { submitCollection } from '../../../../_services/submit.service';

import loadinggif from '../../../../assets/img/loading-sm.gif';

/**
 *
 *
 * @export
 * @class NewProdsSidebarView
 * @extends {React.Component}
 */
export class NewProdsSidebarView extends React.Component {
    constructor(props) {
        super(props);

        this._ismounted = false;

        this.state = {
            isLoadedMpIds: false,

            group: "fields",
            openIndex: 0,
            
            dataobj: null,
            snapShotIdList: [], isDirectLoaded: false,
        };
    }

    componentDidMount() {
        this._ismounted = true;

        if(this._ismounted){
            this.loadMpIds();
        }
    }
    
    componentWillUnmount() {
        this._ismounted = false;
    }

    //load mpids
    loadMpIds = () => {
        //connectedStoreForDepartment
        let defsaveobj = this.props.defSaveObj;
        let searchparams = ("?departmentId="+(defsaveobj?defsaveobj.department.department_id:-1));

        this.setState({ isLoadedMpIds: false }, () => {
            submitSets(submitCollection.connectedStoreForDepartment, searchparams).then(res => {
                let allmpids = [];
                if(res && res.status && res.extra && res.extra.length > 0){
                    allmpids = res.extra;
                }

                this.setState({ snapShotIdList: allmpids }, () => {
                    let fieldslist = (this.props.dataObj && this.props.dataObj.length > 0?this.props.dataObj:[]);
                    this.compareLoadMpIds(allmpids, fieldslist);
                    this.setState({ isLoadingMpIds: true });
                });
            });    
        });
    }

    //compare load mpids
    compareLoadMpIds = (allmpids, fieldslist) => {
        if(fieldslist && fieldslist.length > 0){
            let dataobjlist = fieldslist;

            for (let i = 0; i < dataobjlist.length; i++) {
                const dataobj = dataobjlist[i];
                
                for (let j = 0; j < dataobj.storesGroupByTags.length; j++) {
                    const taggroup = dataobj.storesGroupByTags[j];
                    
                    for (let l = 0; l < taggroup.connectedStores.length; l++) {
                        const storeobj = taggroup.connectedStores[l];
                        
                        let findstoremp = allmpids.findIndex(x => x.storeId === storeobj.id);
                        storeobj["mpId"] = (findstoremp > -1?allmpids[findstoremp].masterPlanogramId:-1);
                        storeobj["snapshotId"] = (findstoremp > -1?allmpids[findstoremp].snapshotId:-1);
                        storeobj["mpFromDate"] = (findstoremp > -1?allmpids[findstoremp].mpFromDate ? allmpids[findstoremp].mpFromDate : new Date():new Date());
                        storeobj["mpToDate"] = (findstoremp > -1?allmpids[findstoremp].mpToDate ? allmpids[findstoremp].mpToDate : new Date():new Date());
                    }

                    for (let l = 0; l < taggroup.disconnectedStores.length; l++) {
                        const storeobj = taggroup.disconnectedStores[l];
                        
                        let findstoremp = allmpids.findIndex(x => x.storeId === storeobj.id);
                        storeobj["mpId"] = (findstoremp > -1?allmpids[findstoremp].masterPlanogramId:-1);
                        storeobj["snapshotId"] = (findstoremp > -1?allmpids[findstoremp].snapshotId:-1);
                        storeobj["mpFromDate"] = (findstoremp > -1?allmpids[findstoremp].mpFromDate ? allmpids[findstoremp].mpFromDate : new Date():new Date());
                        storeobj["mpToDate"] = (findstoremp > -1?allmpids[findstoremp].mpToDate ? allmpids[findstoremp].mpToDate : new Date():new Date());
                    }
                }
            }

            this.setState({ dataobj: dataobjlist });
        } else{
            //load fields list
            if(!this.state.isDirectLoaded){
                this.loadFieldsList();
            }
        }
    }

    //load aui fields list
    loadFieldsList = () => {
        this.setState({ isLoadedMpIds: false }, () => {
            let defsaveobj = this.props.defSaveObj;
            let sobj = {
                departmentId: (defsaveobj && defsaveobj.department?defsaveobj.department.department_id:-1),
                mpId: (defsaveobj?defsaveobj.mp_id:-1)
            }
    
            submitSets(submitCollection.getAutoImplementationInfo, sobj).then(res => {
                this.setState({ isDirectLoaded: true, isLoadingMpIds: true }, () => {
                    if(res && res.status){
                        let fieldslist = (res.extra && res.extra.info && res.extra.info.length > 0?res.extra.info:[]);
                        this.compareLoadMpIds(this.state.snapShotIdList, fieldslist);
                    }
                });
            });
        });
    }

    //toggle field/tag view
    setGroup = (type) => {
        this.setState({ group: type });
    }

    //toggle collapse
    handleToggle = (idx) => {
        this.setState({
            openIndex: idx,
        });
    }

    //handle click single store preview
    clickSingleStore = ( storeobj, storetype, storeidx, tagidx, fieldidx ) => {
        let dataobj = this.state.dataobj;
        this.props.toggleSimPreviewView(storetype, storeidx, tagidx, fieldidx, storeobj.mpId, storeobj.snapshotId, dataobj,storeobj.originatedMp.mpName, storeobj.mpFromDate, storeobj.mpToDate);
    }

    render() {
        let { isOngoingSave } = this.props;

        return (<>
            <Col lg={2} className='aui-newprod-sidebar'>
                <Col xs={12} className='right-side-content shadow-sm bg-white'>
                    <div className='right-side-content-header d-flex justify-content-center'>
                        <div className='right-side-content-header-sub'>
                            <ul className='list-inline ul'>
                            <li className={`list-inline-item aui-content-title${this.state.group === "fields"?"-active":""}`} onClick={()=>{this.setGroup("fields")}}>{this.props.t('fields')}</li>
                            <li className={`list-inline-item aui-content-title${this.state.group === "tags"?"-active":""}`} onClick={()=>{this.setGroup("tags")}}>{this.props.t('tags')}</li>
                            </ul>
                        </div>
                    </div>

                    {!this.state.isLoadingMpIds?<div className='right-side-content shadow-sm bg-white'>
                      <div className='isloader'>
                        <img src={loadinggif} alt="loading" /> 
                      </div>
                    </div>:<></>}

                    {this.state.group === "fields" &&  <div className='aui-fields-tags-content mt-2'>
                        <div className="collapsible-sections">
                            {this.state.dataobj && this.state.dataobj.length > 0?this.state.dataobj.map((item, index) => {

                                return(<div key={index} className={`collapsible-section${this.state.openIndex === index?"-active":""}`}>
                                <div className='collapsible-section-header'>
                                    <Button onClick={() => this.handleToggle(index)}
                                    aria-controls={`collapse-${index}`}
                                    aria-expanded={this.state.openIndex === index}
                                    variant="link"
                                    className="collapsible-section-toggle btn-light-text"
                                    >
                                        <div>
                                            <span className="collapsible-section-title-count">{item.fieldCount}</span>
                                            <span className="collapsible-section-title">{this.props.t((item.fieldCount > 1?'fields':'FIELD'))}</span>
                                            <span className="collapsible-section-sub-title">(<b>{item.totalStores}</b> { this.props.t((item.totalStores > 1?'stores':'STORE'))})</span>
                                        </div>
                                    
                                        <span className="collapsible-section-icon">
                                            {this.state.openIndex === index?<></>:<ChevronDownIcon size={25} />}
                                        </span>
                                    </Button>
                                </div>
                                
                                {this.state.openIndex === index && <hr style={{"margin":"0",marginTop:"10px"}}></hr>}
                                <Collapse in={this.state.openIndex === index}>
                                    <div id={`collapse-${index}`} className="collapsible-section-content">
                                        <ListGroup>
                                            {item.storesGroupByTags.map((val, vidx) => {
                                                return(<React.Fragment key={vidx}>
                                                    {val.connectedStores.map((store,z)=>{
                                                        return(<ListGroup.Item className={'stores-aui'+(store.mpId > 0?((store.mpId > 0 && isOngoingSave)?" disabled-active":""):" disabled")} key={z} onClick={() => ((store.mpId > 0 && !isOngoingSave)?this.clickSingleStore(store, "connectedStores", z, vidx, index):null)}>
                                                            {store.name}
                                                            <span className='preview-link'><FeatherIcon icon="play-circle" size={20} /></span>
                                                        </ListGroup.Item>)
                                                    })}

                                                    {val.disconnectedStores.map((store,z) => {
                                                        return(<ListGroup.Item className={'stores-aui'+(store.mpId > 0?((store.mpId > 0 && isOngoingSave)?" disabled-active":""):" disabled")} key={z} onClick={() => ((store.mpId > 0 && !isOngoingSave)?this.clickSingleStore(store, "disconnectedStores", z, vidx, index):null)}>
                                                            {store.name}
                                                            <span className='preview-link'><FeatherIcon icon="play-circle" size={20} /></span>
                                                        </ListGroup.Item>)
                                                    })}
                                                </React.Fragment>)
                                            })}
                                        </ListGroup>
                                    </div>
                                </Collapse>
                                </div>
                                )}
                            ):<></>}
                        </div>
                        <div>
                
                        </div>
                    </div>}

                    {this.state.group === "tags" &&  <div className='aui-fields-tags-content mt-2'>
                        <div className="collapsible-sections">
                        {this.state.dataobj && this.state.dataobj.length > 0?this.state.dataobj.map((item, index) => {

                            return <div key={index} className={`collapsible-section${this.state.openIndex === index ? "-active":""}`}>
                            <div className='collapsible-section-header'>
                                <Button onClick={() => this.handleToggle(index,item.fieldCount)}
                                aria-controls={`collapse-${index}`}
                                aria-expanded={this.state.openIndex === index}
                                variant="link"
                                className="collapsible-section-toggle btn-light-text"
                                >
                                    <div>
                                        <span className="collapsible-section-title-count">{item.fieldCount}</span>
                                        <span className="collapsible-section-title">{this.props.t((item.fieldCount > 1?'fields':'FIELD'))}</span>
                                        <span className="collapsible-section-sub-title">(<b>{item.totalStores}</b> {this.props.t((item.totalStores > 1?'stores':'STORE'))})</span>
                                    </div>
                                
                                    <span className="collapsible-section-icon">
                                        {this.state.openIndex === index ?<></>:<ChevronDownIcon size={25} />}
                                    </span>
                                </Button>
                            </div>
                            
                            <Collapse in={this.state.openIndex === index}>
                                <div id={`collapse-${index}`} className="collapsible-section-content">
                                    <ListGroup>
                                        {item.storesGroupByTags.map((val,j)=>{
                                            return(<React.Fragment key={j}>
                                            <div className={'aui-tags-group d-flex'+(j > 0?" bordertop":"")}>
                                                <span className='tags-stores-count'>({val.connectedStores.length+val.disconnectedStores.length})</span>
                                                <div className='tags-list-Tag d-flex gap-1'>
                                                    {val.tags.length > 0?val.tags.map((tags,m)=>{
                                                        return(<React.Fragment key={m}>
                                                            {tags.name.length > 8 ?
                                                            <TooltipWrapper text={tags.name}  key={m}>
                                                                <div>
                                                                <Badge className='tags-bg'> {tags.name.slice(0, 8)}{tags.name.length > 8 && "..."}</Badge>  
                                                                </div>
                                                            </TooltipWrapper>
                                                            : <Badge className='tags-bg'> {tags.name}</Badge>}  
                                                        </React.Fragment>)

                                                    }) :<Badge className='no-tags-bg'>{this.props.t("NO_TAG")}</Badge> }
                                                </div>
                                            </div>

                                            <div className='tag-stors-group '>
                                                {val.connectedStores.length > 0?val.connectedStores.map((store, storeKey) => {
                                                    return(<ListGroup.Item className={'stores-aui'+(store.mpId > 0?"":(store.mpId > 0 && isOngoingSave)?" disabled-active":" disabled")} key={storeKey} onClick={() => ((store.mpId > 0 && !isOngoingSave)?this.clickSingleStore(store, "connectedStores", storeKey, j, index):null)}>
                                                        {store.name}
                                                        <span className='preview-link'><FeatherIcon icon="play-circle" size={20} /></span>
                                                    </ListGroup.Item>);
                                                    })
                                                :<></>}

                                                {val.disconnectedStores.length > 0?val.disconnectedStores.map((store, storeKey) => {

                                                return(<ListGroup.Item className={'stores-aui'+(store.mpId > 0?"":(store.mpId > 0 && isOngoingSave)?" disabled-active":" disabled")} key={storeKey} onClick={() => ((store.mpId > 0 && !isOngoingSave)?this.clickSingleStore(store, "disconnectedStores", storeKey, j, index):null)}>
                                                    {store.name}
                                                    <span className='preview-link'><FeatherIcon icon="play-circle" size={20} /></span>
                                                </ListGroup.Item>);
                                                }):<></>}
                                            </div>
                                        </React.Fragment>)
                                    })}
                                    </ListGroup>
                                </div>
                            </Collapse>
                            </div>
                        }):<></>}

                        </div>
                        <div>
                
                        </div>
                    </div>
                    }
                </Col>
            </Col>
        </>);
    }
}
