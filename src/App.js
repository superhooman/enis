import React, { Component } from "react";
import "./App.css";
import {
  BrowserRouter as Router,
  Route,
  Link,
  browserHistory
} from "react-router-dom";
import {
  PrimaryButton,
  DefaultButton
} from "office-ui-fabric-react/lib/Button";
import { Checkbox } from "office-ui-fabric-react/lib/Checkbox";
import { TextField } from "office-ui-fabric-react/lib/TextField";
import { Dropdown } from "office-ui-fabric-react/lib/Dropdown";
import { initializeIcons } from "@uifabric/icons";
import {
  MessageBar,
  MessageBarType
} from "office-ui-fabric-react/lib/MessageBar";
import { Spinner, SpinnerSize } from "office-ui-fabric-react/lib/Spinner";
import axios from "axios";
import cookie from "react-cookies";
initializeIcons();
const cities = [
  { key: "aktau_cbd", text: "Актау ХБН", id: 0 },
  { key: "aktobe_phmd", text: "Актобе ФМН", id: 1 },
  { key: "almaty_phmd", text: "Алматы ФМН", id: 2 },
  { key: "almaty_cbd", text: "Алматы ХБН", id: 3 },
  { key: "astana_phmd", text: "Астана ФМН", id: 4 },
  { key: "atyrau_cbd", text: "Атырау ХБН", id: 5 },
  { key: "karaganda_cbd", text: "Караганда ХБН", id: 6 },
  { key: "kokshetau_phmd", text: "Кокшетау ФМН", id: 7 },
  { key: "kostanay_phmd", text: "Костанай ФМН", id: 8 },
  { key: "kyzylorda_cbd", text: "Кызылорда ХБН", id: 9 },
  { key: "pavlodar_cbd", text: "Павлодар ХБН", id: 10 },
  { key: "petropavlovsk_cbd", text: "Петропавловск ХБН", id: 11 },
  { key: "semey_phmd", text: "Семей ФМН", id: 12 },
  { key: "taldykorgan_phmd", text: "Талдыкорган ФМН", id: 13 },
  { key: "taraz_phmd", text: "Тараз ФМН", id: 14 },
  { key: "uralsk_phmd", text: "Уральск ФМН", id: 15 },
  { key: "oskemen_cbd", text: "Усть-Каменогорск ХБН", id: 16 },
  { key: "shymkent_phmd", text: "Шымкент ФМН", id: 17 },
  { key: "shymkent_cbd", text: "Шымкент ХБН", id: 18 }
];

class App extends Component {
  constructor() {
    super();
    this.state = {
      pin: "",
      password: ""
    };
    this.done = this.done.bind(this);
  }
  getdata() {
    axios({
      method: "post",
      url: "https://nis-api.herokuapp.com/GetSubjectData/",
      data:
        "pin=" +
        this.state.pin +
        "&password=" +
        this.state.password +
        "&school=" +
        cities[this.state.city_id].key +
        "&diary=IMKO&childID=null&role=student"
    });
  }
  done(response) {
    console.log(response.data);
  }
  render() {
    return (
      <Router className="root">
        <Route exact path="/">
          <Login onDone={this.done} />
        </Route>
      </Router>
    );
  }
}

class Login extends Component {
  constructor(props) {
    super(props);
    this.state = {
      city_status: false,
      pin_status: false,
      fade: false,
      login_status: false,
      city_id: "unset",
      message: false,
      message_type: null,
      message_text: "",
      pin: "000217550356",
      password: "170200nissf123",
      remember: false
    };
    this.choose_city = this.choose_city.bind(this);
    this.input_pin = this.input_pin.bind(this);
    this.login = this.login.bind(this);
  }
  componentWillMount(){
    console.log(cookie.load("pin"))
    if (cookie.load("pin")) {
      this.setState({
        pin: cookie.load("pin"),
        password: cookie.load("password"),
        city_id: cookie.load("city"),
        city_status: true,
        pin_status: true,
        login_status: true
      });
  }
}
  componentDidMount() {
      if(this.state.login_status){
        this.login();
      }
  }
  choose_city(e) {
    e.preventDefault();
    if (this.state.city_id !== "unset") {
      this.setState({ fade: true });
      setTimeout(() => {
        this.setState({
          fade: false,
          city_status: true,
          message: false
        });
      }, 200);
    } else {
      this.setState({
        message: true,
        message_type: MessageBarType.warning,
        message_text: "Выберите город"
      });
    }
  }
  input_pin(e) {
    e.preventDefault();
    if (this.state.pin.length === 12) {
      this.setState({ fade: true });
      setTimeout(() => {
        this.setState({
          fade: false,
          pin_status: true,
          message: false
        });
      }, 200);
    } else {
      this.setState({
        message: true,
        message_type: MessageBarType.warning,
        message_text: "Некорректный ИИН"
      });
    }
  }
  login(e) {
    if (e) {
      e.preventDefault();
    }
    this.setState({ send: true });
    var comp = this;
    axios
      .post(
        "https://nis-api.herokuapp.com/GetData/",
        "pin=" +
          this.state.pin +
          "&password=" +
          this.state.password +
          "&school=" +
          cities[this.state.city_id].key
      )
      .then(function(response) {
        if (response.data.success) {
          if (comp.state.remember) {
            cookie.save("pin", comp.state.pin, { path: "/" });
            cookie.save("password", comp.state.password, { path: "/" });
            cookie.save("city", comp.state.city_id, { path: "/" });
          }
          comp.props.onDone(response);
        }
      })
      .catch(function(error) {
        cookie.remove("pin", { path: "/" });
        cookie.remove("password", { path: "/" });
        cookie.remove("city", { path: "/" });
        comp.setState({
          send: false,
          message: true,
          message_type: MessageBarType.error,
          message_text: "Ошибка на сервере, либо вы ввели неверные данные"
        });
      });
  }
  render() {
    return (
      <div className="login">
        <div className="inner">
          <div className="logo">
            <svg
              fill="#29d18e"
              width="32"
              height="43"
              viewBox="0 0 400 400"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                d="M980.1,1210.9c.8-4.8,1.5-9.4,2.3-14.1,2.3-13.9,3.9-27.9,5-41.9a373,373,0,0,0,1-43c-1.5-36.2-7.8-71.4-23.1-104.6C942.1,957,904,922.7,852.7,902.7a276.5,276.5,0,0,0-56.2-14.9c28.3-20.4,84.6-21.2,126.5,24,.7-1.8.3-3.5.4-5.2,1.3-23.5,8.5-44.6,25.7-61.2,12.9-12.5,28.6-19.7,46.5-22,24.2-3.1,46,2.5,65.2,17.7a66.2,66.2,0,0,1,18.9,22.7c7.1,14.4,18.2,23.7,34.1,26.7,10.7,2,21.3,2,31.7-1.8,1.7-.6,3.4-1.2,4.9.3s.9,3.2.4,4.9a23.4,23.4,0,0,1-8.3,11.8c-12.2,8.9-25.6,13.1-40.7,10.4a26.5,26.5,0,0,1-11.3-5.2c-1.9-1.4-2.4-1.4-3,1.2-4,17.3-12.1,32.3-26.7,43-28.2,20.5-75.9,12.2-85-31.7-2.9-13.8-1.1-26.9,8.3-38.2s26.7-14.2,38.6-6.4a23.8,23.8,0,0,1,9.8,25.1c-2.5,10.1-10.2,17-20.2,18l-2.1.3c-3.8.8-4.8,2.6-2.8,5.9,4.1,6.9,10.8,9.4,18.3,9.7,12.2.5,21.7-4.5,27-15.6,7.7-16.2,8.5-32.9-.6-48.6-8.2-14.1-21.8-21.4-37.9-23.3s-32.8,2.9-45.3,15.4c-14.9,14.9-19.3,33.2-16.7,53.6,2.8,22.2,12.8,41.3,25.7,59.2,15.3,21,30,42.5,40.8,66.3,7.8,17.2,13.4,35,14.9,53.9,2.3,29.9-6,56.9-23.5,81.2a185.4,185.4,0,0,1-27.5,30.2A2.6,2.6,0,0,1,980.1,1210.9Z"
                transform="translate(-796.5 -822.5)"
              />
            </svg>
            <span>eNIS</span>
          </div>

          <span>Войти</span>
          {this.state.send ? (
            <div className="loader">
              <Spinner
                size={SpinnerSize.large}
                label="Seriously, still loading..."
                ariaLive="assertive"
              />
            </div>
          ) : (
            ""
          )}
          {this.state.message ? (
            <MessageBar messageBarType={this.state.message_type}>
              {this.state.message_text}
            </MessageBar>
          ) : (
            ""
          )}
          {this.state.city_status ? (
            this.state.pin_status ? (
              <form
                className={this.state.fade ? "hide" : ""}
                onSubmit={this.login}
              >
                <TextField
                  placeholder="Пароль"
                  onChanged={e => {
                    this.setState({ password: e });
                  }}
                  value={this.state.password}
                  type="password"
                />
                <Checkbox
                  label="Запомнить меня"
                  onChange={e => {
                    if (this.state.remember) {
                      this.setState({ remember: false });
                    } else {
                      this.setState({ remember: true });
                    }
                  }}
                />
                <div className="buttons">
                  <DefaultButton
                    onClick={() => {
                      this.setState({ fade: true });
                      setTimeout(() => {
                        this.setState({
                          pin_status: false,
                          message: false,
                          fade: false
                        });
                      }, 200);
                    }}
                  >
                    Назад
                  </DefaultButton>
                  <PrimaryButton onClick={this.login}>Войти</PrimaryButton>
                </div>
              </form>
            ) : (
              <form
                className={this.state.fade ? "hide" : ""}
                onSubmit={this.input_pin}
              >
                <TextField
                  value={this.state.pin}
                  onChanged={e => {
                    this.setState({ pin: e });
                  }}
                  type="number"
                  placeholder="ИИН"
                />
                <div className="buttons">
                  <DefaultButton
                    onClick={() => {
                      this.setState({ fade: true });
                      setTimeout(() => {
                        this.setState({
                          city_status: false,
                          city_id: "unset",
                          message: false,
                          fade: false
                        });
                      }, 200);
                    }}
                  >
                    Назад
                  </DefaultButton>
                  <PrimaryButton onClick={this.input_pin}>Далее</PrimaryButton>
                </div>
              </form>
            )
          ) : (
            <form
              className={this.state.fade ? "hide first" : "first"}
              onSubmit={this.choose_city}
            >
              <Dropdown
                className="Dropdown-example"
                placeHolder="Выберите город"
                options={cities}
                onChanged={e => {
                  this.setState({
                    city_id: e.id
                  });
                }}
              />
              <PrimaryButton onClick={this.choose_city}>Далее</PrimaryButton>
            </form>
          )}
        </div>
      </div>
    );
  }
}

export default App;
