import React, { useEffect, useState } from 'react'
import "./ossem.css"
import { Button,Modal,Form ,Col} from 'react-bootstrap'
import FeatherIcon from 'feather-icons-react';


const OssemModel = (props) => {
    const [searchText, setsearchText] = useState("");
    const [Data, setData] = useState([]);
    const [filterData, setFilterData] = useState([]);


    useEffect(()=>{
        setFilterData(props.data);
       setData(props.data);
    },[props.data])

    useEffect(()=>{
        let fData = [];
        if(searchText !== ""){
            for (let i = 0; i < Data.length; i++) {
                let name = Data[i].brand_name.toLowerCase();
                let text = searchText.toLowerCase();
                if(name.includes(text)){
                  fData.push(Data[i]);
                }
            }
        }else{
            fData=  Data;
        }
    setFilterData(fData)
    },[searchText,Data])

    const onHide = ()=>{
        setsearchText("");
        props.onHide();
    }


  return (
    <Modal centered  className={`ossemModel `+(props.isRTL==="rtl"?"RTL":"")} show={props.show} onHide={onHide} backdrop="static" dir={props.isRTL}>
        <Modal.Header className="modalheader" closeButton>
            <div className='content'>
                <Modal.Title>{props.subObj && props.subObj.store}</Modal.Title>
                <span> {`${props.t("updated")}${props.subObj && props.subObj.update +' | @'+props.subObj.name }`}</span>
            </div>
        </Modal.Header>
        <Modal.Body>
            <div className='ossem-body-content'>
                <div className='search-box w-50'>
                    <Form.Control type="text" placeholder={props.t('Search_brands')} value={searchText} onChange={(e)=>{setsearchText(e.target.value)}} />
                    {searchText ?<span onClick={()=>setsearchText("" )}><FeatherIcon icon={`x`}  size={17} /> </span> : <FeatherIcon icon={`search`} size={17} />  }  
                </div>
                <div className='ossem-content-header'>
                    <span>{props.t('brand')} </span>
                    <span>{props.t('btnnames.change')} </span>
                </div>
                <div className='ossem-content'>
                    {
                        filterData.length > 0 ? filterData.map((item,index)=>{
                            return(
                            <div className='ossem-sub-content' key={index}>
                                <Col xs={9}><span>{item.brand_name}</span> </Col>
                                
                                <Col>
                                    <span>{item.up === true ? <FeatherIcon icon="arrow-up" color="green" size={17} />: <FeatherIcon icon="arrow-down" color="red" size={17} />}</span>
                                    <span>{item.change+'%'}</span>
                                </Col>
                            </div>
                            )
                        }) :
                        <div className='ossem-sub-content d-flex justify-content-center'>
                                <span> {props.t('posStatusList.NO_DATA')}</span>
                        </div>
                    }
                </div>
            </div>
        </Modal.Body>
        <Modal.Footer>
            <Button className='closebtn' variant="secondary" onClick={onHide}> {props.t('btnnames.close')}</Button>
        </Modal.Footer>
  </Modal>
  )
}

export default OssemModel