import React, { Component } from 'react';
import Dropzone from 'react-dropzone'
import Alert from 'react-bootstrap/lib/Alert';
import Button from 'react-bootstrap/lib/Button';

class Home extends Component {

  constructor(props) {
    super(props);
    this.state = {
      accept: '.pk2',
      files: [],
      dropzoneActive: false,
      fileTypeAlertVisible: false,
    }
  }

  onDragEnter() {
    this.setState({
      dropzoneActive: true
    });
  }

  onDragLeave() {
    this.setState({
      dropzoneActive: false
    });
  }

  onDrop(files, rejectedFiles) {
    if(rejectedFiles.length) {
      this.setState({fileTypeAlertVisible: true});
    }

    this.setState({
      files,
      dropzoneActive: false
    });

    files.forEach(file => {
      this.props.history.push({
        pathname: '/parser',
        state: {
          pk2File: file,
        }  
      });
    })
  }

  applyMimeTypes(event) {
    this.setState({
      accept: event.target.value
    });
  }

  handleFileTypeAlertDismiss() {
    this.setState({fileTypeAlertVisible: false});
  }

  render() {
    const { accept, files, dropzoneActive, fileTypeAlertVisible, PK2Error } = this.state;
    const overlayStyle = {
      position: 'absolute',
      top: 0,
      right: 0,
      bottom: 0,
      left: 0,
      padding: '3.5em 0',
      background: 'rgba(0,0,0,0.5)',
      textAlign: 'center',
      color: '#fff'
    };
    const dropAreaStyle = {
      border: '2px dashed rgba(27,31,35,0.3)',
      textAlign: 'center',
      padding: '50px',
    }
    let dropzoneRef;
    return (
      <Dropzone
        ref={(node) => { dropzoneRef = node; }}
        disableClick
        multiple={false}
        style={{}}
        accept={accept}
        onDrop={this.onDrop.bind(this)}
        onDragEnter={this.onDragEnter.bind(this)}
        onDragLeave={this.onDragLeave.bind(this)}
      >
        { dropzoneActive && <div style={overlayStyle}><h2>Drop your .pk2 file here</h2></div> }
        <div>
          <h2>Welcome to .pk2 file reader</h2>
          <div>
            <p>The <a target="_blank" href="https://github.com/florian0/swiftness/wiki/Joymax-Pak-File-(.pk2)">PK2-Format</a> is a container-format developed by Joymax the Korean game company and it's used in their games to pack all media files.</p>
            <p>This website is built on React framework and have client-side PK2 reader module written in JavaScript.</p>
            <p>Using this website - you can unpack any .pk2 file and export seperated media files to your computer.</p>
          </div>
          { 
            fileTypeAlertVisible ?
              <Alert bsStyle="danger" onDismiss={() => this.handleFileTypeAlertDismiss()}>
                <p>Dropped file format is not correct. Please try again.</p>
              </Alert> : ""
          }
          <div style={dropAreaStyle}>
            Drop your .pk2 file here or <Button bsStyle="primary" onClick={() => { dropzoneRef.open() }}>Open .pk2 file</Button>
          </div>
        </div>
      </Dropzone>
    )
  }
}

export default Home;
