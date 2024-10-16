const User = require('../models/User');

exports.signupUser = async (req, res) => {
  const { username, email, password } = req.body;
  try {
      const existingUser = await User.findOne({ email });
      if (existingUser) {
          return res.status(400).json({ message: 'User already exists' });
      }

      const newUser = new User({ username, email, password });
      await newUser.save();

      // Add the new user to the group chat
      await addUserstoGroupchat(newUser._id);

      res.status(201).json({ message: 'User is registered successfully!', user: newUser });
  } catch (err) {
      res.status(500).json({ message: 'Server error', error: err.message });
  }
};

exports.checkEmail= async (req,res)=>{
  const {email} = req.body;
  const user = await User.findOne({email});

  if (!email) {
    return res.status(400).json({ message: 'No email provided' });
  }

  if (user){
    console.log("Email available");

    return res.status(400).json({message:'Email already exist'})
  }
  res.status(200).json({message: 'Email available'});
}

exports.login = async (req, res) => {
    const { email, password } = req.body;
    try {
      let user = await User.findOne({ email });
      if (!user) {
        return res.status(404).json({ message: 'User not found' });
      }
  
      // Validate password (if hashed, use bcrypt.compare)
      if (user.password !== password) {
        return res.status(401).json({ message: 'Incorrect password' });
      }
  
      res.status(200).json({
        message: 'Login successful',
        userId: user._id,
        email: user.email,
        username: user.username,
        profilePicture: user.profilePicture
    });
    } catch (err) {
      console.log("Error: " + err);
      res.status(400).json({ message: err.message });
    }
  };

  exports.getUserProfile = async (req, res) => {
    const { userId } = req.body;
    try {
      const user = await User.findById(userId).select('-password');
      if (!user) {
        return res.status(404).json({ message: 'User not found' });
      }
      res.status(200).json({
        email: user.email,
        username: user.username,
        profilePicture: user.profilePicture,
      });
    } catch (err) {
      res.status(500).json({ message: 'Server error', error: err.message });
    }
  };
  


  exports.updateUserProfile = async (req, res) => {
    const { userId } = req.params;
    const { username, email, profilePicture } = req.body;

    try {
        const user = await User.findById(userId);
        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }

        user.username = username || user.username;
        user.email = email || user.email;
        if (profilePicture) {
            user.profilePicture = profilePicture;
        }
        await user.save();

        // Update the user's profile in the group chat participants
        await updateGroupChatParticipants(user);

        res.status(200).json({ message: 'Profile updated successfully', user });
    } catch (err) {
        res.status(500).json({ message: 'Server error', error: err.message });
    }
};


  //   const updateProfilePicture = async (req, res) => {
  //     try {
  //         const userId = req.params.userId;
  //         const user = await User.findById(userId);
  
  //         if (!user) {
  //             return res.status(404).json({ message: 'User not found' });
  //         }
  
  //         // if (req.file) {
  //         //     user.profilePicture = req.file.path; // Assuming you're storing the file path
  //         // }
  
  //         await user.save();
  //         res.status(200).json({ profilePicture: user.profilePicture });
  //     } catch (error) {
  //         res.status(500).json({ message: 'Failed to update profile picture', error });
  //     }
  // };

  exports.updateUserProfile = async (req, res) => {
    const { userId } = req.params;  // Extract the userId from the route parameter
    const { username, email, profilePicture } = req.body;  // Extract the data from the request body

    try {
        const user = await User.findById(userId);
        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }

        user.username = username || user.username;
        user.email = email || user.email;
        if (profilePicture) {
            user.profilePicture = profilePicture; // Update the profile picture
        }

        await user.save();

        res.status(200).json({ message: 'Profile updated successfully', user });
    } catch (err) {
        console.error('Error: ', err);
        res.status(500).json({ message: 'Server error', error: err.message });
    }
};



  
