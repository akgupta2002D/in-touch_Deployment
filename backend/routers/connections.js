import express from 'express';
import rateLimit from "express-rate-limit";

import ConnectionsController from '../controllers/connections.js';
import { requireAccessToken } from '../middleware/auth.js';

const ConnectionsRouter = express.Router();

const connectionsRateLimiter = rateLimit({ 
  windowMs: 1 * 60 * 1000, // 1 minute window
  max: 20, // limit each IP to 20 requests per windowMs
  standardHeaders: true,
  legacyHeaders: false,
});

ConnectionsRouter.use(connectionsRateLimiter);

ConnectionsRouter.use(requireAccessToken);

//Note that for a given request we should be able to get the user ID from req.user.id because of the requireAccessToken middleware

// Route to get 50 connections for the authenticated user (on the page number provided -- connections are ranked by reachout_priority and ((current_time - last_contacted_at) - reminder frequency)) then ordered by alphabetical within those groups --- Note that this route does not need to get all of a connection's details, just id,  connection_name, reachout_priority, reminder_frequency, created_at, and last_contacted_at
ConnectionsRouter.get('/page/:page', ConnectionsController.getConnections);

//Route to create a new connection for the authenticated user
ConnectionsRouter.post('/', ConnectionsController.createConnection);

//Route to update an existing connection for the authenticated user
ConnectionsRouter.put('/:connectionId(\\d+)', ConnectionsController.updateConnection);

//Route to delete a connection for the authenticated user
ConnectionsRouter.delete('/:connectionId(\\d+)', ConnectionsController.deleteConnection);

//Route to get details for a specific connection --- this should return all fields for that connection
ConnectionsRouter.get('/id/:connectionId', ConnectionsController.getConnectionDetails);

//Route to search connections by connection_name for the authenticated user - not page specific, just return all matching connections
ConnectionsRouter.get('/search/:query', ConnectionsController.searchConnections);



export default ConnectionsRouter;