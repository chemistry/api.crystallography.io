import { gql } from "apollo-server";

export const typeDefs = gql`
  type AuthorDetails {
    id: ID!
    full: String
    count: String
    updated: String
    created: String
    structures(limit: Int, offset: Int): [Structure]
  }

  type Author {
    name: String
    link: String
  }

  type MetaInfo {
    id: ID!
    count: Int
  }

  type Journal {
    id: ID!
    title: String
    journal: String
    year: String
    volume: String
    issue: String
    firstpage: String
    lastpage: String
    doi: String
    authors: [Author]
  }

  type SearchResults {
    structures: [Structure]
    meta: MetaInfo
  }

  type StructureDataLoops {
    columns: [String]
    data: [[String]]
  }

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

  type AuthorsCollectionResponse {
    authors: [AuthorDetails]
    meta: MetaInfo
  }

  type StructuresCollectionResponse {
    structures: [Structure]
    meta: MetaInfo
  }

  type Query {
    hello: String
    structure(id: ID): Structure
  }
`;
