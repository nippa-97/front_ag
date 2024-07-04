import React from 'react';

export class RenderProdImage extends React.Component{
    constructor(props) {
        super(props)
        this.state = {
            prodUrl: null,
        };
    }
    
    componentDidMount() {
       
        this.getBase64FromUrl(this.props.prodObj.imageUrl).then(returnimage => {
            /* let cprodobj = this.props.prodObj;
            cprodobj["baseUrl"] = returnimage; */

            this.setState({ prodUrl: returnimage });
        })
    }

    getBase64FromUrl = async (url) => {
        const data = await fetch(url);
        const blob = await data.blob();

        return new Promise((resolve) => {
          const reader = new FileReader();
          reader.readAsDataURL(blob); 
          reader.onloadend = () => {
            const base64data = reader.result;   
            resolve(base64data);
          }
        });
    }
    
    render() {
        let prodObj = this.props.prodObj;
        let prodUrl = this.state.prodUrl;

        return (<>
            <image pointerEvents="all" preserveAspectRatio="none" x={prodObj.x} y={prodObj.y} width={prodObj.drawWidth} height={prodObj.drawHeight} href={(prodUrl?prodUrl:prodObj.imageUrl)} style={{outline: "solid 1px rgb(204, 204, 204)"}} />
        </>);
    }
}


export class FullRenderProdImage extends React.Component{
    constructor(props) {
        super(props)
        this.state = {
            prodObj: null,
        };
    }
    
    componentDidMount() {
        this.getBase64FromUrl(this.props.prodObj.imageUrl).then(returnimage => {
            let cprodobj = this.props.prodObj;
            cprodobj["baseUrl"] = returnimage;

            this.setState({ prodObj: cprodobj },()=>{
                this.props.handleloadedprodcount()
            });
        })
    }

    getBase64FromUrl = async (url) => {
        const data = await fetch(url);
        const blob = await data.blob();

        return new Promise((resolve) => {
            let newblob = new Blob([blob], {type: 'image/png'});

            const reader = new FileReader();
            reader.readAsDataURL(newblob); 
            reader.onloadend = () => {
                const base64data = reader.result;   
                resolve(base64data);
            }
        });
    }
    
    render() {
        let prodObj = this.state.prodObj;

        return (<>
            {prodObj?
                <image pointerEvents="all" preserveAspectRatio="none" x={prodObj.x} y={prodObj.y} width={prodObj.drawWidth} height={prodObj.drawHeight} xlinkHref={prodObj.baseUrl} style={{outline: "solid 1px rgb(204, 204, 204)"}} />
            :<></>}
        </>);
    }
}