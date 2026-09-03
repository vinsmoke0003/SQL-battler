# syntax=docker/dockerfile:1
# Railway builds this automatically when a Dockerfile is present.

FROM node:24-alpine AS deps
WORKDIR /app
COPY package.json package-lock.json ./
RUN npm ci

FROM node:24-alpine AS build
WORKDIR /app
COPY --from=deps /app/node_modules ./node_modules
COPY . .
ENV NEXT_TELEMETRY_DISABLED=1
RUN npm run build

FROM node:24-alpine AS runner
WORKDIR /app
ENV NODE_ENV=production
ENV NEXT_TELEMETRY_DISABLED=1
ENV HOST=0.0.0.0
COPY --from=deps /app/node_modules ./node_modules
COPY --from=build /app/.next ./.next
COPY package.json package-lock.json server.ts tsconfig.json next.config.mjs ./
COPY lib ./lib
# Drop dev-only packages; tsx is a runtime dependency so the server keeps working.
RUN npm prune --omit=dev
EXPOSE 3000
CMD ["npm", "start"]
