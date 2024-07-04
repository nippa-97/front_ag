import React, { PureComponent } from 'react'
import { CopyToClipboard } from 'react-copy-to-clipboard'; //copy text to clipboard
import { alertService } from '../../../_services/alert.service';
import { submitCollection } from '../../../_services/submit.service';
import { submitSets } from '../../UiComponents/SubmitSets';
import { Button } from 'react-bootstrap';
import { SuggestedAction } from '../../../enums/mapenums';
import { withTranslation } from 'react-i18next';
import {  withRouter } from 'react-router-dom';
class NewProductstaMap extends PureComponent {
    constructor(props) {
        super(props)

        this._isMounted = false;
        this.state = {
            // group:"fields"
            pstartpage: 0, ptotalresults: 0, pmaxcount: 8,
            newProducts:[],
            Nproddivplaceholder:this.props.t("DATA_LOADING_PLEASE_WAIT"),
            isDataLoading: false,
        }
    }
    componentDidMount(){
        this._isMounted = true;
        if(this._isMounted){
            this.getNewProductList(0)
        }
    }
    componentWillUnmount(){
        this._isMounted = false;
    }
    //onclick load more button in search
    loadMoreProds = () => {
        //add maxcount to current start index
        var cstarttxt = (this.state.pstartpage === 0?(this.state.pmaxcount):(this.state.pstartpage + this.state.pmaxcount));
        this.getNewProductList(cstarttxt);
    }
    getNewProductList=(startidx)=>{
        var cobj={
            isReqPagination: true,
            maxResult: this.state.pmaxcount,
            startIndex: startidx
        }
        var cnewProducts=this.state.newProducts;

        this.setState({ isDataLoading: true }, () => {
            submitSets(submitCollection.loadNewTestingProduct, cobj, false).then(res => {
                if (res && res.status) {
                    if(res.extra.length===0){
                        this.setState({Nproddivplaceholder:this.props.t("NO_RESULTS")})
                    }
                    this.setState({
                        newProducts:cnewProducts.length>0?cnewProducts.concat(res.extra):res.extra,
                        ptotalresults:res.count?res.count:this.state.ptotalresults,
                        pstartpage:startidx
                    })
                }else{
                    alertService.error(this.props.t("FAIL"))
                }

                this.setState({ isDataLoading: false });
            })
        });
    }
    //copy barcode to clipboard message show
    copyToClipboard = (ctxt) => {
        alertService.info("COPIED_TO_CLIP_BOARD");
    }
    setcolorsuggestedAction=(suggestedAction)=>{
        var color="#59595a"
        color=(suggestedAction===SuggestedAction.keep)?"#77DB61":(suggestedAction===SuggestedAction.remove)?"#EB5757":(suggestedAction===SuggestedAction.expand)?"#5128A0":color
        return color
    }
    setcolorsuggestedActionBG=(suggestedAction)=>{
        var color="#59595a"
        color=(suggestedAction===SuggestedAction.keep)?"#ecffe8":(suggestedAction===SuggestedAction.remove)?"#fad4d4":(suggestedAction===SuggestedAction.expand)?"#e5e4f7":color
        return color
    }
    
    render() {
        var {newProducts, Nproddivplaceholder, isDataLoading}=this.state
        var {sobj,newprodselectedobj}=this.props
        return (
            <div className='newprods-tab-map map-prod-card'>
                {/* <div class="right-side-content-header d-flex justify-content-center">
                    <div className='right-side-content-header-sub'>
                        <ul className='list-inline ul'>
                        <li className={`list-inline-item aui-content-title${this.state.group === "fields"?"-active":""}`} onClick={()=>{this.setGroup("fields")}}>Slow</li>
                        <li className={`list-inline-item aui-content-title${this.state.group === "tags"?"-active":""}`} onClick={()=>{this.setGroup("tags")}}>Fast</li>
                        </ul>
                    </div>
                </div> */}
                <div>
                <div className='title-map-tab'>{this.props.t("NEWPRODUCTS")}</div>
                <div className="thumb-div-maindiv" style={{maxHeight:(newprodselectedobj!==null?this.props.viewheight-290:this.props.viewheight-180)}}>
                    {newProducts.length>0?newProducts.map((prod,p)=><div className={'insideboxnameboxcard '+((sobj.productId===prod.productId)?"selected":"")} key={p} 
                        onClick={()=>this.props.setSelectedCard(prod)}>
                        <div className="thumb-div"  >
                            <div className='thumb-div-main'>
                                <img  src={prod.imgUrl} className="img-resize-ver" alt=""/>
                            </div>
                        </div>
                        <div className='text'>
                            <h2 className='prod-title'>{prod.productName}</h2>
                            <CopyToClipboard text="SAdasda" onCopy={() => this.copyToClipboard()}><small  className='prod-title'>{prod.barcode}</small></CopyToClipboard>
                            {prod.suggestedAction!==SuggestedAction.none?<div className={'suggestionaction'} ><span style={{color:this.setcolorsuggestedAction(prod.suggestedAction),background:this.setcolorsuggestedActionBG(prod.suggestedAction)}}>{prod.suggestedAction}</span></div>:<></>}
                            {prod.suggestedAction===SuggestedAction.none?<div className='testPeriod'><span>{prod.testProgress.covered}22/{prod.testProgress.total}32</span></div>:<></>}
                        </div>
                    </div>):<></>}
                    {newProducts.length < this.state.ptotalresults?
                        <div className='text-center'><Button xs={12} className="ploadmore-link " onClick={() => {this.loadMoreProds()}}>{this.props.t("loadmore")}</Button></div>
                    :isDataLoading?<div className='NOResultdivholder' >{Nproddivplaceholder}</div>:<></>}
                    </div>
                </div>
            </div>
        )
    }
}

export default withTranslation()(withRouter( NewProductstaMap))