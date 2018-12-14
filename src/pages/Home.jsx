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

const findGetParameter = (parameterName) => {
	let result = null,
		tmp = [];
	window.location.search.substr(1).split('&').forEach((item) => {
		tmp = item.split('=');
		if (tmp[0] === parameterName) result = decodeURIComponent(tmp[1]);
	});
	return result;
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
			back: getRandomElement(backs),
			modal: false,
			recaptcha: false,
			captchaRes: ''
		};
		this.login = this.login.bind(this);
		this.loadRoles = this.loadRoles.bind(this);
		this.loginWithRole = this.loginWithRole.bind(this);
		this.handleCaptcha = this.handleCaptcha.bind(this);
	}
	componentWillMount() {
		if (
			findGetParameter('gRecaptchaResponse') &&
			findGetParameter('pin') &&
			findGetParameter('pass') &&
			findGetParameter('city')
		) {
			this.props.loadingStart();
			this.setState({
				login: findGetParameter('pin'),
				password: findGetParameter('pass'),
				city: findGetParameter('city'),
				journal: findGetParameter('journal')
			});
			axios({
				withCredentials: true,
				method: 'POST',
				url:
					config.server +
					cities[findGetParameter('city')].code +
					'/Account/Login?lang=' +
					culture[this.props.locale] +
					'&txtUsername=' +
					findGetParameter('pin') +
					'&txtPassword=' +
					findGetParameter('pass') +
					`&g-recaptcha-response=` +
					findGetParameter('gRecaptchaResponse')
			})
				.then((response) => {
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
	}
	login() {
		if (!this.state.login) {
			return this.props.notify(lang[this.props.locale].pinInput);
		}
		if (!this.state.password) {
			return this.props.notify(lang[this.props.locale].passInput);
		}
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
				this.state.password +
				(this.state.captcha ? '&captchaInput=' + this.state.captcha : '') +
				(this.state.recaptcha
					? `&g-recaptcha-response=` + document.getElementById('g-recaptcha-response').value
					: '')
		})
			.then((response) => {
				if (response.data.captchaType === 'Local' && response.data.captchaImg) {
					this.props.notify(response.data.ErrorMessage);
					this.props.loadingStop();
					return this.handleCaptcha(response.data.captchaImg);
				} else if (response.data.captchaType === 'Recaptcha') {
					window.location.href =
						config.captcha +
						'?pin=' +
						this.state.login +
						'&pass=' +
						this.state.password +
						'&city=' +
						this.state.city +
						'&theme=' +
						(this.props.theme ? 'dark' : 'white') +
						'&journal=' +
						this.state.journal +
						'&origin=' +
						window.location.host;
				}
				this.setState({
					dialog: false
				});
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
			captchaImg: img,
			recaptcha: false
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
					if (response.data.listRole[0]) {
						this.loginWithRole(response.data.listRole[0].value);
					} else {
						this.loginWithRole('Student');
					}
				} else {
					this.props.notify(lang[this.props.locale].error);
					this.props.loadingStop();
				}
			})
			.catch(() => {
				this.props.notify(lang[this.props.locale].error);
				this.props.loadingStop();
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
									aria-label="Captcha"
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
						<div className="footer-wrap">
							<div onClick={this.props.changeLocale} className="locale">
								{locale[this.props.locale]}
							</div>
							<a href="http://vk.com/enis_app" target="_blank" rel="noopener noreferrer">
								<svg role="img" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
									<title>VK icon</title>
									<path d="M11.701 18.771h1.437s.433-.047.654-.284c.21-.221.21-.63.21-.63s-.031-1.927.869-2.21c.887-.281 2.012 1.86 3.211 2.683.916.629 1.605.494 1.605.494l3.211-.044s1.682-.105.887-1.426c-.061-.105-.451-.975-2.371-2.76-2.012-1.861-1.742-1.561.676-4.787 1.469-1.965 2.07-3.166 1.875-3.676-.166-.48-1.26-.361-1.26-.361l-3.602.031s-.27-.031-.465.09c-.195.119-.314.391-.314.391s-.572 1.529-1.336 2.82c-1.623 2.729-2.268 2.879-2.523 2.699-.604-.391-.449-1.58-.449-2.432 0-2.641.404-3.75-.781-4.035-.39-.091-.681-.15-1.685-.166-1.29-.014-2.378.01-2.995.311-.405.203-.72.652-.539.675.24.03.779.146 1.064.537.375.506.359 1.636.359 1.636s.211 3.116-.494 3.503c-.495.262-1.155-.28-2.595-2.756-.735-1.26-1.291-2.67-1.291-2.67s-.105-.256-.299-.406c-.227-.165-.557-.225-.557-.225l-3.435.03s-.51.016-.689.24c-.166.195-.016.615-.016.615s2.686 6.287 5.732 9.453c2.79 2.902 5.956 2.715 5.956 2.715l-.05-.055z" />
								</svg>
							</a>
							<div onClick={this.props.changeTheme} className="theme">
								<svg fill="currentColor" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512">
									<path d="M401.4 354.2c-2.9.1-5.8.2-8.7.2-47.9 0-93-18.9-126.8-53.4-33.9-34.4-52.5-80.1-52.5-128.8 0-27.7 6.1-54.5 17.5-78.7 3.1-6.6 9.3-16.6 13.6-23.4 1.9-2.9-.5-6.7-3.9-6.1-6 .9-15.2 2.9-27.7 6.8C135.1 95.5 80 168.7 80 255c0 106.6 85.1 193 190.1 193 58 0 110-26.4 144.9-68.1 6-7.2 11.5-13.8 16.4-21.8 1.8-3-.7-6.7-4.1-6.1-8.5 1.7-17.1 1.8-25.9 2.2z" />
								</svg>
							</div>
						</div>
						{window.location.host !== 'nisapp.kz' ? (
							<div className="powered">
								Powered by{' '}
								<a href="https://hyperhost.ua" target="_blank" rel="noopener noreferrer">
									hyperhost
								</a>
							</div>
						) : null}
					</div>
				</div>
				<div
					style={{
						backgroundImage: 'url(' + this.state.back + ')'
					}}
					className="Home-hero"
					onClick={() => this.setState({ back: getRandomElement(backs) })}
				/>
				<div className={'info-modal' + (this.state.modal ? ' active' : '')}>
					<div onClick={() => this.setState({ modal: false })} className="info-modal__backdrop" />
					<div className="info-modal__content">
						<div className="info-modal__content__back">
							<svg viewBox="0 0 37 36" version="1.1" xmlns="http://www.w3.org/2000/svg">
								<g>
									<path d="M18,9.1714847 L18,0.00545880862 C18.1597211,0.00154961008 18.319733,-0.00026542547 18.48,3.12701117e-05 C23.9292066,-0.00923642021 29.0958644,2.42364293 32.56,6.63003127 L36.63,2.60003127 L36.63,17.2000313 C36.65,17.4600313 36.65,17.7200313 36.65,17.9700313 L36.65,17.9800313 C33.87,17.9300313 27.11,17.9500313 21.13,17.9800313 L25.85,13.2800313 C24.3570559,10.9646091 21.8669256,9.48089101 19.12,9.27003127 C18.97,9.20003127 18.75,9.17003127 18.47,9.17003127 C18.3129913,9.16596213 18.1562632,9.16646637 18,9.1714847 Z" />
									<path
										d="M9.24575258,18 L2.51930085e-05,18 C0.00908614751,12.5886301 2.46188859,7.46250256 6.68563668,4.06 L2.60563668,0.02 L17.3356367,0.02 C17.5956367,3.55271368e-14 17.8556367,3.55271368e-14 18.1156367,0 C18.0756367,2.76 18.0856367,9.46 18.1156367,15.4 L13.3856367,10.71 C11.06179,12.1758489 9.56471642,14.6512082 9.34563668,17.39 C9.27815937,17.5345942 9.24785093,17.7349418 9.24575404,18 Z M7.58270617,32 L7.18563668,32.39 C7.01567633,32.2627078 6.84833552,32.1326795 6.68365766,32 L7.58270617,32 Z"
										opacity="0.75"
									/>
									<path
										d="M0,18.01 C0,18.26 0,18.52 0.02,18.78 L0.02,33.38 L4.09,29.35 C7.55413561,33.5563883 12.7207934,35.9892677 18.17,35.98 C23.8442299,35.9905045 29.1987002,33.3539455 32.65,28.85 L25.98,22.15 C25.327103,23.3529395 24.4026098,24.3870023 23.28,25.17 C21.8152166,26.279291 20.0168045,26.8576039 18.18,26.81 C17.9,26.81 17.68,26.78 17.53,26.71 C14.7830744,26.4991403 12.2929441,25.0154222 10.8,22.7 L15.53,18 C9.54,18.03 2.78,18.05 0,18"
										opacity="0.5"
									/>
								</g>
							</svg>
						</div>

						<div className="info-modal__content__inner">
							<h2>Упс...</h2>
							<p>
								Привет, если ты видишь это сообщение, то значит тебе нужно войти один раз через{' '}
								<a href={config.server + cities[this.state.city].code}>оригинальный клиент</a>
							</p>
						</div>
					</div>
				</div>
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
