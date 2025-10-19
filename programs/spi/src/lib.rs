use anchor_lang::prelude::*;

declare_id!("FgmzWoXSjKAnMmz89EHV46avptox4BBVeE1xreP62Cxt");

#[program]
pub mod spi {
    use super::*;

    pub fn initialize(ctx: Context<Initialize>) -> Result<()> {
        msg!("Greetings from: {:?}", ctx.program_id);
        Ok(())
    }
}

#[derive(Accounts)]
pub struct Initialize {}
