import { gql } from "apollo-server";

export const typeDefs = gql`
  type Structure {
    id: ID!
    journal: Journal
    a: String
    b: String
    c: String
    alpha: String
    beta: String
    gamma: String
    vol: String
    z: String
    diffrtemp: String
    diffrpressure: String
    sg: String
    sgHall: String
    radType: String
    wavelength: String
    commonname: String
    chemname: String
    mineral: String
    formula: String
    calcformula: String
    iupacformula: String
    loops: [StructureDataLoops]
    Rall: String
    Robs: String
    Rref: String
    wRall: String
    wRobs: String
    wRref: String
  }

  type Query {
    hello: String
    structure(id: ID): Structure
  }
`;
