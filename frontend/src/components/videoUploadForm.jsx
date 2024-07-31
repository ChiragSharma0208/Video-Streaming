import React, {  useEffect, useState } from 'react';
import { Button, Container, Grid, TextField, Typography } from '@mui/material';
import { useNavigate } from "react-router-dom";
import axios from 'axios';
import toast from "react-hot-toast";
import { AuthContext } from './authContext';


const VideoUploadForm = () => {
    const navigate =useNavigate()
    const [title, setTitle] = useState('');
    const [videoFile, setVideoFile] = useState(null);
    const [thumbnailFile, setThumbnailFile] = useState(null);
    const [uploadStatus, setUploadStatus] = useState('');
    const [userInfo, setUserInfo] = useState('');
    useEffect(() => {
        const fetchUserProfile = async () => {
            try {
                const response = await axios.get('/profile', {
                    withCredentials: true, // Send cookies with the request
                });
                setUserInfo(response.data);
            } catch (error) {
                console.error('Error fetching user profile:', error);
                // Handle error as needed
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

    const handleSubmit = async (event) => {
        event.preventDefault();

        const formData = new FormData();
        formData.append('name', userInfo.name);
        formData.append('title', title);
        formData.append('video', videoFile, `${title}-video.${videoFile.name.split('.').pop()}`);
        formData.append('thumbnail', thumbnailFile, `${title}-thumbnail.${thumbnailFile.name.split('.').pop()}`);

        try {
            const response = await axios.post('/api/upload', formData, {
                headers: {
                    'Content-Type': 'multipart/form-data'
                }
            });
            console.log(response.data);
        
            toast.promise(
                // Promise object
                new Promise((resolve, reject) => {
                    // Simulate success
                    setTimeout(() => {
                        // Resolve the promise with success message
                        resolve();
                    }, 500);
                }),
                {
                    // Loading state
                    loading: 'Uploading...',
                    // Success state
                    success: <b>Uploaded Successfully!</b>,
                    // Error state
                    error: <b>Could not save.</b>,
                }
            );
            navigate('/')

        } catch (error) {
            console.error('Error uploading files: ', error);
            setUploadStatus('Error uploading files.');
        }
    };

    return (
        <Container maxWidth="md">
            <Typography variant="h4" gutterBottom>
                Upload Video and Thumbnail
            </Typography>
            <form onSubmit={handleSubmit}>
                <Grid container spacing={2}>
                    <Grid item xs={12}>
                        <TextField
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
                        />
                    </Grid>
                    <Grid item xs={12}>
                        <input
                            type="file"
                            onChange={handleThumbnailChange}
                            accept="image/*"
                            required
                        />
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
            {uploadStatus && <Typography variant="body1">{uploadStatus}</Typography>}
        </Container>
    );
};

export default VideoUploadForm;
