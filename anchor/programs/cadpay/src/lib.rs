use anchor_lang::prelude::*;

declare_id!("6VvJbGzNHbtZLWxmLTYPpRz2F3oMDxdL1YRgV3b51Ccz");

#[program]
pub mod cadpay_profiles {
    use super::*;

    pub fn initialize_user(
        ctx: Context<InitializeUser>, 
        username: [u8; 16], 
        emoji: [u8; 4], 
        gender: [u8; 8], 
        pin: [u8; 4]
    ) -> Result<()> {
        let user_profile = &mut ctx.accounts.user_profile;
        user_profile.username = username;
        user_profile.emoji = emoji;
        user_profile.gender = gender;
        user_profile.pin = pin;
        user_profile.authority = ctx.accounts.user.key();
        Ok(())
    }

    pub fn update_user(
        ctx: Context<UpdateUser>, 
        username: [u8; 16], 
        emoji: [u8; 4], 
        gender: [u8; 8], 
        pin: [u8; 4]
    ) -> Result<()> {
        let user_profile = &mut ctx.accounts.user_profile;
        user_profile.username = username;
        user_profile.emoji = emoji;
        user_profile.gender = gender;
        user_profile.pin = pin;
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
