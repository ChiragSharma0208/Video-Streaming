import React, { useEffect, useState } from 'react';
import { Button, Container, Grid, TextField, Typography, Chip, Box } from '@mui/material';
import { useNavigate } from "react-router-dom";
import axios from 'axios';
import toast from "react-hot-toast";
import { useDarkMode } from './DarkModeContext';
import { styled } from '@mui/material/styles';

const StyledContainer = styled(Container)(({ darkMode }) => ({
    paddingTop: '65px',
    paddingLeft: '20px', // Add left padding
    paddingRight: '20px', // Add right padding
    minHeight: '100vh',
    minWidth: '100%',
    backgroundColor: darkMode ? '#121212' : '#fff',
    color: darkMode ? '#e0e0e0' : '#333',
}));

const StyledTextField = styled(TextField)(({ darkMode }) => ({
    backgroundColor: darkMode ? '#333' : '#fff',
    '& .MuiInputLabel-root': {
        color: darkMode ? '#e0e0e0' : '#333',
    },
    '& .MuiInputBase-input': {
        color: darkMode ? '#e0e0e0' : '#333',
    },
}));

const StyledButton = styled(Button)(({ darkMode }) => ({
    marginTop: '20px',
    backgroundColor: darkMode ? '#1e88e5' : '#007bff',
    color: '#fff',
    '&:hover': {
        backgroundColor: darkMode ? '#1565c0' : '#0056b3',
    },
}));

const StyledChip = styled(Chip)(({ darkMode }) => ({
    marginTop: '10px',
    backgroundColor: darkMode ? '#333' : '#f0f0f0',
    color: darkMode ? '#e0e0e0' : '#333',
}));

const StyledUploadStatus = styled(Typography)(({ darkMode }) => ({
    color: darkMode ? '#e0e0e0' : '#333',
}));

const VideoUploadForm = () => {
    const navigate = useNavigate();
    const [title, setTitle] = useState('');
    const [videoFile, setVideoFile] = useState(null);
    const [thumbnailFile, setThumbnailFile] = useState(null);
    const [uploadStatus, setUploadStatus] = useState('');
    const [userInfo, setUserInfo] = useState('');
    const [tags, setTags] = useState([]);
    const [tagInput, setTagInput] = useState('');
    const { darkMode } = useDarkMode();

    useEffect(() => {
        const fetchUserProfile = async () => {
            try {
                const response = await axios.get('/profile', {
                    withCredentials: true,
                });
                setUserInfo(response.data);
            } catch (error) {
                console.error('Error fetching user profile:', error);
            }
        };

        fetchUserProfile();
    }, []);

    const handleTitleChange = (event) => {
        setTitle(event.target.value);
    };

    const handleVideoChange = (event) => {
        setVideoFile(event.target.files[0]);
    };

    const handleThumbnailChange = (event) => {
        setThumbnailFile(event.target.files[0]);
    };

    const handleTagInputChange = (event) => {
        setTagInput(event.target.value);
    };

    const handleAddTag = () => {
        if (tagInput.trim() !== '' && !tags.includes(tagInput.trim())) {
            setTags([...tags, tagInput.trim()]);
            setTagInput('');
        }
    };

    const handleDeleteTag = (tagToDelete) => {
        setTags((tags) => tags.filter((tag) => tag !== tagToDelete));
    };

    const handleSubmit = async (event) => {
        event.preventDefault();

        const formData = new FormData();
        formData.append('name', userInfo.name);
        formData.append('title', title);
        formData.append('video', videoFile, `${title}-video.${videoFile.name.split('.').pop()}`);
        formData.append('thumbnail', thumbnailFile, `${title}-thumbnail.${thumbnailFile.name.split('.').pop()}`);
        formData.append('tags', JSON.stringify(tags));

        try {
            const response = await axios.post('/api/upload', formData, {
                headers: {
                    'Content-Type': 'multipart/form-data'
                }
            });
            console.log(response.data);

            toast.promise(
                new Promise((resolve, reject) => {
                    setTimeout(() => {
                        resolve();
                    }, 500);
                }),
                {
                    loading: 'Uploading...',
                    success: <b>Uploaded Successfully!</b>,
                    error: <b>Could not save.</b>,
                }
            );
            navigate('/');

        } catch (error) {
            console.error('Error uploading files: ', error);
            setUploadStatus('Error uploading files.');
        }
    };

    return (
        <StyledContainer maxWidth="md" darkMode={darkMode}>
            <Typography variant="h4" gutterBottom>
                Upload Video and Thumbnail
            </Typography>
            <form onSubmit={handleSubmit}>
                <Grid container spacing={2}>
                    <Grid item xs={12}>
                        <StyledTextField
                            label="Title"
                            variant="outlined"
                            fullWidth
                            value={title}
                            onChange={handleTitleChange}
                            required
                        />
                    </Grid>
                    <Grid item xs={12}>
                        <input
                            type="file"
                            onChange={handleVideoChange}
                            accept="video/*"
                            required
                            style={{ backgroundColor: darkMode ? '#333' : '#fff' }}
                        />
                    </Grid>
                    <Grid item xs={12}>
                        <input
                            type="file"
                            onChange={handleThumbnailChange}
                            accept="image/*"
                            required
                            style={{ backgroundColor: darkMode ? '#333' : '#fff' }}
                        />
                    </Grid>
                    <Grid item xs={12}>
                        <StyledTextField
                            label="Add a tag"
                            variant="outlined"
                            fullWidth
                            value={tagInput}
                            onChange={handleTagInputChange}
                        />
                        <StyledButton variant="contained" color="primary" onClick={handleAddTag}>
                            Add Tag
                        </StyledButton>
                    </Grid>
                    <Grid item xs={12}>
                        <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1, mt: 2 }}>
                            {tags.map((tag, index) => (
                                <StyledChip
                                    key={index}
                                    label={tag}
                                    onDelete={() => handleDeleteTag(tag)}
                                    color="primary"
                                />
                            ))}
                        </Box>
                    </Grid>
                    <Grid item xs={12}>
                        <Button
                            type="submit"
                            variant="contained"
                            color="primary"
                        >
                            Upload
                        </Button>
                    </Grid>
                </Grid>
            </form>
            {uploadStatus && <StyledUploadStatus variant="body1">{uploadStatus}</StyledUploadStatus>}
        </StyledContainer>
    );
};

export default VideoUploadForm;
