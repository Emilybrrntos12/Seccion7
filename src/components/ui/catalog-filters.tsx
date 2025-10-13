import React from "react";

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
}) => (
  <div className="mb-6 grid grid-cols-1 md:grid-cols-5 gap-4">
    <select value={categoria} onChange={e => setCategoria(e.target.value)} className="border rounded px-2 py-1 w-full">
      <option value="">Categoría</option>
      <option value="Mocasines">Mocasines</option>
      <option value="Tacones">Tacones</option>
      <option value="Botines">Botines</option>
      <option value="Botas">Botas</option>
      <option value="Sandalias">Sandalias</option>
    </select>
    <select value={talla} onChange={e => setTalla(e.target.value)} className="border rounded px-2 py-1 w-full">
      <option value="">Talla</option>
      <option value="22">22</option>
      <option value="23">23</option>
      <option value="24">24</option>
      <option value="25">25</option>
      <option value="26">26</option>
      <option value="27">27</option>
      <option value="28">28</option>
      <option value="29">29</option>
      <option value="30">30</option>
    </select>
    <select value={material} onChange={e => setMaterial(e.target.value)} className="border rounded px-2 py-1 w-full">
      <option value="">Material</option>
      <option value="Cuero">Cuero</option>
      <option value="Sintético">Sintético</option>
      <option value="Polipiel">Polipiel</option>
      <option value="Charol">Charol</option>
    </select>
    <select value={suela} onChange={e => setSuela(e.target.value)} className="border rounded px-2 py-1 w-full">
      <option value="">Suela</option>
      <option value="Esponja">Esponja</option>
      <option value="Caucho">Caucho</option>
      <option value="Cuero">Cuero</option>
    </select>
    <select value={genero} onChange={e => setGenero(e.target.value)} className="border rounded px-2 py-1 w-full">
      <option value="">Género</option>
      <option value="Caballeros">Caballeros</option>
      <option value="Damas">Damas</option>
      <option value="Niños">Niños</option>
    </select>
  </div>
);
