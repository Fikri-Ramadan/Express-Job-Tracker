import { StatusCodes } from 'http-status-codes';

import User from '../models/User.model.js';
import { hashPassword, isPasswordEquals } from '../utils/passwordUtils.js';
import { UnauthenticatedError } from '../errors/customErrors.js';
import { createJWT } from '../utils/tokenUtils.js';

export const register = async (req, res) => {
  req.body.role = 'user';

  req.body.password = await hashPassword(req.body.password);
  const user = await User.create(req.body);

  res.status(StatusCodes.CREATED).json({ message: 'user created', user });
};

export const login = async (req, res) => {
  const { email, password } = req.body;

  const user = await User.findOne({ email: email });
  const isValidUser = user && (await isPasswordEquals(password, user.password));
  if (!isValidUser) throw new UnauthenticatedError('invalid credentials');

  const token = createJWT({ userId: user._id, role: user.role });

  const oneDay = 1000 * 60 * 60 * 24;

  res
    .status(StatusCodes.OK)
    .cookie('token', token, {
      httpOnly: true,
      expires: new Date(Date.now() + oneDay),
      sameSite: 'none',
      secure: true,
    })
    .json({ message: 'user logged in' });
};

export const logout = (req, res) => {
  res
    .status(StatusCodes.OK)
    .cookie('token', 'logout', {
      httpOnly: true,
      expires: new Date(Date.now()),
      sameSite: 'none',
      secure: true,
    })
    .json({ message: 'user logged out' });
};
