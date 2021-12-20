const Clock = document.querySelector(".clock");
const Weather = document.querySelector(".weather");
const askNameForm = document.querySelector(".ask-name");
const nowUser = document.querySelector(".now-user");
const askToDo = document.querySelector(".ask-todo");
const toDoList = document.querySelector(".todo-list");
const logOut = document.querySelector(".out");
const select = document.querySelector(".select");
const allShowing = document.querySelector(".all-showing");
const activeShowing = document.querySelector(".active-showing");
const completedShowing = document.querySelector(".completed-showing");
const signUpForm = document.querySelector(".sign-up");
const clearAll = document.querySelector(".clear-all");
const loading = document.querySelector(".loading");
const loadingSignUp = document.querySelector(".loading-signup");
// add comment
// add another comment 3
let userInfo;

const clockInit = () => {
  const date = new Date();
  const hours = date.getHours();
  const minutes = date.getMinutes();
  const seconds = date.getSeconds();
  Clock.innerHTML = `${hours < 10 ? `0${hours}` : hours}:${
    minutes < 10 ? `0${minutes}` : minutes
  }:${seconds < 10 ? `0${seconds}` : seconds}`;
};

const weahterInit = () => {
  const API_KEY = "8770888add5f58737b94acfe5b1428c5";
  if (!localStorage.getItem("coords")) {
    navigator.geolocation.getCurrentPosition(
      (position) => {
        const lat = position.coords.latitude;
        const lng = position.coords.longitude;
        console.log(lat, lng);
        localStorage.setItem("coords", JSON.stringify({ lat, lng }));
        fetch(
          `https://api.openweathermap.org/data/2.5/weather?lat=${lat}&lon=${lng}&appid=${API_KEY}&units=metric`
        )
          .then((res) => res.json())
          .then(
            (json) => (Weather.innerHTML = `${json.main.temp} @ ${json.name}`)
          )
          .catch((err) => console.log(err));
        console.log(localStorage.getItem("coords"));
      },
      (err) => console.log(err)
    );
  } else {
    const lat = JSON.parse(localStorage.getItem("coords")).lat;
    const lng = JSON.parse(localStorage.getItem("coords")).lng;
    fetch(
      `https://api.openweathermap.org/data/2.5/weather?lat=${lat}&lon=${lng}&appid=${API_KEY}&units=metric`
    )
      .then((res) => res.json())
      .then((json) => (Weather.innerHTML = `${json.main.temp} @ ${json.name}`))
      .catch((err) => console.log(err));
  }
};

const checkUser = () => {
  fetch("https://node-todo-kmuse.herokuapp.com/")
    .then((data) => data.json())
    .then((json) => {
      if (!json.error && !json.nosession) {
        userInfo = json;
        askNameForm.style.display = "none";
        signUpForm.style.display = "none";
        nowUser.style.display = "block";
        askToDo.style.display = "block";
        toDoList.style.display = "block";
        select.style.display = "block";
        logOut.style.display = "block";
        clearAll.style.display = "block";
        nowUser.innerHTML = `Hello ${userInfo.name}`;
        paintToDo(userInfo);
      } else {
        askNameForm.style.display = "block";
        signUpForm.style.display = "block";
        nowUser.style.display = "none";
        askToDo.style.display = "none";
        toDoList.style.display = "none";
        select.style.display = "none";
        logOut.style.display = "none";
        clearAll.style.display = "none";
      }
    })
    .catch((err) => console.log(err));
};

const signUpUser = (e) => {
  e.preventDefault();
  let userName = Array.from(e.target.elements).find(
    (v) => v.name == "user"
  ).value;
  let passWord = Array.from(e.target.elements).find(
    (v) => v.name == "pass"
  ).value;
  let passConfirm = Array.from(e.target.elements).find(
    (v) => v.name == "pass-confirm"
  ).value;
  signUpForm.style.display = "none";
  loadingSignUp.style.display = "block";
  fetch("https://node-todo-kmuse.herokuapp.com/signup", {
    method: "POST",
    body: JSON.stringify({
      name: userName,
      password: passWord,
      passconfirm: passConfirm,
    }),
    headers: { "Content-Type": "application/json" },
  })
    .then((result) => result.json())
    .then((resultJson) => {
      loadingSignUp.style.display = "none";
      signUpForm.style.display = "block";
      console.log(resultJson);
      if (resultJson.error) {
        alert(resultJson.error);
      } else {
        Array.from(e.target.elements).forEach((v) => {
          if (v.tagName == "INPUT") v.value = "";
        });
        alert(resultJson.success);
      }
    })
    .catch((err) => console.log(err));
};

const submitUser = (e) => {
  e.preventDefault();
  let userName = Array.from(e.target.elements).find(
    (v) => v.name == "name"
  ).value;
  let passWord = Array.from(e.target.elements).find(
    (v) => v.name == "pass"
  ).value;
  askNameForm.style.display = "none";
  loading.style.display = "block";
  fetch("https://node-todo-kmuse.herokuapp.com/login", {
    method: "POST", // or 'PUT'
    body: JSON.stringify({ name: userName, password: passWord }), // data can be `string` or {object}!
    headers: { "Content-Type": "application/json" },
  })
    .then((user) => user.json())
    .then((userJson) => {
      loading.style.display = "none";
      if (!userJson.error) {
        checkUser();
        Array.from(e.target.elements).forEach((v) => {
          if (v.tagName == "INPUT") v.value = "";
        });
        alert(userJson.success);
      } else {
        askNameForm.style.display = "block";
        alert(userJson.error);
      }
    })
    .catch((err) => console.log(err));
};

const submitToDo = (e) => {
  e.preventDefault();
  let todoValue = Array.from(e.target.elements)
    .find((v) => v.name == "todo")
    .value.trim();
  let toDos = userInfo.todos.slice();
  let toDoObj = { title: todoValue };
  toDos.push(toDoObj);
  fetch(`https://node-todo-kmuse.herokuapp.com/user/${userInfo._id}`, {
    method: "PUT",
    body: JSON.stringify({ todos: toDos }),
    headers: { "Content-Type": "application/json" },
  })
    .then((user) => user.json())
    .then((json) => {
      if (json.error) return alert(json.error);
      Array.from(e.target.elements).find((v) => v.name == "todo").value = "";
      userInfo = json;
      return paintToDo(json);
    })
    .catch((err) => console.log(err));
};

const toggleCheck = (e) => {
  let targetUserId = userInfo._id;
  let targetId = e.target.parentNode.id.toString();
  let toDoTag = e.target.parentNode.querySelector("span");
  let toggle = toDoTag.classList.toggle("completed");
  fetch(
    `https://node-todo-kmuse.herokuapp.com/user/${targetUserId}/todo/${targetId}`,
    {
      method: "PUT",
      body: JSON.stringify({ completed: JSON.stringify(toggle) }),
      headers: { "Content-Type": "application/json" },
    }
  )
    .then((_) => _)
    .catch((err) => console.log(err));
};

const deleteToDo = (e) => {
  let targetUserId = userInfo._id;
  let targetId = e.target.parentNode.id;
  fetch(
    `https://node-todo-kmuse.herokuapp.com/user/${targetUserId}/todo/${targetId}`,
    {
      method: "DELETE",
    }
  )
    .then((user) => user.json())
    .then((json) => {
      userInfo = json;
      paintToDo(json);
    })
    .catch((err) => console.log(err));
};

const deleteAll = (e) => {
  fetch(`https://node-todo-kmuse.herokuapp.com/user/${userInfo._id}`, {
    method: "PUT",
    body: JSON.stringify({ todos: [] }),
    headers: { "Content-Type": "application/json" },
  })
    .then((_) => checkUser())
    .catch((err) => console.log(err));
};

const paintToDo = (user) => {
  toDoList.innerHTML = "";
  user.todos.forEach((v, i) => {
    let li = document.createElement("li");
    li.id = user.todos[i]._id;
    let button = document.createElement("button");
    button.addEventListener("click", deleteToDo);
    button.innerHTML = "X";
    let checkbox = document.createElement("input");
    checkbox.type = "checkbox";
    checkbox.addEventListener("click", toggleCheck);
    let titleSpan = document.createElement("span");
    titleSpan.innerHTML = "&nbsp&nbsp" + v.title + "&nbsp&nbsp";
    if (v.completed) {
      titleSpan.className = "completed";
      checkbox.checked = true;
    }
    li.prepend(checkbox);
    li.appendChild(titleSpan);
    li.appendChild(button);
    toDoList.appendChild(li);
  });
};

const LogOut = () => {
  // document.cookie = `connect.sid=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;`;
  // in backend,  you can use res.setHeader('Set-Cookie',....), and next res.append, ref: express doc
  document.cookie = `test2=false`;
  document.cookie = `test3=true`;
  console.log(document.cookie);
  fetch(`https://node-todo-kmuse.herokuapp.com/logout`, {
    method: "POST",
    body: "",
    headers: { "Content-Type": "application/json" },
  })
    .then((_) => {
      alert("Good-Bye");
      checkUser();
    })
    .catch((err) => console.log(err));
};

askToDo.addEventListener("submit", submitToDo);
askNameForm.addEventListener("submit", submitUser);
signUpForm.addEventListener("submit", signUpUser);
clearAll.addEventListener("click", deleteAll);
logOut.addEventListener("click", LogOut);

allShowing.addEventListener("click", (e) => {
  let allList = Array.from(document.querySelectorAll("li"));
  allList.forEach((v) => {
    if (v.classList.contains("hide")) {
      v.classList.remove("hide");
    } else return;
  });
});
activeShowing.addEventListener("click", (e) => {
  Array.from(document.querySelectorAll("li")).forEach((v) => {
    if (
      Array.from(v.childNodes).find((x) => x.tagName == "SPAN").className !=
      "completed"
    ) {
      if (v.classList.contains("hide")) {
        v.classList.remove("hide");
      }
    }
    if (
      Array.from(v.childNodes).find((x) => x.tagName == "SPAN").className ==
      "completed"
    ) {
      if (!v.classList.contains("hide")) {
        v.classList.add("hide");
      }
    }
  });
});
completedShowing.addEventListener("click", (e) => {
  Array.from(document.querySelectorAll("li")).forEach((v) => {
    if (
      Array.from(v.childNodes).find((x) => x.tagName == "SPAN").className ==
      "completed"
    ) {
      if (v.classList.contains("hide")) {
        v.classList.remove("hide");
      }
    }
    if (
      Array.from(v.childNodes).find((x) => x.tagName == "SPAN").className !=
      "completed"
    ) {
      if (!v.classList.contains("hide")) {
        v.classList.add("hide");
      }
    }
  });
});

checkUser();
setInterval(clockInit, 1000);
weahterInit();
