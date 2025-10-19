pub mod error;
pub mod instructions;

use anchor_lang::prelude::*;

pub use instructions::*;

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
}
