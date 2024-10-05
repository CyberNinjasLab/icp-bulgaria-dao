import React, { useContext } from 'react';
import Dialog from '@mui/material/Dialog';
import DialogTitle from '@mui/material/DialogTitle';
import DialogContent from '@mui/material/DialogContent';
import Button from '@mui/material/Button';
import CloseIcon from '@mui/icons-material/Close';
import { useAuth } from '../../../contexts/AuthContext';

const LoginModal = ({ open, onClose }) => {
    const { login } = useAuth();
    
    // Handle login action
    const handleLogin = () => {
        login();
    };
    
    return (
        <Dialog open={open} onClose={onClose}>
            <DialogTitle style={{
                padding: "30px 50px 20px 50px",
                minWidth: "300px"
            }}>
                <span className='h1 text-center block'>Вход</span>
                <Button onClick={onClose} color='black' style={{ position: 'absolute', right: 6, top: 6, minWidth: 30, minHeight: 24 }}>
                    <CloseIcon />
                </Button>
            </DialogTitle>
            <DialogContent style={{
                paddingBottom: 30
            }}>
                <Button variant="contained" color='primary' onClick={handleLogin} className='w-full' style={{
                    padding: '10px',
                }}>
                    <img src="/icp-logo.svg" className='w-6 mr-2' /> Internet Identity
                </Button>
            </DialogContent>
        </Dialog>
    );
};

export default LoginModal;
