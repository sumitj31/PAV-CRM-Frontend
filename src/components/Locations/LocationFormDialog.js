import React, { useEffect, useState } from 'react';
import {
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Grid,
  IconButton,
  TextField,
  Typography,
} from '@mui/material';

import CloseIcon from '@mui/icons-material/Close';

import {
  createLocation,
  updateLocation,
} from '../../services/locationService';

const blankLocation = {
  name: '',
  code: '',
  address: '',
  city: '',
  state: '',
  country: 'India',
  pincode: '',
  is_active: true,
};

function LocationFormDialog({
  open,
  onClose,
  location = null,
  onSaved,
}) {
  const [form, setForm] = useState(blankLocation);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (!open) return;

    setForm(
      location
        ? {
            ...blankLocation,
            ...location,
          }
        : {
            ...blankLocation,
          }
    );
  }, [open, location]);

  const setField = (key, value) => {
    setForm((prev) => ({
      ...prev,
      [key]: value,
    }));
  };

  const handleSubmit = async () => {
    if (!form.name.trim()) {
      alert('Location name is required');
      return;
    }

    if (!form.code.trim()) {
      alert('Location code is required');
      return;
    }

    setSaving(true);

    try {
      if (location?.id) {
        await updateLocation(
          location.id,
          form
        );
      } else {
        await createLocation(form);
      }

      await onSaved?.();
      onClose?.();
    } catch (error) {
      console.error(
        'Failed to save location:',
        error
      );

      alert(
        error?.response?.data?.error ||
          'Failed to save location'
      );
    } finally {
      setSaving(false);
    }
  };

  return (
    <Dialog
      className="flowbite-dialog"
      open={open}
      onClose={onClose}
      maxWidth="md"
      fullWidth
    >
      <DialogTitle className="dialog-title">
        {location?.id
          ? 'Edit Location'
          : 'Add Location'}

        <IconButton
          onClick={onClose}
          size="small"
        >
          <CloseIcon />
        </IconButton>
      </DialogTitle>

      <DialogContent className="dialog-content">
        <Grid
          container
          spacing={2}
          sx={{ mt: 0.5 }}
        >
          <Grid item xs={12} md={6}>
            <Typography className="field-label">
              Location Name
            </Typography>

            <TextField
              className="form-input"
              fullWidth
              value={form.name}
              onChange={(e) =>
                setField(
                  'name',
                  e.target.value
                )
              }
              placeholder="e.g. Ahmedabad Office"
            />
          </Grid>

          <Grid item xs={12} md={6}>
            <Typography className="field-label">
              Location Code
            </Typography>

            <TextField
              className="form-input"
              fullWidth
              value={form.code}
              onChange={(e) =>
                setField(
                  'code',
                  e.target.value.toUpperCase()
                )
              }
              placeholder="e.g. AMD"
            />
          </Grid>

          <Grid item xs={12}>
            <Typography className="field-label">
              Address
            </Typography>

            <TextField
              className="form-input"
              fullWidth
              multiline
              minRows={2}
              value={form.address}
              onChange={(e) =>
                setField(
                  'address',
                  e.target.value
                )
              }
              placeholder="Enter complete address"
            />
          </Grid>

          <Grid item xs={12} md={6}>
            <Typography className="field-label">
              City
            </Typography>

            <TextField
              className="form-input"
              fullWidth
              value={form.city}
              onChange={(e) =>
                setField(
                  'city',
                  e.target.value
                )
              }
            />
          </Grid>

          <Grid item xs={12} md={6}>
            <Typography className="field-label">
              State
            </Typography>

            <TextField
              className="form-input"
              fullWidth
              value={form.state}
              onChange={(e) =>
                setField(
                  'state',
                  e.target.value
                )
              }
            />
          </Grid>

          <Grid item xs={12} md={6}>
            <Typography className="field-label">
              Country
            </Typography>

            <TextField
              className="form-input"
              fullWidth
              value={form.country}
              onChange={(e) =>
                setField(
                  'country',
                  e.target.value
                )
              }
            />
          </Grid>

          <Grid item xs={12} md={6}>
            <Typography className="field-label">
              Pincode
            </Typography>

            <TextField
              className="form-input"
              fullWidth
              value={form.pincode}
              onChange={(e) =>
                setField(
                  'pincode',
                  e.target.value
                )
              }
            />
          </Grid>

          <Grid item xs={12} md={6}>
            <Typography className="field-label">
              Status
            </Typography>

            <TextField
              className="form-input"
              select
              SelectProps={{
                native: true,
              }}
              fullWidth
              value={
                form.is_active
                  ? 'active'
                  : 'inactive'
              }
              onChange={(e) =>
                setField(
                  'is_active',
                  e.target.value ===
                    'active'
                )
              }
            >
              <option value="active">
                Active
              </option>

              <option value="inactive">
                Inactive
              </option>
            </TextField>
          </Grid>
        </Grid>
      </DialogContent>

      <DialogActions className="dialog-actions">
        <button
          className="cancel-btn"
          onClick={onClose}
        >
          Cancel
        </button>

        <button
          className="save-btn-x"
          disabled={saving}
          onClick={handleSubmit}
        >
          {saving
            ? 'Saving...'
            : location?.id
              ? 'Update Location'
              : 'Save Location'}
        </button>
      </DialogActions>
    </Dialog>
  );
}

export default LocationFormDialog;