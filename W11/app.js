const loginUser = document.getElementById("loginUser");
const loginPass = document.getElementById("loginPass");
const loginBtn = document.getElementById("loginBtn");
const loginMsg = document.getElementById("loginMsg");

const nameInput = document.getElementById("name");
const email = document.getElementById("email");
const mobile = document.getElementById("mobile");
const dob = document.getElementById("dob");
const city = document.getElementById("city");
const address = document.getElementById("address");
const regUser = document.getElementById("regUser");
const regPass = document.getElementById("regPass");
const registerBtn = document.getElementById("registerBtn");
const regMsg = document.getElementById("regMsg");

function getUsers() {
  return JSON.parse(localStorage.getItem("users") || "[]");
}

function saveUsers(users) {
  localStorage.setItem("users", JSON.stringify(users));
}

function validateRegistration() {
  if (!nameInput.value.trim()) return "Name required";
  if (!/^[^@]+@[^@]+\.[^@]+$/.test(email.value.trim())) return "Valid email required";
  if (!/^\d{10}$/.test(mobile.value.trim())) return "Mobile must be 10 digits";
  if (!dob.value.trim()) return "DOB required";
  if (!city.value.trim()) return "City required";
  if (!address.value.trim()) return "Address required";
  if (!regUser.value.trim()) return "Username required";
  if (regPass.value.trim().length < 4) return "Password min 4 chars";
  return "";
}

function ajaxPost(data, onSuccess) {
  const xhr = new XMLHttpRequest();
  xhr.open("POST", "/output", true);
  xhr.setRequestHeader("Content-Type", "application/json");
  xhr.onload = function () {
    if (xhr.status >= 200 && xhr.status < 300) {
      onSuccess(xhr.responseText);
    }
  };
  xhr.send(JSON.stringify(data));
}

registerBtn.addEventListener("click", async () => {
  const error = validateRegistration();
  if (error) {
    regMsg.textContent = error;
    return;
  }

  const users = getUsers();
  const nameValueRaw = nameInput.value.trim();
  const emailValueRaw = email.value.trim();
  const mobileValue = mobile.value.trim();
  const usernameValueRaw = regUser.value.trim();
  const nameValue = nameValueRaw.toLowerCase();
  const emailValue = emailValueRaw.toLowerCase();
  const usernameValue = usernameValueRaw.toLowerCase();
  const duplicate = users.find((u) => {
    const userName = (u.username || "").trim().toLowerCase();
    const userEmail = (u.email || "").trim().toLowerCase();
    const userMobile = (u.mobile || "").trim();
    return userName === usernameValue || userEmail === emailValue || userMobile === mobileValue;
  });

  if (duplicate) {
    regMsg.textContent = "Duplicate username, email, or mobile not allowed.";
    return;
  }

  const newUser = {
    name: nameValueRaw,
    email: emailValueRaw,
    mobile: mobileValue,
    dob: dob.value.trim(),
    city: city.value.trim(),
    address: address.value.trim(),
    username: usernameValueRaw,
    password: regPass.value.trim()
  };

  users.push(newUser);
  saveUsers(users);
  ajaxPost(users, (html) => {
    const win = window.open("", "_blank");
    if (win) {
      win.document.write(html);
    }
  });
  regMsg.textContent = "Registered successfully.";
});

loginBtn.addEventListener("click", () => {
  if (!loginUser.value.trim() || !loginPass.value.trim()) {
    loginMsg.textContent = "Username and password required.";
    return;
  }
  const users = getUsers();
  const found = users.find(
    (u) => u.username === loginUser.value.trim() && u.password === loginPass.value.trim()
  );
  loginMsg.textContent = found ? "Login successful." : "Invalid username/password.";
});
