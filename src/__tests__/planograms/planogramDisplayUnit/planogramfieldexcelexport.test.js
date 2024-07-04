import { shallow, mount } from 'enzyme';
import * as FileSaver from 'file-saver';

import ExportCSV from '../../../components/planograms/planDisplayUnit/excelExport';

jest.mock('file-saver');

let defprodlist = [
    { productInfo: { barcode: "7290013847386", brandName: "סטארקיסט", productName: "140 גרם טונה 4% טבעי לייט" } },
    { productInfo: { barcode: "7290108354911", brandName: "קרמה מן", productName: "3 שמפו וג'ל רחצה וגילוחIN1 ק.מן" } },
];

let props = {
    exportData: defprodlist,
    fileName: "testproductexportlist",
    t: jest.fn(),
};

describe("planogram field export product list data loads without errors", () => {
    const wrapper = shallow(<ExportCSV {...props} />);
    
    it("planogram field export product list export works without errors", () => {
        jest.spyOn(FileSaver,"saveAs");
        wrapper.find("Button").simulate("click");
        
        //expect(FileSaver.saveAs).toBeCalled();
    });

});