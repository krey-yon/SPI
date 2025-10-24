pub mod error;
pub mod instructions;
pub mod utils;

use anchor_lang::prelude::*;

pub use instructions::*;
pub use utils::*;

declare_id!("FgmzWoXSjKAnMmz89EHV46avptox4BBVeE1xreP62Cxt");

#[program]
pub mod spi {
    use super::*;

    pub fn create_prime_user_merkle_pda(
        ctx: Context<CreateMembershipRoot>,
        merkle_root: [u8; 32],
    ) -> Result<()> {
        create_membership_root(ctx, merkle_root)?;
        Ok(())
    }

    pub fn update_prime_user_merkle_pda(
        ctx: Context<UpdateMembershipRoot>,
        new_merkle_root: [u8; 32],
    ) -> Result<()> {
        update_membership_root(ctx, new_merkle_root)?;
        Ok(())
    }

    pub fn transfer(ctx: Context<TransferWithFee>, amount: u64) -> Result<()> {
        spi_transfer(ctx, amount)?;
        Ok(())
    }

    pub fn create_user_asa_program(
        ctx: Context<CreateUserASAAccounts>,
        name: String,
        valid_till_unix_timestamp: u64,
    ) -> Result<()> {
        create_user_asa(ctx, name, valid_till_unix_timestamp)?;
        Ok(())
    }
    
    pub fn update_user_asa_program(
        ctx: Context<UpdateUserASA>,
        spi_tokens: Option<u64>,
        total_cashback: Option<u64>,
        total_spent: Option<u64>,
        total_transactions: Option<u64>,
        valid_till_unix_timestamp: Option<u64>,
    ) -> Result<()> {
        update_user_asa(ctx, spi_tokens, total_cashback, total_spent, total_transactions, valid_till_unix_timestamp)?;
        Ok(())
    }
    
    pub fn reward_points(ctx: Context<MintToUser>, amount: u64) -> Result<()> {
        mint_to_user(ctx, amount)?;
        Ok(())
    }
}
