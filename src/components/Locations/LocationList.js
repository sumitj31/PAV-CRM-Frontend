import React, { useEffect, useMemo, useState } from "react";
import { Chip } from "@mui/material";

import LocationFormDialog from "./LocationFormDialog";
import { getLocations, updateLocation } from "../../services/locationService";

import "../../assets/styles/LeadsTable.scss";

function Locations() {
  const [locations, setLocations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");

  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingLocation, setEditingLocation] = useState(null);

  const loadLocations = async () => {
    setLoading(true);

    try {
      const data = await getLocations({
        includeInactive: true,
      });

      setLocations(Array.isArray(data) ? data : []);
    } catch (error) {
      console.error("Failed to load locations:", error);
      setLocations([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadLocations();
  }, []);

  const filteredLocations = useMemo(() => {
    const query = search.trim().toLowerCase();

    if (!query) {
      return locations;
    }

    return locations.filter((location) =>
      [
        location.name,
        location.code,
        location.city,
        location.state,
        location.country,
        location.pincode,
      ].some((value) =>
        String(value || "")
          .toLowerCase()
          .includes(query),
      ),
    );
  }, [locations, search]);

  const openCreate = () => {
    setEditingLocation(null);
    setDialogOpen(true);
  };

  const openEdit = (location) => {
    setEditingLocation(location);
    setDialogOpen(true);
  };

  const handleStatusToggle = async (location) => {
    try {
      await updateLocation(location.id, {
        ...location,
        is_active: !Boolean(location.is_active),
      });

      await loadLocations();
    } catch (error) {
      console.error("Failed to update location status:", error);

      alert(error?.response?.data?.error || "Failed to update location status");
    }
  };

  return (
    <div className="leads-table-container locations-page">
      {/* HEADER */}
      <div className="table-container module-card">
        <div className="module-header compact">
          <div>
            <h2>Locations</h2>
            <p>Manage business locations used across the ERP.</p>
          </div>

          <button className="primary-btn" onClick={openCreate}>
            Add Location
          </button>
        </div>

        {/* SEARCH */}
        <div className="module-toolbar">
          <div className="search-input">
            <input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search location, city, state or code"
            />
          </div>
        </div>
      </div>

      {/* TABLE */}
      <div className="table-container">
        <table className="leads-table">
          <thead>
            <tr>
              <th>Name</th>
              <th>Code</th>
              <th>City</th>
              <th>State</th>
              <th>Country</th>
              <th>Pincode</th>
              <th>Status</th>
              <th>Actions</th>
            </tr>
          </thead>

          <tbody>
            {loading ? (
              <tr>
                <td colSpan={8} className="table-empty-message">
                  Loading locations...
                </td>
              </tr>
            ) : filteredLocations.length ? (
              filteredLocations.map((location) => (
                <tr key={location.id}>
                  <td>{location.name || "—"}</td>

                  <td>{location.code || "—"}</td>

                  <td>{location.city || "—"}</td>

                  <td>{location.state || "—"}</td>

                  <td>{location.country || "—"}</td>

                  <td>{location.pincode || "—"}</td>

                  <td>
                    <Chip
                      size="small"
                      label={location.is_active ? "Active" : "Inactive"}
                      color={location.is_active ? "success" : "default"}
                    />
                  </td>

                  <td>
                    <div className="row-actions">
                      <button
                        className="secondary-btn"
                        onClick={() => openEdit(location)}
                      >
                        Edit
                      </button>

                      <button
                        className="secondary-btn"
                        onClick={() => handleStatusToggle(location)}
                      >
                        {location.is_active ? "Make Inactive" : "Make Active"}
                      </button>
                    </div>
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan={8} className="table-empty-message">
                  No locations found
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* ADD / EDIT */}
      <LocationFormDialog
        open={dialogOpen}
        location={editingLocation}
        onClose={() => setDialogOpen(false)}
        onSaved={loadLocations}
      />
    </div>
  );
}

export default Locations;
