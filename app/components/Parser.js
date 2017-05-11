import React, { Component } from 'react';
import ListGroup from 'react-bootstrap/lib/ListGroup';
import Breadcrumb from 'react-bootstrap/lib/Breadcrumb';
import ListGroupItem from 'react-bootstrap/lib/ListGroupItem';
import ButtonGroup from 'react-bootstrap/lib/ButtonGroup';
import DropdownButton from 'react-bootstrap/lib/DropdownButton';
import MenuItem from 'react-bootstrap/lib/MenuItem';
import Alert from 'react-bootstrap/lib/Alert';
import Modal from 'react-bootstrap/lib/Modal';
import Button from 'react-bootstrap/lib/Button';
import Form from 'react-bootstrap/lib/Form';
import FormControl from 'react-bootstrap/lib/FormControl';
var fileDownload = require('react-file-download');
import PK2Tools from '../pk2tools/PK2Tools';

class Parser extends Component {

	constructor(props) {
		super(props);
		this.state = {
			pk2File: this.props.location.state.pk2File || false,
			folders: [],
			files: [],
			breadcrumb: [],
			fileErrorVisible: false,
			fileError: false,
			keyDialogVisible: true,
			keys: [
				'169841',
				'calaña',
				'2009Äê',
				'874897',
			],
			customKey: "",
		}
		this.folders = [];
		this.files = [];
		this.currentFolder = null;
		this.reader = new FileReader();
    	this.reader.onloadend = this.onFileBuffer.bind(this);
    	this.pk2 = PK2Tools.create({
    		fileName: this.state.pk2File.name,
    	});
    	this.pk2.on('fileLoaded', this.onPK2FileLoaded.bind(this));
    	this.pk2.on('error', this.onPK2Error.bind(this));

	}

	componentWillMount() {
	}

	componentDidMount() {
		//this.reader.readAsArrayBuffer(this.state.pk2File);
	}

	onFileBuffer(e) {
		var fileArrayBuffer = this.reader.result;
		this.pk2.load(fileArrayBuffer);
	}

	onPK2FileLoaded() {
		this.currentFolder = this.pk2.mainFolder;
		this.setState({
			folders: this.currentFolder.subFolders,
			files: this.currentFolder.files,
		});
		this.generateBreadcrumb();
	}

	onPK2Error(data) {
		this.setState({
			fileErrorVisible: true,
			fileError: data.message,
		});
	}

	onKeyChosen(key) {
		this.pk2.setKey(key);
		this.setState({
			keyDialogVisible: false,
		});
		this.reader.readAsArrayBuffer(this.state.pk2File);
	}

	onCustomKeyChanged(event) {
		var key = event.target.value;
		this.setState({
			customKey: key,
		});
	}

	onCustomKeyChosen() {
		var key = this.state.customKey;
		this.pk2.setKey(key);
		this.setState({
			keyDialogVisible: false,
		});
		this.reader.readAsArrayBuffer(this.state.pk2File);
	}

	onFolderClick(folder) {
		this.currentFolder = folder;
		this.setState({
			folders: folder.subFolders,
			files: folder.files,
		});
		this.generateBreadcrumb();
	}

	onPrevFolderClick() {
		var targetFolder = this.currentFolder.parentFolder;
		if(targetFolder) {
			this.setState({
				folders: targetFolder.subFolders,
				files: targetFolder.files,
			});
			this.currentFolder = targetFolder;
		}
		this.generateBreadcrumb();
	}

	downloadFile(file) {
		var bytes;
		bytes = this.pk2.getFileBytes(file);
		fileDownload(bytes, file.nameSanitized);
	}

	generateBreadcrumb() {
		var nextItem, items = [];
		nextItem = this.currentFolder;
		if (nextItem) {
			while(nextItem) {
				items.push(nextItem);
				nextItem = nextItem.parentFolder;
			}
			items.reverse();
			this.setState({
				breadcrumb: items,
			});
		}
	}

	render() {
		const { files, folders, breadcrumb, fileErrorVisible, fileError, keyDialogVisible, keys, customKey } = this.state;
		return (
			<div>
				{ 
					keyDialogVisible ?
					<div className="static-modal">
						<Modal.Dialog>
							<Modal.Header>
								<Modal.Title>Choose decryption key</Modal.Title>
							</Modal.Header>

							<Modal.Body>
								<ListGroup>
									{
										keys.map(
											k => 
												<ListGroupItem key={k} onClick={() => this.onKeyChosen(k)}>
													<span className="glyphicon glyphicon-wrench"></span> {k}
												</ListGroupItem>
										)
									}
								</ListGroup>
							</Modal.Body>

							<Modal.Footer>
								<Form inline>
									<FormControl
							            type="text"
							            placeholder="Enter custom key"
							            onChange={(e) => this.onCustomKeyChanged(e)}
							          />
							        {' '}
									<Button bsStyle="primary" onClick={() => this.onCustomKeyChosen()}>Unlock</Button>
								</Form>
							</Modal.Footer>

						</Modal.Dialog>
					</div> : ""
				}
				{ 
					fileErrorVisible ?
					<Alert bsStyle="danger">
						<p>{fileError}</p>
						<p>
							<Button onClick={() => this.props.history.push({pathname: '/'})}>Back to home</Button>
						</p>
					</Alert> : ""
				}
				<Breadcrumb>
				{
					breadcrumb.map(
						f => 
							<Breadcrumb.Item key={f.position} onClick={() => this.onFolderClick(f)}>
								{f.nameSanitized}
							</Breadcrumb.Item>
					)
				}
				</Breadcrumb>

				<ListGroup>
				<ListGroupItem key="previous-dir" onClick={() => this.onPrevFolderClick()}>
					<span className="glyphicon glyphicon-folder-close"></span> ..
				</ListGroupItem>
				{
					folders.map(
						f => 
							<ListGroupItem key={f.position} onClick={() => this.onFolderClick(f)}>
								<span className="glyphicon glyphicon-folder-close"></span> {f.nameSanitized}
							</ListGroupItem>
					)
				}
				{
					files.map(
						f => 
							<ListGroupItem key={f.position} onClick={() => this.downloadFile(f)}>
								<span className="glyphicon glyphicon-file"></span> 
								{f.nameSanitized} 
							    <span className="pull-right">{bytesToSize(f.size)}</span>
							</ListGroupItem>
					)
				}
				</ListGroup>
			</div>
		)
	}
}

function bytesToSize(bytes) {
   var sizes = ['B', 'KB', 'MB', 'GB', 'TB'];
   if (bytes == 0) return '0 Byte';
   var i = parseInt(Math.floor(Math.log(bytes) / Math.log(1024)));
   return Math.round(bytes / Math.pow(1024, i), 2) + '' + sizes[i];
};

export default Parser;