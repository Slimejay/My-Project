import express, {Request, Response} from 'express';
import bodyParser from 'body-parser';
import cookieParser from 'cookie-parser';
import compression from 'compression';
import cors from 'cors';
import mongoose from 'mongoose';
import dotenv from 'dotenv';
dotenv.config();


import staffRoutes from '../src/staff/staff.router'

const app = express();

app.use(cors());
app.use(compression());
app.use(cookieParser());
app.use(bodyParser.json());
// app.use(formData.parse());
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ limit: '10mb', extended: true }));


app.use('/api/staff', staffRoutes)

const port = process.env.PORT || 8080;

async function connect() {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log("connected to mongo DB");
  } catch (error) {
    console.log(error);
  }
}

connect();

app.get('/', (req: Request, res: Response) => {
    res.send('Hello from Express + TypeScript!');
  });
  
  app.listen(port, () => {
    console.log(`Server running on port ${port}`);
  });