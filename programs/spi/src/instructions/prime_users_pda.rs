use anchor_lang::prelude::*;

#[derive(Accounts)]
pub struct CreateMembershipRoot<'info> {
    #[account(
        init, 
        payer = admin, 
        space = 8 + 32 + 32, 
        seeds = [b"membership_root"], 
        bump
    )]
    pub membership_root: Account<'info, CreatePrimeUsersMerkleTreePDA>,

    #[account(mut)]
    pub admin: Signer<'info>,

    pub system_program: Program<'info, System>,
}

#[account]
pub struct CreatePrimeUsersMerkleTreePDA {
    pub authority: Pubkey,
    pub merkle_root: [u8; 32],
}

pub fn create_membership_root(
    ctx: Context<CreateMembershipRoot>,
    merkle_root: [u8; 32],
) -> Result<()> {
    let membership = &mut ctx.accounts.membership_root;
    membership.authority = ctx.accounts.admin.key();
    membership.merkle_root = merkle_root;
    Ok(())
}
