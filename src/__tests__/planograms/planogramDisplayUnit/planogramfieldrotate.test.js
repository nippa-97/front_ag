import { shallow, mount } from 'enzyme';

import ProductRotate from '../../../components/planograms/planDisplayUnit/productRotate';

let defprodobj = {
    "productImage": [],
    "id": 1271,
    "width": 10,
    "height": 19.5,
    "uom": "cm",
    "depth": 5,
    "barcode": "7290108354911",
    "productSource": "gs1",
    "gs1Code": "7290108354911",
    "posMappingId": null,
    "lastPriceOfProduct": null,
    "productName": "3 שמפו וג'ל רחצה וגילוחIN1 ק.מן",
    "brandName": "קרמה מן",
    "imageId": 8620,
    "imageUrl": ""
}

let props = {
    t: jest.fn(),
    history: { listen: jest.fn(), push: jest.fn() },
    selectedrotateprod: defprodobj,
    showrotateprod: true,
    isRTL: "rtl",
    isshowrotateedit: true,
    viewrotateprod: jest.fn(),
    updaterotateprod: jest.fn(),
};

it("planogram field product rotate renders without crashing", () => {
    shallow(<ProductRotate {...props} />);
});

describe("planogram field product rotate data loads without errors", () => {
    const wrapper = mount(<ProductRotate {...props} />);
    
    it("planogram field product rotate table data renders", () => {
        expect(wrapper.find(".rotateprod-modal #rotatetxt_width").text()).toBe("10cm");
        expect(wrapper.find(".rotateprod-modal #rotatetxt_height").text()).toBe("19.5cm");
        expect(wrapper.find(".rotateprod-modal #rotatetxt_depth").text()).toBe("5cm");
    });

    it("planogram field product rotate front rotate works without errors", () => {
        wrapper.find(".rotateprod-modal Button#rotateimg_frontr").simulate("click");

        expect(wrapper.find(".rotateprod-modal #rotatetxt_width").text()).toBe("19.5cm");
        expect(wrapper.find(".rotateprod-modal #rotatetxt_height").text()).toBe("10cm");
        expect(wrapper.find(".rotateprod-modal #rotatetxt_depth").text()).toBe("5cm");
    });

    it("planogram field product rotate side works without errors", () => {
        wrapper.find(".rotateprod-modal Button#rotateimg_side").simulate("click");

        expect(wrapper.find(".rotateprod-modal #rotatetxt_width").text()).toBe("5cm");
        expect(wrapper.find(".rotateprod-modal #rotatetxt_height").text()).toBe("19.5cm");
        expect(wrapper.find(".rotateprod-modal #rotatetxt_depth").text()).toBe("10cm");
    });

    it("planogram field product rotate side rotate works without errors", () => {
        wrapper.find(".rotateprod-modal Button#rotateimg_sider").simulate("click");

        expect(wrapper.find(".rotateprod-modal #rotatetxt_width").text()).toBe("19.5cm");
        expect(wrapper.find(".rotateprod-modal #rotatetxt_height").text()).toBe("5cm");
        expect(wrapper.find(".rotateprod-modal #rotatetxt_depth").text()).toBe("10cm");
    });

    it("planogram field product rotate top works without errors", () => {
        wrapper.find(".rotateprod-modal Button#rotateimg_top").simulate("click");

        expect(wrapper.find(".rotateprod-modal #rotatetxt_width").text()).toBe("5cm");
        expect(wrapper.find(".rotateprod-modal #rotatetxt_height").text()).toBe("10cm");
        expect(wrapper.find(".rotateprod-modal #rotatetxt_depth").text()).toBe("19.5cm");
    });

    it("planogram field product rotate top rotate works without errors", () => {
        wrapper.find(".rotateprod-modal Button#rotateimg_topr").simulate("click");

        expect(wrapper.find(".rotateprod-modal #rotatetxt_width").text()).toBe("10cm");
        expect(wrapper.find(".rotateprod-modal #rotatetxt_height").text()).toBe("5cm");
        expect(wrapper.find(".rotateprod-modal #rotatetxt_depth").text()).toBe("19.5cm");
    });

    it("planogram field product rotate front works without errors", () => {
        wrapper.find(".rotateprod-modal Button#rotateimg_front").simulate("click");

        expect(wrapper.find(".rotateprod-modal #rotatetxt_width").text()).toBe("10cm");
        expect(wrapper.find(".rotateprod-modal #rotatetxt_height").text()).toBe("19.5cm");
        expect(wrapper.find(".rotateprod-modal #rotatetxt_depth").text()).toBe("5cm");
    });

    it("planogram field product rotate save works without errors", () => {
        //jest.spyOn(wrapper.props.updaterotateprod);
        wrapper.find(".rotateprod-modal Button#btnrotate_save").simulate("click");

        //expect(wrapper.props.updaterotateprod).toBeCalled();
    });

    it("planogram field product rotate close works without errors", () => {
        //jest.spyOn(wrapper.props.viewrotateprod);
        wrapper.find(".rotateprod-modal Button#btnrotate_close").simulate("click");

        //expect(wrapper.props.viewrotateprod).toBeCalled();
    });
});