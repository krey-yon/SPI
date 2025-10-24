use anchor_lang::prelude::*;
use anchor_spl::{
    associated_token::AssociatedToken,
    token::{self, Mint, MintTo, Token, TokenAccount}
};

#[derive(Accounts)]
pub struct MintToUser<'info> {
    #[account(mut)]
    pub mint: Account<'info, Mint>,

    // This will automatically create the ATA if it doesn't exist
    #[account(
        init_if_needed,
        payer = payer,
        associated_token::mint = mint,
        associated_token::authority = recipient
    )]
    pub recipient_ata: Account<'info, TokenAccount>,

    /// The recipient who owns the ATA
    /// CHECK: Can be any account
    pub recipient: AccountInfo<'info>,

    /// The mint authority (must sign the transaction)
    pub owner: Signer<'info>,

    /// Payer for ATA creation
    #[account(mut)]
    pub payer: Signer<'info>,

    pub token_program: Program<'info, Token>,
    pub associated_token_program: Program<'info, AssociatedToken>,
    pub system_program: Program<'info, System>,
}

pub fn mint_to_user(ctx: Context<MintToUser>, amount: u64) -> Result<()> {
    // CPI call to the SPL Token program
    let cpi_accounts = MintTo {
        mint: ctx.accounts.mint.to_account_info(),
        to: ctx.accounts.recipient_ata.to_account_info(),
        authority: ctx.accounts.owner.to_account_info(),
    };
    let cpi_program = ctx.accounts.token_program.to_account_info();

    token::mint_to(CpiContext::new(cpi_program, cpi_accounts), amount)?;

    Ok(())
}
