import * as bcrypt from 'bcryptjs';
import * as jwt from 'jsonwebtoken';
import { Response, Request } from 'express';
import { Model, Document } from 'mongoose';

interface AuthUserParams {
  user: any;
  databasePassword: any;
  password: string;
  UserPasswordModel: Model<any>;
}

const authUser = async (req: Request, res: Response, { user, databasePassword, password, UserPasswordModel }: AuthUserParams) => {
  const isMatch = await bcrypt.compare(databasePassword.salt + password, databasePassword.password);

  if (!isMatch)
    return res.status(403).json({
      success: false,
      result: null,
      message: 'Invalid credentials.',
    });

  if (isMatch === true) {
    if (!process.env.JWT_SECRET) {
      return res.status(500).json({
        success: false,
        result: null,
        message: 'JWT_SECRET is not configured',
      });
    }

    const token = jwt.sign(
      {
        id: user._id,
      },
      process.env.JWT_SECRET,
      { expiresIn: (req.body as any).remember ? '8760h' : '24h' }
    );

    await UserPasswordModel.findOneAndUpdate(
      { user: user._id },
      { $push: { loggedSessions: token } },
      {
        new: true,
      }
    ).exec();

    res.status(200).json({
      success: true,
      result: {
        _id: user._id,
        name: user.name,
        surname: user.surname,
        role: user.role,
        email: user.email,
        photo: user.photo,
        token: token,
        maxAge: (req.body as any).remember ? 365 : null,
      },
      message: 'Successfully login user',
    });
    return;
  } else {
    return res.status(403).json({
      success: false,
      result: null,
      message: 'Invalid credentials.',
    });
  }
};

export default authUser;

