import { supabase } from './supabase.js';

// Sections
const loginSection = document.getElementById("login-section");
const phoneSection = document.getElementById("phone-section");
const dashboard = document.getElementById("dashboard");

// Elements
const googleLoginBtn = document.getElementById("google-login");
const savePhoneBtn = document.getElementById("save-phone");
const usernameEl = document.getElementById("username");
const servicesEl = document.getElementById("services");
const postJobBtn = document.getElementById("post-job");
const jobDesc = document.getElementById("job-desc");
const activeJobEl = document.getElementById("active-job");
const donateBtn = document.getElementById("donate");
const logoutBtn = document.getElementById("logout");

// Services (static for now, manager will control later)
const services = ["Plumber", "Electrician", "Cleaner", "Gardener"];

// Show services
services.forEach(service => {
  let btn = document.createElement("button");
  btn.innerText = service;
  btn.onclick = () => selectService(service);
  servicesEl.appendChild(btn);
});

let selectedService = null;
function selectService(service) {
  selectedService = service;
  alert(`Selected service: ${service}`);
}

// Google Login
googleLoginBtn.onclick = async () => {
  const { data, error } = await supabase.auth.signInWithOAuth({
    provider: "google"
  });
  if (error) alert(error.message);
};

// Check Auth State
supabase.auth.onAuthStateChange(async (event, session) => {
  if (session) {
    let user = session.user;

    // Check IP restriction
    const ip = await fetch("https://api64.ipify.org?format=json").then(res => res.json());
    let { data: existingUser } = await supabase
      .from("clients")
      .select("*")
      .eq("ip_address", ip.ip);

    if (existingUser.length > 0 && existingUser[0].user_id !== user.id) {
      alert("Only one account allowed per IP!");
      await supabase.auth.signOut();
      return;
    }

    // Check if user already has phone number
    let { data: clientProfile } = await supabase
      .from("clients")
      .select("*")
      .eq("user_id", user.id)
      .single();

    if (!clientProfile) {
      loginSection.classList.add("hidden");
      phoneSection.classList.remove("hidden");
    } else {
      loadDashboard(clientProfile);
    }
  }
});

// Save phone
savePhoneBtn.onclick = async () => {
  let phone = document.getElementById("phone").value;
  const session = (await supabase.auth.getSession()).data.session;
  const user = session.user;

  const ip = await fetch("https://api64.ipify.org?format=json").then(res => res.json());

  let { error } = await supabase.from("clients").insert({
    user_id: user.id,
    email: user.email,
    phone: phone,
    ip_address: ip.ip
  });

  if (error) alert(error.message);
  else loadDashboard({ email: user.email, phone });
};

// Load dashboard
function loadDashboard(profile) {
  phoneSection.classList.add("hidden");
  loginSection.classList.add("hidden");
  dashboard.classList.remove("hidden");
  usernameEl.innerText = profile.email;
}

// Post job
postJobBtn.onclick = async () => {
  if (!selectedService) {
    alert("Please select a service first!");
    return;
  }

  const desc = jobDesc.value;
  const session = (await supabase.auth.getSession()).data.session;
  const user = session.user;

  let { error } = await supabase.from("jobs").insert({
    client_id: user.id,
    service: selectedService,
    description: desc,
    status: "pending"
  });

  if (error) alert(error.message);
  else {
    activeJobEl.innerText = `${selectedService} requested: ${desc}`;
    alert("Job posted successfully!");
  }
};

// Donate button
donateBtn.onclick = () => {
  alert("Thank you for supporting the worker! (No payment gateway added)");
};

// Logout
logoutBtn.onclick = async () => {
  await supabase.auth.signOut();
  dashboard.classList.add("hidden");
  loginSection.classList.remove("hidden");
};