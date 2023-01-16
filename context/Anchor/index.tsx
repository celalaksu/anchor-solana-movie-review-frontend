import { createContext, useContext } from "react";
import {
  Program,
  AnchorProvider,
  Idl,
  setProvider,
} from "@project-serum/anchor";
import idl from "./movie_review.json";
// import { MovieReview, IDL } from "./movie_review"
import { Connection, PublicKey } from "@solana/web3.js";
import { useAnchorWallet, useConnection } from "@solana/wallet-adapter-react";
import MockWallet from "./MockWallet";
import { MovieReview } from "./movie_review";

const WorkspaceContext = createContext({});
const programId = new PublicKey("59aXGszp71gKMND83XNfywpozaxVUJC1feyxFs227BYe");

interface WorkSpace {
  connection?: Connection;
  provider?: AnchorProvider;
  program?: Program<MovieReview>;
  // program?: Program<MovieReview>
}

const WorkspaceProvider = ({ children }: any) => {
  const wallet = useAnchorWallet() || MockWallet;
  const { connection } = useConnection();

  const provider = new AnchorProvider(connection, wallet, {});

  setProvider(provider);
  // const program = new Program(IDL as Idl, programId)
  const program = new Program(
    idl as Idl,
    programId
  ) as unknown as Program<MovieReview>;
  const workspace = {
    connection,
    provider,
    program,
  };

  return (
    <WorkspaceContext.Provider value={workspace}>
      {children}
    </WorkspaceContext.Provider>
  );
};

const useWorkspace = (): WorkSpace => {
  return useContext(WorkspaceContext);
};

export { WorkspaceProvider, useWorkspace };
