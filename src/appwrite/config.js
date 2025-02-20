import { Client, Account, Databases, Storage, Teams } from "appwrite";

// Access environment variables
const Endpoint = process.env.REACT_APP_APPWRITE_ENDPOINT;
const projectID = process.env.REACT_APP_APPWRITE_PROJECT_ID;
const databaseId = process.env.REACT_APP_APPWRITE_DATABASE_ID;



export const client = new Client();

client
  .setEndpoint(Endpoint) // Your Appwrite Endpoint
  .setProject(projectID); // Your project ID

export const account = new Account(client);
export const databases = new Databases(client);
export const storage = new Storage(client);
export const teams = new Teams(client);

export { databaseId,projectID };
