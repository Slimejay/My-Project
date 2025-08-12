import { IStaff } from './staff/staff.model';
declare global {
  namespace Express {
    export interface Request {
      staff?: IStaff;
    }
  }
}
