FROM node:20-alpine

ENV TZ=Asia/Dhaka
ENV NEXT_TELEMETRY_DISABLED=1

RUN apk add --no-cache libc6-compat tzdata && \
    ln -snf /usr/share/zoneinfo/$TZ /etc/localtime && \
    echo $TZ > /etc/timezone

WORKDIR /app

# Copy package files and install dependencies so the container can start
COPY package.json package-lock.json ./
RUN npm ci

EXPOSE 3000

CMD ["node", "node_modules/.bin/next", "dev", "--hostname", "0.0.0.0"]
