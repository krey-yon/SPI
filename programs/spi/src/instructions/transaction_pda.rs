use anchor_lang::prelude::*;

#[derive(Accounts)]
pub struct CreateTransactionPda<'info> {
    #[account(mut)]
    payer: Signer<'info>,
    /// CHECK: This is the authority who created the counter
    authority: AccountInfo<'info>,
    #[account(
        init,
        seeds = [b"transaction", payer.key().as_ref()],
        bump,
        payer = payer,
        space = 8 + 32 + 32 + 8 + 1 // Discriminant + Pubkey + u64 + bool
    )]
    transaction_pda: Account<'info, TransactionPda>,
    system_program: Program<'info, System>,
}

#[derive(Accounts)]
pub struct UpdateTransactionPda<'info> {
    #[account(mut)]
    payer: Signer<'info>,

    #[account(
        mut,
        seeds = [b"transaction", payer.key().as_ref()],
        bump,
        constraint = transaction_pda.payer == payer.key()
    )]
    transaction_pda: Account<'info, TransactionPda>,
}

#[account]
pub struct TransactionPda {
    pub payer: Pubkey,     // 32 bytes
    pub reference: Pubkey, // 32 bytes
    pub amount: u64,       // 8 bytes
    pub timestamp: u64,    // 8 bytes
    pub is_paid: bool,     // 1 byte
}

pub fn create_transaction_pda(
    ctx: Context<CreateTransactionPda>,
    amount: u64,
    reference_keypair: Pubkey,
) -> Result<()> {
    msg!("Creating Transaction PDA");
    let transaction = &mut ctx.accounts.transaction_pda;
    transaction.payer = ctx.accounts.payer.key();
    transaction.reference = reference_keypair;
    transaction.amount = amount;
    transaction.is_paid = false;

    msg!(
        "Created PDA for payer {} with reference {} with amount {}",
        transaction.payer,
        transaction.reference,
        transaction.amount,
    );
    Ok(())
}

pub fn update_transaction_pda(ctx: Context<UpdateTransactionPda>) -> Result<()> {
    let transaction = &mut ctx.accounts.transaction_pda;

    transaction.is_paid = true;
    msg!("✅ Updated payment status");
    Ok(())
}
