import axios from 'axios'
let crypto = require('crypto')
/**
 * Summary. (use period)
 *
 * Description. (use period)
 *
 * @file   This file defines the Graph class, for use in the PaintGraph namespace.
 * @author PaintingWithData
 */
export default class Graph {
    /**
     * Summary. (use period)
     *
     * Description. (use period)
     *
     * @access public
     * @class
     * @memberof PaintGraph
     *
     * @param {Element} canvasElement   The canvas element within which the map is drawn.
     * @param {Number}  height          The canvas height.
     * @param {Number}  width           The canvas width.
     */
    constructor(canvasElement, height, width) {
        /**
         * The canvas element (where the map is rendered).
         * @member {Element} canvas
         */

        this.near = 0.1
        this.canvas = canvasElement
        /**
         * The canvas height, depending on the window.
         * @member {Number} clientHeight
         */
        this.clientHeight = height
        /**
         * The canvas width, depending on the window.
         * @member {Number} clientWidth
         */
        this.clientWidth = width
        /**
         * The scene.
         * @member {THREE.Scene} scene
         */
        this.scene = this.initScene()
        /**
         * The camera.
         * @member {THREE.PerspectiveCamera} camera
         */
        this.camera = this.initCamera(this.clientWidth, this.clientHeight)
        /**
         * The renderer.
         * @member {THREE.WebGLRenderer} renderer
         */
        this.renderer = this.initRenderer(this.clientWidth, this.clientHeight)
        /**
         * The controls.
         * @member {THREE.OrbitControls} controls
         */
        this.controls = this.initControls(this.camera, this.canvas)
        // Puts canvas onto the page.
        this.insertCanvas(this.canvas, this.renderer.domElement)

        this.frameTime = new Date().getTime()
        this.startTime = new Date().getTime()

        this.renderUntil = Date.now()
        /**
         * Are we rendering or not?
         * @member {Boolean}
         */
        this.rendering = false
    }
    /**
     * Creates a new three.js Scene object for the canvas.
     * @return {THREE.Scene}
     */
    initScene() {
        return new THREE.Scene()
    }
    /**
     * Initializes and returns the map camera.
     * @param {Number} width
     * @param {Number} height
     * @return {THREE.PerspectiveCamera}
     */
    initCamera(width, height) {
        // Initializes the camera.
        var camera = new THREE.PerspectiveCamera(
            90,
            width / height,
            this.near,
            15000
        )
        // Configures settings. Pan, but don't rotate.
        camera.position.y = 300
        camera.lookAt(new THREE.Vector3(0.0, 0.0, 0.0))
        camera.enablePan = true
        camera.enableRotate = false
        return camera
    }
    /**
     * Initializes the renderer, and defines various helper methods under the
     * "window" namespace.
     * @param {Number} width
     * @param {Number} height
     * @return {THREE.WebGLRenderer}
     */
    initRenderer(width, height) {
        var renderer = new THREE.WebGLRenderer({
            precision: 'mediump',
            antialias: true,
            preserveDrawingBuffer: true,
        })
        renderer.setPixelRatio(window.devicePixelRatio)
        renderer.setSize(width, height)
        renderer.setClearColor(new THREE.Color('white'))
        /**
         * Renders the current scene.
         * @alias window~render
         */
        window.render = () => renderer.render(this.scene, this.camera)
        /**
         * Calls the API for a screenshot of their map. To be displayed to the
         * reader.
         * @alias window~getScreenShot
         */
        window.getScreenShot = () => {
            // A string representation of the image.
            const img = renderer.domElement.toDataURL('image/png')
            // Decodes the string representation.
            var byteString = atob(img.split(',')[1])
            // Separates out the MIME component.
            var mimeString = img
                .split(',')[0]
                .split(':')[1]
                .split(';')[0]
            // Creates a new ArrayBuffer for byteString.
            var ab = new ArrayBuffer(byteString.length)
            // Creates a view into the buffer, so "ab" can be modified.
            var ia = new Uint8Array(ab)
            // Set the bytes of the buffer to the values of byteString.
            for (var i = 0; i < byteString.length; i++) {
                ia[i] = byteString.charCodeAt(i)
            }
            var data = new Blob([ab], { type: mimeString })

            if (textFile !== null) {
                window.URL.revokeObjectURL(textFile)
            }

            let textFile = window.URL.createObjectURL(data)

            let link = document.createElement('a')
            link.setAttribute('download', 'projectExport.'.concat('png'))
            link.href = textFile
            document.body.appendChild(link)
            link.click()
        }
        function scaleImage(
            srcwidth,
            srcheight,
            targetwidth,
            targetheight,
            fLetterBox
        ) {
            var result = { width: 0, height: 0, fScaleToTargetWidth: true }

            // scale to the target width
            var scaleX1 = targetwidth
            var scaleY1 = srcheight * targetwidth / srcwidth

            // scale to the target height
            var scaleX2 = srcwidth * targetheight / srcheight
            var scaleY2 = targetheight

            // now figure out which one we should use
            var fScaleOnWidth = scaleX2 > targetwidth
            if (fScaleOnWidth) {
                fScaleOnWidth = fLetterBox
            } else {
                fScaleOnWidth = !fLetterBox
            }

            if (fScaleOnWidth) {
                result.width = Math.floor(scaleX1)
                result.height = Math.floor(scaleY1)
                result.fScaleToTargetWidth = true
            } else {
                result.width = Math.floor(scaleX2)
                result.height = Math.floor(scaleY2)
                result.fScaleToTargetWidth = false
            }
            result.targetleft = Math.floor((targetwidth - result.width) / 2)
            result.targettop = Math.floor((targetheight - result.height) / 2)

            return result
        }

        /**
         *
         * @alias window~takeSnaptshot
         * @param {Number} datavoxelId
         * @param {Boolean} snapshot
         */
        window.takeSnaptshot = (datavoxelId, snapshot = false, name = '') => {
            let resizedCanvas = document.createElement('canvas')
            let resizedContext = resizedCanvas.getContext('2d')
            let newHeight, newWidth, newDims
            if (snapshot) {
                // newWidth = 1146
                // let ratio = width / newWidth
                // newHeight = height / ratio
                newDims = scaleImage(width, height, 1146, 600)
                console.log(newDims)
                newWidth = newDims.width
                newHeight = newDims.height
            } else {
                newHeight = 550
                let ratio = height / newHeight
                newWidth = width / ratio
            }

            resizedCanvas.height = newHeight.toString()
            resizedCanvas.width = newWidth.toString()
            resizedContext.drawImage(
                renderer.domElement,
                0,
                0,
                newWidth,
                newHeight
            )

            if (snapshot) {
                let imageData = resizedContext.getImageData(
                    newDims.targetleft,
                    Math.abs(newDims.targettop),
                    1146,
                    600
                )
                resizedCanvas.width = 1146
                resizedCanvas.height = 600
                var ctx1 = resizedCanvas.getContext('2d')
                ctx1.rect(0, 0, 100, 100)
                ctx1.fillStyle = 'white'
                ctx1.fill()
                ctx1.putImageData(imageData, 0, 0)
            }

            let resizedPreview = document.createElement('canvas')
            let resizedContextPreview = resizedPreview.getContext('2d')
            let newPreviewHeight = 900
            let previewRatio = height / newPreviewHeight
            let newPreviewWidth = width / previewRatio

            resizedPreview.height = newPreviewHeight.toString()
            resizedPreview.width = newPreviewWidth.toString()
            resizedContextPreview.drawImage(
                renderer.domElement,
                0,
                0,
                newPreviewWidth,
                newPreviewHeight
            )

            let preview = resizedPreview.toDataURL('image/jpeg')

            let img = resizedCanvas.toDataURL('image/jpeg')

            if (snapshot) {
                let hash = crypto.randomBytes(8).toString('hex')
                return uploadSnapshot(
                    {
                        id: datavoxelId,
                        data: img,
                        hash: hash,
                        name: name,
                    },
                    '/uploadSnapshot'
                )
            } else {
                return uploadSnapshot(
                    { id: datavoxelId, data: img, preview: preview },
                    '/screenshot'
                )
            }
        }

        const uploadSnapshot = (request, endpoint) => {
            return axios({
                method: 'post',
                url: endpoint,
                data: request,
            }).then(function(response) {
                //handle success
                console.log(response)
            })
        }

        return renderer
    }
    /**
     * Initializes the control object.
     * @param {THREE.PerspectiveCamera} camera
     * @param {Element} canvas
     */
    initControls(camera, canvas) {
        let controls = new THREE.OrbitControls(camera, canvas)
        controls.enableRotate = false

        // Adds an event listener that modifies the camera's frustum near plane to be behind the camera if necessary
        controls.domElement.addEventListener(
            'mousewheel',
            () => {
                if (this.controls.object.position.y <= this.near) {
                    this.camera.near = this.controls.object.position.y / 10
                    this.camera.updateProjectionMatrix()
                    console.log('Modified Camera Frustum Near Plane')
                } else if (
                    this.camera.near < this.near &&
                    this.controls.object.position.y > this.near
                ) {
                    this.camera.near = this.near
                    this.camera.updateProjectionMatrix()
                    console.log(
                        'Modified Camera Frustum Near Plane Back to Original'
                    )
                }
            },
            false
        )

        return controls
    }

    onDocumentMouseWheel() {
        // var fovMAX = 160;
        // var fovMIN = 1;
        // camera.fov -= event.wheelDeltaY * 0.05;
        // camera.fov = Math.max( Math.min( camera.fov, fovMAX ), fovMIN );
        // camera.projectionMatrix = new THREE.Matrix4().makePerspective(camera.fov, window.innerWidth / window.innerHeight, camera.near, camera.far);
    }

    /**
     * Appends canvas onto the given element.
     * @param {Element} element The element to be appended to.
     * @param {Element} canvas The canvas.
     */
    insertCanvas(element, canvas) {
        element.appendChild(canvas)
    }

    /**
     *
     */
    start() {
        // Adds event listener for resizing.
        window.addEventListener('resize', this.onResize.bind(this), false)
        this.renderSec(7)

        window.renderSec = this.renderSec.bind(this)

        let renderPer2Sec = ''

        window.setInterval(() => {
            if (!this.rendering) {
                cancelAnimationFrame(renderPer2Sec)
                renderPer2Sec = window.requestAnimationFrame(() => {
                    // console.log('regularly render per 2 secs')
                    window.render()
                })
            }
        }, 2000)

        // default mouseUp to renderSec(1)
        document.body.addEventListener('mouseup', () => {
            this.renderSec(1)
        })

        // default mouseDown to renderSec(0.5)
        document.body.addEventListener('mousedown', () => {
            this.renderSec(0.5)
        })
    }

    addMesh(mesh) {
        this.scene.add(mesh)
    }

    initGrid(scene) {
        var gridHelper = new THREE.GridHelper(500, 200)
        const gridHelperId = gridHelper.id
        scene.add(gridHelper)
        return gridHelperId
    }

    // Modifies `this.gridHelperId`
    showGrid(scene) {
        if (this.gridHelperId == undefined) {
            this.gridHelperId = this.initGrid(scene)
            return this.gridHelperId
        } else {
            return this.gridHelperId
        }
    }

    // Modifies `this.gridHelperId`
    hideGrid(scene, id) {
        if (this.gridHelperId != undefined) {
            let grid = scene.getObjectById(id)
            scene.remove(grid)
            this.gridHelperId = undefined
            return 0
        } else {
            return -1
        }
    }
    /**
     * Resizes the map when we resize the window.
     *
     * Updates the aspect ratio of the camera, and the size of the renderer.
     */
    onResize() {
        this.camera.aspect = window.innerWidth * 0.799 / window.innerHeight
        this.camera.updateProjectionMatrix()
        this.renderer.setSize(
            Math.floor(window.innerWidth * 0.799),
            window.innerHeight
        )
    }
    /**
     *
     * @param {Number} sec The number of seconds
     * @param {String} label Unused.
     */
    renderSec(sec = 1) {
        // console.log(`renderSec(${sec})`, this.rendering)
        // "sec" seconds into the future
        const untilTime = Date.now() + sec * 1000
        // "this.renderUntil" is at least as far back as untilTime.
        if (untilTime > this.renderUntil) {
            this.renderUntil = untilTime
        }
        if (this.rendering == false) {
            this.render()
        }
    }

    render() {
        this.rendering = true
        this.renderer.render(this.scene, this.camera)

        const until = Math.ceil((this.renderUntil - Date.now()) / 1000)

        // console.log('render', until)

        if (until >= 1) {
            window.requestAnimationFrame(() => {
                this.render()
            })
        } else {
            this.rendering = false
            // console.log('render end', this.rendering)
        }
    }
}
