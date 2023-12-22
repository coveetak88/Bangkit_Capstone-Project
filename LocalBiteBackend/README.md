# LocalBite Backend

LocalBite's backend is built using Node.js, providing a robust foundation for user authentication, CRUD operations, machine learning model integration, and external API interactions. This README provides comprehensive information on replicating the steps to set up and run the backend for the LocalBite application.

### Created By LocalBite Cloud Computing Team

C008BSX3273 - Fayza Nizma Safaya Harda 

C008BSX3272 - Safira Isma Aulia 

## Accessing Deployed API

The LocalBite backend API is live and can be accessed at the following endpoint:

```plaintext
https://backend-6uf4oi4e3q-et.a.run.app/
```

Replace `localbite-backend-url.com` with the actual URL provided.

## API Documentation

Explore the API's capabilities using the Swagger documentation. The documentation is available at the following URL:

```plaintext
https://backend-6uf4oi4e3q-et.a.run.app/api-docs/
```

This interactive documentation provides details on available endpoints, request/response formats, and authentication requirements.

## Prerequisites

Before getting started, ensure you have the following installed:

- [Node.js](https://nodejs.org/)
- [npm](https://www.npmjs.com/)

## Installation

1. Clone the repository to your local machine:

   ```bash
   git clone https://github.com/coveetak88/Bangkit_Capstone-Project.git
   ```

2. Navigate to the backend directory:

   ```bash
   cd Bangkit_Capstone-Project/LocalBiteBackend

3. Install dependencies:

   ```bash
   npm install
   ```

4. Set up environment variables:
   - Create a `.env` file in the backend directory.
   - Add the following variables:

     ```env
     PORT=3000
     FIREBASE_PROJECT_ID=your-firebase-project-id
     FIREBASE_PRIVATE_KEY=your-firebase-private-key
     FIREBASE_CLIENT_EMAIL=your-firebase-client-email
     GOOGLE_MAPS_API_KEY=your-google-maps-api-key
     JWT_SECRET=your-jwt-secret
     ```

   - Replace placeholders (`your-firebase-project-id`, `your-firebase-private-key`, etc.) with your actual credentials.

5. Start the backend server:

   ```bash
   npm start
   ```

## Available Scripts

- **npm start**: Starts the server using `nodemon` for automatic reloading on code changes.

## Dependencies

- [@google-cloud/firestore](https://www.npmjs.com/package/@google-cloud/firestore): Firestore database interaction.
- [@google/maps](https://www.npmjs.com/package/@google/maps): Google Maps API integration.
- [@types/node](https://www.npmjs.com/package/@types/node): Type definitions for Node.js.
- [axios](https://www.npmjs.com/package/axios): HTTP client for making requests to external APIs.
- [bcrypt](https://www.npmjs.com/package/bcrypt): Hashing library for password security.
- [body-parser](https://www.npmjs.com/package/body-parser): Middleware for parsing HTTP request bodies.
- [dotenv](https://www.npmjs.com/package/dotenv): Loading environment variables from a .env file.
- [express](https://www.npmjs.com/package/express): Web framework for Node.js.
- [firebase-admin](https://www.npmjs.com/package/firebase-admin): Firebase Admin SDK for server-side functionality.
- [jsonwebtoken](https://www.npmjs.com/package/jsonwebtoken): Implementation of JSON Web Tokens (JWT) for user authorization.
- [node-fetch](https://www.npmjs.com/package/node-fetch): Fetch API for Node.js.
- [nodemailer](https://www.npmjs.com/package/nodemailer): Sending email for verification and password reset.
- [swagger-jsdoc](https://www.npmjs.com/package/swagger-jsdoc): Generates Swagger/OpenAPI documentation from JSDoc comments.
- [swagger-ui-express](https://www.npmjs.com/package/swagger-ui-express): Middleware for serving Swagger UI for API documentation.
- [uuid](https://www.npmjs.com/package/uuid): Generating unique identifiers.

## Contributing

Feel free to contribute to the development of LocalBite's backend. Create a pull request, report issues, or suggest improvements.

Happy coding!
