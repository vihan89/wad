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

async function ajaxPost(data) {
  try {
    await fetch("https://jsonplaceholder.typicode.com/posts", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data)
    });
  } catch (err) {
    // Ignore network errors for offline practice.
  }
}

registerBtn.addEventListener("click", async () => {
  const error = validateRegistration();
  if (error) {
    regMsg.textContent = error;
    return;
  }

  const users = getUsers();
  const newUser = {
    name: nameInput.value.trim(),
    email: email.value.trim(),
    mobile: mobile.value.trim(),
    dob: dob.value.trim(),
    city: city.value.trim(),
    address: address.value.trim(),
    username: regUser.value.trim(),
    password: regPass.value.trim()
  };

  await ajaxPost(newUser);
  users.push(newUser);
  saveUsers(users);
  regMsg.textContent = "Registered successfully.";
});

loginBtn.addEventListener("click", () => {
  const users = getUsers();
  const found = users.find(
    (u) => u.username === loginUser.value.trim() && u.password === loginPass.value.trim()
  );
  loginMsg.textContent = found ? "Login successful." : "Invalid username/password.";
});
