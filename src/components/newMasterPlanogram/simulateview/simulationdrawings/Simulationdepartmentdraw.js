import React, { Component } from 'react'
import { Col } from 'react-bootstrap';
import { withTranslation } from 'react-i18next';
import { connect } from 'react-redux';
import { withRouter } from 'react-router-dom';
import { MPBoxType } from '../../../../enums/masterPlanogramEnums';
import { checkColorIsLight, stringtrim } from '../../../../_services/common.service';
import { TooltipWrapper } from '../../AddMethods';
import { getNameorIdorColorofBox } from '../../MPSimulationCommenMethods';
import FeatherIcon from 'feather-icons-react';
import { Icons } from '../../../../assets/icons/icons';

class Simulationdepartmentdraw extends Component {
    constructor(props) {
        super(props)

        this.state = {
           fieldsWithAnomaly:[] 
        }
    }

    componentDidMount(){
        if(this.props.simType === "AUI" || this.props.simType === "Normal"){
            this.getFieldsWithAnomaly(this.props.mapProducts, this.props.productsWithAnomaly)
        }
    }

    getFieldsWithAnomaly = (products, productsWithAnomaly) => {

        // Get productIds where anomaly is high or low
        const filteredProductIds = productsWithAnomaly.filter(data => data.anomaly === 'high' || data.anomaly === 'low').map(data => data.productId);

        // Get field_custom_id values for filtered productIds
        const fieldCustomIds = [];

        products.forEach(obj => {
            if (filteredProductIds.includes(obj.productId) &&  !fieldCustomIds.includes(obj.field_custom_id)){
                fieldCustomIds.push(obj.field_custom_id);
            }
        });

        this.setState({fieldsWithAnomaly:fieldCustomIds},()=>{
            // console.log(this.state.fieldsWithAnomaly)
        })
    }

    takeIntoCategory = (field_custom_id) => {

        const catrct = Object.values(this.props.mapCategories).find(obj => obj.field_custom_id === field_custom_id);
        const ct = `${catrct.field_custom_id}_${catrct.id}`;

        this.props.clickCategory(catrct,ct)
    }

    render() {
        var {mapFields,mapCategories,mapProducts,svgdrawDiemention,xrayActive,isSalesCycle,simType,isSCycle}=this.props;
        var {fieldsWithAnomaly}=this.state;
        return (
            <Col className="sim-wrapper">
                {/* {simulationObj&&simulationObj.simulationSnapshotId>0? <TooltipWrapper placement="bottom" text= {this.props.t("SnapShot")}><span className={'snapshot_span '+(this.props.simType === "AUI"?"alldepaui":'alldep')}><FeatherIcon icon="bookmark"  size={16} />
                </span></TooltipWrapper>:<></>} */}
                {Object.keys(mapFields).length>0&&<Col  className="single-simitem" onContextMenu={e => e.preventDefault()} style={{width: svgdrawDiemention&&svgdrawDiemention.drawWidth&&svgdrawDiemention.drawWidth>0?svgdrawDiemention.drawWidth:0,height:this.props.divHeight}}>
                    <svg id="mainsvg-view" className="sim-preview-all" width={svgdrawDiemention.drawWidth} height={this.props.divHeight} style={{  border: '0px solid rgb(81, 40, 160)', direction: "ltr"}} version="1.1" preserveAspectRatio="none" xmlns="http://www.w3.org/2000/svg">
                        {(mapFields&&Object.keys(mapFields).length>0)&&Object.keys(mapFields).map((Fld,f)=>{
                            var fld=mapFields[Fld]
                            return<React.Fragment key={f}>
                                <rect className=""  width={fld.drawWidth} height={fld.drawHeight} x={fld.x } y={fld.y } style={{ strokeWidth: 0, stroke: (this.props.dmode?'#2CC990':'#5128a0'), fill: 'transparent' }} 
                                />
                                {fld.separators&&fld.separators.length>0?fld.separators.map((sprtr,sp)=> <React.Fragment key={sp}> {sprtr.isCategoryEnd?<line x1={sprtr.drawX} y1={fld.y} x2={sprtr.drawX} y2={fld.y+fld.drawHeight} strokeWidth={4} stroke="red" strokeDasharray="6"  />:<line x1={sprtr.drawX} y1={fld.y} x2={sprtr.drawX} y2={fld.y+fld.drawHeight} strokeWidth={4} stroke={(this.props.dmode?'#2CC990':'#5128a0')} />} </React.Fragment>)
                                :<></>}
                                {fld.shelf.length>0?fld.shelf.map((shlf,g)=><React.Fragment key={g}>
                                        <rect className="sftrect" ref={(r) => this[g] = r}
                                            width={shlf.drawWidth} height={shlf.drawHeight} x={shlf.x } y={shlf.y +0} style={{ strokeWidth: 1, stroke: (this.props.dmode?'#2CC990':'#5128a0'), fill: shlf.isDisable?'#897CA3':'transparent' }} 
                                        />
                                        <rect width={shlf.drawWidth} height={shlf.drawGap} x={shlf.x} y={(shlf.y + 0)+(shlf.drawHeight?shlf.drawHeight:0)} style={{ strokeWidth: 1, stroke: (this.props.dmode?'#2CC990':'#5128a0'), fill: (this.props.dmode?'#2CC990':'#5128a0') }} />
                                    </React.Fragment>
                                ):<></>}
                                </React.Fragment>
                        })}

                            {(simType==="AUI" || simType==="Normal") && (isSalesCycle || isSCycle) && (mapCategories&&Object.keys(mapCategories).length>0)?Object.keys(mapCategories).map((cat,c)=>{
                            var catrect = mapCategories[cat];
                            let catrectcolor = (getNameorIdorColorofBox(catrect, "color")?getNameorIdorColorofBox(catrect, "color"):"#F39C12");
                            let cattxtcolor = (checkColorIsLight(catrectcolor)?"#5128a0":"white");

                            return <React.Fragment key={c}>
                                {xrayActive===1?
                                <React.Fragment>
                                    {catrect.drawfromConShelf?<>
                                        {catrect.contain_shelves.map((crect,cr)=>{
                                            return <React.Fragment key={cr}>
                                            {crect.y > -1 && crect.height?<>
                                            <rect id={catrect.field_custom_id+"_"+catrect.id} className="category-box" onClick={()=>this.props.clickCategory(catrect,cat)}  width={crect.drawWidth} height={crect.drawHeight} x={crect.x } y={crect.y +0} fill= {!isSalesCycle && !isSCycle?getNameorIdorColorofBox(catrect,"color"):"transparent"}  ref={(r) => this[cr] = r} />

                                            <clipPath id={("clip-"+c+""+cr)}>
                                                <rect x={crect.x} y={crect.y} width={crect.drawWidth} height={20} />
                                            </clipPath>

                                            <g clipPath={"url(#clip-"+(c+""+cr)+")"}>
                                                {/* <rect width={isSalesCycle && fieldsWithAnomaly.includes(catrect.field_custom_id)?68:54} height={20} x={crect.x+1 } y={crect.y +0} fill= {catrectcolor} id={c} ref={(r) => this[c] = r} />
                                                <text  fill={cattxtcolor} x={crect.x+5 } y={crect.y +13} className="small catnametag">{stringtrim(getNameorIdorColorofBox(catrect,"name"),10)} </text>
                                                {isSalesCycle && fieldsWithAnomaly.includes(catrect.field_custom_id) && Icons.Hazard(13,catrect.x+50,catrect.y +4)} */}
                                                { catrect.type===MPBoxType.rule?
                                                    <g>
                                                        <rect x={(crect.x +crect.drawWidth)- 17 } y={crect.y +0} fill={catrectcolor} height="15" width="15"></rect>
                                                        <text fill={cattxtcolor} x={(crect.x +crect.drawWidth)-13 } y={crect.y +12} className="small rule-label">R</text>
                                                    </g>
                                                :<></> }
                                            </g></>:<></>}
                                            </React.Fragment>
                                        })}
                                    </>:<>
                                        {/* {!isSalesCycle?<rect id={catrect.field_custom_id+"_"+catrect.id} className="category-box" onClick={()=>this.props.clickCategory(catrect,cat)}  width={catrect.drawWidth} height={catrect.drawHeight} x={catrect.x } y={catrect.y +0} fill= {getNameorIdorColorofBox(catrect,"color")}  ref={(r) => this[c] = r} />
                                        :<></>} */}
                                        <rect id={catrect.field_custom_id+"_"+catrect.id} className="category-box" onClick={()=>this.props.clickCategory(catrect,cat)}  width={catrect.drawWidth} height={catrect.drawHeight} x={catrect.x } y={catrect.y +0} fill= {!isSalesCycle && !isSCycle ?getNameorIdorColorofBox(catrect,"color"):"transparent"}  ref={(r) => this[c] = r} /> 
                                        <clipPath id={("clip-"+c+"-nshelf")}>
                                            <rect width={catrect.drawWidth} x={catrect.x} y={catrect.y} height={20} />
                                        </clipPath>

                                        <g clipPath={"url(#clip-"+c+"-nshelf)"}>
                                            {/* <rect  width={isSalesCycle && fieldsWithAnomaly.includes(catrect.field_custom_id)?68:54} height={20} x={catrect.x } y={catrect.y +0} fill= {catrectcolor} id={c} ref={(r) => this[c] = r} />
                                            <text  fill={cattxtcolor} x={catrect.x+5 } y={catrect.y +13} className="small catnametag">{stringtrim(getNameorIdorColorofBox(catrect,"name"),10)} </text>
                                            {isSalesCycle && fieldsWithAnomaly.includes(catrect.field_custom_id) && Icons.Hazard(13,catrect.x+50,catrect.y +4)} */}
                                            { catrect.type===MPBoxType.rule?
                                            <g>
                                            <rect x={(catrect.x +catrect.drawWidth)-17 } y={catrect.y +0} fill={catrectcolor} height="15" width="15"></rect>
                                            <text  fill={cattxtcolor} x={(catrect.x +catrect.drawWidth)-13 } y={catrect.y +12} className="small rule-label">R</text>
                                            </g>
                                            :<></> }
                                        </g>
                                    </>}
                                    
                                </React.Fragment>
                            :<></>}
                        </React.Fragment>
                        }):<></>}

                        {(mapProducts&&mapProducts.length>0)?mapProducts.map((product,prodt)=>{
                            var productSheflItem = (product.field_custom_id ?mapFields[product.field_custom_id].shelf.find(x => x.rank === product.shelfrank):null)
                            return <React.Fragment key={prodt}>
                                { !product.isDelete&&<>
                                    <image pointerEvents="all" preserveAspectRatio="none" x={product.x} y={product.y} width={product.drawWidth} height={product.drawHeight} href={product.imageUrl}  style={{outline: "solid 1px rgb(204, 204, 204)"}} />
                                    {product.isStackable?<foreignObject  x={product.x} y={product.y-18} width={product.drawWidth} height={20} onClick={()=>this.takeIntoCategory(product.field_custom_id)} style={{cursor:"pointer"}}>
                                <div 
                                // className='centered'
                                    style={{textAlign: "center"}}>
                                    <FeatherIcon icon="chevrons-up"  color={"#ED327A"} size={14} />
                                </div>
                            </foreignObject>:<></>}
                                    {/* <RenderProdImage prodObj={product} /> */}
                                    {(isSalesCycle||isSCycle) && 
                                    this.props.productsWithAnomaly.map(data => data.productId).includes(product.productId)
                                    ? <TooltipWrapper placement="bottom" text={this.props.productsWithAnomaly.find(prd => prd.productId === product.productId && prd.salesAvailable)? isFinite(this.props.productsWithAnomaly.find(prd => prd.productId === product.productId && prd.salesAvailable).salesCycle) ? this.props.productsWithAnomaly.find(prd => prd.productId === product.productId && prd.salesAvailable).salesCycle.toFixed(2).replace(/\.?0+$/, '') : this.props.t("NO_SALES_DATA") : this.props.t("NO_SALES_DATA")} bcolor={this.props.productsWithAnomaly.find(prd => prd.productId === product.productId && prd.salesAvailable) ? isFinite(this.props.productsWithAnomaly.find(prd => prd.productId === product.productId && prd.salesAvailable).salesCycle) ? this.props.productsWithAnomaly.find(prd => prd.productId === product.productId && prd.salesAvailable).anomaly === "high" ? "red" : this.props.productsWithAnomaly.find(prd => prd.productId === product.productId && prd.salesAvailable).anomaly === "low" ? "blue" : "white" : undefined : undefined}>
                                            <rect className="other-box" width={product.drawWidth} height={this.props.productsWithAnomaly.find(prd => prd.productId === product.productId && prd.salesAvailable) ?  this.props.productsWithAnomaly.find(prd => prd.productId === product.productId && prd.salesAvailable).anomaly === "high" || this.props.productsWithAnomaly.find(prd => prd.productId === product.productId && prd.salesAvailable).anomaly === "low" ? productSheflItem?(productSheflItem.drawHeight+productSheflItem.drawGap):0 : product.drawHeight  : product.drawHeight} x={product.x} 
                                                y={(this.props.productsWithAnomaly.find(prd => prd.productId === product.productId && prd.salesAvailable) ? this.props.productsWithAnomaly.find(prd => prd.productId === product.productId && prd.salesAvailable).anomaly === "high" || this.props.productsWithAnomaly.find(prd => prd.productId === product.productId && prd.salesAvailable).anomaly === "low" ? (productSheflItem?productSheflItem.y:0) : product.y   : product.y )} 
                                                fill= {this.props.productsWithAnomaly.find(prd => prd.productId === product.productId && prd.salesAvailable) ?  this.props.productsWithAnomaly.find(prd => prd.productId === product.productId && prd.salesAvailable).anomaly === "high" ? "#E90041" : this.props.productsWithAnomaly.find(prd => prd.productId === product.productId && prd.salesAvailable).anomaly === "low" ? "#2F80ED" : "transparent" : "transparent"} 
                                                fillOpacity="0.3" opacity="0.7" 
                                                onClick={()=>this.takeIntoCategory(product.field_custom_id)}
                                                style={{cursor:"pointer"}}
                                            />  
                                        </TooltipWrapper>:<></>}
                                
                                    {!isSalesCycle && !isSCycle && xrayActive===3? <TooltipWrapper text={getNameorIdorColorofBox(product.brand,"name")}>
                                        <rect className="other-box"  width={product.drawWidth} height={productSheflItem?(productSheflItem.drawHeight+productSheflItem.drawGap):0} x={product.x} y={(productSheflItem?productSheflItem.y:0)} fill= {(product.brand?getNameorIdorColorofBox(product.brand,"color"):"red")}  />
                                    </TooltipWrapper>:<></>}
                                    {!isSalesCycle && !isSCycle && xrayActive===2?<TooltipWrapper text={getNameorIdorColorofBox(product.subcategory,"name")}>
                                        <rect className="other-box"  width={product.drawWidth} height={productSheflItem?(productSheflItem.drawHeight+productSheflItem.drawGap):0} x={product.x} y={(productSheflItem?productSheflItem.y:0)} fill= {(product.subcategory?getNameorIdorColorofBox(product.subcategory,"color"):"red")}  />  
                                    </TooltipWrapper>:<></>}
                                
                                </>}
                            </React.Fragment>
                        }):<></>}

                            {(!isSalesCycle && !isSCycle) && (mapCategories&&Object.keys(mapCategories).length>0)?Object.keys(mapCategories).map((cat,c)=>{
                            var catrect = mapCategories[cat];
                            let catrectcolor = (getNameorIdorColorofBox(catrect, "color")?getNameorIdorColorofBox(catrect, "color"):"#F39C12");
                            let cattxtcolor = (checkColorIsLight(catrectcolor)?"#5128a0":"white");

                            return <React.Fragment key={c}>
                                {xrayActive===1?
                                <React.Fragment>
                                    {catrect.drawfromConShelf?<>
                                        {catrect.contain_shelves.map((crect,cr)=>{
                                            return <React.Fragment key={cr}>
                                            {crect.y > -1 && crect.height?<>
                                            <rect id={catrect.field_custom_id+"_"+catrect.id} className="category-box" onClick={()=>this.props.clickCategory(catrect,cat)}  width={crect.drawWidth} height={crect.drawHeight} x={crect.x } y={crect.y +0} fill= {getNameorIdorColorofBox(catrect,"color")}  ref={(r) => this[cr] = r} />

                                            <clipPath id={("clip-"+c+""+cr)}>
                                                <rect x={crect.x} y={crect.y} width={crect.drawWidth} height={20} />
                                            </clipPath>

                                            <g clipPath={"url(#clip-"+(c+""+cr)+")"}>
                                                {/* <rect width={isSalesCycle && fieldsWithAnomaly.includes(catrect.field_custom_id)?68:54} height={20} x={crect.x+1 } y={crect.y +0} fill= {catrectcolor} id={c} ref={(r) => this[c] = r} />
                                                <text  fill={cattxtcolor} x={crect.x+5 } y={crect.y +13} className="small catnametag">{stringtrim(getNameorIdorColorofBox(catrect,"name"),10)} </text>
                                                {isSalesCycle && fieldsWithAnomaly.includes(catrect.field_custom_id) && Icons.Hazard(13,catrect.x+50,catrect.y +4)} */}
                                                { catrect.type===MPBoxType.rule?
                                                    <g>
                                                        <rect x={(crect.x +crect.drawWidth)- 17 } y={crect.y +0} fill={catrectcolor} height="15" width="15"></rect>
                                                        <text fill={cattxtcolor} x={(crect.x +crect.drawWidth)-13 } y={crect.y +12} className="small rule-label">R</text>
                                                    </g>
                                                :<></> }
                                            </g></>:<></>}
                                            </React.Fragment>
                                        })}
                                    </>:<>
                                        {/* {!isSalesCycle?<rect id={catrect.field_custom_id+"_"+catrect.id} className="category-box" onClick={()=>this.props.clickCategory(catrect,cat)}  width={catrect.drawWidth} height={catrect.drawHeight} x={catrect.x } y={catrect.y +0} fill= {getNameorIdorColorofBox(catrect,"color")}  ref={(r) => this[c] = r} />
                                        :<></>} */}
                                        <rect id={catrect.field_custom_id+"_"+catrect.id} className="category-box" onClick={()=>this.props.clickCategory(catrect,cat)}  width={catrect.drawWidth} height={catrect.drawHeight} x={catrect.x } y={catrect.y +0} fill= {!isSalesCycle && !isSCycle?getNameorIdorColorofBox(catrect,"color"):"transparent"}  ref={(r) => this[c] = r} /> 
                                        <clipPath id={("clip-"+c+"-nshelf")}>
                                            <rect width={catrect.drawWidth} x={catrect.x} y={catrect.y} height={20} />
                                        </clipPath>

                                        <g clipPath={"url(#clip-"+c+"-nshelf)"}>
                                            {/* <rect  width={isSalesCycle && fieldsWithAnomaly.includes(catrect.field_custom_id)?68:54} height={20} x={catrect.x } y={catrect.y +0} fill= {catrectcolor} id={c} ref={(r) => this[c] = r} />
                                            <text  fill={cattxtcolor} x={catrect.x+5 } y={catrect.y +13} className="small catnametag">{stringtrim(getNameorIdorColorofBox(catrect,"name"),10)} </text>
                                            {isSalesCycle && fieldsWithAnomaly.includes(catrect.field_custom_id) && Icons.Hazard(13,catrect.x+50,catrect.y +4)} */}
                                            { catrect.type===MPBoxType.rule?
                                            <g>
                                            <rect x={(catrect.x +catrect.drawWidth)-17 } y={catrect.y +0} fill={catrectcolor} height="15" width="15"></rect>
                                            <text  fill={cattxtcolor} x={(catrect.x +catrect.drawWidth)-13 } y={catrect.y +12} className="small rule-label">R</text>
                                            </g>
                                            :<></> }
                                        </g>
                                    </>}
                                    
                                </React.Fragment>
                            :<></>}
                        </React.Fragment>
                        }):<></>}


                            {(mapCategories&&Object.keys(mapCategories).length>0)?Object.keys(mapCategories).map((cat,c)=>{
                            var catrect = mapCategories[cat];
                            let catrectcolor = (getNameorIdorColorofBox(catrect, "color")?getNameorIdorColorofBox(catrect, "color"):"#F39C12");
                            let cattxtcolor = (checkColorIsLight(catrectcolor)?"#5128a0":"white");
                        
                            return <React.Fragment key={c}>
                                {xrayActive===1?
                                <React.Fragment>
                                    {catrect.drawfromConShelf?<>
                                        {catrect.contain_shelves.map((crect,cr)=>{
                                            return <React.Fragment key={cr}>
                                            {crect.y > -1 && crect.height?<>

                                            <g clipPath={"url(#clip-"+(c+""+cr)+")"} onClick={()=>this.props.clickCategory(catrect,cat)} style={{cursor:"pointer"}}>
                                                <rect width={(isSalesCycle || isSCycle) && fieldsWithAnomaly.includes(catrect.field_custom_id)?68:54} height={20} x={crect.x+1 } y={crect.y +0} fill= {catrectcolor} id={c} ref={(r) => this[c] = r} />
                                                <text  fill={cattxtcolor} x={crect.x+5 } y={crect.y +13} className="small catnametag">{stringtrim(getNameorIdorColorofBox(catrect,"name"),10)} </text>
                                                {(isSalesCycle || isSCycle) && fieldsWithAnomaly.includes(catrect.field_custom_id) && Icons.Hazard(13,catrect.x+50,catrect.y +4)}
                                            </g></>:<></>}
                                            </React.Fragment>
                                        })}
                                    </>:<>
                                        <g clipPath={"url(#clip-"+c+"-nshelf)"} onClick={()=>this.props.clickCategory(catrect,cat)} style={{cursor:"pointer"}}>
                                            <rect  width={(isSalesCycle || isSCycle) && fieldsWithAnomaly.includes(catrect.field_custom_id)?68:54} height={20} x={catrect.x } y={catrect.y +0} fill= {catrectcolor} id={c} ref={(r) => this[c] = r} />
                                            <text  fill={cattxtcolor} x={catrect.x+5 } y={catrect.y +13} className="small catnametag">{stringtrim(getNameorIdorColorofBox(catrect,"name"),10)} </text>
                                            {(isSalesCycle || isSCycle) && fieldsWithAnomaly.includes(catrect.field_custom_id) && Icons.Hazard(13,catrect.x+50,catrect.y +4)}
                                        </g>
                                    </>}
                                    
                                </React.Fragment>
                            :<></>}
                        </React.Fragment>
                        }):<></>}
            
                        
                    </svg>
                </Col>}
            </Col>
        )
    }
}

const mapDispatchToProps = dispatch => ({
    
});
export default withTranslation()(withRouter(connect(null, mapDispatchToProps)(Simulationdepartmentdraw)))
