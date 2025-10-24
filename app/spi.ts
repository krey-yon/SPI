/**
 * Program IDL in camelCase format in order to be used in JS/TS.
 *
 * Note that this is only a type helper and is not the actual IDL. The original
 * IDL can be found at `target/idl/spi.json`.
 */
export type Spi = {
  "address": "FgmzWoXSjKAnMmz89EHV46avptox4BBVeE1xreP62Cxt",
  "metadata": {
    "name": "spi",
    "version": "0.1.0",
    "spec": "0.1.0",
    "description": "Created with Anchor"
  },
  "instructions": [
    {
      "name": "createPrimeUserMerklePda",
      "discriminator": [
        254,
        62,
        50,
        153,
        174,
        52,
        120,
        1
      ],
      "accounts": [
        {
          "name": "membershipRoot",
          "writable": true,
          "pda": {
            "seeds": [
              {
                "kind": "const",
                "value": [
                  109,
                  101,
                  109,
                  98,
                  101,
                  114,
                  115,
                  104,
                  105,
                  112,
                  95,
                  114,
                  111,
                  111,
                  116,
                  95,
                  115,
                  112,
                  105,
                  95,
                  116,
                  114,
                  105,
                  97,
                  108,
                  95,
                  49
                ]
              }
            ]
          }
        },
        {
          "name": "admin",
          "writable": true,
          "signer": true
        },
        {
          "name": "systemProgram",
          "address": "11111111111111111111111111111111"
        }
      ],
      "args": [
        {
          "name": "merkleRoot",
          "type": {
            "array": [
              "u8",
              32
            ]
          }
        }
      ]
    },
    {
      "name": "createUserAsaProgram",
      "discriminator": [
        227,
        253,
        79,
        135,
        19,
        76,
        116,
        120
      ],
      "accounts": [
        {
          "name": "authority",
          "writable": true,
          "signer": true
        },
        {
          "name": "customer"
        },
        {
          "name": "userAsa",
          "writable": true,
          "pda": {
            "seeds": [
              {
                "kind": "const",
                "value": [
                  117,
                  115,
                  101,
                  114,
                  95,
                  97,
                  115,
                  97,
                  95,
                  115,
                  112,
                  105,
                  95,
                  116,
                  114,
                  105,
                  97,
                  108,
                  95,
                  55
                ]
              },
              {
                "kind": "account",
                "path": "customer"
              }
            ]
          }
        },
        {
          "name": "systemProgram",
          "address": "11111111111111111111111111111111"
        }
      ],
      "args": [
        {
          "name": "name",
          "type": "string"
        },
        {
          "name": "merkleProof",
          "type": {
            "vec": {
              "array": [
                "u8",
                32
              ]
            }
          }
        },
        {
          "name": "validTillUnixTimestamp",
          "type": "u64"
        }
      ]
    },
    {
      "name": "rewardPoints",
      "discriminator": [
        62,
        56,
        78,
        210,
        155,
        17,
        153,
        3
      ],
      "accounts": [
        {
          "name": "mint",
          "writable": true
        },
        {
          "name": "recipientAta",
          "writable": true,
          "pda": {
            "seeds": [
              {
                "kind": "account",
                "path": "recipient"
              },
              {
                "kind": "const",
                "value": [
                  6,
                  221,
                  246,
                  225,
                  215,
                  101,
                  161,
                  147,
                  217,
                  203,
                  225,
                  70,
                  206,
                  235,
                  121,
                  172,
                  28,
                  180,
                  133,
                  237,
                  95,
                  91,
                  55,
                  145,
                  58,
                  140,
                  245,
                  133,
                  126,
                  255,
                  0,
                  169
                ]
              },
              {
                "kind": "account",
                "path": "mint"
              }
            ],
            "program": {
              "kind": "const",
              "value": [
                140,
                151,
                37,
                143,
                78,
                36,
                137,
                241,
                187,
                61,
                16,
                41,
                20,
                142,
                13,
                131,
                11,
                90,
                19,
                153,
                218,
                255,
                16,
                132,
                4,
                142,
                123,
                216,
                219,
                233,
                248,
                89
              ]
            }
          }
        },
        {
          "name": "recipient",
          "docs": [
            "The recipient who owns the ATA"
          ]
        },
        {
          "name": "owner",
          "docs": [
            "The mint authority (must sign the transaction)"
          ],
          "signer": true
        },
        {
          "name": "payer",
          "docs": [
            "Payer for ATA creation"
          ],
          "writable": true,
          "signer": true
        },
        {
          "name": "tokenProgram",
          "address": "TokenkegQfeZyiNwAJbNbGKPFXCWuBvf9Ss623VQ5DA"
        },
        {
          "name": "associatedTokenProgram",
          "address": "ATokenGPvbdGVxr1b2hvZbsiqW5xWH25efTNsLJA8knL"
        },
        {
          "name": "systemProgram",
          "address": "11111111111111111111111111111111"
        }
      ],
      "args": [
        {
          "name": "amount",
          "type": "u64"
        }
      ]
    },
    {
      "name": "transfer",
      "discriminator": [
        163,
        52,
        200,
        231,
        140,
        3,
        69,
        186
      ],
      "accounts": [
        {
          "name": "sender",
          "writable": true,
          "signer": true
        },
        {
          "name": "recipient",
          "writable": true
        },
        {
          "name": "feeCollector",
          "writable": true
        },
        {
          "name": "systemProgram",
          "address": "11111111111111111111111111111111"
        }
      ],
      "args": [
        {
          "name": "amount",
          "type": "u64"
        }
      ]
    },
    {
      "name": "updatePrimeUserMerklePda",
      "discriminator": [
        57,
        88,
        142,
        139,
        219,
        63,
        73,
        32
      ],
      "accounts": [
        {
          "name": "membershipRoot",
          "writable": true,
          "pda": {
            "seeds": [
              {
                "kind": "const",
                "value": [
                  109,
                  101,
                  109,
                  98,
                  101,
                  114,
                  115,
                  104,
                  105,
                  112,
                  95,
                  114,
                  111,
                  111,
                  116,
                  95,
                  115,
                  112,
                  105,
                  95,
                  116,
                  114,
                  105,
                  97,
                  108,
                  95,
                  49
                ]
              }
            ]
          }
        },
        {
          "name": "admin",
          "signer": true
        }
      ],
      "args": [
        {
          "name": "newMerkleRoot",
          "type": {
            "array": [
              "u8",
              32
            ]
          }
        }
      ]
    },
    {
      "name": "updateUserAsaProgram",
      "discriminator": [
        236,
        95,
        251,
        213,
        162,
        214,
        56,
        215
      ],
      "accounts": [
        {
          "name": "authority",
          "writable": true,
          "signer": true
        },
        {
          "name": "customer"
        },
        {
          "name": "userAsa",
          "writable": true,
          "pda": {
            "seeds": [
              {
                "kind": "const",
                "value": [
                  117,
                  115,
                  101,
                  114,
                  95,
                  97,
                  115,
                  97,
                  95,
                  115,
                  112,
                  105,
                  95,
                  116,
                  114,
                  105,
                  97,
                  108,
                  95,
                  55
                ]
              },
              {
                "kind": "account",
                "path": "customer"
              }
            ]
          }
        },
        {
          "name": "systemProgram",
          "address": "11111111111111111111111111111111"
        }
      ],
      "args": [
        {
          "name": "spiTokens",
          "type": {
            "option": "u64"
          }
        },
        {
          "name": "totalCashback",
          "type": {
            "option": "u64"
          }
        },
        {
          "name": "totalSpent",
          "type": {
            "option": "u64"
          }
        },
        {
          "name": "totalTransactions",
          "type": {
            "option": "u64"
          }
        },
        {
          "name": "validTillUnixTimestamp",
          "type": {
            "option": "u64"
          }
        }
      ]
    }
  ],
  "accounts": [
    {
      "name": "createPrimeUsersMerkleTreePda",
      "discriminator": [
        76,
        244,
        123,
        215,
        169,
        8,
        170,
        88
      ]
    },
    {
      "name": "userAsa",
      "discriminator": [
        107,
        162,
        235,
        108,
        121,
        240,
        46,
        196
      ]
    }
  ],
  "errors": [
    {
      "code": 6000,
      "name": "unauthorized",
      "msg": "You are not authorized to update the membership root."
    },
    {
      "code": 6001,
      "name": "mathOverflow",
      "msg": "Math operation overflow"
    },
    {
      "code": 6002,
      "name": "nameTooLong",
      "msg": "❌ Name exceeds maximum length allowed."
    },
    {
      "code": 6003,
      "name": "merkleProofTooLarge",
      "msg": "❌ Merkle proof exceeds maximum length allowed."
    }
  ],
  "types": [
    {
      "name": "createPrimeUsersMerkleTreePda",
      "type": {
        "kind": "struct",
        "fields": [
          {
            "name": "authority",
            "type": "pubkey"
          },
          {
            "name": "merkleRoot",
            "type": {
              "array": [
                "u8",
                32
              ]
            }
          }
        ]
      }
    },
    {
      "name": "userAsa",
      "type": {
        "kind": "struct",
        "fields": [
          {
            "name": "name",
            "type": "string"
          },
          {
            "name": "spiTokens",
            "type": "u64"
          },
          {
            "name": "totalCashback",
            "type": "u64"
          },
          {
            "name": "validTillUnixTimestamp",
            "type": "u64"
          },
          {
            "name": "joinDateUnixTimestamp",
            "type": "u64"
          },
          {
            "name": "totalSpent",
            "type": "u64"
          },
          {
            "name": "totalTransactions",
            "type": "u64"
          },
          {
            "name": "merkleProof",
            "type": {
              "vec": {
                "array": [
                  "u8",
                  32
                ]
              }
            }
          }
        ]
      }
    }
  ]
};
