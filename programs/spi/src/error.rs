use anchor_lang::prelude::*;

#[error_code]
pub enum MembershipError {
    #[msg("You are not authorized to update the membership root.")]
    Unauthorized,
}