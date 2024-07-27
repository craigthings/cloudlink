import React from 'react'
import reactLogo from './assets/react.svg'
import viteLogo from '/vite.svg'
import './App.css'
import Functions, { saveTestUserData, saveUserData } from './FirebaseFunctions'
import authManager from './FirebaseAuthManager'

class App extends React.Component<any,{count: number}>{
  constructor(props: any) {
    super(props)
    // @ts-ignore
    window['auth'] = authManager;

    authManager.init();
    
    // @ts-ignore
    window['Funcs'] = Functions;
    // setTimeout(async () => {
    //   console.log(await Functions.updateUserProfileData('abc123', {name: 'Bob', age: 30}));
    // }, 0);
  }

  render() {
    return (
      <div className="App">
        <div className="card">
          <button onClick={() => {saveTestUserData()}}>
            Test Set User 
          </button>
          <button onClick={() => {saveUserData()}}>
            Save Current User
          </button>
          <button onClick={() => {authManager.login()}}>
            Log in
          </button>
          <button onClick={() => {authManager.logout()}}>
            Log out
          </button>
        </div>
        <p className="read-the-docs">
          Lorem Ipsum
        </p>
      </div>
    )
  }
  
}

export default App
