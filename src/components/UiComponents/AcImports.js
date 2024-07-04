import { AcInputComponent, AcButtonComponent, AcTableComponent, AcDropzoneComponent, AcLoadingModalComponent, AcConfirmView, AcLightBoxComp, AcNoDataComponent } from './AcComps';

/* AcImport is using AcComps export components with ts options for suggestion purposes */

//validating types list
const ValT = {
    empty: "EMPTY",
    email: "EMAIL",
    password: "PASS",
    date: "DATE",
    number: "Number",
    telephone: "TELEPHONE",
    enum: "ENUM"
}

/**
 * common input for all form inputs with auto validation
 *
 * @param {{
    aobj: Object,
    aid: Number,
    eleid: String,
    adefval: String,
    atype: String,
    aclass: String,
    adata: Array,
    avset: Object,
    avalidate: String,
    achange: Function,
    akeyenter: Function,
    disabled: Boolean,
    autofocus: Boolean,
    autocomp: String,
    arows: String,
    aplace: String,
    showlabel:Boolean,
    arequired:Boolean,
}} props
 * @return {*} 
 */
function AcInput(props) {
    return <AcInputComponent {...props} />;
}

/**
 * common button action with validation and backend call handle
 *
 * @param {{
    eleid: String,
    asubmit: Object,
    aobj: Object,
    avalidate: Object,
    avariant: String,
    disabled: Boolean,
    atitle: String,
    aclass: String,
    aresp: Function,
    aconfirm: Boolean,
    aloading: Function,
}} props
 * @return {*} 
 */
function AcButton (props) {
    return <AcButtonComponent {...props} />;
}

/**
 * common table with auto pagination and filters
 *
 * @param {{
    aheaders: Array,
    asearchobj: Object,
    abody: Object,
    showpaginate: Boolean,
    pagecount: Number,
    pagetype: String,
    showresults: Boolean,
    showfilters: Boolean,
    totalresults: Number,
    startpage: Number,
    alldata: Array,
    showexport: String,
    handleRowClick: Function,
    handlePageChange: Function,
    isRTL: String,
    t: Function,
}} props
 * @return {*} 
 */
function AcTable(props) {
    return <AcTableComponent {...props} />;
}

/**
 * common custom table with auto pagination and filters
 *
 * @param {{
    aheaders: Array,
    asearchobj: Object,
    abody: Object,
    showpaginate: Boolean,
    pagecount: Number,
    pagetype: String,
    showresults: Boolean,
    showfilters: Boolean,
    totalresults: Number,
    startpage: Number,
    alldata: Array,
    showexport: String,
    handleRowClick: Function,
    handlePageChange: Function,
    isRTL: String,
    t: Function,
}} props
 * @return {*} 
 */
function AcTableCustom (props) {
    return <AcTableCustom {...props} />;
}

/**
 * common drag and drop file upload
 *
 * @param {{
    updatedImage: Object,
    acceptTypes: String,
    handleDropImage: Function,
    showPreviews: Boolean,
    multiple: Boolean,
}} props
 * @return {*} 
 */
function AcDropzone(props) {
    return <AcDropzoneComponent {...props} />;
}

/**
 * common modal for all the loadings in app
 *
 * @param {{
    showmodal: Boolean,
    message: String,
}} props
 * @return {*} 
 */
function AcViewModal (props) {
    return <AcLoadingModalComponent {...props} />;
}

/**
 *
 *
 * @param {{
    icondetails: String,
    titledetails: String,
    buttons: Array
}} props
 * @return {*} 
 */
function AcConfirm(props) {
    return <AcConfirmView {...props} />;
}
/**
 *
 *
 * @param {{
    title: String,
    startindex: Number,
    showcount: Boolean,
    datalist: Array,
    allowZoom: Boolean,
    allowRotate: Boolean,
    allowReset: Boolean,
    onClose: Function,
}} props
 * @return {*} 
 */
function AcLightBox(props){
    return <AcLightBoxComp {...props} />
}

/**
 *
 *
 * @param {{
    className: String,
    customComponent: any
}} props
 * @return {*} 
 */
function AcNoDataView(props) {
    return <AcNoDataComponent {...props} />;
}

export { AcInput, AcButton, AcTable, AcTableCustom, AcDropzone,AcViewModal, AcConfirm, AcNoDataView, AcLightBox, ValT};
