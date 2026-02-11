# --- STAGE 1: Build ---
FROM node:20-alpine AS builder
RUN apk add --no-cache libc6-compat
WORKDIR /app

# Install dependencies based on the preferred package manager
COPY package.json package-lock.json* pnpm-lock.yaml* ./
RUN \
  if [ -f pnpm-lock.yaml ]; then corepack enable pnpm && pnpm i --frozen-lockfile; \
  elif [ -f package-lock.json ]; then npm ci; \
  else echo "Lockfile not found." && npm install; \
  fi

COPY . .

# Set environment variables for build
ENV NEXT_TELEMETRY_DISABLED=1
ENV NODE_ENV=production

RUN npm run build

# --- STAGE 2: Run ---
FROM node:20-alpine AS runner
WORKDIR /app

ENV NODE_ENV=production
ENV NEXT_TELEMETRY_DISABLED=1

# Install runtime dependencies for system integration
# Note: 'sudo' and 'systemctl' won't work inside a standard container to control the HOST systemd.
# If you need to control the host systemd from a container, you must mount the host's dbus/systemd sockets
# or use a different approach. This Dockerfile is for the Web App itself.
RUN apk add --no-cache sudo procps

# Create serveradmin user with UID 1000 to match host
# Alpine may already have a group with GID 1000, so we create the user first
RUN adduser -D -u 1000 serveradmin || true && \
  addgroup serveradmin wheel

# Configure sudoers to allow serveradmin to run systemctl without password
RUN echo "serveradmin ALL=(ALL) NOPASSWD: /usr/bin/systemctl" > /etc/sudoers.d/serveradmin && \
  chmod 0440 /etc/sudoers.d/serveradmin


# User will be set by docker-compose to match host user (1000:1000)

COPY --from=builder /app/public ./public

# Automatically leverage output traces to reduce image size
# https://nextjs.org/docs/advanced-features/output-file-tracing
COPY --from=builder /app/.next/standalone ./
COPY --from=builder /app/.next/static ./.next/static

# Note: user will be set by docker-compose to match host user
# USER nextjs

EXPOSE 3001

ENV PORT=3001
ENV HOSTNAME="0.0.0.0"

CMD ["node", "server.js"]
