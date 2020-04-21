const User = require('../models/userModel');
const catchAsync = require('../helpers/catchAsync');
const AppError = require('../helpers/appError');
const factory = require('./factory');

const filterObj = (target, ...allowedFields) => {
  const obj = {};
  Object.keys(target).forEach((key) => {
    if (allowedFields.includes(key)) obj[key] = target[key];
  });
  return obj;
};

exports.updateMe = catchAsync(async (req, res, next) => {
  // 1) 패스워드 수정하러 들어온 사람 쫒아냄
  if (req.body.password || req.body.passwordConfirm) return next(AppError);

  // 2) 유저를 찾음 & 업데이트
  const filteredObj = filterObj(req.body, 'name', 'role');

  const updatedUser = await User.findByIdAndUpdate(
    req.user.id,
    { ...filteredObj },
    { new: true, runValidators: true }
  );

  res.status(200).json({
    status: 'success',
    data: {
      user: updatedUser,
    },
  });

  //
});

exports.deleteMe = catchAsync(async (req, res, next) => {
  // 1) 유저를 찾고
  // 2) 찾은 유저의 active 값을 false로 바꿔준다. active 이외의 필드는 제외한다.
  // const filteredObj = filterObj(req.body, 'active');
  // 그냥 지우는 행동 하나기 때문에, 별도로 값을 받지 않고, active를 false로 변경한다
  await User.findByIdAndUpdate(
    req.user.id,
    { active: false },
    {
      new: true,
      runValidators: true,
    }
  );

  res.status(200).json({
    status: 'success',
    data: null,
  });
});

exports.createUser = (req, res) => {
  res.status(500).json({
    status: 'error',
    message: 'This route is not defined! Please use /signup instead',
  });
};

exports.getUser = factory.getOne(User);
exports.getAllUsers = factory.getAll(User);

// Do NOT update passwords with this!
exports.updateUser = factory.updateOne(User);
exports.deleteUser = factory.deleteOne(User);
