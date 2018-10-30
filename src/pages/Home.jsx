import React, { Component } from 'react';
import { connect } from 'react-redux';
import { bindActionCreators } from 'redux';
import cn from 'classnames';
import InputMask from 'react-input-mask';
import { login, changeTheme, changeLocale, logout, notify, loadingStart, loadingStop } from '../actions';
import lang from '../locale.json';
import cities from '../cities.json';
import axios from 'axios';
import config from '../config';
import hb0 from '../assets/heroBack.svg';
import hb1 from '../assets/heroBack1.svg';
import hb2 from '../assets/heroBack2.svg';
import hb3 from '../assets/heroBack3.svg';
import hb4 from '../assets/heroBack4.svg';
import hb5 from '../assets/heroBack5.svg';
import hb6 from '../assets/heroBack6.svg';
import hb7 from '../assets/heroBack7.svg';
import hb8 from '../assets/heroBack8.svg';
import hb9 from '../assets/heroBack9.svg';

const backs = [ hb0, hb1, hb2, hb3, hb4, hb5, hb6, hb7, hb8, hb9 ];

let locale = [ 'RU', 'KZ', 'EN' ];

let culture = {
	0: 'ru-RU',
	1: 'kk-KZ',
	2: 'en-US'
};

const cityToEng = (city) => {
	city = city.split(' ');
	return Translit(city[0]) + ' ' + (city[1] === 'ХБН' ? 'CBD' : 'PhMD');
};

const Translit = (str) => {
	let ru = {
			а: 'a',
			б: 'b',
			в: 'v',
			г: 'g',
			д: 'd',
			е: 'e',
			ё: 'e',
			ж: 'j',
			з: 'z',
			и: 'i',
			к: 'k',
			л: 'l',
			м: 'm',
			н: 'n',
			о: 'o',
			п: 'p',
			р: 'r',
			с: 's',
			т: 't',
			у: 'u',
			ф: 'f',
			х: 'h',
			ц: 'c',
			ч: 'ch',
			ш: 'sh',
			щ: 'shch',
			ы: 'y',
			э: 'e',
			ю: 'u',
			я: 'ya'
		},
		nStr = [];

	str = str.replace(/[ъь]+/g, '').replace(/й/g, 'i');

	for (var i = 0; i < str.length; ++i) {
		nStr.push(
			ru[str[i]] ||
				(ru[str[i].toLowerCase()] === undefined && str[i]) ||
				ru[str[i].toLowerCase()].replace(/^(.)/, function(match) {
					return match.toUpperCase();
				})
		);
	}

	return nStr.join('');
};

const getRandomElement = (arr) => {
	return arr[Math.floor(Math.random() * arr.length)];
};

class Home extends Component {
	constructor(props) {
		super(props);
		this.state = {
			login: '',
			password: '',
			city: this.props.city || 0,
			journal: this.props.journal || 'jko',
			captchaImg: '',
			captcha: '',
			back: getRandomElement(backs)
		};
		this.login = this.login.bind(this);
		this.loadRoles = this.loadRoles.bind(this);
		this.loginWithRole = this.loginWithRole.bind(this);
		this.handleCaptcha = this.handleCaptcha.bind(this);
	}
	login() {
		this.props.loadingStart();
		axios({
			withCredentials: true,
			method: 'POST',
			url:
				config.server +
				cities[this.state.city].code +
				'/Account/Login?lang=' +
				culture[this.props.locale] +
				'&txtUsername=' +
				this.state.login +
				'&txtPassword=' +
				this.state.password + (this.state.captcha ? ('&captchaInput=' + this.state.captcha) : '')
		})
			.then((response) => {
				if (response.data.captchaType === 'Local' && response.data.captchaImg) {
					this.props.notify(response.data.ErrorMessage);
					this.props.loadingStop();
					return this.handleCaptcha(response.data.captchaImg);
				}
				if (response.data.success) {
					this.loadRoles();
				} else {
					this.props.notify(lang[this.props.locale].passError);
					this.props.loadingStop();
				}
			})
			.catch((error) => {
				this.props.notify(lang[this.props.locale].error);
				this.props.loadingStop();
			});
	}
	handleCaptcha(img) {
		this.setState({
			captchaImg: img
		});
	}
	loadRoles() {
		axios({
			withCredentials: true,
			method: 'POST',
			url: config.server + cities[this.state.city].code + '/Account/GetRoles'
		})
			.then((response) => {
				if (response.data.success) {
					this.loginWithRole(response.data.listRole[0].value);
				} else {
					this.props.notify(lang[this.props.locale].error);
					this.props.loadingStop();
				}
			})
			.catch(() => {
				this.props.notify(lang[this.props.locale].error);
			});
	}
	loginWithRole(role) {
		axios({
			withCredentials: true,
			method: 'post',
			url:
				config.server +
				cities[this.state.city].code +
				'/Home/PasswordCheck?password=' +
				this.state.password +
				'&role=' +
				role
		})
			.then((response) => {
				if (response.data.success) {
					this.props.loadingStop();
					this.props.login(this.state.login, this.state.password, this.state.city, this.state.journal, role);
					this.props.history.push('/dashboard');
				} else {
					this.props.notify(lang[this.props.locale].error);
					this.props.loadingStop();
				}
			})
			.catch(() => {
				this.props.notify(lang[this.props.locale].error);
			});
	}
	render() {
		return (
			<div className="Home">
				<div className="Home-login">
					<header>
						<div className="logo">
							<svg
								height={52}
								width={52}
								viewBox="0 0 327 291"
								fill="currentColor"
								version="1.1"
								xmlns="http://www.w3.org/2000/svg"
							>
								<path d="M181.5,2 C261.857431,2 327,67.1420695 327,147.498885 C327,224.193407 267.659918,287.028417 192.387427,292.596573 C180.037028,293.510173 167.460642,292.885438 154.975801,290.585863 C87.2833998,278.117644 36,218.797182 36,147.498885 C36,145.95077 36.0241783,144.408302 36.0721779,142.871839 C25.5375346,139.623894 13.5134753,136.879079 0,134.637394 C6.60068614,131.052842 9.94976688,129.235958 10.0472422,129.186742 C19.5220841,124.402813 29.0076628,122.542084 38.1180571,122.623757 C49.919573,54.1176483 109.623375,2 181.5,2 Z M36.0721779,142.871839 C48.8306355,146.805411 59.4044892,151.47695 67.793739,156.886456 C90.7681039,171.70065 123.170737,190.442873 144.57141,246.083269 C149.680329,259.366136 152.973224,274.757325 154.975801,290.585863 C163.576172,292.16996 172.441413,292.997769 181.5,292.997769 C185.162321,292.997769 188.793039,292.862462 192.387427,292.596573 C188.201358,273.75063 179.689328,253.96611 166.124567,233.455448 C140.734797,195.064727 105.591765,155.917887 140.096002,117.691054 C174.600239,79.4642206 224.60001,114.934612 216.648961,151.083197 C210.030077,181.175235 181.375451,176.484161 174.918705,169.978717 C171.652931,166.688312 173.423466,163.929767 174.918705,164.283455 C176.413945,164.637143 199.89689,156.886456 193.954049,138.093225 C188.011207,119.299994 163.539098,120.716954 151.81755,134.637394 C140.096002,148.557834 148.183226,181.983102 166.124567,192.812988 C184.065907,203.642875 216.648961,203.642875 234.32701,171.861905 C237.457773,166.23353 239.501682,159.959166 240.458736,153.038812 C260.591383,161.86843 276.961069,159.008227 289.567791,144.458202 C296.887572,136.010091 298.867524,128.914671 289.567791,134.637394 C273.608451,144.458202 241.712327,129.164371 234.32701,114.807228 C226.941693,100.450086 208.353591,77.0629313 169.134534,77.0629313 C145.904626,77.0629313 104.736692,100.454287 104.736692,154.06985 C104.736692,154.086365 74.4031224,122.949044 38.1180571,122.623757 C36.9797719,129.231339 36.2871252,135.991388 36.0721779,142.871839 Z" />
							</svg>
						</div>
						<div className="text">
							<div className="title">enis</div>
							<div className="subtitle">{lang[this.props.locale].subtitle}</div>
						</div>
					</header>
					<form
						onSubmit={(e) => {
							e.preventDefault();
							this.login();
						}}
						className="form"
					>
						<div className="field">
							<InputMask
								className="input"
								mask="999999999999"
								maskChar=""
								type="text"
								placeholder={lang[this.props.locale].pin}
								value={this.state.login}
								onChange={(e) => this.setState({ login: e.target.value })}
							/>
						</div>
						<div className="field">
							<input
								className="input"
								type="password"
								placeholder={lang[this.props.locale].password}
								value={this.state.password}
								onChange={(e) => this.setState({ password: e.target.value })}
							/>
						</div>
						<div className="field">
							<select
								value={this.state.city}
								className="input"
								onChange={(e) => this.setState({ city: e.target.value })}
							>
								{cities.map((city) => (
									<option key={city.code} value={city.value}>
										{this.props.locale ? cityToEng(city.label) : city.label}
									</option>
								))}
							</select>
						</div>
						{this.state.captchaImg && (
							<div className="field">
								<img
									style={{
										maxWidth: '100%',
										width: '100%',
										marginTop: 8,
										borderRadius: 4,
										marginBottom: 8,
										boxShadow: '0 4px 16px -2px rgba(0,0,0,.28)'
									}}
									alt="captcha"
									role="img"
									src={'data:image/jpg;base64,' + this.state.captchaImg}
								/>
								<input
									className="input"
									type="text"
									placeholder={lang[this.props.locale].captcha}
									value={this.state.captcha}
									onChange={(e) => this.setState({ captcha: e.target.value })}
								/>
							</div>
						)}
						<div className="field">
							<div className="switcher">
								<div
									onClick={() => this.setState({ journal: 'jko' })}
									className={cn({
										switch: true,
										active: this.state.journal === 'jko'
									})}
								>
									{lang[this.props.locale].jko}
								</div>
								<span className="separator">- {lang[this.props.locale].or} -</span>
								<div
									onClick={() => this.setState({ journal: 'imko' })}
									className={cn({
										switch: true,
										active: this.state.journal === 'imko'
									})}
								>
									{lang[this.props.locale].imko}
								</div>
							</div>
						</div>
						<button className="button">{lang[this.props.locale].login}</button>
					</form>
					<div className="footer">
						<div onClick={this.props.changeLocale} className="locale">
							{locale[this.props.locale]}
						</div>
						<div onClick={this.props.changeTheme} className="theme">
							<svg fill="currentColor" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512">
								<path d="M401.4 354.2c-2.9.1-5.8.2-8.7.2-47.9 0-93-18.9-126.8-53.4-33.9-34.4-52.5-80.1-52.5-128.8 0-27.7 6.1-54.5 17.5-78.7 3.1-6.6 9.3-16.6 13.6-23.4 1.9-2.9-.5-6.7-3.9-6.1-6 .9-15.2 2.9-27.7 6.8C135.1 95.5 80 168.7 80 255c0 106.6 85.1 193 190.1 193 58 0 110-26.4 144.9-68.1 6-7.2 11.5-13.8 16.4-21.8 1.8-3-.7-6.7-4.1-6.1-8.5 1.7-17.1 1.8-25.9 2.2z" />
							</svg>
						</div>
					</div>
				</div>
				<div
					style={{
						backgroundImage: 'url(' + this.state.back + ')'
					}}
					className="Home-hero"
					onClick={() => this.setState({ back: getRandomElement(backs) })}
				/>
			</div>
		);
	}
}

const mapDispatchToProps = (dispatch) => {
	return {
		login: bindActionCreators(login, dispatch),
		changeTheme: bindActionCreators(changeTheme, dispatch),
		changeLocale: bindActionCreators(changeLocale, dispatch),
		logout: bindActionCreators(logout, dispatch),
		notify: bindActionCreators(notify, dispatch),
		loadingStart: bindActionCreators(loadingStart, dispatch),
		loadingStop: bindActionCreators(loadingStop, dispatch)
	};
};

export default connect((state) => state, mapDispatchToProps)(Home);
