import React from 'react'
import { connect } from 'react-redux'
// import * as Act from '../store/actions'
import { VictoryLine, VictoryChart } from 'victory'
var kernel = require('kernel-smooth')
// var science = require('science')

class Charts extends React.Component {
    constructor(props) {
        super(props)

        this.state = { densityData: [], layerColor: [] }
    }

    componentWillReceiveProps(newProps) {
        if (
            Object.keys(this.props.geometries).length !== 0 &&
            this.props.geometries.constructor === Object
        ) {
            console.log('LOADING CHARTTTTTT')
            let nodeLayers = Object.values(newProps.nodes).filter(
                f => f.type == 'DATASET'
            )
            let visibleNodes = nodeLayers.filter(l => l.visibility)
            console.log(visibleNodes, newProps.nodes, nodeLayers)
            // newProps.nodes.map(({ name }) => {
            //     console.log(name)
            // })
            // this.state.fields.map(({ field, name, show }) => (
            //     <SurroundBox
            //         key={name}
            //         child={field}
            //         name={name}
            //         show={show}
            //         onClick={this.onClick}
            //     />
            // ))
            // this.state.node.color
        }
        if (!this.state.started) {
            this.setState({ started: true })
            this.props = newProps
            this.setState({ densityData: this.getDensityData() })
            // color1
        }
    }

    getDensityData() {
        let layersVals = []
        for (var index in this.props.layers) {
            let currLayer = this.props.layers[index]

            let vals = []
            for (var currPoint in currLayer.geojson.otherdata) {
                let currVal = currLayer.geojson.otherdata[currPoint][3]
                if (currVal != 0) {
                    vals.push(currVal)
                }
            }

            let density = kernel.density(vals, kernel.fun.gaussian, 0.5)
            let max = math.max(vals)
            let stepSize = max / 512
            let xRange = d3.range(0, max, stepSize)
            let currDensityData = []
            for (let i in xRange) {
                currDensityData.push({ x: xRange[i], y: density(xRange[i]) })
            }
            layersVals.push(currDensityData)

            let currColors = this.state.layerColor
            currColors.push(currLayer.color1)
            this.setState({ layerColor: currColors })
        }

        return layersVals
    }

    render() {
        const chartLength = this.state.densityData.length

        return (
            <div id="layer-charts">
                {this.state.densityData.map((data, i) => {
                    return (
                        <span className="layer-chart" key={i}>
                            <VictoryChart
                                style={{
                                    parent: {
                                        height: '300px',
                                        width:
                                            chartLength <= 3
                                                ? `calc(80vw / ${chartLength})`
                                                : 'calc(80vw / 3)',
                                        margin: 'auto',
                                    },
                                }}
                            >
                                <VictoryLine
                                    style={{
                                        data: {
                                            stroke: this.state.layerColor[i],
                                        },
                                    }}
                                    key={i}
                                    data={data}
                                    interpolation={'natural'}
                                />
                            </VictoryChart>
                        </span>
                    )
                })}
                <style jsx>{`
                    #layer-charts {
                        display: flex;
                        overflow-x: scroll;
                        overflow-y: hidden;
                        cursor: ${chartLength <= 3 ? '' : 'ew-resize'};
                    }

                    .layer-chart {
                        flex: 1;
                        display: flex;
                        text-align: center;
                    }
                `}</style>
            </div>
        )
    }
}

export default connect(s => ({
    mapStarted: s.map.started,
    datasets: s.datasets,
    layers: s.datasets.layers,
    geometries: s.map.geometries,
    nodes: s.vpl.nodes,
    pcoordsValue: s.options.pcoordsValue,
    panelShow: s.interactions.panelShow,
}))(Charts)
