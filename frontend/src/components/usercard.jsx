// UserCard.js
import React from 'react';
import { Avatar, Box, Typography } from '@mui/material';

const UserCard = ({ username, userImage }) => {
  return (
    <Box display="flex" alignItems="center">
      {userImage && <Avatar src={userImage} alt="User Avatar" />}
      <Typography variant="body1" sx={{ marginLeft: 1 }}>
        {username}
      </Typography>
    </Box>
  );
};

export default UserCard;
