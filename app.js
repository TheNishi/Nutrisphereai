/**
 * NutriSphere AI - Application Core State & Logic
 */

// --- Global Application State ---
let state = {
  currentUser: null,
  profile: {
    name: "John Doe",
    age: 28,
    gender: "male",
    weight: 75, // kg
    height: 176, // cm
    activity: "moderate",
    goal: "lose",
    bmr: 1714,
    tdee: 2656,
    caloriesGoal: 2156,
    macrosGoal: { protein: 150, carbs: 220, fat: 60 }
  },
  logs: {
    breakfast: [],
    lunch: [],
    dinner: [],
    snacks: []
  },
  workouts: [],
  waterCups: 0,
  stepsCount: 4230,
  activeTab: "dashboardTab",
  visionModel: null
};

// Common Foods Database for AI Image Recognition & Quick Add Simulation
const foodCatalog = {
  salad: { name: "Garden Salad Bowl", calories: 280, protein: 8, carbs: 18, fat: 12, ingredients: "Fresh romaine lettuce, cucumbers, cherry tomatoes, olives, feta cheese, and olive oil dressing." },
  pizza: { name: "Margherita Pizza Slice", calories: 290, protein: 12, carbs: 36, fat: 11, ingredients: "Sourdough crust, fresh mozzarella cheese, tomato sauce, basil, and olive oil." },
  apple: { name: "Red Fuji Apple", calories: 95, protein: 0.5, carbs: 25, fat: 0.3, ingredients: "Raw fresh apple fruit." },
  chicken: { name: "Grilled Chicken Breast", calories: 198, protein: 37, carbs: 0, fat: 4.3, ingredients: "Boneless chicken breast cooked on a grill, salted and seasoned." },
  burger: { name: "Classic Cheeseburger", calories: 535, protein: 30, carbs: 40, fat: 28, ingredients: "Sesame bun, grilled beef patty, cheddar cheese, lettuce, tomato, pickles, and house burger sauce." },
  egg: { name: "Scrambled Eggs (2)", calories: 154, protein: 12, carbs: 1.2, fat: 11, ingredients: "Two organic eggs whisked and cooked in a pan with a dash of butter." },
  banana: { name: "Ripe Yellow Banana", calories: 105, protein: 1.3, carbs: 27, fat: 0.3, ingredients: "Raw ripe banana fruit." },
  salmon: { name: "Baked Salmon Fillet", calories: 367, protein: 40, carbs: 0, fat: 22, ingredients: "Atlantic salmon fillet baked with lemon juice, dill, and black pepper." },
  pasta: { name: "Tomato Basil Penne", calories: 410, protein: 14, carbs: 78, fat: 5, ingredients: "Durum wheat penne pasta, simmered tomato marinara sauce, fresh basil, and parmesan shavings." },
  steak: { name: "Grilled Sirloin Steak", calories: 420, protein: 46, carbs: 0, fat: 25, ingredients: "Beef sirloin steak seared in garlic butter and herbs." },
  avocado: { name: "Sourdough Avocado Toast", calories: 310, protein: 8, carbs: 32, fat: 15, ingredients: "Toasted sourdough bread slice topped with mashed avocado, cherry tomatoes, and red pepper flakes." },
  rice: { name: "Steamed Jasmine Rice (1 Cup)", calories: 205, protein: 4.2, carbs: 44.5, fat: 0.4, ingredients: "Polished long grain jasmine rice boiled in salted water." },
  sushi: { name: "Salmon Avocado Maki (6 Pcs)", calories: 320, protein: 14, carbs: 42, fat: 9, ingredients: "Sushi rice, seaweed sheets, fresh raw salmon, slices of avocado, sesame seeds." }
};

// Preset sample files for scanner visualization
const presetSampleFoods = [
  { keywords: ["salad", "green", "veg"], ...foodCatalog.salad },
  { keywords: ["pizza", "cheese", "crust"], ...foodCatalog.pizza },
  { keywords: ["chicken", "breast", "meat"], ...foodCatalog.chicken },
  { keywords: ["burger", "bun", "fast"], ...foodCatalog.burger },
  { keywords: ["egg", "breakfast", "yolk"], ...foodCatalog.egg },
  { keywords: ["pasta", "spaghetti", "sauce"], ...foodCatalog.pasta },
  { keywords: ["salmon", "fish", "baked"], ...foodCatalog.salmon },
  { keywords: ["avocado", "toast", "bread"], ...foodCatalog.avocado }
];

// --- Prepopulate Initial Dummy Data ---
function loadDefaultState() {
  state.logs.breakfast = [
    { name: "Scrambled Eggs (2)", calories: 154, protein: 12, carbs: 1.2, fat: 11, time: "08:15 AM", thumb: "🍳" },
    { name: "Sourdough Avocado Toast", calories: 310, protein: 8, carbs: 32, fat: 15, time: "08:20 AM", thumb: "🥑" }
  ];
  state.logs.lunch = [
    { name: "Grilled Chicken Breast", calories: 198, protein: 37, carbs: 0, fat: 4.3, time: "01:30 PM", thumb: "🍗" },
    { name: "Steamed Jasmine Rice (1 Cup)", calories: 205, protein: 4.2, carbs: 44.5, fat: 0.4, time: "01:35 PM", thumb: "🍚" }
  ];
  state.logs.snacks = [
    { name: "Red Fuji Apple", calories: 95, protein: 0.5, carbs: 25, fat: 0.3, time: "04:10 PM", thumb: "🍎" }
  ];
  state.workouts = [
    { name: "Brisk Walk (Steps Tracked)", duration: 25, caloriesBurned: 125 }
  ];
  state.waterCups = 4;
}

// --- Initialize App ---
document.addEventListener("DOMContentLoaded", () => {
  initAppState();
  registerUIEventListeners();
  calculateGoalMetrics();
  updateUI();
  loadTensorFlowMobileNetModel();
});

function loadTensorFlowMobileNetModel() {
  if (typeof mobilenet !== 'undefined') {
    console.log("Initializing TensorFlow client-side vision model...");
    mobilenet.load().then(model => {
      state.visionModel = model;
      console.log("TensorFlow MobileNet Model Loaded.");
      showToast("AI Vision Classifier Initialized");
    }).catch(err => {
      console.error("TF model loading error:", err);
    });
  } else {
    console.warn("TensorFlow or MobileNet library is not loaded.");
  }
}

// Load state from local storage or defaults
function initAppState() {
  const storedUser = localStorage.getItem("nutrisphere_user");
  const storedProfile = localStorage.getItem("nutrisphere_profile");
  const storedLogs = localStorage.getItem("nutrisphere_logs");
  const storedWorkouts = localStorage.getItem("nutrisphere_workouts");
  const storedWater = localStorage.getItem("nutrisphere_water");
  const storedTheme = localStorage.getItem("nutrisphere_theme") || "light";

  // Set theme attributes
  document.documentElement.setAttribute("data-theme", storedTheme);
  const themeBtnIcon = document.querySelector("#themeToggleBtn i");
  if (storedTheme === "dark" && themeBtnIcon) {
    themeBtnIcon.className = "fa-solid fa-sun";
  }

  if (storedUser) {
    state.currentUser = JSON.parse(storedUser);
    state.profile = JSON.parse(storedProfile);
    state.logs = JSON.parse(storedLogs);
    state.workouts = JSON.parse(storedWorkouts) || [];
    state.waterCups = parseInt(storedWater) || 0;
    
    // Hide auth screen
    document.getElementById("authOverlay").classList.add("hidden");
  } else {
    // Brand new user, load demo data so dashboard looks complete if they sign up
    loadDefaultState();
  }
}

// Save current state to local storage
function saveStateToStorage() {
  if (!state.currentUser) return;
  localStorage.setItem("nutrisphere_profile", JSON.stringify(state.profile));
  localStorage.setItem("nutrisphere_logs", JSON.stringify(state.logs));
  localStorage.setItem("nutrisphere_workouts", JSON.stringify(state.workouts));
  localStorage.setItem("nutrisphere_water", state.waterCups.toString());
}

// --- Formula & Goal Recalculations ---
function calculateGoalMetrics() {
  const p = state.profile;
  
  // 1. Calculate BMR using Mifflin-St Jeor Equation
  if (p.gender === "male") {
    p.bmr = Math.round(10 * p.weight + 6.25 * p.height - 5 * p.age + 5);
  } else {
    p.bmr = Math.round(10 * p.weight + 6.25 * p.height - 5 * p.age - 161);
  }

  // 2. Activity Multipliers
  let multiplier = 1.2; // Sedentary
  if (p.activity === "light") multiplier = 1.375;
  else if (p.activity === "moderate") multiplier = 1.55;
  else if (p.activity === "active") multiplier = 1.725;
  else if (p.activity === "extreme") multiplier = 1.9;

  p.tdee = Math.round(p.bmr * multiplier);

  // 3. Goal Adjustment
  if (p.goal === "lose") {
    p.caloriesGoal = Math.round(p.tdee - 500); // 500 kcal deficit
  } else if (p.goal === "gain") {
    p.caloriesGoal = Math.round(p.tdee + 400); // 400 kcal surplus
  } else {
    p.caloriesGoal = p.tdee; // Maintenance
  }

  // Ensure calorie goal doesn't drop to unsafe limits
  if (p.caloriesGoal < 1200) p.caloriesGoal = 1200;

  // 4. Macronutrient Targets calculation
  // Protein: weight-based standard targets
  const proteinMultiplier = p.goal === "lose" ? 2.0 : p.goal === "gain" ? 2.2 : 1.8;
  p.macrosGoal.protein = Math.round(p.weight * proteinMultiplier);
  
  // Fat: 25% of calorie budget
  p.macrosGoal.fat = Math.round((p.caloriesGoal * 0.25) / 9);

  // Carbs: Remaining calories
  const proteinCals = p.macrosGoal.protein * 4;
  const fatCals = p.macrosGoal.fat * 9;
  p.macrosGoal.carbs = Math.round((p.caloriesGoal - (proteinCals + fatCals)) / 4);
}

// Calculate Body Mass Index (BMI)
function calculateBMI() {
  const heightMeters = state.profile.height / 100;
  return (state.profile.weight / (heightMeters * heightMeters)).toFixed(1);
}

// --- UI Sync & Renders ---
function updateUI() {
  updateAuthenticationHeader();
  renderTabViews();
  updateCalorieDashboardRing();
  updateMacronutrientBars();
  updateWaterTrackerUI();
  updateStepsTrackerUI();
  renderMealLogs();
  renderWorkoutsList();
  updateProfileUI();
  renderAICoachRecommendations();
}

function updateAuthenticationHeader() {
  if (state.currentUser) {
    const initials = state.profile.name.split(" ").map(n => n[0]).join("").toUpperCase();
    document.getElementById("sidebarAvatar").textContent = initials;
    document.getElementById("profileAvatarText").textContent = initials;
    document.getElementById("sidebarUserName").textContent = state.profile.name;
    document.getElementById("profileNameHeader").textContent = state.profile.name;
    
    // Set Goal labels
    const goalMap = { lose: "Calorie Deficit", maintain: "Maintenance", gain: "Calorie Surplus" };
    document.getElementById("sidebarUserGoal").textContent = goalMap[state.profile.goal];
    document.getElementById("profileGoalHeader").textContent = "Goal: " + goalMap[state.profile.goal];
  }
}

// Calorie calculations and SVG circle path update
function updateCalorieDashboardRing() {
  const goal = state.profile.caloriesGoal;
  
  // Consumed Calories calculation
  let consumed = 0;
  Object.keys(state.logs).forEach(meal => {
    state.logs[meal].forEach(item => consumed += item.calories);
  });

  // Burned Calories calculation
  let burned = 0;
  state.workouts.forEach(w => burned += w.caloriesBurned);

  // Budget Balance Formula: Remaining = Goal - Consumed + Burned
  const remaining = goal - consumed + burned;

  // Render on dashboard
  document.getElementById("caloriesGoalVal").textContent = goal.toLocaleString();
  document.getElementById("caloriesConsumedVal").textContent = consumed.toLocaleString();
  document.getElementById("caloriesBurnedVal").textContent = burned.toLocaleString();
  document.getElementById("caloriesRemainingVal").textContent = remaining.toLocaleString();

  // SVG Circle Stroke animation
  const circleBar = document.getElementById("calorieCircleBar");
  if (circleBar) {
    const totalCircumference = 597; // 2 * pi * r
    let percent = consumed / (goal + burned);
    if (percent > 1) percent = 1;
    if (percent < 0) percent = 0;
    
    const offset = totalCircumference - (percent * totalCircumference);
    circleBar.style.strokeDashoffset = offset;
  }

  // Update weekly bar charts (today's bar)
  const todayBar = document.getElementById("todayBarFill");
  if (todayBar) {
    todayBar.setAttribute("data-val", consumed);
    const heightPercent = Math.min(100, (consumed / goal) * 100);
    todayBar.style.height = `${heightPercent}%`;
  }
}

// Macronutrients metrics render
function updateMacronutrientBars() {
  let consumed = { protein: 0, carbs: 0, fat: 0 };
  Object.keys(state.logs).forEach(meal => {
    state.logs[meal].forEach(item => {
      consumed.protein += item.protein || 0;
      consumed.carbs += item.carbs || 0;
      consumed.fat += item.fat || 0;
    });
  });

  // Round sums
  consumed.protein = Math.round(consumed.protein);
  consumed.carbs = Math.round(consumed.carbs);
  consumed.fat = Math.round(consumed.fat);

  const targets = state.profile.macrosGoal;

  // Text values
  document.getElementById("proteinStats").textContent = `${consumed.protein}g / ${targets.protein}g`;
  document.getElementById("carbsStats").textContent = `${consumed.carbs}g / ${targets.carbs}g`;
  document.getElementById("fatStats").textContent = `${consumed.fat}g / ${targets.fat}g`;

  // Bars Fill percentage
  const proteinPercent = Math.min(100, (consumed.protein / targets.protein) * 100);
  const carbsPercent = Math.min(100, (consumed.carbs / targets.carbs) * 100);
  const fatPercent = Math.min(100, (consumed.fat / targets.fat) * 100);

  document.getElementById("proteinBarFill").style.width = `${proteinPercent}%`;
  document.getElementById("carbsBarFill").style.width = `${carbsPercent}%`;
  document.getElementById("fatBarFill").style.width = `${fatPercent}%`;
}

// Render Meal Section entries
function renderMealLogs() {
  const meals = ["breakfast", "lunch", "dinner", "snacks"];
  
  meals.forEach(meal => {
    const listContainer = document.getElementById(`${meal}List`);
    const calsTotalText = document.getElementById(`${meal}CalsTotal`);
    
    if (!listContainer) return;
    
    listContainer.innerHTML = "";
    let mealCals = 0;
    
    if (state.logs[meal].length === 0) {
      listContainer.innerHTML = `<div class="empty-meal-text">No meals logged for ${meal}</div>`;
      calsTotalText.textContent = "0 kcal";
      return;
    }

    state.logs[meal].forEach((item, idx) => {
      mealCals += item.calories;
      
      const thumb = item.thumb || "🍽️";
      const itemEl = document.createElement("div");
      itemEl.className = "meal-item";
      itemEl.innerHTML = `
        <div class="meal-item-left">
          <div class="meal-item-thumb">${thumb}</div>
          <div class="meal-item-details">
            <span class="meal-item-name">${item.name}</span>
            <div class="meal-item-meta">
              <span>${item.time}</span>
              <span>•</span>
              <span>P: ${item.protein}g C: ${item.carbs}g F: ${item.fat}g</span>
            </div>
          </div>
        </div>
        <div class="meal-item-right">
          <span class="meal-item-cals">${item.calories} kcal</span>
          <i class="fa-solid fa-trash-can btn-delete" onclick="deleteLoggedFood('${meal}', ${idx})"></i>
        </div>
      `;
      listContainer.appendChild(itemEl);
    });

    calsTotalText.textContent = `${mealCals} kcal`;
  });
}

// Render Completed Workouts list
function renderWorkoutsList() {
  const container = document.getElementById("workoutsLoggedList");
  const totalBurnedText = document.getElementById("workoutCaloriesBurnedTotal");
  
  if (!container) return;
  container.innerHTML = "";
  
  let totalBurned = 0;
  
  if (state.workouts.length === 0) {
    container.innerHTML = `<div class="empty-meal-text" id="emptyWorkoutText">No workouts logged for today</div>`;
    totalBurnedText.textContent = "0 kcal";
    return;
  }

  state.workouts.forEach((w, idx) => {
    totalBurned += w.caloriesBurned;
    const itemEl = document.createElement("div");
    itemEl.className = "workout-item";
    itemEl.innerHTML = `
      <div class="meal-item-left">
        <div class="meal-item-thumb">💪</div>
        <div class="meal-item-details">
          <span class="meal-item-name">${w.name}</span>
          <div class="meal-item-meta">
            <span>${w.duration} mins</span>
          </div>
        </div>
      </div>
      <div class="meal-item-right">
        <span class="meal-item-cals" style="color: var(--accent-blue);">${w.caloriesBurned} kcal</span>
        <i class="fa-solid fa-trash-can btn-delete" onclick="deleteLoggedWorkout(${idx})"></i>
      </div>
    `;
    container.appendChild(itemEl);
  });

  totalBurnedText.textContent = `${totalBurned} kcal`;
}

// Render hydration levels
function updateWaterTrackerUI() {
  const glasses = document.querySelectorAll("#waterGlassesRow i");
  const waterDesc = document.getElementById("waterStatsDesc");
  
  glasses.forEach((glass, idx) => {
    if (idx < state.waterCups) {
      glass.classList.add("active");
    } else {
      glass.classList.remove("active");
    }
  });

  const mlVal = state.waterCups * 250;
  waterDesc.textContent = `${mlVal} ml / 2000 ml consumed`;
  
  // Sync glass counts with targets
  const targetText = document.getElementById("waterTargetText");
  if (targetText) {
    targetText.textContent = `Target: 8 cups (${Math.max(0, 8 - state.waterCups)} left)`;
  }
}

// Render steps metrics
function updateStepsTrackerUI() {
  document.getElementById("stepsValText").textContent = state.stepsCount.toLocaleString();
  const path = document.getElementById("stepsProgressPath");
  if (path) {
    const percent = Math.min(100, (state.stepsCount / 8000) * 100);
    // Draw offset value
    path.style.strokeDasharray = `${percent}, 100`;
  }
}

// Profile statistics updates
function updateProfileUI() {
  // Input fields initial sync
  document.getElementById("profileAgeInput").value = state.profile.age;
  document.getElementById("profileWeightInput").value = state.profile.weight;
  document.getElementById("profileHeightInput").value = state.profile.height;
  document.getElementById("profileGenderInput").value = state.profile.gender;
  document.getElementById("profileActivityInput").value = state.profile.activity;
  document.getElementById("profileGoalInput").value = state.profile.goal;

  // BMI computations
  const bmi = calculateBMI();
  document.getElementById("bmiScoreVal").textContent = bmi;

  const badge = document.getElementById("bmiStatusBadge");
  const marker = document.getElementById("bmiMarker");
  
  // Reset badge class list
  badge.className = "bmi-status-badge";
  
  let leftPercent = 50; // default marker pos

  if (bmi < 18.5) {
    badge.textContent = "Underweight";
    badge.classList.add("bmi-status-warn");
    leftPercent = Math.max(5, (bmi / 18.5) * 25);
  } else if (bmi >= 18.5 && bmi < 25) {
    badge.textContent = "Healthy Weight";
    badge.classList.add("bmi-status-normal");
    leftPercent = 25 + ((bmi - 18.5) / 6.5) * 35; // scales between 25% and 60%
  } else if (bmi >= 25 && bmi < 30) {
    badge.textContent = "Overweight";
    badge.classList.add("bmi-status-warn");
    leftPercent = 60 + ((bmi - 25) / 5) * 20; // scales between 60% and 80%
  } else {
    badge.textContent = "Obese";
    badge.classList.add("bmi-status-severe");
    leftPercent = Math.min(95, 80 + ((bmi - 30) / 10) * 15);
  }

  marker.style.left = `${leftPercent}%`;

  // BMR TDEE texts
  document.getElementById("bmrValueVal").textContent = `${state.profile.bmr.toLocaleString()} kcal`;
  document.getElementById("tdeeValueVal").textContent = `${state.profile.caloriesGoal.toLocaleString()} kcal`;
}

// Generate Coaching advice dynamically
function renderAICoachRecommendations() {
  const container = document.getElementById("recommendationsList");
  if (!container) return;

  container.innerHTML = "";

  const profile = state.profile;
  let consumed = 0;
  let protein = 0;
  Object.keys(state.logs).forEach(meal => {
    state.logs[meal].forEach(item => {
      consumed += item.calories;
      protein += item.protein || 0;
    });
  });

  const recs = [];

  // Rec 1: Goal targets
  if (profile.goal === "lose") {
    recs.push({
      type: "rec-ai",
      icon: "fa-solid fa-wand-magic-sparkles",
      title: "Active Deficit Target Set",
      desc: `Your weight loss plan is structured. Eat at a moderate calorie deficit of ${profile.caloriesGoal} kcal. Focus on low caloric density meals.`
    });
  } else if (profile.goal === "gain") {
    recs.push({
      type: "rec-ai",
      icon: "fa-solid fa-wand-magic-sparkles",
      title: "Bulking Calories Target Set",
      desc: `Your active muscle gain surplus is configured at ${profile.caloriesGoal} kcal. Ensure you meet your daily protein demands.`
    });
  }

  // Rec 2: Hydration levels
  if (state.waterCups < 5) {
    recs.push({
      type: "rec-warn",
      icon: "fa-solid fa-droplet",
      title: "Hydration levels low",
      desc: `You've only consumed ${state.waterCups * 250}ml of water today. Aim to drink at least ${8 - state.waterCups} more cups to hit optimal metabolism levels.`
    });
  } else {
    recs.push({
      type: "rec-success",
      icon: "fa-solid fa-circle-check",
      title: "Hydrated Profile",
      desc: `Excellent! You logged ${state.waterCups * 250}ml of water. This helps with muscle recovery and nutrient distribution.`
    });
  }

  // Rec 3: Protein targets
  const proteinRemaining = profile.macrosGoal.protein - protein;
  if (proteinRemaining > 0) {
    recs.push({
      type: "rec-warn",
      icon: "fa-solid fa-shrimp",
      title: "Protein target check",
      desc: `You need ${Math.round(proteinRemaining)}g more protein today. Add chicken, tofu, or greek yogurt to your next meal.`
    });
  } else {
    recs.push({
      type: "rec-success",
      icon: "fa-solid fa-award",
      title: "Protein goal achieved!",
      desc: "Brilliant! You've met your daily target. Muscle protein synthesis levels are optimally supported."
    });
  }

  // Rec 4: General health tips
  if (state.stepsCount < 6000) {
    recs.push({
      type: "rec-ai",
      icon: "fa-solid fa-person-running",
      title: "Physical Activity Recommendation",
      desc: `You have completed ${state.stepsCount} steps today. Take a quick 15-minute post-meal stroll to boost insulin sensitivity and burn 120 more kcal.`
    });
  }

  // Display recommendation cards
  recs.forEach(rec => {
    const item = document.createElement("div");
    item.className = "recommendation-item";
    item.innerHTML = `
      <div class="recommendation-icon ${rec.type}">
        <i class="${rec.icon}"></i>
      </div>
      <div class="recommendation-body">
        <span class="recommendation-title">${rec.title}</span>
        <span class="recommendation-desc">${rec.desc}</span>
      </div>
    `;
    container.appendChild(item);
  });
}

// Router switcher for tabs
function renderTabViews() {
  // Hide all panels
  document.querySelectorAll(".section-panel").forEach(p => p.classList.remove("active"));
  // Remove sidebar active states
  document.querySelectorAll(".sidebar .nav-item").forEach(item => item.classList.remove("active"));

  // Show target panel
  const activePanel = document.getElementById(state.activeTab);
  if (activePanel) {
    activePanel.classList.add("active");
  }

  // Find sidebar button and activate
  const navItem = document.querySelector(`.sidebar .nav-item[data-target="${state.activeTab}"]`);
  if (navItem) {
    navItem.classList.add("active");
  }

  // Update header text based on page
  const titleText = document.getElementById("pageTitleText");
  const subtitleText = document.getElementById("pageSubtitleText");
  
  if (state.activeTab === "dashboardTab") {
    titleText.textContent = "Dashboard";
    subtitleText.textContent = `Welcome back, ${state.profile.name}! Track metrics and achieve your fitness targets.`;
  } else if (state.activeTab === "mealsTab") {
    titleText.textContent = "Nutritional Log";
    subtitleText.textContent = "Log breakfast, lunch, dinner, and snacks manually or using AI Vision.";
  } else if (state.activeTab === "workoutsTab") {
    titleText.textContent = "Fitness Tracker";
    subtitleText.textContent = "Log workouts and dynamic exercises to balance calories consumed.";
  } else if (state.activeTab === "profileTab") {
    titleText.textContent = "Health Profile";
    subtitleText.textContent = "View and edit body metric indexes, BMR metrics, and activity targets.";
  }
}

// --- Action Deletion Events ---
window.deleteLoggedFood = function(meal, idx) {
  const item = state.logs[meal][idx];
  state.logs[meal].splice(idx, 1);
  saveStateToStorage();
  updateUI();
  showToast(`Removed "${item.name}" from your ${meal} log`);
};

window.deleteLoggedWorkout = function(idx) {
  const item = state.workouts[idx];
  state.workouts.splice(idx, 1);
  saveStateToStorage();
  updateUI();
  showToast(`Removed "${item.name}" workout`);
};

// --- Toast notifications helper ---
function showToast(message) {
  const container = document.getElementById("toastContainer");
  const toast = document.createElement("div");
  toast.className = "toast";
  toast.innerHTML = `<i class="fa-solid fa-circle-check" style="color: var(--accent-green);"></i> <span>${message}</span>`;
  container.appendChild(toast);
  
  // Auto remove after animation completes
  setTimeout(() => {
    toast.remove();
  }, 3000);
}

// --- Register Event Handlers ---
function registerUIEventListeners() {
  // Sidebar tab clicks
  document.querySelectorAll(".sidebar .nav-item").forEach(item => {
    item.addEventListener("click", () => {
      state.activeTab = item.getAttribute("data-target");
      renderTabViews();
    });
  });

  // Dark/Light theme toggler
  document.getElementById("themeToggleBtn").addEventListener("click", () => {
    const currentTheme = document.documentElement.getAttribute("data-theme");
    const newTheme = currentTheme === "dark" ? "light" : "dark";
    document.documentElement.setAttribute("data-theme", newTheme);
    localStorage.setItem("nutrisphere_theme", newTheme);

    const icon = document.querySelector("#themeToggleBtn i");
    if (newTheme === "dark") {
      icon.className = "fa-solid fa-sun";
      showToast("Dark mode enabled 🌙");
    } else {
      icon.className = "fa-solid fa-moon";
      showToast("Light mode enabled ☀️");
    }
  });

  // Hydration Clicks
  document.querySelectorAll("#waterGlassesRow i").forEach(glass => {
    glass.addEventListener("click", () => {
      const index = parseInt(glass.getAttribute("data-index"));
      if (index === state.waterCups - 1) {
        state.waterCups--; // toggle last glass off
      } else {
        state.waterCups = index + 1; // turn on all glasses up to index
      }
      saveStateToStorage();
      updateWaterTrackerUI();
      renderAICoachRecommendations();
      updateCalorieDashboardRing();
      showToast(`Logged hydration: ${state.waterCups * 250} ml total`);
    });
  });

  // Auth Submit form
  document.getElementById("authForm").addEventListener("submit", (e) => {
    e.preventDefault();
    const email = document.getElementById("authEmail").value;
    const name = document.getElementById("authUsername") ? document.getElementById("authUsername").value : "Jane Doe";
    
    state.currentUser = { email };
    state.profile.name = name;
    
    // Save to storage
    localStorage.setItem("nutrisphere_user", JSON.stringify(state.currentUser));
    saveStateToStorage();
    
    // Hide auth screen
    document.getElementById("authOverlay").classList.add("hidden");
    
    // Recalculate based on initial form profile
    calculateGoalMetrics();
    updateUI();
    showToast(`Welcome to NutriSphere AI, ${name}!`);
  });

  // Auth toggle click
  const authToggleLink = document.getElementById("authToggleLink");
  authToggleLink.addEventListener("click", () => {
    const isSignup = document.getElementById("authTitle").textContent === "Create Account";
    const usernameGroup = document.getElementById("usernameGroup");
    
    if (isSignup) {
      document.getElementById("authTitle").textContent = "Welcome Back";
      document.getElementById("authSubtitle").textContent = "Sign in to resume tracking your health parameters";
      document.getElementById("authSubmitBtn").innerHTML = `Sign In <i class="fa fa-arrow-right"></i>`;
      authToggleLink.textContent = "Sign Up";
      document.getElementById("authToggleQuestion").textContent = "Don't have an account?";
      usernameGroup.style.display = "none";
      document.getElementById("authUsername").required = false;
    } else {
      document.getElementById("authTitle").textContent = "Create Account";
      document.getElementById("authSubtitle").textContent = "Join us today to start your smart health journey";
      document.getElementById("authSubmitBtn").innerHTML = `Get Started <i class="fa fa-arrow-right"></i>`;
      authToggleLink.textContent = "Sign In";
      document.getElementById("authToggleQuestion").textContent = "Already have an account?";
      usernameGroup.style.display = "flex";
      document.getElementById("authUsername").required = true;
    }
  });

  // Logout clicked
  document.getElementById("logoutBtn").addEventListener("click", () => {
    localStorage.removeItem("nutrisphere_user");
    localStorage.removeItem("nutrisphere_profile");
    localStorage.removeItem("nutrisphere_logs");
    localStorage.removeItem("nutrisphere_workouts");
    localStorage.removeItem("nutrisphere_water");
    
    location.reload();
  });

  // Profile forms submission handler
  document.getElementById("profileEditForm").addEventListener("submit", (e) => {
    e.preventDefault();
    state.profile.age = parseInt(document.getElementById("profileAgeInput").value);
    state.profile.weight = parseFloat(document.getElementById("profileWeightInput").value);
    state.profile.height = parseInt(document.getElementById("profileHeightInput").value);
    state.profile.gender = document.getElementById("profileGenderInput").value;
    state.profile.activity = document.getElementById("profileActivityInput").value;
    state.profile.goal = document.getElementById("profileGoalInput").value;

    calculateGoalMetrics();
    saveStateToStorage();
    updateUI();
    
    showToast("Profile health metrics updated successfully");
  });

  // --- Modal Openers & Close handlers ---
  
  // Manual Log Food Modal togglers
  const manualLogModal = document.getElementById("manualLogModal");
  document.getElementById("triggerManualFoodLog").addEventListener("click", () => {
    manualLogModal.classList.add("active");
    document.getElementById("dbSearchResults").style.display = "none";
    document.getElementById("dbSearchInput").value = "";
  });

  // Global Database search triggers
  const dbSearchBtn = document.getElementById("dbSearchBtn");
  const dbSearchInput = document.getElementById("dbSearchInput");
  if (dbSearchBtn && dbSearchInput) {
    const executeSearch = () => {
      const query = dbSearchInput.value.trim();
      if (query) {
        searchOpenFoodFactsAPI(query);
      }
    };
    dbSearchBtn.addEventListener("click", executeSearch);
    dbSearchInput.addEventListener("keypress", (e) => {
      if (e.key === "Enter") {
        e.preventDefault();
        executeSearch();
      }
    });
  }
  
  const closeManualModal = () => manualLogModal.classList.remove("active");
  document.getElementById("closeManualLogModal").addEventListener("click", closeManualModal);
  document.getElementById("cancelManualLog").addEventListener("click", closeManualModal);

  // Manual Food log submission
  document.getElementById("manualFoodForm").addEventListener("submit", (e) => {
    e.preventDefault();
    const meal = document.getElementById("manualMealType").value;
    const name = document.getElementById("manualFoodName").value;
    const calories = parseInt(document.getElementById("manualCalories").value);
    const protein = parseInt(document.getElementById("manualProtein").value);
    const carbs = parseFloat(document.getElementById("manualCarbs").value);
    const fat = parseFloat(document.getElementById("manualFat").value);

    // Add to state
    const now = new Date();
    const timeStr = now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    
    // Pick appropriate icon based on name
    let thumb = "🍽️";
    const lowerName = name.toLowerCase();
    if (lowerName.includes("egg")) thumb = "🍳";
    else if (lowerName.includes("salad") || lowerName.includes("vegetable")) thumb = "🥗";
    else if (lowerName.includes("chicken") || lowerName.includes("meat")) thumb = "🍗";
    else if (lowerName.includes("pizza")) thumb = "🍕";
    else if (lowerName.includes("banana")) thumb = "🍌";
    else if (lowerName.includes("apple")) thumb = "🍎";
    else if (lowerName.includes("fish") || lowerName.includes("salmon")) thumb = "🐟";
    else if (lowerName.includes("rice")) thumb = "🍚";
    else if (lowerName.includes("shake") || lowerName.includes("protein")) thumb = "🥤";

    state.logs[meal].push({ name, calories, protein, carbs, fat, time: timeStr, thumb });
    
    saveStateToStorage();
    updateUI();
    closeManualModal();
    
    // Clear forms
    document.getElementById("manualFoodForm").reset();
    showToast(`Logged "${name}" to ${meal}`);
  });

  // Workout submission
  document.getElementById("workoutLogForm").addEventListener("submit", (e) => {
    e.preventDefault();
    const name = document.getElementById("workoutNameInput").value;
    const duration = parseInt(document.getElementById("workoutDurationInput").value);
    const rate = parseInt(document.getElementById("workoutBurnRateInput").value);
    const caloriesBurned = duration * rate;

    state.workouts.push({ name, duration, caloriesBurned });
    saveStateToStorage();
    updateUI();
    
    document.getElementById("workoutLogForm").reset();
    showToast(`Logged exercise: ${name} (${caloriesBurned} kcal burned)`);
  });

  // Workout Quick presets click listener
  document.querySelectorAll(".workout-preset-card").forEach(card => {
    card.addEventListener("click", () => {
      const exercise = card.getAttribute("data-exercise");
      const rate = parseInt(card.getAttribute("data-rate"));
      
      // Prompt user for duration
      const durationStr = prompt(`Enter duration (minutes) for ${exercise}:`, "30");
      const duration = parseInt(durationStr);
      if (isNaN(duration) || duration <= 0) return;

      const caloriesBurned = duration * rate;
      state.workouts.push({ name: exercise, duration, caloriesBurned });
      
      saveStateToStorage();
      updateUI();
      showToast(`Logged preset workout: ${exercise} (${caloriesBurned} kcal)`);
    });
  });

  // --- AI Vision Image upload elements ---
  const aiScanModal = document.getElementById("aiScanModal");
  document.getElementById("triggerAIScan").addEventListener("click", () => {
    aiScanModal.classList.add("active");
    resetScannerUI();
  });
  
  document.getElementById("closeAiScanModal").addEventListener("click", () => {
    stopCameraStream();
    aiScanModal.classList.remove("active");
  });

  const triggerSelectInputBtn = document.getElementById("triggerImageInputSelect");
  const fileInputEl = document.getElementById("cameraFileInput");
  const dropzoneEl = document.getElementById("uploadDropzone");

  triggerSelectInputBtn.addEventListener("click", () => fileInputEl.click());
  dropzoneEl.addEventListener("click", () => fileInputEl.click());

  // Files selected
  fileInputEl.addEventListener("change", (e) => {
    if (e.target.files && e.target.files[0]) {
      processImageSelection(e.target.files[0]);
    }
  });

  // Drag and drop events for files
  dropzoneEl.addEventListener("dragover", (e) => {
    e.preventDefault();
    dropzoneEl.style.borderColor = "var(--accent-green)";
  });

  dropzoneEl.addEventListener("dragleave", () => {
    dropzoneEl.style.borderColor = "var(--text-light)";
  });

  dropzoneEl.addEventListener("drop", (e) => {
    e.preventDefault();
    dropzoneEl.style.borderColor = "var(--text-light)";
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      processImageSelection(e.dataTransfer.files[0]);
    }
  });

  // Live Camera streamer triggers
  const cameraViewContainer = document.getElementById("cameraViewContainer");
  const uploadContainerView = document.getElementById("uploadContainerView");
  const activateLiveCamBtn = document.getElementById("activateLiveCameraBtn");
  const backToUploadBtn = document.getElementById("backToUploadBtn");
  const captureSnapshotBtn = document.getElementById("captureCameraSnapshotBtn");
  const liveVideoFeed = document.getElementById("liveCameraFeed");

  let cameraStream = null;

  activateLiveCamBtn.addEventListener("click", async () => {
    uploadContainerView.style.display = "none";
    cameraViewContainer.style.display = "block";
    document.getElementById("scannerViewport").style.display = "block";
    document.getElementById("scannerLaser").style.display = "block";
    document.getElementById("scannerGridOverlay").style.display = "block";
    
    try {
      cameraStream = await navigator.mediaDevices.getUserMedia({ video: { facingMode: "environment" }, audio: false });
      liveVideoFeed.srcObject = cameraStream;
    } catch (err) {
      console.warn("Could not acquire actual camera feed. Simulating viewfinder video...", err);
      // Create a nice mockup or canvas animation if actual camera is blocked or not connected
      liveVideoFeed.style.background = "#222";
      liveVideoFeed.placeholderText = "Actual camera is simulated. Scanning grid is ready.";
    }
  });

  function stopCameraStream() {
    if (cameraStream) {
      cameraStream.getTracks().forEach(track => track.stop());
      cameraStream = null;
    }
    liveVideoFeed.srcObject = null;
  }

  backToUploadBtn.addEventListener("click", () => {
    stopCameraStream();
    cameraViewContainer.style.display = "none";
    uploadContainerView.style.display = "block";
  });

  // Triggering the capture and simulated scanning
  captureSnapshotBtn.addEventListener("click", () => {
    stopCameraStream();
    cameraViewContainer.style.display = "none";
    
    // Run the scanning process directly
    triggerScanningSequence("Live Snapshot.png", null);
  });

  // --- FLOATING CHATBOT EVENT TRIGGERS ---
  const chatbotTriggerBtn = document.getElementById("chatbotTriggerBtn");
  const chatbotDrawer = document.getElementById("chatbotDrawer");
  const closeChatbotDrawer = document.getElementById("closeChatbotDrawer");

  chatbotTriggerBtn.addEventListener("click", () => {
    chatbotDrawer.classList.add("active");
    chatbotTriggerBtn.classList.add("active");
  });

  closeChatbotDrawer.addEventListener("click", () => {
    chatbotDrawer.classList.remove("active");
    chatbotTriggerBtn.classList.remove("active");
  });

  // Chat message send triggers
  const chatInput = document.getElementById("chatbotInputField");
  const sendChatBtn = document.getElementById("chatbotSendBtn");

  const sendUserChatMessage = () => {
    const text = chatInput.value.trim();
    if (!text) return;
    
    appendChatMessage(text, "user");
    chatInput.value = "";
    
    // Simulate AI Coaching response typing
    setTimeout(() => {
      generateCoachResponse(text);
    }, 800);
  };

  sendChatBtn.addEventListener("click", sendUserChatMessage);
  chatInput.addEventListener("keypress", (e) => {
    if (e.key === "Enter") sendUserChatMessage();
  });

  // Quick reply bubbles click handler
  document.querySelectorAll(".quick-reply-btn").forEach(btn => {
    btn.addEventListener("click", () => {
      const qText = btn.getAttribute("data-question");
      appendChatMessage(qText, "user");
      
      setTimeout(() => {
        generateCoachResponse(qText);
      }, 700);
    });
  });

  // --- VOICE SPEECH LOG EVENT TRIGGERS ---
  const voiceLogModal = document.getElementById("voiceLogModal");
  const voiceLogTrigger = document.getElementById("voiceLogTrigger");
  const closeVoiceLogModal = document.getElementById("closeVoiceLogModal");
  const voiceMicButton = document.getElementById("voiceMicButton");
  const voiceTranscriptBox = document.getElementById("voiceTranscriptBox");
  const voiceStatusMsg = document.getElementById("voiceStatusMsg");
  const submitVoiceLoggedItem = document.getElementById("submitVoiceLoggedItem");

  let recognition = null;
  let isListening = false;
  let parsedVoiceFoodItem = null;

  // Initialize Speech Engine
  const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
  if (SpeechRecognition) {
    recognition = new SpeechRecognition();
    recognition.continuous = false;
    recognition.lang = 'en-US';
    recognition.interimResults = false;
    recognition.maxAlternatives = 1;

    recognition.onstart = () => {
      isListening = true;
      voiceMicButton.style.background = "rgba(239, 68, 68, 0.15)";
      voiceMicButton.style.color = "var(--accent-red)";
      voiceStatusMsg.textContent = "Listening carefully... speak now!";
      voiceTranscriptBox.textContent = "...";
    };

    recognition.onspeechend = () => {
      recognition.stop();
    };

    recognition.onend = () => {
      isListening = false;
      voiceMicButton.style.background = "rgba(59, 130, 246, 0.1)";
      voiceMicButton.style.color = "var(--accent-blue)";
      voiceStatusMsg.textContent = "Speech engine idle.";
    };

    recognition.onerror = (event) => {
      console.error("Speech Recognition Error:", event.error);
      voiceStatusMsg.textContent = `Error: ${event.error}`;
      voiceTranscriptBox.textContent = "I couldn't hear you clearly. Tap the mic to try again.";
    };

    recognition.onresult = (event) => {
      const transcript = event.results[0][0].transcript;
      voiceTranscriptBox.textContent = `"${transcript}"`;
      
      // Parse speech text
      parseSpeechLogTranscript(transcript);
    };
  } else {
    voiceMicButton.style.opacity = "0.5";
    voiceStatusMsg.textContent = "Speech Recognition API not supported in this browser. (Use Chrome or Safari)";
  }

  voiceLogTrigger.addEventListener("click", () => {
    voiceLogModal.classList.add("active");
    voiceTranscriptBox.textContent = "Click the mic above to start speaking...";
    submitVoiceLoggedItem.disabled = true;
    parsedVoiceFoodItem = null;
  });

  closeVoiceLogModal.addEventListener("click", () => {
    if (recognition && isListening) recognition.stop();
    voiceLogModal.classList.remove("active");
  });

  document.getElementById("cancelVoiceLogging").addEventListener("click", () => {
    if (recognition && isListening) recognition.stop();
    voiceLogModal.classList.remove("active");
  });

  voiceMicButton.addEventListener("click", () => {
    if (!recognition) {
      alert("Speech recognition is not supported in this browser.");
      return;
    }
    if (isListening) {
      recognition.stop();
    } else {
      try {
        recognition.start();
      } catch (err) {
        console.warn("Speech API start error, resetting...", err);
      }
    }
  });

  // Log food items parsed via speech
  submitVoiceLoggedItem.addEventListener("click", () => {
    if (parsedVoiceFoodItem) {
      const now = new Date();
      const timeStr = now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
      
      state.logs[parsedVoiceFoodItem.meal].push({
        name: parsedVoiceFoodItem.name,
        calories: parsedVoiceFoodItem.calories,
        protein: parsedVoiceFoodItem.protein,
        carbs: parsedVoiceFoodItem.carbs,
        fat: parsedVoiceFoodItem.fat,
        time: timeStr,
        thumb: parsedVoiceFoodItem.thumb
      });

      saveStateToStorage();
      updateUI();
      voiceLogModal.classList.remove("active");
      showToast(`Logged "${parsedVoiceFoodItem.name}" to ${parsedVoiceFoodItem.meal}`);
    }
  });

  // NLP Voice Command Parser function
  function parseSpeechLogTranscript(text) {
    const cleanText = text.toLowerCase().trim();
    
    // 1. Identify the Target Meal
    let targetMeal = "snacks"; // default fallback
    if (cleanText.includes("breakfast")) targetMeal = "breakfast";
    else if (cleanText.includes("lunch")) targetMeal = "lunch";
    else if (cleanText.includes("dinner")) targetMeal = "dinner";
    else if (cleanText.includes("snack")) targetMeal = "snacks";

    // 2. Scan catalog items to detect matching foods
    let matchedFoodKey = null;
    Object.keys(foodCatalog).forEach(key => {
      if (cleanText.includes(key)) {
        matchedFoodKey = key;
      }
    });

    // Extract potential quantity
    let quantityMultiplier = 1;
    const qtyRegex = /(?:eat|ate|add|had)\s+(\d+|one|two|three|four|five|a|an)\s+/i;
    const qtyMatch = cleanText.match(qtyRegex);
    if (qtyMatch) {
      const qtyWord = qtyMatch[1];
      const wordMap = { one: 1, a: 1, an: 1, two: 2, three: 3, four: 4, five: 5 };
      if (!isNaN(parseInt(qtyWord))) {
        quantityMultiplier = parseInt(qtyWord);
      } else if (wordMap[qtyWord]) {
        quantityMultiplier = wordMap[qtyWord];
      }
    }

    if (matchedFoodKey) {
      const foodItem = foodCatalog[matchedFoodKey];
      const nameSuffix = quantityMultiplier > 1 ? ` (x${quantityMultiplier})` : "";
      
      // Determine suitable emoji/thumbnail
      let emoji = "🍽️";
      if (matchedFoodKey === "egg") emoji = "🍳";
      else if (matchedFoodKey === "salad") emoji = "🥗";
      else if (matchedFoodKey === "chicken") emoji = "🍗";
      else if (matchedFoodKey === "pizza") emoji = "🍕";
      else if (matchedFoodKey === "apple") emoji = "🍎";
      else if (matchedFoodKey === "banana") emoji = "🍌";
      else if (matchedFoodKey === "salmon") emoji = "🐟";
      else if (matchedFoodKey === "pasta") emoji = "🍝";
      else if (matchedFoodKey === "sushi") emoji = "🍣";
      else if (matchedFoodKey === "rice") emoji = "🍚";
      else if (matchedFoodKey === "avocado") emoji = "🥑";
      else if (matchedFoodKey === "burger") emoji = "🍔";
      else if (matchedFoodKey === "steak") emoji = "🥩";

      parsedVoiceFoodItem = {
        meal: targetMeal,
        name: foodItem.name + nameSuffix,
        calories: Math.round(foodItem.calories * quantityMultiplier),
        protein: Math.round(foodItem.protein * quantityMultiplier),
        carbs: Math.round(foodItem.carbs * quantityMultiplier),
        fat: Math.round(foodItem.fat * quantityMultiplier),
        thumb: emoji
      };

      voiceStatusMsg.textContent = "Food recognized from database!";
      submitVoiceLoggedItem.disabled = false;
      
      // Highlight preview to user
      voiceTranscriptBox.innerHTML += `
        <div style="margin-top: 10px; padding: 10px; background: rgba(16, 185, 129, 0.1); border-radius: 8px; font-size: 0.85rem; font-style: normal;">
          <strong>Detected:</strong> ${parsedVoiceFoodItem.name} (${parsedVoiceFoodItem.calories} kcal) <br>
          <strong>Dest:</strong> Log to ${targetMeal.charAt(0).toUpperCase() + targetMeal.slice(1)}
        </div>
      `;
    } 
    // 3. Fallback: Parse generic numeric calorie structures ("add a 300 calorie salad")
    else {
      const calRegex = /(\d+)\s*(?:calorie|calories|kcal)/;
      const calMatch = cleanText.match(calRegex);
      
      if (calMatch) {
        const calories = parseInt(calMatch[1]);
        
        // Guess a name or use transcript slice
        let title = "Custom Voice Entry";
        const titleRegex = /(?:eat|ate|add|had)\s+(?:a|an)?\s*([\w\s]+?)\s*(?:for|to|with|\d+\s*cal)/i;
        const titleMatch = cleanText.match(titleRegex);
        if (titleMatch && titleMatch[1].trim()) {
          title = titleMatch[1].trim();
        }

        parsedVoiceFoodItem = {
          meal: targetMeal,
          name: title.charAt(0).toUpperCase() + title.slice(1),
          calories: calories,
          protein: Math.round(calories * 0.05), // estimates
          carbs: Math.round(calories * 0.1),
          fat: Math.round(calories * 0.03),
          thumb: "🎤"
        };

        voiceStatusMsg.textContent = "Generic calorie parsed!";
        submitVoiceLoggedItem.disabled = false;
        
        voiceTranscriptBox.innerHTML += `
          <div style="margin-top: 10px; padding: 10px; background: rgba(59, 130, 246, 0.1); border-radius: 8px; font-size: 0.85rem; font-style: normal;">
            <strong>Parsed:</strong> ${parsedVoiceFoodItem.name} (${parsedVoiceFoodItem.calories} kcal) <br>
            <strong>Dest:</strong> Log to ${targetMeal.charAt(0).toUpperCase() + targetMeal.slice(1)}
          </div>
        `;
      } else {
        voiceStatusMsg.textContent = "Could not parse food or calories. Try stating calories (e.g., 'I ate a 400 calorie pizza').";
        submitVoiceLoggedItem.disabled = true;
      }
    }
  }
}

// --- Image processing and simulated canvas analyzer ---
function processImageSelection(file) {
  const preview = document.getElementById("uploadPreviewImage");
  const reader = new FileReader();

  reader.onload = (e) => {
    preview.src = e.target.result;
    preview.style.display = "block";

    // Trigger AI recognition cycle
    triggerScanningSequence(file.name, e.target.result);
  };
  reader.readAsDataURL(file);
}

function resetScannerUI() {
  document.getElementById("uploadContainerView").style.display = "block";
  document.getElementById("cameraViewContainer").style.display = "none";
  document.getElementById("uploadPreviewImage").style.display = "none";
  document.getElementById("uploadPreviewImage").src = "";
  document.getElementById("scanningStatusText").style.display = "none";
  document.getElementById("aiScanResults").style.display = "none";
  document.getElementById("cameraFileInput").value = "";
}

// Scan processing sequence
function triggerScanningSequence(filename, dataUri) {
  document.getElementById("uploadContainerView").style.display = "none";
  document.getElementById("cameraViewContainer").style.display = "none";
  document.getElementById("scanningStatusText").style.display = "block";
  document.getElementById("aiScanResults").style.display = "none";

  // Simulate AI Vision lag
  setTimeout(() => {
    performComputerVisionLogic(filename, dataUri);
  }, 2200);
}

// Real TensorFlow classification logic with color fallback
function performComputerVisionLogic(filename, dataUri) {
  const preview = document.getElementById("uploadPreviewImage");
  
  // If MobileNet is initialized and has a valid uploaded image preview
  if (state.visionModel && preview && preview.style.display !== "none") {
    state.visionModel.classify(preview).then(predictions => {
      console.log("TensorFlow Vision Predictions:", predictions);
      if (predictions && predictions.length > 0) {
        const topResult = predictions[0];
        const label = topResult.className.split(',')[0].trim();
        const confidence = Math.round(topResult.probability * 100);
        
        resolveNutritionForMLPrediction(label, confidence);
      } else {
        runFallbackComputerVision(filename, dataUri);
      }
    }).catch(err => {
      console.error("TensorFlow vision classification failed:", err);
      runFallbackComputerVision(filename, dataUri);
    });
  } else {
    runFallbackComputerVision(filename, dataUri);
  }
}

function resolveNutritionForMLPrediction(label, confidence) {
  const cleanLabel = label.toLowerCase();
  let selectedFood = null;

  // Check database catalog for matching keys
  for (let key in foodCatalog) {
    if (cleanLabel.includes(key) || key.includes(cleanLabel)) {
      selectedFood = { ...foodCatalog[key] };
      selectedFood.emoji = getFoodEmoji(key);
      break;
    }
  }

  if (!selectedFood) {
    // Dynamic macro calculator estimates based on classification name
    let calories = 250;
    let protein = 12;
    let carbs = 28;
    let fat = 10;
    let emoji = "🍽️";

    if (cleanLabel.includes("fruit") || cleanLabel.includes("apple") || cleanLabel.includes("banana") || cleanLabel.includes("strawberry") || cleanLabel.includes("pear") || cleanLabel.includes("orange")) {
      calories = 95; protein = 1; carbs = 24; fat = 0.5; emoji = "🍎";
    } else if (cleanLabel.includes("salad") || cleanLabel.includes("vegetable") || cleanLabel.includes("broccoli") || cleanLabel.includes("spinach") || cleanLabel.includes("greens")) {
      calories = 140; protein = 4; carbs = 10; fat = 9; emoji = "🥗";
    } else if (cleanLabel.includes("bread") || cleanLabel.includes("toast") || cleanLabel.includes("roll") || cleanLabel.includes("bun") || cleanLabel.includes("croissant")) {
      calories = 240; protein = 7; carbs = 45; fat = 3; emoji = "🍞";
    } else if (cleanLabel.includes("beef") || cleanLabel.includes("steak") || cleanLabel.includes("burger") || cleanLabel.includes("pork") || cleanLabel.includes("meat")) {
      calories = 380; protein = 35; carbs = 5; fat = 22; emoji = "🥩";
    } else if (cleanLabel.includes("chicken") || cleanLabel.includes("poultry") || cleanLabel.includes("turkey")) {
      calories = 220; protein = 38; carbs = 0; fat = 6; emoji = "🍗";
    } else if (cleanLabel.includes("fish") || cleanLabel.includes("salmon") || cleanLabel.includes("trout") || cleanLabel.includes("tuna")) {
      calories = 290; protein = 34; carbs = 0; fat = 16; emoji = "🐟";
    } else if (cleanLabel.includes("cake") || cleanLabel.includes("cookie") || cleanLabel.includes("chocolate") || cleanLabel.includes("muffin") || cleanLabel.includes("donut")) {
      calories = 360; protein = 4; carbs = 48; fat = 17; emoji = "🍩";
    } else if (cleanLabel.includes("pizza")) {
      calories = 290; protein = 12; carbs = 36; fat = 11; emoji = "🍕";
    } else if (cleanLabel.includes("egg") || cleanLabel.includes("omelette")) {
      calories = 154; protein = 12; carbs = 1.2; fat = 11; emoji = "🍳";
    }

    // Title capitalization
    const title = label.split(" ").map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(" ");
    selectedFood = {
      name: title,
      calories,
      protein,
      carbs,
      fat,
      ingredients: `Identified as ${title} by client-side deep learning vision model. Estimated metrics applied.`,
      emoji
    };
  }

  renderScannedResults(selectedFood, confidence);
}

function runFallbackComputerVision(filename, dataUri) {
  const cleanName = filename.toLowerCase();
  let selectedFood = null;

  for (let key in foodCatalog) {
    if (cleanName.includes(key)) {
      selectedFood = { ...foodCatalog[key] };
      selectedFood.emoji = getFoodEmoji(key);
      break;
    }
  }

  if (!selectedFood && dataUri) {
    selectedFood = sampleDominantColorsFromCanvas(dataUri);
  }

  if (!selectedFood) {
    selectedFood = {
      name: "Smart Protein Salad Bowl",
      calories: 340,
      protein: 22,
      carbs: 28,
      fat: 15,
      ingredients: "Brown rice, baked broccoli florets, protein chickpea mixture, roasted pumpkin seeds, tahini dressing.",
      emoji: "🥗"
    };
  }

  renderScannedResults(selectedFood, 90);
}

function renderScannedResults(selectedFood, confidence) {
  document.getElementById("detectedFoodTitle").textContent = selectedFood.name;
  document.getElementById("detectedFoodConfidence").textContent = `${confidence}% Match`;
  document.getElementById("scannedCals").textContent = selectedFood.calories;
  document.getElementById("scannedProtein").textContent = `${selectedFood.protein}g`;
  document.getElementById("scannedCarbs").textContent = `${selectedFood.carbs}g`;
  document.getElementById("scannedFat").textContent = `${selectedFood.fat}g`;
  document.getElementById("scannedIngredientsText").textContent = selectedFood.ingredients;

  document.getElementById("scanningStatusText").style.display = "none";
  const resultPanel = document.getElementById("aiScanResults");
  resultPanel.style.display = "flex";

  const addBtn = document.getElementById("acceptAiScanResult");
  const discardBtn = document.getElementById("rejectAiScanResult");

  addBtn.onclick = () => {
    const destMeal = document.getElementById("aiMealTypeSelect").value;
    const now = new Date();
    const timeStr = now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

    state.logs[destMeal].push({
      name: selectedFood.name,
      calories: selectedFood.calories,
      protein: selectedFood.protein,
      carbs: selectedFood.carbs,
      fat: selectedFood.fat,
      time: timeStr,
      thumb: selectedFood.emoji || "🍽️"
    });

    saveStateToStorage();
    updateUI();
    
    document.getElementById("aiScanModal").classList.remove("active");
    showToast(`AI Scanner added "${selectedFood.name}" to ${destMeal}`);
  };

  discardBtn.onclick = () => {
    resetScannerUI();
    showToast("AI Vision scan discarded.");
  };
}

// Dynamic canvas color analyzer
function sampleDominantColorsFromCanvas(dataUri) {
  try {
    const img = new Image();
    img.src = dataUri;
    
    const hiddenCanvas = document.createElement("canvas");
    hiddenCanvas.width = 10;
    hiddenCanvas.height = 10;
    const ctx = hiddenCanvas.getContext("2d");
    ctx.drawImage(img, 0, 0, 10, 10);
    
    const imgData = ctx.getImageData(0, 0, 10, 10).data;
    
    let redSum = 0;
    let greenSum = 0;
    let blueSum = 0;
    
    for (let i = 0; i < imgData.length; i += 4) {
      redSum += imgData[i];
      greenSum += imgData[i + 1];
      blueSum += imgData[i + 2];
    }
    
    // Average channels
    const totalPixels = 100;
    const avgR = redSum / totalPixels;
    const avgG = greenSum / totalPixels;
    const avgB = blueSum / totalPixels;
    
    // Heuristic color map
    // Reddish/Orange items (Marinara sauce, Pizza, Tomato soup)
    if (avgR > avgG + 15 && avgR > avgB + 15) {
      return {
        name: "Margherita Pizza Slice",
        calories: 290,
        protein: 12,
        carbs: 36,
        fat: 11,
        ingredients: "Sourdough wheat crust, fresh tomato pulp, sliced mozzarella cheese, sweet basil sprigs.",
        emoji: "🍕"
      };
    } 
    // Greenish items (Salad, Broccoli, Pesto)
    else if (avgG > avgR + 10 && avgG > avgB) {
      return {
        name: "Garden Salad Bowl",
        calories: 220,
        protein: 6,
        carbs: 15,
        fat: 10,
        ingredients: "Chopped romaine hearts, fresh cucumbers, sliced green peppers, olive oil vinaigrette.",
        emoji: "🥗"
      };
    } 
    // Bright whiteish/yellow items (Rice, Eggs, Chicken)
    else if (avgR > 180 && avgG > 180 && avgB < 150) {
      return {
        name: "Scrambled Eggs (2)",
        calories: 154,
        protein: 12,
        carbs: 1.2,
        fat: 11,
        ingredients: "Fresh cage-free eggs, scrambled with salt and a touch of unsalted butter.",
        emoji: "🍳"
      };
    }
  } catch (err) {
    console.error("Canvas sampling error:", err);
  }
  return null; // triggers generic fallback
}

function getFoodEmoji(key) {
  const map = {
    salad: "🥗", pizza: "🍕", apple: "🍎", chicken: "🍗", burger: "🍔",
    egg: "🍳", banana: "🍌", salmon: "🐟", pasta: "🍝", steak: "🥩",
    avocado: "🥑", rice: "🍚", sushi: "🍣"
  };
  return map[key] || "🍽️";
}

// --- CHATBOT ASSISTANT LOGIC ---
function appendChatMessage(text, sender) {
  const msgContainer = document.getElementById("chatbotMessages");
  const bubble = document.createElement("div");
  bubble.className = `chat-bubble bubble-${sender}`;
  bubble.innerHTML = text.replace(/\n/g, "<br>");
  msgContainer.appendChild(bubble);
  
  // Scroll to bottom
  msgContainer.scrollTop = msgContainer.scrollHeight;
}

function generateCoachResponse(userMessage) {
  const cleanMsg = userMessage.toLowerCase();
  let response = "";

  const name = state.profile.name;
  const bmi = calculateBMI();
  const goal = state.profile.goal;
  
  let consumed = 0;
  let protein = 0;
  Object.keys(state.logs).forEach(meal => {
    state.logs[meal].forEach(item => {
      consumed += item.calories;
      protein += item.protein || 0;
    });
  });

  // Calculate current macros targets
  const remainingCals = state.profile.caloriesGoal - consumed;

  // Smart conversational triggers
  if (cleanMsg.includes("lose weight") || cleanMsg.includes("deficit") || cleanMsg.includes("how to lose")) {
    response = `To lose weight safely, you need to maintain a calorie deficit. Your current daily budget is set to **${state.profile.caloriesGoal} kcal** (which already includes a -500 kcal deficit from your metabolic rate). 

Here are three golden rules for your plan:
1. **Prioritize Protein:** Eat ${state.profile.macrosGoal.protein}g protein daily to preserve lean muscle.
2. **Drink Water:** Increase hydration. You currently logged ${state.waterCups * 250}ml today. Aim for 2000ml.
3. **Walk More:** Small strolls after meals lower blood glucose levels. You have completed **${state.stepsCount} steps** today, try getting to 8,000.`;
  } 
  else if (cleanMsg.includes("bmi")) {
    let bmiLabel = "Healthy";
    if (bmi < 18.5) bmiLabel = "Underweight";
    else if (bmi >= 25 && bmi < 30) bmiLabel = "Overweight";
    else if (bmi >= 30) bmiLabel = "Obese";

    response = `Hi ${name}, your current body metric details calculate to a **BMI of ${bmi}**, which falls in the **${bmiLabel}** range. 
    
    * Weight: ${state.profile.weight} kg
    * Height: ${state.profile.height} cm
    
    Our auto-calculation has adjusted your target budget to **${state.profile.caloriesGoal} kcal** to safely guide your path. Let me know if you want to set a customized deficit.`;
  } 
  else if (cleanMsg.includes("protein") || cleanMsg.includes("snack")) {
    response = `Meeting your protein goals is key for muscle recovery. Today, you have logged **${Math.round(protein)}g protein** out of your **${state.profile.macrosGoal.protein}g** target. 

Here are some excellent high-protein snack recommendations:
* **Greek Yogurt (Plain, 0%):** 15g protein, 100 kcal.
* **Hard-Boiled Eggs (2):** 12g protein, 140 kcal.
* **Canned Tuna (in water):** 24g protein, 110 kcal.
* **Beef/Turkey Jerky (28g):** 10g protein, 80 kcal.`;
  } 
  else if (cleanMsg.includes("cardio") || cleanMsg.includes("workout") || cleanMsg.includes("exercise")) {
    response = `Nice job on planning workouts! Today, your active exercise logs show **${document.getElementById("workoutCaloriesBurnedTotal").textContent} burned**.

Here is a quick, high-intensity 15-minute home workout you can do without equipment:
1. **Jumping Jacks:** 1 minute (Warmup)
2. **Bodyweight Squats:** 3 sets x 15 reps (Legs)
3. **Push-Ups (or Kneeling):** 3 sets x 10 reps (Upper body)
4. **Plank Hold:** 3 sets x 45 seconds (Core strength)
5. **Mountain Climbers:** 2 minutes (Cardio burst)`;
  } 
  else if (cleanMsg.includes("status") || cleanMsg.includes("today") || cleanMsg.includes("calorie")) {
    response = `Here is your day's metabolic overview, ${name}:
    
* **Calorie Budget:** ${state.profile.caloriesGoal} kcal
* **Food Consumed:** ${consumed} kcal
* **Calories Burned:** ${document.getElementById("workoutCaloriesBurnedTotal").textContent}
* **Remaining Budget:** **${remainingCals} kcal**

You are currently **${Math.round((consumed / state.profile.caloriesGoal) * 100)}%** through your calorie allowance. Make sure you log your dinner items!`;
  } 
  else {
    response = `That's a great question, ${name}! As your AI coach, I'm here to support you. 

Could you specify what details you'd like to check? You can ask about:
* **Macros targets** or how much protein you've eaten.
* **Tips to achieve weight targets** or maintain calories.
* **Workout recommendations** you can do today.`;
  }

  appendChatMessage(response, "assistant");
}

// --- Open Food Facts API Dynamic Search ---
async function searchOpenFoodFactsAPI(query) {
  const resultsContainer = document.getElementById("dbSearchResults");
  resultsContainer.style.display = "block";
  resultsContainer.innerHTML = `<div class="db-search-status-msg"><i class="fa-solid fa-spinner fa-spin"></i> Searching database...</div>`;

  try {
    const url = `https://world.openfoodfacts.org/cgi/search.pl?search_terms=${encodeURIComponent(query)}&search_simple=1&action=process&json=1`;
    const response = await fetch(url);
    const data = await response.json();

    if (!data.products || data.products.length === 0) {
      resultsContainer.innerHTML = `<div class="db-search-status-msg">No products found matching "${query}"</div>`;
      return;
    }

    resultsContainer.innerHTML = "";
    
    // Grab top 5 search items
    const products = data.products.slice(0, 5);
    products.forEach(product => {
      const name = product.product_name || "Unknown Product";
      const brand = product.brands || "Generic Brand";
      
      const nutriments = product.nutriments || {};
      const calories = Math.round(nutriments['energy-kcal_100g'] || nutriments['energy-kcal_serving'] || nutriments['energy-kcal'] || 0);
      const protein = Math.round(nutriments['proteins_100g'] || nutriments['proteins'] || 0);
      const carbs = Math.round(nutriments['carbohydrates_100g'] || nutriments['carbohydrates'] || 0);
      const fat = Math.round(nutriments['fat_100g'] || nutriments['fat'] || 0);

      const itemEl = document.createElement("div");
      itemEl.className = "db-search-result-item";
      itemEl.innerHTML = `
        <div class="db-result-title-block">
          <span class="db-result-name">${name}</span>
          <span class="db-result-brand">${brand} (per 100g)</span>
        </div>
        <span class="db-result-cals">${calories} kcal</span>
      `;
      
      itemEl.addEventListener("click", () => {
        document.getElementById("manualFoodName").value = `${name} (${brand})`;
        document.getElementById("manualCalories").value = calories;
        document.getElementById("manualProtein").value = protein;
        document.getElementById("manualCarbs").value = carbs;
        document.getElementById("manualFat").value = fat;
        
        resultsContainer.style.display = "none";
        showToast(`Selected: ${name}`);
      });

      resultsContainer.appendChild(itemEl);
    });
  } catch (err) {
    console.error("Open Food Facts search error:", err);
    resultsContainer.innerHTML = `<div class="db-search-status-msg" style="color: var(--accent-red);"><i class="fa-solid fa-triangle-exclamation"></i> Network error. Please try again.</div>`;
  }
}
