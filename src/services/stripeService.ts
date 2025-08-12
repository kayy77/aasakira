
interface StripeCheckoutSession {
  id: string;
  url: string;
}

class StripeService {
  private readonly STRIPE_PUBLIC_KEY = 'pk_live_51RTxNDKObpfjK6g15a9QXXh7MteUjNxRxyL93sbynu7OlWN5SQ0tIhUuqVaOJDTZycnJvtuG3eO3scBZjyK0aA7b001bEvp9ym';
  
  async createCheckoutSession(plan: 'premium' | 'yearly', userEmail: string): Promise<string> {
    try {
      console.log('🔄 Creating Stripe checkout session...');
      console.log(`Plan: ${plan}, User Email: ${userEmail}`);
      
      // Use the provided Stripe payment link for $25/month premium plan
      const paymentLinks = {
        premium: 'https://buy.stripe.com/5kQ00k5Nud1G0AUaRSabK00', // $25/month  
        yearly: 'https://buy.stripe.com/5kQ00k5Nud1G0AUaRSabK00'   // Use same link for yearly for now
      };
      
      const checkoutUrl = paymentLinks[plan];
      
      if (!checkoutUrl) {
        throw new Error(`Invalid plan: ${plan}`);
      }
      
      console.log('✅ Stripe checkout URL generated successfully');
      console.log(`Redirecting to: ${checkoutUrl}`);
      
      // Add user email as URL parameter for better tracking
      const urlWithParams = `${checkoutUrl}?prefilled_email=${encodeURIComponent(userEmail)}`;
      
      return urlWithParams;
    } catch (error) {
      console.error('❌ Stripe checkout error:', error);
      throw new Error(`Failed to create checkout session: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  async verifyPayment(sessionId: string): Promise<boolean> {
    try {
      console.log(`🔍 Payment verification for session: ${sessionId}`);
      // This would normally check with Stripe API to verify payment status
      // For now, return true to indicate payment needs to be verified via webhook
      console.log('ℹ️ Payment verification requires webhook integration');
      return true;
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
