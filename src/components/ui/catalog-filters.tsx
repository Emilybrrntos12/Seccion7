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
      backgroundColor: 'transparent',
      border: '2px solid #ffffff', // Línea blanca sólida
      transition: 'all 0.2s ease',
      '&:hover': {
        backgroundColor: 'rgba(255, 255, 255, 0.1)',
        borderColor: '#ffffff', // Mantener blanco en hover
        '& fieldset': {
          borderColor: '#ffffff',
        }
      },
      '&.Mui-focused': {
        backgroundColor: 'rgba(255, 255, 255, 0.15)',
        borderColor: '#ffffff', // Mantener blanco al enfocar
        '& fieldset': {
          borderColor: '#ffffff',
          borderWidth: 2,
        }
      },
      '& fieldset': {
        border: 'none', // Eliminar el borde por defecto de MUI
      }
    },
    '& .MuiInputLabel-root': {
      color: '#ffffff',
      fontWeight: 600,
      textShadow: '0 1px 2px rgba(0, 0, 0, 0.3)',
      '&.Mui-focused': {
        color: '#ffffff'
      }
    },
    '& .MuiSelect-icon': {
      color: '#ffffff'
    },
    '& .MuiOutlinedInput-input': {
      color: '#ffffff',
      textShadow: '0 1px 2px rgba(0, 0, 0, 0.3)',
    }
  };

  const menuItemStyles = {
    color: '#8B7355',
    backgroundColor: '#ffffff',
    '&:hover': {
      backgroundColor: 'rgba(139, 115, 85, 0.1)',
      color: '#A0522D'
    },
    '&.Mui-selected': {
      backgroundColor: 'rgba(139, 115, 85, 0.15)',
      color: '#A0522D',
      '&:hover': {
        backgroundColor: 'rgba(139, 115, 85, 0.2)'
      }
    }
  };

  return (
    <Box sx={{ mb: 4 }}>
      <Box sx={{
        display: 'flex',
        flexDirection: { xs: 'column', md: 'row' },
        gap: 2,
        flexWrap: 'wrap',
        alignItems: 'center',
        minHeight: 64,
        py: 1,
      }}>
        {/* Categoría */}
        <FormControl size="small" sx={{ minWidth: 180, flex: 1 }}>
          <InputLabel sx={{ color: '#ffffff', fontWeight: 600, textShadow: '0 1px 2px rgba(0, 0, 0, 0.3)' }}>Categoría</InputLabel>
          <Select
            value={categoria}
            onChange={handleChange(setCategoria)}
            label="Categoría"
            startAdornment={<Category sx={{ color: '#ffffff', mr: 1, opacity: 0.9, filter: 'drop-shadow(0 1px 1px rgba(0,0,0,0.3))' }} />}
            sx={selectStyles}
            MenuProps={{
              PaperProps: {
                sx: {
                  backgroundColor: '#fffdf9',
                  border: '1px solid #e8dcc8',
                  borderRadius: 2,
                  mt: 1,
                }
              }
            }}
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
          <InputLabel sx={{ color: '#ffffff', fontWeight: 600, textShadow: '0 1px 2px rgba(0, 0, 0, 0.3)' }}>Talla</InputLabel>
          <Select
            value={talla}
            onChange={handleChange(setTalla)}
            label="Talla"
            startAdornment={<Straighten sx={{ color: '#ffffff', mr: 1, opacity: 0.9, filter: 'drop-shadow(0 1px 1px rgba(0,0,0,0.3))' }} />}
            sx={selectStyles}
            MenuProps={{
              PaperProps: {
                sx: {
                  backgroundColor: '#fffdf9',
                  border: '1px solid #e8dcc8',
                  borderRadius: 2,
                  mt: 1,
                }
              }
            }}
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
          <InputLabel sx={{ color: '#ffffff', fontWeight: 600, textShadow: '0 1px 2px rgba(0, 0, 0, 0.3)' }}>Material</InputLabel>
          <Select
            value={material}
            onChange={handleChange(setMaterial)}
            label="Material"
            startAdornment={<Palette sx={{ color: '#ffffff', mr: 1, opacity: 0.9, filter: 'drop-shadow(0 1px 1px rgba(0,0,0,0.3))' }} />}
            sx={selectStyles}
            MenuProps={{
              PaperProps: {
                sx: {
                  backgroundColor: '#fffdf9',
                  border: '1px solid #e8dcc8',
                  borderRadius: 2,
                  mt: 1,
                }
              }
            }}
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
          <InputLabel sx={{ color: '#ffffff', fontWeight: 600, textShadow: '0 1px 2px rgba(0, 0, 0, 0.3)' }}>Suela</InputLabel>
          <Select
            value={suela}
            onChange={handleChange(setSuela)}
            label="Suela"
            startAdornment={<Texture sx={{ color: '#ffffff', mr: 1, opacity: 0.9, filter: 'drop-shadow(0 1px 1px rgba(0,0,0,0.3))' }} />}
            sx={selectStyles}
            MenuProps={{
              PaperProps: {
                sx: {
                  backgroundColor: '#fffdf9',
                  border: '1px solid #e8dcc8',
                  borderRadius: 2,
                  mt: 1,
                }
              }
            }}
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
          <InputLabel sx={{ color: '#ffffff', fontWeight: 600, textShadow: '0 1px 2px rgba(0, 0, 0, 0.3)' }}>Género</InputLabel>
          <Select
            value={genero}
            onChange={handleChange(setGenero)}
            label="Género"
            startAdornment={<Person sx={{ color: '#ffffff', mr: 1, opacity: 0.9, filter: 'drop-shadow(0 1px 1px rgba(0,0,0,0.3))' }} />}
            sx={selectStyles}
            MenuProps={{
              PaperProps: {
                sx: {
                  backgroundColor: '#fffdf9',
                  border: '1px solid #e8dcc8',
                  borderRadius: 2,
                  mt: 1,
                }
              }
            }}
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