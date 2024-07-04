import React, { useState ,useEffect} from 'react'
import { Button, Col,Dropdown} from 'react-bootstrap';
import {  InfoIcon2 ,UploadFileIcon } from '../../../../assets/icons/icons'
import { useDropzone } from 'react-dropzone'
import * as XLSX from "xlsx"
import {alertService} from "../../../../_services/alert.service"
import { FileIcon } from '@primer/octicons-react';
import {ExcelImportType} from "../../../../enums/excelImportType"

const UploadInput = ({t,setData,isArchive,isBlock,option,products,setDefalut,changeType,handleLoading}) => {
    const [files, setFiles] = useState([]);
    const {getRootProps, getInputProps} = useDropzone({
        accept:"application/vnd.openxmlformats-officedocument.spreadsheetml.sheet, application/vnd.ms-excel, .db",
        onDrop: acceptedFiles => {
            if(acceptedFiles.length > 0){
                setFiles(acceptedFiles.map(file => Object.assign(file, {
                    preview: URL.createObjectURL(file)
                })));
            }
        },
        onDropRejected: errarr => {
            if(errarr.length > 0){
                if(errarr[0].errors[0].code === "file-invalid-type"){
                    alertService.error(t('SELECT_EXCEL_FILE'));
                }
            }
        }
    });

useEffect(() => {
    if(files.length > 0){
        handleLoading()
        setDefalut();
        const fileReader = new FileReader();
        fileReader.readAsArrayBuffer(files[0]);
        fileReader.onload = (e) => {

            let headerOrder = ["barcode", "blockUntilDate"]
            const data = new Uint8Array(e.target.result);
            const workbook = XLSX.read(data, { type: 'array' });

            if (workbook.SheetNames.length > 0) {
                const firstSheetName = workbook.SheetNames[0];
                const worksheet = workbook.Sheets[firstSheetName];
        
                let isEmpty = true;
                for (const cellAddress in worksheet) {
                  if (worksheet.hasOwnProperty(cellAddress)) {
                    const cellValue = worksheet[cellAddress].v;
                    if (cellValue !== undefined && cellValue !== null && cellValue !== '') {
                      isEmpty = false;
                      break;
                    }
                  }
                }
        
                if (isEmpty) {
                    handleLoading()
                    setFiles([])
                    alertService.error(t('NO_DATA'));
                    return
                } else {
                    const columnCount = XLSX.utils.decode_range(worksheet['!ref']).e.c + 1;
                    if(columnCount !== 10 && columnCount !== 2 && columnCount !== 1){
                        handleLoading()
                        setFiles([])
                        alertService.error(t('PLEASE_SELECT_EXCEL_CORRECT_FILE'));
                        return
                    }
                    if(columnCount === 10){
                        changeType(ExcelImportType.ProductUpdate);
                        headerOrder =["barcode","name","width","height","depth","uom","subCategory","brand","isNoos","sensitivity"]
                    }
                    if(columnCount === 2){
                        changeType(ExcelImportType.IsBlock);
                        headerOrder = ["barcode", "blockUntilDate"];
                    }
        
                    if(columnCount === 1){
                        changeType(ExcelImportType.IsArchive);
                        headerOrder = ["barcode"];
                    }
                    const excelData = XLSX.utils.sheet_to_json(worksheet, {header: headerOrder,});
                    if(excelData.length === 0){
                        handleLoading()
                        setFiles([])
                        alertService.error(t('NO_DATA'));
                        return
                    }
                    excelData.shift();
                    
                    if(excelData.length > 0){
                        if(excelData.length > 200000){
                            handleLoading()
                            setFiles([])
                            alertService.error(t('File_Size_To_Large'));
                        }else{
                            setData(excelData);
                        }
                    }else{
                        handleLoading()
                        setFiles([])
                        alertService.error(t('SELECT_EXCEL_FILE'));
                    }
                }
              } else {
                handleLoading()
                setFiles([])
                alertService.error(t('NO_DATA'));
                return
              }
        };
    }
// eslint-disable-next-line
}, [files])


function createAndDownloadXLSX() {
    // create workbook and worksheet
    const wb = XLSX.utils.book_new();
    let ws; 
    if(option === ExcelImportType.IsArchive){
     ws = XLSX.utils.json_to_sheet([
            { Barcode: '001021518522'},
            { Barcode: '001021518523'}
      ]);
    }else if(option === ExcelImportType.IsBlock){
      ws = XLSX.utils.json_to_sheet([
            { Barcode: '001021518522', BlockUntilDate:new Date('2022-06-18')},
            { Barcode: '001021518523', BlockUntilDate: new Date('2022-06-24')}
      ]);

    }else if(option === ExcelImportType.ProductUpdate){
      ws = XLSX.utils.json_to_sheet([
            { Barcode: '00121518522', name:'product 1',width:10,height:10,depth:3,uom:'cm',subCategory :"SUB CAT",brand:"BRAND 01",isNoos :true,sensitivity:12.65},
            { Barcode: '00121518523', name:'product 44',width:20,height:15,depth:5,uom:'cm',subCategory :"SUB CAT2",brand:"BRAND 05",isNoos :false,sensitivity:2.65},
      ]);
    }
 
  
    // add worksheet to workbook
    XLSX.utils.book_append_sheet(wb, ws, 'Sheet1');
  
    // create XLSX file and download it
    XLSX.writeFile(wb, 'example.xlsx');
  }

const CustomToggle = React.forwardRef(({ children, onClick }, ref) => (
    <div ref={ref} onClick={(e) => { e.preventDefault(); onClick(e); }}>
       <InfoIcon2  name="infoIcon" size={24} color={"#5128A0"}  />
    </div>
  ));

  const CustomToggle2 = React.forwardRef(({ children, onClick }, ref) => (
    <div ref={ref} onClick={(e) => { e.preventDefault(); onClick(e); }}>
       <InfoIcon2  name="infoIcon2" size={20} color={"#5128A0"}  />
    </div>
  ));

  return (<>
        <Dropdown>
            <Dropdown.Toggle as={CustomToggle} variant="success" id="dropdown-basic">
            </Dropdown.Toggle>
            <Dropdown.Menu>
                <div className='example-contents'>
                    <div className='header'>
                        <Button variant="success" onClick={createAndDownloadXLSX}><FileIcon size={16} /> {t('Template')}</Button>
                        <span className='title1'>{t('Excel_file_examples')}</span>
                        <span className='title2'>{t('Import_xlsx_files_with_these_formats')}</span>
                        {
                            option === ExcelImportType.ProductUpdate &&<>
                            <div className='d-flex gap-2'>
                                <span className='title2'>{t('uom_format_details')}</span>
                                <Dropdown className='uom-column'>
                                <Dropdown.Toggle as={CustomToggle2} variant="success" id="dropdown-basic"></Dropdown.Toggle>
                                <Dropdown.Menu>
                                <div className='body-content'>
                                    <div className='examplesheet'>
                                      <Uom t={t} />
                                    </div>
                                </div>
                                </Dropdown.Menu>
                            </Dropdown>
                            </div>
                     
                     
                    
                            </>
                        }
                        
                    </div>
                    <div className='body-content'>
                        <div className='examplesheet'>
                            {option === ExcelImportType.IsArchive && <Archive t={t} />}
                            {option === ExcelImportType.IsBlock && <IsBlock  t={t}/>}
                            {option === ExcelImportType.ProductUpdate && <Product t={t} />}
                        </div>
                    </div>
                </div>
            </Dropdown.Menu>
        </Dropdown>
        <Col {...getRootProps({className: 'dropzone'})} className='dropzone'>
                <div className='dropzone-content'>
                        <UploadFileIcon size={30} color={"#5128a0"}/>
                    {
                          products.length > 0 || isArchive.length > 0 ||  isBlock.length > 0  ?
                        <React.Fragment>
                               <span style={{fontWeight:"700"}}>{files[0].name}</span>
                               <span>{t('FILE_SELECTED')}</span>

                        </React.Fragment> :
                        <React.Fragment>
                            <span>{t('Click_and_select_excel_file')}</span>
                            <span>{t('OR')}</span>
                            <span>{t('Drag_and_drop_excel_file_here')}</span>
                        </React.Fragment>
                    }
                </div>
               <input {...getInputProps()} />
        </Col>
        </>
  )
}

export default UploadInput

const Archive = ({t}) => {
  return (
   <>
    <div className='data sheetheader' style={{textAlign:"left"}}>
        <span style={{color:"gray",fontWeight:"700"}}>{t('barcode')}</span>
    </div>
    <div className='data'  style={{textAlign:"left"}}>
        <span>001021518522</span>
    </div>
    <div className='data'  style={{textAlign:"left"}}>
        <span>000015245658</span>
    </div>
   </>
  )
}

const IsBlock = ({t}) => {
    return (
     <>
      <div className='data sheetheader'>
          <span style={{color:"gray",fontWeight:"700"}}>{t('barcode')}</span>
          <span style={{color:"gray",fontWeight:"700"}}>{t('BLOCK_UNTIL_DATE')}</span>
      </div>
      <div className='data'>
          <span>001021518522</span>
          <span>06/24/2022</span>
      </div>
      <div className='data'>
          <span>001021518523</span>
          <span>06/24/2022</span>
      </div>
     </>
    )
  }
const Product = ({t}) => {
  return (
   <>
    <div className='data sheetheader'>
        <span style={{color:"gray",fontWeight:"700"}}>{t('barcode')}</span>
        <span style={{color:"gray",fontWeight:"700"}}>{t('PRODUCT_NAME')}</span>
        <span style={{color:"gray",fontWeight:"700"}}>{t('width')}</span>
        <span style={{color:"gray",fontWeight:"700"}}>{t('height')}</span>
        <span style={{color:"gray",fontWeight:"700"}}>{t('depth')}</span>
        <span style={{color:"gray",fontWeight:"700"}}>{t('uom')}</span>
        <span style={{color:"gray",fontWeight:"700"}}>{t('subCategory')}</span>
        <span style={{color:"gray",fontWeight:"700"}}>{t('brandname')}</span>
        <span style={{color:"gray",fontWeight:"700"}}>{t('isnoos')}</span>
        <span style={{color:"gray",fontWeight:"700"}}>{t('STORE_PRODUCTS')}</span>
    </div>
    <div className='data'>
        <span>010218522</span>
        <span>product 1</span>
        <span>10</span>
        <span>10</span>
        <span>5</span>
        <span>cm</span>
        <span>SCategory 1</span>
        <span>BRAND 01</span>
        <span>true</span>
        <span>1.5</span>
    </div>
    <div className='data'>
    <span>010218523</span>
        <span>product 44</span>
        <span>30</span>
        <span>15</span>
        <span>7</span>
        <span>cm</span>
        <span>SCategory 4</span>
        <span>BRAND 05</span>
        <span>true</span>
        <span>12.65</span>
    </div>
   </>
  )
}

  
const Uom = ({t}) => {
    return (
     <>
      <div className='data sheetheader'>
          <span style={{color:"gray",fontWeight:"700"}}>{t('original_value')}</span>
          <span style={{color:"gray",fontWeight:"700"}}>{t('expected_value')}</span>
      </div>
      <div className='data'>
          <span>Centimeters</span>
          <span>cm</span>
      </div>
      <div className='data'>
          <span>inches</span>
          <span>inches</span>
      </div>
      <div className='data'>
          <span>meters</span>
          <span>M</span>
      </div>
      <div className='data'>
          <span>feet</span>
          <span>feet</span>
      </div>
     </>
    )
  }