import express from 'express';
import cors from 'cors';
import chalk from 'chalk';
import dotenv from 'dotenv';

import queryRoutes from './routes/queryRoutes.js';
import feedbackRoutes from './routes/feedbackRoutes.js'
import sharedReportRoutes from './routes/sharedReportRoutes.js';

const app = express();

app.use(cors());
app.use(express.json());

app.use('/api/queryRoute', queryRoutes);
app.use('/api/feedbackRoute', feedbackRoutes);
app.use('/api/sharedReportRoute', sharedReportRoutes);

app.listen(process.env.PORT, () => {
    try{
        console.log(chalk.green(`Server is running on port ${process.env.PORT}`));
    }catch(error){
        console.error(chalk.red('Failed to start server:', error.message));
    }
});