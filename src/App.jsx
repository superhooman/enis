import React, { Component } from 'react';
import cn from 'classnames';
import { connect } from 'react-redux';
import { bindActionCreators } from 'redux';
import { changeLocale, changeTheme, login, logout, dismissNotify, loadingStart, loadingStop } from './actions';
import { BrowserRouter as Router, Route, Switch, Redirect } from 'react-router-dom';
import axios from "axios"
import config from "./config";
import cities from './cities.json'
import Home from './pages/Home';
import Dashboard from './pages/Dashboard';
import './App.css';

class App extends Component {
  constructor(props){
    super(props)
    this.state = {
      iosPWA: false
    }
  }
  componentWillMount(){
    let iOS = /iPad|iPhone|iPod/.test(navigator.userAgent) && !window.MSStream;
		if (iOS) {
			this.setState({
				iosPWA: 'standalone' in window.navigator && window.navigator.standalone
			});
    }
    if (this.props.logged && (window.location.pathname === '/')) {
			this.props.loadingStart();
			axios({
				withCredentials: true,
				method: 'post',
				url:
					config.server +
					cities[this.props.city].code +
					'/EventCalendar/GetEvents?sdate=' +
					new Date().toISOString().substr(0, 19)
			})
				.then((res) => {
					if (res.data && res.data.success) {
						this.setState({
							logged: true
						});
						this.props.loadingStop();
						this.refs.router.history.push('/dashboard');
					} else {
						this.props.logout();
						this.props.loadingStop();
					}
				})
				.catch(() => {
					this.props.logout();
					this.props.loadingStop();
				});
		}
  }
	render() {
		return (
			<div className={
        cn({
          App: true,
          iosPWA: this.state.iosPWA
        })
      }>
				<div className="notch">
					<svg
						width="20px"
						height="20px"
						viewBox="0 0 20 20"
						version="1.1"
						xmlns="http://www.w3.org/2000/svg"
					>
						<path d="M20,0 C8.954305,0 0,8.954305 0,20 L0,0 L20,0 Z" fill="#000000" />
					</svg>
					<svg
						width="20px"
						height="20px"
						viewBox="0 0 20 20"
						version="1.1"
						xmlns="http://www.w3.org/2000/svg"
					>
						<path d="M20,20 C20,8.954305 11.045695,0 1.99840144e-15,0 L20,0 L20,20 Z" fill="#000000" />
					</svg>
				</div>
				<Router ref="router">
					<Switch>
						<Route path="/" exact component={Home} />
						{this.props.user ? (
							<Route path="/dashboard" component={Dashboard} />
						) : (
							<Route path="/dashboard">
								<Redirect to="/" />
							</Route>
						)}
					</Switch>
				</Router>
				<div
					onClick={this.props.dismissNotify}
					className={'notify' + (this.props.message.show ? ' notify-show' : '')}
				>
					{this.props.message.text}
				</div>
				<div className={'loader' + (this.props.loading ? ' loading' : '')}>
					<div className="loader-element" />
				</div>
			</div>
		);
	}
}

const mapDispatchToProps = (dispatch) => {
	return {
		changeLocale: bindActionCreators(changeLocale, dispatch),
		changeTheme: bindActionCreators(changeTheme, dispatch),
		login: bindActionCreators(login, dispatch),
		logout: bindActionCreators(logout, dispatch),
		dismissNotify: bindActionCreators(dismissNotify, dispatch),
		loadingStart: bindActionCreators(loadingStart, dispatch),
		loadingStop: bindActionCreators(loadingStop, dispatch)
	};
};

export default connect((state) => state, mapDispatchToProps)(App);
