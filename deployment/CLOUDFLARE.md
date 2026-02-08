# Deploying behind Cloudflare

1. **Cloudflare Tunnel (recommended)**
   Instead of exposing ports, use `cloudflared`.

   ```bash
   # Install cloudflared
   curl -L --output cloudflared.deb https://github.com/cloudflare/cloudflared/releases/latest/download/cloudflared-linux-amd64.deb
   sudo dpkg -i cloudflared.deb

   # Login
   cloudflared tunnel login

   # Create tunnel
   cloudflared tunnel create minecraft-admin

   # Configure (config.yml)
   url: http://localhost:3000
   tunnel: <Tunnel-UUID>
   credentials-file: /root/.cloudflared/<Tunnel-UUID>.json

   # Run
   cloudflared tunnel run minecraft-admin
   ```

2. **Cloudflare Zero Trust (Access)**
   - Go to Cloudflare Dashboard > Zero Trust
   - Access > Applications > Add an application
   - Select "Self-hosted"
   - Domain: `admin.yourdomain.com`
   - Policy: "Allow Admin Emails" -> Include email `your@email.com`
   - This adds an extra layer of security before even reaching your Next.js login page.

3. **Firewall Rules (UFW)**
   Block all incoming ports except SSH and HTTP/HTTPS (if not using Tunnel).
   
   ```bash
   sudo ufw allow ssh
   # If using Cloudflare Tunnel, you don't need to allow 80/443 for this app
   sudo ufw deny 25575 # Block RCON from outside!
   sudo ufw enable
   ```

4. **Environment Variables**
   Ensure `.env` is populated in production.
   
   ```bash
   RCON_HOST=127.0.0.1
   RCON_PASSWORD=your_strong_rcon_password
   ```
