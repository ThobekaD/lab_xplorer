# Deploying Your Bolt.new App to Netlify with a Custom Domain

This guide walks you through the process of deploying your Bolt.new application to Netlify and connecting it to a custom domain.

## Step 1: Prepare Your Bolt.new App for Deployment

1. Ensure your application is working correctly in the Bolt.new development environment.
2. Add a `netlify.toml` file to your project root (already included in this project) to configure the build settings.
3. Make sure your application uses client-side routing compatible with Netlify's redirects.

## Step 2: Deploy to Netlify from Bolt.new

1. In your Bolt.new project, click the "Deploy" button in the top right corner.
2. Select Netlify as your deployment provider.
3. Follow the prompts to connect to your Netlify account.
4. Configure your build settings if needed (the defaults should work with the included `netlify.toml`).
5. Click "Deploy" to start the deployment process.
6. Wait for the build and deployment to complete.

## Step 3: Set Up Your Custom Domain in Netlify

1. Once your site is deployed, go to your Netlify dashboard.
2. Navigate to your site's settings.
3. Go to "Domain management" > "Domains".
4. Click "Add custom domain".
5. Enter your domain name (e.g., `yourdomain.com`).
6. Follow the verification process.

## Step 4: Configure DNS Settings

### If You Purchased a Domain Through Netlify:

1. Netlify will automatically configure the DNS settings for you.
2. Skip to Step 5.

### If You're Using an IONOS Domain:

#### Option A: Using Netlify DNS (Recommended)

1. In Netlify, go to your site's "Domain settings".
2. Look for the Netlify DNS name servers (usually 4 entries).
3. Log in to your IONOS account.
4. Go to "Domains & SSL" > select your domain.
5. Find the DNS or Nameserver settings.
6. Replace the IONOS nameservers with Netlify's nameservers.
7. Save your changes.

#### Option B: Using IONOS DNS

1. In Netlify, go to your site's "Domain settings" > "DNS settings".
2. Note the Netlify load balancer IP address or the CNAME target.
3. Log in to your IONOS account.
4. Go to "Domains & SSL" > select your domain > "DNS".
5. Add the following records:
   - For apex domain (`yourdomain.com`): Add an A record pointing to Netlify's load balancer IP.
   - For www subdomain: Add a CNAME record pointing to your Netlify site URL (`your-app-name.netlify.app`).
6. Save your changes.

## Step 5: Enable HTTPS

1. After your DNS changes propagate, Netlify will automatically provision an SSL certificate for your site.
2. In Netlify, go to "Site settings" > "Domain management" > "HTTPS".
3. Ensure that "Automatic TLS certificates" is enabled.
4. Wait for the certificate to be provisioned (this can take a few minutes to a few hours).

## Step 6: Test Your Custom Domain

1. Visit your custom domain in a web browser.
2. Verify that your Bolt.new app loads correctly.
3. Check that HTTPS is working properly (look for the lock icon in your browser).
4. Test different routes and features of your application.

## Step 7: Ongoing Maintenance

1. Any future deployments from Bolt.new to Netlify will automatically update your site.
2. Your custom domain configuration will remain in place for all future deployments.
3. Monitor your site's performance and uptime through Netlify's analytics.

## Troubleshooting

- **DNS Propagation**: Changes to DNS settings can take up to 48 hours to propagate globally. Be patient if your domain doesn't work immediately.
- **HTTPS Issues**: If HTTPS isn't working, check Netlify's certificate provisioning status in the "HTTPS" section.
- **Deployment Failures**: Check the deployment logs in Netlify for any build errors.
- **Routing Problems**: Ensure your application's routing is compatible with Netlify's redirect rules.

## Additional Resources

- [Netlify Deployment Documentation](https://docs.netlify.com/site-deploys/overview/)
- [Netlify Custom Domains Guide](https://docs.netlify.com/domains-https/custom-domains/)
- [IONOS DNS Management](https://www.ionos.com/help/domains/dns-settings/)
- [Bolt.new Deployment Guide](https://bolt.new/docs/deployment)