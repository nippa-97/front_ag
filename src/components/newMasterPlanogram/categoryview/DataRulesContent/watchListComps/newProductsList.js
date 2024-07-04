import React from 'react';
import { withTranslation } from 'react-i18next';
import { withRouter } from 'react-router-dom';
import { Row, Col , ListGroup, OverlayTrigger, Tooltip, Modal } from 'react-bootstrap';
import { stringtrim }  from "../../../../../_services/common.service";
import FeatherIcon from 'feather-icons-react';
import { confirmAlert } from 'react-confirm-alert';
import { CopyToClipboard } from 'react-copy-to-clipboard'; //copy text to clipboard

import { alertService } from '../../../../../_services/alert.service';
import { submitCollection } from '../../../../../_services/submit.service';
import { submitSets } from '../../../../UiComponents/SubmitSets';
import { AcViewModal } from '../../../../UiComponents/AcImports';

import { AddNewItemComponent } from '../../../../masterdata/products/AddNew/addnew';

import loader from '../../../../../assets/img/loading-sm.gif';

const pageLength = 5;

class NewProductsList extends React.Component {
    constructor(props){
        super(props);
        this._isMounted = false;
        this.state = {
            isloading:false,
            isProductDataLoading:false,
            actionLoading:false,
            productObject:null,
            showProductEditModal:false,
            mainList:[],
            sobj:this.defaultSearchObj(),
            totalResultCount:-1,
        }
    }

    componentDidMount() {
        this._isMounted = true;
        if (this._isMounted) {
            this.loadMainList(this.state.sobj);
        }   
    }

    componentWillUnmount(){
        this._isMounted = false;
    }

    defaultSearchObj = () =>{
        return {
            isReqPagination:true,
            isReqCount:false,
            maxResult:pageLength, 
            startIndex:0,
            
            mpId:this.props.mp_id,
            depId:this.props.deptid,
            catId:this.props.catid,
            subCatId:this.props.scatid,
            supId:this.props.supplierid,
            brandId:this.props.brandid,

            // mpId:-1,
            // depId:-1,
            // catId:-1,
            // subCatId:-1,
            // supId:-1,
        };
    }

    loadMainList = (sobj)=>{
        this.setState({isloading:true});

        submitSets(submitCollection.vmpGetDepartmentNewProducts, sobj, true).then(res => {
            
            if(res && res.status){
                if(res.count && res.count>0){this.setState({totalResultCount:res.count})}

                let responseArray = res.extra;
                let clist = JSON.parse(JSON.stringify(this.state.mainList));
                
                for (let i = 0; i < responseArray.length; i++) {
                    responseArray[i]["searchStartIndex"] = JSON.parse(JSON.stringify(sobj.startIndex));
                    responseArray[i]["isShow"] = true;
                    clist.push(responseArray[i]);
                }
                
                this.setState({mainList:clist},()=>{
                    this.setState({isloading:false});
                });
            }
        });
    }

    refreshMainListAfterAction = (sobj, id) =>{
        this.setState({ismainListRefresh:true});

        submitSets(submitCollection.vmpGetDepartmentNewProducts, sobj, true).then(res => {
            this.setState({ismainListRefresh:false});
            if(res && res.status){
                let mlist = JSON.parse(JSON.stringify(this.state.mainList));
                var clist = res.extra;
                // var idx = clist.findIndex(x => x.id === id);

                // if(idx > -1){
                //     var sidx = mlist.findIndex(x => x.id === id);
                //     if(sidx > -1){
                //         mlist[sidx] = clist[idx];
                //         mlist[sidx]["isShow"] = true;
                //     }
                // }
                // else if(idx < 0){
                //     var sdidx = mlist.findIndex(x => x.id === id);
                //     if(sdidx > -1){
                //         mlist.splice(sdidx, 1);
                //     }
                // }

                // if(res.count && res.count>0){
                //     this.setState({totalResultCount:res.count},()=>{
                //         this.setState({mainList:mlist});
                //     })
                // }
                // else{
                //     this.setState({mainList:mlist});
                // }

                let temlist = [];
                for (let i = 0; i < mlist.length; i++) {
                    if(mlist[i].searchStartIndex < sobj.startIndex){
                        temlist.push(mlist[i]);
                    }
                }

                for (let x = 0; x < clist.length; x++) {
                    clist[x]["searchStartIndex"] = sobj.startIndex;
                    clist[x]["isShow"] = true;
                    temlist.push(clist[x]);
                }
                
                let csobj = this.state.sobj;
                csobj.startIndex = sobj.startIndex;
                
                this.setState({sobj:csobj, totalResultCount:res.count},()=>{
                    this.setState({mainList:temlist}, () => {
                        this.props.loadIssuesCount();
                    });
                });
            }
        });
    }

    getScrollPosition = (e) =>{
        if(this.state.isloading === false && this.state.mainList.length < this.state.totalResultCount){
            var top = document.getElementById("mappinglist").scrollTop;
            var sheight = document.getElementById("mappinglist").scrollHeight;
            var position = (sheight - top);
            var clientHeight = e.target.clientHeight;
            position = Math.trunc((position - 1));
            
            if(position <= clientHeight ){
                let csobj = this.state.sobj;
                csobj.startIndex = (csobj.startIndex + pageLength);
                this.setState({sobj:csobj},()=>{
                    this.loadMainList(this.state.sobj);
                });
            }
        }
    }

    findProductData = (item) =>{
        this.setState({isProductDataLoading: true});
        submitSets(submitCollection.findProdByID, ('?productId='+item.id), true, null, true).then(res => {
            this.setState({isProductDataLoading: false});
            if(res && res.status){
                var pobj = res.extra;
                pobj.subCategoryId = (pobj.subCategoryId ? pobj.subCategoryId : 0);
                pobj.brandId = (pobj.brandId ? pobj.brandId : 0);
                pobj["searchStartIndex"] = item.searchStartIndex;
                this.setState({productObject:{prodDetails:pobj}},()=>{
                    this.setState({showProductEditModal:true});
                });
                //console.log(pobj);
            } else{
                // alertService.error((res&&res.msg?res.msg:res&&res.extra?res.extra:this.props.t('ERROR_OCCURRED')));
            }
        });
    }

    toggleProductEditModal = (type) =>{
        this.setState({showProductEditModal:!this.state.showProductEditModal});
        if(type!==false){
            let prodobj = this.state.productObject;
            let sobj = this.defaultSearchObj();
            sobj.startIndex = prodobj.prodDetails.searchStartIndex;
            sobj.isReqCount = true;
            this.refreshMainListAfterAction(sobj, prodobj.prodDetails.id);

            //reload vmp
            this.props.dRulesreload(false, true);
        }
    }

    sendToDep = (pobj, index) =>{
        confirmAlert({
            title: this.props.t("CONFIRM_TO_SUBMIT"),
            message: this.props.t("NEW_PROD_SENDTODEP_CONFIRM"),
            overlayClassName: (this.props.isRTL === "rtl" ? "alertrtl-content" : ""),
            buttons: [{
                label: this.props.t('btnnames.yes'),
                onClick: () => {
                    let sobj ={};
                    sobj.id = pobj.id;
                    sobj.productId = pobj.id;
                    sobj.isFromNewProduct = true;

                    sobj.isUpdateAll = false;
                    sobj.productIds = [pobj.id];


                    this.setState({ actionLoading:true});
                    submitSets(submitCollection.sendProductToMP, sobj, true, null, true).then(resp => {
                        this.setState({ actionLoading:false});
                        if(resp && resp.status){
                            alertService.success(this.props.t("succussfuly")+" " +this.props.t("saved"));
                            let mlist = this.state.mainList;
                            mlist[index].isShow=false;
                            this.setState({mainList:mlist});
                            this.props.loadIssuesCount();

                            this.props.updatedeptobj(null,true);
                            this.props.dRulesreload();
                        }
                        else{
                            // alertService.error((resp&&resp.msg?resp.msg:resp&&resp.extra?resp.extra:this.props.t('ERROR_OCCURRED')));
                        }
                    });
                    return false;
                }
                
            }, {
                label: this.props.t('btnnames.no'),
                onClick: () => {
                    return false;
                }
            }]
        });
    }

    render(){
        let itemsavl = this.state.mainList.findIndex(x => x.isShow === true);

        return(
            <>
                {this.state.ismainListRefresh===true ?<Col xs={12} className="loading-col refresh"><img className='loader-gif' src={loader} alt="loader"/></Col>:<></>}

                <Col xs={12} id="mappinglist" className={"list-main "+(this.state.ismainListRefresh===true?"refreshing":"")} onScroll={(e)=>this.getScrollPosition(e)}>
                    <ListGroup className={(this.state.mainList.length > 0?"":"d-none")}>
                        {
                            this.state.mainList.map((item,index)=>{
                                return (
                                    <Col key={index}>
                                        {item.isShow===true?
                                                <ListGroup.Item>
                                                    <Row>
                                                        <Col xs={10} className="details-col products" style={{paddingTop:"0px"}}>
                                                            <small className='barcode'><CopyToClipboard text={item.barcode} onCopy={() => this.props.copyToClipboard()}><b>{item.barcode}</b></CopyToClipboard></small>
                                                            <OverlayTrigger placement="top" overlay={<Tooltip className={"resolve-content-item-tooltip "}><label>{item.name}</label></Tooltip>}>
                                                                <h6 className='main-title'>{stringtrim(item.name, (this.props.isRTL==="rtl" ? 30 : 35))}</h6>
                                                            </OverlayTrigger>
                                                        </Col>
                                                        <Col xs={2} className='btns-col' style={{paddingTop:"10px"}}>
                                                            {
                                                                item.canSendToDep===true ?
                                                                    <OverlayTrigger placement="top" overlay={<Tooltip className={"resolve-content-item-tooltip "}><label>{this.props.t("SEND_TO_DEP")}</label></Tooltip>}><FeatherIcon onClick={()=>this.sendToDep(item, index)} icon="navigation" size="12"/></OverlayTrigger>
                                                                :<></>
                                                            }
                                                            
                                                            <OverlayTrigger placement="top" overlay={<Tooltip className={"resolve-content-item-tooltip "}><label>{this.props.t("EDIT")}</label></Tooltip>}><FeatherIcon onClick={()=>this.findProductData(item)} icon="edit" size="12"/></OverlayTrigger>
                                                        </Col>
                                                    </Row>
                                                </ListGroup.Item>
                                            :<></>
                                        }
                                    </Col>
                                )
                            })
                        }
                        
                    </ListGroup>
                    
                    {
                        this.state.isloading===true ?
                            <Col xs={12} className="loading-col"><img className='loader-gif' src={loader} alt="loader"/></Col>
                        :
                            <Col className={'no-results-txt '+(itemsavl > -1 ? "d-none" : "")}>{this.props.t("NO_RESULT_FOUND")}</Col>
                    }

                </Col>



                <Modal  show={this.state.showProductEditModal} className="prod-edit new-product-update-modal" dir={this.props.isRTL} onHide={()=>this.toggleProductEditModal()} backdrop="static" animation={false}>
                    <Modal.Body style={{padding:"30px", background:"#F4F6F7"}}>
                       {
                            this.state.showProductEditModal === true ?
                            <>
                                <AddNewItemComponent 
                                    isRTL={this.props.isRTL} 
                                    prodState={this.state.productObject} 
                                    ismodal={true} 
                                    hidemodal={this.toggleProductEditModal}
                                    hidedelete={false} 
                                    size="sm"
                                    t={this.props.t}
                                />
                            </>:
                            <></>
                       }
                    </Modal.Body>
                </Modal>


                <AcViewModal showmodal={this.state.isProductDataLoading} message={this.props.t('PLEASE_WAIT')} />
                <AcViewModal showmodal={this.state.actionLoading} message={this.props.t('PLEASE_WAIT')} />
            </>
        ) 
    }
}
export default withTranslation()(withRouter((NewProductsList)));