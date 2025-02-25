import React, { useState, useEffect } from 'react';
import {
  Container,
  Typography,
  Card,
  CardContent,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Button,
  CircularProgress,
  Snackbar,
  Alert,
} from '@mui/material';
import { useLongPress } from 'use-long-press';
import { Swipeable } from 'react-swipeable';
import {
  getDuas,
  addDua,
  updateDua,
  deleteDua,
} from '../services/dataService'; // Adjust path if needed

function Dua({ uid }) {
  const [duas, setDuas] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [editDua, setEditDua] = useState(null);
  const [newDuaText, setNewDuaText] = useState('');
  const [snackbarOpen, setSnackbarOpen] = useState(false);
  const [snackbarMessage, setSnackbarMessage] = useState('');
  const [snackbarSeverity, setSnackbarSeverity] = useState('success');

  useEffect(() => {
    const fetchDuas = async () => {
      try {
        const fetchedDuas = await getDuas(uid);
        setDuas(fetchedDuas);
        setLoading(false);
      } catch (err) {
        setError(err.message || 'Failed to fetch duas.');
        setLoading(false);
      }
    };
    fetchDuas();
  }, [uid]);

  const handleLongPress = (dua) => {
    setEditDua(dua);
    setEditDialogOpen(true);
  };

  const handleSwipe = async (dua) => {
    try {
      await deleteDua(dua.id);
      setDuas(duas.filter((d) => d.id !== dua.id));
      showSnackbar('Dua deleted successfully', 'success');
    } catch (err) {
      showSnackbar(err.message || 'Failed to delete dua.', 'error');
    }
  };

  const handleEditDialogClose = () => {
    setEditDialogOpen(false);
    setEditDua(null);
  };

  const handleEditSave = async () => {
    try {
      await updateDua(editDua.id, editDua.text);
      setDuas(duas.map((d) => (d.id === editDua.id ? editDua : d)));
      setEditDialogOpen(false);
      showSnackbar('Dua updated successfully', 'success');
    } catch (err) {
      showSnackbar(err.message || 'Failed to update dua.', 'error');
    }
  };

  const handleAddDua = async () => {
    try {
      await addDua(uid, newDuaText);
      const fetchedDuas = await getDuas(uid);
      setDuas(fetchedDuas);
      setNewDuaText('');
      showSnackbar('Dua added successfully', 'success');
    } catch (err) {
      showSnackbar(err.message || 'Failed to add dua.', 'error');
    }
  };

  const showSnackbar = (message, severity) => {
    setSnackbarMessage(message);
    setSnackbarSeverity(severity);
    setSnackbarOpen(true);
  };

  const handleSnackbarClose = () => {
    setSnackbarOpen(false);
  };

  if (loading) {
    return (
      <Container sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh' }}>
        <CircularProgress />
      </Container>
    );
  }

  if (error) {
    return (
      <Container sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh' }}>
        <Typography color="error">{error}</Typography>
      </Container>
    );
  }

  return (
    <Container maxWidth="sm" sx={{ mt: 4, textAlign: 'center' }}>
      <Typography variant="h5" sx={{ mb: 4 }}>
        O Allah I pray for
      </Typography>

      {duas.map((dua) => (
        <Swipeable key={dua.id} onSwiped={() => handleSwipe(dua)}>
          <Card
            sx={{ mb: 2, borderRadius: '16px', boxShadow: '0px 4px 8px rgba(0, 0, 0, 0.1)' }}
            {...useLongPress(() => handleLongPress(dua))}
          >
            <CardContent>
              <Typography variant="body1">{dua.text}</Typography>
            </CardContent>
          </Card>
        </Swipeable>
      ))}

      <TextField
        label="Add New Dua"
        variant="outlined"
        fullWidth
        value={newDuaText}
        onChange={(e) => setNewDuaText(e.target.value)}
        sx={{ mt: 2 }}
      />
      <Button variant="contained" color="primary" onClick={handleAddDua} sx={{ mt: 2 }}>
        Add Dua
      </Button>

      <Dialog open={editDialogOpen} onClose={handleEditDialogClose}>
        <DialogTitle>Edit Dua</DialogTitle>
        <DialogContent>
          <TextField
            autoFocus
            margin="dense"
            label="Dua Text"
            fullWidth
            value={editDua ? editDua.text : ''}
            onChange={(e) => setEditDua({ ...editDua, text: e.target.value })}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={handleEditDialogClose} color="primary">
            Cancel
          </Button>
          <Button onClick={handleEditSave} color="primary">
            Save
          </Button>
        </DialogActions>
      </Dialog>

      <Snackbar open={snackbarOpen} autoHideDuration={6000} onClose={handleSnackbarClose} anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}>
        <Alert onClose={handleSnackbarClose} severity={snackbarSeverity} sx={{ width: '100%' }}>
          {snackbarMessage}
        </Alert>
      </Snackbar>
    </Container>
  );
}

export default Dua;