use crate::error::ErrorCode;
use anchor_lang::prelude::*;

use anchor_lang::system_program::{transfer, Transfer};

#[derive(Accounts)]
pub struct TransferWithFee<'info> {
    #[account(mut)]
    pub sender: Signer<'info>,
    /// CHECK: This account is the recipient of the transfer. No type checks needed as any account can receive SOL.
    #[account(mut)]
    pub recipient: AccountInfo<'info>,
    /// CHECK: This account is the fee collector. No type checks needed as any account can receive SOL fees.
    #[account(mut)]
    pub fee_collector: AccountInfo<'info>,
    pub system_program: Program<'info, System>,
}

pub fn spi_transfer(ctx: Context<TransferWithFee>, amount: u64) -> Result<()> {
    // Calculate 0.0015% fee
    let fee: u64 = amount
        .checked_mul(15)
        .ok_or(ErrorCode::MathOverflow)?
        .checked_div(1_000_000)
        .ok_or(ErrorCode::MathOverflow)?;

    // Calculate amount to send to recipient (98.9985.% of total)
    let recipient_amount = amount.checked_sub(fee).ok_or(ErrorCode::MathOverflow)?;

    msg!("Transfer Details:");
    msg!("  Total Amount: {} lamports", amount);
    msg!("  Fee (1%): {} lamports", fee);
    msg!("  Recipient Amount: {} lamports", recipient_amount);

    // Transfer fee to fee collector
    let fee_transfer_accounts = Transfer {
        from: ctx.accounts.sender.to_account_info(),
        to: ctx.accounts.fee_collector.to_account_info(),
    };
    let fee_transfer_ctx = CpiContext::new(
        ctx.accounts.system_program.to_account_info(),
        fee_transfer_accounts,
    );
    transfer(fee_transfer_ctx, fee)?;
    msg!("✅ Fee transferred to collector: {} lamports", fee);

    // Transfer remaining amount to recipient
    let recipient_transfer_accounts = Transfer {
        from: ctx.accounts.sender.to_account_info(),
        to: ctx.accounts.recipient.to_account_info(),
    };
    let recipient_transfer_ctx = CpiContext::new(
        ctx.accounts.system_program.to_account_info(),
        recipient_transfer_accounts,
    );
    transfer(recipient_transfer_ctx, recipient_amount)?;
    msg!(
        "✅ Amount transferred to recipient: {} lamports",
        recipient_amount
    );

    Ok(())
}
