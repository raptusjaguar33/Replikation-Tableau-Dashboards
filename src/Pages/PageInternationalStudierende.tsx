import React, { useState } from 'react';
import Layout from '../components/Layout.tsx';
import Box from '@mui/material/Box';
import Grid from '@mui/material/Grid2';
import { MenuItem, Select, FormControl, InputLabel, Checkbox } from '@mui/material';
import Item from '../components/Item.tsx';


import Top10Welt from '../Module/Charts/InternationalStudierendeTop10Welt.tsx'
import Top10Nationaliteaten from '../Module/Charts/InternationalStudierendeTop10Nationaliteaten.tsx'

const options = ["Trier", "Birkenfeld", "Idar-Oberstein"];

export default function () {
  const [selected, setSelected] = React.useState(options);

  const handleChange = (event: { target: { value: any; }; }) => {
    let value = event.target.value;
    if (!Array.isArray(value)) {
      value = [value]; // Sicherstellen, dass es ein Array ist
    }

    if (value.includes("Alle")) {
      setSelected(options);
    } else {
      setSelected(value);
    }
  };

  const isAll = (selected: string | string[]) => {
    return selected.includes("Birkenfeld") && selected.includes("Idar-Oberstein") && selected.includes("Trier");
  };

  return (
    <Layout children={
      <Box sx={{ width: '100%', maxWidth: { sm: '100%', md: '1700px' } }}>
        <Grid
          container
          spacing={2}
          columns={12}
          sx={{ mb: (theme) => theme.spacing(2) }}
        >
          <Grid size={{ xs: 12, md: 12 }}>
            <Grid container spacing={2} columns={12} sx={{ mb: (theme) => theme.spacing(2) }} >
              <Grid size={{ xs: 12, md: 10 }}>
                <Item>
                  <Top10Nationaliteaten selectedLocations={selected} />
                </Item>
              </Grid>
              <Grid size={{ xs: 12, md: 2 }}>
                <Item>

                  <FormControl fullWidth>
                    <InputLabel>Filter</InputLabel>
                    <Select
                      multiple
                      value={selected}
                      onChange={handleChange}
                      renderValue={(selected) =>
                        isAll(selected) ? "(Alle)" : selected.join(", ")
                      }
                    >
                      <MenuItem value="Alle">
                        <Checkbox checked={isAll(selected)} />
                        Alle
                      </MenuItem>
                      {options.map((option) => (
                        <MenuItem key={option} value={option}>
                          <Checkbox checked={selected.includes(option)} />
                          {option}
                        </MenuItem>
                      ))}
                    </Select>
                  </FormControl>

                </Item>
              </Grid>
            </Grid>
          </Grid>
          <Grid size={{ xs: 12, md: 12 }}>
            <Item>
              <Top10Welt selectedLocations={selected} />
            </Item>
          </Grid>
        </Grid>
      </Box>
    } />
  );
}