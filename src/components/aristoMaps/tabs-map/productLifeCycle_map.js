import React, { PureComponent } from 'react'
import { withTranslation } from 'react-i18next'
import {  withRouter } from 'react-router-dom';
import { CopyToClipboard } from 'react-copy-to-clipboard'; //copy text to clipboard
import { alertService } from '../../../_services/alert.service';
import { productLifeCycleTypes } from '../../../enums/aristoMapDataEnums';
import { submitSets } from '../../UiComponents/SubmitSets';
import { submitCollection } from '../../../_services/submit.service';
import { Button } from 'react-bootstrap';
import LifecyclePopup from './popups/lifecyclePopup';
class ProductLifeCycleMap extends PureComponent {
    constructor(props) {
        super(props)
        this._isMounted = false;
        this.state = {
            Slowdivplaceholder:this.props.t("DATA_LOADING_PLEASE_WAIT"),
            Fastdivplaceholder:this.props.t("DATA_LOADING_PLEASE_WAIT"),
            group:productLifeCycleTypes.slow,
            ProposedProductsSlow:[],
            ProposedProductsFast:[],
            pstartpageS: 0, ptotalresultsS: 0, pmaxcountS: 8,
            pstartpageF: 0, ptotalresultsF: 0, pmaxcountF: 8,
            fastpopupoptionList:[], SlowpopupoptionList:[],optionlistpopup:[],
            selectedoptionprod:null,
            
        }
    }
    componentDidMount(){
        this._isMounted = true;
        if(this._isMounted){
            this.getloadProposedProductsSlow(0)
            this.getloadProposedProductsFast(0)
        }
    }
    componentWillUnmount(){
        this._isMounted = false;
    }
    setGroup=(val)=>{
        var optionlistpopup=[]
        if(val===productLifeCycleTypes.slow){
            optionlistpopup=this.state.SlowpopupoptionList
        }
        if(val===productLifeCycleTypes.fast){
            optionlistpopup=this.state.fastpopupoptionList
        }
        
        this.setState({group:val,optionlistpopup:optionlistpopup},()=>{
            this.props.handleClickProdLCycle(null,true)
        })
    }
    //copy barcode to clipboard message show
    copyToClipboard = (ctxt) => {
        alertService.info(this.props.t("COPIED_TO_CLIP_BOARD"));
    }
    //onclick load more button in search
    loadMoreSlowProds = () => {
        //add maxcount to current start index
        var cstarttxt = (this.state.pstartpageS === 0?(this.state.pmaxcountS):(this.state.pstartpageS + this.state.pmaxcountS));
        this.getloadProposedProductsSlow(cstarttxt);
    }
     //onclick load more button in search
     loadMoreFastProds = () => {
        //add maxcount to current start index
        var cstarttxt = (this.state.pstartpageF === 0?(this.state.pmaxcountF):(this.state.pstartpageF + this.state.pmaxcountF));
        this.getloadProposedProductsFast(cstarttxt);
    }
    getloadProposedProductsSlow=(startidx)=>{
            var cobj={
                isReqPagination: true,
                maxResult: this.state.pmaxcountS,
                startIndex: startidx,
                type : productLifeCycleTypes.slow
            }
            var cProposedProductsSlow=this.state.ProposedProductsSlow
            submitSets(submitCollection.loadProposedProducts, cobj, false).then(res => {
                if (res && res.status) {
                    if(res.extra.length===0){
                        this.setState({Slowdivplaceholder:this.props.t("NO_RESULTS")})
                    }
                    var result=(JSON.parse(JSON.stringify(res.extra)))
                    var result2=(JSON.parse(JSON.stringify(res.extra)))
                        this.setState({
                            ProposedProductsSlow:cProposedProductsSlow.length>0?cProposedProductsSlow.concat(result):result,
                            ptotalresultsS:res.count?res.count:this.state.ptotalresultsS,
                            pstartpageS:startidx,
                            fastpopupoptionList:cProposedProductsSlow.length>0?cProposedProductsSlow.concat(result2.splice(0,3)):result2.splice(0,3),
                           
                        })
                }else{
                    alertService.error(this.props.t("FAIL"))
                }
            })
    }
    getloadProposedProductsFast=(startidx)=>{
        var cobj={
            isReqPagination: true,
            maxResult: this.state.pmaxcountF,
            startIndex: startidx,
            type : productLifeCycleTypes.fast
        }
        var cProposedProductsFast=this.state.ProposedProductsFast
        submitSets(submitCollection.loadProposedProducts, cobj, false).then(res => {
            if (res && res.status) {
                if(res.extra.length===0){
                    this.setState({Fastdivplaceholder:this.props.t("NO_RESULTS")})
                }
                var result=(JSON.parse(JSON.stringify(res.extra)))
                var result2=(JSON.parse(JSON.stringify(res.extra)))
                this.setState({
                    ProposedProductsFast:cProposedProductsFast.length>0?cProposedProductsFast.concat(result):result,
                    ptotalresultsF:res.count?res.count:this.state.ptotalresultsF,
                    pstartpageF:startidx,
                    SlowpopupoptionList:cProposedProductsFast.length>0?cProposedProductsFast.concat(result2.splice(0,3)):result2.splice(0,3),
                    
                },()=>{
                    this.setState({
                        optionlistpopup:this.state.SlowpopupoptionList,
                        selectedoptionprod:this.state.SlowpopupoptionList[0]
                    })
                })
            }else{
                alertService.error(this.props.t("FAIL"))
            }
        })
    }
    changeselectedoptionprod=(prod)=>{
        var prodid=prod.value
        var obj=null
        if(this.state.group===productLifeCycleTypes.slow){
            obj=this.state.SlowpopupoptionList.find(x=>x.productId===prodid)
        }
        if(this.state.group===productLifeCycleTypes.fast){
            obj=this.state.fastpopupoptionList.find(x=>x.productId===prodid)
        }
        this.setState({selectedoptionprod:obj})
    }
    render() {
        var{group,ProposedProductsSlow,ProposedProductsFast,Slowdivplaceholder,Fastdivplaceholder,
            selectedoptionprod,optionlistpopup
            }=this.state
        var {sobj}=this.props
        return (
            
            <div className='productlifeCycle_map map-prod-card'>
                {this.props.prodLifeCircleSelectedCard!==null?<LifecyclePopup selectedproduct={this.props.prodLifeCircleSelectedCard} 
                    ProposedProductsSlow={ProposedProductsSlow} selectedoptionprod={selectedoptionprod} ProposedProductsFast={ProposedProductsFast}
                    optionlistpopup={optionlistpopup} changeselectedoptionprod={this.changeselectedoptionprod}
                    handleClickProdLCycle={this.props.handleClickProdLCycle} />:<></>}
                <div className="right-side-content-header d-flex "> 
                {/* justify-content-center */}
                    <div className='right-side-content-header-sub'>
                        <ul className='list-inline ul'>
                        <li className={`list-inline-item aui-content-title${this.state.group === productLifeCycleTypes.slow?"-active":""}`} onClick={()=>{this.setGroup(productLifeCycleTypes.slow)}}>{this.props.t("SLOW")}</li>
                        <li className={`list-inline-item aui-content-title${this.state.group === productLifeCycleTypes.fast?"-active":""}`} onClick={()=>{this.setGroup(productLifeCycleTypes.fast)}}>{this.props.t("FAST")}</li>
                        </ul>
                    </div>
                </div>
                {group===productLifeCycleTypes.slow?<div className="thumb-div-maindiv" style={{maxHeight:this.props.viewheight-190}}>
                    {ProposedProductsSlow.length>0?ProposedProductsSlow.map((prod,p)=>
                    <div className={'insideboxnameboxcard '+((sobj.productId===prod.productId)?"selected":"")} key={p} onClick={() => this.props.handleClickProdLCycle(prod)}>
                        <div className="thumb-div"  >
                            <div className='thumb-div-main'>
                                <img  src={prod.imageUrl} className="img-resize-ver" alt=""/>
                            </div>
                        </div>
                        <div className='text'>
                            <h2 className='prod-title'>{prod.productName}</h2>
                            <CopyToClipboard text="SAdasda" onCopy={() => this.copyToClipboard()}><small  className='prod-title'>{prod.barcode}</small></CopyToClipboard>
                           
                            {/* {prod.suggestedAction!==SuggestedAction.none?<div className='Saction' style={{color:this.setcolorsuggestedAction(prod.suggestedAction)}}>{prod.suggestedAction}</div>:<></>}
                            {prod.suggestedAction===SuggestedAction.none?<div className='Saction'>Test Progress {prod.testProgress.covered}/{prod.testProgress.total}</div>:<></>} */}
                        </div>
                        <label>SPD:{prod.spfday.toFixed(2)}</label>
                    </div>
                    ):<div className='NOResultdivholder' >{Slowdivplaceholder}</div>}
                    {ProposedProductsSlow.length < this.state.ptotalresultsS?
                        <div className='text-center'><Button xs={12} className="ploadmore-link " onClick={() => {this.loadMoreSlowProds()}}>{this.props.t("loadmore")}</Button></div>
                    :<></>}
                </div>:<></>}

                {group===productLifeCycleTypes.fast?<div className="thumb-div-maindiv" style={{maxHeight:this.props.viewheight-190}}>
                    {ProposedProductsFast.length>0?ProposedProductsFast.map((prod,p)=>
                    <div className={'insideboxnameboxcard '+((sobj.productId===prod.productId)?"selected":"")} key={p} onClick={() => this.props.handleClickProdLCycle(prod)}>
                        <div className="thumb-div"  >
                            <div className='thumb-div-main'>
                                <img  src={prod.imageUrl} className="img-resize-ver" alt=""/>
                            </div>
                        </div>
                        <div className='text'>
                            <h2 className='prod-title'>{prod.productName}</h2>
                            <CopyToClipboard text="SAdasda" onCopy={() => this.copyToClipboard()}><small  className='prod-title'>{prod.barcode}</small></CopyToClipboard>
                            {/* {prod.suggestedAction!==SuggestedAction.none?<div className='Saction' style={{color:this.setcolorsuggestedAction(prod.suggestedAction)}}>{prod.suggestedAction}</div>:<></>}
                            {prod.suggestedAction===SuggestedAction.none?<div className='Saction'>Test Progress {prod.testProgress.covered}/{prod.testProgress.total}</div>:<></>} */}
                        </div>
                        <label>SPD:{prod.spfday.toFixed(2)}</label>
                    </div>
                    ):<div style={{textAlign:"center"}}>{Fastdivplaceholder}</div>}
                    {ProposedProductsSlow.length < this.state.ptotalresultsS?
                        <div className='text-center'><Button xs={12} className="ploadmore-link " onClick={() => {this.loadMoreFastProds()}}>{this.props.t("loadmore")}</Button></div>
                    :<></>}
                </div>:<></>}
            </div>
        )
    }
}

export default withTranslation()(withRouter(ProductLifeCycleMap))