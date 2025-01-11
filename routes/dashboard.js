import express from 'express';
import transaction from '../models/transaction.js';
import user from '../models/user.js';
// other imports maybe required based on your logic 

const router = express.Router();

/**
 * @swagger
 * components:
 *   schemas:
 *     Transaction:
 *       type: object
 *       properties:
 *         id:
 *           type: integer
 *         amount:
 *           type: number
 *           format: float
 *         type:
 *           type: string
 *           enum: [deposit, withdrawal]
 *         description:
 *           type: string
 *         user_id:
 *           type: integer
 *         timestamp:
 *           type: string
 *           format: date-time
 *     TransactionInput:
 *       type: object
 *       required:
 *         - amount
 *         - type
 *         - description
 *       properties:
 *         amount:
 *           type: number
 *           format: float
 *         type:
 *           type: string
 *           enum: [deposit, withdrawal]
 *         description:
 *           type: string
 */

// Adding Route guard 
const requireAuth = (req, res, next) => {

  //if user isn't authenticated redirect to login
  if (!req.session.user) {
  
    return res.redirect('/login');

  }
  next();
};

/**
 * @swagger
 * /dashboard:
 *   get:
 *     summary: Get dashboard
 *     description: Returns the dashboard page with recent transactions
 *     security:
 *       - session: []
 *     responses:
 *       200:
 *         description: Dashboard rendered successfully
 *       302:
 *         description: Redirect to login if not authenticated
 */
router.get('/dashboard', requireAuth, async (req, res) => {

  console.log("Runnning dashboard route");

  try {
    //finds the balance data for the user
    const balanceLog = await user.findOne({
      where: {id: req.session.user.id},
      attributes: [ 'balance' ]
    });

    //stores only the balance value
    const balanceValue = balanceLog.balance

    //finds the transactions 
    const transactionData = await transaction.findAll({
    where: { user_id: req.session.user.id }, // Ensure transactions are filtered by the logged-in user
    order: [['timestamp', 'DESC']], // Order by timestamp in descending order
    limit: 5 // Limit the number of transactions fetched
    });
    
    //render the dashboard with the balance and transaction data
    res.render('dashboard', { balanceValue, transactionData});
    
  } catch (error) {
    console.error('Error fetching transactions:', error);
    req.flash('error', 'Error loading transactions');
  }
  
});

/**
 * @swagger
 * /api/transaction:
 *   post:
 *     summary: Create new transaction
 *     description: Creates a new transaction (deposit or withdrawal)
 *     security:
 *       - session: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/TransactionInput'
 *     responses:
 *       200:
 *         description: Transaction created successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 balance:
 *                   type: number
 *                 transaction:
 *                   $ref: '#/components/schemas/Transaction'
 *       400:
 *         description: Insufficient funds or invalid input
 *       500:
 *         description: Server error
 */
router.post('/api/transaction', requireAuth, async (req, res) => { 
  //extracts the values from the inputs
  const { amount, description, type } = req.body;
  //grabs the user id from the session
  const user_id = req.session.user.id
  try {
    //finds the user's balance data
    const balance = await user.findOne({
      where: { id: user_id },
      attributes: ['balance']
    })

    //stores their current balance
    const currentBalance = parseFloat(balance.balance)
    //initializes the new balance variable
    let newBalance;

    //if the transaction is a deposit, adds the amount to the balance
    if (type === 'deposit') {
        newBalance = currentBalance + parseFloat(amount);
        //if the transaction is a withdrawal, subtracts the amount from the balance
      } else if (type === 'withdraw') {
        //checks if the user has enough funds for the withdrawal
        if (currentBalance < parseFloat(amount)) {
          req.flash('error', 'Insufficient funds');
          return res.redirect('/dashboard');
        }
        newBalance = currentBalance - parseFloat(amount);
    }
    
    //updates the user's balance in the database
    await user.update({ balance: newBalance }, { where: { id: user_id } });

    //create a new transaction for the log
    const newTransaction = await transaction.create({
      user_id: user_id,
      amount: parseFloat(amount),
      description: description,
      type: type
    });

    //updates the dashboard
    res.redirect('/dashboard');
    
  } catch (error) {
    console.error('Error processing transaction:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

/**
 * @swagger
 * /transactions:
 *   get:
 *     summary: Get all transactions
 *     description: Retrieves all transactions for the authenticated user
 *     security:
 *       - session: []
 *     responses:
 *       200:
 *         description: Transactions page rendered successfully
 *       302:
 *         description: Redirect to login if not authenticated
 */
router.get('/transactions', requireAuth, async (req, res) => {
  
  try {
    //gets the user's transactions from the database
    const transactionData = await transaction.findAll({
    where: { user_id: req.session.user.id }, // Ensure transactions are filtered by the logged-in user
    order: [['timestamp', 'DESC']], // Order by timestamp in descending order
    limit: 5 // Limit the number of transactions fetched
    });
    
    return res.render('transactions', { transactionData }); 
    
  } catch (error) {
    console.error('Error fetching transactions:', error);
    req.flash('error', 'Error loading transactions');
  }
});



export default router;