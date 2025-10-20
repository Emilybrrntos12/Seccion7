import React from "react";
import { 
  Box, 
  FormControl, 
  InputLabel, 
  Select, 
  MenuItem, 
  type SelectChangeEvent,
} from "@mui/material";
import {
  Category,
  Straighten,
  Palette,
  Texture,
  Person
} from "@mui/icons-material";

interface CatalogFiltersProps {
  categoria: string;
  setCategoria: (value: string) => void;
  talla: string;
  setTalla: (value: string) => void;
  material: string;
  setMaterial: (value: string) => void;
  suela: string;
  setSuela: (value: string) => void;
  genero: string;
  setGenero: (value: string) => void;
}

export const CatalogFilters: React.FC<CatalogFiltersProps> = ({
  categoria,
  setCategoria,
  talla,
  setTalla,
  material,
  setMaterial,
  suela,
  setSuela,
  genero,
  setGenero,
}) => {
  const handleChange = (setter: (value: string) => void) => (event: SelectChangeEvent) => {
    setter(event.target.value);
  };

  const selectStyles = {
    '& .MuiOutlinedInput-root': {
      borderRadius: 2,
      backgroundColor: '#fffdf9',
      transition: 'all 0.2s ease',
      '&:hover': {
        '& fieldset': {
          borderColor: '#8B7355',
        }
      },
      '&.Mui-focused': {
        '& fieldset': {
          borderColor: '#8B7355',
          borderWidth: 2,
        }
      }
    },
    '& .MuiInputLabel-root': {
      color: '#8B7355',
      '&.Mui-focused': {
        color: '#8B7355'
      }
    },
    '& .MuiSelect-icon': {
      color: '#8B7355'
    }
  };

  const menuItemStyles = {
    color: '#8B7355',
    '&:hover': {
      backgroundColor: 'rgba(139, 115, 85, 0.08)',
      color: '#A0522D'
    },
    '&.Mui-selected': {
      backgroundColor: 'rgba(139, 115, 85, 0.12)',
      color: '#A0522D',
      '&:hover': {
        backgroundColor: 'rgba(139, 115, 85, 0.16)'
      }
    }
  };

  return (
    <Box sx={{ mb: 4 }}>
      <Box sx={{ 
        display: 'flex', 
        flexDirection: { xs: 'column', md: 'row' },
        gap: 2,
        flexWrap: 'wrap'
      }}>
        {/* Categoría */}
        <FormControl size="small" sx={{ minWidth: 180, flex: 1 }}>
          <InputLabel sx={{ color: '#8B7355' }}>Categoría</InputLabel>
          <Select
            value={categoria}
            onChange={handleChange(setCategoria)}
            label="Categoría"
            startAdornment={<Category sx={{ color: '#8B7355', mr: 1, opacity: 0.7 }} />}
            sx={selectStyles}
          >
            <MenuItem value="" sx={menuItemStyles}>
              <em>Todas las categorías</em>
            </MenuItem>
            <MenuItem value="Mocasines" sx={menuItemStyles}>Mocasines</MenuItem>
            <MenuItem value="Tacones" sx={menuItemStyles}>Tacones</MenuItem>
            <MenuItem value="Botines" sx={menuItemStyles}>Botines</MenuItem>
            <MenuItem value="Botas" sx={menuItemStyles}>Botas</MenuItem>
            <MenuItem value="Sandalias" sx={menuItemStyles}>Sandalias</MenuItem>
          </Select>
        </FormControl>

        {/* Talla */}
        <FormControl size="small" sx={{ minWidth: 140, flex: 1 }}>
          <InputLabel sx={{ color: '#8B7355' }}>Talla</InputLabel>
          <Select
            value={talla}
            onChange={handleChange(setTalla)}
            label="Talla"
            startAdornment={<Straighten sx={{ color: '#8B7355', mr: 1, opacity: 0.7 }} />}
            sx={selectStyles}
          >
            <MenuItem value="" sx={menuItemStyles}>
              <em>Todas las tallas</em>
            </MenuItem>
            {[22, 23, 24, 25, 26, 27, 28, 29, 30].map((tallaNum) => (
              <MenuItem key={tallaNum} value={tallaNum.toString()} sx={menuItemStyles}>
                Talla {tallaNum}
              </MenuItem>
            ))}
          </Select>
        </FormControl>

        {/* Material */}
        <FormControl size="small" sx={{ minWidth: 160, flex: 1 }}>
          <InputLabel sx={{ color: '#8B7355' }}>Material</InputLabel>
          <Select
            value={material}
            onChange={handleChange(setMaterial)}
            label="Material"
            startAdornment={<Palette sx={{ color: '#8B7355', mr: 1, opacity: 0.7 }} />}
            sx={selectStyles}
          >
            <MenuItem value="" sx={menuItemStyles}>
              <em>Todos los materiales</em>
            </MenuItem>
            <MenuItem value="Cuero" sx={menuItemStyles}>Cuero</MenuItem>
            <MenuItem value="Sintético" sx={menuItemStyles}>Sintético</MenuItem>
            <MenuItem value="Polipiel" sx={menuItemStyles}>Polipiel</MenuItem>
            <MenuItem value="Charol" sx={menuItemStyles}>Charol</MenuItem>
          </Select>
        </FormControl>

        {/* Suela */}
        <FormControl size="small" sx={{ minWidth: 150, flex: 1 }}>
          <InputLabel sx={{ color: '#8B7355' }}>Suela</InputLabel>
          <Select
            value={suela}
            onChange={handleChange(setSuela)}
            label="Suela"
            startAdornment={<Texture sx={{ color: '#8B7355', mr: 1, opacity: 0.7 }} />}
            sx={selectStyles}
          >
            <MenuItem value="" sx={menuItemStyles}>
              <em>Todas las suelas</em>
            </MenuItem>
            <MenuItem value="Esponja" sx={menuItemStyles}>Esponja</MenuItem>
            <MenuItem value="Caucho" sx={menuItemStyles}>Caucho</MenuItem>
            <MenuItem value="Cuero" sx={menuItemStyles}>Cuero</MenuItem>
          </Select>
        </FormControl>

        {/* Género */}
        <FormControl size="small" sx={{ minWidth: 150, flex: 1 }}>
          <InputLabel sx={{ color: '#8B7355' }}>Género</InputLabel>
          <Select
            value={genero}
            onChange={handleChange(setGenero)}
            label="Género"
            startAdornment={<Person sx={{ color: '#8B7355', mr: 1, opacity: 0.7 }} />}
            sx={selectStyles}
          >
            <MenuItem value="" sx={menuItemStyles}>
              <em>Todos los géneros</em>
            </MenuItem>
            <MenuItem value="Caballeros" sx={menuItemStyles}>Caballeros</MenuItem>
            <MenuItem value="Damas" sx={menuItemStyles}>Damas</MenuItem>
            <MenuItem value="Niños" sx={menuItemStyles}>Niños</MenuItem>
          </Select>
        </FormControl>
      </Box>
    </Box>
  );
};