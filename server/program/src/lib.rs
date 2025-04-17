use anchor_lang::prelude::*;

declare_id!("9xQeWvG816bUx9EPjHmaT23yvVM2ZWbrrpZb9PusVFin");

#[program]
pub mod wall_of_wish {
    use super::*;

    pub fn create_wish(ctx: Context<CreateWish>, title: String) -> Result<()> {
        // Check that title is not empty
        require!(!title.is_empty(), ErrorCode::EmptyTitle);
        
        // Get the wish account
        let wish = &mut ctx.accounts.wish;
        
        // Set the wish data
        wish.title = title;
        wish.timestamp = Clock::get()?.unix_timestamp;
        wish.author = ctx.accounts.author.key();
        
        Ok(())
    }
}

#[derive(Accounts)]
#[instruction(title: String)]
pub struct CreateWish<'info> {
    #[account(
        init,
        payer = author,
        space = 8 + 4 + title.len() + 8 + 32, // account discriminator + string length + string data + timestamp + pubkey
        seeds = [b"wish", author.key().as_ref(), title.as_bytes()],
        bump
    )]
    pub wish: Account<'info, AWish>,
    
    #[account(mut)]
    pub author: Signer<'info>,
    
    pub system_program: Program<'info, System>,
}

#[account]
pub struct AWish {
    pub title: String,
    pub timestamp: i64,
    pub author: Pubkey,
}

#[error_code]
pub enum ErrorCode {
    #[msg("The wish title cannot be empty")]
    EmptyTitle,
}
