import React, { Component } from 'react'

export default class ActiveplanogramLayout extends Component {
    render() {
        return (
            <g className="field-rect">
                <rect 
                 height={this.props.height}
                    width={this.props.width} x={this.props.x} y={this.props.y}
                    // fill={this.props.field.overlap?"black":(this.props.field && this.props.field.department ? this.props.field.department.color : "#444")}
                    fill={(this.props.field && this.props.field.department ? this.props.field.department.color : "#444")}
                    transform={"rotate(" + this.props.rotation + " " + (this.props.x + this.props.width / 2) + " " + (this.props.y + this.props.height / 2) + ") "}
                    className="shelf"
                    style={{ opacity: this.props.field.overlap?"0.9":"0.7", stroke: this.props.field.overlap?"black":"none",strokeWidth:"4" }}
                />
            </g>
        )
    }
}
