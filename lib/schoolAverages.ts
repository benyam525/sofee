export interface SchoolAverages {
  state: {
    math: number;
    reading: number;
  };
  districts: Record<string, {
    name: string;
    math: number;
    reading: number;
  }>;
}

export const schoolAverages: SchoolAverages = {
  state: {
    math: 0.52, // Texas state average
    reading: 0.58
  },
  districts: {
    "057905": { // Frisco ISD
      name: "Frisco ISD",
      math: 0.81,
      reading: 0.84
    },
    "043907": { // Allen ISD
      name: "Allen ISD",
      math: 0.76,
      reading: 0.80
    },
    "057908": { // Carrollton-Farmers Branch ISD
      name: "Carrollton-Farmers Branch ISD",
      math: 0.71,
      reading: 0.74
    },
    "108906": { // Plano ISD
      name: "Plano ISD",
      math: 0.82,
      reading: 0.85
    },
    "043906": { // McKinney ISD
      name: "McKinney ISD",
      math: 0.75,
      reading: 0.78
    },
    "220905": { // Carroll ISD (Southlake)
      name: "Carroll ISD",
      math: 0.87,
      reading: 0.89
    },
    "220906": { // Grapevine-Colleyville ISD
      name: "Grapevine-Colleyville ISD",
      math: 0.85,
      reading: 0.88
    },
    "057909": { // Coppell ISD
      name: "Coppell ISD",
      math: 0.79,
      reading: 0.82
    },
    "220908": { // Grand Prairie ISD
      name: "Grand Prairie ISD",
      math: 0.67,
      reading: 0.70
    }
  }
};
