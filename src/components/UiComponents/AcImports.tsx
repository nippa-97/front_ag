import { AcInputComponent, AcButtonComponent, AcTableComponent, AcDropzoneComponent, AcLoadingModalComponent, AcNoDataComponent, AcConfirmView } from './AcComps';

/* AcImport is using AcComps export components with ts options for suggestion purposes */

//validating types list
const ValT = {
    empty: "EMPTY",
    email: "EMAIL",
    password: "PASS",
    date: "DATE",
    number: "NUMBER",
    telephone: "TELEPHONE",
    enum: "ENUM"
}

interface AcInputProps {
    aobj: object;
    aid: number;
    eleid: string;
    adefval: any;
    atype: string;
    aclass: string;
    adata: Array<any>;
    avset: object;
    avalidate: string;
    achange: Function;
    akeyenter: Function;
    disabled: boolean;
    autofocus: boolean;
    autocomp: string;
    arows: string;
    aplace: string;
    showlabel:boolean;
    arequired:boolean;
}
const AcInput = (props:AcInputProps) => {
    return <AcInputComponent {...props} />;
}

interface AcButtonProps {
    eleid: string;
    asubmit: object;
    aobj: object;
    avalidate: object;
    avariant: string;
    disabled: boolean;
    atitle: string;
    aclass: string;
    aresp: Function;
    aconfirm: boolean;
    confirmtitle: string;
    confirmmsg: string;
    aloading: Function;
}

const AcButton = (props:AcButtonProps) => {
    return <AcButtonComponent {...props} />;
}

interface AcTableProps {
    aheaders: Array<any>;
    asearchobj: object;
    abody: object;
    showpaginate: boolean;
    pagecount: number;
    pagetype: string;
    showresults: boolean;
    showfilters: boolean;
    totalresults: number;
    startpage: number;
    alldata: Array<any>;
    showexport: string;
    handleRowClick: Function;
    handlePageChange: Function;
    isRTL: string,
    t: Function,
}

const AcTable = (props:AcTableProps) => {
    return <AcTableComponent {...props} />;
}

const AcTableCustom = (props:AcTableProps) => {
    return <AcTableCustom {...props} />;
}

interface AcDzoneProps {
    updatedImage: object;
    acceptTypes: string;
    handleDropImage: Function;
    showPreviews: boolean;
    multiple: boolean;
}

const AcDropzone = (props:AcDzoneProps) => {
    return <AcDropzoneComponent {...props} />;
}
interface AcViewModalProps {
    showmodal: boolean;
    message: string;
}
const AcViewModal = (props:AcViewModalProps) => {
    return <AcLoadingModalComponent {...props} />;
}

interface AcNoDataViewProps {
    className: string;
    customComponent: any;
}
const AcNoDataView = (props:AcNoDataViewProps) => {
    return <AcNoDataComponent {...props} />;
}

interface AcConfirmProps {
    icondetails: any;
    titledetails: any;
    buttons: Array<any>;
}
const AcConfirm = (props:AcConfirmProps) => {
    return <AcConfirmView {...props} />
}

export { AcInput, AcButton, AcTable, AcTableCustom, AcDropzone, AcViewModal, AcNoDataView, AcConfirm, ValT};
