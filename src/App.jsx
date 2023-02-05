import { useState } from "react";
import "./App.css";
import React from "react";

import firebase from "firebase/compat/app";
import "firebase/compat/firestore";
import "firebase/compat/auth";
import "firebase/compat/database";

import { useAuthState, useSignInWithGoogle } from "react-firebase-hooks/auth";
import { useCollectionData } from "react-firebase-hooks/firestore";
import {
  getFirestore,
  collection,
  getDoc,
  doc,
  setDoc,
} from "firebase/firestore";

firebase.initializeApp({
  apiKey: "AIzaSyBf_tak2y6YCfcsp37dafAen88e0QVIsuU",
  authDomain: "to-do-12345.firebaseapp.com",
  projectId: "to-do-12345",
  storageBucket: "to-do-12345.appspot.com",
  messagingSenderId: "351233201560",
  appId: "1:351233201560:web:2f35d93729f6a3139d87ed",
});

const auth = firebase.auth();
const db = getFirestore();

export let tasksList;

function App() {
  const [user] = useAuthState(auth);

  const sync = () => {
    if (tasksList) {
      setDoc(doc(db, "tasks", String(firebase.auth().currentUser.uid)), {
        tasks: tasksList,
      });
    }
  };

  return (
    <div className="App">
      {user ? (
        <>
          <Todo /> <button onClick={sync}>sync with the cloud</button>
        </>
      ) : (
        <SignIn />
      )}
    </div>
  );
}

let imported = false;

function Todo() {
  const [tasks, setTasks] = useState([]);
  const [taskName, setTaskName] = useState("");

  if (imported == false) {
    GetTasks().then((data) => {
      setTasks(data.tasks);
      data.tasks.forEach(task => {
        if (task.completed === true){
          document.getElementById(`label-${task.id}`).style.textDecoration =
          "line-through";
          
        }
      });
      imported = true;
    });
  }

  tasksList = tasks;

  const handleCheckboxClick = (id) => {
    document.getElementById(`label-${id}`).style.textDecoration =
      "line-through";
    setTasks(
      tasks.map((task) => {
        if (task.id === id) {
          return { ...task, completed: !task.completed };
        }
        return task;
      })
    );
  };

  const handleSubmit = (e) => {
    console.log(tasks);
    if (!taskName) return;
    e.preventDefault();
    setTasks([
      ...tasks,
      { id: tasks.length, name: taskName, completed: false },
    ]);
    setTaskName("");
  };

  const clear = () => {
    setTasks([]);
  };

  const clearCompleted = () => {
    setTasks(tasks.filter((task) => !task.completed));
    console.log(tasks);
  };

  return (
    <div>
      <form onSubmit={handleSubmit}>
        <input
          type="text"
          value={taskName}
          onChange={(e) => setTaskName(e.target.value)}
        />
        <button type="submit">Add Task</button>
      </form>

      <button onClick={clear}>Delete all tasks</button>
      <button onClick={clearCompleted}>Delete all completed tasks</button>

      <ul className="tasks">
        {tasks.map((task) => (
          <li className="checkbox-group" key={task.id}>
            <input
              type="checkbox"
              id={`checkbox-${task.id}`}
              className="checkbox"
              defaultChecked={task.completed}
              onClick={() => handleCheckboxClick(task.id)}
            />
            <label id={`label-${task.id}`} className="label">
              {task.name}
            </label>
          </li>
        ))}
      </ul>
    </div>
  );
}

function SignIn() {
  const useSignInWithGoogle = () => {
    const provider = new firebase.auth.GoogleAuthProvider();
    auth.signInWithPopup(provider);
  };

  return <button onClick={useSignInWithGoogle}>Sign in with google</button>;
}

function SignOut() {
  return (
    auth.currentUser && <button onClick={() => auth.signOut()}>Sign out</button>
  );
}

async function GetTasks() {
  const docRef = doc(db, "tasks", String(firebase.auth().currentUser.uid));
  const docSnap = await getDoc(docRef);
  if (docSnap.exists()) {
    return docSnap.data();
  } else {
    console.error("No such document!");
  }
}

export default App;
