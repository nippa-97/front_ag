import { useState } from 'react';
import { XIcon ,ChevronLeftIcon ,ChevronRightIcon} from '@primer/octicons-react';
import { ExcelImportType } from '../../../../enums/excelImportType'
import { useEffect } from 'react';
import{OverlayTrigger,Tooltip,Pagination} from "react-bootstrap"

const ProductDetails = ({products,type,isArchive,isblock,t,Remove}) => {

  const [currentPage, setCurrentPage] = useState(0);

  const itemsPerPage = 20; 


  let data;
  if(type === ExcelImportType.IsArchive){
    data = isArchive
  }else if(type === ExcelImportType.IsBlock){
    data = isblock
  }else if(type === ExcelImportType.ProductUpdate){
    data = products
  }
  const displayData = data.slice(
    currentPage * itemsPerPage,
    (currentPage + 1) * itemsPerPage
  );

  useEffect(()=>{
    setCurrentPage(0)
  },[type])

  const totalPages = Math.ceil(data.length / itemsPerPage);
  // const totalItems = data.length;

  const previousPage = () => {
    if (currentPage > 0) {
      setCurrentPage(currentPage - 1);
    }
  };

  const nextPage = () => {
    if ((currentPage + 1) * itemsPerPage < data.length) {
      setCurrentPage(currentPage + 1);
    }

  };

   function dateCheck(d1,d2){
    let date1 = new Date(new Date(d1).toISOString().split('T')[0]);
    let date2 =new Date (new Date( d2).toISOString().split('T')[0]);
    if(date1 >= date2) {
      return true;
    }else{
      return false;
    }
  }

   function tomorrowDate() {
    const today = new Date(); 
    const tomorrow = new Date(today); 
    tomorrow.setDate(today.getDate() + 1); 
    return tomorrow
  }
  
  const firstPage = () => {
   setCurrentPage(0)
  };
  const lastePage = () => {
    setCurrentPage(totalPages-1)
   };
  
  return (
    <>
    <div className='product-details'>
        <div className='product-details-header'>
          {
             type === ExcelImportType.ProductUpdate ?<>
              <span style={{width:"200px"}} >{t('barcode')}</span>
              <span style={{width:"200px"}} >{t('Name')}</span>
              <span style={{width:"100px"}}>{t('width')}</span>
              <span style={{width:"100px"}}>{t('height')}</span>
              <span style={{width:"100px"}}>{t('depth')}</span>
              <span style={{width:"100px"}}>{t('uom')}</span>
              <span style={{width:"200px"}}>{t('subcategory')}</span>
              <span style={{width:"200px"}}>{t('brandname')}</span>
              <span style={{width:"200px"}}>{t('isnoos')}</span>
              <span style={{width:"200px"}}>{t('STORE_PRODUCTS')}</span>
             </>:<span className='th1 w-50'>{t('barcode')}</span>
          }
          {type === ExcelImportType.IsBlock && <span className='th2 w-50'>{t('BLOCK_UNTIL_DATE')}</span>}  
        </div>
        <div className='product-details-data d-flex gap-1'>
            {
                displayData.length > 0? displayData.map((data,index)=>{
                  console.log(data)
                return(
                  <div className='product-content' key={index}>
                    {
                      type === ExcelImportType.ProductUpdate ?<>
                      {data.barcode && data.barcode !== "undefined" ? <OverlayTrigger placement={"bottom"} overlay={<Tooltip id={`tooltip-bottom`}>{data.barcode}</Tooltip> }>
                            <span className={`label-1 ${data.isduplicate === true? "text-warning ":""}`}>{data.barcode}</span>
                        </OverlayTrigger>:
                        <OverlayTrigger placement={"bottom"} overlay={<Tooltip id={`tooltip-bottom`}>{t('No_Barcode')}</Tooltip> }>
                          <span className='label-1 text-danger' >{t('No_Barcode')} </span>
                        </OverlayTrigger>
                    }
                      {
                        data.name ? <OverlayTrigger placement={"bottom"} overlay={<Tooltip id={`tooltip-bottom`}>{data.name}</Tooltip> }>
                        <span className='label-1'>{data.name}</span>
                      </OverlayTrigger>:<span className='label-1'>{data.name}</span>
                      }  
                          <span className='label-2'>{data.width}</span>
                          <span className='label-2'>{data.height}</span>
                          <span className='label-2'>{data.depth}</span>
                      {
                        data.uom ?
                        <OverlayTrigger placement={"bottom"} overlay={<Tooltip id={`tooltip-bottom`}>{data.uom}</Tooltip> }>
                        <span className={'label-2 '+(data.uom === "Invalid uom" && "text-danger")}>{data.uom}</span>
                      </OverlayTrigger>: <span className={'label-2 '+(data.uom === "Invalid uom" && "text-danger")}>{data.uom}</span>
                      }
                      {
                        data.subCategory ?
                        <OverlayTrigger placement={"bottom"} overlay={<Tooltip id={`tooltip-bottom`}>{data.subCategory}</Tooltip> }>
                          <span className='label-1'>{data.subCategory}</span>
                        </OverlayTrigger>: <span className='label-1'>{data.subCategory}</span>
                      }
                      {
                        data.brand ?
                        <OverlayTrigger placement={"bottom"} overlay={<Tooltip id={`tooltip-bottom`}>{data.brand}</Tooltip> }>
                        <span className='label-1'> {(String(data.brand).length > 6?(String(data.brand).substring(0,6)+"..."):data.brand)}</span>
                       </OverlayTrigger> :  <span className='label-1'> {(String(data.brand).length > 6?(String(data.brand).substring(0,6)+"..."):data.brand)}</span>
                      }
                      {
                        data.isNoos?
                        <OverlayTrigger placement={"bottom"} overlay={<Tooltip id={`tooltip-bottom`}>{data.isNoos}</Tooltip> }>
                          <span className={'label-1 '+(data.isNoos === "Invalid value" && "text-danger")}>{data.isNoos}</span>
                       </OverlayTrigger>:  <span className={'label-1 '+(data.isNoos === "Invalid value" && "text-danger")}>{data.isNoos}</span>
                      }
                      <span className='label-1'>{data.sensitivity}</span>

                      </>:
                       <OverlayTrigger placement={"bottom"} overlay={<Tooltip id={`tooltip-bottom`}>{data.barcode?data.barcode:t('No_Barcode')}</Tooltip> }>
                          <span className={`barcode label-1 w-50 ${data.barcode?(data.isduplicate === true? "text-warning ":""):"text-danger "}` } >{data.barcode?data.barcode:t('No_Barcode')}</span>
                        </OverlayTrigger>
                    }
                    {type === ExcelImportType.IsBlock &&<span className={`date ${data.untildate === "Invalid date" ? 'text-danger':dateCheck(data.untildate,tomorrowDate()) === false ? 'text-danger' : 'text-success'} `}>{data.untildate}</span> }
                    <span className='icon' onClick={()=>Remove(index)}><XIcon size={22} /></span>
                  </div>
                )
              }):
              <div className='d-flex justify-content-center emptydiv'>
                <span> {t('No_Data_Available')}</span>
              </div>
            }
        </div>
    </div>
    {
      data.length > 20  &&   
    <div className='bottom-part'>
      <Pagination >
            <Pagination.Item onClick={firstPage} disabled={(currentPage === 0?true:false)}><ChevronLeftIcon/><ChevronLeftIcon/></Pagination.Item>
            <Pagination.Item onClick={previousPage} disabled={(currentPage < 1?true:false)}><ChevronLeftIcon/></Pagination.Item>
              <label>{currentPage + 1} / {totalPages}</label>
            <Pagination.Item  onClick={nextPage} disabled={(currentPage === totalPages -1?true:false)} ><ChevronRightIcon/></Pagination.Item>
            <Pagination.Item onClick={lastePage} disabled={(currentPage === totalPages -1?true:false)}><ChevronRightIcon/><ChevronRightIcon/></Pagination.Item>
      </Pagination>
    </div>

    }
  
   </>
  )
}

export default ProductDetails



