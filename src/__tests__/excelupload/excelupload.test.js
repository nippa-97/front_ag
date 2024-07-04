import { shallow, mount } from 'enzyme';
import { ExcelUploadComponent } from '../../components/masterdata/excelupload/excelupload';
import { MemoryRouter } from 'react-router-dom';

import { submitSets } from '../../components/UiComponents/SubmitSets';
import { alertService } from '../../_services/alert.service';

let props = {
    t: jest.fn(),
};

jest.mock('../../components/UiComponents/SubmitSets');

it("excel upload renders without crashing", () => {
    shallow(<ExcelUploadComponent {...props} />);
});

describe("file loads without errors", () => {
    const wrapper = mount(<MemoryRouter><ExcelUploadComponent {...props} /></MemoryRouter>);
    const subwrapper = wrapper.find(ExcelUploadComponent);

    it("shows mock file in uploading file list", () => {
        const component = subwrapper.instance();
        const blob = new Blob(['foo'], {type : '', name: 'sample test file 1' });
        component.handleDropImages([ blob ]);
        wrapper.update();

        expect(wrapper.find(".excelpreview-main .list-inline-item").length).toBe(1);
    });

    it("remove mock file from uploading file list", () => {
        wrapper.find(".excelpreview-main .list-inline-item").at(0).find("span").simulate("click");
        wrapper.update();

        expect(wrapper.find(".excelpreview-main .list-inline-item").length).toBe(0);
    });

    it("add sample file to list handle failed", () => {
        const blob = new Blob(['foo'], {type : '', name: 'sample test file 1' });
        subwrapper.instance().handleDropImages([ blob ]);
        
        expect(subwrapper.state().uploadFileList.length).toBe(1);
    });

    it("save sample upload file list handle failed", () => {
        jest.spyOn(alertService, 'error');

        /* const blob = new Blob(['foo'], {type : '', name: 'sample test file 1' });
        subwrapper.setState({ uploadFileList: [ blob ] });
        wrapper.update(); */

        submitSets.mockReturnValueOnce(Promise.resolve({ status: false, extra: "error" }));
        subwrapper.instance().handleUploadExcel();

        //expect(alertService.error).toBeCalled();
    });

    it("save sample upload file list handle failed", () => {
        jest.spyOn(alertService, 'success');

        submitSets.mockReturnValueOnce(Promise.resolve({ status: true, extra: null }));
        subwrapper.instance().handleUploadExcel();
        
        //expect(alertService.success).toBeCalled();
    });

});

//check component snapshot without errors
/* it("excel upload snapshot renders without crashing", () => {
    const wrapper = mount(<MemoryRouter><ExcelUploadComponent {...props} /></MemoryRouter>);
    expect(wrapper).toMatchSnapshot();
}); */