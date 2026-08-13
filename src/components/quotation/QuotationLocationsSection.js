import React, { useState, useEffect } from 'react';
import {
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  TextField,
  Typography
} from '@mui/material';
import { getLocations } from '../../services/locationService';

function QuotationLocationsSection({ items, setItems, locationId, setLocationId, readOnly = false }) {
  const [locations, setLocations] = useState([]);
  const [selectedLocation, setSelectedLocation] = useState(null);

  useEffect(() => {
    getLocations()
      .then(res => {
        const list = Array.isArray(res) ? res : Array.isArray(res?.data) ? res.data : [];
        setLocations(list);
        if (locationId) {
          const match = list.find(l => String(l.id) === String(locationId));
          if (match) setSelectedLocation(match);
        }
      })
      .catch(err => console.error('Failed to load locations', err));
  }, [locationId]);

  const handleLocationChange = (e) => {
    const locId = e.target.value;
    setLocationId(locId);
    const match = locations.find(l => String(l.id) === String(locId));
    setSelectedLocation(match);
  };

  // Group items by product to form columns
  const uniqueProducts = [];
  items.forEach(item => {
    if (item.product && !uniqueProducts.find(p => p.id === item.product.id)) {
      uniqueProducts.push(item.product);
    }
  });

  let rooms = [];
  if (selectedLocation && selectedLocation.rooms) {
    if (typeof selectedLocation.rooms === 'string') {
      try {
        rooms = JSON.parse(selectedLocation.rooms);
      } catch (e) {
        rooms = [];
      }
    } else if (Array.isArray(selectedLocation.rooms)) {
      rooms = selectedLocation.rooms;
    }
  }

  const handleQuantityChange = (product, roomName, value) => {
    const qty = Number(value) || 0;
    
    setItems(prevItems => {
      const newItems = [...prevItems];
      // Find the item for this product. If there are multiple, use the first one.
      const itemIdx = newItems.findIndex(i => i.product?.id === product.id);
      
      if (itemIdx >= 0) {
        const item = { ...newItems[itemIdx] };
        const allocations = { ...(item.room_allocations || {}) };
        
        if (qty > 0) {
          allocations[roomName] = qty;
        } else {
          delete allocations[roomName];
        }
        
        item.room_allocations = allocations;
        
        // Update the item's total quantity to be the sum of allocations
        // If there are no allocations, we leave the quantity as is (so they can edit it manually)
        const allocValues = Object.values(allocations);
        if (allocValues.length > 0) {
          item.quantity = allocValues.reduce((sum, q) => sum + q, 0);
        } else if (item.quantity === 0) {
          // just a fallback
          item.quantity = 1;
        }
        
        newItems[itemIdx] = item;
      }

      return newItems;
    });
  };

  const getQuantity = (productId, roomName) => {
    const match = items.find(i => i.product?.id === productId);
    return match?.room_allocations?.[roomName] || '';
  };

  const getTotalQuantity = (productId) => {
    const match = items.find(i => i.product?.id === productId);
    return match ? match.quantity : 0;
  };

  return (
    <div style={{ padding: '20px' }}>
      <Typography variant="h6" gutterBottom>Location</Typography>
      
      <FormControl fullWidth size="small" style={{ marginBottom: '20px', maxWidth: '300px' }}>
        <InputLabel>Select Location</InputLabel>
        <Select
          value={locationId || ''}
          label="Select Location"
          onChange={handleLocationChange}
          disabled={readOnly}
        >
          <MenuItem value=""><em>None</em></MenuItem>
          {locations.map(loc => (
            <MenuItem key={loc.id} value={loc.id}>{loc.name} {loc.code ? `(${loc.code})` : ''}</MenuItem>
          ))}
        </Select>
      </FormControl>

      {selectedLocation && rooms.length > 0 && uniqueProducts.length > 0 && (
        <TableContainer component={Paper} style={{ overflowX: 'auto' }}>
          <Table size="small" style={{ minWidth: 'max-content' }}>
            <TableHead>
              <TableRow style={{ backgroundColor: '#f5f5f5' }}>
                <TableCell style={{ fontWeight: 'bold', position: 'sticky', left: 0, backgroundColor: '#f5f5f5', zIndex: 2 }}>
                  Room / Area
                </TableCell>
                {uniqueProducts.map(p => (
                  <TableCell key={p.id} align="center" style={{ fontWeight: 'bold', minWidth: '100px' }}>
                    {p.name}
                  </TableCell>
                ))}
              </TableRow>
            </TableHead>
            <TableBody>
              {rooms.map((room, idx) => (
                <TableRow key={idx}>
                  <TableCell style={{ position: 'sticky', left: 0, backgroundColor: '#fff', zIndex: 1, fontWeight: 500 }}>
                    {room}
                  </TableCell>
                  {uniqueProducts.map(p => (
                    <TableCell key={p.id} align="center">
                      <TextField
                        type="number"
                        size="small"
                        inputProps={{ min: 0, style: { textAlign: 'center', padding: '4px' } }}
                        value={getQuantity(p.id, room)}
                        onChange={(e) => handleQuantityChange(p, room, e.target.value)}
                        disabled={readOnly}
                        style={{ width: '60px' }}
                      />
                    </TableCell>
                  ))}
                </TableRow>
              ))}
              
              <TableRow style={{ backgroundColor: '#fafafa' }}>
                <TableCell style={{ fontWeight: 'bold', position: 'sticky', left: 0, backgroundColor: '#fafafa', zIndex: 1 }}>
                  Total
                </TableCell>
                {uniqueProducts.map(p => (
                  <TableCell key={p.id} align="center" style={{ fontWeight: 'bold' }}>
                    {getTotalQuantity(p.id)}
                  </TableCell>
                ))}
              </TableRow>
            </TableBody>
          </Table>
        </TableContainer>
      )}

      {selectedLocation && rooms.length === 0 && (
        <Typography color="textSecondary">This location has no rooms configured.</Typography>
      )}
      
      {!selectedLocation && uniqueProducts.length > 0 && (
        <Typography color="textSecondary">Select a location to distribute items across rooms.</Typography>
      )}
      
      {uniqueProducts.length === 0 && (
        <Typography color="textSecondary">Add items in the Quotation Items tab first.</Typography>
      )}
    </div>
  );
}

export default QuotationLocationsSection;
