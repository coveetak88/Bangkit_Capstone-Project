const db = require("../config/firestore");
const axios = require("axios");

const getFoodsByKeyword = async (req, res) => {
  try {
    const { keyword } = req.query;
    const productsRef = db.collection("foods");

    // Mengubah kata kunci dan nama produk menjadi lowercase
    const lowerKeyword = keyword.toLowerCase();

    // Mendapatkan data dari Firestore
    const snapshot = await productsRef.get();

    const products = [];
    snapshot.forEach((doc) => {
      // Memeriksa apakah nama produk mengandung kata kunci yang diberikan (case insensitive)
      const productName = doc.data().name.toLowerCase();
      if (productName.includes(lowerKeyword)) {
        products.push(doc.data());
      }
    });

    res.json(products);
  } catch (error) {
    res.status(500).send(error);
  }
};

const getMealPlan = async (req, res) => {
  try {
    const userId = req.user.userId;
    const usersRef = db.collection("users");
    const query = usersRef.where("uid", "==", userId);
    const querySnapshot = await query.get();

    if (querySnapshot.empty) {
      return res.status(404).json({ error: "User not found." });
    }

    let userData = querySnapshot.docs[0].data().userPreferences;

    if (!userData) {
      return res
        .status(404)
        .json({ error: "Please complete the user preferences first." });
    }

    // Mapping weight_loss values
    const weightLossMap = {
      "Maintain weight": 1,
      "Mild weight loss": 0.9,
      "Weight loss": 0.8,
      "Extreme weight loss": 0.6,
    };
    const userWeightLoss = weightLossMap[userData.weight_loss];

    // Mapping meals_calories_perc based on number_of_meals
    let mealsCaloriesPerc;
    if (userData.number_of_meals === 3) {
      mealsCaloriesPerc = { "breakfast": 0.35, "lunch": 0.4, "dinner": 0.25 };
    } else if (userData.number_of_meals === 4) {
      mealsCaloriesPerc = {
        "breakfast": 0.3,
        "morning snack": 0.05,
        "lunch": 0.4,
        "dinner": 0.25,
      };
    } else {
      mealsCaloriesPerc = {
        "breakfast": 0.3,
        "morning snack": 0.05,
        "lunch": 0.4,
        "afternoon snack": 0.05,
        "dinner": 0.2,
      };
    }

    // Combine allergen and non halal data for restriction_food
    const allergen = userData.allergen || [];
    const halal = userData.halal
      ? ["beer", "pork", "wine", "bacon", "lard"]
      : [];
    const restrictionFood = [...allergen, ...halal];

    // Mendapatkan keywords dari body request
    const userKeywords = req.body.keywords || [];

    // Parameter yang akan dikirimkan ke server model
    const requestBody = {
      age: userData.age,
      height: userData.height,
      weight: userData.weight,
      gender: userData.gender,
      activity: userData.activity,
      weight_loss: userWeightLoss,
      meals_calories_perc: mealsCaloriesPerc,
      restriction_food: restrictionFood,
      disease: userData.disease,
      user_keywords: userKeywords,
    };

    // Menggunakan Axios untuk mengirim POST request ke server model
    // console.log("Request body:", requestBody);
    const response = await axios.post(
      "https://food-recommendation-model-6uf4oi4e3q-et.a.run.app/recommend",
      requestBody,
    );

    let userMealPlan = response.data;

    // const flatArray = userMealPlan.flat();
    console.log("typeof userMealPlan", typeof userMealPlan);
    console.log("Array.isArray(userMealPlan)", Array.isArray(userMealPlan));
    // console.log(typeof userMealPlan);
    // const userMealPlan2 = JSON.parse(userMealPlan.replace(/'/g, '"'));
    
    if (!Array.isArray(userMealPlan)) {
      // userMealPlan = JSON.parse(userMealPlan.replace(/'/g, '"'));    
      try {
        userMealPlan = jsonString.replace(/NaN/g, 'null');
        userMealPlan = JSON.parse(userMealPlan.replace(/'/g, '"'));
        console.log("JSON is valid:", typeof jsonObject);
      } catch (error) {
        // const error = error;
        console.error("Error parsing JSON:", error);
      }

      const match = error.match(/\d+/);
      const errorPosition = match ? parseInt(match[0]) : null;
      userMealPlan = jsonString.slice(0, errorPosition) + ',' + jsonString.slice(errorPosition);

      console.log("typeof userMealPlan2", typeof userMealPlan);
      // console.log("errorPosition", typeof errorPosition); :D WKWK MAAP
    }
    // console.log("typeof userMealPlan2", typeof userMealPlan2);
    // console.log("Array.isArray(userMealPlan2)",Array.isArray(userMealPlan2));
    // console.log(userMealPlan)


    let flatArray = [];

    // Loop melalui setiap array di dalam array besar
      userMealPlan.forEach(array => {
        // Loop melalui setiap elemen dalam array kecil dan tambahkan ke array tunggal
        array.forEach(element => {
            flatArray.push(element);
        });
    });

    const transformedData = {
      "recommendations": flatArray.map(item => ({
        "Calories": item.Calories || 0,
        "CarbohydrateContent": item.CarbohydrateContent || 0,
        "CholesterolContent": item.CholesterolContent || 0,
        "CookTime": item.CookTime || "",
        "MealTime": item.MealTime || "",
        "FatContent": item.FatContent || 0,
        "ProteinContent": item.ProteinContent || 0,
        "FiberContent": item.FiberContent || 0,
        "Images": item.Images || [],
        "Name": item.Name || "",
        "TotalTime": item.TotalTime || "",
      }))
    };

    // console.log(userMealPlan)

    return res.status(200).json(transformedData);
    // return res.status(200).send(userMealPlan);
  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
};

const realTimeCravings = async (req, res) => {
  try {
    const userId = req.user.userId;
    const usersRef = db.collection("users");
    const query = usersRef.where("uid", "==", userId);
    const querySnapshot = await query.get();

    if (querySnapshot.empty) {
      return res.status(404).json({ error: "User not found." });
    }

    let userData = querySnapshot.docs[0].data().userPreferences;

    if (!userData) {
      return res
        .status(404)
        .json({ error: "Please complete the user preferences first." });
    }

    // Mapping weight_loss values
    const weightLossMap = {
      "Maintain weight": 1,
      "Mild weight loss": 0.9,
      "Weight loss": 0.8,
      "Extreme weight loss": 0.6,
    };
    const userWeightLoss = weightLossMap[userData.weight_loss];

    // Mapping meals_calories_perc based on number_of_meals
    const mealsCaloriesPerc = {
      "lunch": 0.4,
    };

    // Combine allergen and non halal data for restriction_food
    const allergen = userData.allergen || [];
    const halal = userData.halal
      ? ["beer", "pork", "wine", "bacon", "lard"]
      : [];
    const restrictionFood = [...allergen, ...halal];

    // Mendapatkan keywords dari body request
    const userKeywords = req.body.keywords || [];

    // Parameter yang akan dikirimkan ke server model
    const requestBody = {
      age: userData.age,
      height: userData.height,
      weight: userData.weight,
      gender: userData.gender,
      activity: userData.activity,
      weight_loss: userWeightLoss,
      meals_calories_perc: mealsCaloriesPerc,
      restriction_food: restrictionFood,
      disease: userData.disease,
      user_keywords: userKeywords,
    };

    // Menggunakan Axios untuk mengirim POST request ke server model
    // console.log("Request body:", requestBody);
    const response = await axios.post(
      "https://food-recommendation-model-6uf4oi4e3q-et.a.run.app/recommend",
      requestBody,
    );

    const userMealPlan = response.data;
    const flatArray = userMealPlan.flat();

    const transformedData = {
      "recommendations": flatArray.map(item => ({
        "Calories": item.Calories || 0,
        "CarbohydrateContent": item.CarbohydrateContent || 0,
        "CholesterolContent": item.CholesterolContent || 0,
        "CookTime": item.CookTime || "",
        "MealTime": item.MealTime || "",
        "FatContent": item.FatContent || 0,
        "ProteinContent": item.ProteinContent || 0,
        "FiberContent": item.FiberContent || 0,
        "Images": item.Images || [],
        "Name": item.Name || "",
        "TotalTime": item.TotalTime || "",
      }))
    };

    // console.log(transformedData)

    return res.status(200).json(transformedData);
    // return res.status(200).send(transformedData);
  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
};

module.exports = {
  getFoodsByKeyword,
  getMealPlan,
  realTimeCravings,
};
