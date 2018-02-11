import React, { Component } from "react";
import "./App.css";
import 'react-select/dist/react-select.css';
import {
  BrowserRouter as Router,
  Route,
  Redirect
} from "react-router-dom";
import axios from "axios";
import cookie from "react-cookies";
import Select from 'react-select';

const proxy = "/proxy.php?"

const cities = [
  { code: "http://akt.nis.edu.kz/Aktau", label: "Актау ХБН", value: 0 },
  { code: "http://akb.nis.edu.kz/Aktobe", label: "Актобе ФМН", value: 1 },
  { code: "http://fmalm.nis.edu.kz/Almaty_Fmsh", label: "Алматы ФМН", value: 2 },
  { code: "http://hbalm.nis.edu.kz/Almaty_Hbsh", label: "Алматы ХБН", value: 3 },
  { code: "http://ast.nis.edu.kz/Astana_Fmsh", label: "Астана ФМН", value: 4 },
  { code: "http://atr.nis.edu.kz/Atyrau", label: "Атырау ХБН", value: 5 },
  { code: "http://krg.nis.edu.kz/Karaganda", label: "Караганда ХБН", value: 6 },
  { code: "http://kt.nis.edu.kz/Kokshetau", label: "Кокшетау ФМН", value: 7 },
  { code: "http://kst.nis.edu.kz/Kostanay", label: "Костанай ФМН", value: 8 },
  { code: "http://kzl.nis.edu.kz/Kyzylorda", label: "Кызылорда ХБН", value: 9 },
  { code: "http://pvl.nis.edu.kz/Pavlodar", label: "Павлодар ХБН", value: 10 },
  { code: "http://ptr.nis.edu.kz/Petropavlovsk", label: "Петропавловск ХБН", value: 11 },
  { code: "http://sm.nis.edu.kz/Semey_FMSH", label: "Семей ФМН", value: 12 },
  { code: "http://tk.nis.edu.kz/Taldykorgan", label: "Талдыкорган ФМН", value: 13 },
  { code: "http://trz.nis.edu.kz/Taraz", label: "Тараз ФМН", value: 14 },
  { code: "http://ura.nis.edu.kz/Uralsk", label: "Уральск ФМН", value: 15 },
  { code: "http://ukk.nis.edu.kz/Oskemen", label: "Усть-Каменогорск ХБН", value: 16 },
  { code: "http://fmsh.nis.edu.kz/Shymkent_Fmsh", label: "Шымкент ФМН", value: 17 },
  { code: "http://hbsh.nis.edu.kz/Shymkent_Hbsh", label: "Шымкент ХБН", value: 18 }
];

const stripHTMLTags = (str) => {
  if ((str === null) || (str === ''))
    return ' ';
  else
    str = str.toString();
  var out = str.replace(/<style>[^>]*<\/style>/g, ' ').replace(/<w[^>]*>[^>]*<\/w[^>]*>/gi, ' ')
  return urlify(out.replace(/<[^>]*>/g, ' '))
}

const urlify = (text) => {
  var urlRegex = /(https?:\/\/[^\s]+)/g;
  return text.replace(urlRegex, (url) => {
    return '<a href="' + url + '">' + url + '</a>';
  })
}

const timeConv = (data) => {
  if (data != null) {
    var date = data.split('T')[0];
    return date.split('-')[2] + '.' + date.split('-')[1] + '.' + date.split('-')[0]
  } else {
    return '&ensp; &ensp;'
  }
}

const getStatus = (status) => {
  if (status === "Достиг" || status === "Жетті") {
    return 'status ok'
  } else if (status === "Стремится" || status === "Тырысады") {
    return 'status bad'
  } else {
    return 'status'
  }
}

const getList = (data) => {
  var childList = []
  for (var i in data) {
    var child = {}
    child.value = i
    child.label = data[i].Name
    childList.push(child)
  }
  return childList
}

const getIcon = (format) => {
  switch (format) {
    case 'docx':
      return 'M23.999 3.733V20.28c0 .141-.05.255-.149.346-.101.094-.221.138-.36.138h-8.559v-2.295h6.982v-1.045h-6.988v-1.279h6.982v-1.044H14.93v-1.29h6.98v-1.032h-6.98v-1.293h6.98v-1.044h-6.98V9.163h6.98V8.12h-6.98V6.815h6.98v-.994h-6.98V3.228h8.562c.149 0 .27.048.358.149.105.099.15.22.149.356zM13.65.641v22.722L0 21.001V3.067L13.65.637v.004zm-2.06 6.708l-1.709.105-1.096 6.785H8.76c-.054-.321-.255-1.445-.615-3.367l-.639-3.263-1.604.08-.642 3.183c-.375 1.854-.584 2.933-.639 3.236h-.015l-.975-6.25-1.47.078 1.575 7.883 1.634.105.615-3.068c.36-1.8.57-2.846.615-3.132h.045c.061.305.256 1.374.615 3.21l.615 3.158 1.77.105 1.98-8.85h-.035z'
    case 'pptx':
      return 'M23.484 4h-8.542v3.186c.515-.39 1.132-.588 1.855-.588v3.098h3.074c-.015.869-.315 1.602-.901 2.193-.584.592-1.318.896-2.188.916-.675-.02-1.29-.223-1.829-.615v2.129h6.719v1.045h-6.721v1.293h6.715v1.032h-6.719v2.34h8.543c.346 0 .51-.182.51-.537V4.51c0-.342-.164-.51-.51-.51h-.006zM17.28 9.186V6.062c.87.02 1.6.322 2.188.91.586.588.891 1.326.906 2.214H17.28zm-9.024.052c-.053-.201-.14-.357-.263-.472-.12-.112-.282-.194-.483-.246-.225-.061-.457-.09-.69-.09l-.72.014v2.999h.026c.261.016.535.016.825 0 .285-.015.555-.09.809-.225.313-.225.5-.525.561-.914.06-.391.039-.766-.064-1.111v.045zM0 3.059v17.946l13.688 2.365V.63L0 3.059zm10.213 8.087c-.375.869-.935 1.425-1.684 1.665-.749.239-1.558.332-2.429.279v3.422l-1.801-.209V6.901l2.859-.149c.53-.033 1.054.025 1.566.18.515.152.922.459 1.223.922.3.461.469.996.51 1.605.037.609-.043 1.172-.244 1.687z'
    case 'pdf':
      return 'M23.598 15.368c-.71-.76-2.164-1.197-4.224-1.197-1.1 0-2.375.11-3.76.37-.782-.77-1.562-1.67-2.307-2.72-.53-.74-.993-1.52-1.42-2.29.813-2.54 1.206-4.61 1.206-6.1 0-1.672-.603-3.416-2.34-3.416-.533 0-1.066.325-1.35.8-.783 1.408-.43 4.493.917 7.54-.503 1.52-1.035 2.973-1.7 4.605-.578 1.376-1.244 2.794-1.923 4.096C2.793 18.64.267 20.49.03 21.94c-.104.547.074 1.05.457 1.45.133.11.636.545 1.48.545 2.59 0 5.32-4.28 6.707-6.86 1.065-.36 2.13-.687 3.193-1.015 1.168-.323 2.34-.583 3.405-.765 2.735 2.504 5.146 2.9 6.358 2.9 1.492 0 2.024-.617 2.203-1.122.28-.65.07-1.37-.252-1.74l.02.04zm-1.385 1.054c-.104.544-.638.906-1.386.906-.21 0-.39-.037-.603-.072-1.36-.325-2.633-1.016-3.903-2.106 1.25-.214 2.31-.25 2.98-.25.74 0 1.38.032 1.81.144.49.106 1.27.435 1.095 1.38h.02zm-7.523-1.707c-.92.19-1.914.414-2.944.693-.816.223-1.666.474-2.52.77.463-.902.854-1.774 1.208-2.603.428-1.02.78-2.07 1.135-3.046.35.61.74 1.23 1.13 1.78.64.87 1.31 1.7 1.98 2.42v-.02zM10.04 1.23c.145-.29.43-.436.678-.436.745 0 .887.868.887 1.56 0 1.168-.354 2.942-.96 4.967-1.062-2.82-1.135-5.18-.603-6.09zM6.138 18.127C4.328 21.17 2.59 23.06 1.525 23.06c-.21 0-.387-.075-.53-.183-.214-.216-.32-.472-.248-.76.213-1.09 2.236-2.613 5.392-3.99z'
    default:
      return 'M2.759 24l.664-.144c.207-.044.412-.085.619-.126.318-.062.637-.123.955-.182.24-.046.48-.085.721-.129l.055-.015c.25-.044.498-.09.747-.12l1.214-.179V-.001h-.042c-.63.004-1.256.016-1.884.036-.689.018-1.394.06-2.084.105-.299.021-.6.046-.899.07H2.78v23.784L2.759 24zM8.911.015v22.942c.861-.1 1.72-.182 2.582-.246 2.121-.161 4.248-.211 6.373-.151 1.128.034 2.253.099 3.374.192V1.503c-1.004-.229-2.012-.432-3.028-.607-1.968-.342-3.955-.581-5.947-.731C11.151.084 10.032.033 8.913.016h-.002zm10.763 14.797l-.046-.004-.561-.061c-1.399-.146-2.805-.242-4.207-.291-1.407-.045-2.815-.03-4.223.016h-.044c-.045 0-.091 0-.135-.016-.101-.03-.195-.074-.267-.149-.127-.136-.186-.315-.156-.495.008-.061.029-.105.054-.166.027-.044.063-.104.104-.134.043-.045.09-.075.143-.104.061-.03.121-.046.18-.061h.09c.195 0 .391-.016.57-.016 1.395-.029 2.773-.029 4.169.03 1.439.06 2.864.165 4.288.33l.151.015c.044.016.089.016.135.03.105.046.194.105.255.181.044.044.074.104.105.164.029.061.044.12.044.18.015.165-.044.33-.164.45-.046.046-.091.075-.135.105-.047.03-.105.044-.166.06-.03.016-.045.016-.089.016h-.047l-.048-.08zm.035-2.711c-.044 0-.044 0-.09-.006l-.555-.071c-1.395-.179-2.804-.3-4.198-.359-1.395-.075-2.805-.09-4.214-.06l-.046-.016c-.045-.015-.09-.015-.135-.029-.09-.03-.194-.09-.254-.166-.03-.045-.076-.104-.09-.148-.075-.166-.075-.361.014-.525.031-.061.061-.105.105-.15s.09-.09.15-.104c.061-.03.119-.06.18-.06l.09-.016.585-.015c1.396-.016 2.774.015 4.153.09 1.439.075 2.865.21 4.289.39l.149.016.091.014c.105.031.194.075.27.166.12.119.18.284.165.449 0 .061-.016.121-.045.165-.029.06-.061.104-.09.15-.03.044-.074.075-.136.12-.044.029-.104.045-.164.061l-.091.014H19.8l-.091.09zm0-2.711c-.044 0-.044 0-.09-.006l-.555-.08c-1.395-.19-2.789-.334-4.198-.428-1.395-.092-2.805-.135-4.214-.129h-.046l-.09-.016c-.059-.016-.104-.036-.164-.068-.15-.092-.256-.254-.285-.438 0-.061 0-.12.016-.18.014-.061.029-.117.059-.17.031-.054.076-.102.121-.144.074-.075.18-.126.285-.15.045-.011.089-.015.135-.015h.569c1.439.009 2.879.064 4.304.172 1.395.105 2.774.26 4.153.457l.15.021c.046.007.061.007.09.019.06.02.12.046.165.08.061.033.104.075.135.123.031.048.061.101.09.158.062.156.045.334-.029.479-.029.055-.061.105-.105.146-.075.074-.164.127-.27.15-.029.012-.046.012-.091.014l-.044.005h-.091zm0-2.712c-.044 0-.044 0-.09-.007l-.555-.09c-1.395-.225-2.789-.391-4.198-.496-1.395-.119-2.805-.179-4.214-.209h-.046l-.105-.014c-.061-.015-.115-.045-.165-.074-.053-.031-.099-.076-.14-.121-.036-.045-.068-.104-.094-.149-.02-.06-.037-.12-.044-.181-.016-.18.053-.371.181-.494.074-.075.176-.125.279-.15.045-.015.09-.015.135-.015.189 0 .38.005.57.008 1.437.034 2.871.113 4.304.246 1.387.119 2.77.3 4.145.524l.135.016c.04 0 .052 0 .09.014.062.016.112.046.165.076.046.029.09.074.125.119.091.135.135.301.105.465-.015.061-.031.105-.061.166-.03.045-.074.104-.12.135-.074.074-.165.119-.271.149h-.135l.004.082zm-15.67-.509c-.09 0-.181-.021-.271-.063-.194-.095-.314-.293-.329-.505 0-.057.015-.111.03-.165.014-.068.045-.133.09-.19.045-.065.104-.12.164-.162.077-.05.167-.076.241-.092l.48-.044c.659-.058 1.305-.105 1.949-.144h.06c.105.004.195.024.271.071.194.103.314.305.314.519 0 .055-.015.109-.029.161-.016.067-.045.132-.091.189-.044.075-.104.12-.165.165-.074.045-.15.074-.24.09-.104.015-.209.015-.314.03-.136.015-.286.015-.436.031l-1.168.088-.285.031c-.061.015-.122.015-.196.015l-.075-.025zm15.655-2.201l-.091-.01-.554-.1c-1.395-.234-2.805-.425-4.214-.564-1.395-.138-2.804-.225-4.214-.271h-.045l-.09-.018c-.061-.015-.105-.038-.165-.071-.045-.03-.091-.072-.135-.121-.12-.138-.165-.33-.12-.506.016-.061.045-.12.074-.18.031-.061.076-.105.121-.15.074-.076.18-.121.285-.15.045-.015.089-.015.135-.015l.584.015c1.395.061 2.774.15 4.154.301 1.439.148 2.864.359 4.288.6l.15.014c.046 0 .061 0 .09.016.06.015.12.045.165.074.135.105.225.256.239.421.016.06 0 .12-.015.181 0 .059-.029.119-.059.164-.031.045-.062.09-.105.135-.076.076-.181.12-.286.135l-.086.014h-.046l-.06.086zM4.022 3.199c-.086 0-.171-.019-.25-.056-.07-.033-.134-.079-.187-.137-.045-.053-.086-.112-.111-.181-.02-.049-.034-.101-.039-.156-.022-.214.078-.427.255-.546.078-.054.167-.086.26-.099.158-.014.314-.014.473-.029.65-.045 1.301-.075 1.949-.105h.048c.091.016.181.03.256.075.179.105.3.315.3.524 0 .061-.016.121-.03.166-.03.074-.06.135-.104.195-.047.06-.107.12-.182.15-.075.045-.165.075-.255.075-.104.014-.21.014-.33.014l-.449.031c-.405.029-.795.045-1.186.074l-.3.016c-.075.015-.134.015-.194.015l.076-.026z'
  }
}

const getWidth = (subject) => {
  var result
  if (subject.MaxISA !== 0) {
    result = (subject.ApproveCnt / subject.Cnt) * 70 + (subject.ApproveISA / subject.MaxISA) * 30
  } else {
    result = (subject.ApproveCnt / subject.Cnt) * 100
  }
  return result
}

const getGoals = (data) => {
  var groups = []
  for (var i in data) {
    if (groups[data[i].GroupIndex] === undefined) {
      groups.push({ name: data[i].GroupName, goals: [] })
    }
    groups[data[i].GroupIndex].goals.push(data[i])
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
                {goal.Changed ? (<span className="date">{timeConv(goal.Changed)}</span>) : ''}
                <span className={getStatus(goal.Value)}>{goal.Value}</span>
              </div>
              <div className="goal-content">
                {goal.Description}
              </div>
              {goal.comment ? (
                <div className="comment">
                  {goal.Comment}
                </div>
              ) : ''}
            </div>
          ))}
        </div>
      ))}
    </div>
  )
}

class App extends Component {
  constructor() {
    super();
    this.state = {
      redirect: false,
      logged: false,
      role: '',
      journal: '',
      city: '',
      fromLogin: false
    };
    this.done = this.done.bind(this);
  }
  done(role, journal, city) {
    this.setState({
      logged: true,
      redirect: true,
      role: role,
      journal: journal,
      city: city,
      fromLogin: true
    })
  }
  logout() {
    this.setState({
      redirect: false,
      logged: false,
      role: '',
      journal: '',
      city: ''
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
            <Dashboard fromLogin={this.state.fromLogin} logout={this.logout.bind(this)} city={this.state.city} journal={this.state.journal} role={this.state.role} />
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
      city: this.props.city || cookie.load('city'),
      journal: this.props.journal || cookie.load('journal'),
      role: this.props.role || cookie.load('role'),
      child: 0,
      childWill: 0,
      quarter: 0,
      modalIMKO: false,
      data: false,
      goals: [],
      homework: [],
      loading: false,
      id: '',
      klass: '',
      classes: [],
      childrenList: []
    }
    this.getGoalIMKO = this.getGoalIMKO.bind(this)
    this.getGoalJKO = this.getGoalJKO.bind(this)
    this.closeModal = this.closeModal.bind(this)
    this.logout = this.logout.bind(this)
    this.getClasses = this.getClasses.bind(this)
  }
  componentDidMount() {
    var self = this
    if (!this.props.fromLogin) {
      axios({
        withCredentials: true,
        method: "post",
        url: proxy + this.state.city + '/EventCalendar/GetEvents',
      }).then((response) => {
        if (!response.data.success) {
          console.log(1)
          self.setState({
            redirect: true
          })
        }
      })
    }
    if (this.state.role === 'Student') {
      if (this.state.journal === 'IMKO') {
        this.getIMKO()
      } else if (this.state.journal === 'JKO') {
        this.getJKO()
      } else {
        this.logout()
      }
    } else if (this.state.role === 'Parent') {
      this.getClasses()
    }
    if (!cookie.load('city')) {
      this.logout()
    }
  }
  getClasses() {
    var self = this
    axios({
      withCredentials: true,
      method: 'post',
      url: proxy + this.state.city + '/ImkoDiary/Klasses/',
    }).then((response) => {
      self.setState({
        classes: response.data.data
      })
      self.getChildren()
    })
  }
  getChildren() {
    var self = this
    this.state.classes.map((klass) => {
      axios({
        withCredentials: true,
        method: 'post',
        url: proxy + this.state.city + '/ImkoDiary/Students/',
        data: 'klassId=' + klass.Id
      }).then((response) => {
        var children = self.state.childrenList
        for(var i in response.data.data){
          response.data.data[i].klass = klass.Id
        }
        children = children.concat(response.data.data)
        self.setState({
          childrenList: children
        })
        if (self.state.journal === 'IMKO') {
          self.getIMKO(children[0].Id)
        } else if (self.state.journal === 'JKO') {
          self.getUrl(children[0].klass, children[0].Id)
        }
      })
      return true;
    })
  }
  getIMKO(studentId) {
    var self = this
    axios({
      withCredentials: true,
      method: 'post',
      url: proxy + this.state.city + '/ImkoDiary/Subjects',
      data: 'periodId=1' + (studentId ? '&studentId=' + studentId : '')
    }).then((response) => {
      if (response.data.success) {
        self.setState({
          data: { 0: { data: { 0: { data: response.data.data } } } }
        })
      }
    })
  }
  getJKO(studentId) {
    var self = this
    if (!studentId) {
      axios({
        withCredentials: true,
        method: 'post',
        url: proxy + this.state.city + '/JceDiary/JceDiary/'
      }).then((response) => {
        var id = response.data.split('student: {')[1].split('},')[0].split(':')[1].split(',')[0]
        var klass = response.data.split('klass: {')[1].split('},')[0].split(':')[1].split(',')[0]
        self.setState({
          id: id,
          klass: klass
        })
        self.getUrl(klass)
      })
    } else {
      this.getUrl(studentId)
    }
  }
  getUrl(klass, studentId) {
    var self = this
    axios({
      withCredentials: true,
      method: 'post',
      url: proxy + this.state.city + '/JceDiary/GetDiaryUrl/',
      data: 'klassId=' + klass + '&periodId=1' + (studentId ? '&studentId=' + studentId : '&studentId=' + this.state.id)
    }).then((response) => {
      axios({
        withCredentials: true,
        method: 'post',
        url: proxy + response.data.data,
      }).then((response) => {
        self.getJKOFinal()
      })
    })
  }
  getJKOFinal() {
    var self = this
    axios({
      withCredentials: true,
      method: 'post',
      url: proxy + this.state.city + '/jce/Diary/GetSubjects',
      data: 'page=1&start=0&limit=25'
    }).then((response) => {
      self.setState({
        data: { 0: { data: { 0: { data: response.data.data } } } }
      })
    })
  }
  getGoalIMKO(subjectID, studentID) {
    this.setState({
      loading: true
    })
    axios({
      withCredentials: true,
      method: "post",
      url: proxy + this.state.city + '/ImkoDiary/Goals/',
      data: 'periodId=' + (this.state.quarter * 1 + 1) + '&subjectId=' + subjectID + '&studentId=' + studentID
    }).then((response) => {
      if (response.data.success) {
        this.setState({
          goals: response.data.data.goals,
          loading: false,
          homework: response.data.data.homeworks,
          modal: true,
          modalShow: true
        })
      }
    }).catch((err) => {
      this.setState({
        redirect: true
      })
    })
  }
  getGoalJKO(journalId, evalId, evalId2) {
    this.setState({
      loading: true
    })
    var self = this
    axios({
      withCredentials: true,
      method: "post",
      url: proxy + this.state.city + '/jce/Diary/GetResultByEvalution?_dc=' + (new Date() * 1),
      data: "journalId=" + journalId + "&evalId=" + evalId + "&page=1&start=0&limit=25"
    }).then((response) => {
      if (response.data.success) {
        axios({
          withCredentials: true,
          method: "post",
          url: proxy + this.state.city + '/jce/Diary/GetResultByEvalution?_dc=' + (new Date() * 1),
          data: "journalId=" + journalId + "&evalId=" + evalId2 + "&page=1&start=0&limit=25"
        }).then((response2) => {
          self.setState({
            loading: false,
            modal: true,
            modalShow: true,
            JKO: [response.data.data, response2.data.data]
          })
        })
      }
    })
  }
  closeModal() {
    this.setState({
      modalShow: false
    })
    setTimeout(() => {
      this.setState({
        modal: false,
        goals: [],
        homework: []
      })
    }, 500)
  }
  logout() {
    cookie.remove('pin')
    cookie.remove('password')
    cookie.remove('city')
    cookie.remove('role')
    cookie.remove('journal')
    this.setState({
      redirect: true
    })
    this.props.logout()
  }
  handleChange = (selectedOption) => {
    var self = this
    if (selectedOption) {
      if (this.state.journal === 'IMKO') {
        axios({
          withCredentials: true,
          method: 'post',
          url: proxy + this.state.city + '/ImkoDiary/Subjects',
          data: 'periodId=1&studentId=' + self.state.childrenList[selectedOption.value].Id
        }).then((response) => {
          if (response.data.success) {
            var data = self.state.data
            data[selectedOption.value] = {data: {}}
            data[selectedOption.value].data[0] = { data: response.data.data }
            self.setState({
              loading: false,
              data: data,
              child: selectedOption.value,
              quarter: 0
            })
          }
        })
      } else if (this.state.journal === 'JKO') {
        axios({
          withCredentials: true,
          method: 'post',
          url: proxy + this.state.city + '/JceDiary/GetDiaryUrl/',
          data: 'klassId=' + self.state.childrenList[selectedOption.value].klass + '&periodId=1&studentId=' + self.state.childrenList[selectedOption.value].Id
        }).then((response) => {
          axios({
            withCredentials: true,
            method: 'post',
            url: proxy + response.data.data,
          }).then((response) => {
            axios({
              withCredentials: true,
              method: 'post',
              url: proxy + this.state.city + '/jce/Diary/GetSubjects',
              data: 'page=1&start=0&limit=25'
            }).then((response) => {
              var data = self.state.data
              data[selectedOption.value] = {data: {}}
              data[selectedOption.value].data[0] = { data: response.data.data }
              self.setState({
                loading: false,
                child: selectedOption.value,
                data: data,
                quarter: 0
              })
            })
          })
        })
      }
    } else {
      this.setState({
        child: 0
      });
    }
  }
  loadQuarter(id, child) {
    if (this.state.data[child].data[id]) {
      this.setState({
        quarter: id
      })
    } else {
      var self = this
      this.setState({
        loading: true
      })
      if (this.state.journal === 'IMKO') {
        axios({
          withCredentials: true,
          method: 'post',
          url: proxy + this.state.city + '/ImkoDiary/Subjects',
          data: 'periodId=' + (id * 1 + 1) + (self.state.role === 'Parent' ? '&studentId=' + self.state.childrenList[child].Id : '')
        }).then((response) => {
          if (response.data.success) {
            var data = self.state.data
            data[child].data[id] = { data: response.data.data }
            self.setState({
              loading: false,
              data: data,
              quarter: id
            })
          }
        })
      } else if (this.state.journal === 'JKO') {
        axios({
          withCredentials: true,
          method: 'post',
          url: proxy + this.state.city + '/JceDiary/GetDiaryUrl/',
          data: 'klassId=' + (self.state.role === 'Parent' ? self.state.childrenList[child].klass : this.state.klass) + '&periodId=' + (id * 1 + 1) + (self.state.role === 'Parent' ? '&studentId=' + self.state.childrenList[child].Id : '&studentId=' + this.state.id)
        }).then((response) => {
          axios({
            withCredentials: true,
            method: 'post',
            url: proxy + response.data.data,
          }).then((response) => {
            axios({
              withCredentials: true,
              method: 'post',
              url: proxy + this.state.city + '/jce/Diary/GetSubjects',
              data: 'page=1&start=0&limit=25'
            }).then((response) => {
              var data = self.state.data
              data[child].data[id] = { data: response.data.data }
              self.setState({
                loading: false,
                data: data,
                quarter: id
              })
            })
          })
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
            <div className={this.state.loading ? 'loader active' : 'loader'} />
            <div className={this.state.modalShow ? 'modal active' : 'modal'}>
              <div onClick={this.closeModal} className="modal-back" />
              <div className="modal-content">
                <div onClick={this.closeModal} className="close">
                  <svg viewBox="0 0 32 32" width="16" height="16" fill="none" stroke="currentcolor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="4">
                    <path d="M2 30 L30 2 M30 30 L2 2" />
                  </svg>
                </div>
                {
                  this.state.modal ? (
                    this.state.journal === 'IMKO' ? (<div className="goals-homework">
                      <div className="goals">
                        <h2 className="title">Цели</h2>
                        {
                          this.state.goals.length ? getGoals(this.state.goals) : (
                            <div className="empty">
                              Пусто
                          </div>
                          )
                        }
                      </div>
                      <div className="homework">
                        <h2 className="title">Домашняя работа</h2>
                        {this.state.homework.length ? (
                          this.state.homework.map((work) => {
                            var html = {
                              __html: stripHTMLTags(unescape(work.description))
                            }
                            return (
                              <div key={work.date} className="work">
                                <div className="info">
                                  <span className="date">
                                    {timeConv(work.date)}
                                  </span>
                                </div>
                                <div dangerouslySetInnerHTML={html} className="work-content">
                                </div>
                                {work.files.length ? (
                                  <div className="attached">
                                    {work.files.map((file) => (
                                      <a key={file} download href={this.state.city + file}>
                                        <div className="file">
                                          <svg fill="#fff" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24">
                                            <path d={getIcon(file.split('.')[file.split('.').length - 1])} />
                                          </svg>
                                        </div>
                                      </a>
                                    ))}
                                  </div>
                                ) : ''}
                              </div>
                            )
                          })
                        ) : (
                            <div className="empty">
                              Пусто
                        </div>
                          )}
                      </div>
                    </div>) : (
                        <div className="goals-homework">
                          {this.state.JKO.map((section, index) => (
                            <div key={index} className="homework">
                              {index === 0 ? (<h2 className="title">Раздел</h2>) : (<h2 className="title">Четверть</h2>)}
                              {section.map((topic) => (
                                <div key={topic.Id} className="work">
                                  <h3 className="name"> {topic.Name} </h3>
                                  <span>{(topic.Score === -1 ? 0 : topic.Score) + ' | ' + topic.MaxScore} </span>
                                </div>
                              ))}
                            </div>
                          ))}
                        </div>
                      )
                  ) : ''
                }
              </div>
            </div>

            <div className="menu">
              {
                this.state.role === 'Parent' ? (
                  <Select
                    name="form-field-name"
                    value={this.state.child}
                    placeholder="Ученик"
                    searchable={false}
                    onChange={this.handleChange}
                    options={getList(this.state.childrenList)}
                  />) : ''
              }
              <div onClick={this.logout} className="logout button">
                Выйти
              </div>
            </div>
            <div className="tabs">
              <div onClick={() => {
                this.loadQuarter(0, this.state.child)
              }} className={this.state.quarter === 0 ? 'tab active' : 'tab'}>
                1 четверть
              </div>
              <div onClick={() => {
                this.loadQuarter(1, this.state.child)
              }} className={this.state.quarter === 1 ? 'tab active' : 'tab'}>
                2 четверть
              </div>
              <div onClick={() => {
                this.loadQuarter(2, this.state.child)
              }} className={this.state.quarter === 2 ? 'tab active' : 'tab'}>
                3 четверть
              </div>
              <div onClick={() => {
                this.loadQuarter(3, this.state.child)
              }} className={this.state.quarter === 3 ? 'tab active' : 'tab'}>
                4 четверть
              </div>
            </div>
            <div className="subjects">
              {this.state.data ? this.state.journal === 'IMKO' ? (<div className="subjects">
                {this.state.data[this.state.child].data[this.state.quarter].data.map((subject) => (
                  <div key={subject.Id} onClick={() => {
                    this.state.role === 'Parent' ? this.getGoalIMKO(subject.Id, this.state.childrenList[this.state.child].Id) : this.getGoalIMKO(subject.Id, null)
                  }} className="subject">
                    <div className={getWidth(subject) === 100 ? 'progress full' : 'progress'} style={{
                      width: getWidth(subject) + '%'
                    }} />
                    <h2 className="title">{subject.Name}</h2>
                    <div className="subject-info">
                      <div className="formative">
                        <div className="name">
                          ФО
                        </div>
                        <div className="value">
                          {subject.ApproveCnt + ' | ' + subject.Cnt}
                        </div>
                      </div>
                      <div className="summative">
                        <div className="name">
                          ВСО
                        </div>
                        <div className="value">
                          {subject.ApproveISA + ' | ' + subject.MaxISA}
                        </div>
                      </div>
                      <div className="grade">
                        <div className="name">
                          Оценка
                        </div>
                        <div className="value">
                          {subject.Period ?
                            subject.Period : 'N/A'}
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>) : (
                  <div className="subjects">
                    {this.state.data[this.state.child].data[this.state.quarter].data.map((subject, index) => (
                      <div key={subject.Name} onClick={() => {
                        if (subject.Evalutions.length > 0) {
                          this.getGoalJKO(subject.JournalId, subject.Evalutions[0].Id, subject.Evalutions[1].Id)
                        }
                      }} className="subject jko">
                        <div className={subject.Score === 100 ? 'progress full' : 'progress'} style={{
                          width: subject.Score + '%'
                        }} />
                        <h2 className="title">{subject.Name}</h2>
                        <div className="subject-info">
                          <div className="percent">
                            <div className="name">
                              Процент
                            </div>
                            <div className="value">
                              {subject.Score ?
                                subject.Score + ' | 100' : 'N/A'}
                            </div>
                          </div>
                          <div className="grade">
                            <div className="name">
                              Оценка
                            </div>
                            <div className="value">
                              {subject.Mark ?
                                subject.Mark : 'N/A'}
                            </div>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : ''}
            </div>
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
      loading: false,
      message_text: '',
      city: cookie.load('cityID') ? cookie.load('cityID') : '',
      journal: cookie.load('journal') ? cookie.load('journal') : 'JKO',
      pin: "",
      password: "",
      remember: false
    };
    this.login = this.login.bind(this)
    this.loadRoles = this.loadRoles.bind(this)
    this.loginWithRole = this.loginWithRole.bind(this)
  }
  componentWillMount() {
    var self = this
    if (cookie.load('city')) {
      axios({
        withCredentials: true,
        method: "post",
        url: proxy + cookie.load('city') + '/EventCalendar/GetEvents',
      }).then((response) => {
        if (response.data.success) {
          self.props.onDone(cookie.load('role'), cookie.load('journal'), cookie.load('city'))
        }
      })
    }
    if (cookie.load('pin')) {
      this.login(cookie.load('pin'), cookie.load('password'), true)
    }
  }
  handleChange = (selectedOption) => {
    selectedOption ? this.setState({
      city: selectedOption.value
    }) : this.setState({
      city: ''
    });
  }
  login(pin, password, remember) {
    var self = this
    this.setState({
      loading: true
    })
    axios({
      withCredentials: true,
      method: "post",
      url: proxy + cities[this.state.city].code + '/Account/Login',
      data: "txtUsername=" + pin + "&txtPassword=" + password
    }).then((response) => {
      if (response.data.success) {
        self.loadRoles(pin, password, remember)
        if (remember) {
          cookie.save('pin', pin, {
            maxAge: 60 * 60 * 24 * 14
          })
          cookie.save('password', password, {
            maxAge: 60 * 60 * 24 * 14
          })
          cookie.save('city', response.data.url, {
            maxAge: 60 * 60 * 24 * 14
          })
          cookie.save('journal', self.state.journal, {
            maxAge: 60 * 60 * 24 * 14
          })
          cookie.save('cityID', self.state.city, {
            maxAge: 60 * 60 * 24 * 14
          })
        } else {
          cookie.save('city', response.data.url)
          cookie.save('journal', self.state.journal)
        }
      } else {
        self.setState({
          message: true,
          loading: false,
          message_text: 'Неверный пароль'
        })

      }
    }).catch((error) => {
      self.setState({
        message: true,
        loading: false,
        message_text: 'Ошибка'
      })
    })
  }
  loadRoles(pin, password, remember) {
    var self = this
    axios({
      withCredentials: true,
      method: 'post',
      url: proxy + cities[this.state.city].code + '/Account/GetRoles'
    }).then((response) => {
      if (response.data.success) {
        self.loginWithRole(response.data.listRole[0].value, pin, password, remember)
      } else {
        self.setState({
          message: true,
          loading: false,
          message_text: 'Ошибка загрузки ролей'
        })
      }
    }).catch((error) => {
      self.setState({
        message: true,
        loading: false,
        message_text: 'Ошибка'
      })
    })
  }
  loginWithRole(role, pin, password, remember) {
    var self = this
    axios({
      withCredentials: true,
      method: 'post',
      url: proxy + cities[this.state.city].code + '/Home/PasswordCheck',
      data: 'password=' + password + '&role=' + role
    }).then((response) => {
      if (response.data.success) {
        if (remember) {
          cookie.save('role', response.data.role, {
            maxAge: 60 * 60 * 24 * 14
          })
        } else {
          cookie.save('role', response.data.role)
        }
        self.props.onDone(response.data.role, this.state.journal, cities[this.state.city].code)
      }
    })
  }
  render() {
    return (
      <div className="login">
        <div className={this.state.loading ? 'loader active' : 'loader'} />
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
            <form className="form" onKeyPress={(e) => {
              if(e && e.keyCode === 13) {
                this.login(this.state.pin, this.state.password, this.state.remember)
              }
            }}>
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
              <Toggle initState={cookie.load('journal') ? cookie.load('journal') === 'IMKO' ? true : false : false} onChange={(value) => {
                this.setState({
                  journal: value ? 'IMKO' : 'JKO'
                })

              }} label="ИМКО" label0="ЖКО" />
            </div>
            <button onClick={() => {
              this.login(this.state.pin, this.state.password, this.state.remember)
            }} className="button">
              Войти
          </button>
          </div>
          <footer>
            <span>Coded with </span>
            <svg fill="#5b5b5b" width="12" height="12" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
              <circle cx="12" cy="12" r="2.139" />
              <path d="M6.008 16.255l-.472-.12C2.018 15.246 0 13.737 0 11.996s2.018-3.25 5.536-4.139l.472-.119.133.468a23.53 23.53 0 0 0 1.363 3.578l.101.213-.101.213a23.307 23.307 0 0 0-1.363 3.578l-.133.467zM5.317 8.95c-2.674.751-4.315 1.9-4.315 3.046 0 1.145 1.641 2.294 4.315 3.046a24.95 24.95 0 0 1 1.182-3.046A24.752 24.752 0 0 1 5.317 8.95zM17.992 16.255l-.133-.469a23.357 23.357 0 0 0-1.364-3.577l-.101-.213.101-.213a23.42 23.42 0 0 0 1.364-3.578l.133-.468.473.119c3.517.889 5.535 2.398 5.535 4.14s-2.018 3.25-5.535 4.139l-.473.12zm-.491-4.259c.48 1.039.877 2.06 1.182 3.046 2.675-.752 4.315-1.901 4.315-3.046 0-1.146-1.641-2.294-4.315-3.046a24.788 24.788 0 0 1-1.182 3.046z" /><path d="M5.31 8.945l-.133-.467C4.188 4.992 4.488 2.494 6 1.622c1.483-.856 3.864.155 6.359 2.716l.34.349-.34.349a23.552 23.552 0 0 0-2.422 2.967l-.135.193-.235.02a23.657 23.657 0 0 0-3.785.61l-.472.119zm1.896-6.63c-.268 0-.505.058-.705.173-.994.573-1.17 2.565-.485 5.253a25.122 25.122 0 0 1 3.233-.501 24.847 24.847 0 0 1 2.052-2.544c-1.56-1.519-3.037-2.381-4.095-2.381zM16.795 22.677c-.001 0-.001 0 0 0-1.425 0-3.255-1.073-5.154-3.023l-.34-.349.34-.349a23.53 23.53 0 0 0 2.421-2.968l.135-.193.234-.02a23.63 23.63 0 0 0 3.787-.609l.472-.119.134.468c.987 3.484.688 5.983-.824 6.854a2.38 2.38 0 0 1-1.205.308zm-4.096-3.381c1.56 1.519 3.037 2.381 4.095 2.381h.001c.267 0 .505-.058.704-.173.994-.573 1.171-2.566.485-5.254a25.02 25.02 0 0 1-3.234.501 24.674 24.674 0 0 1-2.051 2.545z" /><path d="M18.69 8.945l-.472-.119a23.479 23.479 0 0 0-3.787-.61l-.234-.02-.135-.193a23.414 23.414 0 0 0-2.421-2.967l-.34-.349.34-.349C14.135 1.778 16.515.767 18 1.622c1.512.872 1.812 3.37.824 6.855l-.134.468zM14.75 7.24c1.142.104 2.227.273 3.234.501.686-2.688.509-4.68-.485-5.253-.988-.571-2.845.304-4.8 2.208A24.849 24.849 0 0 1 14.75 7.24zM7.206 22.677A2.38 2.38 0 0 1 6 22.369c-1.512-.871-1.812-3.369-.823-6.854l.132-.468.472.119c1.155.291 2.429.496 3.785.609l.235.02.134.193a23.596 23.596 0 0 0 2.422 2.968l.34.349-.34.349c-1.898 1.95-3.728 3.023-5.151 3.023zm-1.19-6.427c-.686 2.688-.509 4.681.485 5.254.987.563 2.843-.305 4.8-2.208a24.998 24.998 0 0 1-2.052-2.545 24.976 24.976 0 0 1-3.233-.501z" /><path d="M12 16.878c-.823 0-1.669-.036-2.516-.106l-.235-.02-.135-.193a30.388 30.388 0 0 1-1.35-2.122 30.354 30.354 0 0 1-1.166-2.228l-.1-.213.1-.213a30.3 30.3 0 0 1 1.166-2.228c.414-.716.869-1.43 1.35-2.122l.135-.193.235-.02a29.785 29.785 0 0 1 5.033 0l.234.02.134.193a30.006 30.006 0 0 1 2.517 4.35l.101.213-.101.213a29.6 29.6 0 0 1-2.517 4.35l-.134.193-.234.02c-.847.07-1.694.106-2.517.106zm-2.197-1.084c1.48.111 2.914.111 4.395 0a29.006 29.006 0 0 0 2.196-3.798 28.585 28.585 0 0 0-2.197-3.798 29.031 29.031 0 0 0-4.394 0 28.477 28.477 0 0 0-2.197 3.798 29.114 29.114 0 0 0 2.197 3.798z" />
            </svg>
            <span> by </span>
            <a className="link" href="https://uenify.com/">
              <svg fill="#5b5b5b" viewBox="0 0 24 24" width="12" height="12">
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
