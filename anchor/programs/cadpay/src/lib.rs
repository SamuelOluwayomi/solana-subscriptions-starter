use anchor_lang::prelude::*;

declare_id!("6VvJbGzNHbtZLWxmLTYPpRz2F3oMDxdL1YRgV3b51Ccz");

#[program]
pub mod cadpay_profiles {
    use super::*;

    pub fn initialize_user(ctx: Context<InitializeUser>, username: String, emoji: String, gender: String, pin: String) -> Result<()> {
        let user_profile = &mut ctx.accounts.user_profile;
        user_profile.username = str_to_fixed_16(&username);
        user_profile.emoji = str_to_fixed_4(&emoji);
        user_profile.gender = str_to_fixed_8(&gender);
        user_profile.pin = str_to_fixed_4(&pin);
        user_profile.authority = ctx.accounts.user.key();
        Ok(())
    }

    pub fn update_user(ctx: Context<UpdateUser>, username: String, emoji: String, gender: String, pin: String) -> Result<()> {
        let user_profile = &mut ctx.accounts.user_profile;
        user_profile.username = str_to_fixed_16(&username);
        user_profile.emoji = str_to_fixed_4(&emoji);
        user_profile.gender = str_to_fixed_8(&gender);
        user_profile.pin = str_to_fixed_4(&pin);
        Ok(())
    }
}

#[derive(Accounts)]
pub struct InitializeUser<'info> {
    #[account(
        init,
        payer = user,
        space = 8 + 32 + 16 + 4 + 8 + 4, 
        seeds = [b"user-profile-v1", user.key().as_ref()],
        bump
    )]
    pub user_profile: Account<'info, UserProfile>,
    #[account(mut)]
    pub user: Signer<'info>,
    pub system_program: Program<'info, System>,
}

#[derive(Accounts)]
pub struct UpdateUser<'info> {
    #[account(
        mut,
        seeds = [b"user-profile-v1", user.key().as_ref()],
        bump,
        has_one = authority,
    )]
    pub user_profile: Account<'info, UserProfile>,
    pub user: Signer<'info>,
    pub authority: Signer<'info>,
}

#[account]
pub struct UserProfile {
    pub authority: Pubkey,
    pub username: [u8; 16],
    pub emoji: [u8; 4],
    pub gender: [u8; 8],
    pub pin: [u8; 4],
}

// Helper functions for fixed-size buffers
pub fn str_to_fixed_16(s: &str) -> [u8; 16] {
    let mut arr = [0u8; 16];
    let bytes = s.as_bytes();
    let len = bytes.len().min(16);
    arr[..len].copy_from_slice(&bytes[..len]);
    arr
}

pub fn str_to_fixed_8(s: &str) -> [u8; 8] {
    let mut arr = [0u8; 8];
    let bytes = s.as_bytes();
    let len = bytes.len().min(8);
    arr[..len].copy_from_slice(&bytes[..len]);
    arr
}

pub fn str_to_fixed_4(s: &str) -> [u8; 4] {
    let mut arr = [0u8; 4];
    let bytes = s.as_bytes();
    let len = bytes.len().min(4);
    arr[..len].copy_from_slice(&bytes[..len]);
    arr
}
