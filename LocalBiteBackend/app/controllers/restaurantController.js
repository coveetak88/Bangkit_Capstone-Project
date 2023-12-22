const googleMapsClient = require("../config/googleMapsPlatform");
const axios = require("axios");

const findNearestRestaurant = (req, res) => {
  const menu = req.body.menu;
  const { latitude, longitude, radius } = req.body;

  const radiusNumber = Number(radius);

  googleMapsClient.placesNearby(
    {
      location: [latitude, longitude],
      radius: radiusNumber,
      type: "restaurant",
      keyword: menu,
    },
    async (err, response) => {
      if (err) {
        res
          .status(500)
          .json({ error: "Error fetching data from Google Maps API" });
      } else {
        const userLocation = { lat: latitude, lng: longitude };
        const restaurants = await Promise.all(
          response.json.results.map(async (restaurant) => {
            const restaurantLocation = restaurant.geometry.location;
            const distance = calculateDistance(
              userLocation,
              restaurantLocation,
            );
            const hidden_gem = await hiddenGemClassification(
              restaurant.rating,
              restaurant.user_ratings_total,
            );
            return { ...restaurant, distance, hidden_gem };
          }),
        );

        res.json({ restaurants });
      }
    },
  );
};

// Function to calculate distance using Haversine formula
function calculateDistance(point1, point2) {
  const earthRadius = 6371; // Radius of the Earth in kilometers

  const lat1 = toRadians(point1.lat);
  const lon1 = toRadians(point1.lng);
  const lat2 = toRadians(point2.lat);
  const lon2 = toRadians(point2.lng);

  const dlat = lat2 - lat1;
  const dlon = lon2 - lon1;

  const a =
    Math.sin(dlat / 2) * Math.sin(dlat / 2) +
    Math.cos(lat1) * Math.cos(lat2) * Math.sin(dlon / 2) * Math.sin(dlon / 2);

  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));

  const distance = earthRadius * c; // Distance in kilometers
  return distance;
}

// Function to convert degrees to radians
function toRadians(degrees) {
  return degrees * (Math.PI / 180);
}

async function hiddenGemClassification(rating, user_ratings_total) {
  try {
    const requestData = {
      rating,
      user_ratings_total,
    };

    const response = await axios.post(
      "https://hidden-gem-class-6uf4oi4e3q-et.a.run.app/predict",
      requestData,
    );

    const prediction = response.data.prediction[0];

    // console.log(prediction);
    return prediction === 0 ? false : true;
  } catch (error) {
    console.error("Error:", error.message);
    throw error;
  }
}

module.exports = { findNearestRestaurant };
