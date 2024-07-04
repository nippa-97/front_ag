import { Button , Modal} from 'react-bootstrap'
import "./successModel.css"
import img from "../../../../assets/img/uploadsuccess_modal.png"
import img1 from "../../../../assets/img/timetake_modal_img_removebg.png"

const SuccessModel = (props) => {
  return (
  <Modal className={'excelImportBulkUpdateModel '+(props.isRTL==="rtl"?"RTL":"")}  show={props.showmodal} onHide={props.onHide} backdrop="static" dir={props.isRTL}>
    <Modal.Header className="modalheader"  closeButton>
        <Modal.Title></Modal.Title>
    </Modal.Header>
    <Modal.Body>
        <div className='successModelbody'>
            <span className='text-center'>{props.type === true ? props.t('Successfully_products_updated') :props.t('TakeTime')}</span>
            {props.type === true ? <img src={img} width={350}  height={250} alt='success'/> : <img src={img1} width={350}  height={250} alt='success'/>} 
        </div>
    </Modal.Body>
    <Modal.Footer className='d-flex justify-content-center pb-5'>
      <Button variant="success" className='closebtn' onClick={props.onHide}>{props.t('btnnames.close')}</Button>
    </Modal.Footer>
</Modal>

  )
}

export default SuccessModel