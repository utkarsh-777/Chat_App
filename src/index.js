import React from 'react';
import ReactDOM from 'react-dom';
import App from './components/App';
import reportWebVitals from './reportWebVitals';
import {BrowserRouter as Router,Route,Switch,withRouter} from "react-router-dom"
import Login from './components/Auth/Login';
import Register from './components/Auth/Register';
import 'semantic-ui-css/semantic.min.css'
import firebase from "firebase/app"

import {createStore} from "redux";
import {Provider,connect} from "react-redux";
import {composeWithDevTools} from "redux-devtools-extension";
import rootReducer from './reducers';
import { setUser,clearUser } from "./actions";
import Spinner from "./Spinner"

const store = createStore(rootReducer,composeWithDevTools());

class Root extends React.Component {
  componentDidMount(){
    firebase.auth().onAuthStateChanged(user=>{
      if(user){
        this.props.setUser(user)
        this.props.history.push("/")
      }else{
        this.props.history.push('/login')
        this.props.clearUser()
      }
    })
  }
  render(){
    return this.props.isLoading ? <Spinner /> : (
        <Switch>
          <Route exact path='/' component={App} />
          <Route exact path='/login' component={Login} />
          <Route exact path='/register' component={Register} /> 
        </Switch>
    )
  }
} 

const mapStateFromProps = state => ({
  isLoading: state.user.isLoading
})

const RootWithAuth = withRouter(
  connect(mapStateFromProps,
    {setUser,clearUser}
    )(Root)
);

ReactDOM.render(
  <Provider store={store}>
    <Router>
      <React.StrictMode>
        <RootWithAuth />
      </React.StrictMode>
    </Router>
  </Provider>,
  document.getElementById('root')
);

// If you want to start measuring performance in your app, pass a function
// to log results (for example: reportWebVitals(console.log))
// or send to an analytics endpoint. Learn more: https://bit.ly/CRA-vitals
reportWebVitals();
