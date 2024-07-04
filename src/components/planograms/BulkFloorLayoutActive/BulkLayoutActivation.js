import { Modal,Button ,Form} from 'react-bootstrap'
import "./bulkLayoutActivation.css"
import FeatherIcon from 'feather-icons-react';
import { useEffect, useState } from 'react';
import { submitSets } from '../../UiComponents/SubmitSets';
import { submitCollection } from '../../../_services/submit.service';
import { alertService } from '../../../_services/alert.service';
import { maxInputLength, preventinputToString } from '../../../_services/common.service';

const BulkLayoutActivation = (props) => {

  const [layoutDetails, setlayoutDetails] = useState([]);
  const [checkedItems, setCheckedItems] = useState([]);
  const [selectALl, setselectALl] = useState(false);
  const [searchText, setsearchText] = useState("");
  const [filterData, setfilterData] = useState([])
  
  useEffect(()=>{
   setlayoutDetails(props.data);
   setfilterData(props.data);
  },[props.data])

  const handleAllSelect = (event) =>{
    const {checked } = event.target;
    if (checked) {
      let data = layoutDetails.map((d)=>{ return parseInt(d.id)})
      setCheckedItems(data);
      setselectALl(true)
    } else {
      setCheckedItems([]);
      setselectALl(false)
    }
  }

  const handleChange = event => {
    const { value, checked } = event.target;
    if (checked) {
      setCheckedItems([...checkedItems, parseInt(value)]);
    } else {
      setCheckedItems(checkedItems.filter(item => item !== parseInt(value)));
    }
  };

  const handleSubmit = ( )=>{
    if(checkedItems.length > 0){
      let tempsobj = [];
      for (const data of checkedItems) {
        tempsobj.push({floorLayoutId:data});
      }

      let sobj ={
        floorLayout:tempsobj
      }
      props.OpenLoading()
      submitSets(submitCollection.bulkPlanogramLayoutActivate,sobj, true, null, true).then(res => {
        if(res && res.status === true){
          props.closeUpdateModelOpenSuccessModel();
        }else{
            props.closeloading()
          // alertService.error((res&&res.extra?res.extra:props.t('ERROR_OCCURRED')));
        }
        setCheckedItems([])
     })

    }else{
      alertService.error(props.t('click_at_least_one_store'));
    }
  }

  const searchStore = (e)=>{
    setsearchText(e.target.value);
  }

  useEffect(()=>{
    let fData = [];
    if(searchText !== ""){
      for (let i = 0; i < layoutDetails.length; i++) {
          let name = layoutDetails[i].storeName.toLowerCase();
          let text = searchText.toLowerCase()
          if(name.includes(text)){
            fData.push(layoutDetails[i]);
          }
      }
    } else{
      fData = layoutDetails;

    }
    setfilterData(fData);
  },[searchText,layoutDetails])

  const clearSearchText = ()=>{
    setsearchText("");
  }

  const handlecloseModel = ()=>{
    props.handleClose();
    setCheckedItems([]);
    setfilterData([]);
    setlayoutDetails([]);
    setsearchText("");
    setselectALl(false)
  }

  useEffect(()=>{
    if(checkedItems.length === layoutDetails.length){
      setselectALl(true);
    }else{
      setselectALl(false);
    }
  },[checkedItems.length,layoutDetails.length])
 
  return (
 <Modal className={`BulkLayoutActivationModel `+(props.isRTL==="rtl"?"RTL":"")} show={props.confirmedListModelShow} onHide={handlecloseModel} dir={props.isRTL}>
    <Modal.Header className="modalheader" closeButton>
        <div className='content'>
            <Modal.Title>{props.t('Activate_Confirmed_Planograms')}</Modal.Title>
            <span>{props.t('Select_from_available_confirmed_stores_list_and_activate')}</span>
        </div>
    </Modal.Header>
    <Modal.Body >
      <div className='BulkLayoutActivationModel-contents'>
         <div className='BulkLayoutActivationModel-header'>
            <div className='search-main-div'>
                <Form.Control maxLength={maxInputLength} type="text"  className='searchbox' size="sm" value={searchText} onChange={searchStore}  placeholder={props.t('Search_stores')} onKeyDown={(e)=>preventinputToString(e,e.target.value,(props.t('Character.search_text')))} />
                {searchText && <span onClick={clearSearchText}><FeatherIcon  icon="x" size={18} /></span> } 
            </div>
            {filterData.length > 0 && <Form.Check   name="select-all"  checked={selectALl}  onChange={handleAllSelect}  type="checkbox"   label={props.t('multiselect.all')} /> }  
         </div>
         <div className='BulkLayoutActivationModel-content'>
          {
           filterData.length > 0 ? filterData.map((item,index)=>{
              return(
                <div className='layoutDetails' key={index}>
                  <Form.Check name="layouts" value={item.id}  checked={checkedItems.includes(item.id)}  onChange={handleChange}  type="checkbox"/>
                  <span >{item.storeName}</span>
                  <span>{item.mainVersion}</span>
                  <div className='deleteIcon' onClick={()=>props.view(item,false)} style={{"cursor":"pointer"}}><FeatherIcon icon="log-out" size={22}  color={props.dmode?"#AFAFAF":"#5128a0"} /></div>
               </div>
              )
            }) :
            <div className='layoutDetails d-flex justify-content-center'>
                  <span>{props.t('No_Data_Available')}</span>  
            </div>
          }
         </div>
      </div>
    </Modal.Body>
    <Modal.Footer>
        <Button variant="success" className='closebtn' onClick={handlecloseModel} >{props.t('btnnames.close')}</Button>
        <Button variant="success"  className='updatebtn' onClick={handleSubmit}>{props.t('btnnames.activate')}</Button>
    </Modal.Footer>
  </Modal>
  )
}

export default BulkLayoutActivation