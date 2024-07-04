import React, { PureComponent } from 'react'
import { withTranslation } from 'react-i18next'
import { withRouter } from 'react-router-dom';
import Select from 'react-select'
import "./lifecyclePopup.css"
import { ArrowMap } from '../../../../assets/icons/icons';
import { Button } from 'react-bootstrap';
import { productLifeCycleTypes } from '../../../../enums/aristoMapDataEnums';
import { alertService } from '../../../../_services/alert.service';
import { XIcon } from '@primer/octicons-react';
import { TooltipWrapper } from '../../../newMasterPlanogram/AddMethods';
class LifecyclePopup extends PureComponent {
    constructor(props) {
        super(props)

        this.state = {
            
        }
    }
    clickExecute=()=>{
        alertService.success(this.props.t("EXCECUTED_SUCCESSFULLY"))
    }
    clickIgnore=()=>{
        this.props.handleClickProdLCycle(null,true)
    }
    getselectboxarray=()=>{
        // console.log(this.props.fastpopupoptionList);
        // console.log(this.props.SlowpopupoptionList);
        var array=this.props.optionlistpopup
        var selArray=[]
        // if(this.props.selectedproduct.type===productLifeCycleTypes.fast){
        //     array=this.props.fastpopupoptionList
            
        // }
        // else if(this.props.selectedproduct.type===productLifeCycleTypes.slow){
        //     array=this.props.SlowpopupoptionList
        // }
        if(array.length>0){
            array.forEach(element => {
                var obj={
                    label:element.productName,
                    value:element.productId
                }
                selArray.push(obj)
            });
        }
        return selArray
    }

    render() {
        let{selectedproduct,selectedoptionprod}=this.props
        var selectboxlist=this.getselectboxarray()
        var leftproduct=selectedproduct.type===productLifeCycleTypes.fast?selectedproduct:selectedoptionprod
        var rightproduct=selectedproduct.type===productLifeCycleTypes.slow?selectedproduct:selectedoptionprod
        return (
            <div className='prod-lcycle-popup'>
                
                <div style={{height:"20px"}}><span style={{float:"right"}}><Button className='close' variant='default' onClick={()=>this.clickIgnore()}><XIcon style={{color:"#4F4F4"}} size={16}/></Button></span></div>
                
                <div className='middle'>
                    
                {leftproduct?<div className='alldiv'>
                        <div className='imagecard'>
                            <div className='selectboxmain'></div>
                            <div className='imgdiv'><img src={leftproduct.imageUrl} alt="" /></div>
                            <div className='text-detail'>
                                <TooltipWrapper text={leftproduct.productName}>
                                    <h5>{leftproduct.productName.substring(0, 20)+(leftproduct.productName.length > 20?"..":"")}</h5>
                                </TooltipWrapper>
                                {/* <h5>{leftproduct.productName}</h5> */}
                                <div>{leftproduct.barcode}</div>
                            </div>
                            <label>SPD:{leftproduct.spfday.toFixed(2)}</label>
                        </div>
                    </div>:
                    <div className='alldiv'>
                        <div className='imagecard removeprod'>
                        </div>
                    </div>}
                    <div className='arrowcard'>
                        <div className='arrow'><ArrowMap /></div>
                    </div>
                    {rightproduct?<div className='alldiv'>
                        <div className='imagecard removeprod'>
                        <div className='selectboxmain'>
                            <div className='selectbox'>
                                <Select 
                                    menuPlacement="auto"
                                    placeholder={this.props.t("select_different")}
                                    className="filter-selec2" size="sm" classNamePrefix="searchselect-inner" 
                                    maxMenuHeight={200} 
                                    options={selectboxlist}  
                                    onChange={(e)=>this.props.changeselectedoptionprod(e)} 
                                    // value={{label:selectedproduct.productName,id:selectedproduct.productId,}}
                                    
                                    />
                            </div>
                        </div>
                            <div className='imgdiv'><img src={rightproduct?rightproduct.imageUrl:""} alt="" /></div>
                            <div className='text'>
                                <TooltipWrapper text={rightproduct.productName}>
                                    <h5>{rightproduct.productName.substring(0, 20)+(rightproduct.productName.length > 20?"..":"")}</h5>
                                </TooltipWrapper> 
                                {/* <h5>{rightproduct?rightproduct.productName:"-"}</h5> */}
                                <div className='barcode'>{rightproduct?rightproduct.barcode:"-"}</div>
                                
                            </div>
                            <label>SPD:{rightproduct.spfday.toFixed(2)}</label>
                        </div>
                    </div>:
                    <div className='alldiv'>
                        <div className='imagecard removeprod'>
                        </div>
                    </div>}
                </div>
                <div className='buttons-list'>
                    <Button variant='success' onClick={()=>this.clickExecute()}>{this.props.t("Execute")}</Button>
                    <Button variant='danger' onClick={()=>this.clickIgnore()}>{this.props.t("Ignore")}</Button>
                </div>
            </div>
        )
    }
}

export default withTranslation()(withRouter(LifecyclePopup))