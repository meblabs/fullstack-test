# Fullstack Test

**ONLY FOR ITALIAN GUYS**

This repository is designed to test the technical skills of candidates for a full stack developer position. It consists of the following structure:

- **Api**: The backend folder built with Node.js.
- **Frontend**: The frontend folder built with React and Ant Design.
- **docker-compose.yml**: A Docker Compose file in the root directory to run three containers locally, simulating a small infrastructure (API, frontend, and MongoDB database).

### Objective

Expense and Income Diary: Create an application to track daily expenses and incomes. Users should be able to add, read, update, and delete expense and income entries.

### Task Description

1. **Clone this repository** to your local machine.
2. Create a new repository on your own GitHub account.
3. Push the cloned repository to your new GitHub repository.
4. Implement a small API that performs CRUD operations as specified.
5. Create a frontend application to interact with the CRUD API.
6. When completed, send an email with the link to your repository to [staff@meblabs.com](mailto:staff@meblabs.com).

**Note**:
The template provides several features, helpers, and middleware for the backend, and components for the frontend. It is up to the candidate to choose whether to use them or not. You are not required to overdo or spend excessive time on this task. The exercise will be a discussion point, where you can justify your choices and explain any features you omitted due to time constraints or other reasons.

### Commit Guidelines

Please make your commits in a structured and meaningful way. Ideally, follow the [Conventional Commits](https://www.conventionalcommits.org/en/v1.0.0/) specification.

### Evaluation Criteria

1. **Code Quality**: Clean, well-structured, and commented code.
2. **Functionality**: The CRUD operations work as expected and are tested in the `api/specs` folder.
3. **UI/UX**: The frontend is user-friendly and visually appealing.

### Requirements

- [Node.js](https://nodejs.org/) (use version 20.x)
- [npm](https://www.npmjs.com/)
- [Docker](https://www.docker.com/)
- [VSCode](https://code.visualstudio.com/) (recommended extensions: [ESLint](https://marketplace.visualstudio.com/items?itemName=dbaeumer.vscode-eslint) and [Prettier](https://marketplace.visualstudio.com/items?itemName=esbenp.prettier-vscode))

### Getting Started

1. Clone the repository.
2. Install the packages with `npm ci` in both the `api` and `frontend` folders.
3. Run `docker-compose up` from the root directory.
4. Once Docker is up and running, to seed the database, run the command `npm run seed` inside the `api` folder.
5. Visit `http://localhost` to access the application. Use the following credentials, created by the seed process, to log in:
   - **Email**: `test@meblabs.com`
   - **Password**: `testtest`
6. Start coding!

Good luck!
