import React from 'react'
import { connect } from 'react-redux'
import $ from 'jquery'
import * as act from '../store/actions'

class Slider extends React.Component {
    constructor(props) {
        super(props)
        this.dp = {
            cX: 0,
            sX: 0,
            held: false,
        }
        // this.newProps = {}
        this.circleHandleMouseDown = this.circleHandleMouseDown.bind(this)
        this.containerMouseMove = this.containerMouseMove.bind(this)
        this.containerMouseUp = this.containerMouseUp.bind(this)
        this.containerMouseDown = this.containerMouseDown.bind(this)
    }

    // componentWillReceiveProps(newProps){
    //     this.newProps = newProps;
    //     console.log(newProps, 6666666)
    // }

    circleHandleMouseDown(event) {
        event.stopPropagation()
        this.dp.held = true
    }

    containerMouseDown(event) {
        event.stopPropagation()
        this.dp.held = true
        this.dp.sX = event.clientX
        let target = $(event.currentTarget)
        let left = target.position().left
        target
            .children('circle')
            .attr(
                'transform',
                'translate(' + (event.clientX - 4 - parseInt(left)) + ',' + '0)'
            )
        this.dp.cX = event.clientX
    }

    containerMouseUp(event) {
        let target = $(event.currentTarget)
        let left = target.position().left
        let opacityValue = event.clientX - 4 - parseInt(left)

        const valDiff = 100 - 0
        const remap = x => valDiff * ((x - 0) / (160 - 0)) + 0

        act.updateGeometry(
            this.props.index,
            'Opacity',
            parseFloat(remap(opacityValue)) / 100.0,
            'opacity'
        )

        event.stopPropagation()
        this.dp.held = false
        this.dp.cX = 0
    }

    containerMouseMove(event) {
        event.stopPropagation()
        if (this.dp.held) {
            let target = $(event.currentTarget)
            let left = target.position().left
            target
                .children('circle')
                .attr(
                    'transform',
                    'translate(' +
                        (event.clientX - 4 - parseInt(left)) +
                        ',' +
                        '0)'
                )
        }
    }

    render() {
        return (
            <g
                onMouseDown={this.containerMouseDown}
                onMouseUp={this.containerMouseUp}
                onMouseMove={this.containerMouseMove}
                className={'sliderContainer'}
                transform={`translate(20, 76)`}
            >
                {/*
                <rect width={160} height={"5px"} x = {this.props.position.x + 20} y ={this.props.position.y + 70}/>
                <circle onMouseDown = {this.circleHandleMouseDown} className = {"sliderHandle"} cx = {this.props.position.x + 20} cy ={this.props.position.y + 73} r = {"8"} transform ={"translate(85, 0)"}/>
                */}
                <rect width={160} height={'5px'} />
                <circle
                    onMouseDown={this.circleHandleMouseDown}
                    className={'sliderHandle'}
                    cx={0}
                    cy={3}
                    r={'8'}
                    transform={'translate(85, 0)'}
                />
            </g>
        )
    }
}

const mapStateToProps = state => {
    return {
        nodes: state.vpl.nodes,
        links: state.vpl.links,
        geometries: state.map.geometries,
    }
}

export default connect(mapStateToProps)(Slider)
