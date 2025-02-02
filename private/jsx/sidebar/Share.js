/*global datavoxelId*/
// /*global userSignedIn */

import React from 'react'
import { connect } from 'react-redux'

// import * as Act from '../store/actions.js'

import { Input, Modal, message } from 'antd'

message.config({
    top: 100,
    duration: 2,
    maxCount: 1,
})

class Share extends React.Component {
    constructor(props) {
        super(props)

        this.state = {
            snapshotModalVisible: false,
            snapshotTaking: false,
            snapshotPreviewImg: '',
            snapshots: [],
        }

        this.checked = {
            snapshotsLoaded: false,
        }

        console.log('<Share/> start')
        this.getSnapshots()
    }

    getSnapshots = () => {
        console.log('getSnapshots start')

        fetch('/getSnapshots/', {
            //Important: I don't know why this isn't authenticating, but I'll ask Carlos...
            method: 'POST',
            headers: {
                Accept: 'application/json',
                'Content-Type': 'application/json',
            },
            credentials: 'include',
            body: JSON.stringify({
                id: datavoxelId,
            }),
        })
            .then(res => res.json())
            .then(({ snapshots }) => {
                console.log('getSnapshots res', { snapshots })
                this.checked.snapshotsLoaded = true

                this.setState({
                    snapshots,
                })
            })
            .catch(e => console.error(e))
    }

    deleteSnapshot = hash => {
        console.log('deleteSnapshots start')
        const hashes = [hash]

        fetch('/deleteSnapshots/', {
            //Important: I don't know why this isn't authenticating, but I'll ask Carlos...
            method: 'POST',
            headers: {
                Accept: 'application/json',
                'Content-Type': 'application/json',
            },
            credentials: 'include',
            body: JSON.stringify({
                hashes,
            }),
        })
            .then(res => res.json())
            .then(res => {
                console.log('deleteSnapshots res', { res })
                this.getSnapshots()
                message.success(`The Snapshot has been deleted`)
            })
            .catch(e => console.error(e))
    }

    componentWillReceiveProps() {
        if (!this.checked.snapshotsLoaded) this.getSnapshots()
    }

    copyEmbedLink = () => {
        const inputDom = document.querySelector('#project-embeddable-link')
        this.execCopy(inputDom)
    }

    copySnapshotLink = hash => {
        const shareLink = `${window.location.origin}/snap/${hash}`
        const inputDom = document.querySelector('#snapshot-link')
        inputDom.value = shareLink
        this.execCopy(inputDom)
    }

    execCopy = inputDom => {
        inputDom.select()
        document.execCommand('copy')
        message.success('The link has been copied to the clipboard')
    }

    takeSnapshot = e => {
        console.log('takeSnapshot', e)
        this.setState({
            snapshotModalVisible: true,
        })

        const mapCanvas = document.querySelector('#mapCanvas canvas')

        const snapshotPreviewImg = {
            snapshotPreviewImg: mapCanvas.toDataURL('image/png'),
        }
        this.setState(snapshotPreviewImg)

        // refresh the previewImg
        setTimeout(() => {
            const snapshotPreviewImg = {
                snapshotPreviewImg: mapCanvas.toDataURL('image/png'),
            }
            this.setState(snapshotPreviewImg)
        }, 2000)
    }

    handleSnapshotTaking = () => {
        this.setState({
            snapshotTaking: true,
        })

        const snapshotName =
            document.querySelector('#snapshotTakingName').value ||
            `${datavoxelId}-${Date.now()}`

        // if (Date.now() > 0) return true
        window
            .takeSnaptshot(datavoxelId, true, snapshotName)
            .then(() => {
                this.setState({
                    snapshotModalVisible: false,
                    snapshotTaking: false,
                })

                this.getSnapshots()
                message.success(`Created Snapshot ${snapshotName}`)
            })
            .catch(e => {
                console.error(e)
                this.setState({
                    snapshotTaking: false,
                })
            })
    }

    handleCancelSnapshotTaking = () => {
        this.setState({
            snapshotModalVisible: false,
            snapshotTaking: false,
        })
    }

    forceDownload(url, fileName) {
        var xhr = new XMLHttpRequest()
        xhr.open('GET', url, true)
        xhr.responseType = 'blob'
        xhr.onload = function() {
            var urlCreator = window.URL || window.webkitURL
            var imageUrl = urlCreator.createObjectURL(this.response)
            var tag = document.createElement('a')
            tag.href = imageUrl
            tag.download = fileName
            document.body.appendChild(tag)
            tag.click()
            document.body.removeChild(tag)
        }
        xhr.send()
    }

    snapshotDOM = ({ name, hash, image, createdAt }) => {
        const createAtDate = new Date(createdAt).toDateString()

        return (
            <div
                className="snapshot"
                style={{
                    backgroundImage: `url('${image}')`,
                }}
                key={hash}
            >
                <div className="display">
                    <span className="snapshot-tool">
                        <i
                            className="fas fa-trash"
                            onClick={() => this.deleteSnapshot(hash)}
                        />
                        <i
                            className="fas fa-link"
                            onClick={() => this.copySnapshotLink(hash)}
                        />
                        <i>
                            <i
                                className="fas fa-download"
                                onClick={() =>
                                    this.forceDownload(
                                        `${
                                            location.protocol
                                        }//s3.amazonaws.com/data-voxel-snapshots/${hash}.jpg`,
                                        `${name}-${createdAt}.jpg`
                                    )
                                }
                            />
                        </i>
                    </span>
                </div>
                <div className="desc">
                    <span className="name">{name}</span>
                    <span className="time">{createAtDate}</span>
                </div>

                <style jsx>{`
                    .snapshot {
                        $sh: 140px;
                        $sw: 260px;
                        $descHeight: 34px;

                        margin: 10px 10px;
                        width: $sw;
                        height: $sh + 2px;

                        $r: 5px;
                        border: 1px solid #ccc;
                        border-radius: $r;
                        cursor: pointer;

                        background-size: cover;
                        background-position: center center;

                        --snapshot-tool-opacity: 0;
                        &:hover {
                            --snapshot-tool-opacity: 1;
                        }

                        .display {
                            height: $sh - $descHeight;

                            .snapshot-tool {
                                margin-right: 12px;
                                margin-top: 6px;
                                float: right;
                                text-shadow: #ffffff80 1px 1px 3px;
                                opacity: var(--snapshot-tool-opacity);
                                transition: 0.5s opacity ease-out;

                                cursor: pointer;

                                > i + i {
                                    margin-left: 12px;
                                }

                                a {
                                    color: inherit !important;
                                }
                            }
                        }

                        .desc {
                            $h: $descHeight;
                            bottom: 0px;
                            background: #ffffff8c;
                            height: $h;
                            border-radius: 0px 0px $r $r;
                            border: 0px solid #ccc;
                            border-top-width: 1px;

                            span {
                                line-height: $h;
                            }

                            .name {
                                float: left;
                                margin-left: $r;
                                overflow: hidden;
                                width: $sw * 0.5;
                                height: $h;
                                text-align: left;
                                text-overflow: ellipsis;
                            }

                            .time {
                                white-space: nowrap;
                                text-align: right;
                                float: right;
                                width: $sw * 0.38;
                                margin-right: $r;
                                font-size: 12px;
                            }
                        }
                    }
                `}</style>
            </div>
        )
    }

    render() {
        // /* Testing snapshot UI */
        // const snapshotImage = `https://s3.amazonaws.com/data-voxel-images/${datavoxelId}.jpg`

        const snapshotPreviewImg =
            this.state.snapshotPreviewImg ||
            `https://s3.amazonaws.com/data-voxel-images/${datavoxelId}.jpg`

        return (
            <div id="sidebar-share">
                <p>Share Your Model</p>
                <div
                    style={{ marginBottom: 16 }}
                    className="embed-link"
                    onClick={this.copyEmbedLink}
                >
                    <Input
                        id="project-embeddable-link"
                        placeholder="embeddable link"
                        onClick={this.copyEmbedLink}
                        style={{ width: '80%' }}
                        value={`${window.location.origin}/embed/${datavoxelId}`}
                        readOnly
                        addonAfter={<i className="fas fa-link" />}
                    />
                </div>
                <p>Model Snapshots</p>

                {/* invisible input DOM only for copy function */}
                <input id="snapshot-link" value="snapshotLink" readOnly />

                <Modal
                    wrapClassName="snapshot-taking-modal"
                    title="Save your Model Snapshot"
                    visible={this.state.snapshotModalVisible}
                    onOk={this.handleSnapshotTaking}
                    confirmLoading={this.state.snapshotTaking}
                    onCancel={this.handleCancelSnapshotTaking}
                >
                    <img src={snapshotPreviewImg} />
                    <div className="name">
                        <Input
                            id="snapshotTakingName"
                            addonBefore="Name"
                            defaultValue=""
                            placeholder="Snapshot Name"
                        />
                    </div>
                </Modal>

                <div className="snapshots">
                    <div className="snapshot add" onClick={this.takeSnapshot}>
                        <i className="fas fa-plus fa-3x" />
                    </div>
                    {_.orderBy(
                        this.state.snapshots,
                        ['createdAt'],
                        ['desc']
                    ).map(({ name, hash, image, createdAt }) => {
                        return this.snapshotDOM({
                            name,
                            hash,
                            image,
                            createdAt,
                        })
                    })}
                </div>

                <style jsx>{`
                    #sidebar-share {
                        text-align: center;
                        .embed-link {
                            cursor: pointer;
                        }
                        p {
                            margin-top: 10px;
                            margin-bottom: 5px;
                            font-size: 16px;
                        }

                        #snapshot-link {
                            opacity: 0;
                            position: fixed;
                            user-select: none;
                        }

                        .snapshots {
                            overflow-y: scroll;
                            height: calc(100vh - 260px);
                        }

                        .snapshot.add {
                            $sh: 140px;
                            margin: 10px 10px;
                            width: 260px;
                            height: $sh + 2px;

                            $r: 5px;
                            border: 1px solid #ccc;
                            border-radius: $r;
                            cursor: pointer;

                            text-align: center;
                            i {
                                line-height: 140px;
                            }
                        }
                    }
                `}</style>
                <style jsx global>{`
                    .snapshot-taking-modal {
                        img {
                            width: 100%;
                        }
                        .name {
                            margin: 20px 0px;
                        }
                    }
                `}</style>
            </div>
        )
    }
}

const mapStateToProps = s => {
    return {
        vpl: s.vpl,
        options: s.options,
    }
}

export default connect(mapStateToProps)(Share)
