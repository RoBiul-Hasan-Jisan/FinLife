const { auth } = require('../config/firebase');
const User = require('../models/User');


const authenticate = async (req, res, next) => {

  try {

    const authHeader = req.headers.authorization;


    if (!authHeader?.startsWith('Bearer ')) {
      return res.status(401).json({
        error: 'No token provided'
      });
    }


    const token = authHeader.split('Bearer ')[1];


    const decoded = await auth.verifyIdToken(token);


    let user = await User.findOne({
      firebaseUid: decoded.uid
    });


    if (!user) {

      user = await User.create({
        firebaseUid: decoded.uid,
        email: decoded.email,
        name:
          decoded.name ||
          decoded.email?.split('@')[0] ||
          'User',
        photoURL: decoded.picture || '',
      });

    }


    req.user = user;
    req.firebaseUser = decoded;


    next();


  } catch (err) {

    console.error("Auth error:", err.message);

    res.status(401).json({
      error: "Invalid or expired token"
    });

  }

};


module.exports = authenticate;