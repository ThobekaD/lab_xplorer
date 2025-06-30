# Using Entri to Register an IONOS Domain for Your Bolt.new App

[Entri](https://entri.com/) is a service that simplifies the process of registering domains and connecting them to your web applications. This guide will walk you through using Entri to register an IONOS domain and connect it to your Bolt.new application.

## Step 1: Create an Entri Account

1. Go to [Entri.com](https://entri.com/) and sign up for an account.
2. Complete the registration process with your email and password.

## Step 2: Connect Your Bolt.new App to Entri

1. In your Bolt.new project, deploy your application to Netlify:
   - Click the "Deploy" button in the top right corner
   - Select Netlify as your deployment provider
   - Follow the prompts to complete the deployment

2. Once deployed, you'll get a Netlify URL (e.g., `your-app-name.netlify.app`).

3. In Entri:
   - Click "Add Site"
   - Enter your Netlify URL
   - Follow the prompts to connect your site

## Step 3: Register an IONOS Domain Through Entri

1. In your Entri dashboard, select your connected site.
2. Click "Add Domain".
3. Search for your desired domain name.
4. Select IONOS as your domain provider (Entri partners with multiple registrars including IONOS).
5. Complete the domain purchase process.

## Step 4: Entri Automatically Configures DNS

One of the advantages of using Entri is that it automatically configures the DNS settings for you:

1. Entri will set up the necessary DNS records to point your new IONOS domain to your Netlify site.
2. This eliminates the need to manually configure DNS settings in IONOS.
3. Entri will also handle the SSL certificate provisioning through Netlify.

## Step 5: Verify Your Domain Connection

1. After completing the domain registration and connection process, Entri will provide status updates.
2. DNS propagation typically takes 24-48 hours, but often completes much faster.
3. Once propagation is complete, your Bolt.new app will be accessible via your new domain.

## Step 6: Manage Your Domain

1. You can manage your domain settings through the Entri dashboard.
2. For advanced DNS configuration, you can still access your domain settings directly through IONOS.
3. Entri provides ongoing monitoring of your domain connection.

## Benefits of Using Entri

- **Simplified Process**: Entri handles the technical aspects of domain registration and DNS configuration.
- **Time Saving**: No need to manually configure DNS records.
- **Unified Management**: Manage your domains and site connections in one place.
- **Automatic SSL**: Entri ensures your site has proper SSL certificates.
- **Domain Monitoring**: Entri monitors your domain connection for any issues.

## Troubleshooting

If you encounter any issues with your domain connection:

1. Check the status in your Entri dashboard.
2. Verify that your Netlify site is properly deployed and accessible via the Netlify URL.
3. Contact Entri support for assistance with domain-specific issues.
4. For Bolt.new or Netlify-specific issues, refer to their respective documentation.

## Additional Resources

- [Entri Documentation](https://entri.com/docs)
- [Netlify Custom Domains Guide](https://docs.netlify.com/domains-https/custom-domains/)
- [IONOS Domain Management](https://www.ionos.com/help/domains/)