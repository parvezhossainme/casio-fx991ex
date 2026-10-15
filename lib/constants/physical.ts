/** Scientific constants selectable from the CONST menu (SHIFT + 7). */

export interface PhysicalConstant {
  id: string;
  symbol: string;
  label: string;
  value: number;
  unit: string;
}

export const PHYSICAL_CONSTANTS: PhysicalConstant[] = [
  {
    id: "c",
    symbol: "c",
    label: "Speed of light",
    value: 299792458,
    unit: "m/s",
  },
  {
    id: "h",
    symbol: "h",
    label: "Planck constant",
    value: 6.62607015e-34,
    unit: "J·s",
  },
  {
    id: "hbar",
    symbol: "ħ",
    label: "Reduced Planck constant",
    value: 1.054571817e-34,
    unit: "J·s",
  },
  {
    id: "ec",
    symbol: "e",
    label: "Elementary charge",
    value: 1.602176634e-19,
    unit: "C",
  },
  {
    id: "me",
    symbol: "mₑ",
    label: "Electron mass",
    value: 9.1093837015e-31,
    unit: "kg",
  },
  {
    id: "mp",
    symbol: "mₚ",
    label: "Proton mass",
    value: 1.67262192369e-27,
    unit: "kg",
  },
  {
    id: "mn",
    symbol: "mₙ",
    label: "Neutron mass",
    value: 1.67492749804e-27,
    unit: "kg",
  },
  {
    id: "u",
    symbol: "u",
    label: "Atomic mass unit",
    value: 1.6605390666e-27,
    unit: "kg",
  },
  {
    id: "na",
    symbol: "Nᴀ",
    label: "Avogadro constant",
    value: 6.02214076e23,
    unit: "1/mol",
  },
  {
    id: "k",
    symbol: "k",
    label: "Boltzmann constant",
    value: 1.380649e-23,
    unit: "J/K",
  },
  {
    id: "r",
    symbol: "R",
    label: "Molar gas constant",
    value: 8.314462618,
    unit: "J/(mol·K)",
  },
  {
    id: "g",
    symbol: "g",
    label: "Standard gravity",
    value: 9.80665,
    unit: "m/s²",
  },
  {
    id: "gc",
    symbol: "G",
    label: "Gravitational constant",
    value: 6.6743e-11,
    unit: "m³/(kg·s²)",
  },
  {
    id: "f",
    symbol: "F",
    label: "Faraday constant",
    value: 96485.33212,
    unit: "C/mol",
  },
  {
    id: "e0",
    symbol: "ε₀",
    label: "Vacuum permittivity",
    value: 8.8541878128e-12,
    unit: "F/m",
  },
  {
    id: "u0",
    symbol: "μ₀",
    label: "Vacuum permeability",
    value: 1.25663706212e-6,
    unit: "N/A²",
  },
  {
    id: "a0",
    symbol: "a₀",
    label: "Bohr radius",
    value: 5.29177210903e-11,
    unit: "m",
  },
  {
    id: "ry",
    symbol: "R∞",
    label: "Rydberg constant",
    value: 10973731.56816,
    unit: "1/m",
  },
  {
    id: "alpha",
    symbol: "α",
    label: "Fine-structure constant",
    value: 7.2973525693e-3,
    unit: "—",
  },
  {
    id: "mub",
    symbol: "μʙ",
    label: "Bohr magneton",
    value: 9.2740100783e-24,
    unit: "J/T",
  },
  {
    id: "sb",
    symbol: "σ",
    label: "Stefan–Boltzmann constant",
    value: 5.670374419e-8,
    unit: "W/(m²·K⁴)",
  },
  {
    id: "atm",
    symbol: "atm",
    label: "Standard atmosphere",
    value: 101325,
    unit: "Pa",
  },
  {
    id: "ev",
    symbol: "eV",
    label: "Electron volt",
    value: 1.602176634e-19,
    unit: "J",
  },
];

export function findConstant(id: string): PhysicalConstant | undefined {
  return PHYSICAL_CONSTANTS.find((constant) => constant.id === id);
}
