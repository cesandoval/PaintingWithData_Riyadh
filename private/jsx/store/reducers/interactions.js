import * as t from '../types'

const initialInteractionsState = {
    loading: true,
    panelShow: 'PCoords', // 'VPL' or 'PCoords' or Null or 'Chart:Density or 'Chart:Bar' or 'Chart:Scatter.
    activeNode: '',
    refreshVoxels: false,
}

export default (state = initialInteractionsState, action) => {
    switch (action.type) {
        case t.SET_LOADING: {
            const { value } = action
            const loading = { loading: value }
            return Object.assign({}, state, loading)
        }
        case t.SET_PANELSHOW: {
            const { value } = action
            const panelShow = { panelShow: value }
            return Object.assign({}, state, panelShow)
        }
        case t.SET_ACTIVENODE: {
            const { value } = action
            const activeNode = { activeNode: value }
            return Object.assign({}, state, activeNode)
        }
        case t.SET_REFRESHVOXELS: {
            const { value } = action
            const refreshVoxels = { refreshVoxels: value }
            return Object.assign({}, state, refreshVoxels)
        }
        default:
            return state
    }
}
