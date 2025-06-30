# Setting Up a Custom Domain with IONOS for Your Bolt.new App

This guide walks you through the process of purchasing a domain from IONOS and connecting it to your Bolt.new application deployed on Netlify.

## Step 1: Purchase a Domain from IONOS

1. Go to [IONOS.com](https://www.ionos.com/) and create an account if you don't have one.
2. Search for your desired domain name and check its availability.
3. Add the domain to your cart and complete the purchase process.
4. After purchase, you'll have access to your domain's DNS settings in the IONOS control panel.

## Step 2: Deploy Your Bolt.new App to Netlify

1. In your Bolt.new project, click the "Deploy" button in the top right corner.
2. Choose Netlify as your deployment provider.
3. Follow the prompts to complete the deployment.
4. Once deployed, Netlify will provide you with a default URL (e.g., `your-app-name.netlify.app`).

## Step 3: Add Your Custom Domain in Netlify

1. Log in to your Netlify account.
2. Go to your site's dashboard.
3. Navigate to "Site settings" > "Domain management" > "Domains".
4. Click "Add custom domain".
5. Enter your IONOS domain name (e.g., `yourdomain.com`) and click "Verify".
6. Choose whether to add the www subdomain as well.

## Step 4: Configure DNS Settings in IONOS

### Option 1: Using Netlify's Name Servers (Recommended)

1. In Netlify, go to your site's "Domain settings".
2. Look for the Netlify DNS name servers (usually 4 entries).
3. Log in to your IONOS account.
4. Go to "Domains & SSL" > select your domain.
5. Find the DNS or Nameserver settings.
6. Replace the IONOS nameservers with Netlify's nameservers.
7. Save your changes.

### Option 2: Using IONOS DNS with CNAME/A Records

If you prefer to keep using IONOS DNS:

1. In Netlify, go to your site's "Domain settings" > "DNS settings".
2. Note the Netlify load balancer IP address or the CNAME target.
3. Log in to your IONOS account.
4. Go to "Domains & SSL" > select your domain > "DNS".
5. Add the following records:
   - For apex domain (`yourdomain.com`): Add an A record pointing to Netlify's load balancer IP.
   - For www subdomain: Add a CNAME record pointing to your Netlify site URL (`your-app-name.netlify.app`).
6. Save your changes.

## Step 5: Enable HTTPS

1. After your DNS changes propagate (which can take up to 24-48 hours), Netlify will automatically provision an SSL certificate for your site.
2. In Netlify, go to "Site settings" > "Domain management" > "HTTPS".
3. Ensure that "Automatic TLS certificates" is enabled.

## Step 6: Verify Your Setup

1. Wait for DNS propagation (24-48 hours).
2. Visit your custom domain to ensure it's properly connected to your Bolt.new app.
3. Check that HTTPS is working correctly (look for the lock icon in your browser).

## Troubleshooting

- **DNS Propagation**: Changes to DNS settings can take up to 48 hours to propagate globally. Be patient if your domain doesn't work immediately.
- **HTTPS Issues**: If HTTPS isn't working, check Netlify's certificate provisioning status in the "HTTPS" section.
- **Domain Connection Problems**: Verify your DNS settings in IONOS match Netlify's requirements.

## Additional Resources

- [Netlify Custom Domains Documentation](https://docs.netlify.com/domains-https/custom-domains/)
- [IONOS DNS Management Guide](https://www.ionos.com/help/domains/dns-settings/)
- [Entri Domain Registration](https://entri.com/) - An alternative service that can simplify the domain registration process