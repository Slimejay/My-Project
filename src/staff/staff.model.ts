import mongoose, {Document} from "mongoose"; 

// Staff Schema and Interface
interface IStaffProps {
  firstname: string;
  lastname: string;
  email: string;
  team: string;
  profileImages?: string[];
  password: string;
}

interface IStaff extends Document, IStaffProps {
  isActive?: boolean;
  lastLogin?: Date;
  role: 'admin' | 'user';

}

const staffSchema = new mongoose.Schema({
  firstname: {
    type: String,
    required: [true, 'First name is required']
  },
  lastname: {
    type: String,
    required: [true, 'Last name is required']
  },
  email: {
    type: String,
    required: [true, 'Email is required'],
    unique: true,
    lowercase: true,
    trim: true,
    match: [/^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/, 'Please provide a valid email']
  },
  team: {
    type: String,
    required: [true, 'Team is required']
  },
  profileImages: {
    type: [String],
    default: []
  },
  password: {
    type: String,
    required: [true, 'Password is required'],
    minlength: 8,
    select: false // Don't return password by default in queries
  },
  role: {
    type: String,
    enum: ['admin', 'user'],
    default: 'user'
  },
  isActive: {
    type: Boolean,
    default: true
  },
  lastLogin: {
    type: Date,
    default: null
  }
}, {
  timestamps: true
});

// Password hash middleware
import bcrypt from 'bcryptjs';

staffSchema.pre('save', async function(next) {
  // Only hash the password if it's modified or new
  if (!this.isModified('password')) return next();
  
  try {
    const salt = await bcrypt.genSalt(10);
    this.password = await bcrypt.hash(this.password, salt);
    next();
  } catch (error: any) {
    next(error);
  }
});

// Method to compare password
staffSchema.methods.comparePassword = async function(candidatePassword: string): Promise<boolean> {
  return bcrypt.compare(candidatePassword, this.password);
};

// Virtual for full name
staffSchema.virtual('fullName').get(function() {
  return `${this.firstname} ${this.lastname}`;
});

const Staff = mongoose.model<IStaff>('Staff', staffSchema);

// Token Schema and Interface for password reset and authentication
interface ITokenProps {
  staff: mongoose.Types.ObjectId;
  token: string;
  purpose: 'auth' | 'reset';
  expiresAt: Date;
  isUsed: boolean;
}

interface IToken extends Document, ITokenProps {}

const tokenSchema = new mongoose.Schema({
  staff: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Staff',
    required: true
  },
  token: {
    type: String,
    required: true
  },
  purpose: {
    type: String,
    enum: ['auth', 'reset'],
    required: true
  },
  expiresAt: {
    type: Date,
    required: true,
    default: function() {
      // Default: 24 hours from now
      const now = new Date();
      return new Date(now.getTime() + 24 * 60 * 60 * 1000);
    }
  },
  isUsed: {
    type: Boolean,
    default: false
  }
}, {
  timestamps: true
});

// Index for faster queries and automatic cleanup
tokenSchema.index({ expiresAt: 1 }, { expireAfterSeconds: 0 });

const Token = mongoose.model<IToken>('Token', tokenSchema);

export { Staff, Token, IStaff, IToken, IStaffProps, ITokenProps };