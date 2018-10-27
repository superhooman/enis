import React, { Component } from 'react';
import { connect } from 'react-redux';
import { bindActionCreators } from 'redux';
import cn from 'classnames';
import { Route } from 'react-router-dom';
import { login, logout, notify, loadingStart, loadingStop, changeLocale, changeTheme } from '../actions';
import cities from '../cities.json';
import config from '../config';
import lang from '../locale.json';
import axios from 'axios';
import './Dashboard.css';
import CustomScroll from 'react-custom-scroll';
import 'react-custom-scroll/dist/customScroll.css';

let locale = [ 'RU', 'KZ', 'EN' ];

const stripHTMLTags = (str) => {
	if (str === null || str === '') return ' ';
	else str = str.toString();
	var out = str.replace(/<style>[^>]*<\/style>/g, ' ').replace(/<w[^>]*>[^>]*<\/w[^>]*>/gi, ' ');
	return urlify(out.replace(/<[^>]*>/g, ' '));
};

const urlify = (text) => {
	var urlRegex = /(https?:\/\/[^\s]+)/g;
	return text.replace(urlRegex, (url) => {
		return '<a href="' + url + '">' + url + '</a>';
	});
};

const timeConv = (data) => {
	if (data != null) {
		var date = data.split('T')[0];
		return date.split('-')[2] + '.' + date.split('-')[1] + '.' + date.split('-')[0];
	} else {
		return '&ensp; &ensp;';
	}
};

const getStatus = (status) => {
	if (status === 'Достиг' || status === 'Жетті') {
		return 'status ok';
	} else if (status === 'Стремится' || status === 'Тырысады') {
		return 'status bad';
	} else {
		return 'status';
	}
};

const getGoalText = (status, locale) => {
	if (status === 'Достиг' || status === 'Жетті') {
		return lang[locale].achieved;
	} else if (status === 'Стремится' || status === 'Тырысады') {
		return lang[locale].wt;
	} else {
		return;
	}
};

const getIcon = (format) => {
	switch (format) {
		case 'doc':
		case 'docx':
			return 'M23.999 3.733V20.28c0 .141-.05.255-.149.346-.101.094-.221.138-.36.138h-8.559v-2.295h6.982v-1.045h-6.988v-1.279h6.982v-1.044H14.93v-1.29h6.98v-1.032h-6.98v-1.293h6.98v-1.044h-6.98V9.163h6.98V8.12h-6.98V6.815h6.98v-.994h-6.98V3.228h8.562c.149 0 .27.048.358.149.105.099.15.22.149.356zM13.65.641v22.722L0 21.001V3.067L13.65.637v.004zm-2.06 6.708l-1.709.105-1.096 6.785H8.76c-.054-.321-.255-1.445-.615-3.367l-.639-3.263-1.604.08-.642 3.183c-.375 1.854-.584 2.933-.639 3.236h-.015l-.975-6.25-1.47.078 1.575 7.883 1.634.105.615-3.068c.36-1.8.57-2.846.615-3.132h.045c.061.305.256 1.374.615 3.21l.615 3.158 1.77.105 1.98-8.85h-.035z';
		case 'pptx':
		case 'ppt':
			return 'M23.484 4h-8.542v3.186c.515-.39 1.132-.588 1.855-.588v3.098h3.074c-.015.869-.315 1.602-.901 2.193-.584.592-1.318.896-2.188.916-.675-.02-1.29-.223-1.829-.615v2.129h6.719v1.045h-6.721v1.293h6.715v1.032h-6.719v2.34h8.543c.346 0 .51-.182.51-.537V4.51c0-.342-.164-.51-.51-.51h-.006zM17.28 9.186V6.062c.87.02 1.6.322 2.188.91.586.588.891 1.326.906 2.214H17.28zm-9.024.052c-.053-.201-.14-.357-.263-.472-.12-.112-.282-.194-.483-.246-.225-.061-.457-.09-.69-.09l-.72.014v2.999h.026c.261.016.535.016.825 0 .285-.015.555-.09.809-.225.313-.225.5-.525.561-.914.06-.391.039-.766-.064-1.111v.045zM0 3.059v17.946l13.688 2.365V.63L0 3.059zm10.213 8.087c-.375.869-.935 1.425-1.684 1.665-.749.239-1.558.332-2.429.279v3.422l-1.801-.209V6.901l2.859-.149c.53-.033 1.054.025 1.566.18.515.152.922.459 1.223.922.3.461.469.996.51 1.605.037.609-.043 1.172-.244 1.687z';
		case 'pdf':
			return 'M23.598 15.368c-.71-.76-2.164-1.197-4.224-1.197-1.1 0-2.375.11-3.76.37-.782-.77-1.562-1.67-2.307-2.72-.53-.74-.993-1.52-1.42-2.29.813-2.54 1.206-4.61 1.206-6.1 0-1.672-.603-3.416-2.34-3.416-.533 0-1.066.325-1.35.8-.783 1.408-.43 4.493.917 7.54-.503 1.52-1.035 2.973-1.7 4.605-.578 1.376-1.244 2.794-1.923 4.096C2.793 18.64.267 20.49.03 21.94c-.104.547.074 1.05.457 1.45.133.11.636.545 1.48.545 2.59 0 5.32-4.28 6.707-6.86 1.065-.36 2.13-.687 3.193-1.015 1.168-.323 2.34-.583 3.405-.765 2.735 2.504 5.146 2.9 6.358 2.9 1.492 0 2.024-.617 2.203-1.122.28-.65.07-1.37-.252-1.74l.02.04zm-1.385 1.054c-.104.544-.638.906-1.386.906-.21 0-.39-.037-.603-.072-1.36-.325-2.633-1.016-3.903-2.106 1.25-.214 2.31-.25 2.98-.25.74 0 1.38.032 1.81.144.49.106 1.27.435 1.095 1.38h.02zm-7.523-1.707c-.92.19-1.914.414-2.944.693-.816.223-1.666.474-2.52.77.463-.902.854-1.774 1.208-2.603.428-1.02.78-2.07 1.135-3.046.35.61.74 1.23 1.13 1.78.64.87 1.31 1.7 1.98 2.42v-.02zM10.04 1.23c.145-.29.43-.436.678-.436.745 0 .887.868.887 1.56 0 1.168-.354 2.942-.96 4.967-1.062-2.82-1.135-5.18-.603-6.09zM6.138 18.127C4.328 21.17 2.59 23.06 1.525 23.06c-.21 0-.387-.075-.53-.183-.214-.216-.32-.472-.248-.76.213-1.09 2.236-2.613 5.392-3.99z';
		default:
			return 'M2.759 24l.664-.144c.207-.044.412-.085.619-.126.318-.062.637-.123.955-.182.24-.046.48-.085.721-.129l.055-.015c.25-.044.498-.09.747-.12l1.214-.179V-.001h-.042c-.63.004-1.256.016-1.884.036-.689.018-1.394.06-2.084.105-.299.021-.6.046-.899.07H2.78v23.784L2.759 24zM8.911.015v22.942c.861-.1 1.72-.182 2.582-.246 2.121-.161 4.248-.211 6.373-.151 1.128.034 2.253.099 3.374.192V1.503c-1.004-.229-2.012-.432-3.028-.607-1.968-.342-3.955-.581-5.947-.731C11.151.084 10.032.033 8.913.016h-.002zm10.763 14.797l-.046-.004-.561-.061c-1.399-.146-2.805-.242-4.207-.291-1.407-.045-2.815-.03-4.223.016h-.044c-.045 0-.091 0-.135-.016-.101-.03-.195-.074-.267-.149-.127-.136-.186-.315-.156-.495.008-.061.029-.105.054-.166.027-.044.063-.104.104-.134.043-.045.09-.075.143-.104.061-.03.121-.046.18-.061h.09c.195 0 .391-.016.57-.016 1.395-.029 2.773-.029 4.169.03 1.439.06 2.864.165 4.288.33l.151.015c.044.016.089.016.135.03.105.046.194.105.255.181.044.044.074.104.105.164.029.061.044.12.044.18.015.165-.044.33-.164.45-.046.046-.091.075-.135.105-.047.03-.105.044-.166.06-.03.016-.045.016-.089.016h-.047l-.048-.08zm.035-2.711c-.044 0-.044 0-.09-.006l-.555-.071c-1.395-.179-2.804-.3-4.198-.359-1.395-.075-2.805-.09-4.214-.06l-.046-.016c-.045-.015-.09-.015-.135-.029-.09-.03-.194-.09-.254-.166-.03-.045-.076-.104-.09-.148-.075-.166-.075-.361.014-.525.031-.061.061-.105.105-.15s.09-.09.15-.104c.061-.03.119-.06.18-.06l.09-.016.585-.015c1.396-.016 2.774.015 4.153.09 1.439.075 2.865.21 4.289.39l.149.016.091.014c.105.031.194.075.27.166.12.119.18.284.165.449 0 .061-.016.121-.045.165-.029.06-.061.104-.09.15-.03.044-.074.075-.136.12-.044.029-.104.045-.164.061l-.091.014H19.8l-.091.09zm0-2.711c-.044 0-.044 0-.09-.006l-.555-.08c-1.395-.19-2.789-.334-4.198-.428-1.395-.092-2.805-.135-4.214-.129h-.046l-.09-.016c-.059-.016-.104-.036-.164-.068-.15-.092-.256-.254-.285-.438 0-.061 0-.12.016-.18.014-.061.029-.117.059-.17.031-.054.076-.102.121-.144.074-.075.18-.126.285-.15.045-.011.089-.015.135-.015h.569c1.439.009 2.879.064 4.304.172 1.395.105 2.774.26 4.153.457l.15.021c.046.007.061.007.09.019.06.02.12.046.165.08.061.033.104.075.135.123.031.048.061.101.09.158.062.156.045.334-.029.479-.029.055-.061.105-.105.146-.075.074-.164.127-.27.15-.029.012-.046.012-.091.014l-.044.005h-.091zm0-2.712c-.044 0-.044 0-.09-.007l-.555-.09c-1.395-.225-2.789-.391-4.198-.496-1.395-.119-2.805-.179-4.214-.209h-.046l-.105-.014c-.061-.015-.115-.045-.165-.074-.053-.031-.099-.076-.14-.121-.036-.045-.068-.104-.094-.149-.02-.06-.037-.12-.044-.181-.016-.18.053-.371.181-.494.074-.075.176-.125.279-.15.045-.015.09-.015.135-.015.189 0 .38.005.57.008 1.437.034 2.871.113 4.304.246 1.387.119 2.77.3 4.145.524l.135.016c.04 0 .052 0 .09.014.062.016.112.046.165.076.046.029.09.074.125.119.091.135.135.301.105.465-.015.061-.031.105-.061.166-.03.045-.074.104-.12.135-.074.074-.165.119-.271.149h-.135l.004.082zm-15.67-.509c-.09 0-.181-.021-.271-.063-.194-.095-.314-.293-.329-.505 0-.057.015-.111.03-.165.014-.068.045-.133.09-.19.045-.065.104-.12.164-.162.077-.05.167-.076.241-.092l.48-.044c.659-.058 1.305-.105 1.949-.144h.06c.105.004.195.024.271.071.194.103.314.305.314.519 0 .055-.015.109-.029.161-.016.067-.045.132-.091.189-.044.075-.104.12-.165.165-.074.045-.15.074-.24.09-.104.015-.209.015-.314.03-.136.015-.286.015-.436.031l-1.168.088-.285.031c-.061.015-.122.015-.196.015l-.075-.025zm15.655-2.201l-.091-.01-.554-.1c-1.395-.234-2.805-.425-4.214-.564-1.395-.138-2.804-.225-4.214-.271h-.045l-.09-.018c-.061-.015-.105-.038-.165-.071-.045-.03-.091-.072-.135-.121-.12-.138-.165-.33-.12-.506.016-.061.045-.12.074-.18.031-.061.076-.105.121-.15.074-.076.18-.121.285-.15.045-.015.089-.015.135-.015l.584.015c1.395.061 2.774.15 4.154.301 1.439.148 2.864.359 4.288.6l.15.014c.046 0 .061 0 .09.016.06.015.12.045.165.074.135.105.225.256.239.421.016.06 0 .12-.015.181 0 .059-.029.119-.059.164-.031.045-.062.09-.105.135-.076.076-.181.12-.286.135l-.086.014h-.046l-.06.086zM4.022 3.199c-.086 0-.171-.019-.25-.056-.07-.033-.134-.079-.187-.137-.045-.053-.086-.112-.111-.181-.02-.049-.034-.101-.039-.156-.022-.214.078-.427.255-.546.078-.054.167-.086.26-.099.158-.014.314-.014.473-.029.65-.045 1.301-.075 1.949-.105h.048c.091.016.181.03.256.075.179.105.3.315.3.524 0 .061-.016.121-.03.166-.03.074-.06.135-.104.195-.047.06-.107.12-.182.15-.075.045-.165.075-.255.075-.104.014-.21.014-.33.014l-.449.031c-.405.029-.795.045-1.186.074l-.3.016c-.075.015-.134.015-.194.015l.076-.026z';
	}
};

const getGoals = (data, locale) => {
	var groups = [];
	for (var i in data) {
		if (groups[data[i].GroupIndex] === undefined) {
			groups.push({ name: data[i].GroupName, goals: [] });
		}
		groups[data[i].GroupIndex].goals.push(data[i]);
	}
	return (
		<div>
			{groups.map((group, index) => (
				<div key={index} className="goals-group">
					<h3 className="title">{group.name}</h3>
					{group.goals.map((goal) => (
						<div key={goal.Id} className="goal">
							<div className="info">
								<span className="goal-name">{goal.Name}</span>
								{goal.Changed ? <span className="date">{timeConv(goal.Changed)}</span> : ''}
								<span className={getStatus(goal.Value)}>{getGoalText(goal.Value, locale)}</span>
							</div>
							<div className="goal-content">{goal.Description}</div>
							{goal.comment ? <div className="comment">{goal.Comment}</div> : ''}
						</div>
					))}
				</div>
			))}
		</div>
	);
};

class Dashboard extends Component {
	constructor(props) {
		super(props);
		this.state = {
			childID: 0,
			periodID: 0,
			loaded: false,
			childList: [],
			user: props.user,
			jko: null,
			id: 0,
			klass: 0,
			childMenu: false,
			title: '',
			shown: false,
			scrolled: window.scrollY > 0
		};
		this.classes = [];
		this.data = [];
		this.onScroll = this.onScroll.bind(this);
	}
	componentDidMount() {
		setTimeout(() => this.setState({ shown: true }), 2500);
		if (this.state.user.role === 'Student') {
			this.props.loadingStart();
			this.getClasses();
		} else if (this.state.user.role === 'Parent') {
			this.props.loadingStart();
			this.getClasses();
		}
		window.addEventListener('scroll', this.onScroll);
	}
	componentWillUnmount() {
		window.removeEventListener('scroll', this.onScroll);
	}
	onScroll() {
		this.setState({ scrolled: window.scrollY > 0 });
	}
	getClasses() {
		axios({
			withCredentials: true,
			method: 'post',
			url: config.server + cities[this.props.city].code + '/ImkoDiary/Klasses/'
		}).then((response) => {
			if (response.data.success) {
				this.classes = response.data.data;
				this.getChildren();
			} else {
				this.props.logout();
				this.props.loadingStop();
			}
		});
	}
	getChildren() {
		this.classes.map((klass) => {
			axios({
				withCredentials: true,
				method: 'post',
				url: config.server + cities[this.props.city].code + '/ImkoDiary/Students/?klassId=' + klass.Id
			})
				.then((response) => {
					if (response.data && response.data.success) {
						let childList = this.state.childList;
						for (let i in response.data.data) {
							response.data.data[i].klass = klass.Id;
						}
						childList = childList.concat(response.data.data);
						this.setState({
							childList
						});
						if (this.state.user.journal === 'imko') {
							this.getPeriod();
						} else if (this.state.user.journal === 'jko') {
							this.getPeriod();
						}
					}else{
                        this.props.logout();
					this.props.loadingStop();
                    }
				})
				.catch((err) => {
					this.props.logout();
					this.props.loadingStop();
				});
			return true;
		});
	}
	getPeriod() {
		axios({
			withCredentials: true,
			method: 'post',
			url: config.server + cities[this.props.city].code + '/JCEDiary/Periods/'
		}).then((res) => {
			if (res.data && res.data.success) {
				this.periodsData = res.data.data;
				if (this.state.user.journal === 'imko') {
					this.getIMKO(this.state.childList[0].Id);
				} else {
					this.getUrl(0);
				}
			}
		});
	}
	getUrl(child) {
		axios({
			withCredentials: true,
			method: 'POST',
			url:
				config.server +
				cities[this.props.city].code +
				'/JceDiary/GetDiaryUrl/?lang=ru-RU&klassId=' +
				this.state.childList[child].klass +
				'&periodId=' +
				this.periodsData[0].Id +
				'&studentId=' +
				this.state.childList[child].Id
		})
			.then((response) => {
				axios({
					withCredentials: true,
					method: 'POST',
					url: config.server + response.data.data.split('nis.edu.kz/')[1]
				})
					.then((response) => {
						this.getJKOFinal(child);
					})
					.catch((err) => {
						this.props.notify('Ошибка');
					});
			})
			.catch((err) => {
				this.props.notify('Ошибка');
			});
	}
	getJKOFinal(child) {
		axios({
			withCredentials: true,
			method: 'POST',
			url: config.server + cities[this.props.city].code + '/jce/Diary/GetSubjects?page=1&start=0&limit=25'
		})
			.then((response) => {
				if (response.data.success) {
					let data = {};
					data[child] = { data: { 0: { data: response.data.data } } };
					this.data = data;
					this.setState({
						refreshing: false,
						periodID: 0,
						child: child,
						loaded: true
					});
					this.props.loadingStop();
				} else {
					this.props.loadingStop();
					this.props.notify(response.data.message);
				}
			})
			.catch((err) => {
				this.props.loadingStop();
				this.props.notify('Ошибка');
			});
	}
	getIMKO(studentId) {
		axios({
			withCredentials: true,
			method: 'post',
			url:
				config.server +
				cities[this.props.city].code +
				'/ImkoDiary/Subjects?periodId=' +
				this.periodsData[0].Id +
				(studentId ? '&studentId=' + studentId : '')
		}).then((response) => {
			if (response.data.success) {
				this.props.loadingStop();
				this.data = { 0: { data: { 0: { data: response.data.data } } } };
				this.setState({
					loaded: true
				});
			} else {
				this.props.logout();
			}
		});
	}
	loadQuarter(id, child) {
		if (this.data[child] && this.data[child].data[id]) {
			this.setState({
				periodID: id,
				childID: child,
				childMenu: false
			});
		} else {
			this.props.loadingStart();
			if (this.state.user.journal === 'imko') {
				axios({
					withCredentials: true,
					method: 'post',
					url:
						config.server +
						cities[this.props.city].code +
						'/ImkoDiary/Subjects?periodId=' +
						this.periodsData[id].Id +
						(this.state.user.role === 'Parent' ? '&studentId=' + this.state.childList[child].Id : '')
				}).then((response) => {
					if (response.data.success) {
						if (!this.data[child]) {
							this.data[child] = {};
							this.data[child].data = {};
						}
						this.data[child].data[id] = { data: response.data.data };
						this.setState({
							periodID: id,
							childID: child,
							childMenu: false
						});
						this.props.loadingStop();
					}
				});
			} else if (this.state.user.journal === 'jko') {
				axios({
					withCredentials: true,
					method: 'post',
					url:
						config.server +
						cities[this.props.city].code +
						'/JceDiary/GetDiaryUrl/?klassId=' +
						this.state.childList[child].klass +
						'&periodId=' +
						this.periodsData[id].Id +
						'&studentId=' +
						this.state.childList[child].Id
				}).then((response) => {
					axios({
						withCredentials: true,
						method: 'post',
						url: config.server + response.data.data.split('nis.edu.kz/')[1]
					}).then((response) => {
						axios({
							withCredentials: true,
							method: 'post',
							url:
								config.server +
								cities[this.props.city].code +
								'/jce/Diary/GetSubjects?page=1&start=0&limit=25'
						})
							.then((response) => {
								if (response.data.success) {
									if (!this.data[child]) {
										this.data[child] = {};
										this.data[child].data = {};
									}
									this.data[child].data[id] = { data: response.data.data };
									this.setState({
										periodID: id,
										childID: child,
										childMenu: false
									});
									this.props.loadingStop();
								} else {
									this.props.notify(response.data.message);
									this.props.loadingStop();
								}
							})
							.catch((err) => {
								this.props.loadingStop();
								this.props.notify('Ошибка');
							});
					});
				});
			}
		}
	}
	render() {
		return (
			<div className="Dashboard">
				<Route
					path="/dashboard"
					exact
					render={() => (
						<div
							className={cn({
								shown: this.state.shown,
								scrolled: this.state.scrolled
							})}
						>
							<div className="appbar">
								<div className="appbar-wrap">
									<div className="header">
										<h1>Dashboard</h1>
									</div>
									{this.state.loaded && this.state.user.role === 'Parent' ? (
										<div className="child-select">
											<div
												onClick={() =>
													this.setState({
														childMenu: true
													})}
												className="child-select__selected"
											>
												<span>{this.state.childList[this.state.childID].Name}</span>
												<svg
													fill="currentColor"
													height={18}
													xmlns="http://www.w3.org/2000/svg"
													viewBox="0 0 512 512"
												>
													<path d="M147.6 210.7c-7.5 7.5-7.5 19.8 0 27.3l95.7 95.4c7.3 7.3 19.1 7.5 26.6.6l94.3-94c3.8-3.8 5.7-8.7 5.7-13.7 0-4.9-1.9-9.9-5.6-13.6-7.5-7.5-19.7-7.6-27.3 0l-81 79.8-81.1-81.9c-7.5-7.5-19.7-7.5-27.3.1z" />
													<path d="M48 256c0 114.9 93.1 208 208 208s208-93.1 208-208S370.9 48 256 48 48 141.1 48 256zm332.4-124.4C413.7 164.8 432 209 432 256s-18.3 91.2-51.6 124.4C347.2 413.7 303 432 256 432s-91.2-18.3-124.4-51.6C98.3 347.2 80 303 80 256s18.3-91.2 51.6-124.4C164.8 98.3 209 80 256 80s91.2 18.3 124.4 51.6z" />
												</svg>
											</div>
										</div>
									) : null}
									{this.state.loaded && (
										<div className="period-select">
											{[ 0, 1, 2, 3 ].map((el) => (
												<div
													key={el}
													onClick={() => this.loadQuarter(el, this.state.childID)}
													className={
														'period-select__quarter' +
														(el === this.state.periodID ? ' selected' : '')
													}
												>
													{el + 1 + ' ' + lang[this.props.locale].quarter}
												</div>
											))}
											<div
												style={{
													marginLeft: this.state.periodID * 25 + '%'
												}}
												className="bar"
											/>
										</div>
									)}
								</div>
							</div>
							{this.state.loaded &&
								(this.state.user.journal === 'imko' ? (
									<div className="subjects">
										{this.data[this.state.childID].data[
											this.state.periodID
										].data.map((subject, index) => (
											<div
												key={subject.Id}
												onClick={() => this.props.history.push('/dashboard/' + index)}
												style={{
													animationDelay: index * 0.1 + 's'
												}}
												className={
													'subject imko clickable' +
													(subject.ApproveCnt / subject.Cnt * 70 +
														(subject.MaxISA ? subject.ApproveISA / subject.MaxISA : 1) *
															30 >=
													91.75
														? ' five'
														: ' oops')
												}
											>
												<div className="grade">
													<div className="value">
														{subject.Period ? subject.Period : 'N/A'}
													</div>
												</div>
												<h2 className="title">{subject.Name}</h2>

												<div className="subject-info">
													<div className="progress">
														<div
															style={{
																width:
																	subject.MaxISA !== 0
																		? 'calc(' +
																			(subject.ApproveCnt / subject.Cnt * 60 + 10) +
																			'% - 5px)'
																		: subject.ApproveCnt / subject.Cnt * 90 +
																			10 +
																			'%'
															}}
															className={
																'bar fa ' +
																(subject.ApproveCnt / subject.Cnt > 0.66
																	? 'ok'
																	: subject.ApproveCnt / subject.Cnt > 0.33
																		? 'norm'
																		: 'bad')
															}
														>
															{subject.ApproveCnt +
																'/' +
																subject.Cnt +
																' ' +
																lang[this.props.locale].fa}
														</div>
														{subject.MaxISA !== 0 ? (
															<div
																style={{
																	width:
																		subject.MaxISA !== 0
																			? subject.ApproveISA / subject.MaxISA * 20 +
																				10 +
																				'%'
																			: 0
																}}
																className={
																	'bar sa ' +
																	(subject.ApproveISA / subject.MaxISA > 0.66
																		? 'ok'
																		: subject.ApproveISA / subject.MaxISA > 0.33
																			? 'norm'
																			: 'bad')
																}
															>
																{subject.MaxISA !== 0 ? (
																	subject.ApproveISA +
																	'/' +
																	subject.MaxISA +
																	' ' +
																	lang[this.props.locale].sa
																) : (
																	''
																)}
															</div>
														) : null}
													</div>
												</div>
											</div>
										))}
									</div>
								) : (
									<div className="subjects">
										{this.data[this.state.childID].data[
											this.state.periodID
										].data.map((subject, index) => (
											<div
												key={subject.Name}
												onClick={() => {
													if (subject.Evalutions.length > 0) {
														this.props.history.push('/dashboard/' + index);
													}
												}}
												style={{
													animationDelay: index * 0.1 + 's'
												}}
												className={
													'subject jko' +
													(subject.Evalutions.length ? ' clickable' : '') +
													(subject.Score.toFixed(2) >= 85 ? ' five' : '')
												}
											>
												<div className="grade">
													<div className="value">
														{subject.Evalutions.length ? subject.Mark ? (
															subject.Mark
														) : (
															'N/A'
														) : (
															'N/A'
														)}
													</div>
													{subject.Score !== 0 ? (
														<div className="percentage">
															{subject.Score.toFixed(2) + '%'}
														</div>
													) : null}
												</div>
												<div className="subject-info">
													{subject.Score !== 0 ? (
														<div
															style={{ animationDelay: 0.4 + index * 0.2 + 's' }}
															className="progress"
														>
															<div
																style={{
																	width:
																		subject.Score !== 0
																			? subject.Score + '%'
																			: '100%'
																}}
																className={
																	'bar jko ' +
																	(subject.Score > 66
																		? 'ok'
																		: subject.Score > 33 ? 'norm' : 'bad')
																}
															/>
														</div>
													) : null}
													<h2 className="title">{subject.Name}</h2>
												</div>
											</div>
										))}
									</div>
								))}
							<div className={'child-modal' + (this.state.childMenu ? ' active' : '')}>
								<div
									onClick={() => this.setState({ childMenu: false })}
									className="child-modal__backdrop"
								/>
								<div className="child-modal__menu">
									{this.state.childList.map((el, i) => (
										<div
											key={i}
											onClick={() => {
												this.loadQuarter(this.state.periodID, i);
											}}
											className={
												'child-select__child' + (i === this.state.childID ? ' selected' : '')
											}
										>
											{el.Name}
										</div>
									))}
								</div>
							</div>
						</div>
					)}
				/>
				<Route
					path="/dashboard/:subjectID"
					render={({ match, history }) => (
						<SubjectPage
							match={match}
							history={history}
							periodsData={this.periodsData}
							data={this.data}
							app={this.props}
							state={this.state}
						/>
					)}
				/>
				<div className="footer">
					<div onClick={this.props.changeLocale} className="locale">
						{locale[this.props.locale]}
					</div>
					<div onClick={this.props.logout} className="locale">
						{lang[this.props.locale].logout}
					</div>
					<div onClick={this.props.changeTheme} className="theme">
						<svg fill="currentColor" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512">
							<path d="M401.4 354.2c-2.9.1-5.8.2-8.7.2-47.9 0-93-18.9-126.8-53.4-33.9-34.4-52.5-80.1-52.5-128.8 0-27.7 6.1-54.5 17.5-78.7 3.1-6.6 9.3-16.6 13.6-23.4 1.9-2.9-.5-6.7-3.9-6.1-6 .9-15.2 2.9-27.7 6.8C135.1 95.5 80 168.7 80 255c0 106.6 85.1 193 190.1 193 58 0 110-26.4 144.9-68.1 6-7.2 11.5-13.8 16.4-21.8 1.8-3-.7-6.7-4.1-6.1-8.5 1.7-17.1 1.8-25.9 2.2z" />
						</svg>
					</div>
				</div>
			</div>
		);
	}
}

class SubjectPage extends Component {
	constructor(props) {
		super(props);
		this.state = {
			data: props.data,
			goalsElement: null,
			title: '',
			modalElement: null,
			modal: false
		};
		this.getRubric = this.getRubric.bind(this);
	}
	componentWillMount() {
		if (Object.keys(this.props.data).length) {
			let subject = this.props.data[this.props.state.childID].data[this.props.state.periodID].data[
				this.props.match.params.subjectID
			];
			if (subject) {
				this.setState({ title: subject.Name });
				if (this.props.app.user.journal === 'imko') {
					this.getGoalIMKO(subject);
				} else {
					this.getGoalJKO(subject);
				}
			}
		} else {
			this.props.history.push('/dashboard');
		}
	}
	getGoalIMKO(subject) {
		this.props.app.loadingStart();
		console.log(this.props.state.childList);
		let studentId =
			this.props.app.user.role === 'Parent' ? this.props.state.childList[this.props.state.childID].Id : null;
		axios({
			withCredentials: true,
			method: 'post',
			url:
				config.server +
				cities[this.props.app.city].code +
				'/ImkoDiary/Goals/?periodId=' +
				this.props.periodsData[this.props.state.periodID].Id +
				'&subjectId=' +
				subject.Id +
				'&studentId=' +
				studentId
		})
			.then((response) => {
				if (response.data.success) {
					let goals = response.data.data.goals;
					let homework = response.data.data.homeworks;
					this.props.app.loadingStop();
					this.showModal(
						<div className="goals-homework">
							<div className="goals">
								<h2 className="title">{lang[this.props.app.locale].goals}</h2>
								{goals.length ? (
									getGoals(goals, this.props.app.locale)
								) : (
									<div className="empty">{lang[this.props.app.locale].empty}</div>
								)}
							</div>
							<div className="homework">
								<h2 className="title">{lang[this.props.app.locale].homework}</h2>
								{homework.length ? (
									homework.map((work) => {
										var html = {
											__html: stripHTMLTags(unescape(work.description))
										};
										return (
											<div key={work.date} className="work">
												<div className="info">
													<span className="date">{timeConv(work.date)}</span>
												</div>
												<div dangerouslySetInnerHTML={html} className="work-content" />
												{work.files.length ? (
													<div className="attached">
														{work.files.map((file) => (
															<a
																key={file}
																download
																href={
																	config.server +
																	cities[this.props.app.city].code +
																	file
																}
															>
																<div className="file">
																	<svg
																		fill="currentColor"
																		xmlns="http://www.w3.org/2000/svg"
																		viewBox="0 0 24 24"
																	>
																		<path
																			d={getIcon(
																				file.split('.')[
																					file.split('.').length - 1
																				]
																			)}
																		/>
																	</svg>
																</div>
															</a>
														))}
													</div>
												) : (
													''
												)}
											</div>
										);
									})
								) : (
									<div className="empty">{lang[this.props.app.locale].empty}</div>
								)}
							</div>
						</div>,
						subject.Name
					);
				} else {
					this.props.app.logout();
					this.props.app.loadingStop();
				}
			})
			.catch((err) => {
				this.props.app.logout();
				this.props.app.loadingStop();
			});
	}
	getGoalJKO(subject) {
		this.props.app.loadingStart();
		axios({
			withCredentials: true,
			method: 'post',
			url:
				config.server +
				cities[this.props.app.city].code +
				'/jce/Diary/GetResultByEvalution?_dc=' +
				new Date() * 1 +
				'&journalId=' +
				subject.JournalId +
				'&evalId=' +
				subject.Evalutions[1].Id +
				'&page=1&start=0&limit=25'
		}).then((response) => {
			if (response.data.success) {
				axios({
					withCredentials: true,
					method: 'post',
					url:
						config.server +
						cities[this.props.app.city].code +
						'/jce/Diary/GetResultByEvalution?_dc=' +
						new Date() * 1 +
						'&journalId=' +
						subject.JournalId +
						'&evalId=' +
						subject.Evalutions[0].Id +
						'&page=1&start=0&limit=25'
				}).then((response2) => {
					let jko = [ response2.data.data, response.data.data ];
					this.props.app.loadingStop();
					this.showModal(
						<div className="goals-homework">
							{jko.map((section, index) => (
								<div key={index} className="homework">
									{index === 0 ? (
										<h2 className="title">{lang[this.props.app.locale].section}</h2>
									) : (
										<h2 className="title">{lang[this.props.app.locale].quarter}</h2>
									)}
									{section.map((topic) => (
										<div
											onClick={() => {
												topic.RubricId && this.getRubric(topic.Id, topic.RubricId);
											}}
											key={topic.Id}
											className={'work' + (topic.RubricId ? ' rubric' : '')}
										>
											<h3 className="name"> {topic.Name} </h3>
											<span>
												{(topic.Score === -1 ? 0 : topic.Score) + ' | ' + topic.MaxScore}{' '}
											</span>
										</div>
									))}
								</div>
							))}
						</div>,
						subject.Name
					);
				});
			} else {
				this.props.app.logout();
			}
		});
	}
	getRubric(sectionId, rubricId) {
		axios({
			withCredentials: true,
			url:
				config.server +
				cities[this.props.app.city].code +
				'/Jce/Diary/GetRubricResults?' +
				'_dc=' +
				new Date() * 1 +
				'&sectionId=' +
				sectionId +
				'&rubricId=' +
				rubricId +
				'&page=1&start=0&limit=25',
			method: 'POST'
		}).then((response) => {
			let element = (
				<div className="rubric-result">
					{response.data.data.map((rub) => (
						<div key={rub.CriterionId} className="rubric">
							<div className="rubric-criterion">{rub.Criterion}</div>
							<div className="rubric-results">
								<div className={'LowDescriptor' + (rub.LowResult ? ' selected' : '')}>
									{rub.LowDescriptor}
								</div>
								<div className={'MediumDescriptor' + (rub.MediumResult ? ' selected' : '')}>
									{rub.MediumDescriptor}
								</div>
								<div className={'HighDescriptor' + (rub.HighResult ? ' selected' : '')}>
									{rub.HighDescriptor}
								</div>
							</div>
						</div>
					))}
				</div>
			);
			this.setState({
				modalElement: element,
				modal: true
			});
		});
	}
	showModal(element, title) {
		this.setState({
			goalsElement: element,
			title: title
		});
	}
	render() {
		return (
			<div>
				<div className="header goals">
					<div>
						<div onClick={this.props.history.goBack} className="back">
							<svg
								height={28}
								width={28}
								xmlns="http://www.w3.org/2000/svg"
								fill="currentColor"
								viewBox="0 0 512 512"
							>
								<path d="M217.9 256L345 129c9.4-9.4 9.4-24.6 0-33.9-9.4-9.4-24.6-9.3-34 0L167 239c-9.1 9.1-9.3 23.7-.7 33.1L310.9 417c4.7 4.7 10.9 7 17 7s12.3-2.3 17-7c9.4-9.4 9.4-24.6 0-33.9L217.9 256z" />
							</svg>
						</div>
						<h1>{this.state.title}</h1>
					</div>
				</div>
				<div className="content">{this.state.goalsElement}</div>
				<div
					className={cn({
						'rubric-modal': true,
						active: this.state.modal
					})}
				>
					<div onClick={() => this.setState({ modal: false })} className="close">
						<svg xmlns="http://www.w3.org/2000/svg" fill="currentColor" viewBox="0 0 512 512">
							<path d="M256 48C141.1 48 48 141.1 48 256s93.1 208 208 208 208-93.1 208-208S370.9 48 256 48zm52.7 283.3L256 278.6l-52.7 52.7c-6.2 6.2-16.4 6.2-22.6 0-3.1-3.1-4.7-7.2-4.7-11.3 0-4.1 1.6-8.2 4.7-11.3l52.7-52.7-52.7-52.7c-3.1-3.1-4.7-7.2-4.7-11.3 0-4.1 1.6-8.2 4.7-11.3 6.2-6.2 16.4-6.2 22.6 0l52.7 52.7 52.7-52.7c6.2-6.2 16.4-6.2 22.6 0 6.2 6.2 6.2 16.4 0 22.6L278.6 256l52.7 52.7c6.2 6.2 6.2 16.4 0 22.6-6.2 6.3-16.4 6.3-22.6 0z" />
						</svg>
					</div>
					<div onClick={() => this.setState({ modal: false })} className="modal-backdrop" />

					<div className="modal-content">
						<CustomScroll heightRelativeToParent="100%">{this.state.modalElement}</CustomScroll>
					</div>
				</div>
			</div>
		);
	}
}

const mapDispatchToProps = (dispatch) => {
	return {
		login: bindActionCreators(login, dispatch),
		logout: bindActionCreators(logout, dispatch),
		notify: bindActionCreators(notify, dispatch),
		loadingStart: bindActionCreators(loadingStart, dispatch),
		loadingStop: bindActionCreators(loadingStop, dispatch),
		changeTheme: bindActionCreators(changeTheme, dispatch),
		changeLocale: bindActionCreators(changeLocale, dispatch)
	};
};

export default connect((state) => state, mapDispatchToProps)(Dashboard);
