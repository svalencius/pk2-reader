import React from 'react';
import ReactDOM from 'react-dom';
import { BrowserRouter as Router, Route, Link, Switch} from 'react-router-dom';
import Navbar from 'react-bootstrap/lib/Navbar';
import Nav from 'react-bootstrap/lib/Nav';
import NavItem from 'react-bootstrap/lib/NavItem';

import Home from './components/Home';
import Parser from './components/Parser';

ReactDOM.render((
	<Router>
		<div className="site-wrapper">
			<Navbar inverse collapseOnSelect className="navbar-static-top">
				<Navbar.Header>
				  <Navbar.Brand>
				    <Link to="/">PK2 Reader</Link>
				  </Navbar.Brand>
				</Navbar.Header>
				<Nav pullRight>
					<Navbar.Text>
						<Navbar.Link target="_blank" href="https://github.com/seriousim/pk2-reader">Github</Navbar.Link>
					</Navbar.Text>
					<Navbar.Text>
						<Navbar.Link target="_blank" href="https://mega.nz/#F!pqoBwKYR!ZhT0N35v_QQJjy-88sw9kA">Sample files</Navbar.Link>
					</Navbar.Text>
				</Nav>
			</Navbar>
			<div className="container">
				<Switch>
					<Route exact path="/" component={Home}/>
					<Route path="/parser" component={Parser}/>
				</Switch>
				<footer>
					<hr />
					Browser based <a target="_blank" href="https://github.com/florian0/swiftness/wiki/Joymax-Pak-File-(.pk2)">PK2-Format</a> reader
				</footer>
		    </div>
	    </div>
	</Router >
),document.getElementById('root'));