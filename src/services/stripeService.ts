
interface StripeCheckoutSession {
  id: string;
  url: string;
}

class StripeService {
  private readonly STRIPE_PUBLIC_KEY = 'pk_live_51RTxNDKObpfjK6g15a9QXXh7MteUjNxRxyL93sbynu7OlWN5SQ0tIhUuqVaOJDTZycnJvtuG3eO3scBZjyK0aA7b001bEvp9ym';
  
  async createCheckoutSession(plan: 'premium' | 'yearly', userEmail: string): Promise<string> {
    try {
      console.log('🔄 Creating Stripe checkout session...');
      console.log(`Plan: ${plan}`);
      console.log(`User Email: ${userEmail}`);
      
      // Use the actual Stripe payment links you provided
      const paymentLinks = {
        premium: 'https://buy.stripe.com/5kQ00k5Nud1G0AUaRSabK00',
        yearly: 'https://buy.stripe.com/3cIdRa8ZGe5Kabu9NOabK01'
      };
      
      const checkoutUrl = paymentLinks[plan];
      
      console.log('✅ Redirecting to Stripe payment link');
      return checkoutUrl;
    } catch (error) {
      console.error('❌ Stripe checkout error:', error);
      throw new Error('Failed to create checkout session');
    }
  }

  async verifyPayment(sessionId: string): Promise<boolean> {
    try {
      // For now, return false since we need proper webhook integration
      console.log(`🔍 Payment verification not implemented yet for session: ${sessionId}`);
      return false;
    } catch (error) {
      console.error('❌ Payment verification error:', error);
      return false;
    }
  }

  getPublicKey(): string {
    return this.STRIPE_PUBLIC_KEY;
  }
}

export const stripeService = new StripeService();
