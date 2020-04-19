const mongoose = require('mongoose');
const validator = require('validator').default;
const bcrypt = require('bcryptjs');

// name, email, photo, password, passwordConfirm
const userSchema = mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Please tell us your name'],
  },
  email: {
    type: String,
    required: [true, 'Please provide your email'],
    unique: true,
    lowercase: true,
    validate: [validator.isEmail, 'Please provice a valid email'],
  },
  photo: {
    type: String,
  },
  password: {
    type: String,
    required: [true, 'Please provide a password'],
    minLength: 8,
    select: false, // select 할 때 패스워드 감추기
  },
  passwordConfirm: {
    type: String,
    required: [true, 'Please confirm your password'],
    validate: {
      validator: function (el) {
        return el === this.password;
      },
      message: 'Passwords are not the same!',
    },
  },
  passwordChangedAt: Date,
});

userSchema.pre('save', async function (next) {
  if (!this.isModified('password')) return next();

  // 12: 높을수록 보안에는 좋지만 CPU사용에 부담을 줄 수 있다.
  this.password = await bcrypt.hash(this.password, 12);

  // 저장하기 전에 비교할 때 필요하지, 더이상 필요하지 않다.
  this.passwordConfirm = undefined;
  next();
});

userSchema.methods.correctPassword = async function (candidatePassword) {
  return await bcrypt.compare(candidatePassword, this.password);
};

userSchema.methods.changedPasswordAfter = function (JWTTimestamp) {
  if (this.passwordChangedAt) {
    const changedTimestamp = this.passwordChangedAt.getTime() / 1000;
    return JWTTimestamp < changedTimestamp;
  }

  // This mean password not changed
  return false;
};

const User = mongoose.model('User', userSchema);

module.exports = User;
