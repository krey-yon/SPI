use anchor_lang::prelude::*;

#[account]
pub struct UserASA {
    pub name: String,                   // 4(vector size prefix) + 20 bytes
    pub spi_tokens: u64,                // 8 bytes
    pub total_cashback: u64,            // 8 bytes
    pub valid_till_unix_timestamp: u64, // 8 bytes
    pub join_date_unix_timestamp: u64,  // 8 bytes
    pub total_spent: u64,               // 8 bytes
    pub total_transactions: u64, 
    // pub merkleProof: Vec<u8>,           // 8 bytes
}

#[derive(Accounts)]
pub struct CreateUserASAAccounts<'info> {
    #[account(mut)]
    authority: Signer<'info>,
    #[account(
        init,
        payer = authority,
        space = 8 + 4 + 20 + 8 + 8 + 8 + 8 + 8 + 8,
        seeds = [b"user_asa_spi_trial_4", authority.key().as_ref()],
        bump
    )]
    user_asa: Account<'info, UserASA>,
    system_program: Program<'info, System>,
}

#[derive(Accounts)]
pub struct UpdateUserASA<'info> {
    #[account(mut)]
    authority: Signer<'info>,
    #[account(
        mut,
        seeds = [b"user_asa_spi_trial_4", authority.key().as_ref()],
        bump
    )]
    user_asa: Account<'info, UserASA>,
    system_program: Program<'info, System>,
}

pub fn create_user_asa(
    ctx: Context<CreateUserASAAccounts>,
    name: String,
    valid_till_unix_timestamp: u64,
) -> Result<()> {
    let user_asa = &mut ctx.accounts.user_asa;
    user_asa.name = name;
    user_asa.spi_tokens = 0;
    user_asa.total_cashback = 0;
    user_asa.valid_till_unix_timestamp = valid_till_unix_timestamp;
    user_asa.join_date_unix_timestamp = Clock::get()?.unix_timestamp as u64;
    user_asa.total_spent = 0;
    user_asa.total_transactions = 0;

    msg!(
        "✅ UserASA account created successfully for {:?}",
        ctx.accounts.authority.key()
    );
    Ok(())
}

pub fn update_user_asa(
    ctx: Context<UpdateUserASA>,
    spi_tokens: Option<u64>,
    total_cashback: Option<u64>,
    total_spent: Option<u64>,
    total_transactions: Option<u64>,
    valid_till_unix_timestamp: Option<u64>,
) -> Result<()> {
    let user_asa = &mut ctx.accounts.user_asa;

    if let Some(tokens) = spi_tokens {
        user_asa.spi_tokens = tokens;
    }
    if let Some(cashback) = total_cashback {
        user_asa.total_cashback = cashback;
    }
    if let Some(spent) = total_spent {
        user_asa.total_spent = spent;
    }
    if let Some(transactions) = total_transactions {
        user_asa.total_transactions = transactions;
    }
    if let Some(valid_till) = valid_till_unix_timestamp {
        user_asa.valid_till_unix_timestamp = valid_till;
    }

    msg!(
        "✅ UserASA account updated successfully for {:?}",
        ctx.accounts.authority.key()
    );
    Ok(())
}
