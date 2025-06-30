# Managing Your Custom Domain for Your Bolt.new Application

This guide provides information on managing your custom domain after it's been set up for your Bolt.new application.

## Domain Management Basics

### Renewing Your Domain

Domains typically need to be renewed annually. To ensure your domain doesn't expire:

1. Set up auto-renewal with your domain registrar (IONOS).
2. Keep your payment information up to date.
3. Watch for renewal notices from your registrar.

### Updating DNS Records

If you need to modify your DNS configuration:

1. Log in to your domain registrar's control panel (IONOS).
2. Navigate to the DNS management section.
3. Make the necessary changes to your records.
4. Allow time for DNS propagation (up to 48 hours).

### Managing Subdomains

To create subdomains for your application:

1. In your DNS settings, add a new CNAME record for each subdomain.
2. Point the CNAME to your main Netlify URL.
3. In Netlify, add the subdomain in your domain settings.

## SSL Certificate Management

### Automatic SSL Renewal with Netlify

Netlify automatically manages SSL certificates for your custom domain:

1. Certificates are provisioned through Let's Encrypt.
2. Renewal happens automatically before expiration.
3. No manual intervention is typically required.

### Troubleshooting SSL Issues

If you encounter SSL certificate problems:

1. Check your Netlify site's "Domain management" > "HTTPS" section.
2. Verify that your DNS configuration is correct.
3. Ensure your domain's CAA records (if any) allow Let's Encrypt to issue certificates.

## Domain Security Best Practices

### Enable DNSSEC

DNSSEC adds an extra layer of security to your domain:

1. Check if your registrar (IONOS) supports DNSSEC.
2. Enable it through your registrar's control panel.
3. Verify that it's properly configured.

### Lock Your Domain

Prevent unauthorized domain transfers:

1. Enable domain locking in your registrar's control panel.
2. Use strong, unique passwords for your registrar account.
3. Enable two-factor authentication if available.

### Privacy Protection

Protect your personal information:

1. Enable WHOIS privacy protection through your registrar.
2. Review what information is publicly available for your domain.

## Monitoring Your Domain

### Uptime Monitoring

Set up monitoring to ensure your site remains accessible:

1. Use services like UptimeRobot, Pingdom, or StatusCake.
2. Configure alerts for downtime.
3. Regularly check your site's availability.

### DNS Health Checks

Periodically verify your DNS configuration:

1. Use tools like DNSChecker or MXToolbox.
2. Check for misconfigurations or potential issues.
3. Ensure all necessary records are present and correct.

## Transferring Your Domain

If you need to transfer your domain to another registrar:

1. Unlock your domain at the current registrar.
2. Obtain an authorization code (EPP code).
3. Initiate the transfer at the new registrar.
4. Approve the transfer when prompted.
5. Update DNS settings after the transfer is complete.

## Additional Resources

- [IONOS Domain Management Guide](https://www.ionos.com/help/domains/)
- [Netlify Custom Domains Documentation](https://docs.netlify.com/domains-https/custom-domains/)
- [DNS Checker Tool](https://dnschecker.org/)
- [Let's Encrypt Documentation](https://letsencrypt.org/docs/)
- [ICANN Domain Name Registration Guide](https://www.icann.org/resources/pages/registering-domain-name-2017-06-20-en)