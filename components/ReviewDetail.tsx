import {
  Button,
  Input,
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalCloseButton,
  ModalBody,
  Stack,
  FormControl,
} from "@chakra-ui/react";
import { FC, useState } from "react";
import * as anchor from "@project-serum/anchor";
import { getAssociatedTokenAddress } from "@solana/spl-token";
import { CommentList } from "./CommentList";
import { useConnection, useWallet } from "@solana/wallet-adapter-react";
import { useWorkspace } from "../context/Anchor";
import BN from "bn.js";

interface ReviewDetailProps {
  isOpen: boolean;
  onClose: any;
  movie: any;
}

export const ReviewDetail: FC<ReviewDetailProps> = ({
  isOpen,
  onClose,
  movie,
}: ReviewDetailProps) => {
  const [comment, setComment] = useState("");
  const { connection } = useConnection();
  const { publicKey, sendTransaction } = useWallet();
  const { program } = useWorkspace();

  const handleSubmit = async (event: any) => {
    event.preventDefault();

    if (!publicKey || !program) {
      alert("Please connect your wallet!");
      return;
    }

    const movieReview = new anchor.web3.PublicKey(movie.publicKey);

    const [movieReviewCounterPda] =
      await anchor.web3.PublicKey.findProgramAddress(
        [Buffer.from("counter"), movieReview.toBuffer()],
        program.programId
      );

    const commentCounter = await program.account.movieCommentCounter.fetch(
      movieReviewCounterPda
    );

    const [mintPDA] = await anchor.web3.PublicKey.findProgramAddress(
      [Buffer.from("mint")],
      program.programId
    );

    console.log("MOVİE PUBLICKEY : ", movie.publicKey.toBuffer());

    const [movieReviewPda] = await anchor.web3.PublicKey.findProgramAddress(
      [Buffer.from(movie.account.title), publicKey.toBuffer()],
      program.programId
    );
    const [movieCommentPda] = await anchor.web3.PublicKey.findProgramAddress(
      [
        // movie.publickey.toBuffer(),
        // commentCounter.counter.toArrayLike(Buffer, "le", 8),
        movieReviewPda.toBuffer(),
        new BN(commentCounter.counter).toArrayLike(Buffer, "le", 8),
      ],
      program.programId
    );

    const tokenAddress = await getAssociatedTokenAddress(mintPDA, publicKey);

    const transaction = new anchor.web3.Transaction();

    const instruction = await program.methods
      .addComment(comment)
      .accounts({
        movieComment: movieCommentPda,
        movieReview: movieReview,
        movieCommentCounter: movieReviewCounterPda,
        rewardMint: mintPDA,
        tokenAccount: tokenAddress,
      })
      .instruction();

    transaction.add(instruction);

    try {
      let txid = await sendTransaction(transaction, connection);
      alert(
        `Transaction submitted: https://explorer.solana.com/tx/${txid}?cluster=devnet`
      );
      console.log(
        `Transaction submitted: https://explorer.solana.com/tx/${txid}?cluster=devnet`
      );
    } catch (e) {
      console.log(JSON.stringify(e));
      alert(JSON.stringify(e));
    }
  };

  return (
    <div>
      <Modal isOpen={isOpen} onClose={onClose}>
        <ModalOverlay />
        <ModalContent>
          <ModalHeader
            textTransform="uppercase"
            textAlign={{ base: "center", md: "center" }}
          >
            {movie.account.title}
          </ModalHeader>
          <ModalCloseButton />
          <ModalBody>
            <Stack textAlign={{ base: "center", md: "center" }}>
              <p>{movie.account.description}</p>
              <form onSubmit={handleSubmit}>
                <FormControl isRequired>
                  <Input
                    id="title"
                    color="black"
                    onChange={(event) => setComment(event.currentTarget.value)}
                    placeholder="Submit a comment..."
                  />
                </FormControl>
                <Button width="full" mt={4} type="submit">
                  Send
                </Button>
              </form>
              <CommentList movie={movie} />
            </Stack>
          </ModalBody>
        </ModalContent>
      </Modal>
    </div>
  );
};
