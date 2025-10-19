use super::CreatePrimeUsersMerkleTreePDA;
use crate::error::MembershipError;
use anchor_lang::prelude::*;

#[derive(Accounts)]
pub struct UpdateMembershipRoot<'info> {
    #[account(mut, seeds = [b"membership_root"], bump)]
    pub membership_root: Account<'info, CreatePrimeUsersMerkleTreePDA>,

    pub admin: Signer<'info>,
}

pub fn update_membership_root(
    ctx: Context<UpdateMembershipRoot>,
    new_merkle_root: [u8; 32],
) -> Result<()> {
    let membership = &mut ctx.accounts.membership_root;

    require!(
        ctx.accounts.admin.key() == membership.authority,
        MembershipError::Unauthorized
    );

    membership.merkle_root = new_merkle_root;
    Ok(())
}
