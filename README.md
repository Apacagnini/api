# NestJS TypeScript API for Auth & User Management

## Description

This project is an API built using the [NestJS](https://nestjs.com/) framework, leveraging TypeScript for robust type safety. The API offers authentication and user management functionality within a microservices architecture. Core features include:

- **User Registration and Authentication**: Secure endpoints for registering and authenticating users, utilizing bcrypt for password hashing and JWT for stateless authentication.
- **User Management**: Admin functionality to list and manage registered users, with pagination and search capabilities.
- **Event Logging**: Comprehensive logging of user events, providing endpoints to retrieve logs with filters for date ranges and user-specific events.
- **Swagger Integration**: Automated API documentation and testing interface through Swagger UI.

The API is built to seamlessly integrate with MongoDB for data storage. It leverages Docker for containerization, enabling consistent and efficient deployment across multiple environments. Continuous deployment is facilitated through Docker Hub, allowing for streamlined updates and maintenance.

## Technologies

- **[NestJS](https://nestjs.com/):** Node.js framework
- **[TypeScript](https://www.typescriptlang.org/):** Typed JavaScript
- **[MongoDB](https://www.mongodb.com/):** Document database
- **[JWT](https://jwt.io/):** JSON Web Tokens
- **[Docker](https://www.docker.com/):** Container platform
- **[Jest](https://jestjs.io/):** Testing framework

## Installation

1. Clone the repository:
    ```bash
    git clone https://github.com/Apacagnini/api.git
    cd api
    ```

2. Install the dependencies:
    ```bash
    npm install
    ```

3. Build the project:
    ```bash
    npm run build
    ```

## Configuration

Create a `.env` file in the project root and set the following environment variables:

```env
MONGO_URI=your_mongodb_atlas_uri
JWT_SECRET=your_jwt_secret_key
PORT=3000
USERS_COLLECTION_MAX_SIZE=your_users_collection_max_size_in_bytes
LOGS_COLLECTION_MAX_SIZE=your_logs_collection_max_size_in_bytes
```

## Running the Application

### Development

To run the application in development mode:
```bash
npm run start:dev
```

### Production

To run the application in production mode:
```bash
npm run start:prod
```

### Watch Mode

To run the application in watch mode:
```bash
npm run start
```

## API Endpoints

### Authentication

#### Register User

- **URL**: `/auth/register`
- **Method**: `POST`
- **Request Body**:
    ```json
    {
        "email": "user@example.com",
        "password": "password123"
    }
    ```
- **Responses**:
    - `201 Created`: User successfully registered.
    - `400 Bad Request`: Invalid input data.
    - `409 Conflict`: Email already exists.
    - `503 Service Unavailable`
    - `503 Error registering user: Database full.`

#### Authenticate User

- **URL**: `/auth/login`
- **Method**: `POST`
- **Request Body**:
    ```json
    {
        "email": "user@example.com",
        "password": "password123"
    }
    ```
- **Responses**:
    - `200 OK`: User successfully authenticated.
    - `400 Bad Request`: Invalid input data.
    - `401 Unauthorized`: Incorrect email or password.

### Users

#### Get Users

This endpoint retrieves a list of registered users in the system. Requires authentication.

- **URL**: `/auth/users`
- **Method**: `GET`
- **Headers**:
    - `Authorization`: `Bearer [jwt_token]`
- **Query Parameters**:
    - `page`: Page number (optional)
    - `limit`: Number of items per page (optional)
    - `email`: Email to search for (optional)
- **Responses**:
    - `200 OK`: List of users.

### Logs

#### Get Logs

This endpoint retrieves event logs recorded in the system. Requires authentication.

- **URL**: `/auth/logs`
- **Method**: `GET`
- **Headers**:
    - `Authorization`: `Bearer [jwt_token]`
- **Query Parameters**:
    - `page`: Page number (optional)
    - `limit`: Number of items per page (optional)
    - `email`: Email to search for in the logs (optional)
    - `from`: Start date in valid formats `YYYY-MM-DDTHH:mm:ss` or `YYYY-MM-DD` (optional)
    - `to`: End date in valid formats `YYYY-MM-DDTHH:mm:ss` or `YYYY-MM-DD` (optional)
- **Responses**:
    - `200 OK`: List of logs.

## Swagger

Swagger documentation and testing interface is available at:
- **URL**: `/api`

## Collection Size Limits

### Users Collection

If the `users` collection reaches the size limit specified by the `USERS_COLLECTION_MAX_SIZE` environment variable, the application will not allow new user registrations. Users attempting to register will receive a `503 Service Unavailable` response with the message: `Error registering user: Database full.`

### Logs Collection

If the `logs` collection reaches the size limit specified by the `LOGS_COLLECTION_MAX_SIZE` environment variable, the application will manage the logs by writing new logs while simultaneously deleting the oldest ones. This ensures that the collection does not exceed the size limit and continues to accept new log entries.

## Deployment

### Docker Deployment

Based on the project files, a Docker image was created and uploaded to a public repository on Docker Hub. This image was then used for deployment on Koyeb.

1. **Build Docker Image**:
    ```bash
    docker build -t nestjs-api-app .
    ```

2. **Push Docker Image to Docker Hub**:
    ```bash
    docker tag nestjs-api-app:latest apacagnini/nestjs-api-app:1.0
    docker push apacagnini/nestjs-api-app:1.0
    ```

3. **Deploy on Koyeb**:
    - In the Koyeb dashboard, a new service was created.
    - "Docker Hub" was selected as the source.
    - The Docker image name `apacagnini/nestjs-api-app` was provided.
    - The necessary environment variables for MongoDB Atlas and other configurations were set.
    - The service was deployed and ensured to start without issues.

Additionally, permissions were granted in MongoDB Atlas in the 'Network Access' section to enable the connection from the application deployed on Koyeb. Using the `dig` command and the selected deployment zone on Koyeb, a series of IP addresses were obtained. These IP addresses were then whitelisted in MongoDB Atlas.

Continuous deployment is achieved by releasing updates to the Docker image on Docker Hub, which subsequently updates the service in production on Koyeb. Docker was utilized to ensure application portability, simplifying deployment, scaling, and maintenance across consistent environments from development to production.

## Docker Usage

### Building the Docker Image

To build the Docker image for this NestJS API, run the following command:
```bash
docker build -t nestjs-api-app .
```

### Pulling the Docker Image

To download the pre-built Docker image from Docker Hub, use:
```bash
docker pull apacagnini/nestjs-api-app:latest
```

### Running the Docker Container

To run the Docker container locally, execute:
```bash
docker run --env-file .env -p 3000:3000 nestjs-api-app
```

Ensure you have the necessary environment variables set in your local environment or passed to the container.

## Local API Usage Examples

### Register User
- **URL**: `http://localhost:3000/auth/register`
- **Description**: Endpoint to register a new user.
- **Method**: `POST`
- **Example Request Body**:
    ```json
    {
        "email": "user@example.com",
        "password": "password123"
    }
    ```

### Authenticate User
- **URL**: `http://localhost:3000/auth/login`
- **Description**: Endpoint to authenticate a user.
- **Method**: `POST`
- **Example Request Body**:
    ```json
    {
        "email": "user@example.com",
        "password": "password123"
    }
    ```

### Get Users
- **URL**: `http://localhost:3000/auth/users`
- **Description**: Endpoint to retrieve a list of registered users. Requires authentication.
- **Method**: `GET`
- **Headers**:
    - `Authorization`: `Bearer [jwt_token]`
- **Example Query Parameters**:
    ```
    http://localhost:3000/auth/users?page=1&limit=10&email=user
    ```

### Get Logs
- **URL**: `http://localhost:3000/auth/logs`
- **Description**: Endpoint to retrieve event logs. Requires authentication.
- **Method**: `GET`
- **Headers**:
    - `Authorization`: `Bearer [jwt_token]`
- **Example Query Parameters**:
    ```
    http://localhost:3000/auth/logs?page=1&limit=10&email=user&from=2023-01-01&to=2023-12-31
    ```

### Swagger UI
- **URL**: `http://localhost:3000/api`
- **Description**: Access the Swagger UI for API documentation and testing.

## Testing

To run unit tests:
```bash
npm run test
```

To run end-to-end tests:
```bash
npm run test:e2e
```

To generate the test coverage report:
```bash
npm run test:cov
```
