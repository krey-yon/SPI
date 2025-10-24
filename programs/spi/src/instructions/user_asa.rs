use anchor_lang::prelude::*;
use crate::error::ErrorCode;

#[account]
pub struct UserASA {
    pub name: String,                   // 4(vector size prefix) + 20 bytes
    pub spi_tokens: u64,                // 8 bytes
    pub total_cashback: u64,            // 8 bytes
    pub valid_till_unix_timestamp: u64, // 8 bytes
    pub join_date_unix_timestamp: u64,  // 8 bytes
    pub total_spent: u64,               // 8 bytes
    pub total_transactions: u64,        // 8 bytes
    pub merkle_proof: Vec<[u8; 32]>,           // 32 bytes
}

#[derive(Accounts)]
pub struct CreateUserASAAccounts<'info> {
    #[account(mut)]
    authority: Signer<'info>,
    
    /// CHECK: The customer account is verified through the PDA seeds derivation
    customer: AccountInfo<'info>,
    
    #[account(
        init_if_needed,
        payer = authority,
        space = 8 + 4 + 20 + 8*6 + 4 + 32*10,
        seeds = [b"user_asa_spi_trial_7", customer.key().as_ref()],
        bump
    )]
    user_asa: Account<'info, UserASA>,
    system_program: Program<'info, System>,
}

#[derive(Accounts)]
pub struct UpdateUserASA<'info> {
    #[account(mut)]
    authority: Signer<'info>,
    
    /// CHECK: The customer account is verified through the PDA seeds derivation
    customer: AccountInfo<'info>,
    
    #[account(
        mut,
        seeds = [b"user_asa_spi_trial_7", customer.key().as_ref()],
        bump
    )]
    user_asa: Account<'info, UserASA>,
    system_program: Program<'info, System>,
}

pub fn create_user_asa(
    ctx: Context<CreateUserASAAccounts>,
    name: String,
    merkle_proof: Vec<[u8; 32]>,
    valid_till_unix_timestamp: u64,
) -> Result<()> {
    let user_asa = &mut ctx.accounts.user_asa;
    require!(name.len() <= 20, ErrorCode::NameTooLong);
    user_asa.name = name;
    user_asa.spi_tokens = 0;
    user_asa.total_cashback = 0;
    user_asa.valid_till_unix_timestamp = valid_till_unix_timestamp;
    user_asa.join_date_unix_timestamp = Clock::get()?.unix_timestamp as u64;
    user_asa.total_spent = 0;
    user_asa.total_transactions = 0;
    user_asa.merkle_proof = merkle_proof;

    msg!(
        "✅ UserASA account created successfully for customer: {:?}",
        ctx.accounts.customer.key()
    );
    msg!(
        "   Paid for by authority: {:?}",
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
        "✅ UserASA account updated successfully for customer: {:?}",
        ctx.accounts.customer.key()
    );
    Ok(())
}
