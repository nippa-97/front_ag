import  { Component } from 'react'
import { Button, Col, Modal, Form, OverlayTrigger, Tooltip } from 'react-bootstrap'
import "./ExcelImportModel.css"
import UploadInput from "./UploadInput"
import ProductDetails from "./ProductDetails"
import * as XLSX from "xlsx"
import { SquareFillIcon} from '@primer/octicons-react';

import {convertDate} from "../../../../_services/common.service"
import { submitCollection } from "../../../../_services/submit.service";
import { submitSets } from '../../../UiComponents/SubmitSets';
import {alertService} from "../../../../_services/alert.service"
import {AcViewModal } from '../../../UiComponents/AcImports';
import { ExcelImportType } from '../../../../enums/excelImportType';
import { ExcelProductImport } from '../../../../enums/excelImportEnum';

export class ExcelImportModel extends Component {

  constructor(props) {
    super(props)
    this.state = {
        optionType : ExcelImportType.IsBlock,
        data:[],
        isblock:[],
        isArchive:[],
        products:[],
        isloaded:false,
        isduplicate: false,
        haveIssue : false
    }
  }
 
  changeType = (val) => {
    this.setState({
      optionType : val,
      data:[],
      isblock:[],
      isArchive:[],
      products:[],
      isduplicate: false,
      haveIssue : false
    })
  }
  

  dateCheck(d1,d2){
    let date1 = new Date(new Date(d1).toISOString().split('T')[0]);
    let date2 =new Date (new Date( d2).toISOString().split('T')[0]);
    if(date1 >= date2) {
      return true;
    }else{
      return false;
    }
  }
 tomorrowDate() {
    const today = new Date(); 
    const tomorrow = new Date(today); 
    tomorrow.setDate(today.getDate() + 1); 
    return tomorrow
  }
  

  setData = (val)=>{
    if(val.length > 0){
      this.setState({
        data:val,
        isloaded:true
      },()=>{
        if(this.state.optionType === ExcelImportType.IsBlock){
          if(this.state.data.length > 0){
            let isblock = [];
            for (const val of this.state.data) {
              let duplicate = false;
              let barcode = this.whiteSpaceRemove(val.barcode);
              if(barcode && barcode !== "" && barcode !== "undefined"){
                if(isblock.length > 0){
                  let existProduct = isblock.find((d)=>{return d.barcode === barcode});
                  if(existProduct){
                    duplicate  = true;
                  }
                }
                if(typeof(val.blockUntilDate) === 'number'){
                  const date = XLSX.SSF.parse_date_code(val.blockUntilDate);
                  let temp = new Date(date.y+"-"+date.m+"-"+date.d);
                   let dateCheck= this.dateCheck(convertDate(temp),this.tomorrowDate())

                  isblock.push({barcode:barcode,untildate:convertDate(temp),status:true,isduplicate:duplicate,isHaveIsse:!dateCheck});
                }else{
                  isblock.push({barcode:barcode,untildate:'Invalid date',status:false,isHaveIsse :true,isduplicate:duplicate});
                }
              }else{
                if(typeof(val.blockUntilDate) === 'number'){
                  const date = XLSX.SSF.parse_date_code(val.blockUntilDate);
                  let temp = new Date(date.y+"-"+date.m+"-"+date.d);
                  isblock.push({barcode:null,untildate:convertDate(temp),status:true,isduplicate:false,isHaveIsse:true});
                }else{
                  isblock.push({barcode:null,untildate:'Invalid date',status:false,isHaveIsse :true,isduplicate:false});
                }
              }
            }
            // let uniqueData =[...new Map(isblock.map((m) => [m.barcode, m])).values()];
            if(isblock.length > 0){
              this.setState({
                isblock:isblock,
                isArchive:[],
                products:[],
                data:[],
                isloaded:false
              })
            }else{
              this.NoDataAvailable();
            }
          }else{
           this.NoDataAvailable();
          }
        }
    
        if(this.state.optionType === ExcelImportType.IsArchive){
          if(this.state.data.length > 0){
            let isArchive = [];
            for (const val of this.state.data) {
              let duplicate = false;
              let barcode = this.whiteSpaceRemove(val.barcode);

              if(barcode && barcode !== "" && barcode !== "undefined"){
                if(isArchive.length > 0){
                  let existProduct = isArchive.find((d)=>{return d.barcode === barcode});
                  if(existProduct){
                    duplicate  = true;
                  }
                }
                isArchive.push({barcode:barcode,isHaveIsse :false,isduplicate:duplicate});

              }else{
                isArchive.push({barcode:null,isHaveIsse :true,isduplicate:false});
              }
              // if(val.barcode){
              //   let duplicate = false;
              //   let product = isArchive.filter((d)=>{return d.isduplicate === true})
              //   if(product){
              //     duplicate = true
              //   }
              //   let barcode = this.whiteSpaceRemove(val.barcode);
              //   if(barcode && barcode !== ""){
              //     isArchive.push({barcode:barcode,isduplicate:duplicate});
              //   }
              // }else{
              //   isArchive.push({barcode:null,isHaveIsse :true,isduplicate:false}); 
              // }
            }
            // let uniqueData =[...new Map(isArchive.map((m) => [m.barcode, m])).values()];
            if(isArchive.length > 0){
              this.setState({
                isArchive:isArchive,
                isblock:[],
                products:[],
                data:[],
                isloaded:false
              })
            }else{
             this.NoDataAvailable();
            }
          }else{
            this.NoDataAvailable();
          }
        }
    
        if(this.state.optionType === ExcelImportType.ProductUpdate){
          let products = [];
          if(this.state.data.length > 0){
            for (const item of this.state.data) {
                let mainBarcode ;
                let barcode = this.whiteSpaceRemove(item.barcode);
                let width = this.whiteSpaceRemove(item.width);
                let height = this.whiteSpaceRemove(item.height);
                let depth = this.whiteSpaceRemove(item.depth);
                let isNoos = this.whiteSpaceRemove(item.isNoos);
                let sensitivity = this.whiteSpaceRemove(item.sensitivity);

                if(width === "undefined"){
                  width = null;
                }
                if(height === "undefined"){
                  height = null;
                }
                if(depth === "undefined"){
                  depth = null;
                }
                if(isNoos === "undefined"){
                  isNoos = null;
                }else{
                  if((isNoos).toLowerCase() === "true"){
                    isNoos = "true";
                  }else if((isNoos).toLowerCase() === "false"){
                    isNoos = "false";
                  }else{
                    isNoos = "Invalid value"
                  }

                }
                if(sensitivity === "undefined"){
                  sensitivity = null;
                }

                if(barcode !== "" && barcode !== null && barcode !== "undefined"){
                  mainBarcode = barcode;
                }else{
                  mainBarcode = null
                }
                  let uom;
                  if(width || height || depth){
                    uom="Invalid uom"
                  }
                  if(item.uom && this.whiteSpaceRemove(item.uom) !== "" && this.whiteSpaceRemove(item.uom) !== null){
                    let lowecaseUom =this.whiteSpaceRemove(item.uom).toLowerCase();
                      uom="Invalid uom"
                    if(lowecaseUom === "cm")
                        uom = "cm";
                    if(lowecaseUom === "inches")
                        uom = "inches"
                    if(lowecaseUom === "feet")
                        uom = "feet"
                    if(lowecaseUom === "m")
                       uom = "meters"
                  }
                  let isduplicate = false;
                  let isHaveIsse = false;
                  if(mainBarcode !== null){
                    let product = products.find((d)=>{return d.barcode === mainBarcode});
                    if(product){
                      isduplicate  = true;
                    }
                  }
                  if(uom === "Invalid uom"){
                    isHaveIsse = true;
                  }
                  if(mainBarcode === null){
                    isHaveIsse = true;
                  }
                  if(isNoos === "Invalid value"){
                    isHaveIsse = true;
                  }
                  let data ={
                    barcode:mainBarcode,
                    name:item.name?this.Trimtext(item.name):null,
                    width:width?width:null,
                    height:height?height:null,
                    depth:depth?depth:null,
                    uom:uom?uom:null,
                    subCategory:item.subCategory?this.Trimtext(item.subCategory):null,
                    brand:item.brand?this.Trimtext(item.brand):null,
                    isduplicate:isduplicate,
                    isHaveIsse: isHaveIsse,
                    isNoos:isNoos,
                    sensitivity:sensitivity

                  }
                products.push(data);
                
              
              
            }
        
          
          if(products.length >0 ){
            this.setState({
              products:products,
              isArchive:[],
              isblock:[],
              data:[],
              isloaded:false
            })
          }else{
            this.NoDataAvailable();
          }
          }else{
            this.NoDataAvailable();
          }
        }
      })
    }
    this.handleIssueDot()
  }


  NoDataAvailable = ()=>{
    this.setState({
      isloaded:false,
      data:[],
      isArchive:[],
      isblock:[],
      products:[],
      isduplicate:false,
      haveIssue:false,
    },()=>{
      alertService.error(this.props.t('No_Data_Available'));
    })
  }

  setDefalutValues = ()=>{
    this.setState({
      data:[],
      isArchive:[],
      isblock:[],
      products:[],
      isduplicate:false,
      haveIssue:false,
    })
  }

  whiteSpaceRemove = (text) =>{
    return String(text).replace(/\s/g,"");
  }
  Trimtext = (text)=>{
    return String(text).trim();
  }

  convertToLowerCase = (text)=>{
    return String(text).toLowerCase();
  }

  deleteProduct = (index)=>{
    if(this.state.optionType === ExcelImportType.IsBlock){
      let isBlock = this.state.isblock;
      isBlock.splice(index,1);
      this.setState({
        isblock : isBlock
      },()=>{
        this.handleIssueDot()
      })
    }else if(this.state.optionType === ExcelImportType.IsArchive){
      let isArchive = this.state.isArchive;
      isArchive.splice(index,1);
      this.setState({
        isArchive : isArchive
      },()=>{
        this.handleIssueDot()
      })
    }else if(this.state.optionType === ExcelImportType.ProductUpdate){
      let products = this.state.products;
      products.splice(index,1);
      this.setState({
        products : products
      },()=>{
        this.handleIssueDot()
      })
    }

  }

  handleUpdate = () =>{
    let products = [...new Map(this.state.products.map((m) => [m.barcode, m])).values()];
    let isblock = [...new Map(this.state.isblock.map((m) => [m.barcode, m])).values()];
    let isArchive = [...new Map(this.state.isArchive.map((m) => [m.barcode, m])).values()];
       
    if(products.length > 0 || isblock.length > 0 || isArchive.length > 0){
      this.setState({
        isloaded : true
      })
      let sobj ={
        isblock :isblock,
        isArchived : isArchive,
        products:products
      }
      const totalLength =isblock.length + isArchive.length + products.length
      this.handleIssueDot()
     
      submitSets(submitCollection.bulkProductUpdate, sobj, true, null, true).then(res => {
        this.setState({
          isloaded : false
        })
        if(res && res.status){
          this.setState({
            isblock:[],
            isArchive:[],
            products:[],
            data:[],
            isduplicate:false,
            haveIssue:false,
            
          })
          if(100 <= totalLength){
            this.props.openSuccessModelCloseExcelImpot(false,null);
           
          }else{
            this.props.openSuccessModelCloseExcelImpot(true,res.extra.logId);
          }
          this.setState({
            isloaded:false,
            optionType : ExcelImportType.IsBlock,
          })
        } else{
          // alertService.error(res.extra?res.extra:this.props.t("erroroccurred"))
        }
      });
    }else{
      this.handleIssueDot()
      alertService.error(this.props.t('No_Data_Available'));
    }
   
  }

  handleModelClose=()=>{
    this.props.onHide()
    this.setState({
      optionType : ExcelImportType.IsBlock,
      data:[],
      isblock:[],
      isArchive:[],
      products:[],
      isduplicate: false,
      haveIssue : false
    })
  }
  handleLoading = ()=>{
    this.setState({
      isloaded: !this.state.isloaded
    })
  }
  handleIssueDot = ()=>{
      if(this.state.optionType === ExcelImportType.IsBlock){
        let products = this.state.isblock;
        let isduplicateCount = products.filter((d)=>{return d.isduplicate === true});
        if(isduplicateCount.length > 0){
          this.setState({
            isduplicate : true
          })
        }else{
          this.setState({
            isduplicate : false
          })
        }
        let ishaveIssue = products.filter((d)=>{return d.isHaveIsse === true});
        if(ishaveIssue.length > 0){
          this.setState({
            haveIssue : true
          })
        }else{
          this.setState({
            haveIssue : false
          })
        }
       
      }else if(this.state.optionType === ExcelImportType.IsArchive){
        let products = this.state.isArchive;
        let isduplicateCount = products.filter((d)=>{return d.isduplicate === true});
        if(isduplicateCount.length > 0){
          this.setState({
            isduplicate : true
          })
        }else{
          this.setState({
            isduplicate : false
          })
        }
        let ishaveIssue = products.filter((d)=>{return d.isHaveIsse === true});
        if(ishaveIssue.length > 0){
          this.setState({
            haveIssue : true
          })
        }else{
          this.setState({
            haveIssue : false
          })
        }
      }else if(this.state.optionType === ExcelImportType.ProductUpdate){
        let products = this.state.products;
        let isduplicateCount = products.filter((d)=>{return d.isduplicate === true});
        if(isduplicateCount.length > 0){
          this.setState({
            isduplicate : true
          })
        }else{
          this.setState({
            isduplicate : false
          })
        }
        let ishaveIssue = products.filter((d)=>{return d.isHaveIsse === true});
        if(ishaveIssue.length > 0){
          this.setState({
            haveIssue : true
          })
        }else{
          this.setState({
            haveIssue : false
          })
        }
      }
  }

  render() {
    return (
      <>
        <Modal className={'excelImportBulkUpdateModel '+(this.props.isRTL==="rtl"?"RTL":"")}  show={this.props.showmodal} onHide={this.handleModelClose} backdrop="static" dir={this.props.isRTL}  size={this.state.optionType=== ExcelImportType.ProductUpdate ?"lg":null}>
          <Modal.Header className="modalheader"  closeButton>
            <div className='content'>
              <Modal.Title>{this.props.t('UPLOAD_PRODUCT_ACTION')}</Modal.Title>
              <span>{this.props.t('Select_import_Product_excel_files')}</span>
            </div>
          </Modal.Header>
          <Modal.Body>
              <UploadInput handleLoading={this.handleLoading}  changeType={this.changeType}  setDefalut={this.setDefalutValues} option ={this.state.optionType} t={this.props.t} setData={this.setData} data={this.state.data}  isArchive={this.state.isArchive} isBlock={this.state.isblock} products={this.state.products}/>
              <Col className='excelProducts'>
                  <div className='header'>
                    <span>{this.props.t('Excel_product_list')}</span>
                    <div className='d-flex'>
                      <div className='details d-flex'>
                        {
                          this.state.haveIssue ?
                          <OverlayTrigger placement={"bottom"} overlay={<Tooltip id={`tooltip-bottom`}>{this.props.t('column_have_issue')}</Tooltip> }>
                          <span className='issue'><SquareFillIcon size={20}/></span>
                       </OverlayTrigger> :<></>
                        }
                        {
                          this.state.isduplicate ? 
                          <OverlayTrigger placement={"bottom"} overlay={<Tooltip id={`tooltip-bottom`}>{this.props.t('duplicate_barcode')}</Tooltip> }>
                            <span className='duplicate'><SquareFillIcon size={20}/></span>
                        </OverlayTrigger>:<></>
                        }
                       
                      </div>
                      <Form.Control value={this.state.optionType} as="select" id='my-select' onChange={(e)=>{this.changeType(e.target.value)}}>
                        <option value={ExcelImportType.IsBlock}>{this.props.t('Block_Products')}</option>
                        <option value={ExcelImportType.IsArchive}>{this.props.t('Archive_Products')}</option>
                        <option value={ExcelImportType.ProductUpdate}>{this.props.t('Product_update')}</option>
                      </Form.Control>
                    </div>
                   
                  </div>
                  {
                  this.state.products.length > 0 || this.state.isblock.length > 0 || this.state.isArchive.length > 0  ? <ProductDetails products ={this.state.products} onChange={this.changeType} Remove={this.deleteProduct} t={this.props.t}  type={this.state.optionType} isArchive={this.state.isArchive} isblock={this.state.isblock} /> :
                    <div className='content'>
                      <span className='info-1'>{this.props.t('Previews_selected_file_barcodes')}</span>
                      <span className='info-2'> {this.props.t('No_file_selected_yet')}</span>
                    </div>
                  }
              </Col>
          </Modal.Body>
          <Modal.Footer>
            <Button variant="success" className='closebtn' onClick={this.handleModelClose}>{this.props.t('btnnames.close')}</Button>
            <Button variant="success"  className='updatebtn' onClick={this.handleUpdate} >{this.props.t('btnnames.update')}</Button>
          </Modal.Footer>
      </Modal>
      <AcViewModal showmodal={this.state.isloaded} />
      </>
   
    )
  }
}

export default ExcelImportModel