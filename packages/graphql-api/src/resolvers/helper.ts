const structureCommonAttributes = [
  "a",
  "b",
  "c",
  "alpha",
  "beta",
  "gamma",
  "vol",
  "z",
  "diffrtemp",
  "diffrpressure",
  "sg",
  "sgHall",
  "radType",
  "wavelength",
  "commonname",
  "chemname",
  "mineral",
  "formula",
  "calcformula",
  "iupacformula",
  "Rall",
  "Robs",
  "Rref",
  "wRall",
  "wRobs",
  "wRref",
];

const journalCommonAttributes = [
  "title",
  "journal",
  "year",
  "volume",
  "issue",
  "firstpage",
  "lastpage",
  "doi",
];

const toAuthors = (authors) => {
  return Array.isArray(authors) ? authors : [];
};

const filterLoopArray = (loops: any) => {
  if (!Array.isArray(loops)) {
    return [];
  }
  return loops.filter((item) => {
    return item.columns.indexOf("_atom_site_fract_x") !== -1;
  });
};

export const mapStructure = (document: any) => {
  const items = structureCommonAttributes.reduce((acc: any, attr: string) => {
    if (document.hasOwnProperty(attr)) {
      acc[attr] = document[attr];
    }
    return acc;
  }, {} as any);

  const journal = journalCommonAttributes.reduce((acc: any, attr: string) => {
    if (document.hasOwnProperty(attr)) {
      acc[attr] = document[attr];
    }
    return acc;
  }, {} as any);

  return {
    ...items,
    id: document["_id"],
    loops: filterLoopArray(document.loops),
    journal: {
      ...journal,
      authors: toAuthors(document.__authors),
    },
  };
};
