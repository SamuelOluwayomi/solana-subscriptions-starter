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

    pub fn create_savings_pot(
        ctx: Context<CreateSavingsPot>,
        pot_name: String,
        unlock_time: u64,
    ) -> Result<()> {
        require!(pot_name.len() > 0 && pot_name.len() <= 32, InvalidPotName);
        require!(unlock_time > 0, InvalidUnlockTime);

        let savings_pot = &mut ctx.accounts.savings_pot;
        savings_pot.authority = ctx.accounts.user.key();
        savings_pot.name = pot_name;
        savings_pot.unlock_time = unlock_time;
        savings_pot.balance = 0;
        savings_pot.created_at = Clock::get()?.unix_timestamp as u64;
        savings_pot.bump = *ctx.bumps.get("savings_pot").unwrap();
        Ok(())
    }

    pub fn deposit_to_pot(
        ctx: Context<DepositToPot>,
        amount: u64,
    ) -> Result<()> {
        require!(amount > 0, InvalidAmount);

        let savings_pot = &mut ctx.accounts.savings_pot;
        
        // Transfer SOL to the pot account
        let ix = anchor_lang::solana_program::system_instruction::transfer(
            &ctx.accounts.user.key(),
            &savings_pot.key(),
            amount,
        );
        anchor_lang::solana_program::program::invoke(
            &ix,
            &[
                ctx.accounts.user.to_account_info(),
                savings_pot.to_account_info(),
                ctx.accounts.system_program.to_account_info(),
            ],
        )?;

        savings_pot.balance = savings_pot.balance.checked_add(amount).ok_or(BalanceOverflow)?;
        Ok(())
    }

    pub fn withdraw_from_pot(
        ctx: Context<WithdrawFromPot>,
        amount: u64,
    ) -> Result<()> {
        let savings_pot = &mut ctx.accounts.savings_pot;
        
        // Check unlock time
        let current_time = Clock::get()?.unix_timestamp as u64;
        require!(current_time >= savings_pot.unlock_time, PotLocked);
        require!(amount > 0 && amount <= savings_pot.balance, InvalidWithdrawalAmount);

        // Withdraw SOL from pot to recipient
        let ix = anchor_lang::solana_program::system_instruction::transfer(
            &savings_pot.key(),
            &ctx.accounts.recipient.key(),
            amount,
        );

        // PDA signs the transaction
        let seeds = &[
            b"savings-pot-v1",
            savings_pot.authority.as_ref(),
            savings_pot.name.as_bytes(),
            &[savings_pot.bump],
        ];
        let signer_seeds = &[&seeds[..]];

        anchor_lang::solana_program::program::invoke_signed(
            &ix,
            &[
                savings_pot.to_account_info(),
                ctx.accounts.recipient.to_account_info(),
                ctx.accounts.system_program.to_account_info(),
            ],
            signer_seeds,
        )?;

        savings_pot.balance = savings_pot.balance.checked_sub(amount).ok_or(BalanceUnderflow)?;
        Ok(())
    }

    pub fn close_savings_pot(
        ctx: Context<CloseSavingsPot>,
    ) -> Result<()> {
        let savings_pot = &mut ctx.accounts.savings_pot;
        
        // Withdraw remaining balance to authority
        if savings_pot.balance > 0 {
            let ix = anchor_lang::solana_program::system_instruction::transfer(
                &savings_pot.key(),
                &ctx.accounts.authority.key(),
                savings_pot.balance,
            );

            let seeds = &[
                b"savings-pot-v1",
                savings_pot.authority.as_ref(),
                savings_pot.name.as_bytes(),
                &[savings_pot.bump],
            ];
            let signer_seeds = &[&seeds[..]];

            anchor_lang::solana_program::program::invoke_signed(
                &ix,
                &[
                    savings_pot.to_account_info(),
                    ctx.accounts.authority.to_account_info(),
                    ctx.accounts.system_program.to_account_info(),
                ],
                signer_seeds,
            )?;
        }

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

#[derive(Accounts)]
pub struct CreateSavingsPot<'info> {
    #[account(
        init,
        payer = user,
        space = 8 + 32 + 32 + 8 + 8 + 8 + 1,
        seeds = [b"savings-pot-v1", user.key().as_ref(), pot_name.as_bytes()],
        bump
    )]
    pub savings_pot: Account<'info, SavingsPot>,
    #[account(mut)]
    pub user: Signer<'info>,
    pub system_program: Program<'info, System>,
    pub pot_name: String,
}

#[derive(Accounts)]
pub struct DepositToPot<'info> {
    #[account(
        mut,
        seeds = [b"savings-pot-v1", savings_pot.authority.as_ref(), savings_pot.name.as_bytes()],
        bump = savings_pot.bump,
    )]
    pub savings_pot: Account<'info, SavingsPot>,
    #[account(mut)]
    pub user: Signer<'info>,
    pub system_program: Program<'info, System>,
}

#[derive(Accounts)]
pub struct WithdrawFromPot<'info> {
    #[account(
        mut,
        seeds = [b"savings-pot-v1", savings_pot.authority.as_ref(), savings_pot.name.as_bytes()],
        bump = savings_pot.bump,
        has_one = authority,
    )]
    pub savings_pot: Account<'info, SavingsPot>,
    pub authority: Signer<'info>,
    /// CHECK: Recipient can be any account
    pub recipient: AccountInfo<'info>,
    pub system_program: Program<'info, System>,
}

#[derive(Accounts)]
pub struct CloseSavingsPot<'info> {
    #[account(
        mut,
        seeds = [b"savings-pot-v1", savings_pot.authority.as_ref(), savings_pot.name.as_bytes()],
        bump = savings_pot.bump,
        has_one = authority,
        close = authority,
    )]
    pub savings_pot: Account<'info, SavingsPot>,
    #[account(mut)]
    pub authority: Signer<'info>,
    pub system_program: Program<'info, System>,
}

#[account]
pub struct UserProfile {
    pub authority: Pubkey,
    pub username: [u8; 16],
    pub emoji: [u8; 4],
    pub gender: [u8; 8],
    pub pin: [u8; 4],
}

#[account]
pub struct SavingsPot {
    pub authority: Pubkey,
    pub name: String,
    pub unlock_time: u64,
    pub balance: u64,
    pub created_at: u64,
    pub bump: u8,
}

#[error_code]
pub enum CadpayError {
    #[msg("Invalid pot name")]
    InvalidPotName,
    
    #[msg("Invalid unlock time")]
    InvalidUnlockTime,
    
    #[msg("Invalid amount")]
    InvalidAmount,
    
    #[msg("Invalid withdrawal amount")]
    InvalidWithdrawalAmount,
    
    #[msg("Pot is still locked")]
    PotLocked,
    
    #[msg("Balance overflow")]
    BalanceOverflow,
    
    #[msg("Balance underflow")]
    BalanceUnderflow,
}
