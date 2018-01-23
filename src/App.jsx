import React, { Component } from "react";
import "./App.css";
import 'react-select/dist/react-select.css';
import {
  BrowserRouter as Router,
  Route,
  Link,
  Redirect
} from "react-router-dom";
import axios from "axios";
import cookie from "react-cookies";
import Select from 'react-select';

const cities = [
  { code: "aktau_cbd", label: "Актау ХБН", value: 0 },
  { code: "aktobe_phmd", label: "Актобе ФМН", value: 1 },
  { code: "almaty_phmd", label: "Алматы ФМН", value: 2 },
  { code: "almaty_cbd", label: "Алматы ХБН", value: 3 },
  { code: "astana_phmd", label: "Астана ФМН", value: 4 },
  { code: "atyrau_cbd", label: "Атырау ХБН", value: 5 },
  { code: "karaganda_cbd", label: "Караганда ХБН", value: 6 },
  { code: "kokshetau_phmd", label: "Кокшетау ФМН", value: 7 },
  { code: "kostanay_phmd", label: "Костанай ФМН", value: 8 },
  { code: "kyzylorda_cbd", label: "Кызылорда ХБН", value: 9 },
  { code: "pavlodar_cbd", label: "Павлодар ХБН", value: 10 },
  { code: "petropavlovsk_cbd", label: "Петропавловск ХБН", value: 11 },
  { code: "semey_phmd", label: "Семей ФМН", value: 12 },
  { code: "taldykorgan_phmd", label: "Талдыкорган ФМН", value: 13 },
  { code: "taraz_phmd", label: "Тараз ФМН", value: 14 },
  { code: "uralsk_phmd", label: "Уральск ФМН", value: 15 },
  { code: "oskemen_cbd", label: "Усть-Каменогорск ХБН", value: 16 },
  { code: "shymkent_phmd", label: "Шымкент ФМН", value: 17 },
  { code: "shymkent_cbd", label: "Шымкент ХБН", value: 18 }
];

class App extends Component {
  constructor() {
    super();
    this.state = {
      data: {},
      redirect: false,
      logged: false,
      pin: '',
      password: '',
      city: '',
      journal: ''
    };
    this.done = this.done.bind(this);
  }
  done(data, pin, password, city, journal) {
    this.setState({
      logged: true,
      redirect: true,
      data: data,
      pin: pin,
      password: password,
      city: cities[city].code,
      journal: journal
    })
  }
  render() {
    return (
      <Router className="root">
        <div className="root">
          <Route exact path="/" render={() => (
            this.state.logged ?
              (<Redirect to="/dashboard" />)
              :
              (<Login onDone={this.done} />)
          )} />
          <Route path='/dashboard' render={() => (
            <Dashboard data={this.state.data} pin={this.state.pin} password={this.state.password} city={this.state.city} journal={this.state.journal} />
          )} />
        </div>
      </Router>
    );
  }
}

class Dashboard extends Component {
  constructor(props) {
    super(props)
    this.state = {
      redirect: false,
      data: this.props.data,
      isNotLoaded: this.props.data.data ? false : true,
      pin: this.props.pin,
      password: this.props.password,
      city: this.props.city,
      journal: this.props.journal,
      quarter: 0,
    }
  }
  componentDidMount(){
    if(this.state.isNotLoaded){
      var self = this
      if(cookie.load('pin')){
        axios({
          method: "post",
          url: "https://api.uenify.com/GetSubjectData/",
          data: "pin=" + cookie.load('pin') + "&password=" + cookie.load('password') + "&school=" + cities[cookie.load('city')].code + "&diary=" + cookie.load('journal')
        }).then((response) => {
          if (response.data.success) {
            this.setState({
              data: response.data,
              pin: cookie.load('pin'),
              password: cookie.load('password'),
              city: cities[cookie.load('city')].code,
              journal: cookie.load('journal')
            })
          } else {
            cookie.remove('pin')
            cookie.remove('password')
            self.setState({
              redirect: true
            })
          }
        }).catch((error) => {
          cookie.remove('pin')
          cookie.remove('password')
          self.setState({
            redirect: true
          })
        })
      }else{
        this.setState({
          redirect: true
        })
      }
    }
  }
  render() {
    return (
      <div>
        {this.state.redirect ?
          <Redirect to="/" />
          :
          <div className="dashboard">
            {this.state.data.data ? (<div className="subjects">
                  {this.state.data.data[0].data[this.state.quarter].data.map((subject)=>(
                    <div key={subject.id} className="subject">
                      <h2>{subject.name}</h2>
                      <h4>{subject.formative.current + ' | ' +subject.formative.maximum}</h4>
                    </div>
                  ))}
                </div>): ''}
          </div>
        }
      </div>
    )
  }
}

class Login extends Component {
  constructor(props) {
    super(props);
    this.state = {
      message: false,
      message_text: '',
      city: cookie.load('city') ? cookie.load('city') : '',
      journal: cookie.load('journal') ? cookie.load('journal') : 'IMKO',
      pin: cookie.load('pin') ? cookie.load('pin') : "000217550356",
      password: cookie.load('password') ? cookie.load('password') : "170200nissf123",
      remember: false
    };
    this.login = this.login.bind(this)
  }
  componentWillMount(){
    if (cookie.load('pin')){
      this.login()
    }
  }
  handleChange = (selectedOption) => {
    selectedOption ? this.setState({
      city: selectedOption.value
    }) : this.setState({
      city: ''
    });
  }
  login() {
    var self = this
    axios({
      method: "post",
      url: "https://api.uenify.com/GetSubjectData/",
      data: "pin=" + this.state.pin + "&password=" + this.state.password + "&school=" + cities[this.state.city].code + "&diary=" + this.state.journal
    }).then((response) => {
      if (response.data.success) {
        if (self.state.remember) {
          var expires = new Date()
          expires.setDate(Date.now() + 1000 * 60 * 60 * 24 * 14)
          cookie.save(
            'pin',
            this.state.pin,
            {
              path: '/',
              expires: expires,
              maxAge: 1000,
            }
          )
          cookie.save(
            'password',
            this.state.password,
            {
              path: '/',
              expires: expires,
              maxAge: 1000,
            }
          )
          cookie.save(
            'city',
            this.state.city,
            {
              path: '/',
              expires: expires,
              maxAge: 1000,
            }
          )
          cookie.save(
            'journal',
            this.state.journal,
            {
              path: '/',
              expires: expires,
              maxAge: 1000,
            }
          )
        }
        self.props.onDone(response.data, this.state.pin, this.state.password, this.state.city, this.state.journal)
      } else {
        cookie.remove('pin')
        cookie.remove('password')
        self.setState({
          message: true,
          message_text: 'Ошибка'
        })
      }
    }).catch((error) => {
      console.log(error)
      self.setState({
        message: true,
        message_text: 'Ошибка'
      })
    })
  }
  render() {
    return (
      <div className="login">
        <div onClick={() => {
          this.setState({
            message: false
          })
        }} className={this.state.message ? 'message show' : 'message'}>
          {this.state.message_text}
        </div>
        <div className="content">
          <div className="logo">
            <svg
              fill="#29d18e"
              width="48"
              height="48"
              viewBox="0 0 400 400"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                d="M980.1,1210.9c.8-4.8,1.5-9.4,2.3-14.1,2.3-13.9,3.9-27.9,5-41.9a373,373,0,0,0,1-43c-1.5-36.2-7.8-71.4-23.1-104.6C942.1,957,904,922.7,852.7,902.7a276.5,276.5,0,0,0-56.2-14.9c28.3-20.4,84.6-21.2,126.5,24,.7-1.8.3-3.5.4-5.2,1.3-23.5,8.5-44.6,25.7-61.2,12.9-12.5,28.6-19.7,46.5-22,24.2-3.1,46,2.5,65.2,17.7a66.2,66.2,0,0,1,18.9,22.7c7.1,14.4,18.2,23.7,34.1,26.7,10.7,2,21.3,2,31.7-1.8,1.7-.6,3.4-1.2,4.9.3s.9,3.2.4,4.9a23.4,23.4,0,0,1-8.3,11.8c-12.2,8.9-25.6,13.1-40.7,10.4a26.5,26.5,0,0,1-11.3-5.2c-1.9-1.4-2.4-1.4-3,1.2-4,17.3-12.1,32.3-26.7,43-28.2,20.5-75.9,12.2-85-31.7-2.9-13.8-1.1-26.9,8.3-38.2s26.7-14.2,38.6-6.4a23.8,23.8,0,0,1,9.8,25.1c-2.5,10.1-10.2,17-20.2,18l-2.1.3c-3.8.8-4.8,2.6-2.8,5.9,4.1,6.9,10.8,9.4,18.3,9.7,12.2.5,21.7-4.5,27-15.6,7.7-16.2,8.5-32.9-.6-48.6-8.2-14.1-21.8-21.4-37.9-23.3s-32.8,2.9-45.3,15.4c-14.9,14.9-19.3,33.2-16.7,53.6,2.8,22.2,12.8,41.3,25.7,59.2,15.3,21,30,42.5,40.8,66.3,7.8,17.2,13.4,35,14.9,53.9,2.3,29.9-6,56.9-23.5,81.2a185.4,185.4,0,0,1-27.5,30.2A2.6,2.6,0,0,1,980.1,1210.9Z"
                transform="translate(-796.5 -822.5)"
              />
            </svg>
            <h1>eNIS</h1>
            <p>— удобный клиент для ИОСа</p>
          </div>
          <div className="login-cont">
            <form className="form">
              <Select
                name="form-field-name"
                value={this.state.city}
                placeholder="Город"
                onChange={this.handleChange}
                options={cities}
              />
              <input onChange={(event) => {
                this.setState({
                  pin: event.target.value
                })
              }} placeholder="ИИН" value={this.state.pin} type="text" name="iin" />
              <input onChange={(event) => {
                this.setState({
                  password: event.target.value
                })
              }} placeholder="Пароль" value={this.state.password} type="password" name="password" />
            </form>
            <div className="group">
              <Checkbox onChange={(value) => {
                this.setState({
                  remember: value
                })
              }} label="Запомнить" />
              <Toggle initState={cookie.load('journal') ? cookie.load('journal') === 'IMKO' ? false : true : false} onChange={(value) => {
                this.setState({
                  journal: value ? 'JKO' : 'IMKO'
                })

              }} label="ЖКО" label0="ИМКО" />
            </div>
            <button onClick={this.login} className="button">
              Войти
          </button>
          </div>
          <footer>
            <a className="link" href="https://uenify.com/">
              <svg fill="#5b5b5b" width="24" height="24">
                <rect height="25" width="5" transform="translate(20 2) rotate(45)" />
              </svg>
            </a>
          </footer>
        </div>
        <div className="gradient" />
      </div>
    );
  }
}

class Checkbox extends Component {
  constructor(props) {
    super(props)
    this.state = {
      on: this.props.initState ? this.props.initState : false
    }
  }
  render() {
    return (
      <div onClick={() => {
        this.props.onChange(!this.state.on)
        this.setState({
          on: !this.state.on
        })
      }} className={this.state.on ? 'checkbox on' : 'checkbox'}>
        <div className="check">
          <svg viewBox="0 0 32 32" width="20" height="20" fill="none" stroke="#fff" strokeWidth="2">
            <path d="M2 20 L12 28 30 4" />
          </svg>
        </div>
        <label className="label">{this.props.label}</label>
      </div>
    )
  }
}

class Toggle extends Component {
  constructor(props) {
    super(props)
    this.state = {
      on: false
    }
  }
  render() {
    return (
      <div onClick={() => {
        this.props.onChange(!this.state.on)
        this.setState({
          on: !this.state.on
        })
      }} className={this.state.on ? 'toggle on' : 'toggle'}>
        <label className="label">{this.props.label0}</label>
        <div className="box">
          <div className="dot" />
        </div>
        <label className="label">{this.props.label}</label>
      </div>
    )
  }
}


export default App;
