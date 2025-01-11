import express from 'express';
import user from '../models/user.js';
import transaction from '../models/transaction.js';
import bcrypt from 'bcryptjs';
import { Op } from 'sequelize';


const router = express.Router();
/**
 * @swagger
 * components:
 *   schemas:
 *     User:
 *       type: object
 *       properties:
 *         id:
 *           type: integer
 *         email:
 *           type: string
 *         username:
 *           type: string
 *         balance:
 *           type: number
 *           format: float
 *     LoginInput:
 *       type: object
 *       required:
 *         - email
 *         - password
 *       properties:
 *         email:
 *           type: string
 *           format: email
 *         password:
 *           type: string
 *     RegisterInput:
 *       type: object
 *       required:
 *         - username
 *         - email
 *         - password
 *       properties:
 *         username:
 *           type: string
 *         email:
 *           type: string
 *           format: email
 *         password:
 *           type: string
 */

/**
 * @swagger
 * /login:
 *   get:
 *     summary: Display login page
 *     description: Returns the login page
 *     responses:
 *       200:
 *         description: Login page rendered successfully
 */
router.get('/login', (req, res) => {
  res.render('login'); //on request => respond with rendering login page
});

/**
 * @swagger
 * /login:
 *   post:
 *     summary: Authenticate user
 *     description: Authenticates user with email and password
 *     requestBody:
 *       required: true
 *       content:
 *         application/x-www-form-urlencoded:
 *           schema:
 *             $ref: '#/components/schemas/LoginInput'
 *     responses:
 *       302:
 *         description: Redirects to dashboard on success or back to login on failure
 */
router.post('/login', async (req, res) => {
  const { email, password } = req.body; //extracts email and password from request body

  try{
    //attempts to find a user with the given email
    const existingUser = await user.findOne({
      where: {
        [Op.or]: [
          { email: email}
        ]
      }
    });
    
    //returns error and redirects if the user isn't found
    if (!existingUser){
      req.flash('error', 'User does not exist.');
      return res.redirect('/login');
    }

    //compares inputted password with the stored password if user exists
    const isValid = await bcrypt.compare(password, existingUser.password_hash);

    //returns error if it comes back false
    if (!isValid){
      req.flash('error', 'Invalid password.');
      res.redirect('/login');
    }
    
    //assigns the session and redirects to dashboard once everything is true
    else {
      req.session.user = existingUser;
      return res.redirect('/dashboard');
    }
  } catch(e){
    console.log(e);
  }
  
});

/**
 * @swagger
 * /register:
 *   get:
 *     summary: Display registration page
 *     description: Returns the registration page
 *     responses:
 *       200:
 *         description: Registration page rendered successfully
 */
router.get('/register', (req, res) => {
  res.render('register'); //on request => respond with rendering register page
});

/**
 * @swagger
 * /register:
 *   post:
 *     summary: Register new user
 *     description: Creates a new user account
 *     requestBody:
 *       required: true
 *       content:
 *         application/x-www-form-urlencoded:
 *           schema:
 *             $ref: '#/components/schemas/RegisterInput'
 *     responses:
 *       302:
 *         description: Redirects to dashboard on success or back to register on failure
 */
router.post('/register', async (req, res) => {
  // Extract user inputs
  const { username, email, password } = req.body;
  // Hash the password
  const passwordHash = await bcrypt.hash(password, 10);

  try {
    //looks for an account with the given email
    const existingUser = await user.findOne({
      where: {
        [Op.or]: [
          { email: email},
          { username: username }
        ]
      }
    });

    //returns an error if the user already exists
    if (existingUser) {
      req.flash('error', 'User with this email already exists.');
      return res.redirect('/register');
    }

    //if the user doesn't exist, this creates a new user
    const newUser = await user.create({
      username,
      email,
      password_hash: passwordHash,
      balance: 0.00
    });

    //redirects them to dashboard
    return res.redirect('/dashboard');
  } catch(error) {
    console.error(error);
  }
  req.flash('error', 'Registration failed. Please try again.');
  return res.redirect('/register');
});

/**
 * @swagger
 * /logout:
 *   get:
 *     summary: Logout user
 *     description: Destroys user session and redirects to home page
 *     security:
 *       - session: []
 *     responses:
 *       302:
 *         description: Redirects to home page after logout
 */
router.get('/logout', (req, res) => {

  //destroys session
  req.session.destroy((err) => {
  
    if (err) {
      console.error('Logout error:', err);
    }

    res.redirect('/');

  });
});

export default router
