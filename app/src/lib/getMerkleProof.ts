import { loadUsers } from "./users";
import { MerkleTree } from "merkletreejs";
import keccak256 from "keccak256";

export const updateUser = (userKey: string) => {
  const users = loadUsers();
  users.push(userKey);
  const userPubKey = userKey;

  const tree = new MerkleTree(
    users.map((x) => keccak256(x)),
    keccak256,
    { sortPairs: true }
  );
  const proof = tree.getProof(keccak256(userKey));
  const root = tree.getRoot();
  const merkleRootBytes = Array.from(root);

  const proofBytes = proof.map((x) => Array.from(x.data));

  return {
    userPubKey,
    proofBytes,
    merkleRootBytes
  };
};
